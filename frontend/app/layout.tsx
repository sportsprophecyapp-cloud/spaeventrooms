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
  variable: '--font-outfit',
});

// SEO UPDATE (Phase 1): New Title and Description
export const metadata: Metadata = {
  title: 'Free Soccer Predictions & Prize Draws | Events Arena - Sports Prophecy',
  description: 'Join Events Arena for 100% free soccer predictions, multi-prop picks, and prize draws. No gambling – just fun skill-based tips for Liga 1, Thai League, EPL & more. Start predicting now!',
  metadataBase: new URL('https://www.sportsprophecyapp.com'), // Ensures canonical is correct
  alternates: {
    canonical: '/',
  },
  keywords: ['free soccer predictions', 'Liga 1 tips', 'Thai League predictions', 'Bali United predictions', 'free football picks', 'no gambling', 'events arena', 'sports prophecy'],
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
