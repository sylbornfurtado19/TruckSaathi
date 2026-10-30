'use client';

import React from 'react';
import Link from 'next/link';
import { Drawer, Button, StatusPill, Badge } from '@/components/ui';
import { Driver } from '@/types';

interface DriverInspectDrawerProps {
  driver: Driver | null;
  onClose: () => void;
}

export function DriverInspectDrawer({ driver, onClose }: DriverInspectDrawerProps) {
  return (
    <Drawer
      isOpen={Boolean(driver)}
      onClose={onClose}
      title={`Commercial Pilot: ${driver?.fullName || ''}`}
      subtitle={`DL: ${driver?.licenseNumber} • ${driver?.licenseCategory}`}
    >
      {driver && (
        <div className="space-y-6 text-sm">
          {/* Driver Profile Header */}
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-surface-muted/40 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 font-mono text-lg font-black text-white shadow-sm">
              {driver.fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-primary text-base">{driver.fullName}</h3>
              <p className="text-xs text-text-secondary font-mono">ID: {driver.id.slice(0, 12)}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={driver.verificationStatus === 'Fully Verified' ? 'success' : 'warning'}>
                  {driver.verificationStatus}
                </Badge>
                <StatusPill status={driver.status === 'Active' ? 'success' : 'neutral'}>
                  {driver.status}
                </StatusPill>
              </div>
            </div>
          </div>

          {/* Pilot Credentials */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
              Sarathi Driving License & KYC
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <span className="text-text-muted block text-[11px]">License Number:</span>
                <span className="font-mono font-semibold text-text-primary">{driver.licenseNumber}</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <span className="text-text-muted block text-[11px]">Valid Until:</span>
                <span className="font-mono font-semibold text-text-primary">{driver.licenseExpiry}</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <span className="text-text-muted block text-[11px]">Highway Experience:</span>
                <span className="font-mono font-semibold text-text-primary">{driver.experienceYears} Years Heavy Haulage</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-surface p-2.5">
                <span className="text-text-muted block text-[11px]">Assigned Commercial Vehicle:</span>
                <span className="font-mono font-semibold text-cyan-300">{driver.assignedVehicle || 'Standby'}</span>
              </div>
            </div>
          </div>

          {/* Safety Score Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
              Telematics Safety & Behavior
            </h4>
            <div className="rounded-xl border border-white/[0.08] bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary">Fleet Safety Rating</span>
                <span className="font-mono text-lg font-black text-emerald-400">
                  {driver.safetyScore || 92} / 100
                </span>
              </div>
              <div className="mt-2 h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${driver.safetyScore || 92}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded bg-surface-muted/50 p-1.5">
                  <span className="text-text-muted block text-[10px]">Overspeed</span>
                  <span className="font-mono font-bold text-text-primary">
                    {driver.safetyEvents?.overspeedCount ?? 0}
                  </span>
                </div>
                <div className="rounded bg-surface-muted/50 p-1.5">
                  <span className="text-text-muted block text-[10px]">Harsh Brake</span>
                  <span className="font-mono font-bold text-text-primary">
                    {driver.safetyEvents?.harshBrakingCount ?? 0}
                  </span>
                </div>
                <div className="rounded bg-surface-muted/50 p-1.5">
                  <span className="text-text-muted block text-[10px]">Fatigue Alerts</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {driver.safetyEvents?.fatigueAlertCount ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
              Contact & Emergency Protocols
            </h4>
            <div className="divide-y divide-white/[0.04] rounded-lg border border-white/[0.08] bg-surface text-xs">
              <div className="flex items-center justify-between p-2.5">
                <span className="text-text-secondary">Primary Mobile</span>
                <a href={`tel:${driver.phone}`} className="font-mono font-semibold text-cyan-400 hover:underline">
                  {driver.phone}
                </a>
              </div>
              <div className="flex items-center justify-between p-2.5">
                <span className="text-text-secondary">Emergency Contact Name</span>
                <span className="font-medium text-text-primary">{driver.emergencyContact?.name || 'Next of Kin'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5">
                <span className="text-text-secondary">Emergency Phone</span>
                <span className="font-mono text-rose-300 font-medium">{driver.emergencyContact?.phone || '+91 98765 00000'}</span>
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
