'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Truck, Users, LayoutDashboard, ShieldCheck, Building2, Settings, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { vehicles, drivers } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pages = [
    { name: 'Dashboard Overview', href: '/dashboard', type: 'Page', icon: LayoutDashboard },
    { name: 'Vehicle Assets Registry', href: '/vehicles', type: 'Page', icon: Truck },
    { name: 'Driver Human Capital', href: '/drivers', type: 'Page', icon: Users },
    { name: 'Company Profile & Hubs', href: '/company', type: 'Page', icon: Building2 },
    { name: 'User Management', href: '/users', type: 'Page', icon: Users },
    { name: 'Roles & RBAC Matrix', href: '/roles', type: 'Page', icon: ShieldCheck },
    { name: 'System Settings & Audit Logs', href: '/settings', type: 'Page', icon: Settings },
  ];

  const matchedVehicles = vehicles
    .filter(v => v.regNumber.toLowerCase().includes(query.toLowerCase()) || v.make.toLowerCase().includes(query.toLowerCase()))
    .map(v => ({ name: `${v.regNumber} (${v.make} ${v.model})`, href: '/vehicles', type: 'Vehicle', icon: Truck }));

  const matchedDrivers = drivers
    .filter(d => d.fullName.toLowerCase().includes(query.toLowerCase()) || d.phone.includes(query))
    .map(d => ({ name: `${d.fullName} (${d.phone})`, href: '/drivers', type: 'Driver', icon: Users }));

  const results = [...pages.filter(p => p.name.toLowerCase().includes(query.toLowerCase())), ...matchedVehicles, ...matchedDrivers];

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
              return (
                <div
                  key={index}
                  onClick={() => handleSelect(item.href)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedIndex === index ? 'bg-blue-600/20 text-white border border-blue-500/30' : 'text-slate-300 hover:bg-[#1c2333]/50'
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
