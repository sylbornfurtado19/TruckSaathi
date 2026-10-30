'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Route, Truck, Users } from 'lucide-react';
import { Button } from '@/components/ui';
import { CurrentUser } from '@/types';

interface DashboardHeaderProps {
  currentUser: CurrentUser | null;
  totalVehicles: number;
}

export function DashboardHeader({ currentUser, totalVehicles }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-brand-orange to-amber-500 font-mono text-[11px] font-black text-white shadow-glow-orange/30">
            TS
          </div>
          <h1 className="font-mono text-xl font-black tracking-tight text-white sm:text-2xl">
            TRUCKSAATHI <span className="font-sans font-light text-text-muted">/</span> FLEET COMMAND CENTER
          </h1>
          <span className="rounded border border-brand-orange/40 bg-brand-orange/10 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-orange">
            DESK V2.4
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
          <span className="font-medium text-text-primary">
            {currentUser?.companyName || 'Apex Freight Lines India Ltd.'}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {totalVehicles} Commercial Assets Monitored
          </span>
          <span>•</span>
          <span className="font-mono text-text-muted">{currentTime}</span>
        </div>
      </div>

      {/* Global Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/trips">
          <Button size="sm" variant="primary" icon={<Route className="h-3.5 w-3.5" />}>
            New Dispatch
          </Button>
        </Link>
        <Link href="/vehicles">
          <Button size="sm" variant="outline" icon={<Truck className="h-3.5 w-3.5" />}>
            Asset Roster
          </Button>
        </Link>
        <Link href="/drivers">
          <Button size="sm" variant="ghost" icon={<Users className="h-3.5 w-3.5" />}>
            Pilots
          </Button>
        </Link>
      </div>
    </div>
  );
}
