'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();

  // Middleware already blocks the initial request server-side. This is a
  // client-side backstop for the case where the token cookie gets cleared
  // during an active session (e.g. the axios 401 interceptor fires) -
  // without a full page reload we still want to bounce to /login.
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isInitializing, isAuthenticated, router]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-500">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <AppShell>{children}</AppShell>;
}
