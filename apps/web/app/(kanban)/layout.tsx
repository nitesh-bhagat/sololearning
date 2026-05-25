import React from 'react';

export default function KanbanLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-text font-sans">{children}</div>;
}
