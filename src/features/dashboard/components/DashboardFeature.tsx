'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  Eye,
  FileText,
  Fuel,
  MapPin,
  Maximize2,
  Navigation,
  Phone,
  Radio,
  RefreshCw,
  Route,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  Wrench,
  XCircle,
  Zap
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  Button,
  Badge,
  Card,
  Panel,
  KpiStrip,
  PageHeader,
  StatusPill,
  Drawer,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Input
} from '@/components/ui';
import { LiveFleetMap } from './LiveFleetMap';
import { Vehicle, Driver, Trip } from '@/types';

export function DashboardFeature() {
  const {
    vehicles,
    drivers,
    trips,
    fuelLogs,
    expenses,
    activityLogs,
    currentUser,
    simState,
    clearSOS,
    activeEmergency,
    acknowledgeSOS,
    assignTrip
  } = useApp();

  // Local interactive states
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [assignDriverId, setAssignDriverId] = useState('');
  const [assignVehicleId, setAssignVehicleId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [tripSearch, setTripSearch] = useState('');
  const [tripStatusFilter, setTripStatusFilter] = useState<'All' | 'In Transit' | 'Delayed' | 'Delivered' | 'Scheduled'>('All');
  const [currentTime, setCurrentTime] = useState('');
  const [activeTab, setActiveTab] = useState<'trips' | 'vehicles' | 'drivers'>('trips');



  // Live IST Clock
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

  // Fleet operational counts
  const totalVehicles = vehicles.length;
  const onTripCount = trips.filter(trip => trip.status === 'In Transit').length;
  const idleVehiclesCount = vehicles.filter(
    v => v.maintenanceStatus === 'In Service' && !trips.some(t => t.vehicleId === v.id && (t.status === 'In Transit' || t.status === 'Scheduled'))
  ).length;
  const serviceCount = vehicles.filter(v => v.maintenanceStatus === 'Scheduled Service').length;
  const breakdownCount = vehicles.filter(v => v.maintenanceStatus === 'Breakdown').length;
  const maintenanceCount = serviceCount + breakdownCount;
  const activeDriversCount = drivers.filter(d => d.status === 'Active').length;
  const delayedTripsCount = trips.filter(trip => trip.status === 'Delayed').length;
  const deliveredTripsCount = trips.filter(trip => trip.status === 'Delivered').length;
  const onTimeRate = trips.length ? Math.round((deliveredTripsCount / trips.length) * 100) : 94;

  const avgKmpl = fuelLogs.length
    ? (fuelLogs.reduce((sum, log) => sum + log.avgKmpl, 0) / fuelLogs.length).toFixed(1)
    : '4.2';

  const avgDriverSafety = drivers.length
    ? Math.round(drivers.reduce((sum, d) => sum + (d.safetyScore || 90), 0) / drivers.length)
    : 92;

  // Filtered trips for operations deck
  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const matchesSearch =
        t.tripCode.toLowerCase().includes(tripSearch.toLowerCase()) ||
        t.vehicleReg.toLowerCase().includes(tripSearch.toLowerCase()) ||
        t.driverName.toLowerCase().includes(tripSearch.toLowerCase()) ||
        t.origin.city.toLowerCase().includes(tripSearch.toLowerCase()) ||
        t.destination.city.toLowerCase().includes(tripSearch.toLowerCase());
      const matchesStatus = tripStatusFilter === 'All' || t.status === tripStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [trips, tripSearch, tripStatusFilter]);

  // Operational Urgency Queue ("ATTENTION REQUIRED")
  interface UrgentItem {
    id: string;
    urgency: 'critical' | 'high' | 'medium' | 'info';
    type: 'sos' | 'breakdown' | 'delayed' | 'doc_expired' | 'fuel_theft' | 'service';
    title: string;
    description: string;
    timestamp?: string;
    actionLabel: string;
    onAction: () => void;
  }

  const attentionItems: UrgentItem[] = useMemo(() => {
    const list: UrgentItem[] = [];

    // 1. Live Realtime Emergency SOS (Database or Local Sim)
    if (activeEmergency && activeEmergency.status === 'ACTIVE') {
      list.push({
        id: `sos-${activeEmergency.id}`,
        urgency: 'critical',
        type: 'sos',
        title: `EMERGENCY SOS: ${activeEmergency.vehicleReg || simState.vehicleReg} (${activeEmergency.driverName || simState.driverName})`,
        description: `CRITICAL PANIC BROADCAST TRIGGERED at ${activeEmergency.locationName || simState.currentCheckpoint || 'Highway Corridor'} [${activeEmergency.latitude?.toFixed(4) || '18.75'}, ${activeEmergency.longitude?.toFixed(4) || '73.40'}]. Immediate dispatch response required.`,
        actionLabel: 'Acknowledge Emergency SOS',
        onAction: async () => {
          await acknowledgeSOS(activeEmergency.id);
          clearSOS();
        }
      });
    } else if (simState.sosActive) {
      list.push({
        id: 'sos-active',
        urgency: 'critical',
        type: 'sos',
        title: `EMERGENCY SOS: ${simState.vehicleReg} (${simState.driverName})`,
        description: `Driver activated panic broadcast near ${simState.currentCheckpoint} on NH-48. Speed: ${simState.speedKmh} km/h.`,
        actionLabel: 'Resolve SOS / Clear Alert',
        onAction: () => clearSOS()
      });
    }

    // 2. Breakdown assets
    vehicles
      .filter(v => v.maintenanceStatus === 'Breakdown')
      .forEach(v => {
        list.push({
          id: `breakdown-${v.id}`,
          urgency: 'critical',
          type: 'breakdown',
          title: `Vehicle Breakdown: ${v.regNumber}`,
          description: `${v.make} ${v.model} (${v.category}) reported immobilised. Assigned driver: ${v.assignedDriver || 'Unassigned'}.`,
          actionLabel: 'Inspect Vehicle',
          onAction: () => setSelectedVehicle(v)
        });
      });

    // 3. Delayed shipments
    trips
      .filter(t => t.status === 'Delayed')
      .forEach(t => {
        list.push({
          id: `delayed-${t.id}`,
          urgency: 'high',
          type: 'delayed',
          title: `Transit Delay: ${t.tripCode} (${t.origin.city} → ${t.destination.city})`,
          description: `Vehicle ${t.vehicleReg} behind schedule. Driver ${t.driverName}. Estimated arrival delayed.`,
          actionLabel: 'Inspect Trip',
          onAction: () => setSelectedTrip(t)
        });
      });

    // 4. Low Fuel or Theft Alerts
    fuelLogs
      .filter(f => f.theftAlert || f.fuelLevelPercent < 20)
      .forEach(f => {
        list.push({
          id: `fuel-${f.id}`,
          urgency: f.theftAlert ? 'high' : 'medium',
          type: 'fuel_theft',
          title: f.theftAlert ? `Fuel Siphoning Alert: ${f.vehicleReg}` : `Critical Low Fuel: ${f.vehicleReg}`,
          description: f.theftAlert
            ? (f.theftDetails || 'Abrupt fuel drop detected during transit.')
            : `Tank level at ${f.fuelLevelPercent}% (${f.fuelLiters}L remaining). Refuel required.`,
          actionLabel: 'Review Fuel Log',
          onAction: () => {
            const v = vehicles.find(item => item.regNumber === f.vehicleReg);
            if (v) setSelectedVehicle(v);
          }
        });
      });

    // 5. Expiring Compliance Docs
    vehicles
      .filter(v => v.docStatus === 'Expired' || v.docStatus === 'Expiring Soon')
      .slice(0, 3)
      .forEach(v => {
        list.push({
          id: `doc-${v.id}`,
          urgency: v.docStatus === 'Expired' ? 'critical' : 'medium',
          type: 'doc_expired',
          title: `Compliance Expiry: ${v.regNumber}`,
          description: `Vehicle RC/Insurance/Fitness status is ${v.docStatus}. Risk of RTO impoundment on interstate routes.`,
          actionLabel: 'Inspect Document',
          onAction: () => setSelectedVehicle(v)
        });
      });

    // 6. Scheduled maintenance
    vehicles
      .filter(v => v.maintenanceStatus === 'Scheduled Service')
      .slice(0, 2)
      .forEach(v => {
        list.push({
          id: `service-${v.id}`,
          urgency: 'medium',
          type: 'service',
          title: `Scheduled Preventive Service: ${v.regNumber}`,
          description: `Routine maintenance window open. Component health inspection due.`,
          actionLabel: 'Schedule Workshop',
          onAction: () => setSelectedVehicle(v)
        });
      });

    return list;
  }, [activeEmergency, acknowledgeSOS, simState, vehicles, trips, fuelLogs, clearSOS]);

  // Live Fleet Stream: Combines real trips and vehicles
  const liveFleetFeed = useMemo(() => {
    return vehicles.map(v => {
      const activeTrip = trips.find(t => t.vehicleId === v.id && t.status === 'In Transit');
      const isSimulated = v.regNumber === simState.vehicleReg;

      let speed = 0;
      let route = 'Yard / Base Hub';
      let statusText = 'Idle';
      let statusVariant: 'success' | 'info' | 'warning' | 'danger' | 'neutral' = 'neutral';

      if (v.maintenanceStatus === 'Breakdown') {
        statusText = 'Breakdown';
        route = 'Immobilised on Corridor';
        statusVariant = 'danger';
      } else if (v.maintenanceStatus === 'Scheduled Service') {
        statusText = 'Workshop Service';
        route = 'Central Maintenance Depot';
        statusVariant = 'warning';
      } else if (isSimulated && simState.isRunning) {
        speed = simState.speedKmh;
        route = 'Mumbai Bhiwandi → Pune Chakan';
        statusText = simState.speedKmh > 0 ? 'On Route' : 'Checkpoint Stop';
        statusVariant = 'info';
      } else if (activeTrip) {
        speed = Math.floor(55 + (v.capacityTons % 20));
        route = `${activeTrip.origin.city} → ${activeTrip.destination.city}`;
        statusText = 'On Route';
        statusVariant = 'info';
      } else {
        statusText = 'Ready / Standby';
        route = v.lastKnownLocation?.city ? `${v.lastKnownLocation.city} Hub` : 'Depot Yard';
        statusVariant = 'success';
      }

      return {
        vehicle: v,
        activeTrip,
        speed,
        route,
        statusText,
        statusVariant,
        isSimulated
      };
    });
  }, [vehicles, trips, simState]);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. FLEET COMMAND CENTER HEADER
          ========================================================================= */}
      <div className="flex flex-col gap-4 border-b border-border/80 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-cyan-600 to-blue-500 font-mono text-[11px] font-black text-white shadow-sm">
              TS
            </div>
            <h1 className="font-mono text-xl font-black tracking-tight text-white sm:text-2xl">
              TRUCKSAATHI <span className="font-sans font-light text-text-muted">/</span> FLEET COMMAND CENTER
            </h1>
            <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-400">
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

        {/* Global Control Buttons */}
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

      {/* =========================================================================
          2. REFINED TOP KPI COMMAND STRIP (NOT GIANT BALLOON CARDS)
          ========================================================================= */}
      <KpiStrip
        items={[
          {
            label: 'TOTAL FLEET',
            value: totalVehicles,
            subtext: `${vehicles.filter(v => v.category === 'Container').length} Heavy Containers`,
            icon: <Truck className="h-4 w-4 text-cyan-400" />,
            status: 'cyan'
          },
          {
            label: 'ON TRIP / TRANSIT',
            value: onTripCount,
            subtext: `${Math.round((onTripCount / Math.max(totalVehicles, 1)) * 100)}% Corridor Utilization`,
            icon: <Navigation className="h-4 w-4 text-sky-400" />,
            status: 'info'
          },
          {
            label: 'IDLE / READY',
            value: idleVehiclesCount,
            subtext: 'Available for immediate load',
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
            status: 'success'
          },
          {
            label: 'MAINTENANCE',
            value: maintenanceCount,
            subtext: `${breakdownCount} Breakdown / Overdue`,
            icon: <Wrench className="h-4 w-4 text-amber-400" />,
            status: breakdownCount > 0 ? 'danger' : 'warning'
          },
          {
            label: 'ACTIVE DRIVERS',
            value: activeDriversCount,
            subtext: `${drivers.length} Verified commercial pilots`,
            icon: <Users className="h-4 w-4 text-slate-300" />,
            status: 'neutral'
          },
          {
            label: 'ON-TIME DELIVERY',
            value: `${onTimeRate}%`,
            subtext: `${deliveredTripsCount} loads completed on time`,
            icon: <TrendingUp className="h-4 w-4 text-orange-400" />,
            status: 'vibe'
          }
        ]}
      />

      {/* =========================================================================
          3. ATTENTION REQUIRED (SORTED BY OPERATIONAL URGENCY)
          ========================================================================= */}
      {attentionItems.length > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/20 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                ATTENTION REQUIRED ({attentionItems.length} Operational Action Items)
              </h2>
            </div>
            <span className="font-mono text-[11px] text-rose-400/80">
              Priority Sorted: Critical → High → Service
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {attentionItems.map(item => {
              const borderCol =
                item.urgency === 'critical'
                  ? 'border-rose-500/40 bg-rose-950/30 hover:border-rose-500'
                  : item.urgency === 'high'
                  ? 'border-amber-500/40 bg-amber-950/20 hover:border-amber-500'
                  : 'border-border/80 bg-surface/80 hover:border-cyan-500/50';

              return (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-lg border p-3 transition-colors ${borderCol}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-black uppercase ${
                          item.urgency === 'critical'
                            ? 'bg-rose-500/20 text-rose-300'
                            : item.urgency === 'high'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-500/20 text-slate-300'
                        }`}
                      >
                        {item.urgency}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">IMMEDIATE</span>
                    </div>
                    <h4 className="text-xs font-bold text-text-primary line-clamp-1">{item.title}</h4>
                    <p className="mt-1 text-[11px] text-text-secondary leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/50 flex justify-end">
                    <button
                      type="button"
                      onClick={item.onAction}
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {item.actionLabel} →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MAIN COMMAND CENTER (2-COLUMN SPLIT DECK)
             LEFT: Live Fleet Map / Geographic Overview
             RIGHT: Live Fleet Activity Stream (Click opens Quick Inspect Drawer)
          ========================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Fleet Map (7 Cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <LiveFleetMap
            vehicles={vehicles}
            selectedVehicleId={selectedVehicle?.id}
            onSelectVehicle={v => setSelectedVehicle(v)}
          />
        </div>

        {/* RIGHT COLUMN: Live Fleet Activity Stream (5 Cols on desktop) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="flex h-full flex-col rounded-xl border border-border bg-surface shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 bg-surface-muted/30">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Live Fleet Radar
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-text-secondary">
                {liveFleetFeed.filter(f => f.speed > 0 || f.statusText === 'On Route').length} In Motion
              </span>
            </div>

            {/* Scrollable Unit List */}
            <div className="flex-1 divide-y divide-border/60 overflow-y-auto max-h-[460px]">
              {liveFleetFeed.map(item => (
                <div
                  key={item.vehicle.id}
                  onClick={() => setSelectedVehicle(item.vehicle)}
                  className="group flex cursor-pointer items-center justify-between gap-3 p-3 transition-colors hover:bg-surface-muted/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-text-primary group-hover:text-cyan-400 transition-colors">
                        {item.vehicle.regNumber}
                      </span>
                      {item.isSimulated && (
                        <span className="rounded bg-cyan-500/20 px-1 font-mono text-[9px] font-black text-cyan-300">
                          LIVE SIM
                        </span>
                      )}
                      <StatusPill status={item.statusVariant}>{item.statusText}</StatusPill>
                    </div>

                    <p className="mt-1 truncate text-xs text-text-secondary">
                      {item.route}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-text-muted">
                      <span>Pilot: {item.vehicle.assignedDriver || 'Standby'}</span>
                      <span>•</span>
                      <span>{item.vehicle.category}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-sm font-black text-text-primary">
                      {item.speed > 0 ? (
                        <span className="text-emerald-400">{item.speed} km/h</span>
                      ) : (
                        <span className="text-text-muted">0 km/h</span>
                      )}
                    </div>
                    <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Inspect →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary */}
            <div className="border-t border-border px-4 py-2.5 bg-surface text-center">
              <span className="font-mono text-[11px] text-text-muted">
                Click any asset above to trigger instant telemetry inspection
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. OPERATIONS CONTROL DECK (TABS: TRIPS, FLEET ASSETS, PILOTS)
          ========================================================================= */}
      <div className="rounded-xl border border-border bg-surface shadow-sm">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-4 py-3 bg-surface-muted/20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('trips')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'trips'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Route className="h-3.5 w-3.5" />
              Trip Operations ({trips.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vehicles')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'vehicles'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              Vehicle Fleet ({vehicles.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('drivers')}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'drivers'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Driver Directory ({drivers.length})
            </button>
          </div>

          <span className="font-mono text-xs text-text-muted">
            Auto-Sync Supabase Cloud DB
          </span>
        </div>

        {/* -------------------------------------------------------------------
            TAB 1: TRIP OPERATIONS TABLE
            ------------------------------------------------------------------- */}
        {activeTab === 'trips' && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-80">
                <Input
                  icon={<Search className="h-3.5 w-3.5" />}
                  placeholder="Search Trip ID, Vehicle, Driver, Corridor..."
                  value={tripSearch}
                  onChange={e => setTripSearch(e.target.value)}
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1 rounded-lg border border-border bg-canvas/70 p-1 w-full sm:w-auto overflow-x-auto">
                {(['All', 'In Transit', 'Delayed', 'Delivered', 'Scheduled'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTripStatusFilter(st)}
                    className={`rounded px-2.5 py-1 text-xs font-semibold shrink-0 transition-colors ${
                      tripStatusFilter === st
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-border/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono">Trip ID</TableHead>
                    <TableHead className="font-mono">Vehicle</TableHead>
                    <TableHead>Assigned Driver</TableHead>
                    <TableHead>Corridor (Origin → Dest)</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-text-muted">
                        No active trips found matching your filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrips.map(trip => {
                      const isSim = trip.id === simState.tripId;
                      const progress = isSim
                        ? simState.progressPercent
                        : trip.status === 'Delivered'
                        ? 100
                        : trip.status === 'In Transit'
                        ? 65
                        : 0;

                      return (
                        <TableRow
                          key={trip.id}
                          onClick={() => setSelectedTrip(trip)}
                          className="cursor-pointer hover:bg-surface-muted/50"
                        >
                          <TableCell className="font-mono font-bold text-cyan-300">
                            {trip.tripCode}
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-text-primary">
                            {trip.vehicleReg}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 font-mono text-[10px] font-bold text-cyan-400">
                                {trip.driverName.charAt(0)}
                              </span>
                              <span className="text-xs font-medium text-text-primary">
                                {trip.driverName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-text-secondary">
                              {trip.origin.city} → {trip.destination.city}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-28">
                              <div className="h-1.5 w-16 rounded-full bg-surface-muted overflow-hidden">
                                <div
                                  className="h-full bg-cyan-400 rounded-full"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="font-mono text-[11px] text-text-muted">{progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-text-secondary">
                            {trip.scheduledArrival.slice(11, 16) || '18:45'}
                          </TableCell>
                          <TableCell>
                            <StatusPill
                              status={
                                trip.status === 'In Transit'
                                  ? 'info'
                                  : trip.status === 'Delivered'
                                  ? 'success'
                                  : trip.status === 'Delayed'
                                  ? 'danger'
                                  : 'neutral'
                              }
                            >
                              {trip.status}
                            </StatusPill>
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedTrip(trip);
                              }}
                              className="font-mono text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                            >
                              Inspect →
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 2: VEHICLE FLEET TABLE / RESPONSIVE HYBRID
            ------------------------------------------------------------------- */}
        {activeTab === 'vehicles' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono">Registration Plate</TableHead>
                    <TableHead>Type & Specs</TableHead>
                    <TableHead>Assigned Driver</TableHead>
                    <TableHead>Sector / Location</TableHead>
                    <TableHead>Operating Status</TableHead>
                    <TableHead>Health Score</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map(v => (
                    <TableRow
                      key={v.id}
                      onClick={() => setSelectedVehicle(v)}
                      className="cursor-pointer hover:bg-surface-muted/50"
                    >
                      <TableCell className="font-mono font-bold text-text-primary">
                        {v.regNumber}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-text-secondary">
                          {v.make} • {v.category} ({v.capacityTons} T)
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-text-primary">
                        {v.assignedDriver || 'Standby Pool'}
                      </TableCell>
                      <TableCell className="text-xs text-text-muted">
                        {v.lastKnownLocation?.city || 'Transit Corridor'}
                      </TableCell>
                      <TableCell>
                        <StatusPill
                          status={
                            v.maintenanceStatus === 'In Service'
                              ? 'success'
                              : v.maintenanceStatus === 'Scheduled Service'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {v.maintenanceStatus}
                        </StatusPill>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          {v.componentHealth?.engine || 92}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            v.docStatus === 'Compliant'
                              ? 'success'
                              : v.docStatus === 'Expiring Soon'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {v.docStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedVehicle(v);
                          }}
                          className="font-mono text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          Details →
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            TAB 3: DRIVER DIRECTORY
            ------------------------------------------------------------------- */}
        {activeTab === 'drivers' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver Profile</TableHead>
                    <TableHead className="font-mono">License Number</TableHead>
                    <TableHead>Category & Exp</TableHead>
                    <TableHead className="font-mono">Assigned Asset</TableHead>
                    <TableHead>Telematics Safety</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.map(d => (
                    <TableRow
                      key={d.id}
                      onClick={() => setSelectedDriver(d)}
                      className="cursor-pointer hover:bg-surface-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 font-mono text-xs font-bold text-cyan-300">
                            {d.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-text-primary">{d.fullName}</div>
                            <div className="font-mono text-[10px] text-text-muted">{d.phone}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-text-secondary">
                        {d.licenseNumber}
                      </TableCell>
                      <TableCell className="text-xs text-text-secondary">
                        {d.licenseCategory} • {d.experienceYears} Years
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-cyan-400">
                        {d.assignedVehicle || 'Standby'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {d.safetyScore || 92}
                          </span>
                          <span className="text-[10px] text-text-muted">/ 100</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            d.verificationStatus === 'Fully Verified' ? 'success' : 'warning'
                          }
                        >
                          {d.verificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedDriver(d);
                          }}
                          className="font-mono text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          Pilot Profile →
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          6. FLEET ANALYTICS METRICS STRIP (DERIVED FROM ACTIVE LOGS)
          ========================================================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Fleet Fuel Efficiency
            </span>
            <Fuel className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">{avgKmpl}</span>
            <span className="font-mono text-xs text-text-muted">KMPL Average</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">
            Computed from {fuelLogs.length} verified telematics refuel logs
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Driver Safety Aggregate
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-emerald-400">{avgDriverSafety}</span>
            <span className="font-mono text-xs text-text-muted">/ 100 Safety Score</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">
            Zero harsh acceleration incidents across Golden Corridor
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Active Trip Revenue
            </span>
            <CreditCard className="h-4 w-4 text-orange-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">
              ₹{(trips.reduce((sum, t) => sum + (t.freightRevenueINR || 45000), 0) / 100000).toFixed(1)}L
            </span>
            <span className="font-mono text-xs text-emerald-400">+12% vs last cycle</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">
            Net booked freight across {trips.length} active dispatches
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Component Health
            </span>
            <Activity className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-white">96.4%</span>
            <span className="font-mono text-xs text-text-muted">Fleet Uptime</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">
            Preventive diagnostics predicted 2 maintenance intervals
          </p>
        </Card>
      </div>

      {/* =========================================================================
          7. QUICK INSPECT DRAWERS (SLIDE-OUT INSPECTION WITHOUT NAVIGATION)
          ========================================================================= */}

      {/* VEHICLE QUICK INSPECT DRAWER */}
      <Drawer
        isOpen={Boolean(selectedVehicle)}
        onClose={() => setSelectedVehicle(null)}
        title={`Asset Telematics: ${selectedVehicle?.regNumber || ''}`}
        subtitle={`${selectedVehicle?.make} ${selectedVehicle?.model} • ${selectedVehicle?.category}`}
      >
        {selectedVehicle && (
          <div className="space-y-6 text-sm">
            {/* Operational Banner */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-text-muted block">
                  Current Operating State
                </span>
                <StatusPill
                  status={
                    selectedVehicle.maintenanceStatus === 'In Service'
                      ? 'success'
                      : selectedVehicle.maintenanceStatus === 'Scheduled Service'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {selectedVehicle.maintenanceStatus}
                </StatusPill>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase text-text-muted block">
                  Sector Location
                </span>
                <span className="font-medium text-text-primary text-xs">
                  {selectedVehicle.lastKnownLocation?.city || 'Transit Corridor'}
                </span>
              </div>
            </div>

            {/* Asset Specs */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Technical Specifications
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded border border-border bg-surface p-2.5">
                  <span className="text-text-muted block">Chassis Number:</span>
                  <span className="font-mono font-semibold text-text-primary">{selectedVehicle.chassisNumber}</span>
                </div>
                <div className="rounded border border-border bg-surface p-2.5">
                  <span className="text-text-muted block">Engine Number:</span>
                  <span className="font-mono font-semibold text-text-primary">{selectedVehicle.engineNumber}</span>
                </div>
                <div className="rounded border border-border bg-surface p-2.5">
                  <span className="text-text-muted block">Payload Capacity:</span>
                  <span className="font-mono font-semibold text-text-primary">{selectedVehicle.capacityTons} Metric Tons</span>
                </div>
                <div className="rounded border border-border bg-surface p-2.5">
                  <span className="text-text-muted block">Assigned Commercial Pilot:</span>
                  <span className="font-semibold text-cyan-300">{selectedVehicle.assignedDriver || 'Standby Pool'}</span>
                </div>
              </div>
            </div>

            {/* Component Health Diagnostics */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                OBD-II Component Diagnostics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded border border-border bg-surface p-2.5">
                  <div className="flex justify-between text-text-secondary mb-1">
                    <span>Engine Health:</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedVehicle.componentHealth?.engine || 94}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedVehicle.componentHealth?.engine || 94}%` }} />
                  </div>
                </div>

                <div className="rounded border border-border bg-surface p-2.5">
                  <div className="flex justify-between text-text-secondary mb-1">
                    <span>Pneumatic Brakes:</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedVehicle.componentHealth?.brakes || 88}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedVehicle.componentHealth?.brakes || 88}%` }} />
                  </div>
                </div>

                <div className="rounded border border-border bg-surface p-2.5">
                  <div className="flex justify-between text-text-secondary mb-1">
                    <span>Tyres & TPMS:</span>
                    <span className="font-mono font-bold text-cyan-400">{selectedVehicle.componentHealth?.tyres || 82}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${selectedVehicle.componentHealth?.tyres || 82}%` }} />
                  </div>
                </div>

                <div className="rounded border border-border bg-surface p-2.5">
                  <div className="flex justify-between text-text-secondary mb-1">
                    <span>24V Alternator:</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedVehicle.componentHealth?.battery || 95}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedVehicle.componentHealth?.battery || 95}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Expiry */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Parivahan Document Compliance
              </h4>
              <div className="divide-y divide-border rounded border border-border bg-surface text-xs">
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">Vehicle RC Expiry</span>
                  <span className="font-mono text-text-primary font-medium">{selectedVehicle.rcExpiry}</span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">Insurance Policy Expiry</span>
                  <span className="font-mono text-text-primary font-medium">{selectedVehicle.insuranceExpiry}</span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">Fitness Certificate Expiry</span>
                  <span className="font-mono text-text-primary font-medium">{selectedVehicle.fitnessExpiry}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex items-center gap-2">
              <Link href={`/vehicles`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Full Asset Management
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedVehicle(null)}
              >
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* DRIVER QUICK INSPECT DRAWER */}
      <Drawer
        isOpen={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
        title={`Commercial Pilot: ${selectedDriver?.fullName || ''}`}
        subtitle={`DL: ${selectedDriver?.licenseNumber} • ${selectedDriver?.licenseCategory}`}
      >
        {selectedDriver && (
          <div className="space-y-6 text-sm">
            {/* Driver Profile Header */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted/40 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 font-mono text-lg font-black text-white">
                {selectedDriver.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-primary text-base">{selectedDriver.fullName}</h3>
                <p className="text-xs text-text-secondary font-mono">ID: {selectedDriver.id.slice(0, 12)}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={selectedDriver.verificationStatus === 'Fully Verified' ? 'success' : 'warning'}>
                    {selectedDriver.verificationStatus}
                  </Badge>
                  <StatusPill status={selectedDriver.status === 'Active' ? 'success' : 'neutral'}>
                    {selectedDriver.status}
                  </StatusPill>
                </div>
              </div>
            </div>

            {/* Pilot Credentials */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Sarathi Driving License & KYC
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded border border-border bg-surface p-2.5">
                  <span className="text-text-muted block">License Number:</span>
                  <span className="font-mono font-semibold text-text-primary">{selectedDriver.licenseNumber}</span>
                </div>
                <div className="rounded border border-border bg-surface p-2.5">
                  <span className="text-text-muted block">Valid Until:</span>
                  <span className="font-mono font-semibold text-text-primary">{selectedDriver.licenseExpiry}</span>
                </div>
                <div className="rounded border border-border bg-surface p-2.5">
                  <span className="text-text-muted block">Highway Experience:</span>
                  <span className="font-mono font-semibold text-text-primary">{selectedDriver.experienceYears} Years Heavy Haulage</span>
                </div>
                <div className="rounded border border-border bg-surface p-2.5">
                  <span className="text-text-muted block">Assigned Commercial Vehicle:</span>
                  <span className="font-mono font-semibold text-cyan-300">{selectedDriver.assignedVehicle || 'Standby'}</span>
                </div>
              </div>
            </div>

            {/* Safety Score Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Telematics Safety & Behavior
              </h4>
              <div className="rounded border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary">Fleet Safety Rating</span>
                  <span className="font-mono text-lg font-black text-emerald-400">
                    {selectedDriver.safetyScore || 92} / 100
                  </span>
                </div>
                <div className="mt-2 h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${selectedDriver.safetyScore || 92}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-surface-muted/50 p-1.5">
                    <span className="text-text-muted block text-[10px]">Overspeed</span>
                    <span className="font-mono font-bold text-text-primary">
                      {selectedDriver.safetyEvents?.overspeedCount ?? 0}
                    </span>
                  </div>
                  <div className="rounded bg-surface-muted/50 p-1.5">
                    <span className="text-text-muted block text-[10px]">Harsh Brake</span>
                    <span className="font-mono font-bold text-text-primary">
                      {selectedDriver.safetyEvents?.harshBrakingCount ?? 0}
                    </span>
                  </div>
                  <div className="rounded bg-surface-muted/50 p-1.5">
                    <span className="text-text-muted block text-[10px]">Fatigue Alerts</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {selectedDriver.safetyEvents?.fatigueAlertCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Contact & Emergency Protocols
              </h4>
              <div className="divide-y divide-border rounded border border-border bg-surface text-xs">
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">Primary Mobile</span>
                  <a href={`tel:${selectedDriver.phone}`} className="font-mono font-semibold text-cyan-400 hover:underline">
                    {selectedDriver.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">Emergency Contact Name</span>
                  <span className="font-medium text-text-primary">{selectedDriver.emergencyContact?.name || 'Next of Kin'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">Emergency Phone</span>
                  <span className="font-mono text-rose-300 font-medium">{selectedDriver.emergencyContact?.phone || '+91 98765 00000'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <Link href="/drivers" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Full Driver Profile
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedDriver(null)}
              >
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* TRIP QUICK INSPECT DRAWER */}
      <Drawer
        isOpen={Boolean(selectedTrip)}
        onClose={() => setSelectedTrip(null)}
        title={`Trip Manifest: ${selectedTrip?.tripCode || ''}`}
        subtitle={`${selectedTrip?.origin.city} → ${selectedTrip?.destination.city}`}
      >
        {selectedTrip && (
          <div className="space-y-6 text-sm">
            {/* Status Header */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-text-muted block">
                  Consignment Status
                </span>
                <StatusPill
                  status={
                    selectedTrip.status === 'In Transit'
                      ? 'info'
                      : selectedTrip.status === 'Delivered'
                      ? 'success'
                      : selectedTrip.status === 'Delayed'
                      ? 'danger'
                      : 'neutral'
                  }
                >
                  {selectedTrip.status}
                </StatusPill>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase text-text-muted block">
                  Scheduled Arrival
                </span>
                <span className="font-mono font-medium text-text-primary text-xs">
                  {selectedTrip.scheduledArrival}
                </span>
              </div>
            </div>

            {/* Cargo & Assignment */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Consignment Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded border border-border bg-surface p-2.5">
                  <span className="text-text-muted block">Assigned Commercial Vehicle:</span>
                  <span className="font-mono font-bold text-text-primary">{selectedTrip.vehicleReg}</span>
                </div>
                <div className="rounded border border-border bg-surface p-2.5">
                  <span className="text-text-muted block">Assigned Pilot:</span>
                  <span className="font-semibold text-cyan-300">{selectedTrip.driverName}</span>
                </div>
                <div className="rounded border border-border bg-surface p-2.5">
                  <span className="text-text-muted block">Cargo Manifest:</span>
                  <span className="font-semibold text-text-primary">{selectedTrip.cargoDescription}</span>
                </div>
                <div className="rounded border border-border bg-surface p-2.5">
                  <span className="text-text-muted block">Billed Weight:</span>
                  <span className="font-mono font-semibold text-text-primary">{selectedTrip.cargoWeightTons} Metric Tons</span>
                </div>
              </div>
            </div>

            {/* Realtime Driver & Vehicle Assignment Module */}
            <div className="space-y-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Dispatcher Realtime Assignment
                </h4>
                <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-cyan-300">
                  SUPABASE REALTIME
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Assign pilot and vehicle to trigger instant real-time synchronization on the Driver Portal without page refresh.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">Assign Pilot</label>
                  <select
                    value={assignDriverId || selectedTrip.driverId || ''}
                    onChange={(e) => setAssignDriverId(e.target.value)}
                    className="w-full rounded-control border border-border bg-surface px-2.5 py-1.5 text-xs text-text-primary focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">-- Choose Pilot --</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-text-muted mb-1 font-semibold">Assign Asset</label>
                  <select
                    value={assignVehicleId || selectedTrip.vehicleId || ''}
                    onChange={(e) => setAssignVehicleId(e.target.value)}
                    className="w-full rounded-control border border-border bg-surface px-2.5 py-1.5 text-xs text-text-primary focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.regNumber} ({v.capacityTons}T {v.model})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {assignSuccess && (
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Assignment dispatched to driver portal in realtime!
                </div>
              )}
              <div className="pt-1 flex justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  disabled={!(assignDriverId || selectedTrip.driverId) || !(assignVehicleId || selectedTrip.vehicleId) || assigning}
                  onClick={async () => {
                    const dId = assignDriverId || selectedTrip.driverId;
                    const vId = assignVehicleId || selectedTrip.vehicleId;
                    if (!dId || !vId) return;
                    setAssigning(true);
                    setAssignSuccess(false);
                    const res = await assignTrip(selectedTrip.id, dId, vId);
                    setAssigning(false);
                    if (res.success) {
                      setAssignSuccess(true);
                      const selD = drivers.find((d) => d.id === dId);
                      const selV = vehicles.find((v) => v.id === vId);
                      setSelectedTrip((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: 'Assigned',
                              driverId: dId,
                              driverName: selD?.fullName || prev.driverName,
                              vehicleId: vId,
                              vehicleReg: selV?.regNumber || prev.vehicleReg
                            }
                          : null
                      );
                    }
                  }}
                  className="font-bold text-xs"
                >
                  {assigning ? 'Dispatching...' : 'Assign Pilot & Asset →'}
                </Button>
              </div>
            </div>

            {/* Corridor Navigation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Transit Corridor
              </h4>
              <div className="rounded border border-border bg-surface p-3 text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 mt-1 shrink-0" />
                  <div>
                    <span className="font-semibold text-text-primary block">Origin Dispatch Hub:</span>
                    <span className="text-text-secondary">{selectedTrip.origin.address}, {selectedTrip.origin.city}</span>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-border ml-1 pl-3.5 py-1 text-[11px] text-text-muted">
                  Total Corridor Distance: {selectedTrip.distanceKm} km
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <div>
                    <span className="font-semibold text-text-primary block">Destination Unloading Point:</span>
                    <span className="text-text-secondary">{selectedTrip.destination.address}, {selectedTrip.destination.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial & Compliance */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Tolls, E-Way Bill & Economics
              </h4>
              <div className="divide-y divide-border rounded border border-border bg-surface text-xs">
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">GST E-Way Bill Number</span>
                  <span className="font-mono text-cyan-400 font-semibold">{selectedTrip.ewayBillNumber || '2910-4829-1092'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">FASTag Toll Accrued</span>
                  <span className="font-mono text-text-primary font-medium">₹{selectedTrip.tollSpendINR?.toLocaleString('en-IN') || '1,840'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">Agreed Freight Revenue</span>
                  <span className="font-mono text-emerald-400 font-bold">₹{selectedTrip.freightRevenueINR?.toLocaleString('en-IN') || '48,000'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">Proof of Delivery (POD)</span>
                  <span className="font-semibold text-text-primary">
                    {selectedTrip.podReceived ? 'Verified & Stamped' : 'Pending Unload Confirmation'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <Link href="/trips" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  Full Dispatch Operations
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedTrip(null)}
              >
                Close Manifest
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}