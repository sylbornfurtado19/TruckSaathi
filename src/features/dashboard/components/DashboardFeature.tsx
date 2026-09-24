'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Users,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  Route,
  Activity,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { KPICard, PageHeader, Card, Button, Badge, RouteDivider } from '@/components/ui';
import { LiveFleetMap } from './LiveFleetMap';
import { SimulationControlBar } from '@/components/common/SimulationControlBar';
import Link from 'next/link';

export function DashboardFeature() {
  const { vehicles, drivers, activityLogs, trips } = useApp();

  const activeVehicles = vehicles.filter(v => v.maintenanceStatus === 'In Service').length;
  const maintenanceVehicles = vehicles.filter(v => v.maintenanceStatus !== 'In Service').length;
  const expiringDocs = vehicles.filter(v => v.docStatus === 'Expiring Soon' || v.docStatus === 'Expired').length;
  const inTransitTrips = trips.filter(t => t.status === 'In Transit').length;
  const delayedTrips = trips.filter(t => t.status === 'Delayed').length;
  const deliveredTrips = trips.filter(t => t.status === 'Delivered').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 1. Command Center Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <Badge variant="vibe" pulse className="px-3 py-1 text-xs">
              ✨ Vibeathon AI Copilot Active
            </Badge>
          }
          title="Fleet Operations Command Center"
          description="Real-time multi-hub telemetry, AI-driven dispatch optimization, and active route diagnostics across Indian logistics corridors."
          actions={
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-mono shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Pan-India Grid: Nominal</span>
              </div>
              <Link href="/trips">
                <Button variant="primary" size="sm" icon={<Route className="w-3.5 h-3.5" />}>
                  Dispatch Hub
                </Button>
              </Link>
            </div>
          }
        />
      </motion.div>

      {/* 2. Primary KPI Command Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Fleet Assets"
          value={vehicles.length}
          subtext="Commercial GPS-tracked nodes"
          trend={{ value: "+2 this month", isPositive: true }}
          icon={<Truck className="w-5 h-5 text-blue-400" />}
          iconBg="bg-gradient-to-tr from-blue-600/20 to-blue-500/10 border-blue-500/30 text-blue-400 shadow-md shadow-blue-500/10"
        />
        <KPICard
          title="Active in Service"
          value={activeVehicles}
          subtext={`${Math.round((activeVehicles / (vehicles.length || 1)) * 100)}% active fleet utilization`}
          trend={{ value: `${activeVehicles}/${vehicles.length} available`, isPositive: true }}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-gradient-to-tr from-emerald-600/20 to-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/10"
        />
        <KPICard
          title="Verified Drivers"
          value={drivers.length}
          subtext={`${drivers.filter(d => d.assignedVehicle).length} assigned to active corridors`}
          trend={{ value: "100% KYC verified", isPositive: true }}
          icon={<Users className="w-5 h-5 text-indigo-400" />}
          iconBg="bg-gradient-to-tr from-indigo-600/20 to-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-500/10"
        />
        <KPICard
          title="Maintenance & Alerts"
          value={maintenanceVehicles}
          subtext={`${expiringDocs} compliance actions required`}
          trend={expiringDocs > 0 ? { value: `${expiringDocs} expiring docs`, isPositive: false } : undefined}
          icon={<Wrench className="w-5 h-5 text-amber-400" />}
          iconBg="bg-gradient-to-tr from-amber-600/20 to-amber-500/10 border-amber-500/30 text-amber-400 shadow-md shadow-amber-500/10"
        />
      </motion.div>

      {/* 3. Interactive Cross-Window Transit Simulation Controller */}
      <motion.div variants={itemVariants}>
        <SimulationControlBar />
      </motion.div>

      {/* 4. Interactive Live Telemetry Map Centerpiece */}
      <motion.div variants={itemVariants}>
        <LiveFleetMap vehicles={vehicles} />
      </motion.div>

      {/* Brand Corridors Line Divider */}
      <RouteDivider />

      {/* 4. Middle Section: Telemetry Distribution & AI Optimization Center */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Telemetry Distribution & Corridors */}
        <Card className="lg:col-span-2 flex flex-col justify-between p-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Fleet Telemetry & Operational State
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Live operational status classification across deployed commercial vehicles</p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1.5 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>

            {/* Segmented Distribution Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Fleet Availability Ratio</span>
                <span className="text-slate-100 font-bold">
                  {Math.round((activeVehicles / (vehicles.length || 1)) * 100)}% Operational
                </span>
              </div>
              <div className="h-3.5 w-full bg-white/[0.04] rounded-full overflow-hidden flex p-0.5 border border-white/[0.08]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(activeVehicles / (vehicles.length || 1)) * 100}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="bg-emerald-500 h-full rounded-full shadow-[0_0_12px_#10b981]"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(1 / (vehicles.length || 1)) * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
                  className="bg-amber-400 h-full rounded-full shadow-[0_0_12px_#f59e0b]"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(1 / (vehicles.length || 1)) * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
                  className="bg-rose-500 h-full rounded-full shadow-[0_0_12px_#f43f5e]"
                />
              </div>

              {/* Status Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.14] transition-all">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_10px_#10b981]" />
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">In Service / Active</div>
                    <div className="text-base font-black font-mono text-white">{activeVehicles} Units</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.14] transition-all">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shrink-0 shadow-[0_0_10px_#f59e0b]" />
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Scheduled Service</div>
                    <div className="text-base font-black font-mono text-white">1 Unit</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.07] hover:border-white/[0.14] transition-all">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0 shadow-[0_0_10px_#f43f5e]" />
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Maintenance / Idle</div>
                    <div className="text-base font-black font-mono text-white">1 Unit</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px]">Telemetry Engine: High-Frequency GPS Stream</span>
            <Link href="/vehicles" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors">
              Manage Commercial Assets <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Right Col: AI Dispatch Recommendation & Quick Operations */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* AI Recommendation Card */}
          <div className="relative rounded-2xl p-5 bg-gradient-to-br from-[#0c1322] via-[#0d1628] to-[#080f1d] border border-cyan-500/35 overflow-hidden shadow-2xl shadow-cyan-950/20">
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-md shadow-cyan-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="font-black text-sm text-cyan-300 tracking-tight">AI Dispatch Recommendation</span>
              </div>
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Vehicle <span className="font-mono text-cyan-300 font-bold">MH-12-Q-4521</span> is currently 15% under capacity on the Bhiwandi-Delhi corridor. Consolidate shipment ID <span className="font-mono text-emerald-400 font-bold">#ORD-9081</span> to maximize payload efficiency.
            </p>

            <div className="mt-4 pt-3 flex items-center justify-between border-t border-cyan-500/20 text-xs">
              <div className="font-mono text-[11px] text-cyan-400 font-bold">Payload Score: +18%</div>
              <Link href="/ai-dispatch">
                <Button variant="primary" size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs py-1 px-3 shadow-md shadow-cyan-500/25">
                  Optimize Route
                </Button>
              </Link>
            </div>
          </div>

          {/* Active Dispatches Summary */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Dispatches Today</h3>
              <Link href="/trips" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors">
                All Trips <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="font-mono font-black text-blue-400 text-lg">{inTransitTrips}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">In Transit</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="font-mono font-black text-amber-400 text-lg">{delayedTrips}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Delayed</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="font-mono font-black text-emerald-400 text-lg">{deliveredTrips}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Delivered</div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.08]">
              <div className="grid grid-cols-3 gap-2">
                <Link href="/trips">
                  <button className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-blue-500/40 transition-all flex flex-col gap-1 cursor-pointer">
                    <Route className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] font-medium text-slate-200">Dispatch</span>
                  </button>
                </Link>
                <Link href="/vehicles">
                  <button className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-cyan-500/40 transition-all flex flex-col gap-1 cursor-pointer">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px] font-medium text-slate-200">Add Truck</span>
                  </button>
                </Link>
                <Link href="/drivers">
                  <button className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-indigo-500/40 transition-all flex flex-col gap-1 cursor-pointer">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] font-medium text-slate-200">Add Driver</span>
                  </button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* 5. Live Activity Stream */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Live System Audit & Telemetry Feed
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time audit log of dispatches, vehicle registrations, and driver activity</p>
            </div>
            <Link href="/settings" className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Full System Logs
            </Link>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {activityLogs.slice(0, 4).map(log => (
              <div key={log.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-white/[0.02] px-3 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono text-xs font-bold shrink-0 shadow-sm">
                    {log.user.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white">{log.action}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      By {log.user} ({log.role}) • <span className="text-cyan-400 font-medium">{log.module}</span>
                    </div>
                  </div>
                </div>
                <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
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
