'use client';

import React, { useState } from 'react';
import { Sidebar, Header } from './LayoutShell';
import { RouteProgressBar } from './RouteProgressBar';
import { PageTransition } from './PageTransition';
import { ToastProvider } from '@/components/ui';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-canvas text-text-primary flex flex-col">
        <RouteProgressBar />
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
