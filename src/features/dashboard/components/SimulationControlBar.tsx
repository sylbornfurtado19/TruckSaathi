'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Gauge,
    AlertOctagon,
    } from 'lucide-react';
import { TelemetrySimulationState } from '@/types';

interface SimulationControlBarProps {
  simState: TelemetrySimulationState;
  onToggle: () => void;
  onReset: () => void;
  onSetSpeed: (multiplier: number) => void;
  onTriggerSOS: () => void;
  onClearSOS: () => void;
}

export function SimulationControlBar({
  simState,
  onToggle,
  onReset,
  onSetSpeed,
  onTriggerSOS,
  onClearSOS
}: SimulationControlBarProps) {
  const speeds = [1, 2, 5, 10];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-surface/90 backdrop-blur-md p-3.5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Play/Pause/Reset Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggle}
            className={`flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-bold transition-all cursor-pointer ${
              simState.isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {simState.isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause Sim</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Play Sim</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-surface-muted/60 text-text-secondary hover:text-white hover:bg-surface transition-colors cursor-pointer"
            title="Reset Simulation to Initial State"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Speed Dial Multiplier Buttons */}
          <div className="flex items-center rounded-lg border border-white/[0.08] bg-canvas/60 p-0.5">
            {speeds.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSetSpeed(s)}
                className={`rounded px-2 py-1 font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  simState.speedMultiplier === s
                    ? 'bg-brand-orange text-white shadow-glow-orange/30'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Center: Live Telemetry Tele-Chip */}
        <div className="flex flex-1 items-center justify-center min-w-[240px] max-w-md gap-3 px-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Gauge className="h-4 w-4 text-cyan-400" />
            <span className="font-mono font-bold text-white">
              {simState.speedKmh} <span className="text-[10px] text-text-muted font-normal">KM/H</span>
            </span>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-text-muted">
              <span className="truncate max-w-[120px] text-text-secondary">{simState.currentCheckpoint}</span>
              <span className="text-cyan-400 font-bold">{simState.progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-brand-orange rounded-full"
                animate={{ width: `${simState.progressPercent}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Right: Simulation SOS Panic Button */}
        <div>
          {simState.sosActive ? (
            <button
              type="button"
              onClick={onClearSOS}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-rose-500 bg-rose-600 px-3.5 text-xs font-black text-white shadow-glow-rose/40 animate-pulse cursor-pointer"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>CLEAR ACTIVE SOS</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onTriggerSOS}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 text-xs font-bold text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-colors cursor-pointer"
              title="Test Emergency Broadcast across Fleet"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>Trigger Test SOS</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
