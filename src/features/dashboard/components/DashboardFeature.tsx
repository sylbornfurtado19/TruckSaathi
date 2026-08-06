'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Users,
  Wrench,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Sparkles,
  Zap,
  Bot,
  Route
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { KPICard, PageHeader, Card, Button, Badge, RouteDivider } from '@/components/ui';
import { LiveFleetMap } from './LiveFleetMap';
import Link from 'next/link';

export function DashboardFeature() {
  const { vehicles, drivers, activityLogs, trips } = useApp();

  const activeVehicles = vehicles.filter(v => v.maintenanceStatus === 'In Service').length;
  const maintenanceVehicles = vehicles.filter(v => v.maintenanceStatus !== 'In Service').length;
  const expiringDocs = vehicles.filter(v => v.docStatus === 'Expiring Soon' || v.docStatus === 'Expired').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 relative"
    >
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Fleet AI Command Center"
          description="Real-time live telemetry, predictive document compliance, and active route node diagnostics."
          actions={
            <>
              <Badge variant="info" pulse className="px-3 py-1 font-mono text-xs">
                AI Copilot Active
              </Badge>
              <Button variant="outline" size="sm">
                Period: Live Today
              </Button>
              <Link href="/vehicles">
                <Button variant="primary" size="sm" icon={<Zap className="w-3.5 h-3.5" />}>
                  New Asset
                </Button>
              </Link>
            </>
          }
        />
      </motion.div>

      {/* 2. Interactive Live Telemetry Map Centerpiece */}
      <motion.div variants={itemVariants}>
        <LiveFleetMap vehicles={vehicles} />
      </motion.div>

      {/* 3. Kinetic KPI Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Commercial Assets"
          value={vehicles.length}
          subtext="+2 onboarded this month"
          icon={<Truck className="w-4 h-4" />}
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/30"
          glow="blue"
        />
        <KPICard
          title="Active Vehicles"
          value={activeVehicles}
          subtext={`${Math.round((activeVehicles / (vehicles.length || 1)) * 100)}% active utilization`}
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          glow="emerald"
        />
        <KPICard
          title="Verified Drivers"
          value={drivers.length}
          subtext={`${drivers.filter(d => d.assignedVehicle).length} assigned to active routes`}
          icon={<Users className="w-4 h-4" />}
          iconBg="bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
          glow="blue"
        />
        <KPICard
          title="Maintenance & Alerts"
          value={maintenanceVehicles}
          subtext={`${expiringDocs} compliance issues`}
          icon={<Wrench className="w-4 h-4" />}
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/30"
          glow="amber"
        />
      </motion.div>

      {/* Brand Route Line Divider */}
      <RouteDivider />

      {/* 4. Middle Section: Distribution & AI Recommendation */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card glow="blue" className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#202736]">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  Fleet Telemetry Distribution
                </h2>
                <p className="text-xs text-slate-400">Live operational state classification across active nodes</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Feed
              </span>
            </div>

            <div className="my-6 space-y-4">
              <div className="h-3.5 w-full bg-[#1c2333] rounded-full overflow-hidden flex p-0.5 border border-[#2e374a]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(activeVehicles / vehicles.length) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(1 / vehicles.length) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(1 / vehicles.length) * 100}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-rose-500 to-red-400 h-full rounded-full"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736]">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 shadow-md shadow-emerald-500/50" />
                  <div>
                    <div className="text-xs text-slate-400">In Service</div>
                    <div className="text-base font-bold font-mono text-slate-100">{activeVehicles} Units</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736]">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0 shadow-md shadow-amber-500/50" />
                  <div>
                    <div className="text-xs text-slate-400">Scheduled Service</div>
                    <div className="text-base font-bold font-mono text-slate-100">1 Unit</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736]">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0 shadow-md shadow-rose-500/50" />
                  <div>
                    <div className="text-xs text-slate-400">Breakdown / Idle</div>
                    <div className="text-base font-bold font-mono text-slate-100">1 Unit</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#202736] flex items-center justify-between text-xs text-slate-400">
            <span>Powered by Supabase Realtime Telemetry</span>
            <Link href="/vehicles" className="text-blue-400 hover:underline flex items-center gap-1 font-medium">
              View Asset Registry <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* AI Assistant Insight Box */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-indigo-950/40 border border-blue-500/30 rounded-xl p-5 space-y-3 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Bot className="w-4 h-4 text-blue-400" />
                <span>AI Dispatch Recommendation</span>
              </div>
              <Sparkles className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vehicle <span className="font-mono text-blue-300 font-bold">MH-12-Q-4521</span> is currently 15% under capacity on the Bhiwandi-Delhi corridor. Consolidate shipment ID <span className="font-mono text-emerald-300 font-bold">#ORD-9081</span> to maximize payload efficiency.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-blue-500/20 text-xs">
              <span className="text-slate-400 text-[11px]">Efficiency Score: +18%</span>
              <Button variant="primary" size="sm" className="text-[11px] py-1">
                Apply Route Optimization
              </Button>
            </div>
          </div>

          <Card glow="blue" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Dispatches Summary</h3>
              <Link href="/trips" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                View All Trips <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-[#1c2333]/60 border border-[#202736]">
                <div className="font-mono font-bold text-blue-400 text-sm">
                  {trips.filter(t => t.status === 'In Transit').length}
                </div>
                <div className="text-[10px] text-slate-400">In Transit</div>
              </div>
              <div className="p-2 rounded-lg bg-[#1c2333]/60 border border-[#202736]">
                <div className="font-mono font-bold text-amber-400 text-sm">
                  {trips.filter(t => t.status === 'Delayed').length}
                </div>
                <div className="text-[10px] text-slate-400">Delayed</div>
              </div>
              <div className="p-2 rounded-lg bg-[#1c2333]/60 border border-[#202736]">
                <div className="font-mono font-bold text-emerald-400 text-sm">
                  {trips.filter(t => t.status === 'Delivered').length}
                </div>
                <div className="text-[10px] text-slate-400">Delivered</div>
              </div>
            </div>

            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-[#202736]">Quick Operations</h3>
            <div className="grid grid-cols-3 gap-2">
              <Link href="/trips">
                <Button variant="secondary" className="w-full justify-start text-left flex-col items-start p-2.5 gap-1">
                  <Route className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] text-slate-200">Dispatch Trip</span>
                </Button>
              </Link>
              <Link href="/vehicles">
                <Button variant="secondary" className="w-full justify-start text-left flex-col items-start p-2.5 gap-1">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span className="text-[11px] text-slate-200">Add Truck</span>
                </Button>
              </Link>
              <Link href="/drivers">
                <Button variant="secondary" className="w-full justify-start text-left flex-col items-start p-2.5 gap-1">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] text-slate-200">Add Driver</span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* 5. Activity Stream */}
      <motion.div variants={itemVariants}>
        <Card glow="blue" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100">Live System Activity Audit Stream</h2>
              <p className="text-xs text-slate-400">Real-time audit trail of fleet operations, document uploads, and dispatch allocations</p>
            </div>
            <Link href="/settings" className="text-xs text-blue-400 hover:underline">
              View Full Audit Logs
            </Link>
          </div>

          <div className="divide-y divide-[#202736]">
            {activityLogs.slice(0, 4).map(log => (
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
      </motion.div>
    </motion.div>
  );
}
