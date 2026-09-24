'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Fuel,
  Search,
  Download,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  KPICard,
  AnimatedPage,
  EmptyState,
  itemVariants
} from '@/components/ui';
import { exportToCSV } from '@/lib/csvExport';

export function ExpensesContent() {
  const { expenses } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const totalFreightRevenue = expenses.reduce((acc, e) => acc + e.freightRevenue, 0);
  const totalFuelExpenses = expenses.reduce((acc, e) => acc + e.fuelCost, 0);
  const totalTollExpenses = expenses.reduce((acc, e) => acc + e.tollCost, 0);
  const totalNetProfit = expenses.reduce((acc, e) => acc + e.netProfit, 0);
  const avgMargin = (expenses.reduce((acc, e) => acc + e.profitMarginPercent, 0) / (expenses.length || 1)).toFixed(1);

  const filteredExpenses = expenses.filter(
    e =>
      e.tripCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.vehicleReg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const exportData = filteredExpenses.map(e => ({
      TripCode: e.tripCode,
      VehicleReg: e.vehicleReg,
      DriverName: e.driverName,
      FreightRevenueINR: e.freightRevenue,
      FuelCostINR: e.fuelCost,
      TollCostINR: e.tollCost,
      DriverAllowanceINR: e.driverAllowance,
      OtherExpensesINR: e.otherExpenses,
      NetProfitINR: e.netProfit,
      ProfitMarginPercent: e.profitMarginPercent
    }));
    exportToCSV(exportData, `trip_expenses_pnl_export_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-secondary">
              <DollarSign className="w-3.5 h-3.5" />
              Financial Telematics
            </span>
          }
          title="Trip Expense & Settlement P&L"
          description="Commercial freight revenue reconciliation, automated FASTag toll deduction auditing, fuel cards, and trip margin analytics."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportCSV} icon={<Download className="w-3.5 h-3.5" />}>
              Export P&L CSV
            </Button>
          }
        />
      </motion.div>

      {/* 2. KPI Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Gross Freight Revenue"
          value={`₹${totalFreightRevenue.toLocaleString('en-IN')}`}
          subtext="Billed commercial freight income"
          icon={<DollarSign className="w-4 h-4 text-blue-400" />}
          iconBg="bg-blue-600/15 border border-blue-500/30 text-blue-400"
        />
        <KPICard
          title="Net Operating Profit"
          value={`₹${totalNetProfit.toLocaleString('en-IN')}`}
          subtext={`Avg Margin: ${avgMargin}%`}
          trend={{ value: `${avgMargin}% margin`, isPositive: true }}
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          iconBg="bg-emerald-600/15 border border-emerald-500/30 text-emerald-400"
        />
        <KPICard
          title="Total Fuel Outlay"
          value={`₹${totalFuelExpenses.toLocaleString('en-IN')}`}
          subtext="Diesel card & pump transactions"
          icon={<Fuel className="w-4 h-4 text-indigo-400" />}
          iconBg="bg-indigo-600/15 border border-indigo-500/30 text-indigo-400"
        />
        <KPICard
          title="FASTag Highway Tolls"
          value={`₹${totalTollExpenses.toLocaleString('en-IN')}`}
          subtext="NHAI automated electronic tolls"
          icon={<CreditCard className="w-4 h-4 text-amber-400" />}
          iconBg="bg-amber-600/15 border border-amber-500/30 text-amber-400"
        />
      </motion.div>

      {/* 3. Expense & P&L Table */}
      <motion.div variants={itemVariants} className="overflow-hidden rounded-card border border-border bg-surface">
        <div className="flex flex-col items-center justify-between gap-3 border-b border-border p-4 sm:flex-row">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search trip code, vehicle, driver..."
              className="w-full rounded-control border border-border bg-surface px-3 py-2 pl-9 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">{filteredExpenses.length} Trip P&L Statements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th className="py-3.5 px-4 font-mono">Trip Code</th>
                <th className="py-3.5 px-4">Vehicle & Driver</th>
                <th className="py-3.5 px-4 font-mono">Gross Revenue</th>
                <th className="py-3.5 px-4 font-mono">Fuel Outlay</th>
                <th className="py-3.5 px-4 font-mono">FASTag Tolls</th>
                <th className="py-3.5 px-4 font-mono">Driver Allowance</th>
                <th className="py-3.5 px-4 font-mono">Net Profit</th>
                <th className="py-3.5 px-4">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-primary">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12">
                    <EmptyState
                      icon={<DollarSign className="w-8 h-8 text-slate-500" />}
                      title="No P&L Records Found"
                      description="No trip settlements match your search criteria."
                      action={
                        <Button variant="secondary" size="sm" onClick={() => setSearchTerm('')}>
                          Clear Search
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => (
                  <tr key={exp.id} className="transition-colors hover:bg-surface-muted">
                    <td className="px-4 py-3.5 font-mono font-bold text-brand-orange">
                      <span className="rounded-control border border-border bg-surface-muted px-2 py-1 text-xs">
                        {exp.tripCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-text-primary">{exp.vehicleReg}</div>
                      <div className="text-xs text-text-secondary">{exp.driverName}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-text-primary">
                      ₹{exp.freightRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-text-secondary">
                      ₹{exp.fuelCost.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-text-secondary">
                      ₹{exp.tollCost.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-text-secondary">
                      ₹{exp.driverAllowance.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-status-green">
                      ₹{exp.netProfit.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success">
                        <ArrowUpRight className="w-3 h-3" /> {exp.profitMarginPercent}%
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AnimatedPage>
  );
}
