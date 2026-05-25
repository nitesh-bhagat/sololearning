'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@sololearning/ui';
import { MY_COURSES_MOCKDATA } from './mockData';
import { CourseSidebar } from './components/CourseSidebar';
import { CourseProvider } from './CourseContext';

const MOCK_FRIENDS_PROGRESS = [
  { id: 'f1', username: 'Ansh', avatar: '🦊', activeTopicId: 't-1-3' },
  { id: 'f2', username: 'Nitesh', avatar: '🤖', activeTopicId: 't-1-3' },
  { id: 'f3', username: 'Prakah', avatar: '🐱', activeTopicId: 't-1-2' },
  { id: 'f4', username: 'Tushar', avatar: '🦄', activeTopicId: 't-2-1' },
];

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const courseId = params.course_id as string;
  const [courseData, setCourseData] = useState<any>(null);
  const [friendsProgress, setFriendsProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating network delay
    setTimeout(() => {
      const foundCourse = MY_COURSES_MOCKDATA.find((c) => c.id === courseId);
      if (foundCourse) {
        setCourseData(foundCourse);
        setFriendsProgress(MOCK_FRIENDS_PROGRESS);
      } else {
        setCourseData(null);
      }
      setLoading(false);
    }, 500);
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
