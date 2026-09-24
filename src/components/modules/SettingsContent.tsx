'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Shield, Clock, FileCheck, CheckCircle2, ShieldCheck, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { PageHeader, Card, Button, Badge, AnimatedPage, itemVariants } from '@/components/ui';

export function SettingsContent() {
  const { activityLogs, vehicles, drivers, trips } = useApp();
  const [activeTab, setActiveTab] = useState<'general' | 'audit'>('general');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.localStorage.getItem('trucksaathi-theme') === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('trucksaathi-theme', nextTheme);
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-secondary">
              <ShieldCheck className="w-3.5 h-3.5" />
              Platform Controls
            </span>
          }
          title="System Settings & Audit Logs"
          description="Organization compliance parameters, document renewal thresholds, Supabase security policies, and system audit trails."
        />
      </motion.div>

      {/* 2. Tabs & Content Container */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex gap-6 border-b border-border text-xs font-medium text-text-secondary">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'general' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>General Configuration & Expiry Thresholds</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'audit' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Live Audit Stream ({activityLogs.length})</span>
          </button>
        </div>

        {activeTab === 'general' ? (
          <Card className="max-w-3xl space-y-6 p-6 text-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-sm font-bold text-text-primary">Appearance</h2>
                <p className="mt-1 text-sm text-text-secondary">Choose the display theme for this device.</p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} icon={theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}>
                {theme === 'light' ? 'Dark theme' : 'Light theme'}
              </Button>
            </div>
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Compliance Document Expiry Thresholds</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Warning Threshold (Days Before Expiry)</label>
                  <input
                    type="number"
                    defaultValue={30}
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Critical Alert Threshold (Days)</label>
                  <input
                    type="number"
                    defaultValue={7}
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Security & Session Policies</span>
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border bg-surface accent-brand-orange" />
                  <span>Enforce Row Level Security (RLS) on Supabase PostgreSQL tables</span>
                </label>

                <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border bg-surface accent-brand-orange" />
                  <span>Require 2FA authentication for Company Admin users</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button variant="primary" onClick={handleSave}>
                Save Settings Configuration
              </Button>
              {savedSuccess && (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Preferences saved
                </span>
              )}
            </div>
          </Card>
        ) : (
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Live System Activity Audit Stream
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Chronological audit trail of fleet operations, document uploads, and access events</p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {activityLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between rounded-control px-3 py-3 text-sm transition-colors hover:bg-surface-muted">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted font-mono text-xs font-bold text-brand-orange">
                      {log.user.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{log.action}</div>
                      <div className="text-xs text-text-secondary">
                        By {log.user} ({log.role}) • <span className="text-blue-400 font-medium">{log.module}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-text-secondary">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Cross-Cutting Document Expiry Digest */}
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-400" />
                Unified Document Expiry Compliance Digest
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Cross-cutting compliance overview across Vehicles (RC/Insurance/Fitness), Drivers (DL), and Dispatches (E-Way Bills)</p>
            </div>
          </div>

          <div className="divide-y divide-border">
            {(() => {
              const allDocs: Array<{
                entity: string;
                type: string;
                name: string;
                expiry: string;
                status: { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' };
              }> = [];

              const now = new Date('2026-08-06').getTime();

              const calcStatus = (dateStr: string) => {
                const exp = new Date(dateStr).getTime();
                const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) return { label: 'Expired', variant: 'danger' as const, days: diffDays };
                if (diffDays <= 30) return { label: 'Expiring Soon', variant: 'warning' as const, days: diffDays };
                return { label: 'Compliant', variant: 'success' as const, days: diffDays };
              };

              vehicles.forEach(v => {
                if (v.rcExpiry) {
                  const st = calcStatus(v.rcExpiry);
                  allDocs.push({ entity: 'Vehicle', type: 'RC Certificate', name: v.regNumber, expiry: v.rcExpiry, status: st });
                }
                if (v.insuranceExpiry) {
                  const st = calcStatus(v.insuranceExpiry);
                  allDocs.push({ entity: 'Vehicle', type: 'Insurance Policy', name: v.regNumber, expiry: v.insuranceExpiry, status: st });
                }
                if (v.fitnessExpiry) {
                  const st = calcStatus(v.fitnessExpiry);
                  allDocs.push({ entity: 'Vehicle', type: 'Fitness Certificate', name: v.regNumber, expiry: v.fitnessExpiry, status: st });
                }
              });

              drivers.forEach(d => {
                if (d.licenseExpiry) {
                  const st = calcStatus(d.licenseExpiry);
                  allDocs.push({ entity: 'Driver', type: 'Commercial License', name: d.fullName, expiry: d.licenseExpiry, status: st });
                }
              });

              trips.forEach(t => {
                if (t.ewayBillExpiry) {
                  const st = calcStatus(t.ewayBillExpiry);
                  allDocs.push({ entity: 'Trip', type: 'E-Way Bill', name: t.tripCode, expiry: t.ewayBillExpiry, status: st });
                }
              });

              const sortedDocs = allDocs.sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());

              return sortedDocs.map((doc, i) => (
                <div key={i} className="flex items-center justify-between rounded-control px-3 py-3 text-sm transition-colors hover:bg-surface-muted">
                  <div className="flex items-center gap-3">
                    <Badge variant={doc.status.variant}>{doc.status.label}</Badge>
                    <div>
                      <span className="font-bold text-slate-100 font-mono">{doc.name}</span>
                      <span className="text-slate-400"> — {doc.type} ({doc.entity})</span>
                    </div>
                  </div>
                  <div className="font-mono text-slate-300 font-medium">
                    Expires: {doc.expiry}
                  </div>
                </div>
              ));
            })()}
          </div>
        </Card>
      </motion.div>
    </AnimatedPage>
  );
}
