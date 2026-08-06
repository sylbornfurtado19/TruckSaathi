'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Truck,
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Plus
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Sidebar: React.FC<{
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const { currentUser } = useApp();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', href: '/vehicles', icon: Truck },
    { name: 'Drivers', href: '/drivers', icon: UserCheck },
    { name: 'Company Profile', href: '/company', icon: Building2 },
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'Roles & Permissions', href: '/roles', icon: ShieldCheck },
    { name: 'System Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-50 bg-[#0c1019] border-r border-[#202736] transition-all duration-300 flex flex-col ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#202736] justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <img
            src="/logo-dark.png"
            alt="TruckSaathi Logo"
            className={`${collapsed ? 'h-8 w-8 object-contain object-left' : 'h-8 w-auto object-contain'}`}
          />
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1c2333] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Platform Modules
          </div>
        )}
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 font-medium border-l-2 border-blue-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#1c2333]/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-slate-200'}`} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Tenant Footer */}
      <div className="p-3 border-t border-[#202736] bg-[#090d16]/50">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-semibold text-xs text-slate-200 shrink-0">
            SF
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-slate-200 truncate">{currentUser.name}</span>
              <span className="text-[11px] text-slate-500 truncate">{currentUser.companyName}</span>
            </div>
          )}
          {!collapsed && (
            <Link href="/login" className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
};

export const Header: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const { currentUser } = useApp();
  const pathname = usePathname();

  const getBreadcrumb = () => {
    if (pathname === '/dashboard') return 'Dashboard / Overview';
    if (pathname?.startsWith('/vehicles')) return 'Fleet Assets / Vehicles Registry';
    if (pathname?.startsWith('/drivers')) return 'Human Capital / Driver Directory';
    if (pathname?.startsWith('/company')) return 'Organization / Company Profile';
    if (pathname?.startsWith('/users')) return 'Administration / User Management';
    if (pathname?.startsWith('/roles')) return 'Security / Roles & RBAC Matrix';
    if (pathname?.startsWith('/settings')) return 'System / Settings & Audit Logs';
    return 'Platform';
  };

  return (
    <header
      className={`sticky top-0 z-40 h-16 bg-[#090d16]/80 backdrop-blur-md border-b border-[#202736] transition-all duration-300 flex items-center justify-between px-6 ${
        collapsed ? 'ml-[72px]' : 'ml-[260px]'
      }`}
    >
      {/* Left Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="text-slate-500 font-mono text-xs">TRUCKSAATHI</span>
        <span className="text-slate-600">/</span>
        <span className="font-medium text-slate-200">{getBreadcrumb()}</span>
      </div>

      {/* Center Search Palette Trigger */}
      <div className="hidden md:flex items-center w-80 relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search vehicles, drivers, plates (Ctrl+K)..."
          className="w-full bg-[#121824] border border-[#202736] focus:border-blue-500 focus:outline-none rounded-lg text-xs text-slate-200 placeholder:text-slate-500 pl-9 pr-8 py-2 transition-all"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 bg-[#1c2333] px-1.5 py-0.5 rounded border border-[#2e374a]">
          ⌘K
        </kbd>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <Link
          href="/vehicles"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg transition-all shadow-md shadow-blue-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Asset</span>
        </Link>

        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#1c2333] transition-colors border border-[#202736]">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        </button>

        <div className="h-6 w-px bg-[#202736]"></div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">{currentUser.companyName}</div>
            <div className="text-[10px] text-slate-500 font-mono">GSTIN: 27AAAAA0000A1Z5</div>
          </div>
        </div>
      </div>
    </header>
  );
};
