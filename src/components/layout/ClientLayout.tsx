'use client';

import React from 'react';
import { AppProvider } from '@/context/AppContext';
import { RouteGuard } from '@/components/layout/RouteGuard';
import { MainLayout } from '@/components/layout/SidebarHeader';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <RouteGuard>
        <MainLayout>{children}</MainLayout>
      </RouteGuard>
    </AppProvider>
  );
}
