'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Bot,
  Building2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Fuel,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Route,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Truck,
  UserCheck,
  Users,
  Wrench,
  Radio,
  Clock
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CommandPalette } from './CommandPalette';
import { NotificationsPanel } from './NotificationsPanel';
import { Button, focusRing } from '@/components/ui';

const getInitials = (name?: string) => {
  if (!name) return 'TS';
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const adminSections = [
  {
    title: 'Operations Deck',
    items: [
      { name: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Trips & Dispatch', href: '/trips', icon: Route },
      { name: 'AI Smart Dispatch', href: '/ai-dispatch', icon: Bot }
    ]
  },
  {
    title: 'Fleet Assets',
    items: [
      { name: 'Live Vehicles', href: '/vehicles', icon: Truck },
      { name: 'Drivers Directory', href: '/drivers', icon: UserCheck },
      { name: 'Maintenance & Health', href: '/maintenance', icon: Wrench },
      { name: 'Fuel Telematics', href: '/fuel', icon: Fuel }
    ]
  },
  {
    title: 'Safety & P&L',
    items: [
      { name: 'Trip Expenses & P&L', href: '/expenses', icon: DollarSign },
      { name: 'AI Safety Center', href: '/safety', icon: ShieldAlert },
      { name: 'Analytics & Reports', href: '/reports', icon: FileText }
    ]
  },
  {
    title: 'Enterprise Admin',
    items: [
      { name: 'Company Profile', href: '/company', icon: Building2 },
      { name: 'User Management', href: '/users', icon: Users },
      { name: 'Roles & Access', href: '/roles', icon: ShieldCheck },
      { name: 'System Settings', href: '/settings', icon: Settings }
    ]
  }
];

const driverSections = [
  {
    title: 'Driver Cockpit',
    items: [
      { name: 'Active Trip & Cockpit', href: '/driver-portal', icon: Smartphone },
      { name: 'Route & Corridor', href: '/driver-portal#route', icon: Route },
      { name: 'Vehicle Telemetry', href: '/driver-portal#vehicle-health', icon: Wrench },
      { name: 'POD & LR Scanner', href: '/driver-portal#pod-upload', icon: FileText },
      { name: 'Emergency Assistance', href: '/driver-portal#sos', icon: ShieldAlert }
    ]
  }
];

export const Sidebar: React.FC<{
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (value: boolean) => void;
}> = ({ collapsed, setCollapsed, mobileOpen = false, setMobileOpen = () => {} }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, signOut, simState } = useApp();

  const isDriver = currentUser?.role === 'Driver';
  const isFleetManager = currentUser?.role === 'Fleet Manager';
  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const visibleSections = isDriver
    ? driverSections
    : isFleetManager
    ? adminSections.filter(s => s.title !== 'Enterprise Admin')
    : adminSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-[#090d16] text-text-primary transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header with single logo & collapse button */}
        <div className="flex h-14 items-center justify-between border-b border-border/80 px-3.5">
          <Link
            href={isDriver ? '/driver-portal' : '/dashboard'}
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-2.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface border border-white/10 shadow-sm p-1">
              <img src="/logo-dark.png" alt="TruckSaathi" className="h-full w-full object-contain" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex flex-col">
                <span className="font-mono text-sm font-black tracking-tight text-white">
                  TRUCK<span className="text-brand-orange">SAATHI</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted truncate">
                  {isDriver ? 'Driver Cockpit' : 'Command Center'}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex rounded-md p-1.5 text-text-muted hover:bg-surface-muted hover:text-white transition-colors cursor-pointer"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Live Operational Status Strip in Sidebar */}
        {!collapsed && (
          <div className="border-b border-border/60 bg-surface-muted/40 px-4 py-2 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isDriver ? 'Cockpit Connected' : 'Telemetry Linked'}</span>
            </span>
            <span className="font-mono text-text-muted text-[10px]">
              {isDriver ? simState.vehicleReg : '24 Units'}
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-2.5 py-4">
          {visibleSections.map(section => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <div className="px-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  {section.title}
                </div>
              )}
              {section.items.map(item => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    item.href !== '/driver-portal' &&
                    pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.name : undefined}
                    className={`relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-xs font-semibold transition-all duration-150 ${
                      active
                        ? 'bg-brand-orange text-white shadow-sm'
                        : 'text-text-secondary hover:bg-surface-muted hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Profile */}
        <div className="border-t border-border/80 p-3 bg-surface-muted/20">
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div
              className="flex items-center gap-2.5 min-w-0 flex-1 rounded-lg p-1 text-left"
              title={currentUser?.email || currentUser?.name || 'Logged in user'}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface border border-border text-xs font-bold text-brand-orange shadow-xs">
                {getInitials(currentUser?.name)}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white">
                    {currentUser?.name || (isDriver ? 'Ramesh Kumar' : 'Fleet Operator')}
                  </p>
                  <p className="truncate text-[11px] font-medium text-text-muted">
                    {currentUser?.role === 'Company Admin'
                      ? 'Enterprise Admin'
                      : currentUser?.role || 'Fleet Operator'}
                  </p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-text-muted hover:bg-surface-muted hover:text-rose-400 transition-colors cursor-pointer"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export const Header: React.FC<{
  collapsed: boolean;
  onOpenMobile?: () => void;
}> = ({ collapsed, onOpenMobile = () => {} }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, signOut, simState } = useApp();
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isDriver = currentUser?.role === 'Driver';

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(value => !value);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <>
      <header
        className={`sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-[#090d16]/90 backdrop-blur-md px-4 transition-all duration-200 sm:px-6 ${
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* Left Side: Mobile toggle + Breadcrumb / Title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onOpenMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted hover:bg-surface-muted hover:text-white lg:hidden cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          {isDriver ? (
            <div className="min-w-0 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <p className="truncate text-xs font-bold text-white tracking-tight">
                  Driver Cockpit • <span className="font-mono text-cyan-400">{simState.vehicleReg}</span>
                </p>
                <p className="hidden text-[11px] text-text-muted sm:block">
                  Live Run #{simState.tripCode} • {simState.currentCheckpoint}
                </p>
              </div>
            </div>
          ) : (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-white tracking-tight">
                  Fleet Command Center
                </p>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Fleet Link
                </span>
              </div>
              <p className="hidden text-[11px] text-text-muted sm:block">
                {currentUser?.companyName || 'Mahindra Logistics India'} • Active Control Deck
              </p>
            </div>
          )}
        </div>

        {/* Center: Command Palette Trigger (Hidden for Driver to maintain clean cockpit focus) */}
        {!isDriver && (
          <div className="hidden w-full max-w-xs md:block">
            <button
              onClick={() => setCommandOpen(true)}
              className={`flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-left text-xs text-text-muted hover:border-border/80 transition-colors ${focusRing}`}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1 truncate">Search vehicles, drivers, trips...</span>
              <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-mono">
                Ctrl K
              </kbd>
            </button>
          </div>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {!isDriver && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={<Bot className="h-4 w-4 text-cyan-400" />}
                className="hidden sm:inline-flex text-xs font-semibold"
                onClick={() => router.push('/ai-dispatch')}
              >
                Ask AI
              </Button>

              <Link href="/trips" className="hidden sm:inline-flex">
                <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} className="text-xs">
                  New dispatch
                </Button>
              </Link>
            </>
          )}

          {/* Notifications */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative rounded-lg p-2 text-text-secondary hover:bg-surface hover:text-white transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-orange ring-2 ring-[#090d16]" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(value => !value)}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-surface transition-colors cursor-pointer"
              aria-label="Open profile menu"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-border text-xs font-bold text-brand-orange">
                {getInitials(currentUser?.name)}
              </span>
              <span className="hidden max-w-32 truncate text-xs font-semibold text-text-primary lg:block">
                {currentUser?.name || (isDriver ? 'Ramesh Kumar' : 'Fleet Operator')}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-border bg-surface p-1.5 shadow-2xl space-y-1">
                <div className="px-3 py-2 border-b border-border text-xs">
                  <p className="font-bold text-white truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-text-muted truncate">{currentUser?.email}</p>
                  <span className="mt-1 inline-block rounded bg-brand-orange/20 text-brand-orange px-1.5 py-0.5 text-[10px] font-bold">
                    {currentUser?.role || 'User'}
                  </span>
                </div>
                {!isDriver && (
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="block rounded-lg px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-muted hover:text-white"
                  >
                    System settings
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 cursor-pointer"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
};

export const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <Header collapsed={collapsed} onOpenMobile={() => setMobileOpen(true)} />
      <main
        className={`min-h-[calc(100vh-56px)] p-4 transition-all duration-200 sm:p-6 ${
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <div className="mx-auto w-full max-w-[1520px] space-y-5">{children}</div>
      </main>
    </div>
  );
};