'use client';

import React, { useState } from 'react';
import { Bell, Shield, Clock, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { PageHeader, Card, Button, Badge, AnimatedPage, itemVariants } from '@/components/ui';

export function SettingsContent() {
  const { activityLogs, vehicles, drivers, trips } = useApp();
  const [activeTab, setActiveTab] = useState<'general' | 'audit'>('general');

  return (
    <AnimatedPage>
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="System Settings & Audit Logs"
          description="Organization thresholds, compliance alerts, security preferences, and audit trails."
        />
      </motion.div>

      {/* Tabs & Content Container */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex border-b border-[#202736] gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'general' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent hover:text-slate-200'
          }`}
        >
          General Configuration & Thresholds
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'audit' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent hover:text-slate-200'
          }`}
        >
          System Audit Stream ({activityLogs.length})
        </button>
      </div>

      {activeTab === 'general' ? (
        <Card glow="blue" className="p-6 space-y-6 max-w-3xl text-xs">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Compliance Document Expiry Thresholds</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Warning Threshold (Days Before Expiry)</label>
                <input
                  type="number"
                  defaultValue={30}
                  className="w-full bg-[#1c2333]/80 border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Critical Alert Threshold (Days)</label>
                <input
                  type="number"
                  defaultValue={7}
                  className="w-full bg-[#1c2333]/80 border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#202736] space-y-4">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Security & Session Policies</span>
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/80" />
                <span>Enforce Row Level Security (RLS) on Supabase PostgreSQL tables</span>
              </label>

              <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/80" />
                <span>Require 2FA authentication for Company Admin users</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#202736]">
            <Button variant="primary">Save Settings Configuration</Button>
          </div>
        </Card>
      ) : (
        <Card glow="blue" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#202736] pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">Live System Activity Audit Stream</h2>
              <p className="text-xs text-slate-400">Complete audit trail of fleet operations, document updates, and administrative events</p>
            </div>
          </div>

          <div className="divide-y divide-[#202736]/60">
            {activityLogs.map(log => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs hover:bg-[#1c2333]/40 px-2.5 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono text-[11px] font-bold">
                    {log.user.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{log.action}</div>
                    <div className="text-[11px] text-slate-500">
                      By {log.user} ({log.role}) • <span className="text-blue-400 font-medium">{log.module}</span>
                    </div>
                  </div>
                </div>
                <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Cross-Cutting Document Expiry Digest */}
      <Card glow="blue" className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#202736] pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-400" />
              Unified Document Expiry Compliance Digest
            </h2>
            <p className="text-xs text-slate-400">Prioritized cross-cutting compliance overview across Vehicles (RC/Insurance/Fitness), Drivers (DL), and Trips (E-Way Bills)</p>
          </div>
        </div>

        <div className="divide-y divide-[#202736]/60">
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
              <div key={i} className="py-3 flex items-center justify-between text-xs hover:bg-[#1c2333]/40 px-2.5 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Badge variant={doc.status.variant}>{doc.status.label}</Badge>
                  <div>
                    <span className="font-bold text-slate-200">{doc.name}</span>
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
