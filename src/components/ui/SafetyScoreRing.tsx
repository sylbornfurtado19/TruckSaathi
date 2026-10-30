'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useMotionSafe } from '@/lib/motion';

interface SafetyScoreRingProps {
  score: number; // 0 - 100
  size?: number;
  rankDelta?: number; // e.g. +2, -1, 0
  label?: string;
  subtext?: string;
}

export function SafetyScoreRing({
  score,
  size = 120,
  rankDelta,
  label = 'Sarathi Safety Index',
  subtext
}: SafetyScoreRingProps) {
  const { shouldReduce } = useMotionSafe();

  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedScore / 100);

  const color = clampedScore >= 85 ? '#10b981' : clampedScore >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center p-4 rounded-2xl bg-surface-muted/50 border border-white/8 backdrop-blur-md">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated fill */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-black text-white">
            {clampedScore}
          </span>
          <span className="text-[10px] font-mono uppercase text-text-muted">
            /100
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <h4 className="text-xs font-bold text-text-primary flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" style={{ color }} />
          <span>{label}</span>
        </h4>
        {subtext && <p className="text-[11px] text-text-muted mt-0.5">{subtext}</p>}

        {rankDelta !== undefined && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10">
            {rankDelta > 0 ? (
              <>
                <ArrowUp className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">+{rankDelta} Ranks</span>
              </>
            ) : rankDelta < 0 ? (
              <>
                <ArrowDown className="w-3 h-3 text-rose-400" />
                <span className="text-rose-400">{rankDelta} Ranks</span>
              </>
            ) : (
              <>
                <Minus className="w-3 h-3 text-text-muted" />
                <span className="text-text-muted">No change</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

