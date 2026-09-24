'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Radio,
  AlertTriangle,
  Navigation,
  Gauge,
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
            className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border-2 border-rose-500 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse"
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
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#121624] via-[#10141f] to-[#0d1017] border border-blue-500/30 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-64 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          {/* Left: Simulation Status & Telemetry Readout */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
                <Radio className={`w-3.5 h-3.5 ${simState.isRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                <span>{simState.isRunning ? 'LIVE TRANSIT SIMULATION RUNNING' : 'TRANSIT SIMULATION STANDBY'}</span>
              </span>

              <span className="text-xs font-mono text-cyan-300 font-semibold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/25">
                {simState.vehicleReg} ({simState.driverName})
              </span>

              {simState.tripStatus === 'Delivered' && (
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
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
              <span className="text-slate-400 font-mono text-[11px]">
                Speed: <strong className="text-white">{simState.speedKmh} km/h</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px]">
                Odometer: <strong className="text-white">{simState.odometerKm} km</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px]">
                Fuel: <strong className="text-emerald-400">{simState.fuelPercent}%</strong>
              </span>
            </div>
          </div>

          {/* Right: Controller Buttons */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto flex-wrap">
            {/* Speed Multiplier Pills */}
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              {[1, 3, 5].map((multiplier) => (
                <button
                  key={multiplier}
                  onClick={() => setSimulationSpeed(multiplier)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
                    simState.speedMultiplier === multiplier
                      ? 'bg-blue-600 text-white shadow-md'
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
                className="font-black text-xs shadow-lg shadow-blue-600/30"
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
        <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[11px]">Bhiwandi Hub</span>
            <div className="w-32 sm:w-60 h-2 bg-white/[0.06] rounded-full overflow-hidden flex p-0.5 border border-white/[0.1]">
              <div
                className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#38bdf8]"
                style={{ width: `${simState.progressPercent}%` }}
              />
            </div>
            <span className="text-[11px]">Chakan MIDC</span>
          </div>

          <div className="text-right text-slate-400 font-mono text-[11px]">
            <span className="text-white font-bold">{simState.progressPercent}%</span> Completed (
            <span className="text-cyan-300">{simState.distanceRemainingKm} km</span> remaining)
          </div>
        </div>
      </div>
    </div>
  );
}
