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
  FileText,
  Calendar,
  Sparkles,
  Cpu,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Vehicle } from '@/types';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  AnimatedPage,
  KPICard,
  Modal,
  EmptyState,
  itemVariants
} from '@/components/ui';

export function MaintenanceContent() {
  const { vehicles } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'urgency' | 'health' | 'reg'>('urgency');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const getHealthBarClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
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
          badge={
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Wrench className="w-3.5 h-3.5" />
              Diagnostics & Telematics
            </span>
          }
          title="Predictive Maintenance & Component Health"
          description="AI-driven sub-system wear telemetry, early mechanical breakdown prevention, and automated workshop bay scheduling."
        />
      </motion.div>

      {/* 2. KPI Cards Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Fleet Health Index"
          value={`${fleetAvgHealth}%`}
          subtext="Aggregate component integrity"
          trend={{ value: "Nominal threshold", isPositive: true }}
          icon={<Activity className="w-4 h-4 text-blue-400" />}
          iconBg="bg-blue-600/15 border border-blue-500/30 text-blue-400"
        />
        <KPICard
          title="Service Due Soon"
          value={needingServiceSoon}
          subtext="Predicted within 14 days"
          trend={needingServiceSoon > 0 ? { value: `${needingServiceSoon} scheduled`, isPositive: false } : { value: "Zero immediate", isPositive: true }}
          icon={<Wrench className="w-4 h-4 text-amber-400" />}
          iconBg="bg-amber-600/15 border border-amber-500/30 text-amber-400"
        />
        <KPICard
          title="Critical / Breakdown"
          value={overdueCount}
          subtext="Requires immediate workshop bay"
          trend={overdueCount > 0 ? { value: `${overdueCount} critical`, isPositive: false } : { value: "Zero active faults", isPositive: true }}
          icon={<AlertTriangle className="w-4 h-4 text-rose-400" />}
          iconBg="bg-rose-600/15 border border-rose-500/30 text-rose-400"
        />
        <KPICard
          title="Avg Days to Service"
          value={`${avgDaysToService}d`}
          subtext="Calculated maintenance interval"
          icon={<Clock className="w-4 h-4 text-indigo-400" />}
          iconBg="bg-indigo-600/15 border border-indigo-500/30 text-indigo-400"
        />
      </motion.div>

      {/* 3. Search & Sort Bar */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search vehicle plate, model, predicted issue..."
              className="w-full bg-[#0a0f1d] border border-[#1e2e4a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none rounded-lg text-xs text-slate-200 placeholder:text-slate-500 pl-9 pr-3 py-2 transition-all font-sans"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-blue-400" /> Sort:
            </span>
            <button
              onClick={() => toggleSort('urgency')}
              className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 font-medium ${
                sortField === 'urgency'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                  : 'bg-[#0a0f1d] border-[#1e2e4a] text-slate-300 hover:text-white'
              }`}
            >
              Urgency Date <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleSort('health')}
              className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 font-medium ${
                sortField === 'health'
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                  : 'bg-[#0a0f1d] border-[#1e2e4a] text-slate-300 hover:text-white'
              }`}
            >
              Health Score <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* 4. Component Health Table */}
      <motion.div variants={itemVariants} className="border border-[#1e2e4a] rounded-xl overflow-hidden bg-[#0b1120]/80 backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0d1527] text-slate-400 border-b border-[#1e2e4a] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-mono">Vehicle Plate</th>
                <th className="py-3.5 px-4">Overall Health</th>
                <th className="py-3.5 px-4">Subsystem Wear Telemetry (BRK / BAT / ENG / TYR)</th>
                <th className="py-3.5 px-4 font-mono">Predicted Service</th>
                <th className="py-3.5 px-4">AI Telemetry Diagnostics</th>
                <th className="py-3.5 px-4 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233b] text-slate-200">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      icon={<Wrench className="w-8 h-8 text-slate-500" />}
                      title="No Maintenance Records Found"
                      description="No assets match your search parameters."
                      action={
                        <Button variant="secondary" size="sm" onClick={() => setSearchTerm('')}>
                          Reset Filter
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredVehicles.map(vehicle => {
                  const isUrgent = new Date(vehicle.health.predictedNextServiceDate) <= new Date('2026-08-10');
                  return (
                    <tr
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className="hover:bg-[#131f38] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                        <span className="bg-[#0a0f1d] border border-[#1e2e4a] px-2.5 py-1 rounded-md text-xs text-blue-300 group-hover:border-blue-500/50 transition-colors">
                          {vehicle.regNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono font-bold text-xs ${
                            vehicle.avgScore < 50
                              ? 'text-rose-400'
                              : vehicle.avgScore < 80
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {vehicle.avgScore}%
                        </span>
                      </td>

                      {/* Component Health Wear Bars */}
                      <td className="py-3.5 px-4 min-w-[280px]">
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <div className="text-[10px] text-slate-400 flex justify-between mb-1 font-mono">
                              <span>BRK</span>
                              <span>{vehicle.health.brakes}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#0a0f1d] rounded-full overflow-hidden border border-[#1e2e4a]">
                              <div
                                className={`h-full ${getHealthBarClass(vehicle.health.brakes)} rounded-full`}
                                style={{ width: `${vehicle.health.brakes}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] text-slate-400 flex justify-between mb-1 font-mono">
                              <span>BAT</span>
                              <span>{vehicle.health.battery}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#0a0f1d] rounded-full overflow-hidden border border-[#1e2e4a]">
                              <div
                                className={`h-full ${getHealthBarClass(vehicle.health.battery)} rounded-full`}
                                style={{ width: `${vehicle.health.battery}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] text-slate-400 flex justify-between mb-1 font-mono">
                              <span>ENG</span>
                              <span>{vehicle.health.engine}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#0a0f1d] rounded-full overflow-hidden border border-[#1e2e4a]">
                              <div
                                className={`h-full ${getHealthBarClass(vehicle.health.engine)} rounded-full`}
                                style={{ width: `${vehicle.health.engine}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] text-slate-400 flex justify-between mb-1 font-mono">
                              <span>TYR</span>
                              <span>{vehicle.health.tyres}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#0a0f1d] rounded-full overflow-hidden border border-[#1e2e4a]">
                              <div
                                className={`h-full ${getHealthBarClass(vehicle.health.tyres)} rounded-full`}
                                style={{ width: `${vehicle.health.tyres}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium">
                        {isUrgent ? (
                          <Badge variant="danger">
                            <Calendar className="w-3 h-3" /> {vehicle.health.predictedNextServiceDate}
                          </Badge>
                        ) : (
                          <span className="text-slate-300">{vehicle.health.predictedNextServiceDate}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-medium max-w-xs truncate">
                        {vehicle.health.predictedIssue || 'Optimal operation'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-cyan-400 font-bold">
                        {vehicle.health.predictionConfidence ? `${vehicle.health.predictionConfidence}%` : '90%'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 5. Telemetry Detail Modal */}
      {selectedVehicle && selectedVehicle.componentHealth && (
        <Modal
          isOpen={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          title={`Diagnostics: ${selectedVehicle.regNumber}`}
          description={`${selectedVehicle.make} ${selectedVehicle.model} • Predictive Diagnostics`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            {/* AI Prediction Insight Box */}
            <div className="p-4 rounded-xl bg-[#080d1a] border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>AI Telemetry Prognosis</span>
                </div>
                <Badge variant="info">
                  {selectedVehicle.componentHealth.predictionConfidence}% Confidence
                </Badge>
              </div>
              <p className="text-slate-200 leading-relaxed text-xs">
                {selectedVehicle.componentHealth.predictedIssue}
              </p>
              <div className="pt-2 border-t border-[#1e2e4a] text-[11px] text-slate-400 flex items-center justify-between">
                <span>Predicted Next Service:</span>
                <span className="font-mono text-slate-100 font-bold">{selectedVehicle.componentHealth.predictedNextServiceDate}</span>
              </div>
            </div>

            {/* Subsystem Health Grid */}
            <div className="space-y-2">
              <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider font-mono">Subsystem Telemetry</div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-[#0e172a] border border-[#1e2e4a]">
                  <div className="text-slate-400 text-[11px]">Brake Disc & Hydraulics</div>
                  <div className="font-mono text-base font-bold text-slate-100 mt-0.5">{selectedVehicle.componentHealth.brakes}%</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0e172a] border border-[#1e2e4a]">
                  <div className="text-slate-400 text-[11px]">Battery & Alternator</div>
                  <div className="font-mono text-base font-bold text-slate-100 mt-0.5">{selectedVehicle.componentHealth.battery}%</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0e172a] border border-[#1e2e4a]">
                  <div className="text-slate-400 text-[11px]">Engine & Compression</div>
                  <div className="font-mono text-base font-bold text-slate-100 mt-0.5">{selectedVehicle.componentHealth.engine}%</div>
                </div>
                <div className="p-3 rounded-lg bg-[#0e172a] border border-[#1e2e4a]">
                  <div className="text-slate-400 text-[11px]">Tyre Tread Depth</div>
                  <div className="font-mono text-base font-bold text-slate-100 mt-0.5">{selectedVehicle.componentHealth.tyres}%</div>
                </div>
              </div>
            </div>

            {/* Service History */}
            <div className="space-y-2">
              <div className="text-slate-400 font-bold uppercase text-[10px] tracking-wider font-mono">Service Log History</div>
              <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#1e2e4a] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Routine Workshop Interval Service</div>
                  <div className="text-[11px] text-slate-400">Oil filter replacement & hydraulic inspection</div>
                </div>
                <div className="font-mono text-slate-300 text-[11px]">{selectedVehicle.componentHealth.lastServiceDate}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1e2e4a] flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedVehicle(null)}>
                Close Diagnostics
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatedPage>
  );
}
