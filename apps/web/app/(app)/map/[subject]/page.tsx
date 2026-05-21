'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './map.module.css';
import { Roadmap } from '../../../../components/roadmap/Roadmap';

export default function MapPage() {
  const params = useParams();
  const subjectId = params.subject as string;

  // In a real app, we would fetch the courseId based on the subject slug.
  // For this MVP, we seeded a Python course with a specific UUID.
  // We will just hardcode the seeded course ID for demonstration.
  const COURSE_ID = '994594a4-7854-4e84-8b11-f9f27510fa7a';

  const [friends, setFriends] = useState<any[]>([]);
  const [friendsProgress, setFriendsProgress] = useState<any[]>([]);

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        // Fetch active friends
        const friendsRes = await fetch('/api/friends', { credentials: 'include' });
        if (friendsRes.ok) {
          const friendsData = await friendsRes.json();
          setFriends(friendsData.friends || []);
        }

        // Fetch friends' course progress
        const progressRes = await fetch(`/api/friends/progress/${COURSE_ID}`, {
          credentials: 'include',
        });
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setFriendsProgress(progressData || []);
        }
      } catch (err) {
        console.error('Error fetching social/progress data:', err);
      }
    };

    fetchSocialData();
  }, [COURSE_ID]);

  return (
    <div className={styles.mapContainer}>
      <header className={styles.mapHeader}>
        <Link href="/">
          <div className={styles.backButton}>← Back</div>
        </Link>
        <h1 className={styles.title}>
          {subjectId.charAt(0).toUpperCase() + subjectId.slice(1)} Path
        </h1>
        <div style={{ width: '60px' }}></div>
      </header>

      {/* Social Sidebar (Desktop Only) */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>
          Community <span>👥</span>
        </h2>
        <div className={styles.friendList}>
          {friends.length === 0 ? (
            <div style={{ padding: '10px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              No friends active yet. Go to{' '}
              <Link
                href="/social"
                style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
              >
                Social Hub
              </Link>{' '}
              to add some!
            </div>
          ) : (
            friends.map((f) => (
              <div key={f.id} className={styles.friend}>
                <div className={styles.avatar}>
                  {f.avatar || f.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong style={{ color: 'var(--text-color)' }}>{f.username}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    🛡️ {f.rank} • ⭐ {f.xp || 0}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <Link href="/social" style={{ width: '100%' }}>
          <button className={styles.inviteBtn}>Manage Friends</button>
        </Link>
      </aside>

      {/* The Real Roadmap Component connected to our API */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Roadmap courseId={COURSE_ID} friendsProgress={friendsProgress} />
      </div>
    </div>
  );
}
