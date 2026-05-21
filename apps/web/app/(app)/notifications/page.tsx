'use client';

import React, { useState } from 'react';
import { Bell, Trophy, Swords, Users, TrendingUp, Info, Check, UserPlus } from 'lucide-react';
import styles from './notifications.module.css';

// Notification Types
type NotificationType =
  | 'ALL'
  | 'GENERAL'
  | 'ACHIEVEMENTS'
  | 'CHALLENGES'
  | 'FRIENDSHIP'
  | 'PROGRESS';

interface NotificationData {
  id: string;
  type: NotificationType;
  content: string;
  time: string;
  unread: boolean;
}

// Dummy Data
const NOTIFICATION_TYPES: NotificationType[] = [
  'GENERAL',
  'ACHIEVEMENTS',
  'CHALLENGES',
  'FRIENDSHIP',
  'PROGRESS',
];
const DUMMY_NOTIFICATIONS: NotificationData[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `${i + 1}`,
  type: NOTIFICATION_TYPES[i % NOTIFICATION_TYPES.length],
  content: `This is dummy notification number ${i + 1} to test the scroll behavior of the middle column. It belongs to the ${NOTIFICATION_TYPES[i % NOTIFICATION_TYPES.length]} category.`,
  time: `${i + 1} hours ago`,
  unread: i < 5,
}));

const RECOMMENDED_PEOPLE = [
  { id: 'p1', name: 'Alex Johnson', level: 'Level 12', avatar: '🦊' },
  { id: 'p2', name: 'Maria Garcia', level: 'Level 8', avatar: '🤖' },
  { id: 'p3', name: 'David Smith', level: 'Level 15', avatar: '🐱' },
];

const RECOMMENDED_COURSES = [
  { id: 'c1', name: 'Advanced Algorithms', category: 'Computer Science', icon: '💻' },
  { id: 'c2', name: 'Quantum Mechanics', category: 'Physics', icon: '⚛️' },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationType>('ALL');

  const filteredNotifications = DUMMY_NOTIFICATIONS.filter(
    (n) => activeTab === 'ALL' || n.type === activeTab,
  );

  const getTabIcon = (type: NotificationType) => {
    switch (type) {
      case 'ALL':
        return <Bell size={18} />;
      case 'GENERAL':
        return <Info size={18} />;
      case 'ACHIEVEMENTS':
        return <Trophy size={18} />;
      case 'CHALLENGES':
        return <Swords size={18} />;
      case 'FRIENDSHIP':
        return <Users size={18} />;
      case 'PROGRESS':
        return <TrendingUp size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  const getTabLabel = (type: NotificationType) => {
    switch (type) {
      case 'ALL':
        return 'All notifications';
      case 'GENERAL':
        return 'General';
      case 'ACHIEVEMENTS':
        return 'Achievements';
      case 'CHALLENGES':
        return 'Challenges';
      case 'FRIENDSHIP':
        return 'Friendship';
      case 'PROGRESS':
        return 'Progress';
      default:
        return '';
    }
  };

  const menuItems: NotificationType[] = [
    'ALL',
    'GENERAL',
    'ACHIEVEMENTS',
    'CHALLENGES',
    'FRIENDSHIP',
    'PROGRESS',
  ];

  return (
    <div className={styles.container}>
      {/* Left Column: Navigation Menu */}
      <div className={styles.leftColumn}>
        {menuItems.map((type) => (
          <button
            key={type}
            className={`${styles.menuItem} ${activeTab === type ? styles.active : ''}`}
            onClick={() => setActiveTab(type)}
          >
            <span className={styles.menuIcon}>{getTabIcon(type)}</span>
            {getTabLabel(type)}
          </button>
        ))}
      </div>

      {/* Middle Column: Notifications Area */}
      <div className={styles.middleColumn}>
        <div className={styles.middleHeader}>
          <h2>
            {activeTab === 'ALL' ? 'All Notifications' : `${getTabLabel(activeTab)} Notifications`}
          </h2>
        </div>
        <div className={styles.notificationsList}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationCard} ${notification.unread ? styles.unread : ''}`}
              >
                <div
                  className={`${styles.notificationIcon} ${styles[notification.type.toLowerCase()]}`}
                >
                  {getTabIcon(notification.type)}
                </div>
                <div className={styles.notificationContent}>
                  <p className={styles.notificationText}>{notification.content}</p>
                  <p className={styles.notificationTime}>{notification.time}</p>
                </div>
                {notification.unread && (
                  <div style={{ alignSelf: 'center', color: 'var(--primary-color)' }}>
                    <Check size={20} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <Bell size={48} className={styles.emptyStateIcon} />
              <p>No notifications found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Recommendations */}
      <div className={styles.rightColumn}>
        {/* Recommended People */}
        <div className={styles.recommendationSection}>
          <h3 className={styles.recommendationTitle}>Suggested Friends</h3>
          <div className={styles.recommendationList}>
            {RECOMMENDED_PEOPLE.map((person) => (
              <div key={person.id} className={styles.recommendationItem}>
                <div className={styles.avatar}>{person.avatar}</div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{person.name}</p>
                  <p className={styles.itemSub}>{person.level}</p>
                </div>
                <UserPlus size={18} style={{ color: 'var(--primary-color)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Courses */}
        <div className={styles.recommendationSection}>
          <h3 className={styles.recommendationTitle}>Suggested Courses</h3>
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
