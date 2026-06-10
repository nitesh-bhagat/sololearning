'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@sololearning/ui';
import { CourseSidebar } from './components/CourseSidebar';
import { CourseProvider } from './CourseContext';

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const courseId = params.course_id as string;
  const [courseData, setCourseData] = useState<any>(null);
  const [friendsProgress, setFriendsProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
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
    }

    loadData();
  }, [courseId]);

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
    <CourseProvider courseData={courseData} friendsProgress={friendsProgress}>
      <div className="flex w-full min-h-full max-h-dvh bg-background overflow-y-scroll">
        <CourseSidebar />

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
