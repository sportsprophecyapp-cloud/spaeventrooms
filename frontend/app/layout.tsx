import type { Metadata } from 'next';
import { Outfit } from 'next/font/google'; // Changed to Outfit
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// Configuration for the gaming-themed font
const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['100', '300', '400', '600', '800', '900'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Sports Prophecy | The Prediction Arena',
  description: 'Forecast live match outcomes, earn status, and compete in the ultimate prophet arena. No gambling, pure skill.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0', // Prevent zoom on mobile inputs
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
