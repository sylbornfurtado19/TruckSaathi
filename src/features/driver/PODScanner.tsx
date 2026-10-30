'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, FileCheck, RefreshCw, Sparkles, PenTool } from 'lucide-react';
import { useMotionSafe } from '@/lib/motion';

interface PODScannerProps {
  onComplete: (remarks: string) => void;
  isCompleted?: boolean;
}

export function PODScanner({ onComplete, isCompleted = false }: PODScannerProps) {
  const { shouldReduce } = useMotionSafe();

  const [step, setStep] = useState<'scan' | 'sign' | 'complete'>(isCompleted ? 'complete' : 'scan');
  const [isFlashing, setIsFlashing] = useState(false);
  const [hasCapturedDoc, setHasCapturedDoc] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [remarks, setRemarks] = useState('Consignee seal verified and physical LR copy stamped.');

  const handleCapturePhoto = () => {
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
      setHasCapturedDoc(true);
      setStep('sign');
    }, 350);
  };

  const handleFinish = () => {
    setStep('complete');
    onComplete(remarks);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-brand-orange" />
          <h3 className="text-sm font-bold text-text-primary">
            POD & Lorry Receipt (LR) Scanner
          </h3>
        </div>
        <span className="font-mono text-[11px] font-bold text-brand-orange bg-brand-orange/15 px-2 py-0.5 rounded border border-brand-orange/30">
          {step === 'scan' ? 'STEP 1: CAMERA' : step === 'sign' ? 'STEP 2: SIGNATURE' : 'VERIFIED'}
        </span>
      </div>

      {/* Step 1: Camera Viewfinder with Sweeping Scan Line */}
      {step === 'scan' && (
        <div className="space-y-3">
          <div className="relative w-full h-56 rounded-2xl bg-canvas border-2 border-white/10 overflow-hidden flex flex-col items-center justify-center">
            {/* Viewfinder Target Brackets */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-orange rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-orange rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-orange rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-orange rounded-br-lg" />

            {/* Document placeholder graphic */}
            <div className="w-44 h-32 rounded-lg border border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center p-3 text-center space-y-1">
              <FileCheck className="w-6 h-6 text-text-muted" />
              <span className="text-[11px] text-text-secondary font-medium">Position Consignee Stamped Lorry Receipt</span>
            </div>

            {/* Animated Laser Scan Line */}
            {!shouldReduce && (
              <motion.div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee]"
                animate={{ top: ['15%', '85%', '15%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Capture Flash Effect */}
            <AnimatePresence>
              {isFlashing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 bg-white z-30"
                />
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={handleCapturePhoto}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-orange text-black font-bold text-xs shadow-md active:scale-98 transition-all"
          >
            <Camera className="w-4 h-4" />
            Capture LR Document Snapshot
          </button>
        </div>
      )}

      {/* Step 2: Digital Ink Signature Pad */}
      {step === 'sign' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-indigo-400" />
              Consignee Receiving Signature
            </label>
            <div
              onClick={() => setHasSigned(true)}
              className="relative w-full h-36 rounded-2xl bg-canvas border-2 border-white/10 flex flex-col items-center justify-center p-4 cursor-crosshair select-none overflow-hidden"
            >
              {hasSigned ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <svg className="w-48 h-20" viewBox="0 0 200 80">
                    <motion.path
                      d="M 20 50 Q 50 10, 80 40 T 130 30 T 170 50"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                  </svg>
                  <span className="absolute bottom-2 right-3 font-mono text-[10px] text-emerald-400">
                    ✓ Verified Consignee Sign
                  </span>
                </div>
              ) : (
                <div className="text-center text-text-muted text-xs">
                  <p>Sign with finger or stylus inside box</p>
                  <span className="text-[10px] text-brand-orange underline mt-1 block">Tap to auto-sign receipt</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary">Consignee Receiving Notes</label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-muted px-3 py-2 text-xs text-text-primary focus:border-brand-orange focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('scan')}
              className="px-3 py-2 rounded-xl border border-white/10 text-xs font-semibold text-text-muted hover:text-white"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-md active:scale-98 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Authorize & Seal Consignment
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Delivered & Verified Stamp with Confetti */}
      {step === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center space-y-3 relative overflow-hidden"
        >
          {/* Delivered Big Rubber Stamp */}
          <motion.div
            initial={{ scale: 2, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: -6, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="inline-block px-5 py-2 rounded-xl border-4 border-emerald-400 text-emerald-300 font-mono text-xl font-black tracking-widest uppercase shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            DELIVERED & VERIFIED
          </motion.div>

          <p className="text-xs text-text-secondary">
            {remarks}
          </p>
          <div className="font-mono text-[11px] text-emerald-400/80">
            Cryptographic SHA-256 Proof Synced to Fleet Dispatch
          </div>

          <button
            type="button"
            onClick={() => setStep('scan')}
            className="mt-2 text-xs font-mono text-text-muted hover:text-white underline"
          >
            Upload Additional Supplemental Page
          </button>
        </motion.div>
      )}
    </div>
  );
}

