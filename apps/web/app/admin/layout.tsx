import React from 'react';
import { AdminNavigationLayout } from '../../components/AdminNavigation';

export const metadata = {
  title: 'Admin Panel | Solo Learning',
  description: 'Manage users, courses, and platform settings',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminNavigationLayout>{children}</AdminNavigationLayout>;
}
