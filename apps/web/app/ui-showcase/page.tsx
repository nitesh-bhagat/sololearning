'use client';
import React from 'react';
import { Button, Card, ProgressBar } from '@sololearning/ui';
import { ThemeToggle } from '../../components/ThemeToggle';
import { WidgetList } from '../../components/WidgetList';

export default function UIShowcase() {
  return (
    <div className="p-10 max-w-5xl mx-auto flex flex-col gap-12 min-h-screen pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-surface p-8 rounded-[2rem] border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight mb-1">UI Showcase</h1>
          <p className="text-text-light font-medium text-sm">Design system & component library</p>
        </div>
        <ThemeToggle />
      </div>

      {/* Buttons Section */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-bold text-text-light uppercase tracking-widest px-4">
          Buttons
        </h2>
        <div className="flex gap-6 flex-wrap bg-surface p-8 rounded-[2rem] border border-border shadow-sm items-center">
          <Button variant="primary" size="lg">
            Continue
          </Button>
          <Button variant="secondary" size="md">
            Check
          </Button>
          <Button variant="danger" size="sm">
            Report
          </Button>
          <Button variant="ghost">Skip</Button>
        </div>
      </section>

      {/* Cards Section */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-bold text-text-light uppercase tracking-widest px-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-surface rounded-[2rem] border border-border shadow-sm p-8 flex flex-col hover:border-primary/50 transition-colors">
            <h3 className="text-xl font-black text-text mb-2">Lesson 1</h3>
            <p className="text-text-light mb-8 flex-1">
              Learn the basics of JavaScript and build your first interactive program.
            </p>
            <Button variant="primary" className="w-full">
              Start Lesson
            </Button>
          </div>

          {/* Card 2 */}
          <div className="bg-surface/40 rounded-[2rem] border-2 border-dashed border-border p-8 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20">
              <span className="text-2xl font-black">⭐</span>
            </div>
            <h3 className="text-xl font-black text-text mb-2">Daily Quests</h3>
            <p className="text-text-light">Earn 50 XP to unlock a magical chest.</p>
          </div>
        </div>
      </section>

      {/* Progress Bars Section */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-bold text-text-light uppercase tracking-widest px-4">
          Progress Bars
        </h2>
        <div className="flex flex-col gap-8 bg-surface p-10 rounded-[2rem] border border-border shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-primary">Beginner</span>
              <span className="text-text-light">30%</span>
            </div>
            <ProgressBar progress={30} color="primary" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-secondary">Intermediate</span>
              <span className="text-text-light">75%</span>
            </div>
            <ProgressBar progress={75} color="secondary" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-warning">Advanced</span>
              <span className="text-text-light">90%</span>
            </div>
            <ProgressBar progress={90} color="warning" />
          </div>
        </div>
      </section>

      {/* Widget List Editor Section */}
      <section className="flex flex-col gap-5">
        <h2 className="text-sm font-bold text-text-light uppercase tracking-widest px-4">
          Course Editor Preview
        </h2>
        <div className="h-[700px] flex border-2 border-border rounded-[2rem] overflow-hidden shadow-xl bg-background">
          {/* Sidebar */}
          <WidgetList onWidgetSelect={(id) => console.log('Selected widget:', id)} />

          {/* Canvas */}
          <div className="flex-1 p-8 bg-surface/30 flex flex-col items-center justify-center border-l border-border relative overflow-hidden">
            {/* Decorative Background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>

            {/* Empty State */}
            <div className="bg-surface p-8 rounded-3xl border border-border shadow-lg z-10 text-center max-w-sm">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <span className="text-3xl font-black">✨</span>
              </div>
              <h3 className="text-xl font-black text-text mb-3 tracking-tight">
                Editor Canvas Area
              </h3>
              <p className="text-sm text-text-light leading-relaxed">
                Select a widget from the sidebar to preview it here and build your amazing course.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
