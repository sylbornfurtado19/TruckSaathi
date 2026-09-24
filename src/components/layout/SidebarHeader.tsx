'use client';

import React, { useState } from 'react';
import { Sidebar, Header } from './LayoutShell';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Header collapsed={collapsed} />
      <main
        className={`flex-1 p-6 transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        <div className="mx-auto w-full max-w-[1440px] space-y-6">{children}</div>
      </main>
    </div>
  );
};
