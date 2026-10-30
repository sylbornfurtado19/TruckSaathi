'use client';

import React from 'react';
import Link from 'next/link';
import { Drawer, Button, StatusPill } from '@/components/ui';
import { Vehicle } from '@/types';

interface VehicleInspectDrawerProps {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export function VehicleInspectDrawer({ vehicle, onClose }: VehicleInspectDrawerProps) {
  return (
    <Drawer
      isOpen={Boolean(vehicle)}
      onClose={onClose}
      title={`Asset Telematics: ${vehicle?.regNumber || ''}`}
      subtitle={`${vehicle?.make} ${vehicle?.model} • ${vehicle?.category}`}
    >
      {vehicle && (
        <div className="space-y-6 text-sm">
          {/* Operational Banner */}
          <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-surface-muted/40 p-3.5">
            <div>
              <span className="text-[11px] font-bold uppercase text-text-muted block">
                Current Operating State
              </span>
              <StatusPill
                status={
                  vehicle.maintenanceStatus === 'In Service'
                    ? 'success'
                    : vehicle.maintenanceStatus === 'Scheduled Service'
                    ? 'warning'
                    : 'danger'
                }
              >
                {vehicle.maintenanceStatus}
              </StatusPill>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase text-text-muted block">
                Sector Location
              </span>
              <span className="font-medium text-text-primary text-xs">
                {vehicle.lastKnownLocation?.city || 'Transit Corridor'}
              </span>
            </div>
          </div>

          {/* Asset Specs */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
              Technical Specifications
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <span className="text-text-muted block text-[11px]">Chassis Number:</span>
                <span className="font-mono font-semibold text-text-primary">{vehicle.chassisNumber}</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <span className="text-text-muted block text-[11px]">Engine Number:</span>
                <span className="font-mono font-semibold text-text-primary">{vehicle.engineNumber}</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <span className="text-text-muted block text-[11px]">Payload Capacity:</span>
                <span className="font-mono font-semibold text-text-primary">{vehicle.capacityTons} Metric Tons</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <span className="text-text-muted block text-[11px]">Assigned Commercial Pilot:</span>
                <span className="font-semibold text-cyan-300">{vehicle.assignedDriver || 'Standby Pool'}</span>
              </div>
            </div>
          </div>

          {/* Component Health Diagnostics */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
              OBD-II Component Diagnostics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <div className="flex justify-between text-text-secondary mb-1">
                  <span>Engine Health:</span>
                  <span className="font-mono font-bold text-emerald-400">{vehicle.componentHealth?.engine || 94}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${vehicle.componentHealth?.engine || 94}%` }} />
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <div className="flex justify-between text-text-secondary mb-1">
                  <span>Pneumatic Brakes:</span>
                  <span className="font-mono font-bold text-emerald-400">{vehicle.componentHealth?.brakes || 88}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${vehicle.componentHealth?.brakes || 88}%` }} />
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <div className="flex justify-between text-text-secondary mb-1">
                  <span>Tyres & TPMS:</span>
                  <span className="font-mono font-bold text-cyan-400">{vehicle.componentHealth?.tyres || 82}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${vehicle.componentHealth?.tyres || 82}%` }} />
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <div className="flex justify-between text-text-secondary mb-1">
                  <span>24V Alternator:</span>
                  <span className="font-mono font-bold text-emerald-400">{vehicle.componentHealth?.battery || 95}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${vehicle.componentHealth?.battery || 95}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Expiry */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
              Parivahan Document Compliance
            </h4>
            <div className="divide-y divide-white/[0.04] rounded-lg border border-white/[0.08] bg-surface text-xs">
              <div className="flex items-center justify-between p-2.5">
                <span className="text-text-secondary">Vehicle RC Expiry</span>
                <span className="font-mono text-text-primary font-medium">{vehicle.rcExpiry}</span>
              </div>
              <div className="flex items-center justify-between p-2.5">
                <span className="text-text-secondary">Insurance Policy Expiry</span>
                <span className="font-mono text-text-primary font-medium">{vehicle.insuranceExpiry}</span>
              </div>
              <div className="flex items-center justify-between p-2.5">
                <span className="text-text-secondary">Fitness Certificate Expiry</span>
                <span className="font-mono text-text-primary font-medium">{vehicle.fitnessExpiry}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 flex items-center gap-2">
            <Link href="/vehicles" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Full Asset Management
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={onClose}
            >
              Close Inspector
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
