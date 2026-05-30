'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@sololearning/ui';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  LogOut,
  BarChart,
  ShieldAlert,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminNavigationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      dispatch(logoutUser());
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 w-[20%] h-screen bg-surface border-r border-border py-8 px-4 flex-col z-50">
        <div className="flex items-center gap-2 mb-8 px-2 text-primary">
          <ShieldAlert size={28} />
          <span className="text-xl font-black tracking-tight text-text">Admin Panel</span>
        </div>

        <div className="text-[0.8rem] font-bold text-text-light uppercase mb-4 tracking-wide px-2">
          Management
        </div>

        <div className="flex flex-col gap-2">
          {adminNavLinks.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link href={link.href} key={link.label} className="no-underline">
                <div
                  className={`flex items-center gap-4 p-3 rounded-xl font-semibold transition-all duration-200 hover:text-primary ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-text-light hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Exit Admin Section */}
        <div className="mt-auto py-3 px-2 flex flex-col gap-3 sticky bottom-0 bg-surface border-t border-border pt-4">
          <Link href="/" className="no-underline">
            <Button variant="ghost" className="w-full justify-start text-text-light">
              Back to Main App
            </Button>
          </Link>
          <Button
            variant="danger"
            onClick={handleLogout}
            className="w-full text-[0.85rem] p-1.5 flex justify-start items-center"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-[80%] pb-[var(--nav-height)] md:py-0 md:ml-[20%]">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-[var(--nav-height)] bg-surface border-t border-border flex justify-around items-center pb-[env(safe-area-inset-bottom)] z-50 md:hidden">
        {adminNavLinks.slice(0, 5).map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link href={link.href} key={link.label} className="flex-1 no-underline">
              <div
                className={`flex flex-col items-center justify-center text-[0.7rem] font-medium gap-1 flex-1 transition-colors duration-200 hover:text-primary ${
                  isActive ? 'text-primary' : 'text-text-light'
                }`}
              >
                <Icon size={24} />
                <span>{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
