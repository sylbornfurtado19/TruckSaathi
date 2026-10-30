'use client';

import React from 'react';
import { Fuel, ShieldCheck, CreditCard, Activity } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { OdometerNumber } from '@/components/ui/OdometerNumber';
import { Sparkline } from '@/components/ui/Sparkline';
import { FuelLog, Trip } from '@/types';

interface DashboardMetricsStripProps {
  fuelLogs: FuelLog[];
  trips: Trip[];
  avgDriverSafety: number;
}

export function DashboardMetricsStrip({
  fuelLogs,
  trips,
  avgDriverSafety
}: DashboardMetricsStripProps) {
  const avgKmpl = fuelLogs.length
    ? (fuelLogs.reduce((sum, log) => sum + log.avgKmpl, 0) / fuelLogs.length)
    : 4.2;

  const totalRevenueLakhs = (
    trips.reduce((sum, t) => sum + (t.freightRevenueINR || 45000), 0) / 100000
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Fleet Fuel Efficiency */}
      <SpotlightCard className="p-4 bg-surface/90 border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Fleet Fuel Efficiency
          </span>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Fuel className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-black text-white">
            <OdometerNumber value={avgKmpl} decimals={1} />
          </span>
          <span className="font-mono text-xs text-text-muted">KMPL Average</span>
        </div>
        <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <p className="text-[11px] text-text-muted">
            {fuelLogs.length} verified refuel logs
          </p>
          <Sparkline
            data={[3.8, 4.0, 4.1, 3.9, 4.2, 4.3, avgKmpl]}
            color="#06b6d4"
            height={20}
            width={65}
          />
        </div>
      </SpotlightCard>

      {/* 2. Driver Safety Aggregate */}
      <SpotlightCard className="p-4 bg-surface/90 border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Driver Safety Index
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-black text-emerald-400">
            <OdometerNumber value={avgDriverSafety} />
          </span>
          <span className="font-mono text-xs text-text-muted">/ 100 Safety Score</span>
        </div>
        <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <p className="text-[11px] text-text-muted">
            Zero harsh brake events on NH-48
          </p>
          <Sparkline
            data={[88, 89, 91, 92, 90, 93, avgDriverSafety]}
            color="#10b981"
            height={20}
            width={65}
          />
        </div>
      </SpotlightCard>

      {/* 3. Active Trip Revenue */}
      <SpotlightCard className="p-4 bg-surface/90 border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Booked Freight Revenue
          </span>
          <div className="p-1.5 rounded-lg bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-black text-white">
            ₹<OdometerNumber value={totalRevenueLakhs} decimals={1} />L
          </span>
          <span className="font-mono text-xs font-bold text-emerald-400">+12% vs last cycle</span>
        </div>
        <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <p className="text-[11px] text-text-muted">
            Net freight across {trips.length} runs
          </p>
          <Sparkline
            data={[32, 38, 42, 40, 46, 50, totalRevenueLakhs]}
            color="#ff6b00"
            height={20}
            width={65}
          />
        </div>
      </SpotlightCard>

      {/* 4. Component Health & Fleet Uptime */}
      <SpotlightCard className="p-4 bg-surface/90 border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Component Health Uptime
          </span>
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-black text-white">
            <OdometerNumber value={96.4} decimals={1} />%
          </span>
          <span className="font-mono text-xs text-text-muted">Active Uptime</span>
        </div>
        <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <p className="text-[11px] text-text-muted">
            Predicted 2 preventive intervals
          </p>
          <Sparkline
            data={[94, 95, 95.5, 96, 95.8, 96.2, 96.4]}
            color="#a855f7"
            height={20}
            width={65}
          />
        </div>
      </SpotlightCard>
    </div>
  );
}

