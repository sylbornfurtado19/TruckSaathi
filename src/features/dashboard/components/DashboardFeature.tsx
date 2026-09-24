'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, CheckCircle2, Clock, Fuel, Route, Truck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button, Card, KpiCard, PageHeader, StatusPill } from '@/components/ui';
import { LiveFleetMap } from './LiveFleetMap';

export function DashboardFeature() {
  const { vehicles, activityLogs, trips, fuelLogs } = useApp();
  const activeTrips = trips.filter(trip => trip.status === 'In Transit').length;
  const delayedTrips = trips.filter(trip => trip.status === 'Delayed').length;
  const deliveredTrips = trips.filter(trip => trip.status === 'Delivered').length;
  const activeVehicles = vehicles.filter(vehicle => vehicle.maintenanceStatus === 'In Service').length;
  const alerts = vehicles.filter(vehicle => vehicle.docStatus !== 'Compliant' || vehicle.maintenanceStatus !== 'In Service').length;
  const onTimeRate = trips.length ? Math.round((deliveredTrips / trips.length) * 100) : 0;
  const avgKmpl = fuelLogs.length ? (fuelLogs.reduce((sum, log) => sum + log.avgKmpl, 0) / fuelLogs.length).toFixed(1) : '0.0';
  const serviceCount = vehicles.filter(vehicle => vehicle.maintenanceStatus === 'Scheduled Service').length;
  const criticalCount = vehicles.length - activeVehicles - serviceCount;
  const totalStatus = Math.max(vehicles.length, 1);

  return <div className="space-y-6">
    <PageHeader title="Fleet operations" subtitle="A clear view of trips, vehicles, drivers, and compliance across your network." actions={<Link href="/trips"><Button size="sm" icon={<Route className="h-4 w-4" />}>New dispatch</Button></Link>} />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KpiCard label="Active trips" number={activeTrips} subtext="In transit" icon={<Route className="h-4 w-4" />} />
      <KpiCard label="Vehicles on road" number={activeVehicles} subtext={`${vehicles.length} total vehicles`} icon={<Truck className="h-4 w-4" />} />
      <KpiCard label="Delayed shipments" number={delayedTrips} subtext="Needs attention" icon={<AlertTriangle className="h-4 w-4" />} />
      <KpiCard label="On-time delivery" number={`${onTimeRate}%`} subtext="Delivered trips" icon={<CheckCircle2 className="h-4 w-4" />} />
      <KpiCard label="Fuel efficiency" number={`${avgKmpl} KMPL`} subtext="Fleet average" icon={<Fuel className="h-4 w-4" />} />
      <KpiCard label="Compliance alerts" number={alerts} subtext="Documents and service" icon={<AlertTriangle className="h-4 w-4" />} />
    </div>
    <LiveFleetMap vehicles={vehicles} />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2"><div className="flex items-center justify-between border-b border-border pb-4"><div><h2 className="flex items-center gap-2 text-base font-bold text-text-primary"><Activity className="h-4 w-4 text-focus" />Fleet status</h2><p className="mt-1 text-sm text-text-secondary">Current operating state of all vehicles.</p></div><span className="tabular-nums text-sm font-semibold text-text-secondary">{vehicles.length} vehicles</span></div><div className="mt-5 space-y-4"><div className="flex h-4 overflow-hidden rounded-full bg-surface-muted" aria-label="Fleet status distribution"><div className="bg-green-600" style={{ width: `${(activeVehicles / totalStatus) * 100}%` }} /><div className="bg-violet-600" style={{ width: `${(serviceCount / totalStatus) * 100}%` }} /><div className="bg-red-600" style={{ width: `${(criticalCount / totalStatus) * 100}%` }} /></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><StatusPill status="success">Active {activeVehicles}</StatusPill><StatusPill status="maintenance">In maintenance {serviceCount}</StatusPill><StatusPill status="danger">Critical {criticalCount}</StatusPill></div></div></Card>
      <Card><div className="flex items-center justify-between border-b border-border pb-4"><h2 className="text-base font-bold text-text-primary">Dispatch summary</h2><Link className="text-sm font-semibold text-focus" href="/trips">View trips</Link></div><div className="mt-4 space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-text-secondary">In transit</span><span className="tabular-nums font-semibold text-text-primary">{activeTrips}</span></div><div className="flex items-center justify-between"><span className="text-sm text-text-secondary">Delayed</span><span className="tabular-nums font-semibold text-amber-700">{delayedTrips}</span></div><div className="flex items-center justify-between"><span className="text-sm text-text-secondary">Delivered</span><span className="tabular-nums font-semibold text-green-700">{deliveredTrips}</span></div></div></Card>
    </div>
    <Card><div className="flex items-center justify-between border-b border-border pb-4"><div><h2 className="flex items-center gap-2 text-base font-bold text-text-primary"><Clock className="h-4 w-4 text-focus" />Recent activity</h2><p className="mt-1 text-sm text-text-secondary">The latest operational events.</p></div><Link className="text-sm font-semibold text-focus" href="/settings">View audit log</Link></div><div className="divide-y divide-border">{activityLogs.slice(0, 5).map(log => <div key={log.id} className="flex items-center gap-3 py-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-brand-navy">{log.user.charAt(0)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-text-primary">{log.action}</p><p className="truncate text-xs text-text-secondary">{log.user} · {log.module}</p></div><span className="shrink-0 text-xs tabular-nums text-text-muted">{log.timestamp}</span></div>)}</div></Card>
  </div>;
}