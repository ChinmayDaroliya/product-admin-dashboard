import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ProductStoreProvider } from '@/context/ProductStoreContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Product Admin Dashboard',
  description: 'Manage your product catalog.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-bg font-sans text-ink-900 antialiased">
        <ToastProvider>
          <AuthProvider>
            <ProductStoreProvider>{children}</ProductStoreProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
