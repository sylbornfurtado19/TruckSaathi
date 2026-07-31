'use client';

import React from 'react';
import {
  Truck,
  CheckCircle2,
  Users,
  Wrench,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  FileCheck
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

export function DashboardContent() {
  const { vehicles, drivers, activityLogs } = useApp();

  const activeVehicles = vehicles.filter(v => v.maintenanceStatus === 'In Service').length;
  const maintenanceVehicles = vehicles.filter(v => v.maintenanceStatus !== 'In Service').length;
  const expiringDocs = vehicles.filter(v => v.docStatus === 'Expiring Soon' || v.docStatus === 'Expired').length;

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Operational Overview</h1>
          <p className="text-sm text-slate-400">
            Real-time fleet health, document compliance, and dispatch readiness metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs bg-[#121824] border border-[#202736] text-slate-300 hover:text-white px-3 py-2 rounded-lg font-medium transition-colors">
            Period: Today
          </button>
          <Link
            href="/vehicles"
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Asset</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121824] border border-[#202736] rounded-xl p-5 hover:border-[#2e374a] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Fleet Assets</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-bold text-slate-50">{vehicles.length}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <span>+2 added this month</span>
          </div>
        </div>

        <div className="bg-[#121824] border border-[#202736] rounded-xl p-5 hover:border-[#2e374a] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Vehicles</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-bold text-slate-50">{activeVehicles}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <span>{Math.round((activeVehicles / (vehicles.length || 1)) * 100)}% active utilization</span>
          </div>
        </div>

        <div className="bg-[#121824] border border-[#202736] rounded-xl p-5 hover:border-[#2e374a] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Onboarded Drivers</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-bold text-slate-50">{drivers.length}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <span>{drivers.filter(d => d.assignedVehicle).length} assigned to trucks</span>
          </div>
        </div>

        <div className="bg-[#121824] border border-[#202736] rounded-xl p-5 hover:border-[#2e374a] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Maintenance & Alerts</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-3xl font-bold text-slate-50">{maintenanceVehicles}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
            <span>{expiringDocs} compliance issues</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Chart & Operational Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fleet Status Visual Breakdown */}
        <div className="lg:col-span-2 bg-[#121824] border border-[#202736] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#202736]">
              <div>
                <h2 className="text-base font-semibold text-slate-100">Fleet Operational Distribution</h2>
                <p className="text-xs text-slate-400">Current status classification across commercial assets</p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-[#1c2333] px-2.5 py-1 rounded-md border border-[#2e374a]">
                Live Status
              </span>
            </div>

            {/* Visual Bar Breakdown */}
            <div className="my-6 space-y-4">
              <div className="h-4 w-full bg-[#1c2333] rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${(activeVehicles / vehicles.length) * 100}%` }}></div>
                <div className="bg-amber-500 h-full" style={{ width: `${(1 / vehicles.length) * 100}%` }}></div>
                <div className="bg-rose-500 h-full" style={{ width: `${(1 / vehicles.length) * 100}%` }}></div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1c2333]/50 border border-[#202736]">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></div>
                  <div>
                    <div className="text-xs text-slate-400">In Service</div>
                    <div className="text-lg font-bold font-mono text-slate-100">{activeVehicles} Vehicles</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1c2333]/50 border border-[#202736]">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></div>
                  <div>
                    <div className="text-xs text-slate-400">Scheduled Service</div>
                    <div className="text-lg font-bold font-mono text-slate-100">1 Vehicle</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1c2333]/50 border border-[#202736]">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></div>
                  <div>
                    <div className="text-xs text-slate-400">Breakdown / Idle</div>
                    <div className="text-lg font-bold font-mono text-slate-100">1 Vehicle</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#202736] flex items-center justify-between text-xs text-slate-400">
            <span>Data synced with Supabase Realtime</span>
            <Link href="/vehicles" className="text-blue-400 hover:underline flex items-center gap-1 font-medium">
              View Detailed Assets <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Col: Compliance Alert & Quick Actions */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Compliance Box */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Compliance Attention Required</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              2 vehicles have documents (RC / Insurance / Fitness) expiring within 30 days. Upload renewed documents to prevent operational stops.
            </p>
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs p-2 rounded bg-[#121824] border border-amber-500/20">
                <span className="font-mono text-amber-300 font-medium">KA-01-EA-9011</span>
                <span className="text-[11px] text-amber-400 font-medium">Insurance in 5 days</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 rounded bg-[#121824] border border-rose-500/20">
                <span className="font-mono text-rose-300 font-medium">HR-55-AB-1290</span>
                <span className="text-[11px] text-rose-400 font-medium">RC EXPIRED</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-[#121824] border border-[#202736] rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/vehicles"
                className="p-3 rounded-lg bg-[#1c2333] hover:bg-[#262f42] border border-[#2e374a] text-left transition-colors flex flex-col gap-1.5"
              >
                <Truck className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-slate-200">Register Truck</span>
              </Link>
              <Link
                href="/drivers"
                className="p-3 rounded-lg bg-[#1c2333] hover:bg-[#262f42] border border-[#2e374a] text-left transition-colors flex flex-col gap-1.5"
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium text-slate-200">Onboard Driver</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Activity Audit Stream */}
      <div className="bg-[#121824] border border-[#202736] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">System Activity Stream</h2>
            <p className="text-xs text-slate-400">Audit trail of recent fleet operations and document updates</p>
          </div>
          <Link href="/settings" className="text-xs text-blue-400 hover:underline">
            View All Logs
          </Link>
        </div>

        <div className="divide-y divide-[#202736]">
          {activityLogs.slice(0, 4).map(log => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs hover:bg-[#1c2333]/30 px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1c2333] border border-[#2e374a] flex items-center justify-center text-slate-400 font-mono text-[11px]">
                  {log.user.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-slate-200">{log.action}</div>
                  <div className="text-[11px] text-slate-500">
                    By {log.user} ({log.role}) • <span className="text-blue-400">{log.module}</span>
                  </div>
                </div>
              </div>
              <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
