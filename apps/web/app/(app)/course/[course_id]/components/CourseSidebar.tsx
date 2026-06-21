'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ChevronLeft, Share2, Lock, ChevronRight, MoreVertical, AlertTriangle } from 'lucide-react';
import { useCourse } from '../CourseContext';

export function CourseSidebar() {
  const { courseData, friendsProgress, refreshCourseData } = useCourse();
  const params = useParams();
  const courseId = params.course_id as string;
  const searchParams = useSearchParams();
  const activeChapterId = searchParams.get('chapter') || courseData.chapters[0]?.id;
  const [showMenu, setShowMenu] = React.useState(false);
  const [showResetWarning, setShowResetWarning] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  const handleResetCourse = async () => {
    setIsResetting(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/reset`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setShowResetWarning(false);
        if (refreshCourseData) {
          await refreshCourseData();
        }
        if (window.location.pathname.includes('/lesson/')) {
          window.location.href = `/course/${courseId}`;
        } else {
          window.location.reload();
        }
      }
    } catch (e) {
      console.error('Failed to reset course', e);
    }
    setIsResetting(false);
  };

  // Scroll the active chapter tile into view when it changes
  useEffect(() => {
    if (activeChapterId) {
      const element = document.getElementById(`sidebar-chapter-tile-${activeChapterId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeChapterId]);

  return (
    <div
      id="sidebar-container"
      className="w-[35%] min-w-[300px] max-h-dvh bg-surface border-r border-border p-6 flex flex-col gap-8 overflow-y-auto"
    >
      <div className="flex justify-between w-full">
        <Link href={'/'}>
          <div className="flex cursor-pointer items-center hover:text-text transition-colors duration-200">
            <ChevronLeft />
            <span className="text-text-light text-sm leading-relaxed">Go back to courses</span>
          </div>
        </Link>
        <div className="flex items-center gap-4 relative">
          <Share2 className="cursor-pointer text-text hover:text-primary transition-colors" />
          <MoreVertical
            className="cursor-pointer text-text hover:text-primary transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div className="absolute top-8 right-0 bg-surface border border-border rounded-xl shadow-xl p-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-200">
              <button
                className="w-full text-left px-4 py-2 text-red-500 font-bold hover:bg-red-500/10 rounded-lg transition-colors"
                onClick={() => {
                  setShowMenu(false);
                  setShowResetWarning(true);
                }}
              >
                Reset Course
              </button>
            </div>
          )}
        </div>
      </div>
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

      <h3 className="text-[0.75rem] uppercase tracking-[2px] font-black text-text-light/80 -mb-4">
        Course Chapters
      </h3>
      <div className="flex flex-col gap-3 flex-1 pb-10 pt-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

          if (isEffectivelyLocked) {
            return (
              <div
                key={chapter.id}
                id={`sidebar-chapter-tile-${chapter.id}`}
                className={`group flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300 ${isActive ? 'bg-primary/20 border-primary shadow-sm' : 'bg-surface/50 border-border/50 opacity-60'} cursor-not-allowed`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base transition-colors duration-300 bg-surface border-border text-text-light/50">
                    <Lock size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[0.95rem] text-text-light/50">
                      {chapter.title}
                    </span>
                    {friendsOnChapter.length > 0 && (
                      <div className="flex -space-x-1 mt-1">
                        {friendsOnChapter.map((f) => (
                          <div
                            key={f.id}
                            className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center text-[8px] font-bold z-10 opacity-100"
                            title={f.username}
                          >
                            {f.avatar}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={chapter.id}
              id={`sidebar-chapter-tile-${chapter.id}`}
              href={`/course/${courseId}?chapter=${chapter.id}#chapter-header-${chapter.id}`}
              className={`group flex items-center justify-between p-4 rounded-2xl border border-b-4 border-emerald-800 text-left transition-all duration-300 ${
                isActive
                  ? 'bg-primary  border-emerald-800 shadow-[0_4px_20px_rgba(16,185,129,0.25)] -translate-y-1'
                  : 'bg-background border-border text-text hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base transition-colors duration-300 ${isActive ? 'bg-black/20 text-white' : 'bg-surface text-text-light border border-border group-hover:text-text'}`}
                >
                  {index + 1}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-bold text-[0.95rem] ${isActive ? 'text-zinc-950' : 'text-text-light group-hover:text-text'}`}
                  >
                    {chapter.title}
                  </span>
                  {friendsOnChapter.length > 0 && (
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
            </Link>
          );
        })}
      </div>

      {/* Reset Warning Modal */}
      {showResetWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.15)] flex flex-col gap-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-black m-0">Reset Course?</h2>
            </div>
            <p className="text-text-light text-base leading-relaxed">
              Are you sure you want to completely wipe your progress for{' '}
              <strong className="text-text">{courseData.title}</strong>? This action cannot be
              undone, though you will keep your total XP.
            </p>
            <div className="flex gap-4 mt-2">
              <button
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-surface border border-border text-text hover:bg-white/5 transition-colors"
                onClick={() => setShowResetWarning(false)}
                disabled={isResetting}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center disabled:opacity-50"
                onClick={handleResetCourse}
                disabled={isResetting}
              >
                {isResetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
