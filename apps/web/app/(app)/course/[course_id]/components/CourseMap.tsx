import React, { useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store';
import { RoadmapNode, NodeState } from '../../../../../components/roadmap/RoadmapNode';

interface CourseMapProps {
  courseData: any;
  friendsProgress: any[];
  isCompact?: boolean;
}

export function CourseMap({ courseData, friendsProgress, isCompact = false }: CourseMapProps) {
  const router = useRouter();
  const params = useParams();
  const courseId = params.course_id as string;
  const currentLessonId = params.lesson_id as string | undefined;
  const { user } = useSelector((state: RootState) => state.auth);

  // Generate SVG path for the ENTIRE course
  const pathParts: string[] = [];
  const mapItems: any[] = [];
  let currentY = 75; // paddingTop (40) + half node height (35)
  let globalTopicIndex = 0;
  let prevX = 100;
  let prevY = currentY;

  // Determine the SINGLE active topic for the current user
  let activeTopicId: string | null = null;
  let lastCompletedId: string | null = null;

  // 1st pass: find active topic
  courseData.chapters.forEach((chapter: any) => {
    chapter.topics.forEach((topic: any) => {
      const hasProgress = topic.progress && topic.progress.length > 0;
      if (hasProgress) {
        if (topic.progress[0].isCompleted) {
          lastCompletedId = topic.id;
        } else if (topic.progress[0].isUnlocked && !activeTopicId) {
          activeTopicId = topic.id;
        }
      }
    });
  });

  // If no unlocked topic was found, maybe they are at the very beginning
  if (!activeTopicId && courseData.chapters[0]?.topics[0] && !lastCompletedId) {
    activeTopicId = courseData.chapters[0].topics[0].id;
  }
  // If they completed everything, active topic is the last completed one
  if (!activeTopicId && lastCompletedId) {
    activeTopicId = lastCompletedId;
  }

  // Scroll to active topic whenever it changes
  useEffect(() => {
    if (activeTopicId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`node-${activeTopicId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300); // small delay to ensure DOM is ready and layout is settled
      return () => clearTimeout(timer);
    }
  }, [activeTopicId]);

  courseData.chapters.forEach((chapter: any, chIndex: number) => {
    const isLocked = chapter.topics.every(
      (t: any) =>
        !t.progress ||
        t.progress.length === 0 ||
        (!t.progress[0].isUnlocked && !t.progress[0].isCompleted),
    );
    const isEffectivelyLocked = chIndex === 0 ? false : isLocked;

    // Insert chapter header item
    mapItems.push({
      type: 'chapter_header',
      id: chapter.id,
      title: chapter.title,
      top: currentY,
      topicsCount: chapter.topics.length,
    });

    currentY += 180; // Extra space to prevent the first node from overlaying the chapter header

    chapter.topics.forEach((topic: any) => {
      const offset = Math.sin(globalTopicIndex * 0.8) * 80;
      const x = 100 + offset;
      const y = currentY;

      if (globalTopicIndex === 0) {
        pathParts.push(`M ${x} ${y}`);
      } else {
        pathParts.push(`C ${prevX} ${prevY + 65}, ${x} ${y - 65}, ${x} ${y}`);
      }

      prevX = x;
      prevY = y;

      mapItems.push({
        type: 'topic_node',
        topicData: topic,
        top: currentY,
        xOffset: offset,
        globalIndex: globalTopicIndex,
        isEffectivelyLocked,
      });

      currentY += 130;
      globalTopicIndex++;
    });

    currentY += 80; // Extra space before next chapter
  });

  const pathString = pathParts.join(' ');
  const svgHeight = Math.max(currentY, 400);

  return (
    <div className="relative w-[90%] flex flex-col items-center" style={{ height: svgHeight }}>
      {/* SVG Path */}
      <svg
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
        style={{ height: svgHeight }}
        viewBox={`0 0 200 ${svgHeight}`}
      >
        <path
          d={pathString}
          fill="none"
          stroke="var(--color-surface)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d={pathString}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="12"
          strokeLinecap="round"
        />
      </svg>

      {/* Map Items: Chapter Headers & Topic Nodes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {mapItems.map((item, idx) => {
          if (item.type === 'chapter_header') {
            return (
              <div
                key={`header-${item.id}`}
                id={`chapter-header-${item.id}`}
                data-chapter-id={item.id}
                className="chapter-header-spy absolute w-full flex flex-col items-start pointer-events-auto z-10" // z-10 to stay above path
                style={{ top: `${item.top}px` }}
              >
                <div className="bg-background px-8 py-6 rounded-[2rem] shadow-xl flex flex-col items-center max-w-[90%] mx-auto">
                  <h2
                    className={`${isCompact ? 'text-xl' : 'text-3xl'} font-black text-text mb-2 tracking-tight text-center`}
                  >
                    {item.title}
                  </h2>
                  <div className="inline-block px-4 py-1.5 bg-surface border border-border/50 rounded-full text-text-light font-bold text-xs tracking-[1px] uppercase shadow-sm">
                    {item.topicsCount} Lessons
                  </div>
                </div>
              </div>
            );
          }

          if (item.type === 'topic_node') {
            const topic = item.topicData;
            const isFirstNode = item.globalIndex === 0;
            const hasProgress = topic.progress && topic.progress.length > 0;
            let state: NodeState = 'LOCKED';

            if (hasProgress) {
              const p = topic.progress[0];
              if (p.isCompleted) state = 'COMPLETED';
              else if (p.isUnlocked) state = 'UNLOCKED';
            } else if (isFirstNode) {
              state = 'UNLOCKED';
            }

            // If the whole chapter is marked effectively locked (except if the topic itself has explicit progress showing unlocked)
            if (item.isEffectivelyLocked && state === 'LOCKED') {
              state = 'LOCKED';
            }

            // Determine if THIS topic is the active topic for the current user
            const isUserActive = topic.id === activeTopicId;

            const matchingFriends = [
              ...friendsProgress.filter(
                (f) => f.activeTopicId === topic.id || (isFirstNode && !f.activeTopicId),
              ),
            ];

            // Add the current user's pin
            if (user && isUserActive) {
              // Ensure we don't duplicate if they somehow are in friendsProgress
              if (!matchingFriends.find((f) => f.id === user.id)) {
                matchingFriends.push({
                  id: user.id,
                  username: user.username + ' (You)',
                  avatar: user.avatar,
                  activeTopicId: topic.id,
                });
              }
            }

            // Reconstruct positioning relative to the 200px width SVG but placed in the 300px container
            const topPos = item.top - 35; // adjusting because RoadmapNode assumes center rendering? RoadmapNode wrapper has minHeight 80. Let's just place it.

            return (
              <div
                id={`node-${topic.id}`}
                key={`topic-${topic.id}`}
                className="absolute pointer-events-auto z-10"
                style={{
                  top: `${topPos}px`,
                  left: `calc(50% - 35px)`, // 35px is half of 70px node width. Offset is handled by RoadmapNode itself.
                }}
              >
                <RoadmapNode
                  id={topic.id}
                  title={topic.title}
                  state={state}
                  index={item.globalIndex}
                  friends={matchingFriends}
                  isCurrentView={topic.id === currentLessonId}
                  onClick={() => {
                    if (state !== 'LOCKED') {
                      router.push(`/course/${courseId}/lesson/${topic.id}`);
                    }
                  }}
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
