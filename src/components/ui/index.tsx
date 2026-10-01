'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ArrowDown, ArrowUp, Loader2, X, AlertTriangle } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-surface';

/* =========================================================================
   1. BUTTON
   ========================================================================= */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber' | 'cyan';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-brand-orange text-white hover:bg-orange-600 border border-brand-orange shadow-sm',
    secondary: 'bg-surface-muted text-text-primary hover:bg-slate-800 border border-border shadow-sm',
    outline: 'bg-transparent text-text-primary hover:bg-surface-muted border border-border',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-muted border border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-500 border border-red-600 shadow-sm',
    amber: 'bg-amber-600 text-white hover:bg-amber-500 border border-amber-600 shadow-sm',
    cyan: 'bg-sky-600 text-white hover:bg-sky-500 border border-sky-600 shadow-sm'
  };

  const sizes = {
    xs: 'min-h-7 px-2.5 text-xs gap-1 rounded-md font-medium',
    sm: 'min-h-8 px-3 text-xs gap-1.5 rounded-md font-semibold',
    md: 'min-h-9 px-4 text-sm gap-2 rounded-lg font-semibold',
    lg: 'min-h-11 px-5 text-sm gap-2.5 rounded-lg font-bold'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : icon ? <span className="shrink-0">{icon}</span> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
};

/* =========================================================================
   2. HOLD-TO-ACTIVATE SOS BUTTON
   ========================================================================= */
export const HoldToActivateButton: React.FC<{
  onActivate: () => void;
  holdTimeMs?: number;
  label?: string;
  className?: string;
}> = ({
  onActivate,
  holdTimeMs = 1800,
  label = 'HOLD TO ACTIVATE SOS',
  className = ''
}) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startHold = () => {
    setHolding(true);
    startTimeRef.current = performance.now();

    const step = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const pct = Math.min((elapsed / holdTimeMs) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        setHolding(false);
        setProgress(0);
        startTimeRef.current = null;
        onActivate();
      } else {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  const cancelHold = () => {
    setHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-red-500/30 bg-red-950/20 select-none ${className}`}>
      {/* Progress fill bar */}
      <div
        className="absolute inset-y-0 left-0 bg-red-600/40 transition-[width] ease-linear"
        style={{ width: `${progress}%` }}
      />

      <button
        type="button"
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        className="relative z-10 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 px-5 py-3.5 text-center text-sm font-black tracking-wider text-rose-300 transition-colors hover:text-white"
      >
        <AlertTriangle className={`h-4 w-4 text-rose-400 ${holding ? 'animate-bounce' : ''}`} />
        <span>{holding ? `HOLDING... ${Math.round(progress)}%` : label}</span>
      </button>
    </div>
  );
};

/* =========================================================================
   3. PANEL & CARD
   ========================================================================= */
export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  header?: React.ReactNode;
}> = ({ children, className = '', onClick, header }) => (
  <div
    onClick={onClick}
    className={`rounded-xl border border-border bg-surface shadow-sm ${
      onClick ? 'cursor-pointer hover:border-border/80 transition-colors' : ''
    } ${className}`}
  >
    {header && <div className="border-b border-border/80 px-4 py-3 sm:px-5">{header}</div>}
    {children}
  </div>
);

export const Panel: React.FC<{
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, badge, actions, children, className = '' }) => (
  <div className={`rounded-xl border border-border bg-surface shadow-sm ${className}`}>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-4 py-3 sm:px-5">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-text-primary tracking-tight">{title}</h3>
          {badge}
        </div>
        {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </div>
);

/* =========================================================================
   4. STATUS PILL & BADGE
   ========================================================================= */
export type StatusVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'cyan'
  | 'neutral'
  | 'maintenance'
  | 'vibe';

const statusStyles: Record<StatusVariant, string> = {
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  danger: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
  info: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
  cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
  neutral: 'bg-slate-500/10 text-slate-300 border-slate-500/25',
  maintenance: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
  vibe: 'bg-orange-500/10 text-orange-300 border-orange-500/25'
};

const statusDots: Record<StatusVariant, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  info: 'bg-sky-400',
  cyan: 'bg-cyan-400',
  neutral: 'bg-slate-400',
  maintenance: 'bg-violet-400',
  vibe: 'bg-orange-400'
};

export const StatusPill: React.FC<{
  children: React.ReactNode;
  status?: StatusVariant;
  variant?: StatusVariant;
  className?: string;
  pulse?: boolean;
}> = ({ children, status = 'neutral', variant, className = '', pulse }) => {
  const resolved = variant || status;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${statusStyles[resolved]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusDots[resolved]} ${pulse ? 'animate-pulse' : ''}`} />
      <span>{children}</span>
    </span>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: StatusVariant;
  pulse?: boolean;
  className?: string;
}> = ({ children, variant = 'neutral', pulse, className = '' }) => (
  <StatusPill status={variant} pulse={pulse} className={className}>
    {children}
  </StatusPill>
);

/* =========================================================================
   5. INPUTS & FORMS
   ========================================================================= */
export const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }
> = ({ icon, className = '', ...props }) => (
  <div className="relative w-full">
    {icon && (
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
        {icon}
      </span>
    )}
    <input
      className={`h-9 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-focus ${
        icon ? 'pl-9' : ''
      } ${focusRing} ${className}`}
      {...props}
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className = '',
  ...props
}) => (
  <select
    className={`h-9 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary transition-colors focus:border-focus ${focusRing} ${className}`}
    {...props}
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className = '',
  ...props
}) => (
  <textarea
    className={`w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-focus ${focusRing} ${className}`}
    {...props}
  />
);

/* =========================================================================
   6. TABLE
   ========================================================================= */
export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className = '',
  ...props
}) => (
  <div className="overflow-x-auto rounded-xl border border-border bg-surface">
    <table className={`w-full border-collapse text-left text-sm ${className}`} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  ...props
}) => (
  <thead
    className={`sticky top-0 bg-surface-muted/80 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider text-text-secondary border-b border-border ${className}`}
    {...props}
  />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = '',
  ...props
}) => <tbody className={`divide-y divide-border/60 ${className}`} {...props} />;

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = '',
  ...props
}) => (
  <tr
    className={`h-12 transition-colors duration-150 hover:bg-surface-muted/50 ${className}`}
    {...props}
  />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  ...props
}) => <th className={`px-4 py-3 text-left font-medium ${className}`} {...props} />;

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = '',
  ...props
}) => <td className={`px-4 py-3 text-text-primary ${className}`} {...props} />;

/* =========================================================================
   7. PAGE HEADER & METRICS
   ========================================================================= */
export const PageHeader: React.FC<{
  title: string;
  description?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, description, subtitle, badge, actions }) => (
  <div className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60">
    <div>
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">{title}</h1>
        {badge}
      </div>
      {(description || subtitle) && (
        <p className="mt-0.5 text-xs text-text-secondary leading-relaxed max-w-3xl">
          {description || subtitle}
        </p>
      )}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

export const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => (
  <span className="tabular-nums font-semibold">{value}</span>
);

interface KpiProps {
  title?: string;
  label?: string;
  value?: string | number;
  number?: string | number;
  subtext?: string;
  delta?: string;
  trend?: { direction?: 'up' | 'down'; isPositive?: boolean; value: string };
  icon?: React.ReactNode;
  iconBg?: string;
  glow?: string;
  sparkline?: React.ReactNode;
}

export const KpiCard: React.FC<KpiProps> = ({
  title,
  label,
  value,
  number,
  subtext,
  delta,
  trend,
  icon,
  sparkline
}) => {
  const change = delta || trend?.value;
  const positive = trend?.isPositive ?? (trend?.direction ? trend.direction === 'up' : true);
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-sm hover:border-border/80 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {label || title}
        </span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <span className="font-mono text-2xl font-black text-text-primary tracking-tight">
          {number ?? value}
        </span>
        {change && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              positive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {change}
          </span>
        )}
      </div>
      {subtext && <span className="mt-1 text-[11px] text-text-muted truncate">{subtext}</span>}
      {sparkline}
    </div>
  );
};

export const KPICard: React.FC<KpiProps> = props => <KpiCard {...props} />;

/* =========================================================================
   8. UNIFIED KPI COMMAND STRIP (NOT GIANT SEPARATE BALLOON CARDS)
   ========================================================================= */
export interface KpiStripItem {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  status?: StatusVariant;
  onClick?: () => void;
}

export const KpiStrip: React.FC<{ items: KpiStripItem[]; className?: string }> = ({
  items,
  className = ''
}) => {
  return (
    <div
      className={`grid grid-cols-2 divide-y divide-border border border-border bg-surface sm:grid-cols-3 sm:divide-y-0 sm:divide-x lg:grid-cols-6 rounded-xl shadow-sm overflow-hidden ${className}`}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          onClick={item.onClick}
          className={`flex flex-col justify-between p-3.5 transition-colors ${
            item.onClick ? 'cursor-pointer hover:bg-surface-muted/60' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary truncate">
              {item.label}
            </span>
            {item.icon && <span className="text-text-muted shrink-0">{item.icon}</span>}
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-text-primary">
              {item.value}
            </span>
            {item.status && (
              <span
                className={`h-2 w-2 rounded-full ${statusDots[item.status]}`}
                title={item.subtext}
              />
            )}
          </div>
          {item.subtext && (
            <span className="mt-1 text-[11px] text-text-muted truncate">{item.subtext}</span>
          )}
        </div>
      ))}
    </div>
  );
};

/* =========================================================================
   9. MODAL & DRAWER
   ========================================================================= */
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | string;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, description, children, size = 'lg', maxWidth }) => {
  useEffect(() => {
    const key = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', key);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', key);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const sizes: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <button className="absolute inset-0 cursor-default" aria-label="Close modal" onClick={onClose} />
      <div
        className={`relative z-10 w-full rounded-2xl border border-border bg-surface p-6 shadow-2xl ${
          maxWidth || sizes[size] || sizes.lg
        }`}
      >
        <div className="mb-4 flex items-start justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-text-primary tracking-tight">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-text-secondary">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className={`rounded-md p-1.5 text-text-secondary hover:bg-surface-muted hover:text-white ${focusRing}`}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
};

export const Drawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, subtitle, children }) => {
  useEffect(() => {
    const key = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', key);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', key);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs">
      <button className="absolute inset-0 cursor-default" aria-label="Close drawer" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-border bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className={`rounded-md p-1.5 text-text-secondary hover:bg-surface-muted hover:text-white ${focusRing}`}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>{children}</div>
      </aside>
    </div>
  );
};

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-border p-10 text-center">
    <div className="text-brand-orange">{icon}</div>
    <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
    <p className="max-w-sm text-xs text-text-secondary">{description}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-md bg-surface-muted animate-pulse ${className}`} aria-hidden="true" />
);

export const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15 } }
};

export const RouteDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`route-line-divider my-4 ${className}`} />
);

export const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="space-y-5"
    >
      {children}
    </motion.div>
  );
};