'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setUser, setLoading, logoutUser } from '../store/slices/authSlice';
import styles from './Navigation.module.css';
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
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home, exact: true },
  { href: '/map/python', label: 'Learn', icon: MapIcon },
  { href: '/arena', label: 'Arena', icon: Swords },
  { href: '/leaderboard', label: 'Rankings', icon: Trophy },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

export function NavigationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      dispatch(logoutUser());
    } catch (err) {
      console.error(err);
    }
  };

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return (
      <main style={{ backgroundColor: 'var(--color-background)', minHeight: '100vh' }}>
        {children}
      </main>
    );
  }

  return (
    <div className={styles.layoutWrapper}>
      {/* Mobile TopBar Removed */}

      {/* Desktop Navigation */}
      <nav className={styles.desktopNav}>
        <div className={styles.desktopLogo}>SoloLearning</div>
        <div className={styles.desktopNavList}>
          {visibleNavLinks.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link href={link.href} key={link.label}>
                <div className={`${styles.desktopNavItem} ${isActive ? styles.active : ''}`}>
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
        <div
          style={{
            marginTop: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {isLoading ? (
            <div style={{ color: 'var(--color-text-light)' }}>Loading...</div>
          ) : isAuthenticated && user ? (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Link
                href="/profile"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '4px',
                  borderRadius: '12px',
                  transition: 'background-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-background)',
                    border: '2px solid var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                    boxShadow: '0 0 10px var(--color-primary-shadow)',
                  }}
                >
                  {user.avatar || user.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontWeight: 'bold',
                      color: 'var(--color-text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.username}
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--color-warning)',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Flame size={14} color="#f97316" />{' '}
                    <span style={{ color: '#f97316' }}>{user.streak || 0}</span>
                    <span style={{ margin: '0 4px', color: 'var(--color-text-light)' }}>
                      •
                    </span>⭐ {user.xp || 0}
                  </div>
                </div>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  fontSize: '0.9rem',
                  padding: '8px',
                  color: 'var(--color-text-light)',
                }}
              >
                <LogOut size={16} style={{ marginRight: '8px' }} />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Button variant="primary" fullWidth>
                Login to Save
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={styles.mainContent}>{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.bottomNav}>
        {visibleNavLinks.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link href={link.href} key={link.label} style={{ flex: 1 }}>
              <div className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                <span className={styles.navIcon}>
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
