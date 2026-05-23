'use client';

import React, { useState } from 'react';
import { Search as SearchIcon, BookOpen, Users, Trophy, UserPlus } from 'lucide-react';
import { Button } from '@sololearning/ui';

const DUMMY_RESULTS = [
  {
    id: 1,
    title: 'Introduction to Python',
    desc: 'Master the basics of Python programming in this comprehensive course.',
    type: 'Course',
    icon: BookOpen,
  },
  {
    id: 2,
    title: 'AlexTheGreat',
    desc: 'Rank 4 • 12 Day Streak • Python Master',
    type: 'User',
    icon: Users,
  },
  {
    id: 3,
    title: 'Advanced Algorithms',
    desc: 'Tackle complex data structures and algorithms in competitive programming.',
    type: 'Course',
    icon: BookOpen,
  },
  {
    id: 4,
    title: 'Global Python Clash',
    desc: 'Join the weekend hackathon and prove your Python skills.',
    type: 'Tournament',
    icon: Trophy,
  },
];

const SUGGESTED_PEOPLE = [
  { id: 101, name: 'CodeNinja', displayName: 'Code Ninja', rank: 12, xp: 4500, mutual: 3 },
  { id: 102, name: 'SarahDev', displayName: 'Sarah Dev', rank: 5, xp: 8200, mutual: 12 },
  { id: 103, name: 'PythonMaster', displayName: 'Python Master', rank: 42, xp: 1200, mutual: 1 },
  { id: 104, name: 'AlgoRhythm', displayName: 'Algo Rhythm', rank: 18, xp: 3300, mutual: 5 },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Courses', 'Users', 'Tournaments'];

  return (
    <div className="flex flex-col xl:flex-row min-h-[calc(100vh-var(--nav-height))] w-full bg-background p-4 md:p-8 gap-8 items-start">
      {/* Left Column: Search */}
      <div className="flex-1 flex flex-col gap-6 w-full min-w-0">
        <div>
          <h1 className="text-4xl font-extrabold text-text mb-2">Search</h1>
          <p className="text-text-light text-lg">
            Find courses, challenge friends, or discover tournaments.
          </p>
        </div>

        <div className="relative flex items-center w-full bg-surface border-2 border-border rounded-2xl p-4 transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-shadow shadow-lg">
          <SearchIcon className="text-text-light mr-3" size={28} />
          <input
            type="text"
            placeholder="What do you want to learn today?"
            className="w-full bg-transparent border-none outline-none text-text text-lg placeholder:text-zinc-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-primary text-zinc-950 shadow-[0_4px_15px_rgba(16,185,129,0.3)]'
                  : 'bg-surface text-text-light border border-border hover:bg-white/5 hover:text-text'
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {DUMMY_RESULTS.map((result) => {
            const Icon = result.icon;
            return (
              <div
                key={result.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-surface border border-border rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-xl text-primary">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text mb-1">{result.title}</h3>
                    <p className="text-text-light leading-relaxed">{result.desc}</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-text-light text-sm font-bold w-fit">
                  {result.type}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: People Suggestions */}
      <div className="w-full xl:w-[400px] shrink-0 flex flex-col gap-6">
        <div className="bg-surface border border-border rounded-3xl p-6 sticky top-8 shadow-xl">
          <h2 className="text-xl font-extrabold text-text flex items-center gap-2 mb-6">
            <Users className="text-primary" /> Suggested People
          </h2>

          <div className="flex flex-col gap-5">
            {SUGGESTED_PEOPLE.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-background border-2 border-border group-hover:border-primary flex items-center justify-center text-xl font-bold text-text group-hover:text-primary transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-text text-[1rem] group-hover:text-primary transition-colors">
                      {person.name}
                    </h4>
                    <p className="text-[0.8rem] text-text-light font-medium">
                      {person.mutual} mutual friends
                    </p>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-primary hover:border-primary hover:text-zinc-950 text-text-light flex items-center justify-center transition-all duration-200">
                  <UserPlus size={18} />
                </button>
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            className="w-full mt-6 text-primary border border-primary/20 hover:bg-primary/10"
          >
            View all suggestions
          </Button>
        </div>
      </div>
    </div>
  );
}
