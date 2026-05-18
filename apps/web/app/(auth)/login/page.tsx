'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Button, Card, Input } from '@sololearning/ui';
import { setUser } from '../../../store/slices/authSlice';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
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
      <h1 style={{ margin: '0 0 24px 0', textAlign: 'center' }}>Welcome Back</h1>
      <form
        onSubmit={handleLogin}
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
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        {error && <div style={{ color: 'var(--color-danger)', fontSize: '14px' }}>{error}</div>}
        <Button variant="primary" type="submit" fullWidth>
          Log In
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
        Don&apos;t have an account?{' '}
        <Link href="/register" style={{ color: 'var(--color-primary)' }}>
          Register here
        </Link>
      </div>
    </Card>
  );
}
