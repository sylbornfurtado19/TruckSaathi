'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Fuel, AlertTriangle, Droplets } from 'lucide-react';
import { useMotionSafe } from '@/lib/motion';

interface FuelTankWaveProps {
  levelPercent: number; // 0 - 100
  capacityLiters?: number;
  theftAlert?: boolean;
  theftDetails?: {
    lossLiters: number;
    durationMins: number;
    location: string;
  };
}

export function FuelTankWave({
  levelPercent,
  capacityLiters = 400,
  theftAlert = false,
  theftDetails
}: FuelTankWaveProps) {
  const { shouldReduce } = useMotionSafe();

  const clampedLevel = Math.max(0, Math.min(100, levelPercent));
  const currentLiters = Math.round((clampedLevel / 100) * capacityLiters);

  let fillColor = '#10b981'; // emerald
  let fillGradient = 'from-emerald-500/80 to-emerald-600';
  let badgeColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';

  if (theftAlert || clampedLevel <= 20) {
    fillColor = '#ef4444'; // crimson
    fillGradient = 'from-rose-500/80 to-rose-600';
    badgeColor = 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  } else if (clampedLevel <= 45) {
    fillColor = '#f59e0b'; // amber
    fillGradient = 'from-amber-500/80 to-amber-600';
    badgeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
  }

  // Calculate wave surface position (height 0 to 180)
  const tankHeight = 180;
  const liquidY = tankHeight * (1 - clampedLevel / 100);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Tank Container */}
      <div className="relative w-40 h-[180px] rounded-2xl border-2 border-white/15 bg-canvas overflow-hidden shadow-2xl flex flex-col justify-end">
        {/* Subtle glass reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-20" />

        {/* Graduated Liters Scale Marks */}
        <div className="absolute right-2 top-3 bottom-3 flex flex-col justify-between text-[9px] font-mono text-text-muted z-20 select-none">
          <span>{capacityLiters}L</span>
          <span>{Math.round(capacityLiters * 0.75)}L</span>
          <span>{Math.round(capacityLiters * 0.5)}L</span>
          <span>{Math.round(capacityLiters * 0.25)}L</span>
          <span>0L</span>
        </div>

        {/* Liquid Fill with SVG Wave */}
        <div
          className="relative w-full transition-all duration-1000 ease-out z-10"
          style={{ height: `${clampedLevel}%` }}
        >
          {/* Animated Wave Header */}
          <div className="absolute -top-3 left-0 w-[200%] h-4 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 400 20"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 0 10 Q 50 0, 100 10 T 200 10 T 300 10 T 400 10 V 20 H 0 Z"
                fill={fillColor}
                opacity={0.8}
                animate={shouldReduce ? {} : { x: ['0px', '-100px'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            </svg>
          </div>

          {/* Liquid Body */}
          <div className={`w-full h-full bg-gradient-to-b ${fillGradient} opacity-90`} />
        </div>

        {/* Centered Big Value Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <span className="font-mono text-3xl font-extrabold text-white drop-shadow-md">
            {clampedLevel}%
          </span>
          <span className="font-mono text-xs text-slate-200 font-semibold drop-shadow">
            {currentLiters} Liters
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${badgeColor}`}>
        <Fuel className="w-3.5 h-3.5" />
        <span>{theftAlert ? 'CRITICAL THEFT ALERT' : clampedLevel <= 20 ? 'LOW FUEL WARNING' : 'FUEL LEVEL NORMAL'}</span>
      </div>

      {/* Animated Fuel-Drop Theft Alert Notification */}
      {theftAlert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm rounded-xl border border-rose-500/50 bg-rose-950/40 p-3 text-xs text-rose-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] space-y-2"
        >
          <div className="flex items-center gap-2 text-rose-200 font-bold">
            <Droplets className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>UNAUTHORIZED DRAIN DETECTED</span>
          </div>
          <p className="text-[11px] text-rose-300/90 leading-relaxed">
            {theftDetails
              ? `Sudden drop of ${theftDetails.lossLiters}L in ${theftDetails.durationMins}m near ${theftDetails.location}. Telematics engine ignition was OFF.`
              : 'Rapid fuel tank siphon detected while vehicle was stationary.'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
