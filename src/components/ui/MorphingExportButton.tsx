'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Check, Loader2 } from 'lucide-react';
import { useMotionSafe } from '@/lib/motion';

interface MorphingExportButtonProps {
  onExport: () => void | Promise<void>;
  label?: string;
  size?: 'sm' | 'md';
}

export function MorphingExportButton({
  onExport,
  label = 'Export CSV',
  size = 'sm'
}: MorphingExportButtonProps) {
  const { shouldReduce } = useMotionSafe();
  const [status, setStatus] = useState<'idle' | 'progress' | 'complete'>('idle');

  const handleClick = async () => {
    if (status !== 'idle') return;
    setStatus('progress');

    try {
      await onExport();
      setTimeout(() => {
        setStatus('complete');
        setTimeout(() => {
          setStatus('idle');
        }, 2200);
      }, 700);
    } catch {
      setStatus('idle');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status !== 'idle'}
      className={`relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-xl font-bold transition-all border shadow-sm ${
        status === 'complete'
          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          : status === 'progress'
          ? 'bg-brand-orange/20 border-brand-orange/40 text-brand-orange'
          : 'bg-surface-muted hover:bg-white/10 border-white/10 text-slate-200'
      } ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
    >
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{label}</span>
          </motion.span>
        )}

        {status === 'progress' && (
          <motion.span
            key="progress"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 font-mono"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-orange" />
            <span>Generating...</span>
          </motion.span>
        )}

        {status === 'complete' && (
          <motion.span
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 font-semibold text-emerald-400"
          >
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>Ready!</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

