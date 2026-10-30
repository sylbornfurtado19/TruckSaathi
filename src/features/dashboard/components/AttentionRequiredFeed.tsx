'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export interface UrgentItem {
  id: string;
  urgency: 'critical' | 'high' | 'medium' | 'info';
  type: 'sos' | 'breakdown' | 'delayed' | 'doc_expired' | 'fuel_theft' | 'service';
  title: string;
  description: string;
  timestamp?: string;
  actionLabel: string;
  onAction: () => void;
}

interface AttentionRequiredFeedProps {
  items: UrgentItem[];
  isSosActive: boolean;
}

export function AttentionRequiredFeed({ items, isSosActive }: AttentionRequiredFeedProps) {
  if (items.length === 0) return null;

  return (
    <div className="relative">
      {/* Screen-edge red vignette pulse when an emergency SOS is active */}
      {isSosActive && (
        <div className="pointer-events-none fixed inset-0 z-50 animate-pulse border-8 border-rose-500/40 shadow-[inset_0_0_80px_rgba(244,63,94,0.35)]" />
      )}

      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Subtle background ambient pulse glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Feed Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-rose-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${isSosActive ? 'bg-rose-500 text-white animate-bounce border-rose-400' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
              <AlertTriangle className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-rose-300 flex items-center gap-2">
                <span>ATTENTION REQUIRED</span>
                <span className="rounded-full bg-rose-500/30 px-2 py-0.5 font-mono text-[10px] text-rose-200">
                  {items.length} ACTIVE ALERTS
                </span>
              </h2>
            </div>
          </div>
          <span className="font-mono text-xs text-rose-400/80">
            Priority: Critical SOS → Breakdown → Transit Delays
          </span>
        </div>

        {/* Animated Grid of Urgent Action Items */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map(item => {
              const isCritical = item.urgency === 'critical';
              const isHigh = item.urgency === 'high';

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                    isCritical
                      ? 'border-rose-500/50 bg-rose-950/40 hover:border-rose-400 shadow-glow-rose/20'
                      : isHigh
                      ? 'border-amber-500/40 bg-amber-950/20 hover:border-amber-400'
                      : 'border-white/[0.08] bg-surface/80 hover:border-cyan-500/40'
                  }`}
                >
                  {/* Glowing pulse ring for critical SOS items */}
                  {isCritical && (
                    <div className="pointer-events-none absolute -inset-px rounded-xl border border-rose-500/60 animate-pulse-red" />
                  )}

                  <div>
                    {/* Header badge & immediate tag */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                            : 'bg-white/10 text-slate-300 border border-white/10'
                        }`}
                      >
                        {item.urgency}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                        LIVE
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-text-primary group-hover:text-white transition-colors line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="mt-1.5 text-[11px] text-text-secondary leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Action trigger button */}
                  <div className="mt-4 pt-2.5 border-t border-white/[0.06] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={item.onAction}
                      className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold transition-all cursor-pointer ${
                        isCritical
                          ? 'text-rose-300 hover:text-white group-hover:translate-x-0.5'
                          : 'text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5'
                      }`}
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
