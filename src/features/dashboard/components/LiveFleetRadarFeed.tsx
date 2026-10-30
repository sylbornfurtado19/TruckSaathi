'use client';

import React from 'react';
import { Radio } from 'lucide-react';
import { StatusPill } from '@/components/ui';
import { Vehicle, Trip } from '@/types';

export interface LiveFleetFeedItem {
  vehicle: Vehicle;
  activeTrip?: Trip;
  speed: number;
  route: string;
  statusText: string;
  statusVariant: 'success' | 'info' | 'warning' | 'danger' | 'neutral';
  isSimulated: boolean;
}

interface LiveFleetRadarFeedProps {
  feed: LiveFleetFeedItem[];
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export function LiveFleetRadarFeed({ feed, onSelectVehicle }: LiveFleetRadarFeedProps) {
  const inMotionCount = feed.filter(f => f.speed > 0 || f.statusText === 'On Route').length;

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/[0.08] bg-surface/90 backdrop-blur-md shadow-sm">
      {/* Feed Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-surface-muted/30">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Live Fleet Radar
          </h3>
        </div>
        <span className="font-mono text-xs font-bold text-cyan-400">
          {inMotionCount} In Motion
        </span>
      </div>

      {/* Scrollable Unit List */}
      <div className="flex-1 divide-y divide-white/[0.04] overflow-y-auto max-h-[460px]">
        {feed.map(item => (
          <div
            key={item.vehicle.id}
            onClick={() => onSelectVehicle(item.vehicle)}
            className="group flex cursor-pointer items-center justify-between gap-3 p-3.5 transition-colors hover:bg-surface-muted/60"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-text-primary group-hover:text-cyan-400 transition-colors">
                  {item.vehicle.regNumber}
                </span>
                {item.isSimulated && (
                  <span className="rounded bg-cyan-500/20 px-1 font-mono text-[9px] font-black text-cyan-300 border border-cyan-500/30">
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
      <div className="border-t border-white/[0.08] px-4 py-2.5 bg-surface text-center">
        <span className="font-mono text-[11px] text-text-muted">
          Click any asset above to trigger instant telemetry inspection
        </span>
      </div>
    </div>
  );
}

