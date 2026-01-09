import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css'; // This is the most important line.

import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { GlobalSocketProvider } from './context/GlobalSocketProvider';
import Navbar from './components/Navbar';
import ToastNotification from './components/ToastNotification/ToastNotification';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '300', '400', '600', '800', '900'],
  variable: '--font-outfit',
});

// SEO Metadata is correct and will be preserved.
export const metadata: Metadata = {
  title: 'Free Soccer Predictions & Prize Draws | Events Arena - Sports Prophecy',
  description: 'Join Events Arena for 100% free soccer predictions, multi-prop picks, and prize draws. No gambling – just fun skill-based tips for Liga 1, Thai League, EPL & more. Start predicting now!',
  // ... other metadata
};

export const viewport: Viewport = {
  // ... viewport settings
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
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
