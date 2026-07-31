'use client';

import { AppProvider } from '@/context/AppContext';
import { MainLayout } from '@/components/layout/SidebarHeader';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <MainLayout>{children}</MainLayout>
    </AppProvider>
  );
}
