import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { GlobalSocketProvider } from './context/GlobalSocketProvider';
import Navbar from './components/Navbar';
import ToastNotification from './components/ToastNotification/ToastNotification';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '300', '400', '600', '800', '900'],
});

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
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
