'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setUser } from '../../../store/slices/authSlice';
import { Card, Button, Skeleton, EmptyState } from '@sololearning/ui';
import { useToast } from '../../../components/ToastProvider';
import { User } from 'lucide-react';

// Simple preset avatars to choose from (emojis to avoid asset management for MVP)
const AVATAR_PRESETS = ['🤖', '🦊', '👽', '👻', '🐱', '🐼', '🦄', '🧙‍♂️'];

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const toast = useToast();

  if (isLoading) {
    return (
      <div
        className="animate-fade-in"
        style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}
      >
        <Skeleton height="150px" borderRadius="16px" style={{ marginBottom: '24px' }} />
        <Skeleton height="300px" borderRadius="16px" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <EmptyState
          icon={<User size={32} />}
          title="Login Required"
          description="Please login to view and manage your profile."
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
        setIsEditingAvatar(false);
        toast.success('Avatar updated successfully!');
      } else {
        toast.error('Failed to update avatar.');
      }
    } catch (err) {
      toast.error('Network error updating avatar.');
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <Card
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          padding: '32px',
          marginBottom: '32px',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
        >
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-background)',
              border: '4px solid var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px',
              boxShadow: '0 0 20px var(--color-primary-shadow)',
            }}
          >
            {user.avatar || user.username.charAt(0).toUpperCase()}
          </div>
          <Button variant="ghost" onClick={() => setIsEditingAvatar(!isEditingAvatar)}>
            Change Avatar
          </Button>
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 8px 0', color: 'var(--color-text)' }}>
            {user.username}
          </h1>
          <div style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
            {user.rank}
          </div>
          <div style={{ color: 'var(--color-text-light)', marginTop: '8px' }}>Joined recently</div>
        </div>
      </Card>

      {/* Avatar Selection Area */}
      {isEditingAvatar && (
        <Card
          style={{
            padding: '24px',
            marginBottom: '32px',
            backgroundColor: 'var(--color-background)',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Choose your Avatar</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {AVATAR_PRESETS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => handleAvatarSelect(avatar)}
                style={{
                  fontSize: '48px',
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  border:
                    user.avatar === avatar
                      ? '4px solid var(--color-primary)'
                      : '2px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
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
        </Card>
      )}

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
        }}
      >
        <Card
          style={{
            padding: '24px',
            textAlign: 'center',
            borderTop: '4px solid var(--color-warning)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⭐</div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 4px 0' }}>{user.xp}</h2>
          <div
            style={{
              color: 'var(--color-text-light)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            Total XP
          </div>
        </Card>

        <Card style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid #f97316' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔥</div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 4px 0' }}>{user.streak}</h2>
          <div
            style={{
              color: 'var(--color-text-light)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            Day Streak
          </div>
        </Card>

        <Card
          style={{
            padding: '24px',
            textAlign: 'center',
            borderTop: '4px solid var(--color-primary)',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛡️</div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 4px 0' }}>{user.badges?.length || 0}</h2>
          <div
            style={{
              color: 'var(--color-text-light)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            Badges Unlocked
          </div>
        </Card>
      </div>
    </div>
  );
}
