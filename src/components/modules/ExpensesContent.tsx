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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
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
      <motion.div variants={itemVariants} className="border border-[#1e2e4a] rounded-xl overflow-hidden bg-[#0b1120]/80 backdrop-blur-md shadow-xl">
        <div className="p-4 border-b border-[#1e2e4a] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search trip code, vehicle, driver..."
              className="w-full bg-[#0a0f1d] border border-[#1e2e4a] focus:border-blue-500 focus:outline-none rounded-lg text-xs text-slate-200 pl-9 pr-3 py-2 font-sans"
            />
          </div>
          <span className="text-xs font-mono text-slate-400">{filteredExpenses.length} Trip P&L Statements</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0d1527] text-slate-400 border-b border-[#1e2e4a] font-semibold uppercase tracking-wider text-[11px]">
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
            <tbody className="divide-y divide-[#16233b] text-slate-200">
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
                  <tr key={exp.id} className="hover:bg-[#131f38] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      <span className="bg-[#0a0f1d] border border-[#1e2e4a] px-2 py-0.5 rounded text-xs">
                        {exp.tripCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100 font-mono">{exp.vehicleReg}</div>
                      <div className="text-[11px] text-slate-400">{exp.driverName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                      ₹{exp.freightRevenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ₹{exp.fuelCost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ₹{exp.tollCost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ₹{exp.driverAllowance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
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
