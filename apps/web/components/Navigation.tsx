'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

const navLinks = [
  { href: '/continue', label: 'Continue learning', icon: '▶️' },
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/search', label: 'Search', icon: '🔍' },
  { href: '/notifications', label: 'Notification', icon: '🔔' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export function NavigationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.layoutWrapper}>
      {/* Mobile TopBar */}
      <header className={styles.topbar}>
        <Link href="/profile">
          <div className={styles.avatar}>N</div>
        </Link>
        <div style={{fontWeight: 600}}>Solo Learning</div>
        <button className={styles.iconBtn}>⚙️</button>
      </header>

      {/* Desktop Navigation */}
      <nav className={styles.desktopNav}>
        <div className={styles.desktopLogo}>Solo Learning</div>
        <div className={styles.desktopNavList}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link href={link.href} key={link.label}>
                <div className={`${styles.desktopNavItem} ${isActive ? styles.active : ''}`}>
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.bottomNav}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link href={link.href} key={link.label} style={{ flex: 1 }}>
              <div className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                <span className={styles.navIcon}>{link.icon}</span>
                <span>{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
