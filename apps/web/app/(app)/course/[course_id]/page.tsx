'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Clock, Award, Lock } from 'lucide-react';
import { RoadmapNode, NodeState } from '../../../../components/roadmap/RoadmapNode';
import { Skeleton } from '@sololearning/ui';
import { MOCK_COURSE_DATA } from './mockData';

const MOCK_FRIENDS_PROGRESS = [
  { id: 'f1', username: 'Alex', avatar: '🦊', activeTopicId: 't-1-3' },
  { id: 'f2', username: 'Maria', avatar: '🤖', activeTopicId: 't-1-3' },
  { id: 'f3', username: 'David', avatar: '🐱', activeTopicId: 't-1-2' },
  { id: 'f4', username: 'Sarah', avatar: '🦄', activeTopicId: 't-2-1' }, // Sarah is in chapter 2!
];

export default function CoursePage() {
  const params = useParams();
  const courseId = params.course_id as string;

  const [courseData, setCourseData] = useState<any>(null);
  const [friendsProgress, setFriendsProgress] = useState<any[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulating network delay
    setTimeout(() => {
      setCourseData(MOCK_COURSE_DATA);
      setFriendsProgress(MOCK_FRIENDS_PROGRESS);
      setActiveChapterId(MOCK_COURSE_DATA.chapters[0].id);
      setLoading(false);
    }, 500);
  }, [courseId]);

  useEffect(() => {
    if (!courseData || !scrollContainerRef.current || activeLessonId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // We want to find the latest intersecting entry
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const chapterId = entry.target.getAttribute('data-chapter-id');
            if (chapterId) {
              setActiveChapterId(chapterId);
            }
          }
        });
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '-10% 0px -70% 0px', // Trigger when header is near the top
        threshold: 0,
      },
    );

    const elements = document.querySelectorAll('.chapter-header-spy');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [courseData, activeLessonId]);

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

  // Generate SVG path for the ENTIRE course
  const pathParts: string[] = [];
  const mapItems: any[] = [];
  let currentY = 75; // paddingTop (40) + half node height (35)
  let globalTopicIndex = 0;
  let prevX = 100;
  let prevY = currentY;

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
      top: currentY - 20,
      topicsCount: chapter.topics.length,
    });

    currentY += 120; // Space for chapter header

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
    <div className="flex w-full min-h-full max-h-dvh bg-background overflow-y-scroll">
      {/* Sidebar: 25% Width */}
      <div className="w-[30%] min-w-[300px] max-h-dvh bg-surface border-r border-border p-6 flex flex-col gap-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-black text-text mb-2 leading-tight">{courseData.title}</h1>
          <p className="text-text-light text-sm leading-relaxed">{courseData.description}</p>
        </div>

        {/* Friends Studying This Course */}
        {friendsProgress.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-[0.75rem] uppercase tracking-[2px] font-black text-text-light/80 pl-2">
              Friends studying this course
            </h3>
            <div className="flex flex-wrap gap-2 pl-4">
              {friendsProgress.map((friend) => (
                <div
                  key={friend.id}
                  className="w-8 h-8 -ml-4 rounded-full border-2 border-primary bg-surface flex items-center justify-center text-xs font-bold text-text shadow-sm"
                  title={`${friend.username} is learning too!`}
                >
                  {friend.avatar || friend.username.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 flex-1 pb-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <h3 className="text-[0.75rem] uppercase tracking-[2px] font-black text-text-light/80 mb-2 pl-2">
            Course Chapters
          </h3>
          {courseData.chapters.map((chapter: any, index: number) => {
            const isActive = chapter.id === activeChapterId;
            // A chapter is locked if all its topics are locked/unattempted
            const isLocked = chapter.topics.every(
              (t: any) =>
                !t.progress ||
                t.progress.length === 0 ||
                (!t.progress[0].isUnlocked && !t.progress[0].isCompleted),
            );

            // For MVP, explicitly unlock the very first chapter always.
            const isEffectivelyLocked = index === 0 ? false : isLocked;

            // Find friends active anywhere within this chapter
            const chapterTopicIds = chapter.topics.map((t: any) => t.id);
            const friendsOnChapter = friendsProgress.filter((f) =>
              chapterTopicIds.includes(f.activeTopicId),
            );

            return (
              <button
                key={chapter.id}
                onClick={() => {
                  if (!isEffectivelyLocked) {
                    setActiveChapterId(chapter.id);
                    setActiveLessonId(null);
                    // Scroll logic
                    const el = document.getElementById(`chapter-header-${chapter.id}`);
                    if (el && scrollContainerRef.current) {
                      // Note: block: 'start' scrolls it to the top.
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
                className={`group flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300 ${
                  isActive
                    ? 'bg-primary border-primary shadow-[0_4px_20px_rgba(16,185,129,0.25)] -translate-y-1'
                    : isEffectivelyLocked
                      ? 'bg-surface/50 border-border/50 opacity-60 cursor-not-allowed'
                      : 'bg-background border-border text-text hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base transition-colors duration-300 ${isActive ? 'bg-black/20 text-white' : isEffectivelyLocked ? 'bg-surface border-border text-text-light/50' : 'bg-surface text-text-light border border-border group-hover:text-text'}`}
                  >
                    {isEffectivelyLocked ? <Lock size={16} /> : index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`font-bold text-[0.95rem] ${isActive ? 'text-zinc-950' : isEffectivelyLocked ? 'text-text-light/50' : 'text-text-light group-hover:text-text'}`}
                    >
                      {chapter.title}
                    </span>
                    {friendsOnChapter.length > 0 && !isEffectivelyLocked && (
                      <div className="flex -space-x-1 mt-1">
                        {friendsOnChapter.map((f) => (
                          <div
                            key={f.id}
                            className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center text-[8px] font-bold z-10"
                            title={f.username}
                          >
                            {f.avatar}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {isActive && <ChevronRight size={20} className="text-zinc-950 opacity-50" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Area: 75% Width */}
      <div
        ref={scrollContainerRef}
        className="flex-1 relative overflow-y-auto flex flex-col items-center pt-16 pb-32 scroll-smooth"
      >
        {activeLessonId ? (
          // LESSON VIEW
          <div className="w-full max-w-3xl px-8">
            <button
              onClick={() => setActiveLessonId(null)}
              className="flex items-center gap-2 text-text-light hover:text-text font-bold mb-8 transition-colors"
            >
              <ArrowLeft size={20} /> Back to Map
            </button>

            {(() => {
              // Find topic across all chapters
              let activeTopic: any = null;
              courseData.chapters.forEach((c: any) => {
                const t = c.topics.find((tp: any) => tp.id === activeLessonId);
                if (t) activeTopic = t;
              });

              if (!activeTopic) return null;

              return (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h1 className="text-5xl font-black text-text mb-6 tracking-tight leading-tight">
                    {activeTopic.title}
                  </h1>

                  <div className="flex gap-4 mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl font-bold text-sm text-text-light">
                      <Clock size={16} className="text-primary" /> 5-10 mins
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl font-bold text-sm text-text-light">
                      <Award size={16} className="text-amber-400" /> +50 XP
                    </div>
                  </div>

                  <div className="bg-surface border border-border rounded-2xl p-8 mb-8 text-text-light leading-relaxed text-lg shadow-sm">
                    <p>
                      Welcome to the <strong>{activeTopic.title}</strong> lesson! In this module,
                      you will learn the fundamental concepts and practical applications of this
                      topic. Mastering this will unlock new capabilities in your programming
                      journey.
                    </p>
                    <p className="mt-4">
                      Pay close attention to the interactive exercises and don&apos;t hesitate to
                      experiment with the code snippets provided.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveLessonId(null);
                    }}
                    className="w-full py-5 rounded-2xl bg-primary text-background font-black text-lg tracking-wide hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                  >
                    START LESSON
                  </button>
                </div>
              );
            })()}
          </div>
        ) : (
          // MAP VIEW
          <>
            <div
              className="relative w-[300px] flex flex-col items-center"
              style={{ height: svgHeight }}
            >
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
                        className="chapter-header-spy absolute w-full flex flex-col items-center pointer-events-auto pb-4 pt-10" // added pt-10 to offset scroll snapping
                        style={{ top: `${item.top}px` }}
                      >
                        <h2 className="text-3xl font-black text-text mb-2 tracking-tight text-center drop-shadow-md">
                          {item.title}
                        </h2>
                        <div className="inline-block px-4 py-1.5 bg-surface border border-border/50 rounded-full text-text-light font-bold text-xs tracking-[1px] uppercase shadow-sm backdrop-blur-md">
                          {item.topicsCount} Lessons
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

                    const matchingFriends = friendsProgress.filter(
                      (f) => f.activeTopicId === topic.id,
                    );

                    // Reconstruct positioning relative to the 200px width SVG but placed in the 300px container
                    const topPos = item.top - 35; // adjusting because RoadmapNode assumes center rendering? RoadmapNode wrapper has minHeight 80. Let's just place it.

                    return (
                      <div
                        key={`topic-${topic.id}`}
                        className="absolute pointer-events-auto"
                        style={{
                          top: `${topPos}px`,
                          left: `calc(50% - 35px + ${item.xOffset}px)`, // 35px is half of 70px node width
                        }}
                      >
                        <RoadmapNode
                          id={topic.id}
                          title={topic.title}
                          state={state}
                          index={item.globalIndex}
                          friends={matchingFriends}
                          onClick={() => {
                            if (state !== 'LOCKED') {
                              setActiveLessonId(topic.id);
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
          </>
        )}
      </div>
    </div>
  );
}
