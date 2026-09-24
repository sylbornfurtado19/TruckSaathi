'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Truck, Users, LayoutDashboard, ShieldCheck, Building2, Settings, Route, Wrench, ShieldAlert, FileText, Fuel, DollarSign, Bot, Smartphone, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { vehicles, drivers, trips, currentUser, currentDriver } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedItemRef = useRef<HTMLDivElement | null>(null);

  const isDriver = currentUser?.role === 'Driver';

  const allPages = [
    { name: 'Dashboard Overview', href: '/dashboard', type: 'Page', icon: LayoutDashboard },
    { name: 'Trip & Dispatch Management', href: '/trips', type: 'Page', icon: Route },
    { name: 'AI Smart Dispatch Engine', href: '/ai-dispatch', type: 'Page', icon: Bot },
    { name: 'Vehicle Assets Registry', href: '/vehicles', type: 'Page', icon: Truck },
    { name: 'Predictive Maintenance Telemetry', href: '/maintenance', type: 'Page', icon: Wrench },
    { name: 'Fuel Telemetry & Theft Analytics', href: '/fuel', type: 'Page', icon: Fuel },
    { name: 'Trip Expenses & Financial P&L', href: '/expenses', type: 'Page', icon: DollarSign },
    { name: 'Driver Human Capital', href: '/drivers', type: 'Page', icon: Users },
    { name: 'AI Safety Center', href: '/safety', type: 'Page', icon: ShieldAlert },
    { name: 'Driver Field Portal & POD Upload', href: '/driver-portal', type: 'Page', icon: Smartphone },
    { name: 'Reporting & Telemetry Exports', href: '/reports', type: 'Page', icon: FileText },
    { name: 'Company Profile & Hubs', href: '/company', type: 'Page', icon: Building2 },
    { name: 'User Management', href: '/users', type: 'Page', icon: Users },
    { name: 'Roles & RBAC Matrix', href: '/roles', type: 'Page', icon: ShieldCheck },
    { name: 'System Settings & Audit Logs', href: '/settings', type: 'Page', icon: Settings },
  ];

  const pages = isDriver
    ? [{ name: 'Driver Field Portal & POD Upload', href: '/driver-portal', type: 'Page', icon: Smartphone }]
    : allPages.filter(p => p.href !== '/driver-portal');

  const matchedTrips = isDriver
    ? trips
        .filter(
          t =>
            t.driverId === currentDriver?.id &&
            (t.tripCode.toLowerCase().includes(query.toLowerCase()) ||
              t.origin.city.toLowerCase().includes(query.toLowerCase()) ||
              t.destination.city.toLowerCase().includes(query.toLowerCase()))
        )
        .map(t => ({
          name: `${t.tripCode} (Assigned: ${t.origin.city} → ${t.destination.city})`,
          href: '/driver-portal',
          type: 'Assigned Trip',
          icon: Smartphone
        }))
    : trips
        .filter(
          t =>
            t.tripCode.toLowerCase().includes(query.toLowerCase()) ||
            t.origin.city.toLowerCase().includes(query.toLowerCase()) ||
            t.destination.city.toLowerCase().includes(query.toLowerCase())
        )
        .map(t => ({
          name: `${t.tripCode} (${t.origin.city} → ${t.destination.city})`,
          href: '/trips',
          type: 'Trip',
          icon: Route
        }));

  const matchedVehicles = isDriver
    ? []
    : vehicles
        .filter(
          v =>
            v.regNumber.toLowerCase().includes(query.toLowerCase()) ||
            v.make.toLowerCase().includes(query.toLowerCase())
        )
        .map(v => ({
          name: `${v.regNumber} (${v.make} ${v.model})`,
          href: '/vehicles',
          type: 'Vehicle',
          icon: Truck
        }));

  const matchedDrivers = isDriver
    ? []
    : drivers
        .filter(
          d =>
            d.fullName.toLowerCase().includes(query.toLowerCase()) ||
            d.phone.includes(query)
        )
        .map(d => ({
          name: `${d.fullName} (${d.phone})`,
          href: '/drivers',
          type: 'Driver',
          icon: Users
        }));

  const results = useMemo(
    () => [
      ...pages.filter(p => p.name.toLowerCase().includes(query.toLowerCase())),
      ...matchedTrips,
      ...matchedVehicles,
      ...matchedDrivers
    ],
    [query, pages, matchedTrips, matchedVehicles, matchedDrivers]
  );

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

  // Scoped keyboard navigation for ArrowUp, ArrowDown, Enter, Escape
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20">
      <div className="relative w-full max-w-xl overflow-hidden rounded-card border border-border bg-surface shadow-popover">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Search className="h-5 w-5 text-focus" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={isDriver ? "Search driver portal or assigned trips..." : "Fuzzy search vehicles, drivers, pages..."}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <kbd className="rounded border border-border bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 space-y-1 overflow-y-auto p-2 text-sm">
          {results.length === 0 ? (
            <div className="p-6 text-center text-text-muted">No matching pages or records found.</div>
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
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'border border-blue-200 bg-blue-50 text-text-primary' : 'text-text-secondary hover:bg-surface-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-focus" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{item.type}</Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-text-muted" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
