'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import styles from './LessonEngine.module.css';
import { MCQCard } from './MCQCard';
import { Button } from '@sololearning/ui';
import { useDispatch } from 'react-redux';
import { updateUserStats } from '../../store/slices/authSlice';

interface LessonEngineProps {
  topicId: string;
}

export function LessonEngine({ topicId }: LessonEngineProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [lessons, setLessons] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch(`/api/courses/topics/${topicId}/lessons`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setLessons(data);
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [topicId]);

  const handleNext = async () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all lessons in this topic
      setIsFinished(true);
      await completeTopic();
    }
  };

  const completeTopic = async () => {
    try {
      const res = await fetch(`/api/courses/topics/${topicId}/complete`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setXpGained(data.xpGained);
        // Sync the newly gained XP, Rank, and Streak to the global Redux state instantly
        dispatch(
          updateUserStats({
            xp: data.totalXp,
            rank: data.newRank,
            streak: data.newStreak,
          }),
        );
      }
    } catch (err) {
      console.error('Error completing topic:', err);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Loading lesson...</div>;
  }

  if (!lessons || lessons.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>No lessons found for this topic.</div>
    );
  }

  const currentLesson = lessons[currentIndex];
  // Assuming MVP lesson content is always an MCQ for now.
  // In reality, it would be an array of steps per lesson.
  // We'll treat the lesson as one step if it's MCQ, or map through content array.
  // Based on seed data: `content` is a JSON array: [{ type: 'info', text: '...' }, { type: 'mcq', question: '...', options: [], answer: 0 }]

  // Find the first MCQ in the content array for simplicity in MVP
  const mcqContent = currentLesson.content?.find((c: any) => c.type === 'mcq');

  const progressPercent = isFinished ? 100 : (currentIndex / lessons.length) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.closeButton} onClick={() => router.push('/map/python')}>
          <X size={28} />
        </button>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className={styles.contentArea}>
        {isFinished ? (
          <div className={styles.successContainer}>
            <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Lesson Complete!</h1>
            <p style={{ color: 'var(--color-text-light)' }}>Great job mastering this topic.</p>
            <div className={styles.xpBadge}>+{xpGained} XP</div>
          </div>
        ) : mcqContent ? (
          <MCQCard
            key={currentLesson.id} // force re-mount on new lesson
            question={mcqContent.question}
            options={mcqContent.options}
            correctAnswerIndex={mcqContent.answer}
            onCorrect={handleNext}
          />
        ) : (
          <div>
            <h2>{currentLesson.title}</h2>
            <p>Read the material, then click continue.</p>
            <Button onClick={handleNext} style={{ marginTop: '20px' }}>
              Continue
            </Button>
          </div>
        )}
      </div>

      {isFinished && (
        <div className={styles.footer}>
          <Button
            size="lg"
            style={{ width: '100%', maxWidth: '400px' }}
            onClick={() => router.push('/map/python')}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
