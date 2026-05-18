import React from 'react';
import './globals.css';
import '@sololearning/ui/src/styles/global.css';
import { NavigationLayout } from '../components/Navigation';
import { ThemeProvider } from '../components/ThemeProvider';
import StoreProvider from '../components/StoreProvider';

export const metadata = {
  title: 'Solo Learning - Level Up Your Skills',
  description: 'Gamified learning platform for Python, CS, Math, and Physics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProvider>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <NavigationLayout>{children}</NavigationLayout>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
