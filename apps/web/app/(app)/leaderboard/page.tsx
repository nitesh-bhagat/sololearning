'use client';

import React, { useEffect, useState } from 'react';
import styles from './leaderboard.module.css';
import { Trophy, Flame, Medal, Globe, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Button, Skeleton, EmptyState } from '@sololearning/ui';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/users/leaderboard', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');

  if (loading) {
    return (
      <div className={`${styles.container} animate-fade-in`}>
        <Skeleton height="50px" borderRadius="12px" style={{ marginBottom: '20px' }} />
        <Skeleton height="80px" borderRadius="12px" style={{ marginBottom: '10px' }} />
        <Skeleton height="80px" borderRadius="12px" style={{ marginBottom: '10px' }} />
        <Skeleton height="80px" borderRadius="12px" style={{ marginBottom: '10px' }} />
        <Skeleton height="80px" borderRadius="12px" style={{ marginBottom: '10px' }} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Rankings</h1>
        <div className={styles.tabbar}>
          <button
            className={`${styles.tab} ${activeTab === 'global' ? styles.active : ''}`}
            onClick={() => setActiveTab('global')}
          >
            <Globe size={18} /> Global ranking
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'friends' ? styles.active : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <Users size={18} /> Friends ranking
          </button>
        </div>
      </div>

      <div className={styles.leaderboardCard}>
        {activeTab === 'friends' ? (
          <EmptyState
            icon={<Users size={32} />}
            title="Friends System Coming Soon"
            description="You will be able to see your friends' rankings here. Stay tuned!"
          />
        ) : leaderboard.length === 0 ? (
          <EmptyState
            icon={<Globe size={32} />}
            title="No Rankings Found"
            description="There are currently no users on the global leaderboard."
          />
        ) : (
          leaderboard.map((user, index) => {
            const isCurrentUser = currentUser?.id === user.id;

            return (
              <div
                key={user.id}
                className={styles.userRow}
                style={
                  isCurrentUser
                    ? {
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        borderLeft: '4px solid var(--color-primary)',
                      }
                    : {}
                }
              >
                <div className={styles.userInfo}>
                  <div className={styles.avatarContainer}>
                    <div className={styles.avatar}>
                      {user.avatar ? user.avatar : user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={`${styles.rankBadgeCircle} ${index < 3 ? styles.top3 : ''}`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className={styles.userDetails}>
                    <div className={styles.username}>
                      {user.username} {isCurrentUser && '(You)'}
                    </div>
                    <div className={styles.badgesWrapper}>
                      <div className={`${styles.rankBadge} ${styles[user.rank]}`}>
                        <Medal size={12} /> {user.rank}
                      </div>
                      <div className={styles.xpBadge}>
                        <Trophy size={12} /> {user.xp} XP
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.stats}>
                  {user.streak > 0 && (
                    <div className={`${styles.statItem} ${styles.streak}`}>
                      <Flame size={20} /> {user.streak}
                    </div>
                  )}
                  {!isCurrentUser && (
                    <div style={{ marginLeft: '4px' }}>
                      <Button variant="primary" size="sm">
                        Challenge
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
