'use client';

import React, { useState } from 'react';
import { Sidebar, Header } from './LayoutShell';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col">
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
        className={`flex-1 p-4 sm:p-6 transition-all duration-300 ${
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <div className="mx-auto w-full max-w-[1440px] space-y-6">{children}</div>
      </main>
    </div>
  );
};
