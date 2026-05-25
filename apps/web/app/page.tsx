import Link from 'next/link';
import { MY_COURSES_MOCKDATA } from './(app)/course/[course_id]/mockData';
import { BookA } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 px-6 py-12 flex flex-col items-center font-sans">
      <header className="text-center mb-12 mt-4 space-y-3">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          My courses
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Select a subject to continue your journey
        </p>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6">
        {MY_COURSES_MOCKDATA.map((subject) => (
          <Link href={`/course/${subject.id}`} key={subject.id} className="group outline-none">
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 flex items-center gap-5 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-emerald-200 dark:group-hover:border-emerald-900 group-focus-visible:ring-2 group-focus-visible:ring-emerald-500">
              {/* Subtle decorative background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-emerald-950/40 pointer-events-none" />

              <div className="relative z-10 w-16 h-16 rounded-xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-neutral-100 dark:border-neutral-700 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                <BookA size={28} strokeWidth={2} />
              </div>

              <div className="relative z-10 flex flex-col gap-1.5">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {subject.title}
                </h2>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {subject.description}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
