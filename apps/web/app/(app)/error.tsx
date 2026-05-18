'use client';

import { useEffect } from 'react';
import { Button } from '@sololearning/ui';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px',
      }}
    >
      <h2>Something went wrong in the app!</h2>
      <Button variant="danger" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
