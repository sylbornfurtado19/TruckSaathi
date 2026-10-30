'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, CloudUpload, CheckCircle2, Clock } from 'lucide-react';
import { useMotionSafe } from '@/lib/motion';

export function OfflineSyncDemo() {
  const { shouldReduce } = useMotionSafe();
  const [isOffline, setIsOffline] = useState(false);
  const [queuedItems, setQueuedItems] = useState<string[]>([
    'FASTag Toll Plaza Cleared (NH-48 Km 142)',
    'Weighbridge Gross Weight Verified: 28.5 MT',
    'Consignee Bay Entry Timestamp'
  ]);
  const [syncedItems, setSyncedItems] = useState<string[]>([]);

  const toggleConnection = () => {
    if (!isOffline) {
      // Go offline
      setIsOffline(true);
      setSyncedItems([]);
    } else {
      // Reconnect and animate sync flush
      setIsOffline(false);
      queuedItems.forEach((item, idx) => {
        setTimeout(() => {
          setSyncedItems(prev => [...prev, item]);
        }, (idx + 1) * 600);
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Simulation Toggle Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-white/8 bg-surface-muted/60 text-xs">
        <div className="flex items-center gap-2">
          {isOffline ? (
            <WifiOff className="w-4 h-4 text-amber-400" />
          ) : (
            <Wifi className="w-4 h-4 text-emerald-400" />
          )}
          <span className="font-semibold text-text-primary">
            Corridor Network Link: {isOffline ? 'No Satellite Signal (Dead Zone)' : '5G Connected'}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleConnection}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isOffline
              ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-sm'
              : 'border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          {isOffline ? 'Restore Network Connection' : 'Simulate Offline Dead-Zone'}
        </button>
      </div>

      {/* Offline Mode Alert Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300">
              <span className="flex items-center gap-2">
                <CloudUpload className="w-4 h-4" />
                Offline: Saved on Device Cache
              </span>
              <span>{queuedItems.length} Actions Queued</span>
            </div>

            {/* Queued Action Stack */}
            <div className="space-y-2">
              {queuedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface/80 border border-white/6 text-xs"
                >
                  <span className="text-slate-200">{item}</span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3" /> Queued Locally
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Syncing Toast / Reconnected Status */}
      <AnimatePresence>
        {!isOffline && syncedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs text-emerald-300 space-y-1.5 font-mono"
          >
            <div className="flex items-center gap-2 font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Offline Cache Synced with Mission Control:</span>
            </div>
            {syncedItems.map((item, idx) => (
              <div key={idx} className="text-[11px] text-emerald-200/90 pl-6">
                ✓ {item} uploaded to Supabase
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

