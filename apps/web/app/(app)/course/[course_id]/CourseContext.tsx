'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface CourseContextType {
  courseData: any;
  friendsProgress: any[];
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({
  children,
  courseData,
  friendsProgress,
}: {
  children: ReactNode;
  courseData: any;
  friendsProgress: any[];
}) {
  return (
    <CourseContext.Provider value={{ courseData, friendsProgress }}>
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
