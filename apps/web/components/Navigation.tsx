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
  PlayCircle,
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home', icon: Home, exact: true },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/leaderboard', label: 'Rankings', icon: Trophy },
  { href: '/arena', label: 'Arena', icon: Swords },
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
        {/* Continue Learning Block */}
        <div style={{ marginBottom: '2rem', padding: '0 8px' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--color-text-light)',
              textTransform: 'uppercase',
              marginBottom: '8px',
              letterSpacing: '0.5px',
            }}
          >
            Continue Learning
          </div>
          <Link href="/map/python" style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')
              }
            >
              <PlayCircle size={36} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Variables & Data
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-light)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  Python Basics
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className={styles.desktopNavList}>
          {visibleNavLinks.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link href={link.href} key={link.label} style={{ textDecoration: 'none' }}>
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
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          {isLoading ? (
            <div style={{ color: 'var(--color-text-light)' }}>Loading...</div>
          ) : isAuthenticated && user ? (
            <div
              style={{
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <Link
                href="/profile"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '4px',
                  borderRadius: '12px',
                  transition: 'background-color 0.2s',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-background)',
                    border: '2px solid var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  {user.avatar || user.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
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
                      fontSize: '0.8rem',
                      color: 'var(--color-warning)',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Flame size={12} color="#f97316" />{' '}
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
                  fontSize: '0.85rem',
                  padding: '6px',
                  color: 'var(--color-text-light)',
                  display: 'flex',
                  justifyContent: 'flex-start',
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
            <Link href={link.href} key={link.label} style={{ flex: 1, textDecoration: 'none' }}>
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
