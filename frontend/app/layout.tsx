import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css'; // This import is critical.

import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { GlobalSocketProvider } from './context/GlobalSocketProvider';
import Navbar from './components/Navbar';
import ToastNotification from './components/ToastNotification/ToastNotification';

// Correctly configure the font object.
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '300', '400', '600', '800', '900'],
  variable: '--font-outfit', // Expose as a CSS variable.
});

// The metadata object is preserved as it was correct.
export const metadata: Metadata = {
  title: 'Events Arena | The Ultimate Fan Engagement & Prediction Platform',
  description: 'Join the ultimate second-screen experience. Forecast live match outcomes, earn status, and compete for prizes in the Events Arena. 100% free, pure skill.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#050505',
  initialScale: 1,
  width: 'device-width',
  maximumScale: 1,
  userScalable: false,
};

// The RootLayout with the definitive, correct structure.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <AuthProvider>
          <GlobalSocketProvider>
            <LanguageProvider>
              <Navbar />
              <ToastNotification />
              {children}
            </LanguageProvider>
          </GlobalSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
