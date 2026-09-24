'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Truck,
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  ShieldCheck,
  Settings,
  Route,
  Wrench,
  ShieldAlert,
  FileText,
  Fuel,
  DollarSign,
  Bot,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Plus,
  Cpu
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CommandPalette } from './CommandPalette';
import { NotificationsPanel } from './NotificationsPanel';

const getInitials = (name?: string) => {
  if (!name) return 'TS';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Sidebar: React.FC<{
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, signOut } = useApp();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const isDriver = currentUser?.role === 'Driver';

  // Professional categorized sections matching specification
  const managementSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Trips & Dispatch', href: '/trips', icon: Route },
        { name: 'Vehicles', href: '/vehicles', icon: Truck },
        { name: 'Drivers', href: '/drivers', icon: UserCheck }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { name: 'AI Dispatch', href: '/ai-dispatch', icon: Bot, isAi: true },
        { name: 'Predictive Maintenance', href: '/maintenance', icon: Wrench },
        { name: 'Fuel Monitoring', href: '/fuel', icon: Fuel },
        { name: 'Driver Safety', href: '/safety', icon: ShieldAlert }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Trip P&L', href: '/expenses', icon: DollarSign },
        { name: 'Reports', href: '/reports', icon: FileText }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { name: 'Company Profile', href: '/company', icon: Building2 },
        { name: 'Users', href: '/users', icon: Users },
        { name: 'Roles & RBAC', href: '/roles', icon: ShieldCheck },
        { name: 'Settings', href: '/settings', icon: Settings }
      ]
    }
  ];

  const driverSections = [
    {
      title: 'DRIVER OPERATIONS',
      items: [
        { name: 'Driver Field Portal', href: '/driver-portal', icon: Smartphone }
      ]
    }
  ];

  const sections = isDriver ? driverSections : managementSections;

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-50 bg-[#0c0f17]/95 backdrop-blur-2xl border-r border-white/[0.07] transition-all duration-200 flex flex-col ${
        collapsed ? 'w-[70px]' : 'w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-white/[0.07] justify-between">
        <Link href={isDriver ? '/driver-portal' : '/dashboard'} className="flex items-center gap-3 overflow-hidden group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/20 shrink-0">
            <div className="w-full h-full bg-[#0c0f17] rounded-[10px] flex items-center justify-center">
              <img
                src="/logo-dark.png"
                alt="TruckSaathi"
                className="w-5 h-5 object-contain filter brightness-125"
              />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wider text-white font-mono leading-none">
                TRUCK<span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">SAATHI</span>
              </span>
              <span className="text-[9px] font-mono text-cyan-400/80 font-bold tracking-widest mt-0.5">COMMAND OS</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Modules Stream */}
      <div className="flex-1 py-4 px-2.5 space-y-4 overflow-y-auto">
        {sections.map(section => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                {section.title}
              </div>
            )}
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              const isAiItem = Boolean('isAi' in item && (item as Record<string, unknown>).isAi);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent text-white font-bold border border-blue-500/30 shadow-md shadow-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? isAiItem
                          ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                          : 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]'
                        : isAiItem
                        ? 'text-cyan-500/70 group-hover:text-cyan-400'
                        : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {!collapsed && isAiItem ? (
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                      AI
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Live System Status Widget */}
      {!collapsed && (
        <div className="px-3.5 py-2.5 mx-3 mb-2 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between text-xs shadow-inner">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="font-mono text-slate-300 text-[11px] font-medium">
              {isDriver ? 'Road GPS Active' : 'Fleet Telemetry Live'}
            </span>
          </div>
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
        </div>
      )}

      {/* Tenant User Footer */}
      <div className="p-3 border-t border-white/[0.07] bg-[#090c13]/60">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div
            title={currentUser?.name ? `${currentUser.name} (${currentUser.companyName})` : 'Fleet User'}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/30 flex items-center justify-center font-mono font-bold text-xs text-white shrink-0 shadow-md shadow-blue-500/20"
          >
            {getInitials(currentUser?.name)}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate leading-tight">
                {currentUser?.name || 'Fleet Operator'}
              </span>
              <span className="text-[10px] text-slate-400 truncate flex items-center gap-1.5 font-mono mt-0.5">
                <span className="text-cyan-400 font-semibold">{currentUser?.role || 'Admin'}</span>
                <span>•</span>
                <span className="truncate">{currentUser?.companyName || 'TruckSaathi'}</span>
              </span>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export const Header: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const { currentUser } = useApp();
  const isDriver = currentUser?.role === 'Driver';
  const pathname = usePathname();
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return { section: 'OVERVIEW', page: 'Fleet Command Center' };
    if (pathname?.startsWith('/trips')) return { section: 'OPERATIONS', page: 'Trips & Dispatch Board' };
    if (pathname?.startsWith('/vehicles')) return { section: 'OPERATIONS', page: 'Vehicle Assets Registry' };
    if (pathname?.startsWith('/drivers')) return { section: 'OPERATIONS', page: 'Driver Directory' };
    if (pathname?.startsWith('/ai-dispatch')) return { section: 'INTELLIGENCE', page: 'AI Smart Auto-Dispatch' };
    if (pathname?.startsWith('/maintenance')) return { section: 'INTELLIGENCE', page: 'Predictive Maintenance' };
    if (pathname?.startsWith('/fuel')) return { section: 'INTELLIGENCE', page: 'Fuel & Anti-Theft Telemetry' };
    if (pathname?.startsWith('/safety')) return { section: 'INTELLIGENCE', page: 'Driver AI Safety Center' };
    if (pathname?.startsWith('/expenses')) return { section: 'FINANCE', page: 'Trip P&L & Settlement' };
    if (pathname?.startsWith('/reports')) return { section: 'FINANCE', page: 'Operational Reports' };
    if (pathname?.startsWith('/company')) return { section: 'ADMINISTRATION', page: 'Company Profile & Hubs' };
    if (pathname?.startsWith('/users')) return { section: 'ADMINISTRATION', page: 'User Management' };
    if (pathname?.startsWith('/roles')) return { section: 'ADMINISTRATION', page: 'Roles & RBAC Matrix' };
    if (pathname?.startsWith('/settings')) return { section: 'ADMINISTRATION', page: 'System Settings & Audit' };
    if (pathname?.startsWith('/driver-portal')) return { section: 'MOBILE FIELD', page: 'Driver Portal & POD' };
    return { section: 'FLEET-OS', page: 'Command Console' };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <>
      <header
        className={`sticky top-0 z-40 h-16 bg-[#0c0f17]/85 backdrop-blur-2xl border-b border-white/[0.07] transition-all duration-200 flex items-center justify-between px-6 ${
          collapsed ? 'ml-[70px]' : 'ml-[260px]'
        }`}
      >
        {/* Left: Breadcrumb Navigation */}
        <div className="flex items-center gap-2.5 text-xs font-medium">
          <span className="text-cyan-400 font-mono text-[10px] font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/25">
            {breadcrumb.section}
          </span>
          <span className="text-slate-600">/</span>
          <span className="font-bold text-white tracking-tight">{breadcrumb.page}</span>
        </div>

        {/* Center: Command Palette Trigger */}
        <div
          onClick={() => setIsCmdOpen(true)}
          className="hidden md:flex items-center w-80 relative cursor-pointer group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-cyan-400 transition-colors" />
          <input
            type="text"
            readOnly
            placeholder={isDriver ? 'Search driver portal or assigned trips...' : 'Search vehicles, drivers, trips (Ctrl+K)...'}
            className="w-full bg-white/[0.03] border border-white/[0.08] group-hover:border-white/[0.18] rounded-full text-xs text-white placeholder:text-slate-500 pl-9 pr-12 py-2 transition-all cursor-pointer shadow-inner"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/[0.1]">
            ⌘K
          </kbd>
        </div>

        {/* Right: Quick Action & Notification Controls */}
        <div className="flex items-center gap-3">
          {!isDriver && (
            <Link
              href="/trips"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Dispatch</span>
            </Link>
          )}

          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors border border-white/[0.08] cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
          </button>

          <div className="h-5 w-px bg-white/[0.08]" />

          {/* Organization Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-right font-mono text-xs">
            <span className="text-slate-300 font-semibold text-xs truncate max-w-[150px]">
              {currentUser?.companyName || 'TruckSaathi'}
            </span>
          </div>
        </div>
      </header>

      {/* Global Command Palette & Notifications Drawer */}
      <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
      <NotificationsPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

export const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0d13] text-slate-100 flex flex-col relative selection:bg-blue-600/30 selection:text-white">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Header collapsed={collapsed} />
      <main
        className={`flex-1 p-6 md:p-8 transition-all duration-200 ${
          collapsed ? 'ml-[70px]' : 'ml-[260px]'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};
