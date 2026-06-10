'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search as SearchIcon,
  BookOpen,
  Users,
  Trophy,
  UserPlus,
  Star,
  Play,
  Sparkles,
  X,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Button, Skeleton } from '@sololearning/ui';

// KEEP MOCK DATA FOR RIGHT COLUMN
const SUGGESTED_PEOPLE = [
  { id: 101, name: 'CodeNinja', displayName: 'Code Ninja', rank: 12, xp: 4500, mutual: 3 },
  { id: 102, name: 'SarahDev', displayName: 'Sarah Dev', rank: 5, xp: 8200, mutual: 12 },
  { id: 103, name: 'PythonMaster', displayName: 'Python Master', rank: 42, xp: 1200, mutual: 1 },
  { id: 104, name: 'AlgoRhythm', displayName: 'Algo Rhythm', rank: 18, xp: 3300, mutual: 5 },
];

function CourseDetailsModal({ course, onClose }: { course: any; onClose: () => void }) {
  const router = useRouter();
  const [details, setDetails] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        const [roadmapRes, friendsRes] = await Promise.all([
          fetch(`/api/courses/${course.id}/roadmap`),
          fetch(`/api/courses/${course.id}/friends`),
        ]);

        if (roadmapRes.ok) {
          const data = await roadmapRes.json();
          setDetails(data);
        }
        if (friendsRes.ok) {
          const data = await friendsRes.json();
          setFriends(data);
        }
      } catch (err) {
        console.error('Failed to load course details', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourseDetails();

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [course.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative flex flex-col bg-surface w-full max-w-2xl max-h-full rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex-shrink-0 flex justify-between items-start p-6 border-b border-border/50 bg-background/50">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-xl border-2 border-border bg-zinc-800 flex items-center justify-center text-primary overflow-hidden shrink-0">
              {course.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={24} className="opacity-80" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-text leading-tight">{course.title}</h2>
              <p className="text-text-light text-sm font-medium mt-1">
                By <span className="text-text font-bold">SoloLearning Team</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-text-light hover:text-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          {/* Description & Metadata */}
          <div>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-text-light text-xs font-bold uppercase tracking-wider">
                {course.subjectTitle}
              </span>
              {course.totalXp > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-xs font-black uppercase tracking-wider">
                  <Star size={12} className="fill-amber-500" />
                  {course.totalXp} XP
                </span>
              )}
            </div>
            <p className="text-text-light leading-relaxed">
              {course.description || 'No description provided for this course.'}
            </p>
          </div>

          {/* Friends Section */}
          {loading ? (
            <Skeleton width="100%" height="60px" borderRadius="16px" />
          ) : (
            friends.length > 0 && (
              <div className="flex flex-col gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                <h4 className="text-sm font-black text-text-light uppercase tracking-wider">
                  Friends taking this course
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="relative group w-10 h-10 rounded-full border-2 border-surface bg-background flex items-center justify-center text-sm font-bold text-text shadow-sm cursor-pointer"
                      >
                        {friend.avatar || friend.username.charAt(0).toUpperCase()}

                        {/* Animated Tooltip */}
                        <div className="absolute bottom-full mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:-translate-y-1 transition-all duration-200 z-50 whitespace-nowrap">
                          <div className="bg-text text-background text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg relative">
                            {friend.username}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-text"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-text-light">
                    {friends.length} friend{friends.length > 1 ? 's' : ''} learning
                  </span>
                </div>
              </div>
            )
          )}

          {/* Curriculum Section */}
          <div>
            <h4 className="text-sm font-black text-text-light uppercase tracking-wider mb-4">
              Curriculum
            </h4>
            {loading ? (
              <div className="flex flex-col gap-3">
                <Skeleton width="100%" height="48px" borderRadius="12px" />
                <Skeleton width="100%" height="48px" borderRadius="12px" />
                <Skeleton width="100%" height="48px" borderRadius="12px" />
              </div>
            ) : details?.chapters ? (
              <div className="flex flex-col gap-3">
                {details.chapters.map((chapter: any, idx: number) => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between p-4 bg-background border border-border/50 rounded-xl group hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-xs font-bold text-text-light group-hover:text-text transition-colors">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-text text-sm">{chapter.title}</span>
                    </div>
                    <div className="text-xs font-bold text-text-light px-2 py-1 bg-surface rounded-md">
                      {chapter.topics?.length || 0} Topics
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-light">No chapters available.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex-shrink-0 p-6 border-t border-border/50 bg-background/50">
          <button
            onClick={() => router.push(`/course/${course.id}`)}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary text-zinc-950 font-black text-lg rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-200"
          >
            <Play size={20} className="fill-zinc-950" />
            Start this course
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  const filters = ['All', 'Courses', 'Users', 'Tournaments'];

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const subjects = await res.json();
          // Flatten courses from all subjects
          const allCourses = subjects.reduce((acc: any[], subject: any) => {
            const subjectCourses = (subject.courses || []).map((c: any) => ({
              ...c,
              subjectTitle: subject.title,
            }));
            return [...acc, ...subjectCourses];
          }, []);
          setCourses(allCourses);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Client-side filtering based on query
  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col xl:flex-row min-h-[calc(100vh-var(--nav-height))] w-full bg-background p-4 md:p-6 gap-6 items-start">
      {/* Course Details Modal */}
      {selectedCourse && (
        <CourseDetailsModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}

      {/* Left Column: Search */}
      <div className="flex-1 flex flex-col gap-6 w-full min-w-0">
        <div className="relative overflow-hidden bg-surface border border-border p-6 rounded-3xl shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 text-primary opacity-5 pointer-events-none">
            <Trophy size={180} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text mb-3 tracking-tight z-10 relative">
            Explore <span className="text-primary">Quests</span>
          </h1>
          <p className="text-text-light text-base max-w-2xl font-medium z-10 relative">
            Find epic courses, challenge your friends, and rise up the leaderboard.
          </p>

          <div className="relative flex items-center w-full bg-background border-2 border-border rounded-xl p-3 mt-6 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 z-10">
            <SearchIcon className="text-text-light mr-3" size={20} />
            <input
              type="text"
              placeholder="Search for Python, React, Data Structures..."
              className="w-full bg-transparent border-none outline-none text-text text-base placeholder:text-zinc-500 font-bold"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`px-5 py-2 rounded-lg font-bold transition-all duration-200 uppercase tracking-wider text-[0.75rem] ${
                activeFilter === filter
                  ? 'bg-primary text-zinc-950 shadow-sm scale-105'
                  : 'bg-surface text-text-light border border-border hover:bg-white/5 hover:text-text'
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 mt-2">
          {loading ? (
            // Skeleton Loaders
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row p-4 bg-surface border border-border rounded-2xl gap-4"
                >
                  <Skeleton width="80px" height="80px" borderRadius="16px" />
                  <div className="flex-1 flex flex-col justify-center gap-3">
                    <Skeleton width="50%" height="20px" />
                    <Skeleton width="80%" height="14px" />
                  </div>
                </div>
              ))
          ) : filteredCourses.length > 0 &&
            (activeFilter === 'All' || activeFilter === 'Courses') ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="group relative flex items-center p-4 bg-surface border border-border rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg cursor-pointer overflow-hidden"
                >
                  {/* Decorative background glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Image/Icon area */}
                  <div className="shrink-0 w-20 h-20 rounded-xl border-2 border-background bg-zinc-800 flex items-center justify-center text-primary overflow-hidden relative z-10">
                    {course.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen size={28} className="opacity-80" />
                    )}
                  </div>

                  {/* Content area */}
                  <div className="flex-1 ml-4 flex flex-col z-10 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-text-light text-[0.65rem] font-bold uppercase tracking-wider truncate max-w-[120px]">
                        {course.subjectTitle}
                      </span>
                      {course.totalXp > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-md text-[0.65rem] font-black uppercase tracking-wider shrink-0">
                          <Star size={10} className="fill-amber-500" />
                          {course.totalXp} XP
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-text mb-1 group-hover:text-primary transition-colors truncate">
                      {course.title}
                    </h3>
                    <p className="text-text-light text-sm line-clamp-1 font-medium">
                      {course.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="shrink-0 ml-3 text-text-light group-hover:text-primary transition-colors z-10">
                    <ChevronRight size={20} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center bg-surface border border-border rounded-2xl">
              <Sparkles size={32} className="text-primary opacity-50 mb-3" />
              <h3 className="text-xl font-black text-text mb-2">No courses found</h3>
              <p className="text-sm text-text-light font-medium">
                Try searching for something else!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: People Suggestions */}
      <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
        <div className="bg-surface border border-border rounded-2xl p-5 sticky top-6 shadow-lg">
          <h2 className="text-lg font-extrabold text-text flex items-center gap-2 mb-5">
            <Users className="text-primary" size={20} /> Fellow Warriors
          </h2>

          <div className="flex flex-col gap-3">
            {SUGGESTED_PEOPLE.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-background border border-border group-hover:border-primary flex items-center justify-center text-lg font-black text-text group-hover:text-primary transition-all">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-text text-sm group-hover:text-primary transition-colors">
                      {person.name}
                    </h4>
                    <p className="text-[0.7rem] text-text-light font-bold flex items-center gap-1 mt-0.5">
                      <Trophy size={10} className="text-amber-500" /> Rank {person.rank}
                    </p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-background border border-border hover:bg-primary hover:border-primary hover:text-zinc-950 text-text-light flex items-center justify-center transition-all duration-200">
                  <UserPlus size={14} />
                </button>
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            className="w-full mt-5 text-primary border border-primary/20 hover:bg-primary/10 font-bold rounded-lg h-10 text-sm"
          >
            Find more rivals
          </Button>
        </div>
      </div>
    </div>
  );
}
