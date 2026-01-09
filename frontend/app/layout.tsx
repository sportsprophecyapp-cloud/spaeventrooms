import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { GlobalSocketProvider } from './context/GlobalSocketProvider'; // NEW
import Navbar from './components/Navbar';

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['100', '300', '400', '600', '800', '900'],
  variable: '--font-outfit',
});

// ... (metadata and viewport remain the same)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className={outfit.className}>
        <AuthProvider>
          <GlobalSocketProvider> {/* NEW */}
            <LanguageProvider>
              <Navbar />
              {children}
            </LanguageProvider>
          </GlobalSocketProvider> {/* NEW */}
        </AuthProvider>
      </body>
    </html>
  );
}
