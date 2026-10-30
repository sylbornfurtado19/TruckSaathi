'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Navigation, CheckCircle2, Wrench, Users, TrendingUp } from 'lucide-react';
import { OdometerNumber } from '@/components/ui/OdometerNumber';
import { Sparkline } from '@/components/ui/Sparkline';
import { Vehicle, Trip, Driver } from '@/types';

interface DashboardKpiStripProps {
  vehicles: Vehicle[];
  trips: Trip[];
  drivers: Driver[];
}

export function DashboardKpiStrip({ vehicles, trips, drivers }: DashboardKpiStripProps) {
  const totalVehicles = vehicles.length;
  const onTripCount = trips.filter(trip => trip.status === 'In Transit').length;
  const idleVehiclesCount = vehicles.filter(
    v => v.maintenanceStatus === 'In Service' && !trips.some(t => t.vehicleId === v.id && (t.status === 'In Transit' || t.status === 'Scheduled'))
  ).length;
  const serviceCount = vehicles.filter(v => v.maintenanceStatus === 'Scheduled Service').length;
  const breakdownCount = vehicles.filter(v => v.maintenanceStatus === 'Breakdown').length;
  const maintenanceCount = serviceCount + breakdownCount;
  const activeDriversCount = drivers.filter(d => d.status === 'Active').length;
  const deliveredTripsCount = trips.filter(trip => trip.status === 'Delivered').length;
  const onTimeRate = trips.length ? Math.round((deliveredTripsCount / trips.length) * 100) : 96.4;

  const kpis = [
    {
      label: 'TOTAL FLEET',
      value: totalVehicles,
      subtext: `${vehicles.filter(v => v.category === 'Container').length} Multi-Axle Containers`,
      delta: '+2 new',
      deltaColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
      icon: Truck,
      color: '#06b6d4',
      accentBorder: 'hover:border-cyan-500/40',
      sparkline: [20, 21, 22, 23, 23, 24, 24]
    },
    {
      label: 'ON CORRIDOR',
      value: onTripCount,
      subtext: `${Math.round((onTripCount / Math.max(totalVehicles, 1)) * 100)}% Corridor Utilization`,
      delta: '+14% flow',
      deltaColor: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
      icon: Navigation,
      color: '#38bdf8',
      accentBorder: 'hover:border-sky-500/40',
      sparkline: [12, 14, 15, 17, 18, 16, 18]
    },
    {
      label: 'IDLE / READY',
      value: idleVehiclesCount,
      subtext: 'Available for immediate dispatch',
      delta: 'Optimal',
      deltaColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      icon: CheckCircle2,
      color: '#10b981',
      accentBorder: 'hover:border-emerald-500/40',
      sparkline: [8, 7, 9, 6, 7, 5, 6]
    },
    {
      label: 'MAINTENANCE',
      value: maintenanceCount,
      subtext: `${breakdownCount} Breakdown / Overdue`,
      delta: breakdownCount > 0 ? 'Action Req' : 'Normal',
      deltaColor: breakdownCount > 0 ? 'text-rose-400 bg-rose-400/10 border-rose-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      icon: Wrench,
      color: breakdownCount > 0 ? '#f43f5e' : '#f59e0b',
      accentBorder: breakdownCount > 0 ? 'hover:border-rose-500/40' : 'hover:border-amber-500/40',
      sparkline: [4, 3, 3, 2, 3, 2, 2]
    },
    {
      label: 'ACTIVE PILOTS',
      value: activeDriversCount,
      subtext: `${drivers.length} Verified heavy haulers`,
      delta: '100% KYC',
      deltaColor: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
      icon: Users,
      color: '#a855f7',
      accentBorder: 'hover:border-violet-500/40',
      sparkline: [24, 25, 26, 27, 27, 28, 28]
    },
    {
      label: 'ON-TIME RATE',
      value: onTimeRate,
      suffix: '%',
      subtext: `${deliveredTripsCount} loads completed on SLA`,
      delta: '+3.2%',
      deltaColor: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
      icon: TrendingUp,
      color: '#ff6b00',
      accentBorder: 'hover:border-brand-orange/40',
      sparkline: [91, 92, 94, 93, 95, 96, 96.4]
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            className={`group relative flex flex-col justify-between rounded-xl border border-white/[0.08] bg-surface/90 p-4 backdrop-blur-md shadow-sm transition-all duration-200 ${kpi.accentBorder} hover:shadow-lg`}
          >
            {/* Top row: Label, Delta, Icon */}
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {kpi.label}
                </span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${kpi.deltaColor}`}>
                  {kpi.delta}
                </span>
              </div>

              {/* Main value display */}
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-white">
                  <OdometerNumber value={kpi.value} decimals={kpi.suffix ? 1 : 0} />
                </span>
                {kpi.suffix && (
                  <span className="font-mono text-sm font-bold text-brand-orange">
                    {kpi.suffix}
                  </span>
                )}
              </div>

              {/* Subtext */}
              <p className="mt-1 text-[11px] text-text-muted line-clamp-1">
                {kpi.subtext}
              </p>
            </div>

            {/* Bottom Sparkline Drawing & Icon */}
            <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between">
              <div className="w-[84px] h-[24px]">
                <Sparkline
                  data={kpi.sparkline}
                  color={kpi.color}
                  height={24}
                  width={84}
                  fillOpacity={0.15}
                />
              </div>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-surface-muted/60"
                style={{ color: kpi.color }}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

