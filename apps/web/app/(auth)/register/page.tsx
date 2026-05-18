'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Button, Card, Input } from '@sololearning/ui';
import { setUser } from '../../../store/slices/authSlice';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      dispatch(setUser(data.user));
      router.push('/map/python');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Card style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
      <h1 style={{ margin: '0 0 24px 0', textAlign: 'center' }}>Create Account</h1>
      <form
        onSubmit={handleRegister}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nitesh@example.com"
          required
        />
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="nitesh_pro"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        {error && <div style={{ color: 'var(--color-danger)', fontSize: '14px' }}>{error}</div>}
        <Button variant="secondary" type="submit" fullWidth>
          Start Playing
        </Button>
      </form>
      <div
        style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--color-text-light)',
        }}
      >
        Already have an account?{' '}
        <a href="/login" style={{ color: 'var(--color-primary)' }}>
          Log in
        </a>
      </div>
    </Card>
  );
}
