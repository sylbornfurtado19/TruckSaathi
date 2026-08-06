'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Fuel,
  AlertTriangle,
  Zap,
  Plus,
  Search,
  Filter,
  Download,
  X,
  Droplet,
  Gauge,
  TrendingDown,
  Building
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader, Card, Button, Badge, KPICard, AnimatedPage, AnimatedNumber, itemVariants } from '@/components/ui';
import { exportToCSV } from '@/lib/csvExport';

export function FuelContent() {
  const { fuelLogs, vehicles, addFuelLog } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [vehicleId, setVehicleId] = useState('');
  const [refuelStation, setRefuelStation] = useState('');
  const [refuelLiters, setRefuelLiters] = useState(100);
  const [refuelCost, setRefuelCost] = useState(9500);

  const totalFuelLiters = fuelLogs.reduce((acc, log) => acc + log.fuelLiters, 0);
  const totalFuelCostINR = fuelLogs.reduce((acc, log) => acc + log.lastRefuelCostINR, 0);
  const theftAlertsCount = fuelLogs.filter(log => log.theftAlert).length;
  const avgFleetKmpl = (fuelLogs.reduce((acc, log) => acc + log.avgKmpl, 0) / (fuelLogs.length || 1)).toFixed(1);

  const filteredLogs = fuelLogs.filter(
    log =>
      log.vehicleReg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.lastRefuelStation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const exportData = filteredLogs.map(l => ({
      VehicleReg: l.vehicleReg,
      Date: l.date,
      FuelLevelPercent: l.fuelLevelPercent,
      FuelLiters: l.fuelLiters,
      AvgKmpl: l.avgKmpl,
      LastRefuelStation: l.lastRefuelStation,
      LastRefuelLiters: l.lastRefuelLiters,
      LastRefuelCostINR: l.lastRefuelCostINR,
      TheftAlert: l.theftAlert ? 'YES' : 'NO',
      TheftDetails: l.theftDetails || ''
    }));
    exportToCSV(exportData, `fuel_telemetry_export_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleAddRefuel = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find(v => v.id === vehicleId);
    if (!veh) return;

    addFuelLog({
      vehicleId: veh.id,
      vehicleReg: veh.regNumber,
      date: new Date().toISOString().slice(0, 10),
      fuelLevelPercent: 90,
      fuelLiters: 270,
      avgKmpl: 4.5,
      lastRefuelStation: refuelStation || 'Highway HPCL Plaza',
      lastRefuelLiters: Number(refuelLiters),
      lastRefuelCostINR: Number(refuelCost),
      theftAlert: false
    });

    setIsModalOpen(false);
    setRefuelStation('');
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Fuel Telemetry & Theft Analytics"
          description="Real-time OBD-II fuel tank monitoring, KMPL efficiency scoring, and abnormal fuel drop alerts."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV} icon={<Download className="w-4 h-4" />}>
                Export CSV
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
                Log Refueling
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 2. KPI Cards Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Fleet Fuel Spend"
          value={`₹${totalFuelCostINR.toLocaleString()}`}
          subtext="Current month refueling outlay"
          icon={<Fuel className="w-4 h-4" />}
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/30"
          glow="blue"
        />
        <KPICard
          title="Fleet Avg Mileage"
          value={`${avgFleetKmpl} KMPL`}
          subtext="Kilometers per Liter efficiency"
          icon={<Gauge className="w-4 h-4" />}
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          glow="emerald"
        />
        <KPICard
          title="Fuel Theft / Sudden Drops"
          value={theftAlertsCount}
          subtext="Critical sensor alerts flagged"
          icon={<AlertTriangle className="w-4 h-4" />}
          iconBg="bg-rose-500/10 text-rose-400 border-rose-500/30"
          glow="rose"
        />
        <KPICard
          title="Total Volume Consumed"
          value={`${totalFuelLiters} L`}
          subtext="Active fleet tank capacity volume"
          icon={<Droplet className="w-4 h-4" />}
          iconBg="bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
          glow="blue"
        />
      </motion.div>

      {/* 3. Fuel Theft Alert Hero Notice (if any alerts) */}
      {theftAlertsCount > 0 && (
        <motion.div variants={itemVariants}>
          <Card glow="rose" className="p-5 bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-rose-950/30 border border-rose-500/40">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">CRITICAL FUEL DRAIN ALERT</span>
                  <Badge variant="danger" pulse>Immediate Investigation Required</Badge>
                </div>
                <h3 className="text-base font-bold text-slate-100">Abnormal Tank Level Drop Detected on KA-01-EA-9011</h3>
                <p className="text-xs text-slate-300">
                  Sensor recorded a sudden 28 Liter fuel drop at 02:45 AM while vehicle ignition was OFF near Hosur RTO Checkpost.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* 4. Fuel Logs Data Table */}
      <motion.div variants={itemVariants} className="glass-panel rounded-xl overflow-hidden shadow-2xl space-y-4">
        <div className="p-4 border-b border-[#202736] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search vehicle plate, station..."
              className="w-full bg-[#1c2333]/80 border border-[#2e374a] focus:border-blue-500 focus:outline-none rounded-lg text-xs text-slate-200 pl-9 pr-3 py-2"
            />
          </div>
          <Badge variant="neutral">{filteredLogs.length} Vehicles Tracked</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1c2333]/80 text-slate-400 border-b border-[#202736] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Vehicle Reg</th>
                <th className="py-3.5 px-4">Tank Level (%)</th>
                <th className="py-3.5 px-4">Current Volume</th>
                <th className="py-3.5 px-4">Avg. KMPL</th>
                <th className="py-3.5 px-4">Last Refuel Station</th>
                <th className="py-3.5 px-4">Last Fill Cost</th>
                <th className="py-3.5 px-4">Telemetry Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736]/60 text-slate-200">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#1c2333]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{log.vehicleReg}</td>
                  <td className="py-3.5 px-4 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-[#121824] rounded-full h-2 overflow-hidden border border-[#202736]">
                        <div
                          className={`h-full rounded-full ${
                            log.fuelLevelPercent < 25
                              ? 'bg-rose-500'
                              : log.fuelLevelPercent < 50
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${log.fuelLevelPercent}%` }}
                        />
                      </div>
                      <span className="font-bold">{log.fuelLevelPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{log.fuelLiters} Liters</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{log.avgKmpl} KMPL</td>
                  <td className="py-3.5 px-4 text-slate-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-400" />
                    <span>{log.lastRefuelStation}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-200 font-semibold">₹{log.lastRefuelCostINR.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    {log.theftAlert ? (
                      <Badge variant="danger" pulse>
                        <AlertTriangle className="w-3 h-3" /> Theft Alert
                      </Badge>
                    ) : (
                      <Badge variant="success">Optimal Sensor</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 5. Refuel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-[#202736] rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#202736] pb-4">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-lg">
                <Fuel className="w-5 h-5 text-blue-400" />
                <span>Log Vehicle Refueling Entry</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRefuel} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Vehicle *</label>
                <select
                  required
                  value={vehicleId}
                  onChange={e => setVehicleId(e.target.value)}
                  className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.regNumber} ({v.make} {v.model})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Refueling Station / Outlet *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HPCL Highway Plaza - Khalapur"
                  value={refuelStation}
                  onChange={e => setRefuelStation(e.target.value)}
                  className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Liters Filled *</label>
                  <input
                    type="number"
                    required
                    value={refuelLiters}
                    onChange={e => setRefuelLiters(Number(e.target.value))}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Total Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    value={refuelCost}
                    onChange={e => setRefuelCost(Number(e.target.value))}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#202736] flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Refuel Entry
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
