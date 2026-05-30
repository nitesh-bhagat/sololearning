import React from 'react';
import { Card } from '@sololearning/ui';

export default function AdminDashboard() {
  return (
    <div className="p-10 max-w-7xl mx-auto flex flex-col gap-10 min-h-screen">
      <div>
        <h1 className="text-3xl font-black text-text tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-text-light font-medium text-sm">
          Overview of platform metrics and recent activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="lg" className="bg-surface shadow-md border border-border rounded-2xl">
          <h3 className="text-lg font-bold text-text-light uppercase tracking-wider mb-2">
            Total Users
          </h3>
          <p className="text-4xl font-black text-text">12,450</p>
          <div className="mt-4 text-emerald-500 text-sm font-bold flex items-center gap-1">
            +14% this month
          </div>
        </Card>

        <Card padding="lg" className="bg-surface shadow-md border border-border rounded-2xl">
          <h3 className="text-lg font-bold text-text-light uppercase tracking-wider mb-2">
            Active Courses
          </h3>
          <p className="text-4xl font-black text-text">45</p>
          <div className="mt-4 text-emerald-500 text-sm font-bold flex items-center gap-1">
            +3 new this week
          </div>
        </Card>

        <Card padding="lg" className="bg-surface shadow-md border border-border rounded-2xl">
          <h3 className="text-lg font-bold text-text-light uppercase tracking-wider mb-2">
            Completion Rate
          </h3>
          <p className="text-4xl font-black text-text">68%</p>
          <div className="mt-4 text-emerald-500 text-sm font-bold flex items-center gap-1">
            +5% from last month
          </div>
        </Card>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8 mt-4 shadow-sm">
        <h2 className="text-xl font-bold text-text mb-6">Recent Activity</h2>
        <div className="flex flex-col gap-4 text-text-light">
          <div className="flex justify-between items-center py-3 border-b border-border/50">
            <span>New user 'Alex' registered</span>
            <span className="text-sm">2 mins ago</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border/50">
            <span>Course 'Python Basics' updated</span>
            <span className="text-sm">1 hour ago</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-border/50">
            <span>User 'Sarah' completed 'Advanced Math'</span>
            <span className="text-sm">3 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
