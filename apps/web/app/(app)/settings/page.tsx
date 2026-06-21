'use client';

import React, { useState } from 'react';
import { User, Bell, Lock, Palette, LogOut } from 'lucide-react';
import { Button } from '@sololearning/ui/src/components/button/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logoutUser } from '../../../store/slices/authSlice';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      dispatch(logoutUser());
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'Account', icon: User, label: 'Account' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Privacy', icon: Lock, label: 'Privacy' },
    { id: 'Appearance', icon: Palette, label: 'Appearance' },
  ];

  const renderToggle = (key: keyof typeof toggles) => {
    const isOn = toggles[key];
    return (
      <div
        className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
          isOn ? 'bg-primary' : 'bg-surface border border-border'
        }`}
        onClick={() => handleToggle(key)}
      >
        <motion.div
          className="w-6 h-6 bg-white rounded-full shadow-md"
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          animate={{ x: isOn ? 24 : 0 }}
        />
      </div>
    );
  };

  return (
    <div className="flex w-full min-h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-[30%] min-w-[300px] border-r border-border bg-surface p-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-text m-0 tracking-tight">Settings</h1>
          <p className="text-text-light text-sm">
            Manage your account preferences and configurations.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500 text-white border-b-4 border-emerald-900 hover:text-white'
                    : 'text-text-light hover:bg-white/5 hover:text-primary'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-bold"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-12 bg-background flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-surface/50 backdrop-blur-md border border-border rounded-[2rem] p-8 shadow-xl flex flex-col gap-8"
            >
              {activeTab === 'Notifications' && (
                <>
                  <h2 className="text-2xl font-bold text-text flex items-center gap-3 m-0">
                    <Bell className="text-primary" /> Notification Preferences
                  </h2>

                  <div className="flex justify-between items-center pb-6 border-b border-border/50">
                    <div className="flex flex-col gap-1">
                      <div className="text-lg font-bold text-text">Email Notifications</div>
                      <div className="text-sm text-text-light">
                        Receive daily updates and course reminders via email.
                      </div>
                    </div>
                    {renderToggle('emailNotifs')}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <div className="text-lg font-bold text-text">Push Notifications</div>
                      <div className="text-sm text-text-light">
                        Get instantly notified when someone challenges you.
                      </div>
                    </div>
                    {renderToggle('pushNotifs')}
                  </div>
                </>
              )}

              {activeTab === 'Privacy' && (
                <>
                  <h2 className="text-2xl font-bold text-text flex items-center gap-3 m-0">
                    <Lock className="text-primary" /> Privacy Settings
                  </h2>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <div className="text-lg font-bold text-text">Public Profile</div>
                      <div className="text-sm text-text-light">
                        Allow other users to see your ranking and activity.
                      </div>
                    </div>
                    {renderToggle('publicProfile')}
                  </div>
                </>
              )}

              {activeTab === 'Account' && (
                <>
                  <h2 className="text-2xl font-bold text-text flex items-center gap-3 m-0">
                    <User className="text-primary" /> Account Details
                  </h2>
                  <div className="text-text-light text-base">
                    Manage your password, linked accounts, and billing information here.
                  </div>
                  <div className="mt-4">
                    <Button variant="secondary" className="w-fit">
                      Change Password
                    </Button>
                  </div>
                </>
              )}

              {activeTab === 'Appearance' && (
                <>
                  <h2 className="text-2xl font-bold text-text flex items-center gap-3 m-0">
                    <Palette className="text-primary" /> Theme
                  </h2>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <div className="text-lg font-bold text-text">Dark Mode</div>
                      <div className="text-sm text-text-light">
                        Use the dark theme for the application.
                      </div>
                    </div>
                    {renderToggle('darkMode')}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
