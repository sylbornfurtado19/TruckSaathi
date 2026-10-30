'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface EwayBillBadgeProps {
  ewayBillNumber?: string;
  ewayBillExpiry?: string;
  size?: 'sm' | 'md';
  showDetails?: boolean;
}

export function EwayBillBadge({
  ewayBillNumber,
  ewayBillExpiry,
  size = 'md',
  showDetails = false
}: EwayBillBadgeProps) {
  if (!ewayBillNumber) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-white/5 border border-white/10 text-text-muted">
        <FileText className="w-3 h-3 text-text-muted" />
        No E-Way Bill
      </span>
    );
  }

  // Reference date: current or mock simulation date
  const now = new Date('2026-08-06T12:00:00Z').getTime();
  const expiryTime = ewayBillExpiry ? new Date(ewayBillExpiry).getTime() : 0;
  const hoursRemaining = expiryTime ? Math.round((expiryTime - now) / (1000 * 60 * 60)) : 0;

  // Maximum standard validity for ~72h interstate corridor
  const maxHours = 72;
  const progressRatio = Math.max(0, Math.min(1, hoursRemaining / maxHours));

  // Determine status color and label
  let status: 'compliant' | 'expiring' | 'expired' = 'compliant';
  let color = '#10b981'; // emerald
  let label = `${hoursRemaining}h left`;

  if (hoursRemaining <= 0) {
    status = 'expired';
    color = '#ef4444'; // red
    label = 'Expired';
  } else if (hoursRemaining <= 24) {
    status = 'expiring';
    color = '#f59e0b'; // amber
    label = `${hoursRemaining}h left`;
  }

  // SVG Ring dimensions
  const radius = size === 'sm' ? 7 : 9;
  const strokeWidth = size === 'sm' ? 2 : 2.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium transition-colors ${
          status === 'expired'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : status === 'expiring'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}
        title={`GST E-Way Bill: ${ewayBillNumber} (Expires: ${ewayBillExpiry || 'N/A'})`}
      >
        {/* Animated Countdown SVG Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={svgSize} height={svgSize} className="-rotate-90">
            {/* Background track */}
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="opacity-20 text-white"
              fill="transparent"
            />
            {/* Progress fill */}
            <motion.circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          {status === 'expired' ? (
            <span className="absolute w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          ) : null}
        </div>

        <span className="font-semibold">{label}</span>
      </div>

      {showDetails && (
        <span className="text-[11px] font-mono text-text-muted truncate max-w-[140px]" title={ewayBillNumber}>
          {ewayBillNumber}
        </span>
      )}
    </div>
  );
}

