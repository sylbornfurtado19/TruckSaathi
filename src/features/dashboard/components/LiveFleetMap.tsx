'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Activity, MapPin } from 'lucide-react';
import { Card, StatusPill } from '@/components/ui';
import { Vehicle } from '@/types';

const LeafletMapInner = dynamic(() => import('./LeafletMapInner').then(module => module.LeafletMapInner), { ssr: false, loading: () => <div className="flex h-full items-center justify-center bg-surface-muted text-sm text-text-secondary">Loading fleet map...</div> });

export function LiveFleetMap({ vehicles }: { vehicles: Vehicle[] }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const active = vehicles.filter(vehicle => vehicle.maintenanceStatus === 'In Service').length;
  const maintenance = vehicles.filter(vehicle => vehicle.maintenanceStatus === 'Scheduled Service').length;
  const critical = vehicles.length - active - maintenance;

  return <Card className="overflow-hidden p-0">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4"><div><h2 className="flex items-center gap-2 text-base font-bold text-text-primary"><MapPin className="h-4 w-4 text-focus" />Live fleet map</h2><p className="mt-1 text-sm text-text-secondary">Vehicle locations and operating state.</p></div><div className="flex items-center gap-2 text-xs text-text-secondary"><Activity className="h-4 w-4 text-green-600" />Updated live</div></div>
    <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="min-h-[320px]"><LeafletMapInner vehicles={vehicles} selectedVehicleId={selectedVehicleId} /></div>
      <div className="border-t border-border bg-surface p-4 lg:border-l lg:border-t-0"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-text-primary">Vehicle status</h3><span className="tabular-nums text-xs text-text-muted">{vehicles.length}</span></div><div className="space-y-2">{vehicles.map(vehicle => <button type="button" key={vehicle.id} onClick={() => setSelectedVehicleId(vehicle.id)} className={`flex w-full items-center justify-between gap-2 rounded-control border p-2.5 text-left transition-colors ${selectedVehicleId === vehicle.id ? 'border-focus bg-blue-50' : 'border-border hover:bg-surface-muted'}`}><div className="min-w-0"><p className="truncate font-mono text-xs font-semibold text-text-primary">{vehicle.regNumber}</p><p className="truncate text-xs text-text-secondary">{vehicle.assignedDriver || 'Unassigned'}</p></div><StatusPill status={vehicle.maintenanceStatus === 'In Service' ? 'success' : vehicle.maintenanceStatus === 'Scheduled Service' ? 'maintenance' : 'danger'}>{vehicle.maintenanceStatus === 'In Service' ? 'On road' : vehicle.maintenanceStatus === 'Scheduled Service' ? 'Service' : 'Critical'}</StatusPill></button>)}</div><div className="mt-4 flex flex-wrap gap-2"><StatusPill status="success">{active} active</StatusPill><StatusPill status="maintenance">{maintenance} service</StatusPill><StatusPill status="danger">{critical} critical</StatusPill></div></div>
    </div>
  </Card>;
}