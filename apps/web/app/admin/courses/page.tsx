'use client';

import React, { useEffect, useState } from 'react';
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
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CourseManagement() {
  const router = useRouter();
  const [data, setData] = useState<{ summary: any; courses: any[] }>({
    summary: { totalCourses: 0, activeLearners: 0, avgRating: 0, avgCompletion: '0%' },
    courses: [],
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/courses/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const toggleStatus = async (courseId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Draft' : 'Active';
    try {
      await fetch(`/api/admin/courses/${courseId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchStats();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (
      !window.confirm('Are you sure you want to delete this course? This action cannot be undone.')
    )
      return;
    try {
      await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });
      fetchStats();
    } catch (err) {
      console.error('Failed to delete course', err);
    }
  };

  const filteredCourses = data.courses.filter((c) => {
    if (filter !== 'all' && c.status.toLowerCase() !== filter) return false;
    if (query && !c.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

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
            <p className="text-2xl font-black text-text">
              {loading ? '-' : data.summary.totalCourses}
            </p>
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
            <p className="text-2xl font-black text-text">
              {loading ? '-' : data.summary.activeLearners.toLocaleString()}
            </p>
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
            <p className="text-2xl font-black text-text">
              {loading ? '-' : data.summary.avgRating}
            </p>
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
            <p className="text-2xl font-black text-text">
              {loading ? '-' : data.summary.avgCompletion}
            </p>
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-text placeholder-text-light focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-background border border-border rounded-xl px-4 py-2.5 text-text font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-light">
                    Loading courses...
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-light">
                    No courses found.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-bold max-w-[250px] truncate" title={course.title}>
                      {course.title}
                    </td>
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
                    <td className="px-6 py-4 font-medium text-text-light">
                      {course.completionRate}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleStatus(course.id, course.status)}
                        className="p-2 text-text-light hover:text-primary transition-colors bg-background rounded-lg border border-border"
                        title={course.status === 'Active' ? 'Make Draft' : 'Make Active'}
                      >
                        {course.status === 'Active' ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => router.push(`/admin/courses/${course.id}/edit`)} // Or wherever edit is
                        className="p-2 text-text-light hover:text-blue-500 transition-colors bg-background rounded-lg border border-border"
                        title="Edit Course"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="p-2 text-text-light hover:text-red-500 transition-colors bg-background rounded-lg border border-border"
                        title="Delete Course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Inline icon component
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
