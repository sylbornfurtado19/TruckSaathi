'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  Radio,
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
      className={`fixed top-0 left-0 bottom-0 z-50 bg-[#070c17] border-r border-[#19243a] transition-all duration-200 flex flex-col ${
        collapsed ? 'w-[68px]' : 'w-[250px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center px-3.5 border-b border-[#19243a] justify-between">
        <Link href={isDriver ? '/driver-portal' : '/dashboard'} className="flex items-center gap-2.5 overflow-hidden group">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/25 flex items-center justify-center shrink-0 shadow-sm group-hover:border-blue-500/50 transition-colors">
            <img
              src="/logo-dark.png"
              alt="TruckSaathi"
              className="w-5 h-5 object-contain filter brightness-125"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wider text-white font-mono leading-none">
                TRUCK<span className="text-blue-500">SAATHI</span>
              </span>
              <span className="text-[9px] font-mono text-slate-500 tracking-wider">COMMAND OS</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-[#121c2e] transition-colors cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Modules Stream */}
      <div className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {sections.map(section => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 pb-1 text-[9px] font-mono font-bold tracking-wider text-slate-500">
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
                  className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-blue-600/15 text-white border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f1728]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? isAiItem
                          ? 'text-cyan-400'
                          : 'text-blue-400'
                        : isAiItem
                        ? 'text-cyan-500/80 group-hover:text-cyan-400'
                        : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {!collapsed && isAiItem ? (
                    <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
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
        <div className="px-3 py-2.5 mx-2 mb-2 rounded-lg bg-[#0b1120] border border-[#182338] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="font-mono text-slate-300 text-[10px]">
              {isDriver ? 'Road GPS Active' : 'Fleet Telemetry Live'}
            </span>
          </div>
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
        </div>
      )}

      {/* Tenant User Footer */}
      <div className="p-2.5 border-t border-[#19243a] bg-[#060913]">
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <div
            title={currentUser?.name ? `${currentUser.name} (${currentUser.companyName})` : 'Fleet User'}
            className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-mono font-bold text-[11px] text-blue-400 shrink-0"
          >
            {getInitials(currentUser?.name)}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-200 truncate leading-tight">
                {currentUser?.name || 'Fleet Operator'}
              </span>
              <span className="text-[10px] text-slate-400 truncate flex items-center gap-1 font-mono">
                <span className="text-blue-400">{currentUser?.role || 'Admin'}</span>
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
              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
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
        className={`sticky top-0 z-40 h-14 bg-[#070c17]/90 backdrop-blur-md border-b border-[#19243a] transition-all duration-200 flex items-center justify-between px-5 ${
          collapsed ? 'ml-[68px]' : 'ml-[250px]'
        }`}
      >
        {/* Left: Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-slate-500 font-mono text-[10px] bg-[#0c1220] px-1.5 py-0.5 rounded border border-[#1b263b]">
            {breadcrumb.section}
          </span>
          <span className="text-slate-600">/</span>
          <span className="font-semibold text-slate-100">{breadcrumb.page}</span>
        </div>

        {/* Center: Command Palette Trigger */}
        <div
          onClick={() => setIsCmdOpen(true)}
          className="hidden md:flex items-center w-72 relative cursor-pointer group"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-blue-400 transition-colors" />
          <input
            type="text"
            readOnly
            placeholder={isDriver ? 'Search driver portal or assigned trips...' : 'Search vehicles, drivers, trips (Ctrl+K)...'}
            className="w-full bg-[#0c1220] border border-[#1c2840] group-hover:border-blue-500/40 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 pl-8 pr-12 py-1.5 transition-colors cursor-pointer"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 bg-[#121c2e] px-1.5 py-0.5 rounded border border-[#1f2d48]">
            ⌘K
          </kbd>
        </div>

        {/* Right: Quick Action & Notification Controls */}
        <div className="flex items-center gap-2.5">
          {!isDriver && (
            <Link
              href="/trips"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors shadow-sm shadow-blue-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Dispatch</span>
            </Link>
          )}

          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#0f1728] transition-colors border border-[#1c2840] cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </button>

          <div className="h-5 w-px bg-[#1c2840]" />

          {/* Organization Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-right font-mono text-xs">
            <span className="text-slate-300 font-medium text-[11px] truncate max-w-[140px]">
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
