'use client';

import React, { useState, useMemo } from 'react';
import { Route, Truck, Users, Search } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  StatusPill,
  Badge,
  Input
} from '@/components/ui';
import { Vehicle, Driver, Trip, TelemetrySimulationState } from '@/types';

interface OperationsDeckTabsProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  simState: TelemetrySimulationState;
  onSelectTrip: (trip: Trip) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onSelectDriver: (driver: Driver) => void;
}

export function OperationsDeckTabs({
  trips,
  vehicles,
  drivers,
  simState,
  onSelectTrip,
  onSelectVehicle,
  onSelectDriver
}: OperationsDeckTabsProps) {
  const [activeTab, setActiveTab] = useState<'trips' | 'vehicles' | 'drivers'>('trips');
  const [tripSearch, setTripSearch] = useState('');
  const [tripStatusFilter, setTripStatusFilter] = useState<'All' | 'In Transit' | 'Delayed' | 'Delivered' | 'Scheduled'>('All');

  // Filtered trips
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

  return (
    <div className="rounded-xl border border-white/[0.08] bg-surface/90 backdrop-blur-md shadow-sm">
      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 bg-surface-muted/20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('trips')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'trips'
                ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/40 shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Route className="h-3.5 w-3.5" />
            <span>Trip Operations ({trips.length})</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'vehicles'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            <span>Vehicle Fleet ({vehicles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'drivers'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Driver Directory ({drivers.length})</span>
          </button>
        </div>

        <span className="font-mono text-xs text-text-muted">
          Auto-Sync Active
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
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-canvas/70 p-1 w-full sm:w-auto overflow-x-auto">
              {(['All', 'In Transit', 'Delayed', 'Delivered', 'Scheduled'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setTripStatusFilter(st)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                    tripStatusFilter === st
                      ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
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
                    <TableCell colSpan={8} className="py-10 text-center text-text-muted font-mono text-xs">
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
                        onClick={() => onSelectTrip(trip)}
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
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange/20 font-mono text-[10px] font-bold text-brand-orange">
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
                              onSelectTrip(trip);
                            }}
                            className="font-mono text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
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
          TAB 2: VEHICLE FLEET TABLE
          ------------------------------------------------------------------- */}
      {activeTab === 'vehicles' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono">Registration Plate</TableHead>
                  <TableHead>Type & Specs</TableHead>
                  <TableHead>Assigned Pilot</TableHead>
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
                    onClick={() => onSelectVehicle(v)}
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
                          onSelectVehicle(v);
                        }}
                        className="font-mono text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
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
          <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
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
                    onClick={() => onSelectDriver(d)}
                    className="cursor-pointer hover:bg-surface-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/30">
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
                          onSelectDriver(d);
                        }}
                        className="font-mono text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
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
  );
}

