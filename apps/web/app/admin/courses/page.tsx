'use client';

import React from 'react';
import { Button, Card } from '@sololearning/ui';
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  Star,
} from 'lucide-react';
import Link from 'next/link';

// Mock data for courses
const MOCK_COURSES = [
  {
    id: 'python-beginners-course',
    title: 'Python for Beginners',
    status: 'Active',
    enrolled: 4520,
    rating: 4.8,
    completionRate: '72%',
  },
  {
    id: 'economics-beginners-course',
    title: 'Economics for Beginners',
    status: 'Active',
    enrolled: 3105,
    rating: 4.6,
    completionRate: '65%',
  },
  {
    id: 'product-management-beginners-course',
    title: 'Product Management for Beginners',
    status: 'Draft',
    enrolled: 0,
    rating: 0,
    completionRate: '0%',
  },
];

export default function CourseManagement() {
  return (
    <div className="p-10 max-w-7xl mx-auto flex flex-col gap-10 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-text tracking-tight mb-2">Course Management</h1>
          <p className="text-text-light font-medium text-sm">
            Create, update, and monitor platform courses.
          </p>
        </div>
        <Link href="/admin/courses/create" className="no-underline">
          <Button variant="primary" className="flex items-center gap-2 px-6">
            <Plus size={20} />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Performance Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          padding="md"
          className="bg-surface shadow-sm border border-border rounded-2xl flex items-center gap-4"
        >
          <div className="p-4 bg-primary/10 text-primary rounded-xl shrink-0">
            <BookOpenIcon />
          </div>
          <div>
            <p className="text-sm font-bold text-text-light uppercase tracking-wider">
              Total Courses
            </p>
            <p className="text-2xl font-black text-text">24</p>
          </div>
        </Card>

        <Card
          padding="md"
          className="bg-surface shadow-sm border border-border rounded-2xl flex items-center gap-4"
        >
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-text-light uppercase tracking-wider">
              Active Learners
            </p>
            <p className="text-2xl font-black text-text">18,200</p>
          </div>
        </Card>

        <Card
          padding="md"
          className="bg-surface shadow-sm border border-border rounded-2xl flex items-center gap-4"
        >
          <div className="p-4 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-text-light uppercase tracking-wider">Avg Rating</p>
            <p className="text-2xl font-black text-text">4.7</p>
          </div>
        </Card>

        <Card
          padding="md"
          className="bg-surface shadow-sm border border-border rounded-2xl flex items-center gap-4"
        >
          <div className="p-4 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-text-light uppercase tracking-wider">Completion</p>
            <p className="text-2xl font-black text-text">64%</p>
          </div>
        </Card>
      </div>

      {/* Course List Section */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light"
              size={20}
            />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-text placeholder-text-light focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <select className="bg-background border border-border rounded-xl px-4 py-2.5 text-text font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 text-text-light text-sm uppercase tracking-wider border-b border-border">
                <th className="px-6 py-4 font-bold">Course Title</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Enrolled</th>
                <th className="px-6 py-4 font-bold">Rating</th>
                <th className="px-6 py-4 font-bold">Completion</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-text">
              {MOCK_COURSES.map((course) => (
                <tr key={course.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-bold">{course.title}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        course.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-orange-500/10 text-orange-500'
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-text-light">
                    {course.enrolled.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-text-light flex items-center gap-1">
                    {course.rating > 0 ? (
                      <>
                        <Star size={14} className="text-amber-500" />
                        {course.rating}
                      </>
                    ) : (
                      '--'
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-text-light">{course.completionRate}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-text-light hover:text-primary transition-colors bg-background rounded-lg border border-border">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-text-light hover:text-blue-500 transition-colors bg-background rounded-lg border border-border">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-text-light hover:text-red-500 transition-colors bg-background rounded-lg border border-border">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Inline icon component since BookOpen isn't imported from lucide-react in the main import statement above to save lines
function BookOpenIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
  );
}
