'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const { vehicles, drivers, trips } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedItemRef = useRef<HTMLDivElement | null>(null);

  const pages = [
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

  const matchedTrips = trips
    .filter(t => t.tripCode.toLowerCase().includes(query.toLowerCase()) || t.origin.city.toLowerCase().includes(query.toLowerCase()) || t.destination.city.toLowerCase().includes(query.toLowerCase()))
    .map(t => ({ name: `${t.tripCode} (${t.origin.city} → ${t.destination.city})`, href: '/trips', type: 'Trip', icon: Route }));

  const matchedVehicles = vehicles
    .filter(v => v.regNumber.toLowerCase().includes(query.toLowerCase()) || v.make.toLowerCase().includes(query.toLowerCase()))
    .map(v => ({ name: `${v.regNumber} (${v.make} ${v.model})`, href: '/vehicles', type: 'Vehicle', icon: Truck }));

  const matchedDrivers = drivers
    .filter(d => d.fullName.toLowerCase().includes(query.toLowerCase()) || d.phone.includes(query))
    .map(d => ({ name: `${d.fullName} (${d.phone})`, href: '/drivers', type: 'Driver', icon: Users }));

  const results = [
    ...pages.filter(p => p.name.toLowerCase().includes(query.toLowerCase())),
    ...matchedTrips,
    ...matchedVehicles,
    ...matchedDrivers
  ];

  // Reset selectedIndex whenever query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

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
  }, [isOpen, results, selectedIndex]);

  if (!isOpen) return null;

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div className="glass-panel border border-[#202736] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden relative">
        {/* Search Header */}
        <div className="p-4 border-b border-[#202736] flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Fuzzy search vehicles, drivers, pages..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-slate-400 bg-[#1c2333] px-2 py-0.5 rounded border border-[#2e374a]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
          {results.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No matching telemetry or pages found.</div>
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
                    isSelected ? 'bg-blue-600/20 text-white border border-blue-500/30' : 'text-slate-300 hover:bg-[#1c2333]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{item.type}</Badge>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
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
