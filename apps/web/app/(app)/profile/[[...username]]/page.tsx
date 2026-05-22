'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store';
import { setUser } from '../../../../store/slices/authSlice';
import { Button, Skeleton, EmptyState } from '@sololearning/ui';
import { useToast } from '../../../../components/ToastProvider';
import {
  User,
  Trophy,
  BookOpen,
  Star,
  CalendarDays,
  Swords,
  Shield,
  Flame,
  Medal,
  Award,
  UserPlus,
} from 'lucide-react';
import styles from './profile.module.css';

// Simple preset avatars to choose from (emojis to avoid asset management for MVP)
const AVATAR_PRESETS = ['🤖', '🦊', '👽', '👻', '🐱', '🐼', '🦄', '🧙‍♂️'];

// Dummy Timeline Data
const TIMELINE_EVENTS = [
  { id: '1', title: 'Joined SoloLearning', date: 'Oct 15, 2025', icon: User },
  { id: '2', title: 'Completed Python Basics', date: 'Oct 20, 2025', icon: BookOpen },
  { id: '3', title: 'Won first Arena Match', date: 'Nov 5, 2025', icon: Swords },
  { id: '4', title: 'Reached 10 Day Streak', date: 'Nov 15, 2025', icon: Flame },
];

// Dummy Achievements Data
const ACHIEVEMENTS = [
  {
    id: '1',
    title: 'Completed Course: Python Basics',
    desc: 'Mastered variables, loops, and functions.',
    icon: BookOpen,
  },
  {
    id: '2',
    title: 'Arena Champion',
    desc: 'Won an Arena Match against 3 opponents.',
    icon: Trophy,
  },
  {
    id: '3',
    title: 'Defended Challenge successfully',
    desc: 'Protected ranking points from a challenger.',
    icon: Shield,
  },
  {
    id: '4',
    title: 'Top 100 Leaderboard',
    desc: 'Broke into the top 100 global rankings.',
    icon: Medal,
  },
];

// Dummy Suggestions
const RECOMMENDED_PEOPLE = [
  { id: 'p1', name: 'Alex Johnson', level: 'Level 12', avatar: '🦊', username: 'alexj' },
  { id: 'p2', name: 'Maria Garcia', level: 'Level 8', avatar: '🤖', username: 'mariag' },
  { id: 'p3', name: 'David Smith', level: 'Level 15', avatar: '🐱', username: 'davids' },
];

const RECOMMENDED_COURSES = [
  { id: 'c1', name: 'Advanced Algorithms', category: 'Computer Science', icon: '💻' },
  { id: 'c2', name: 'Quantum Mechanics', category: 'Physics', icon: '⚛️' },
];

// Generate Calendar Data
const generateCalendarData = () => {
  const weeks = 20;
  const daysPerWeek = 7;
  const grid = [];

  for (let c = 0; c < weeks; c++) {
    for (let r = 0; r < daysPerWeek; r++) {
      // Randomly assign activity levels 0-4
      const level = Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0;
      grid.push({ col: c, row: r, level });
    }
  }
  return grid;
};

export default function ProfilePage() {
  const params = useParams();
  const usernameParam = params.username?.[0];
  const {
    user: currentUser,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [displayUser, setDisplayUser] = useState<any>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const toast = useToast();

  const isCurrentUser = !usernameParam || usernameParam === currentUser?.username;

  // Use useMemo in real app, but for dummy it's fine
  const calendarData = React.useMemo(() => generateCalendarData(), []);

  useEffect(() => {
    if (isAuthLoading) return;

    if (isCurrentUser) {
      if (currentUser) {
        setDisplayUser({
          ...currentUser,
          followersCount: 15,
          followingCount: 20,
          bio: 'Lifelong learner, coding enthusiast. Always ready for a challenge!',
        });
      }
    } else if (usernameParam) {
      setIsFetchingUser(true);
      fetch(`/api/users/${usernameParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          } else {
            setDisplayUser(data);
          }
        })
        .finally(() => setIsFetchingUser(false));
    }
  }, [usernameParam, isCurrentUser, currentUser, isAuthLoading, toast]);

  if (isAuthLoading || isFetchingUser) {
    return (
      <div className={`${styles.container} animate-fade-in`}>
        <Skeleton height="80vh" borderRadius="16px" />
      </div>
    );
  }

  if (!isAuthenticated || !displayUser) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center' }}>
        <EmptyState
          icon={<User size={48} />}
          title="User Not Found"
          description="We couldn't find the requested profile or you need to login."
          action={
            <Button variant="primary" onClick={() => (window.location.href = '/login')}>
              Go to Login
            </Button>
          }
        />
      </div>
    );
  }

  const handleAvatarSelect = async (avatar: string) => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar }),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        dispatch(setUser(data.user));
        setDisplayUser({ ...displayUser, avatar });
        setIsEditingAvatar(false);
        toast.success('Avatar updated successfully!');
      } else {
        toast.error('Failed to update avatar.');
      }
    } catch (err) {
      toast.error('Network error updating avatar.');
    }
  };

  const handleFollowToggle = async () => {
    if (!displayUser || isCurrentUser) return;
    try {
      if (
        displayUser.friendshipStatus === 'friends' ||
        displayUser.friendshipStatus === 'pending_sent'
      ) {
        // Unfollow / Cancel
        const endpoint = displayUser.friendshipStatus === 'friends' ? 'remove' : 'decline';
        await fetch(`/api/friends/${endpoint}/${displayUser.friendshipId || displayUser.id}`, {
          method: 'POST',
        });
        setDisplayUser({
          ...displayUser,
          friendshipStatus: 'none',
          followersCount:
            displayUser.followersCount - (displayUser.friendshipStatus === 'friends' ? 1 : 0),
        });
        toast.success(
          displayUser.friendshipStatus === 'friends' ? 'Unfollowed user' : 'Request cancelled',
        );
      } else {
        // Follow
        const res = await fetch(`/api/friends/request/${displayUser.username}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setDisplayUser({
            ...displayUser,
            friendshipStatus: 'pending_sent',
            friendshipId: data.friendship.id,
          });
          toast.success('Follow request sent');
        } else {
          toast.error(data.error || 'Failed to send request');
        }
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Column: Account Timeline */}
      <div className={styles.leftColumn}>
        {/* Removed sectionCard class to remove container background and borders */}
        <div>
          <h3 className={styles.sectionTitle}>Account Timeline</h3>
          <div className={styles.timeline}>
            {TIMELINE_EVENTS.map((event) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>
                    <Icon size={14} />
                  </div>
                  <div className={styles.timelineContent}>
                    <p className={styles.timelineTitle}>{event.title}</p>
                    <p className={styles.timelineDate}>{event.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Middle Column: Profile & Stats */}
      <div className={styles.middleColumn}>
        {/* Profile Header */}
        <div className={styles.sectionCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatar}>
                {displayUser.avatar || displayUser.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className={styles.profileInfo}>
              <h1 className={styles.username}>{displayUser.username}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                <div className={styles.rank}>{displayUser.rank}</div>
                <div style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    {displayUser.followingCount || 0}
                  </span>{' '}
                  Following
                </div>
                <div style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                    {displayUser.followersCount || 0}
                  </span>{' '}
                  Followers
                </div>
              </div>
              <div
                style={{
                  color: 'var(--color-text-light)',
                  marginTop: '12px',
                  fontSize: '0.95rem',
                  lineHeight: '1.4',
                }}
              >
                {displayUser.bio || 'Active Learner'}
              </div>
              <div style={{ marginTop: '16px' }}>
                {isCurrentUser ? (
                  <Button variant="primary" onClick={() => setIsEditingAvatar(!isEditingAvatar)}>
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant={
                      displayUser.friendshipStatus === 'friends' ||
                      displayUser.friendshipStatus === 'pending_sent'
                        ? 'secondary'
                        : 'primary'
                    }
                    onClick={handleFollowToggle}
                  >
                    {displayUser.friendshipStatus === 'friends'
                      ? 'Unfollow'
                      : displayUser.friendshipStatus === 'pending_sent'
                        ? 'Requested'
                        : 'Follow'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Selection Area */}
        {isEditingAvatar && isCurrentUser && (
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Choose your Avatar</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {AVATAR_PRESETS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => handleAvatarSelect(avatar)}
                  style={{
                    fontSize: '40px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    border:
                      displayUser.avatar === avatar
                        ? '3px solid var(--color-primary)'
                        : '2px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard} style={{ borderTop: '4px solid var(--color-warning)' }}>
            <div className={styles.statIcon}>⭐</div>
            <h2 className={styles.statValue}>{displayUser.xp}</h2>
            <div className={styles.statLabel}>Total XP</div>
          </div>
          <div className={styles.statCard} style={{ borderTop: '4px solid #f97316' }}>
            <div className={styles.statIcon}>🔥</div>
            <h2 className={styles.statValue}>{displayUser.streak}</h2>
            <div className={styles.statLabel}>Day Streak</div>
          </div>
          <div className={styles.statCard} style={{ borderTop: '4px solid var(--color-primary)' }}>
            <div className={styles.statIcon}>🛡️</div>
            <h2 className={styles.statValue}>{displayUser.badges?.length || 0}</h2>
            <div className={styles.statLabel}>Badges Unlocked</div>
          </div>
        </div>

        {/* Streak Calendar */}
        <div className={styles.sectionCard}>
          <h3
            className={styles.sectionTitle}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <CalendarDays size={18} /> Activity Graph
          </h3>
          <div className={styles.calendarWrapper}>
            <div className={styles.calendarGrid}>
              {calendarData.map((cell, idx) => (
                <div
                  key={idx}
                  className={`${styles.calendarDay} ${cell.level > 0 ? styles[`level-${cell.level}`] : ''}`}
                  title={`${cell.level} contributions`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Feed */}
        <div className={styles.sectionCard}>
          <h3
            className={styles.sectionTitle}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Award size={18} /> Recent Achievements
          </h3>
          <div className={styles.achievementsList}>
            {ACHIEVEMENTS.map((ach) => {
              const Icon = ach.icon;
              return (
                <div key={ach.id} className={styles.achievementItem}>
                  <div className={styles.achievementIcon}>
                    <Icon size={20} />
                  </div>
                  <div className={styles.achievementInfo}>
                    <p className={styles.achievementTitle}>{ach.title}</p>
                    <p className={styles.achievementDesc}>{ach.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Recommendations */}
      <div className={styles.rightColumn}>
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Suggested Friends</h3>
          <div className={styles.recommendationList}>
            {RECOMMENDED_PEOPLE.map((person) => (
              <Link
                href={`/profile/${person.username}`}
                key={person.id}
                style={{ textDecoration: 'none' }}
              >
                <div className={styles.recommendationItem}>
                  <div className={styles.recAvatar}>{person.avatar}</div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{person.name}</p>
                    <p className={styles.itemSub}>{person.level}</p>
                  </div>
                  <UserPlus size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Suggested Courses</h3>
          <div className={styles.recommendationList}>
            {RECOMMENDED_COURSES.map((course) => (
              <div key={course.id} className={styles.recommendationItem}>
                <div className={styles.courseIcon}>{course.icon}</div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{course.name}</p>
                  <p className={styles.itemSub}>{course.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
