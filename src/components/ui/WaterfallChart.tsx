'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMotionSafe, springs } from '@/lib/motion';

export interface WaterfallItem {
  label: string;
  amount: number;
  type: 'revenue' | 'expense' | 'total';
  color?: string;
}

interface WaterfallChartProps {
  items: WaterfallItem[];
  title?: string;
}

export function WaterfallChart({ items, title = 'Corridor P&L Waterfall Breakdown' }: WaterfallChartProps) {
  const { shouldReduce } = useMotionSafe();

  const maxVal = Math.max(...items.map(i => Math.abs(i.amount)), 1);

  return (
    <div className="rounded-2xl border border-white/8 bg-surface-muted/50 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between border-b border-white/8 pb-3">
        <h3 className="text-sm font-bold text-text-primary tracking-tight">{title}</h3>
        <span className="font-mono text-xs text-text-muted">Sequenced Cashflow</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
        {items.map((item, idx) => {
          const heightRatio = Math.max(0.12, Math.abs(item.amount) / maxVal);
          const isRevenue = item.type === 'revenue';
          const isExpense = item.type === 'expense';
          const isTotal = item.type === 'total';

          const barColor = isRevenue
            ? 'bg-blue-500'
            : isTotal
            ? item.amount >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
            : 'bg-amber-500/90';

          return (
            <div key={item.label} className="flex flex-col items-center space-y-2">
              <span className="font-mono text-xs font-bold text-slate-100">
                {isExpense ? '-' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN')}
              </span>

              {/* Bar track container */}
              <div className="relative w-12 h-36 rounded-xl bg-canvas border border-white/6 flex items-end justify-center p-1 overflow-hidden">
                <motion.div
                  className={`w-full rounded-lg ${barColor} shadow-md`}
                  initial={shouldReduce ? { height: `${heightRatio * 100}%` } : { height: '0%' }}
                  animate={{ height: `${heightRatio * 100}%` }}
                  transition={{
                    duration: 0.7,
                    delay: shouldReduce ? 0 : idx * 0.12,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                />
              </div>

              <span className="text-[11px] font-medium text-text-secondary text-center truncate max-w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

