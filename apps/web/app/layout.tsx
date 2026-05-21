import React from 'react';
import './globals.css';
import '@sololearning/ui/src/styles/global.css';
import { NavigationLayout } from '../components/Navigation';
import StoreProvider from '../components/StoreProvider';
import { SocketProvider } from '../components/socketContext';
import { ChallengeOverlay } from '../components/ChallengeOverlay';

export const metadata = {
  title: 'Solo Learning - Level Up Your Skills',
  description: 'Gamified learning platform for Python, CS, Math, and Physics',
};

import { ToastProvider } from '../components/ToastProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProvider>
          <SocketProvider>
            <ToastProvider>
              <ChallengeOverlay />
              <NavigationLayout>{children}</NavigationLayout>
            </ToastProvider>
          </SocketProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
