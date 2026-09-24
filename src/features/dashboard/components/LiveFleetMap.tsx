'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Radio, Activity } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { Vehicle } from '@/types';

// Dynamically import entire Leaflet map wrapper component with ssr: false
const LeafletMapInner = dynamic(
  () => import('./LeafletMapInner').then(mod => mod.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#090b10] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-blue-400 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          Acquiring Real-Time Carto Telemetry Signals...
        </div>
        <div className="route-line-divider max-w-xs" />
      </div>
    )
  }
);

interface FleetMapProps {
  vehicles: Vehicle[];
}

export function LiveFleetMap({ vehicles }: FleetMapProps) {
  const activeCount = vehicles.filter(v => v.maintenanceStatus === 'In Service').length;
  const maintenanceCount = vehicles.filter(v => v.maintenanceStatus === 'Scheduled Service').length;
  const breakdownCount = vehicles.filter(v => v.maintenanceStatus === 'Breakdown' || v.docStatus === 'Expired').length;

  return (
    <Card glow="blue" className="p-0 overflow-hidden flex flex-col h-[400px] relative border-white/[0.1] rounded-2xl shadow-2xl">
      {/* Map Header Floating Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 bg-[#0e111a]/85 backdrop-blur-xl px-3.5 py-2 rounded-xl border border-white/10 pointer-events-auto shadow-xl">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-tight">Live Fleet Command Telemetry</span>
          <Badge variant="success" pulse className="ml-1 text-[10px]">
            {vehicles.length} Nodes Active
          </Badge>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#0e111a]/85 backdrop-blur-xl px-3.5 py-2 rounded-xl border border-white/10 text-xs font-mono text-slate-300 pointer-events-auto shadow-xl">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>GPS Refresh: <strong className="text-white">2s Realtime</strong></span>
        </div>
      </div>

      {/* Map Embed Layer */}
      <div className="w-full h-full z-0 relative">
        <LeafletMapInner vehicles={vehicles} />
      </div>

      {/* Map Bottom Ticker */}
      <div className="bg-[#0e111a]/90 backdrop-blur-xl px-5 py-2.5 border-t border-white/[0.08] z-10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" /> Active Transit ({activeCount})
          </span>
          <span className="flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" /> Scheduled Service ({maintenanceCount})
          </span>
          <span className="flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" /> Breakdown / Expired ({breakdownCount})
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">Pan-India Telemetry Grid</span>
      </div>
    </Card>
  );
}
