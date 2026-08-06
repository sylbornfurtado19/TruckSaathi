'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  ArrowUpDown,
  X,
  FileText,
  Calendar,
  Sparkles,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Vehicle } from '@/types';
import { PageHeader, Card, Button, Badge, AnimatedPage, KPICard, itemVariants, AnimatedNumber } from '@/components/ui';

export function MaintenanceContent() {
  const { vehicles } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'urgency' | 'health' | 'reg'>('urgency');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Helper for component health color tokens (green/amber/red using existing Tailwind classes)
  const getHealthColorClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-500 text-emerald-400 border-emerald-500/30';
    if (score >= 50) return 'bg-amber-500 text-amber-400 border-amber-500/30';
    return 'bg-rose-500 text-rose-400 border-rose-500/30';
  };

  const getHealthBarClass = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-emerald-500 to-teal-400';
    if (score >= 50) return 'bg-gradient-to-r from-amber-500 to-orange-400';
    return 'bg-gradient-to-r from-rose-500 to-red-500';
  };

  // Compute aggregate metrics
  const vehiclesWithHealth = vehicles.map(v => {
    const health = v.componentHealth || {
      brakes: 70,
      battery: 70,
      engine: 70,
      tyres: 70,
      lastServiceDate: '2026-04-01',
      predictedNextServiceDate: '2026-09-01',
      predictedIssue: 'Routine inspection due',
      predictionConfidence: 85
    };
    const avgScore = Math.round((health.brakes + health.battery + health.engine + health.tyres) / 4);
    return { ...v, health, avgScore };
  });

  const fleetAvgHealth = Math.round(
    vehiclesWithHealth.reduce((acc, v) => acc + v.avgScore, 0) / (vehiclesWithHealth.length || 1)
  );

  const needingServiceSoon = vehiclesWithHealth.filter(
    v => new Date(v.health.predictedNextServiceDate) <= new Date('2026-08-15')
  ).length;

  const overdueCount = vehiclesWithHealth.filter(
    v => new Date(v.health.predictedNextServiceDate) < new Date('2026-08-08')
  ).length;

  const avgDaysToService = 12;

  // Filter & Urgency Sorting
  const filteredVehicles = vehiclesWithHealth
    .filter(
      v =>
        v.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.health.predictedIssue && v.health.predictedIssue.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortField === 'urgency') {
        const dateA = new Date(a.health.predictedNextServiceDate).getTime();
        const dateB = new Date(b.health.predictedNextServiceDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortField === 'health') {
        return sortOrder === 'asc' ? a.avgScore - b.avgScore : b.avgScore - a.avgScore;
      }
      return sortOrder === 'asc' ? a.regNumber.localeCompare(b.regNumber) : b.regNumber.localeCompare(a.regNumber);
    });

  const toggleSort = (field: 'urgency' | 'health' | 'reg') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Predictive Maintenance & Component Health"
          description="AI-driven failure prediction, component wear telemetry, and preventative maintenance schedules."
        />
      </motion.div>

      {/* 2. KPI Cards Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Fleet Health Index"
          value={fleetAvgHealth}
          subtext="Overall component integrity average"
          icon={<Activity className="w-4 h-4" />}
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/30"
          glow="blue"
        />
        <KPICard
          title="Service Due Soon"
          value={needingServiceSoon}
          subtext="Predicted within 14 days"
          icon={<Wrench className="w-4 h-4" />}
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/30"
          glow="amber"
        />
        <KPICard
          title="Overdue / Breakdown"
          value={overdueCount}
          subtext="Requires immediate workshop pull"
          icon={<AlertTriangle className="w-4 h-4" />}
          iconBg="bg-rose-500/10 text-rose-400 border-rose-500/30"
          glow="amber"
        />
        <KPICard
          title="Avg. Days to Service"
          value={avgDaysToService}
          subtext="Predicted maintenance interval"
          icon={<Clock className="w-4 h-4" />}
          iconBg="bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
          glow="blue"
        />
      </motion.div>

      {/* 3. Search & Sort Bar */}
      <motion.div variants={itemVariants}>
        <Card glow="blue" className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search vehicle plate, model, predicted issue..."
              className="w-full bg-[#1c2333]/80 border border-[#2e374a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none rounded-lg text-xs text-slate-200 placeholder:text-slate-500 pl-9 pr-3 py-2 transition-all backdrop-blur-md"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Sort By:
            </span>
            <button
              onClick={() => toggleSort('urgency')}
              className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 font-medium ${
                sortField === 'urgency'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold'
                  : 'bg-[#1c2333]/80 border-[#2e374a] text-slate-300 hover:text-white'
              }`}
            >
              Urgency Date <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleSort('health')}
              className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 font-medium ${
                sortField === 'health'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold'
                  : 'bg-[#1c2333]/80 border-[#2e374a] text-slate-300 hover:text-white'
              }`}
            >
              Health Score <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* 4. Component Health Table */}
      <motion.div variants={itemVariants} className="glass-panel rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1c2333]/80 backdrop-blur-md text-slate-400 border-b border-[#202736] font-semibold uppercase tracking-wider sticky top-0 z-10">
                <th className="py-3.5 px-4">Vehicle Plate</th>
                <th className="py-3.5 px-4">Overall Health</th>
                <th className="py-3.5 px-4">Component Wear Telemetry (Brakes / Batt / Engine / Tyres)</th>
                <th className="py-3.5 px-4">Predicted Service Date</th>
                <th className="py-3.5 px-4">AI Failure Prediction</th>
                <th className="py-3.5 px-4 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736]/60 text-slate-200">
              {filteredVehicles.map(vehicle => {
                const isUrgent = new Date(vehicle.health.predictedNextServiceDate) <= new Date('2026-08-10');
                return (
                  <tr
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="hover:bg-[#1c2333]/50 transition-colors cursor-pointer group relative border-l-2 border-transparent hover:border-blue-500"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-100 flex items-center gap-2">
                      <span className="bg-[#1c2333] border border-[#2e374a] px-2 py-1 rounded text-xs">
                        {vehicle.regNumber}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold text-xs ${vehicle.avgScore < 50 ? 'text-rose-400' : vehicle.avgScore < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {vehicle.avgScore}%
                        </span>
                      </div>
                    </td>

                    {/* Horizontal Component Health Bars */}
                    <td className="py-3.5 px-4 min-w-[280px]">
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <div className="text-[10px] text-slate-400 flex justify-between mb-0.5">
                            <span>BRK</span>
                            <span className="font-mono">{vehicle.health.brakes}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1c2333] rounded-full overflow-hidden border border-[#2e374a]">
                            <div className={`h-full ${getHealthBarClass(vehicle.health.brakes)}`} style={{ width: `${vehicle.health.brakes}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 flex justify-between mb-0.5">
                            <span>BAT</span>
                            <span className="font-mono">{vehicle.health.battery}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1c2333] rounded-full overflow-hidden border border-[#2e374a]">
                            <div className={`h-full ${getHealthBarClass(vehicle.health.battery)}`} style={{ width: `${vehicle.health.battery}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 flex justify-between mb-0.5">
                            <span>ENG</span>
                            <span className="font-mono">{vehicle.health.engine}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1c2333] rounded-full overflow-hidden border border-[#2e374a]">
                            <div className={`h-full ${getHealthBarClass(vehicle.health.engine)}`} style={{ width: `${vehicle.health.engine}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 flex justify-between mb-0.5">
                            <span>TYR</span>
                            <span className="font-mono">{vehicle.health.tyres}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#1c2333] rounded-full overflow-hidden border border-[#2e374a]">
                            <div className={`h-full ${getHealthBarClass(vehicle.health.tyres)}`} style={{ width: `${vehicle.health.tyres}%` }} />
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium">
                      {isUrgent ? (
                        <Badge variant="danger" pulse>
                          <Calendar className="w-3 h-3" /> {vehicle.health.predictedNextServiceDate}
                        </Badge>
                      ) : (
                        <span className="text-slate-300">{vehicle.health.predictedNextServiceDate}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-medium max-w-xs truncate">
                      {vehicle.health.predictedIssue || 'Optimal operation'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-blue-400 font-bold">
                      {vehicle.health.predictionConfidence ? `${vehicle.health.predictionConfidence}%` : '90%'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 5. Detail Drawer */}
      {selectedVehicle && selectedVehicle.componentHealth && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md glass-panel border-l border-[#202736] shadow-2xl p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between border-b border-[#202736] pb-4">
            <div>
              <span className="text-xs text-blue-400 font-mono font-bold">TELEMETRY DIAGNOSTICS</span>
              <h2 className="text-xl font-extrabold font-mono text-slate-50">{selectedVehicle.regNumber}</h2>
            </div>
            <button onClick={() => setSelectedVehicle(null)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* AI Prediction Insight Box */}
            <div className="bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-indigo-950/40 border border-blue-500/30 rounded-xl p-4 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span>AI Telemetry Prognosis</span>
                </div>
                <Badge variant="info">
                  {selectedVehicle.componentHealth.predictionConfidence}% Confidence
                </Badge>
              </div>
              <p className="text-slate-200 leading-relaxed text-xs">
                {selectedVehicle.componentHealth.predictedIssue}
              </p>
              <div className="pt-2 border-t border-blue-500/20 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Predicted Next Service:</span>
                <span className="font-mono text-slate-200 font-bold">{selectedVehicle.componentHealth.predictedNextServiceDate}</span>
              </div>
            </div>

            {/* Recommended Action */}
            <Card glow="blue" className="space-y-2">
              <div className="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-400" /> Recommended Action Plan
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                Schedule a workshop bay inspection before departure. Replace worn components to prevent road breakdown delays.
              </p>
            </Card>

            {/* Component Breakdowns */}
            <div className="space-y-2">
              <div className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Subsystem Health Telemetry</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736]">
                  <div className="text-slate-400 mb-1">Brake System</div>
                  <div className="font-mono text-base font-bold text-slate-100">{selectedVehicle.componentHealth.brakes}%</div>
                </div>
                <div className="p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736]">
                  <div className="text-slate-400 mb-1">Battery & Electrical</div>
                  <div className="font-mono text-base font-bold text-slate-100">{selectedVehicle.componentHealth.battery}%</div>
                </div>
                <div className="p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736]">
                  <div className="text-slate-400 mb-1">Engine Powertrain</div>
                  <div className="font-mono text-base font-bold text-slate-100">{selectedVehicle.componentHealth.engine}%</div>
                </div>
                <div className="p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736]">
                  <div className="text-slate-400 mb-1">Tyre Tread Wear</div>
                  <div className="font-mono text-base font-bold text-slate-100">{selectedVehicle.componentHealth.tyres}%</div>
                </div>
              </div>
            </div>

            {/* Service History Log */}
            <div className="space-y-2">
              <div className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Historical Workshop Service Log</div>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">Routine 50,000 km Service</div>
                    <div className="text-[11px] text-slate-500">Engine oil change & filter replacement</div>
                  </div>
                  <div className="font-mono text-slate-400 text-[11px]">{selectedVehicle.componentHealth.lastServiceDate}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">Brake Fluid & Disc Inspection</div>
                    <div className="text-[11px] text-slate-500">Bhiwandi Workshop Bay 2</div>
                  </div>
                  <div className="font-mono text-slate-400 text-[11px]">2026-01-15</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
