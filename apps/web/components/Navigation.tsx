'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setUser, setLoading, logoutUser } from '../store/slices/authSlice';
import { Button } from '@sololearning/ui';
import {
  Home,
  Map as MapIcon,
  Search,
  User as UserIcon,
  Flame,
  LogOut,
  Trophy,
  Swords,
  Shield,
  Bell,
  PlayCircle,
  Settings,
  HelpCircle,
  Library,
  Book,
  Hash,
  MessageCircle,
  Heart,
  HeartIcon,
  ZapIcon,
  CalendarDays,
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'My courses', icon: Book, exact: true },
  { href: '/search', label: 'Search', icon: Search, exact: true },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/battleground', label: 'Battleground', icon: Swords },
  // { href: '/channels', label: 'Channels', icon: Hash },
  // { href: '/direct-messages', label: 'Direct Messages', icon: MessageCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

export function NavigationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const [continueData, setContinueData] = useState<any>(null);

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  const visibleNavLinks = [...navLinks];
  if (user && user.role === 'ADMIN') {
    visibleNavLinks.push({ href: '/admin', label: 'Admin', icon: Shield });
  }

  // Fetch session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include', // Important to send HTTP-only cookies
        });
        if (res.ok) {
          const data = await res.json();
          dispatch(setUser(data.user));
        } else {
          dispatch(setLoading(false));
        }
      } catch (err) {
        dispatch(setLoading(false));
      }
    };
    fetchSession();
  }, [dispatch]);

  // Fetch continue learning data
  useEffect(() => {
    if (isAuthenticated) {
      const fetchContinueData = async () => {
        try {
          const res = await fetch('/api/users/me/continue');
          if (res.ok) {
            const data = await res.json();
            setContinueData(data);
          }
        } catch (err) {
          console.error('Error fetching continue learning', err);
        }
      };
      fetchContinueData();
    }
  }, [isAuthenticated, pathname]); // Re-fetch when pathname changes to keep it updated

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      dispatch(logoutUser());
    } catch (err) {
      console.error(err);
    }
  };

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAuthPage || isAdminPage) {
    return <main className="bg-background min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 w-[20%] h-screen bg-surface border-r border-border py-8 px-4 flex-col z-50">
        {/* stats */}
        <div className="flex items-center justify-start gap-2 mb-4">
          <div
            className="flex flex-col items-center justify-center p-2 bg-white/5 shadow-md rounded-lg"
            title="2"
          >
            <span className="text-xs">Lives</span>
            <div className="flex flex-row gap-1 items-center font-black text-red-500">
              <HeartIcon size={15} />
              <span className="text-sm">{formatNumber(2)}</span>
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center p-2 bg-white/5 shadow-md rounded-lg"
            title={user?.xp?.toString() || '0'}
          >
            <span className="text-xs">XP</span>
            <div className="flex flex-row gap-1 items-center font-black text-yellow-500">
              <ZapIcon size={15} />
              <span className="text-sm">{formatNumber(user?.xp)}</span>
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center p-2 bg-white/5 shadow-md rounded-lg"
            title="123"
          >
            <span className="text-xs">Streak</span>
            <div className="flex flex-row gap-1 items-center font-black text-orange-500">
              <Flame size={15} />
              <span className="text-sm">{formatNumber(123)}</span>
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center p-2 bg-white/5 shadow-md rounded-lg"
            title="109"
          >
            <span className="text-xs">Mission</span>
            <div className="flex flex-row gap-1 items-center font-black text-green-500">
              <CalendarDays size={15} />
              <span className="text-sm">{formatNumber(109)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-row"></div>
        {/* Continue Learning Block */}
        {continueData && (
          <div className="mb-8 px-2">
            <div className="text-[0.8rem] font-bold text-text-light uppercase mb-2 tracking-wide">
              Continue Learning
            </div>
            <Link href={`/course/${continueData.courseId}`} className="no-underline">
              <div
                className={`flex items-center gap-3 p-3 rounded-2xl border border-b-4 transition-all duration-200 cursor-pointer ${
                  pathname?.includes(continueData.courseId)
                    ? 'bg-emerald-500 border-emerald-900 text-white hover:bg-emerald-400'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <PlayCircle
                  size={36}
                  className={`shrink-0 ${pathname?.includes(continueData.courseId) ? 'text-white' : 'text-primary'}`}
                />
                <div className="flex-1 overflow-hidden">
                  <div
                    className={`text-[0.95rem] font-bold whitespace-nowrap overflow-hidden text-ellipsis ${pathname?.includes(continueData.courseId) ? 'text-white' : 'text-text'}`}
                  >
                    {continueData.topicTitle}
                  </div>
                  <div
                    className={`text-[0.8rem] whitespace-nowrap overflow-hidden text-ellipsis ${pathname?.includes(continueData.courseId) ? 'text-emerald-100' : 'text-text-light'}`}
                  >
                    {continueData.courseTitle}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {visibleNavLinks.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link href={link.href} key={link.label} className="no-underline">
                <div
                  className={`flex items-center gap-4 p-1.5 rounded-lg font-semibold transition-all duration-200 hover:text-primary ${isActive ? 'bg-emerald-500 hover:text-white text-white border-b-4 border-emerald-900' : 'text-text-light'}`}
                >
                  <span>
                    <Icon size={20} />
                  </span>
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Auth Section Desktop */}
        <div className="mt-auto py-3 px-2 flex flex-col gap-2.5 sticky bottom-0 bg-surface">
          {isLoading ? (
            <div className="text-text-light">Loading...</div>
          ) : isAuthenticated && user ? (
            <Link
              href="/profile"
              className="w-full flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-white/5 no-underline"
            >
              <div className="w-9 h-9 rounded-full bg-background border-2 border-primary flex items-center justify-center text-lg shrink-0">
                {user.avatar || user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="font-bold text-[0.9rem] text-text whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.username}
                </div>
              </div>
            </Link>
          ) : (
            <Link href="/login" className="no-underline">
              <Button variant="primary" fullWidth>
                Login to Save
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-[80%] pb-[var(--nav-height)] md:py-0 md:ml-[20%]">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-[var(--nav-height)] bg-surface border-t border-border flex justify-around items-center pb-[env(safe-area-inset-bottom)] z-50 md:hidden">
        {visibleNavLinks.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link href={link.href} key={link.label} className="flex-1 no-underline">
              <div
                className={`flex flex-col items-center justify-center text-[0.7rem] font-medium gap-1 flex-1 transition-colors duration-200 hover:text-primary ${isActive ? 'text-primary' : 'text-text-light'} `}
              >
                <span className="text-[1.4rem]">
                  <Icon size={24} />
                </span>
                <span>{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
