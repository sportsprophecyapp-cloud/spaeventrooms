import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Outfit, Dancing_Script, Merriweather } from 'next/font/google';
import './globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider } from './context/AuthContext';
import { SponsorProvider } from './context/SponsorContext';
import { LanguageProvider } from './context/LanguageContext';
import { GlobalSocketProvider } from './context/GlobalSocketProvider';
import Navbar from './components/Navbar';
import LiveTicker from './components/LiveTicker/LiveTicker';
import ToastNotification from './components/ToastNotification/ToastNotification';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '300', '400', '600', '800', '900'],
  variable: '--font-outfit',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-dancing-script',
});

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  style: ['italic', 'normal'],
  variable: '--font-merriweather',
});

export const metadata: Metadata = {
  title: 'Events Arena | The Ultimate Fan Engagement & Prediction Platform',
  description: 'Join the ultimate second-screen experience. Forecast live match outcomes, earn status, and compete for prizes in the Events Arena. 100% free, pure skill.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://eventsarena.sportsprophecy.app'), // Replace with actual domain if different
  openGraph: {
    title: 'Events Arena | Predict & Win',
    description: 'Join the ultimate second-screen experience. Forecast live match outcomes, earn status, and compete for prizes. 100% free, pure skill.',
    url: 'https://eventsarena.sportsprophecy.app',
    siteName: 'Events Arena',
    images: [
      {
        url: '/assets/seo/hero-banner.png',
        width: 1200,
        height: 630,
        alt: 'Events Arena Hero Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events Arena | Predict & Win',
    description: 'Join the ultimate second-screen experience. Forecast live match outcomes, earn status, and compete for prizes.',
    images: ['/assets/seo/hero-banner.png'],
  },
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
      <body className={`${outfit.variable} ${dancingScript.variable} ${merriweather.variable} ${outfit.className}`}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HMLRZMY3PY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-HMLRZMY3PY');
          `}
        </Script>

        <GoogleOAuthProvider clientId="690358031158-n4e5sqsu936iega8rh9ge8f0kjikveht.apps.googleusercontent.com">
          <AuthProvider>
            <SponsorProvider>
              <GlobalSocketProvider>
                <LanguageProvider>
                  <Navbar />
                  <LiveTicker />
                  <ToastNotification />
                  {children}
                </LanguageProvider>
              </GlobalSocketProvider>
            </SponsorProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
