'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Radio,
  AlertTriangle,
  Navigation,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui';

export function SimulationControlBar() {
  const {
    simState,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setSimulationSpeed,
    clearSOS
  } = useApp();

  return (
    <div className="w-full">
      {/* 1. Critical SOS Banner if triggered by Driver */}
      <AnimatePresence>
        {simState.sosActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex flex-col items-center justify-between gap-3 rounded-card border-2 border-red-300 bg-red-50 p-4 text-text-primary dark:border-red-800 dark:bg-red-950/20 sm:flex-row"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="font-mono font-black text-sm text-rose-200 tracking-wider">
                  HIGHWAY EMERGENCY SOS TRIGGERED BY DRIVER!
                </div>
                <div className="text-xs text-rose-300">
                  Driver {simState.driverName} on truck {simState.vehicleReg} at {simState.location.city} ({simState.currentCheckpoint}).
                </div>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={clearSOS}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold shrink-0 text-xs px-4"
            >
              Acknowledge & Clear SOS
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Interactive Simulation Controller Bar */}
      <div className="relative overflow-hidden rounded-card border border-border bg-surface p-4 sm:p-5">

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          {/* Left: Simulation Status & Telemetry Readout */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1 font-mono text-xs font-bold text-text-secondary">
                <Radio className={`w-3.5 h-3.5 ${simState.isRunning ? 'text-status-green' : 'text-text-muted'}`} />
                <span>{simState.isRunning ? 'LIVE TRANSIT SIMULATION RUNNING' : 'TRANSIT SIMULATION STANDBY'}</span>
              </span>

              <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 font-mono text-xs font-semibold text-text-secondary">
                {simState.vehicleReg} ({simState.driverName})
              </span>

              {simState.tripStatus === 'Delivered' && (
                <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 font-mono text-xs font-bold text-status-green dark:border-green-900/60 dark:bg-green-950/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Delivered & Handed Over
                </span>
              )}
            </div>

            <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                Mumbai-Pune NH-48 Corridor:
              </span>
              <span className="text-cyan-300 font-mono font-bold">{simState.currentCheckpoint}</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-xs text-text-secondary">
                Speed: <strong className="text-white">{simState.speedKmh} km/h</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-xs text-text-secondary">
                Odometer: <strong className="text-white">{simState.odometerKm} km</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-xs text-text-secondary">
                Fuel: <strong className="text-emerald-400">{simState.fuelPercent}%</strong>
              </span>
            </div>
          </div>

          {/* Right: Controller Buttons */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto flex-wrap">
            {/* Speed Multiplier Pills */}
            <div className="flex items-center rounded-control border border-border bg-surface-muted p-1 text-xs">
              {[1, 3, 5].map((multiplier) => (
                <button
                  key={multiplier}
                  onClick={() => setSimulationSpeed(multiplier)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
                    simState.speedMultiplier === multiplier
                      ? 'bg-focus text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`${multiplier}x speed`}
                >
                  {multiplier}x
                </button>
              ))}
            </div>

            {/* Play / Pause Button */}
            {simState.isRunning ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<Pause className="w-4 h-4 text-amber-400" />}
                onClick={() => pauseSimulation()}
                className="font-bold text-xs border-amber-500/30 hover:border-amber-400"
              >
                Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<Play className="w-4 h-4 fill-white" />}
                onClick={() => startSimulation(simState.speedMultiplier || 1)}
                className="font-semibold text-xs"
              >
                {simState.progressPercent > 0 ? 'Resume Simulation' : 'Start Live Simulation'}
              </Button>
            )}

            {/* Reset Button */}
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => resetSimulation()}
              title="Reset Route to Bhiwandi Hub"
              className="text-slate-400 hover:text-white"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Live Progress Bar along the corridor */}
          <div className="mt-3.5 flex items-center justify-between gap-4 border-t border-border pt-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Bhiwandi Hub</span>
            <div className="w-32 sm:w-60 h-2 bg-white/[0.06] rounded-full overflow-hidden flex p-0.5 border border-white/[0.1]">
              <div
                className="h-full rounded-full bg-brand-orange transition-all duration-300"
                style={{ width: `${simState.progressPercent}%` }}
              />
            </div>
            <span>Chakan MIDC</span>
          </div>

          <div className="text-right font-mono text-xs text-text-secondary">
            <span className="text-white font-bold">{simState.progressPercent}%</span> Completed (
            <span className="text-cyan-300">{simState.distanceRemainingKm} km</span> remaining)
          </div>
        </div>
      </div>
    </div>
  );
}
