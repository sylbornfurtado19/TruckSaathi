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
      <div className="w-full h-full bg-[#090d16] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="text-xs text-blue-400 font-mono font-bold">Acquiring Pan-India Telemetry Signals...</div>
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
    <Card glow="blue" className="p-0 overflow-hidden flex flex-col h-[380px] relative border-blue-500/20">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-[#090d16]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#202736] pointer-events-auto">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-100 tracking-tight">Live Fleet Command Telemetry</span>
          <Badge variant="success" pulse className="ml-1 text-[10px]">
            {vehicles.length} Nodes Online
          </Badge>
        </div>

        <div className="bg-[#090d16]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#202736] text-[11px] font-mono text-slate-400 pointer-events-auto flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>GPS Refresh: 2s</span>
        </div>
      </div>

      {/* Map Embed Layer */}
      <div className="w-full h-full z-0 relative">
        <LeafletMapInner vehicles={vehicles} />
      </div>

      {/* Map Bottom Ticker */}
      <div className="bg-[#0c1019]/90 backdrop-blur-md px-4 py-2 border-t border-[#202736] z-10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active Transit ({activeCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Scheduled Service ({maintenanceCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Breakdown / Expired ({breakdownCount})
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">Pan-India Telemetry Network</span>
      </div>
    </Card>
  );
}
