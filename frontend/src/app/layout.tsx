import type { Metadata } from 'next';
import { Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HairDrama — Task Management',
  description: 'Luxury fashion task management for the HairDrama team',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${cormorant.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#f5f0eb',
                border: '1px solid #c9a84c',
                fontFamily: 'var(--font-cormorant)',
                fontSize: '14px',
                letterSpacing: '0.5px',
              },
              success: { iconTheme: { primary: '#c9a84c', secondary: '#0a0a0a' } },
              error: { iconTheme: { primary: '#e05a5a', secondary: '#0a0a0a' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
