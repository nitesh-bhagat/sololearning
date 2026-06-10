'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@sololearning/ui';
import { CourseSidebar } from './components/CourseSidebar';
import { CourseMap } from './components/CourseMap';
import { CourseProvider } from './CourseContext';

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const courseId = params.course_id as string;
  const [courseData, setCourseData] = useState<any>(null);
  const [friendsProgress, setFriendsProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const isLessonRoute = pathname?.includes('/lesson/');

  const loadData = useCallback(async () => {
    try {
      const [courseRes, friendsRes] = await Promise.all([
        fetch(`/api/courses/${courseId}/roadmap`),
        fetch(`/api/courses/${courseId}/friends`),
      ]);

      if (courseRes.ok) {
        const course = await courseRes.json();
        setCourseData(course);
      } else {
        setCourseData(null);
      }

      if (friendsRes.ok) {
        const friends = await friendsRes.json();
        setFriendsProgress(friends);
      }
    } catch (err) {
      console.error('Failed to load course data', err);
      setCourseData(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex w-full h-[calc(100vh-var(--topbar-height,0px))] p-6 gap-6 bg-background">
        <div className="w-[25%] min-w-[280px]">
          <Skeleton height="100%" borderRadius="16px" />
        </div>
        <div className="flex-1">
          <Skeleton height="100%" borderRadius="16px" />
        </div>
      </div>
    );
  }

  if (!courseData) {
    return <div className="p-8 text-center text-text-light">Course not found.</div>;
  }

  return (
    <CourseProvider
      courseData={courseData}
      friendsProgress={friendsProgress}
      refreshCourseData={loadData}
    >
      <div className="flex w-full min-h-full max-h-dvh bg-background overflow-y-scroll">
        {/* Left Panel */}
        {isLessonRoute ? (
          <div
            className="w-[35%] min-w-[300px] border-r border-border overflow-y-auto bg-surface hidden md:block relative"
            id="course-map-sidebar"
          >
            <div className="sticky top-6 left-6 z-50 ml-6 mt-6">
              <Link href={`/course/${courseId}`}>
                <div className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition-colors w-max cursor-pointer shadow-lg border border-white/10">
                  <ChevronLeft size={16} />
                  <span className="text-sm font-bold tracking-wide">Go back</span>
                </div>
              </Link>
            </div>
            <CourseMap courseData={courseData} friendsProgress={friendsProgress} isCompact={true} />
          </div>
        ) : (
          <CourseSidebar />
        )}

        {/* Main Area: 65% Width */}
        <div
          id="main-scroll-container"
          className="flex-1 relative overflow-y-auto flex flex-col items-center scroll-smooth"
        >
          {children}
        </div>
      </div>
    </CourseProvider>
  );
}
