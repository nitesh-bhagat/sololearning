import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, Clock, Award, Info, Terminal, CheckCircle2 } from 'lucide-react';

interface LessonViewProps {
  courseData: any;
  activeLessonId: string;
}

export function LessonView({ courseData, activeLessonId }: LessonViewProps) {
  const params = useParams();
  const courseId = params.course_id as string;

  // Find topic across all chapters
  let activeTopic: any = null;
  courseData.chapters.forEach((c: any) => {
    const t = c.topics.find((tp: any) => tp.id === activeLessonId);
    if (t) activeTopic = t;
  });

  if (!activeTopic) return null;

  return (
    <div className="w-full  min-h-dvh max-h-dvh flex flex-col items-stretch px-8 justify-start max-w-3xl">
      <Link
        href={`/course/${courseId}`}
        className="flex items-center gap-2 text-text-light hover:text-text font-bold transition-colors w-fit pt-8 pb-4"
      >
        <ChevronLeft size={20} /> Back to Map
      </Link>

      <div className="flex-1 flex flex-col overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <h1 className="text-3xl font-black text-text mb-6 tracking-tight leading-tight">
          {activeTopic.title}
        </h1>

        <div className="flex gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl font-bold text-sm text-text-light shadow-sm">
            <Clock size={16} className="text-primary" /> 5-10 mins
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl font-bold text-sm text-text-light shadow-sm">
            <Award size={16} className="text-amber-400" /> +50 XP
          </div>
        </div>

        {/* Dynamic Content Section */}
        <div className="mb-10 flex-1">
          {Array.isArray(activeTopic.content) ? (
            <div className="flex flex-col gap-8">
              {activeTopic.content.map((block: any, idx: number) => {
                switch (block.type) {
                  case 'h2':
                    return (
                      <h2 key={idx} className="text-2xl font-bold text-text tracking-tight">
                        {block.content}
                      </h2>
                    );
                  case 'image':
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-3 bg-surface p-4 rounded-2xl border border-border shadow-sm"
                      >
                        <img
                          src={block.url}
                          alt={block.caption || 'Lesson image'}
                          className="rounded-xl max-w-full h-auto object-cover max-h-[300px]"
                        />
                        {block.caption && (
                          <span className="text-sm font-medium text-text-light">
                            {block.caption}
                          </span>
                        )}
                      </div>
                    );
                  case 'mcq':
                    return (
                      <div
                        key={idx}
                        className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4"
                      >
                        <h3 className="font-bold text-lg text-text leading-snug">
                          {block.question}
                        </h3>
                        <div className="flex flex-col gap-3">
                          {block.options.map((opt: string, optIdx: number) => (
                            <button
                              key={optIdx}
                              className="p-4 text-left rounded-xl border border-border hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all font-medium text-text"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  case 'code':
                    return (
                      <div
                        key={idx}
                        className="flex flex-col gap-3 p-6 bg-slate-900 dark:bg-black border border-slate-800 rounded-2xl shadow-inner"
                      >
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <Terminal size={16} />
                          <span className="text-xs font-mono uppercase tracking-wider font-bold">
                            Code Snippet
                          </span>
                        </div>
                        <code className="text-emerald-400 font-mono text-base whitespace-pre-wrap leading-relaxed">
                          {block.code}
                        </code>
                        {block.explanation && (
                          <div className="mt-4 pt-4 border-t border-slate-800 text-sm text-slate-300 leading-relaxed">
                            {block.explanation}
                          </div>
                        )}
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          ) : (
            <>
              {/* Legacy Object Format Fallback */}
              {activeTopic.content?.p && (
                <div className="text-lg text-text-light leading-relaxed mb-8">
                  {activeTopic.content.p}
                </div>
              )}

              {activeTopic.content?.info && (
                <div className="flex gap-4 p-5 mb-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl shadow-sm">
                  <Info className="text-blue-500 shrink-0 mt-0.5" size={24} />
                  <p className="text-blue-900 dark:text-blue-200 text-base leading-relaxed">
                    {activeTopic.content.info}
                  </p>
                </div>
              )}

              {activeTopic.content?.code && (
                <div className="flex flex-col gap-3 p-6 mb-6 bg-slate-900 dark:bg-black border border-slate-800 rounded-2xl shadow-inner">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Terminal size={16} />
                    <span className="text-xs font-mono uppercase tracking-wider font-bold">
                      Concept / Example
                    </span>
                  </div>
                  <code className="text-emerald-400 font-mono text-base whitespace-pre-wrap leading-relaxed">
                    {activeTopic.content.code}
                  </code>
                </div>
              )}

              {activeTopic.content?.solution && (
                <div className="flex gap-4 p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl shadow-sm">
                  <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={24} />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
                      Key Takeaway
                    </span>
                    <p className="text-emerald-900 dark:text-emerald-200 text-base leading-relaxed">
                      {activeTopic.content.solution}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Fallback for topics with missing dynamic content */}
        {!activeTopic.content && (
          <div className="bg-surface border border-border rounded-2xl p-8 mb-8 text-text-light leading-relaxed text-lg shadow-sm flex-1">
            <p>
              Welcome to the <strong>{activeTopic.title}</strong> lesson! In this module, you will
              learn the fundamental concepts and practical applications of this topic.
            </p>
            <p className="mt-4">
              Pay close attention to the interactive exercises and don&apos;t hesitate to experiment
              with the code snippets provided.
            </p>
          </div>
        )}

        <Link
          href={`/course/${courseId}`}
          className="w-full block text-center py-5 mt-4 rounded-2xl bg-primary text-background font-black text-lg tracking-wide hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
        >
          COMPLETE LESSON
        </Link>
      </div>
    </div>
  );
}
