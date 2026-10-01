'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Activity, MapPin, Radio, ShieldAlert, Wrench, Layers } from 'lucide-react';
import { StatusPill } from '@/components/ui';
import { Vehicle } from '@/types';

const LeafletMapInner = dynamic(
  () => import('./LeafletMapInner').then(module => module.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-2 rounded-xl bg-canvas border border-border/70 text-text-muted">
        <Radio className="h-6 w-6 animate-pulse text-cyan-400" />
        <span className="font-mono text-xs tracking-wider uppercase">Initializing Geospatial Fleet Radar...</span>
      </div>
    )
  }
);

interface LiveFleetMapProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string | null;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  className?: string;
}

export function LiveFleetMap({
  vehicles,
  selectedVehicleId = null,
  onSelectVehicle,
  className = ''
}: LiveFleetMapProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'service' | 'critical'>('all');

  const activeCount = vehicles.filter(v => v.maintenanceStatus === 'In Service').length;
  const serviceCount = vehicles.filter(v => v.maintenanceStatus === 'Scheduled Service').length;
  const criticalCount = vehicles.filter(v => v.maintenanceStatus === 'Breakdown' || v.docStatus === 'Expired').length;

  const filteredVehicles = useMemo(() => {
    if (filter === 'active') return vehicles.filter(v => v.maintenanceStatus === 'In Service');
    if (filter === 'service') return vehicles.filter(v => v.maintenanceStatus === 'Scheduled Service');
    if (filter === 'critical') return vehicles.filter(v => v.maintenanceStatus === 'Breakdown' || v.docStatus === 'Expired');
    return vehicles;
  }, [vehicles, filter]);

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-surface shadow-sm ${className}`}>
      {/* Map Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-4 py-3 bg-surface-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <MapPin className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Live Geographic Operations Deck
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                GPS FEED LIVE
              </span>
            </div>
            <p className="text-[11px] text-text-muted">
              NH-48 Golden Quadrilateral & Freight Corridors
            </p>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-canvas/60 p-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            All ({vehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
              filter === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            On Road ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('service')}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
              filter === 'service'
                ? 'bg-amber-500/20 text-amber-300 shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Service ({serviceCount})
          </button>
          {criticalCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter('critical')}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                filter === 'critical'
                  ? 'bg-rose-500/20 text-rose-300 shadow-xs'
                  : 'text-rose-400/80 hover:text-rose-300'
              }`}
            >
              Alerts ({criticalCount})
            </button>
          )}
        </div>
      </div>

      {/* Map Body */}
      <div className="relative h-[420px] w-full bg-canvas">
        <LeafletMapInner
          vehicles={filteredVehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={onSelectVehicle}
        />

        {/* Overlay corridor badge */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex items-center gap-2 rounded-lg border border-border/80 bg-canvas/90 px-3 py-1.5 shadow-lg backdrop-blur-md">
          <Layers className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-mono text-[11px] font-semibold text-text-primary">
            Corridor: Mumbai Bhiwandi ↔ Pune Chakan Auto Belt
          </span>
        </div>
      </div>

      {/* Bottom Status Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-xs bg-surface">
        <div className="flex items-center gap-4 text-text-muted text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Active ({activeCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Service ({serviceCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Urgent / Overdue ({criticalCount})
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-secondary">
          <Activity className="h-3.5 w-3.5 text-cyan-400" />
          Telematics polling 3.2s
        </div>
      </div>
    </div>
  );
}