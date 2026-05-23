'use client';

import React, { useState } from 'react';
import styles from './settings.module.css';
import { User, Bell, Lock, Palette } from 'lucide-react';
import { Button } from '@sololearning/ui/src/components/button/Button';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Account');
  const [toggles, setToggles] = useState({
    emailNotifs: true,
    pushNotifs: false,
    publicProfile: true,
    darkMode: true,
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences and configurations.</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <div
            className={`${styles.navItem} ${activeTab === 'Account' ? styles.active : ''}`}
            onClick={() => setActiveTab('Account')}
          >
            <User size={20} /> Account
          </div>
          <div
            className={`${styles.navItem} ${activeTab === 'Notifications' ? styles.active : ''}`}
            onClick={() => setActiveTab('Notifications')}
          >
            <Bell size={20} /> Notifications
          </div>
          <div
            className={`${styles.navItem} ${activeTab === 'Privacy' ? styles.active : ''}`}
            onClick={() => setActiveTab('Privacy')}
          >
            <Lock size={20} /> Privacy
          </div>
          <div
            className={`${styles.navItem} ${activeTab === 'Appearance' ? styles.active : ''}`}
            onClick={() => setActiveTab('Appearance')}
          >
            <Palette size={20} /> Appearance
          </div>
        </div>

        <div className={styles.content}>
          {activeTab === 'Notifications' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Bell className="text-blue-500" /> Notification Preferences
              </h2>

              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingName}>Email Notifications</div>
                  <div className={styles.settingDesc}>
                    Receive daily updates and course reminders via email.
                  </div>
                </div>
                <div
                  className={`${styles.toggle} ${toggles.emailNotifs ? styles.on : ''}`}
                  onClick={() => handleToggle('emailNotifs')}
                >
                  <div className={styles.toggleKnob} />
                </div>
              </div>

              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingName}>Push Notifications</div>
                  <div className={styles.settingDesc}>
                    Get instantly notified when someone challenges you.
                  </div>
                </div>
                <div
                  className={`${styles.toggle} ${toggles.pushNotifs ? styles.on : ''}`}
                  onClick={() => handleToggle('pushNotifs')}
                >
                  <div className={styles.toggleKnob} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Privacy' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Lock className="text-blue-500" /> Privacy Settings
              </h2>

              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingName}>Public Profile</div>
                  <div className={styles.settingDesc}>
                    Allow other users to see your ranking and activity.
                  </div>
                </div>
                <div
                  className={`${styles.toggle} ${toggles.publicProfile ? styles.on : ''}`}
                  onClick={() => handleToggle('publicProfile')}
                >
                  <div className={styles.toggleKnob} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Account' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <User className="text-blue-500" /> Account Details
              </h2>
              <div className="text-zinc-400">
                Manage your password, linked accounts, and billing information here.
              </div>
              <Button variant="secondary" style={{ width: 'fit-content', marginTop: '1rem' }}>
                Change Password
              </Button>
            </div>
          )}

          {activeTab === 'Appearance' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Palette className="text-blue-500" /> Theme
              </h2>
              <div className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingName}>Dark Mode</div>
                  <div className={styles.settingDesc}>Use the dark theme for the application.</div>
                </div>
                <div
                  className={`${styles.toggle} ${toggles.darkMode ? styles.on : ''}`}
                  onClick={() => handleToggle('darkMode')}
                >
                  <div className={styles.toggleKnob} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
