'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import Link from 'next/link';
import { BarChart3, BookOpen, FileQuestion, Users, ArrowLeft } from 'lucide-react';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user || user.role !== 'ADMIN') {
        router.replace('/map/python');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Verifying Admin Authorization...</p>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null; // Will redirect in useEffect
  }

  const sidebarLinks = [
    { href: '/admin', label: 'Overview', icon: BarChart3, exact: true },
    { href: '/admin/courses', label: 'Courses', icon: BookOpen },
    { href: '/admin/lessons', label: 'Lessons & Questions', icon: FileQuestion },
    { href: '/admin/users', label: 'User Moderation', icon: Users },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* Admin Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
          <span className={styles.badge}>Core v1.0</span>
        </div>

        <nav className={styles.sidebarNav}>
          {sidebarLinks.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link href={link.href} key={link.label} style={{ textDecoration: 'none' }}>
                <div className={`${styles.navItem} ${isActive ? styles.activeItem : ''}`}>
                  <Icon size={18} />
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/map/python" style={{ textDecoration: 'none', width: '100%' }}>
            <div className={styles.backButton}>
              <ArrowLeft size={16} />
              <span>Back to App</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className={styles.contentPane}>
        <div className={styles.contentHeader}>
          <h1>
            {sidebarLinks.find((l) =>
              l.exact ? pathname === l.href : pathname?.startsWith(l.href),
            )?.label || 'Admin'}
          </h1>
          <div className={styles.userProfileBadge}>
            <div className={styles.avatarPlaceholder}>
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <span>{user.username} (Admin)</span>
          </div>
        </div>
        <div className={styles.scrollableContent}>{children}</div>
      </main>
    </div>
  );
}
