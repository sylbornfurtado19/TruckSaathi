'use client';

import React, { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export const MANAGEMENT_ROUTES = [
  '/',
  '/dashboard',
  '/trips',
  '/ai-dispatch',
  '/vehicles',
  '/maintenance',
  '/fuel',
  '/expenses',
  '/drivers',
  '/safety',
  '/reports',
  '/company',
  '/users',
  '/roles',
  '/settings',
];

export const DRIVER_ROUTES = [
  '/driver-portal',
];

export function isManagementRoute(pathname: string): boolean {
  return (
    pathname === '/' ||
    MANAGEMENT_ROUTES.some(r => r !== '/' && (pathname === r || pathname.startsWith(`${r}/`)))
  );
}

export function isDriverRoute(pathname: string): boolean {
  return DRIVER_ROUTES.some(r => pathname === r || pathname.startsWith(`${r}/`));
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { session, currentUser, authLoading } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const isConfigured = isSupabaseConfigured();

  // Purely derive authorization status synchronously
  const isAuthorized = useMemo(() => {
    if (authLoading) return false;
    if (!isConfigured) return true;
    if (!session) return false;

    const role = currentUser?.role;
    if (role === 'Driver') {
      return !isManagementRoute(pathname);
    }
    if (isDriverRoute(pathname)) {
      return false;
    }
    return true;
  }, [authLoading, isConfigured, session, currentUser?.role, pathname]);

  // Handle side-effect navigation redirects only
  useEffect(() => {
    if (authLoading || !isConfigured) return;

    if (!session) {
      const redirectUrl = pathname && pathname !== '/' ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login';
      router.replace(redirectUrl);
      return;
    }

    const role = currentUser?.role;
    if (role === 'Driver' && isManagementRoute(pathname)) {
      router.replace('/driver-portal');
      return;
    }

    if (role !== 'Driver' && isDriverRoute(pathname)) {
      router.replace('/dashboard');
      return;
    }
  }, [pathname, session, currentUser?.role, authLoading, isConfigured, router]);

  // Loading state while checking authorization
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen select-none flex-col items-center justify-center bg-canvas p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <img
            src="/logo-dark.png"
            alt="TruckSaathi Logo"
            className="h-12 w-auto object-contain"
          />
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3.5 py-1.5 font-mono text-xs text-text-secondary">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>Verifying permissions...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
