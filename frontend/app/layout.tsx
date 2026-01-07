import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['100', '300', '400', '600', '800', '900'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Events Arena | The Prediction Platform',
  description: 'Forecast live match outcomes, earn status, and compete in the ultimate events arena. No gambling, pure skill.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  manifest: '/manifest.json', // Linked the PWA manifest
  themeColor: '#050505',
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
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
