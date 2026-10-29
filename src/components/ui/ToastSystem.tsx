'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { springs } from '@/lib/motion';

export type ToastVariant = 'success' | 'warning' | 'danger' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastItem = { ...toast, id };
    setToasts(prev => [...prev.slice(-4), newToast]); // keep at most 5
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return graceful fallback so components don't crash if used outside provider
    return {
      showToast: (t: Omit<ToastItem, 'id'>) => console.log('Toast:', t),
      dismissToast: () => {},
      toasts: []
    };
  }
  return context;
};

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastCard: React.FC<{
  toast: ToastItem;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  const shouldReduce = useReducedMotion();
  const duration = toast.duration || 4500;
  const variant = toast.variant || 'info';

  const icons: Record<ToastVariant, React.ReactNode> = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
    danger: <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />,
    info: <Info className="h-4 w-4 text-sky-400 shrink-0" />
  };

  const borderColors: Record<ToastVariant, string> = {
    success: 'border-emerald-500/30 bg-surface/95',
    warning: 'border-amber-500/30 bg-surface/95',
    danger: 'border-rose-500/40 bg-surface/95',
    info: 'border-sky-500/30 bg-surface/95'
  };

  const progressColors: Record<ToastVariant, string> = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-sky-400'
  };

  return (
    <motion.div
      layout
      initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduce ? { opacity: 0 } : { opacity: 0, x: 80, scale: 0.95 }}
      transition={springs.snappy}
      drag={shouldReduce ? false : 'x'}
      dragConstraints={{ left: 0, right: 200 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80) onDismiss();
      }}
      className={`relative pointer-events-auto overflow-hidden rounded-xl border p-4 shadow-xl backdrop-blur-md ${borderColors[variant]}`}
    >
      <div className="flex items-start gap-3">
        {icons[variant]}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white tracking-tight">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-[11px] text-text-secondary leading-snug">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="rounded p-1 text-text-muted hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress timer bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        onAnimationComplete={onDismiss}
        className={`absolute bottom-0 left-0 h-[2px] ${progressColors[variant]}`}
      />
    </motion.div>
  );
};
