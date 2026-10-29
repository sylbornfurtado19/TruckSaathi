'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Search,
  Truck,
  Users,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Settings,
  Route,
  Wrench,
  ShieldAlert,
  FileText,
  Fuel,
  DollarSign,
  Bot,
  Smartphone,
  ArrowRight,
  CornerDownLeft
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui';
import { springs, durations } from '@/lib/motion';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const allPages = [
  { name: 'Command Center', href: '/dashboard', type: 'Operations', icon: LayoutDashboard },
  { name: 'Trips & Dispatch', href: '/trips', type: 'Operations', icon: Route },
  { name: 'AI Smart Dispatch', href: '/ai-dispatch', type: 'Operations', icon: Bot },
  { name: 'Live Vehicles Roster', href: '/vehicles', type: 'Fleet Assets', icon: Truck },
  { name: 'Predictive Maintenance', href: '/maintenance', type: 'Fleet Assets', icon: Wrench },
  { name: 'Fuel Telematics & Siphoning', href: '/fuel', type: 'Fleet Assets', icon: Fuel },
  { name: 'Trip Expenses & P&L', href: '/expenses', type: 'Financial', icon: DollarSign },
  { name: 'Drivers Directory', href: '/drivers', type: 'Human Capital', icon: Users },
  { name: 'AI Safety Center', href: '/safety', type: 'Safety', icon: ShieldAlert },
  { name: 'Driver Field Portal', href: '/driver-portal', type: 'Driver Cockpit', icon: Smartphone },
  { name: 'Telemetry Reports & CSV', href: '/reports', type: 'Reports', icon: FileText },
  { name: 'Company Profile & Hubs', href: '/company', type: 'Enterprise', icon: Building2 },
  { name: 'User Management', href: '/users', type: 'Enterprise', icon: Users },
  { name: 'Roles & RBAC Matrix', href: '/roles', type: 'Enterprise', icon: ShieldCheck },
  { name: 'System Settings', href: '/settings', type: 'Settings', icon: Settings },
];

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <span>{text}</span>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <span>
      {before}
      <span className="font-bold text-brand-orange underline decoration-brand-orange/40">
        {match}
      </span>
      {after}
    </span>
  );
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { vehicles, drivers, trips, currentUser, currentDriver } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedItemRef = useRef<HTMLDivElement | null>(null);
  const shouldReduce = useReducedMotion();

  const isDriver = currentUser?.role === 'Driver';

  const results = useMemo(() => {
    const q = query.toLowerCase();

    const pages = isDriver
      ? [{ name: 'Driver Field Portal', href: '/driver-portal', type: 'Driver Cockpit', icon: Smartphone }]
      : allPages.filter(p => p.href !== '/driver-portal');

    const matchedPages = pages.filter(p => p.name.toLowerCase().includes(q));

    const matchedTrips = isDriver
      ? trips
          .filter(
            t =>
              t.driverId === currentDriver?.id &&
              (t.tripCode.toLowerCase().includes(q) ||
                t.origin.city.toLowerCase().includes(q) ||
                t.destination.city.toLowerCase().includes(q))
          )
          .map(t => ({
            name: `${t.tripCode} (${t.origin.city} → ${t.destination.city})`,
            href: '/driver-portal',
            type: 'Assigned Trip',
            icon: Smartphone
          }))
      : trips
          .filter(
            t =>
              t.tripCode.toLowerCase().includes(q) ||
              t.origin.city.toLowerCase().includes(q) ||
              t.destination.city.toLowerCase().includes(q)
          )
          .map(t => ({
            name: `${t.tripCode} (${t.origin.city} → ${t.destination.city})`,
            href: '/trips',
            type: 'Trip Manifest',
            icon: Route
          }));

    const matchedVehicles = isDriver
      ? []
      : vehicles
          .filter(
            v =>
              v.regNumber.toLowerCase().includes(q) ||
              v.make.toLowerCase().includes(q) ||
              v.model.toLowerCase().includes(q)
          )
          .map(v => ({
            name: `${v.regNumber} (${v.make} ${v.model})`,
            href: '/vehicles',
            type: 'Commercial Asset',
            icon: Truck
          }));

    const matchedDrivers = isDriver
      ? []
      : drivers
          .filter(
            d =>
              d.fullName.toLowerCase().includes(q) ||
              d.phone.includes(q)
          )
          .map(d => ({
            name: `${d.fullName} (${d.phone})`,
            href: '/drivers',
            type: 'Pilot / Driver',
            icon: Users
          }));

    return [...matchedPages, ...matchedTrips, ...matchedVehicles, ...matchedDrivers].slice(0, 15);
  }, [query, isDriver, trips, currentDriver, vehicles, drivers]);

  const handleSelect = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose]
  );

  // Scroll active item into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Scoped keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex].href);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durations.fast }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-default"
            onClick={onClose}
            aria-label="Close command palette"
          />

          {/* Dialog Container */}
          <motion.div
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -10 }}
            transition={springs.snappy}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/12 bg-surface/95 backdrop-blur-xl shadow-2xl"
          >
            {/* Search Header */}
            <div className="flex items-center gap-3 border-b border-white/8 p-4 bg-surface-muted/30">
              <Search className="h-5 w-5 text-brand-orange shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder={isDriver ? 'Search driver portal or assigned trips...' : 'Search vehicles, drivers, trips, modules...'}
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <kbd className="rounded border border-white/10 bg-surface-muted px-2 py-0.5 text-[11px] font-mono text-text-muted">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="max-h-84 space-y-1 overflow-y-auto p-2 text-sm">
              {results.length === 0 ? (
                <div className="py-10 text-center text-xs text-text-muted">
                  No matching vehicles, drivers, or modules found.
                </div>
              ) : (
                results.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = selectedIndex === index;
                  return (
                    <div
                      key={index}
                      ref={isSelected ? selectedItemRef : null}
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? 'border border-brand-orange/40 bg-brand-orange/15 text-white shadow-sm'
                          : 'border border-transparent text-text-secondary hover:bg-surface-muted/60 hover:text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            isSelected ? 'border-brand-orange/40 bg-brand-orange/20 text-brand-orange' : 'border-white/8 bg-surface-muted text-text-muted'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium truncate text-xs sm:text-sm">
                          {highlightMatch(item.name, query)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="neutral">{item.type}</Badge>
                        {isSelected ? (
                          <CornerDownLeft className="h-3.5 w-3.5 text-brand-orange" />
                        ) : (
                          <ArrowRight className="h-3.5 w-3.5 text-text-muted opacity-40" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="flex items-center justify-between border-t border-white/8 px-4 py-2.5 bg-surface-muted/20 text-[11px] text-text-muted font-mono">
              <span className="flex items-center gap-2">
                <span>Navigate: <kbd className="px-1 py-0.5 rounded bg-surface border border-white/8">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-surface border border-white/8">↓</kbd></span>
                <span>•</span>
                <span>Select: <kbd className="px-1 py-0.5 rounded bg-surface border border-white/8">↵ Enter</kbd></span>
              </span>
              <span>TruckSaathi Control Palette</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
