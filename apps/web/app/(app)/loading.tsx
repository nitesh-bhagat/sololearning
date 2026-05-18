import React from 'react';

export default function Loading() {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
        Loading...
      </div>
    </div>
  );
}
