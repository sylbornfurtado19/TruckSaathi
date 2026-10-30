'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, Header } from './LayoutShell';
import { RouteProgressBar } from './RouteProgressBar';
import { PageTransition } from './PageTransition';
import { ToastProvider } from '@/components/ui';
import { EmergencyBroadcastBanner } from './EmergencyBroadcastBanner';
import { isDriverRoute } from './RouteGuard';
import { useApp } from '@/context/AppContext';
import { LogOut, ArrowLeftRight } from 'lucide-react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, signOut } = useApp();
  const isDriver = isDriverRoute(pathname);

  // Dedicated Mobile-First Shell for Driver Portal
  if (isDriver) {
    const handleLogout = async () => {
      await signOut();
      router.push('/login');
    };

    return (
      <ToastProvider>
        <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-brand-orange selection:text-white">
          <RouteProgressBar />
          <EmergencyBroadcastBanner />

          {/* Dedicated Mobile Pilot Top App Bar with Prominent Logout */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#050b14]/90 px-4 backdrop-blur-xl shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange text-black font-black text-sm shadow-glow-orange/30">
                TS
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-wider text-white">TRUCKSAATHI</span>
                <span className="rounded bg-brand-orange/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand-orange border border-brand-orange/30">
                  PILOT HUD
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser && currentUser.role !== 'Driver' && (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/50 transition-colors cursor-pointer"
                  title="Return to Management Dashboard"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Fleet Command</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30 hover:text-white transition-all cursor-pointer shadow-sm active:scale-98"
                title="Sign Out of TruckSaathi"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </header>

          <main className="flex-1 w-full p-2 sm:p-4">
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
