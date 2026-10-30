'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, Header } from './LayoutShell';
import { RouteProgressBar } from './RouteProgressBar';
import { PageTransition } from './PageTransition';
import { ToastProvider } from '@/components/ui';
import { EmergencyBroadcastBanner } from './EmergencyBroadcastBanner';
import { isDriverRoute } from './RouteGuard';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isDriver = isDriverRoute(pathname);

  // Dedicated Mobile-First Shell for Driver Portal
  if (isDriver) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-brand-orange selection:text-white">
          <RouteProgressBar />
          <main className="flex-1 w-full">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </ToastProvider>
    );
  }

  // Management Fleet Command Layout Shell
  return (
    <ToastProvider>
      <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-brand-orange selection:text-white">
        <RouteProgressBar />
        <EmergencyBroadcastBanner />
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <Header
          collapsed={collapsed}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main
          className={`flex-1 p-4 sm:p-6 transition-all duration-200 ${
            collapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}
        >
          <div className="mx-auto w-full max-w-[1520px]">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
};
