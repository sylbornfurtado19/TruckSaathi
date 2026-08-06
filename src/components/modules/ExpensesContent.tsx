'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Fuel,
  UserCheck,
  Search,
  Download,
  PieChart,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader, Card, Button, Badge, KPICard, AnimatedPage, itemVariants } from '@/components/ui';
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
          title="Trip Expense & Settlement P&L"
          description="Commercial freight revenue breakdown, FASTag tolls, fuel cards, driver allowances, and net margins."
          actions={
            <Button variant="outline" size="sm" onClick={handleExportCSV} icon={<Download className="w-4 h-4" />}>
              Export P&L CSV
            </Button>
          }
        />
      </motion.div>

      {/* 2. KPI Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Gross Freight Revenue"
          value={`₹${totalFreightRevenue.toLocaleString()}`}
          subtext="Billed commercial freight income"
          icon={<DollarSign className="w-4 h-4" />}
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/30"
          glow="blue"
        />
        <KPICard
          title="Net Operating Profit"
          value={`₹${totalNetProfit.toLocaleString()}`}
          subtext={`Avg Margin: ${avgMargin}%`}
          icon={<TrendingUp className="w-4 h-4" />}
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          glow="emerald"
        />
        <KPICard
          title="Total Fuel Outlay"
          value={`₹${totalFuelExpenses.toLocaleString()}`}
          subtext="Diesel card & HPCL transactions"
          icon={<Fuel className="w-4 h-4" />}
          iconBg="bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
          glow="blue"
        />
        <KPICard
          title="Total FASTag Highway Tolls"
          value={`₹${totalTollExpenses.toLocaleString()}`}
          subtext="NHAI automated toll deductions"
          icon={<CreditCard className="w-4 h-4" />}
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/30"
          glow="amber"
        />
      </motion.div>

      {/* 3. Expense & P&L Table */}
      <motion.div variants={itemVariants} className="glass-panel rounded-xl overflow-hidden shadow-2xl space-y-4">
        <div className="p-4 border-b border-[#202736] flex items-center justify-between">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search trip code, vehicle, driver..."
              className="w-full bg-[#1c2333]/80 border border-[#2e374a] focus:border-blue-500 focus:outline-none rounded-lg text-xs text-slate-200 pl-9 pr-3 py-2"
            />
          </div>
          <Badge variant="info">{filteredExpenses.length} Trip P&L Statements</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1c2333]/80 text-slate-400 border-b border-[#202736] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Trip Code</th>
                <th className="py-3.5 px-4">Vehicle & Driver</th>
                <th className="py-3.5 px-4">Gross Revenue</th>
                <th className="py-3.5 px-4">Fuel Outlay</th>
                <th className="py-3.5 px-4">FASTag Tolls</th>
                <th className="py-3.5 px-4">Driver Allowance</th>
                <th className="py-3.5 px-4">Net Profit</th>
                <th className="py-3.5 px-4">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736]/60 text-slate-200">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-[#1c2333]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{exp.tripCode}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100">{exp.vehicleReg}</div>
                    <div className="text-[11px] text-slate-400">{exp.driverName}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-100">₹{exp.freightRevenue.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">₹{exp.fuelCost.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">₹{exp.tollCost.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">₹{exp.driverAllowance.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">₹{exp.netProfit.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success">
                      <ArrowUpRight className="w-3 h-3" /> {exp.profitMarginPercent}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AnimatedPage>
  );
}
