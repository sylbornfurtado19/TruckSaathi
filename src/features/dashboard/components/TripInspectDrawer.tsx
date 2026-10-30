'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Drawer, Button, StatusPill } from '@/components/ui';
import { Trip, Driver, Vehicle } from '@/types';

interface TripInspectDrawerProps {
  trip: Trip | null;
  drivers: Driver[];
  vehicles: Vehicle[];
  onAssignTrip: (tripId: string, driverId: string, vehicleId: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateTrip: (updated: Trip) => void;
  onClose: () => void;
}

export function TripInspectDrawer({
  trip,
  drivers,
  vehicles,
  onAssignTrip,
  onUpdateTrip,
  onClose
}: TripInspectDrawerProps) {
  const [assignDriverId, setAssignDriverId] = useState('');
  const [assignVehicleId, setAssignVehicleId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);

  return (
    <Drawer
      isOpen={Boolean(trip)}
      onClose={onClose}
      title={`Trip Manifest: ${trip?.tripCode || ''}`}
      subtitle={`${trip?.origin.city} → ${trip?.destination.city}`}
    >
      {trip && (
        <div className="space-y-6 text-sm">
          {/* Status Header */}
          <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-surface-muted/40 p-3.5">
            <div>
              <span className="text-[11px] font-bold uppercase text-text-muted block">
                Consignment Status
              </span>
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
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase text-text-muted block">
                Scheduled Arrival
              </span>
              <span className="font-mono font-medium text-text-primary text-xs">
                {trip.scheduledArrival}
              </span>
            </div>
          </div>

          {/* Cargo & Assignment */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
              Consignment Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <span className="text-text-muted block text-[11px]">Assigned Commercial Vehicle:</span>
                <span className="font-mono font-bold text-text-primary">{trip.vehicleReg}</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <span className="text-text-muted block text-[11px]">Assigned Pilot:</span>
                <span className="font-semibold text-cyan-300">{trip.driverName}</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <span className="text-text-muted block text-[11px]">Cargo Manifest:</span>
                <span className="font-semibold text-text-primary">{trip.cargoDescription}</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <span className="text-text-muted block text-[11px]">Billed Weight:</span>
                <span className="font-mono font-semibold text-text-primary">{trip.cargoWeightTons} Metric Tons</span>
              </div>
            </div>
          </div>

          {/* Realtime Driver & Vehicle Assignment Module */}
          <div className="space-y-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Dispatcher Realtime Assignment
              </h4>
              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                SUPABASE REALTIME
              </span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Assign pilot and vehicle to trigger instant real-time synchronization on the Driver Portal without page refresh.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-text-muted mb-1 font-semibold text-[11px]">Assign Pilot</label>
                <select
                  value={assignDriverId || trip.driverId || ''}
                  onChange={(e) => setAssignDriverId(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.1] bg-surface px-2.5 py-2 text-xs text-text-primary focus:border-cyan-500 focus:outline-none"
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
                <label className="block text-text-muted mb-1 font-semibold text-[11px]">Assign Asset</label>
                <select
                  value={assignVehicleId || trip.vehicleId || ''}
                  onChange={(e) => setAssignVehicleId(e.target.value)}
                  className="w-full rounded-lg border border-white/[0.1] bg-surface px-2.5 py-2 text-xs text-text-primary focus:border-cyan-500 focus:outline-none"
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
                disabled={!(assignDriverId || trip.driverId) || !(assignVehicleId || trip.vehicleId) || assigning}
                onClick={async () => {
                  const dId = assignDriverId || trip.driverId;
                  const vId = assignVehicleId || trip.vehicleId;
                  if (!dId || !vId) return;
                  setAssigning(true);
                  setAssignSuccess(false);
                  const res = await onAssignTrip(trip.id, dId, vId);
                  setAssigning(false);
                  if (res.success) {
                    setAssignSuccess(true);
                    const selD = drivers.find((d) => d.id === dId);
                    const selV = vehicles.find((v) => v.id === vId);
                    onUpdateTrip({
                      ...trip,
                      status: 'Assigned',
                      driverId: dId,
                      driverName: selD?.fullName || trip.driverName,
                      vehicleId: vId,
                      vehicleReg: selV?.regNumber || trip.vehicleReg
                    });
                  }
                }}
                className="font-bold text-xs"
              >
                {assigning ? 'Dispatching...' : 'Assign Pilot & Asset →'}
              </Button>
            </div>
          </div>

          {/* Transit Corridor */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
              Transit Corridor
            </h4>
            <div className="rounded-xl border border-white/[0.08] bg-surface p-3.5 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="h-2 w-2 rounded-full bg-cyan-400 mt-1 shrink-0" />
                <div>
                  <span className="font-semibold text-text-primary block">Origin Dispatch Hub:</span>
                  <span className="text-text-secondary">{trip.origin.address}, {trip.origin.city}</span>
                </div>
              </div>
              <div className="border-l-2 border-dashed border-white/10 ml-1 pl-3.5 py-1 text-[11px] text-text-muted">
                Total Corridor Distance: {trip.distanceKm} km
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <div>
                  <span className="font-semibold text-text-primary block">Destination Unloading Point:</span>
                  <span className="text-text-secondary">{trip.destination.address}, {trip.destination.city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial & Compliance */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
              Tolls, E-Way Bill & Economics
            </h4>
            <div className="divide-y divide-white/[0.04] rounded-xl border border-white/[0.08] bg-surface text-xs">
              <div className="flex items-center justify-between p-2.5">
                <span className="text-text-secondary">GST E-Way Bill Number</span>
                <span className="font-mono text-cyan-400 font-semibold">{trip.ewayBillNumber || '2910-4829-1092'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5">
                <span className="text-text-secondary">FASTag Toll Accrued</span>
                <span className="font-mono text-text-primary font-medium">₹{trip.tollSpendINR?.toLocaleString('en-IN') || '1,840'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5">
                <span className="text-text-secondary">Agreed Freight Revenue</span>
                <span className="font-mono text-emerald-400 font-bold">₹{trip.freightRevenueINR?.toLocaleString('en-IN') || '48,000'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5">
                <span className="text-text-secondary">Proof of Delivery (POD)</span>
                <span className="font-semibold text-text-primary">
                  {trip.podReceived ? 'Verified & Stamped' : 'Pending Unload Confirmation'}
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
              onClick={onClose}
            >
              Close Manifest
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
