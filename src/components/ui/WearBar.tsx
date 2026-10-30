'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe } from '@/lib/motion';

interface WearBarProps {
  label: string;
  percent: number; // 0 - 100
  predictedIssue?: string;
  icon?: React.ReactNode;
}

export function WearBar({ label, percent, predictedIssue, icon }: WearBarProps) {
  const { shouldReduce } = useMotionSafe();

  const clamped = Math.max(0, Math.min(100, percent));

  let color = 'bg-emerald-500';
  let badgeText = 'Optimal Health';
  let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

  if (clamped < 40) {
    color = 'bg-rose-500';
    badgeText = 'Critical Wear';
    badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  } else if (clamped < 70) {
    color = 'bg-amber-500';
    badgeText = 'Service Due Soon';
    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  }

  return (
    <div className="space-y-1.5 p-3 rounded-xl bg-surface-muted/40 border border-white/6">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-text-primary">
          {icon}
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${badgeColor}`}>
            {badgeText}
          </span>
          <span className="font-mono font-bold text-slate-100">{clamped}%</span>
        </div>
      </div>

      {/* Progress track */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/6 relative">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={shouldReduce ? { width: `${clamped}%` } : { width: '0%' }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {predictedIssue && (
        <p className="text-[11px] text-text-muted mt-1 truncate">
          AI Telematics: {predictedIssue}
        </p>
      )}
    </div>
  );
}
