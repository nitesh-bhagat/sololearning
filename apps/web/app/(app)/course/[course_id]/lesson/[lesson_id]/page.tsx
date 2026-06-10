'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCourse } from '../../CourseContext';
import { RenderLesson } from '../../../../../../components/RenderLesson';
import { useDispatch } from 'react-redux';
import { updateUserStats } from '../../../../../../store/slices/authSlice';

export default function LessonPage() {
  const { courseData, refreshCourseData } = useCourse();
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const courseId = params.course_id as string;
  const lessonId = params.lesson_id as string;

  const handleComplete = async () => {
    try {
      const res = await fetch(`/api/courses/topics/${lessonId}/complete`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        dispatch(
          updateUserStats({
            xp: data.totalXp,
            rank: data.newRank,
            streak: data.newStreak,
          }),
        );

        // Fetch the updated roadmap from the server immediately so the pin moves automatically
        if (refreshCourseData) {
          await refreshCourseData();
        }
      }
    } catch (err) {
      console.error('Error completing topic:', err);
    }
  };

  let activeTopic: any = null;
  let currentChapterIndex = -1;
  let currentTopicIndex = -1;

  if (courseData && courseData.chapters) {
    courseData.chapters.forEach((c: any, cIdx: number) => {
      const tIdx = c.topics.findIndex((tp: any) => tp.id === lessonId);
      if (tIdx !== -1) {
        currentChapterIndex = cIdx;
        currentTopicIndex = tIdx;
        activeTopic = c.topics[tIdx];
      }
    });
  }

  let nextLessonId: string | null = null;
  if (currentChapterIndex !== -1 && currentTopicIndex !== -1) {
    const currentChapter = courseData.chapters[currentChapterIndex];
    if (currentTopicIndex < currentChapter.topics.length - 1) {
      nextLessonId = currentChapter.topics[currentTopicIndex + 1].id;
    } else if (currentChapterIndex < courseData.chapters.length - 1) {
      nextLessonId = courseData.chapters[currentChapterIndex + 1].topics[0]?.id;
    }
  }

  if (!activeTopic) return <div className="p-8">Lesson not found.</div>;

  return (
    <RenderLesson
      topic={activeTopic}
      onExit={() => router.push(`/course/${courseId}`)}
      onNextLesson={() => {
        if (nextLessonId) {
          router.push(`/course/${courseId}/lesson/${nextLessonId}`);
        }
      }}
      hasNextLesson={!!nextLessonId}
      onComplete={handleComplete}
    />
  );
}
