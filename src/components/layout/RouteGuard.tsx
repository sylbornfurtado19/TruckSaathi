'use client';

import React, { useEffect, useState } from 'react';
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
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Wait until initial auth check and profile load complete
    if (authLoading) {
      setIsAuthorized(false);
      return;
    }

    const isConfigured = isSupabaseConfigured();

    // 2. If Supabase is unconfigured (offline demo mode), allow access
    if (!isConfigured) {
      setIsAuthorized(true);
      return;
    }

    // 3. Authentication Check: if no session, redirect to /login
    if (!session) {
      setIsAuthorized(false);
      const redirectUrl = pathname && pathname !== '/' ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login';
      router.replace(redirectUrl);
      return;
    }

    // 4. Role Authorization Check
    const role = currentUser?.role;

    // Case A: Driver Role
    if (role === 'Driver') {
      if (isManagementRoute(pathname)) {
        // Drivers are strictly forbidden from accessing management routes
        setIsAuthorized(false);
        router.replace('/driver-portal');
        return;
      }
      setIsAuthorized(true);
      return;
    }

    // Case B: Management Roles (Super Admin, Company Admin, Fleet Manager, Dispatcher)
    if (isDriverRoute(pathname)) {
      // Management users must not be redirected into the Driver Portal
      setIsAuthorized(false);
      router.replace('/dashboard');
      return;
    }

    // Management users on management routes
    setIsAuthorized(true);
  }, [pathname, session, currentUser, authLoading, router]);

  // Loading state while checking authorization
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#060911] flex flex-col items-center justify-center p-4 select-none">
        <div className="flex flex-col items-center gap-4 text-center">
          <img
            src="/logo-dark.png"
            alt="TruckSaathi Logo"
            className="h-12 w-auto object-contain filter brightness-125 contrast-125 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse"
          />
          <div className="flex items-center gap-2 text-xs text-blue-400 font-mono bg-[#1c2333]/80 border border-[#2e374a] px-3.5 py-1.5 rounded-full">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>Verifying permissions...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
