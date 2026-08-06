'use client';

import React from 'react';
import { Truck, CheckCircle2, Users, Wrench, ShieldAlert, ArrowUpRight, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { KPICard, PageHeader, Card, Button } from '@/components/ui';
import Link from 'next/link';

export function DashboardFeature() {
  const { vehicles, drivers, activityLogs } = useApp();

  const activeVehicles = vehicles.filter(v => v.maintenanceStatus === 'In Service').length;
  const maintenanceVehicles = vehicles.filter(v => v.maintenanceStatus !== 'In Service').length;
  const expiringDocs = vehicles.filter(v => v.docStatus === 'Expiring Soon' || v.docStatus === 'Expired').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Overview"
        description="Real-time fleet health, document compliance, and dispatch readiness metrics."
        actions={
          <>
            <Button variant="outline" size="sm">
              Period: Today
            </Button>
            <Link href="/vehicles">
              <Button variant="primary" size="sm">
                + New Asset
              </Button>
            </Link>
          </>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Fleet Assets"
          value={vehicles.length}
          subtext="+2 added this month"
          icon={<Truck className="w-4 h-4" />}
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
        />
        <KPICard
          title="Active Vehicles"
          value={activeVehicles}
          subtext={`${Math.round((activeVehicles / (vehicles.length || 1)) * 100)}% active utilization`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        />
        <KPICard
          title="Onboarded Drivers"
          value={drivers.length}
          subtext={`${drivers.filter(d => d.assignedVehicle).length} assigned to trucks`}
          icon={<Users className="w-4 h-4" />}
          iconBg="bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
        />
        <KPICard
          title="Maintenance & Alerts"
          value={maintenanceVehicles}
          subtext={`${expiringDocs} compliance issues`}
          icon={<Wrench className="w-4 h-4" />}
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
        />
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col justify-between">
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
        </Card>

        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Compliance Attention Required</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              2 vehicles have documents expiring within 30 days. Upload renewed documents to prevent operational stops.
            </p>
          </div>

          <Card className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/vehicles">
                <Button variant="secondary" className="w-full justify-start text-left flex-col items-start p-3 gap-1">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-200">Register Truck</span>
                </Button>
              </Link>
              <Link href="/drivers">
                <Button variant="secondary" className="w-full justify-start text-left flex-col items-start p-3 gap-1">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-slate-200">Onboard Driver</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Activity Logs */}
      <Card className="space-y-4">
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
      </Card>
    </div>
  );
}
