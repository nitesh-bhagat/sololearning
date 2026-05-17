import './globals.css';
import { NavigationLayout } from '../components/Navigation';

export const metadata = {
  title: 'Solo Learning - Level Up Your Skills',
  description: 'Gamified learning platform for Python, CS, Math, and Physics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavigationLayout>
          {children}
        </NavigationLayout>
      </body>
    </html>
  );
}
