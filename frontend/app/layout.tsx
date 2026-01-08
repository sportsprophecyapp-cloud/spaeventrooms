import type { Metadata, Viewport } from 'next'; // Import Viewport
import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['100', '300', '400', '600', '800', '900'],
  variable: '--font-outfit',
});

// METADATA (SEO & SOCIAL)
export const metadata: Metadata = {
  title: 'Events Arena | The Ultimate Fan Engagement & Prediction Platform',
  description: 'Join the ultimate second-screen experience. Forecast live match outcomes, earn status, and compete for prizes in the Events Arena. 100% free, pure skill.',
  manifest: '/manifest.json',
  keywords: ['sports predictions', 'live soccer calls', 'fan engagement', 'arena IQ', 'prize draws', 'soccer standings', 'events arena', 'sports prophecy'],
  authors: [{ name: 'Events Arena Team' }],
  openGraph: {
    title: 'Events Arena | Predict. Compete. Win.',
    description: 'The world\'s most engaging second-screen platform for live sports and creator events.',
    url: 'https://www.sportsprophecyapp.com',
    siteName: 'Events Arena',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events Arena | Predict. Compete. Win.',
    description: '100% free sports engagement platform for the ultimate fan experience.',
  },
};

// VIEWPORT & THEME (Modern Next.js Standard)
export const viewport: Viewport = {
  themeColor: '#050505',
  initialScale: 1,
  width: 'device-width',
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className={outfit.className}>
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
