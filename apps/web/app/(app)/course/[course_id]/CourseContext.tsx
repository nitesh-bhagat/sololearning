'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface CourseContextType {
  courseData: any;
  friendsProgress: any[];
  refreshCourseData: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({
  children,
  courseData,
  friendsProgress,
  refreshCourseData,
}: {
  children: ReactNode;
  courseData: any;
  friendsProgress: any[];
  refreshCourseData: () => Promise<void>;
}) {
  return (
    <CourseContext.Provider value={{ courseData, friendsProgress, refreshCourseData }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}
