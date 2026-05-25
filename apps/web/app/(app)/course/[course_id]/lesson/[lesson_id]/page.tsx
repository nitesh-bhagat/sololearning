'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useCourse } from '../../CourseContext';
import { LessonView } from '../../components/LessonView';

export default function LessonPage() {
  const { courseData } = useCourse();
  const params = useParams();
  const lessonId = params.lesson_id as string;

  return <LessonView courseData={courseData} activeLessonId={lessonId} />;
}
