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
  Droplet,
  Gauge,
  Building
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  KPICard,
  AnimatedPage,
  Modal,
  EmptyState,
  itemVariants
} from '@/components/ui';
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
    setVehicleId('');
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-secondary">
              <Fuel className="w-3.5 h-3.5" />
              Fuel Telemetry
            </span>
          }
          title="Fuel Telemetry & Theft Analytics"
          description="OBD-II fuel level monitoring, highway KMPL consumption metrics, and automated fuel pilferage alerts."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV} icon={<Download className="w-3.5 h-3.5" />}>
                Export CSV
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} icon={<Plus className="w-3.5 h-3.5" />}>
                Log Refueling
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 2. Fuel KPI Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Fleet Fuel Outlay"
          value={`₹${totalFuelCostINR.toLocaleString('en-IN')}`}
          subtext="Monthly fuel expenditure"
          icon={<Fuel className="w-4 h-4 text-blue-400" />}
          iconBg="bg-blue-600/15 border border-blue-500/30 text-blue-400"
        />
        <KPICard
          title="Fleet Avg Economy"
          value={`${avgFleetKmpl} KMPL`}
          subtext="Commercial highway mileage"
          trend={{ value: "+0.3 kmpl", isPositive: true }}
          icon={<Gauge className="w-4 h-4 text-emerald-400" />}
          iconBg="bg-emerald-600/15 border border-emerald-500/30 text-emerald-400"
        />
        <KPICard
          title="Fuel Pilferage / Drop Alerts"
          value={theftAlertsCount}
          subtext="Abnormal drop telemetry flagged"
          trend={theftAlertsCount > 0 ? { value: `${theftAlertsCount} alerts`, isPositive: false } : { value: "Zero pilferage", isPositive: true }}
          icon={<AlertTriangle className="w-4 h-4 text-rose-400" />}
          iconBg="bg-rose-600/15 border border-rose-500/30 text-rose-400"
        />
        <KPICard
          title="Total Fuel Tracked"
          value={`${totalFuelLiters} L`}
          subtext="Current active tank volume"
          icon={<Droplet className="w-4 h-4 text-cyan-400" />}
          iconBg="bg-cyan-600/15 border border-cyan-500/30 text-cyan-400"
        />
      </motion.div>

      {/* 3. Fuel Theft Alert Hero Notice */}
      {theftAlertsCount > 0 && (
        <motion.div variants={itemVariants}>
          <div className="rounded-card border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/20">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-rose-600/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-status-red">CRITICAL FUEL DRAIN TELEMETRY</span>
                  <Badge variant="danger">Action Required</Badge>
                </div>
                <h3 className="text-sm font-bold text-text-primary">Abnormal Tank Level Drop Detected on KA-01-EA-9011</h3>
                <p className="text-sm text-text-secondary">
                  Sensor recorded a sudden 28-Liter fuel drop at 02:45 AM while vehicle ignition was OFF near Hosur RTO Checkpost.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. Fuel Data Table */}
      <motion.div variants={itemVariants} className="overflow-hidden rounded-card border border-border bg-surface">
        <div className="flex flex-col items-center justify-between gap-3 border-b border-border p-4 sm:flex-row">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search registration, station..."
              className="w-full rounded-control border border-border bg-surface px-3 py-2 pl-9 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">{filteredLogs.length} Vehicles Tracked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th className="py-3.5 px-4 font-mono">Vehicle Reg</th>
                <th className="py-3.5 px-4">Tank Level (%)</th>
                <th className="py-3.5 px-4 font-mono">Current Volume</th>
                <th className="py-3.5 px-4 font-mono">Avg KMPL</th>
                <th className="py-3.5 px-4">Last Refuel Station</th>
                <th className="py-3.5 px-4 font-mono">Last Fill Cost</th>
                <th className="py-3.5 px-4">Telemetry Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-primary">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <EmptyState
                      icon={<Fuel className="w-8 h-8 text-slate-500" />}
                      title="No Fuel Logs Found"
                      description="No records match your search criteria."
                      action={
                        <Button variant="secondary" size="sm" onClick={() => setSearchTerm('')}>
                          Clear Search
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="transition-colors hover:bg-surface-muted">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{log.vehicleReg}</td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full border border-border bg-surface-muted">
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
                        <span className="font-bold text-slate-200">{log.fuelLevelPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-text-secondary">{log.fuelLiters} Liters</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-status-green">{log.avgKmpl} KMPL</td>
                    <td className="flex items-center gap-1.5 px-4 py-3.5 text-text-secondary">
                      <Building className="w-3.5 h-3.5 text-blue-400" />
                      <span>{log.lastRefuelStation}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-text-primary">
                      ₹{log.lastRefuelCostINR.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      {log.theftAlert ? (
                        <Badge variant="danger">
                          <AlertTriangle className="w-3 h-3" /> Theft Alert
                        </Badge>
                      ) : (
                        <Badge variant="success">Nominal Sensor</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 5. Refuel Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Vehicle Refueling Entry"
        description="Record fuel quantity, pump station location, and electronic invoice amounts."
        size="md"
      >
        <form onSubmit={handleAddRefuel} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Select Commercial Asset *</label>
            <select
              required
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full rounded-control border border-border bg-surface px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
            >
              <option value="">-- Choose Asset --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.regNumber} ({v.make} {v.model})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Refueling Station / Highway Outlet *</label>
            <input
              type="text"
              required
              placeholder="e.g. HPCL Highway Plaza - Khalapur"
              value={refuelStation}
              onChange={e => setRefuelStation(e.target.value)}
              className="w-full rounded-control border border-border bg-surface px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Liters Filled *</label>
              <input
                type="number"
                required
                min={10}
                max={500}
                value={refuelLiters}
                onChange={e => setRefuelLiters(Number(e.target.value))}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Total Cost (₹) *</label>
              <input
                type="number"
                required
                min={500}
                value={refuelCost}
                onChange={e => setRefuelCost(Number(e.target.value))}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Refueling Record
            </Button>
          </div>
        </form>
      </Modal>
    </AnimatedPage>
  );
}
