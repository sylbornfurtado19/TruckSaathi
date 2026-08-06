'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Award,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Sparkles,
  Bot,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Driver } from '@/types';
import { PageHeader, Card, Button, Badge, AnimatedPage, AnimatedNumber, itemVariants } from '@/components/ui';

export function SafetyContent() {
  const { drivers } = useApp();
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);

  // Compute aggregate safety scores and event counts across drivers
  const driversWithSafety = drivers.map(d => {
    const events = d.safetyEvents || {
      overspeedCount: 0,
      harshBrakingCount: 0,
      rapidAccelCount: 0,
      fatigueAlertCount: 0,
      seatbeltViolationCount: 0
    };
    const score = d.safetyScore !== undefined ? d.safetyScore : 90;
    return { ...d, score, events };
  });

  const aggregateSafetyScore = Math.round(
    driversWithSafety.reduce((acc, d) => acc + d.score, 0) / (driversWithSafety.length || 1)
  );

  const totalOverspeed = driversWithSafety.reduce((acc, d) => acc + d.events.overspeedCount, 0);
  const totalHarshBraking = driversWithSafety.reduce((acc, d) => acc + d.events.harshBrakingCount, 0);
  const totalRapidAccel = driversWithSafety.reduce((acc, d) => acc + d.events.rapidAccelCount, 0);
  const totalFatigue = driversWithSafety.reduce((acc, d) => acc + d.events.fatigueAlertCount, 0);
  const totalSeatbelt = driversWithSafety.reduce((acc, d) => acc + d.events.seatbeltViolationCount, 0);

  // Sort leaderboard by score descending
  const sortedDrivers = [...driversWithSafety].sort((a, b) => b.score - a.score);

  // Filter leaderboard if an event card is selected
  const filteredDrivers = selectedEventType
    ? sortedDrivers.filter(d => {
        if (selectedEventType === 'overspeed') return d.events.overspeedCount > 0;
        if (selectedEventType === 'braking') return d.events.harshBrakingCount > 0;
        if (selectedEventType === 'accel') return d.events.rapidAccelCount > 0;
        if (selectedEventType === 'fatigue') return d.events.fatigueAlertCount > 0;
        if (selectedEventType === 'seatbelt') return d.events.seatbeltViolationCount > 0;
        return true;
      })
    : sortedDrivers;

  // Identify at-risk drivers (score < 80)
  const atRiskDrivers = sortedDrivers.filter(d => d.score < 85);

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="AI Fleet Safety Center"
          description="Driver risk scoring, telemetry violation counts, and personalized AI coaching recommendations."
        />
      </motion.div>

      {/* 2. Hero KPI: Aggregate Fleet Safety Score */}
      <motion.div variants={itemVariants}>
        <Card glow="blue" className="p-6 bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-indigo-950/30 border border-blue-500/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-xl">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs text-blue-400 font-mono font-bold uppercase tracking-wider">ENTERPRISE TELEMETRY INDEX</span>
                <h2 className="text-2xl font-bold text-slate-100">Fleet Aggregate Safety Rating</h2>
                <p className="text-xs text-slate-400">Based on real-time OBD-II sensor readings, camera AI, and driver behavior analytics.</p>
              </div>
            </div>
            <div className="text-right bg-[#1c2333]/80 px-6 py-3 rounded-2xl border border-[#2e374a] shadow-inner">
              <div className="text-4xl font-extrabold font-mono text-emerald-400 flex items-center gap-1 justify-end">
                <AnimatedNumber value={aggregateSafetyScore} />
                <span className="text-xl text-slate-400">/100</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Top 5% in Logistics Sector</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 3. Safety Event Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div
          onClick={() => setSelectedEventType(selectedEventType === 'overspeed' ? null : 'overspeed')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedEventType === 'overspeed'
              ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10'
              : 'bg-[#1c2333]/60 border-[#202736] hover:border-[#2e374a]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Overspeed Events</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{totalOverspeed}</div>
          <div className="text-[10px] text-slate-500 mt-1">Exceeded 80 km/h limit</div>
        </div>

        <div
          onClick={() => setSelectedEventType(selectedEventType === 'braking' ? null : 'braking')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedEventType === 'braking'
              ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10'
              : 'bg-[#1c2333]/60 border-[#202736] hover:border-[#2e374a]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Harsh Braking</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{totalHarshBraking}</div>
          <div className="text-[10px] text-slate-500 mt-1">De-acceleration &gt; 0.4g</div>
        </div>

        <div
          onClick={() => setSelectedEventType(selectedEventType === 'accel' ? null : 'accel')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedEventType === 'accel'
              ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10'
              : 'bg-[#1c2333]/60 border-[#202736] hover:border-[#2e374a]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Rapid Accel</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{totalRapidAccel}</div>
          <div className="text-[10px] text-slate-500 mt-1">Throttle spikes</div>
        </div>

        <div
          onClick={() => setSelectedEventType(selectedEventType === 'fatigue' ? null : 'fatigue')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedEventType === 'fatigue'
              ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10'
              : 'bg-[#1c2333]/60 border-[#202736] hover:border-[#2e374a]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Fatigue Alerts</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{totalFatigue}</div>
          <div className="text-[10px] text-slate-500 mt-1">DMS camera detection</div>
        </div>

        <div
          onClick={() => setSelectedEventType(selectedEventType === 'seatbelt' ? null : 'seatbelt')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedEventType === 'seatbelt'
              ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10'
              : 'bg-[#1c2333]/60 border-[#202736] hover:border-[#2e374a]'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Seatbelt Alerts</span>
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{totalSeatbelt}</div>
          <div className="text-[10px] text-slate-500 mt-1">Unbuckled in motion</div>
        </div>
      </motion.div>

      {/* 4. Driver Safety Leaderboard Table */}
      <motion.div variants={itemVariants} className="glass-panel rounded-xl overflow-hidden shadow-2xl space-y-4">
        <div className="p-4 border-b border-[#202736] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Driver Safety Leaderboard & Risk Rankings
            </h3>
            <p className="text-xs text-slate-400">Ranked by overall safety index score. Top performers highlighted.</p>
          </div>
          {selectedEventType && (
            <Button variant="outline" size="sm" onClick={() => setSelectedEventType(null)}>
              Reset Filter
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1c2333]/80 backdrop-blur-md text-slate-400 border-b border-[#202736] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Driver Name</th>
                <th className="py-3.5 px-4">Safety Score</th>
                <th className="py-3.5 px-4">Assigned Vehicle</th>
                <th className="py-3.5 px-4">Overspeed</th>
                <th className="py-3.5 px-4">Harsh Brakes</th>
                <th className="py-3.5 px-4">Fatigue Alerts</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736]/60 text-slate-200">
              {filteredDrivers.map((driver, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;
                return (
                  <tr
                    key={driver.id}
                    className={`hover:bg-[#1c2333]/50 transition-colors border-l-2 ${
                      driver.score < 75
                        ? 'border-rose-500 bg-rose-500/5'
                        : isTop3
                        ? 'border-emerald-500'
                        : 'border-transparent'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {isTop3 ? (
                        <Badge variant="success">Rank #{rank}</Badge>
                      ) : (
                        <span className="text-slate-400">#{rank}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400">
                        {driver.fullName.charAt(0)}
                      </div>
                      <span>{driver.fullName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm">
                      <span className={driver.score >= 90 ? 'text-emerald-400' : driver.score >= 75 ? 'text-amber-400' : 'text-rose-400'}>
                        {driver.score} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{driver.assignedVehicle || 'Unassigned'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{driver.events.overspeedCount}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{driver.events.harshBrakingCount}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{driver.events.fatigueAlertCount}</td>
                    <td className="py-3.5 px-4">
                      {driver.score >= 90 ? (
                        <Badge variant="success">Low Risk</Badge>
                      ) : driver.score >= 75 ? (
                        <Badge variant="warning">Moderate Risk</Badge>
                      ) : (
                        <Badge variant="danger" pulse>High Risk</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 5. AI Recommendations Cards per At-Risk Driver */}
      {atRiskDrivers.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <Bot className="w-4 h-4 text-blue-400" />
            <span>AI Safety Coaching Recommendations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {atRiskDrivers.map(driver => (
              <div
                key={driver.id}
                className="bg-gradient-to-br from-blue-950/30 via-slate-900/60 to-indigo-950/30 border border-blue-500/30 rounded-xl p-5 space-y-3 relative overflow-hidden shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>{driver.fullName} ({driver.assignedVehicle || 'No Truck'})</span>
                  </div>
                  <Badge variant="warning">Score: {driver.score}/100</Badge>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Driver recorded <span className="font-mono text-amber-300 font-bold">{driver.events.harshBrakingCount} harsh-braking</span> and{' '}
                  <span className="font-mono text-amber-300 font-bold">{driver.events.overspeedCount} overspeed</span> events this week. High risk of brake pad premature wear and collision hazards on highway corridors.
                </p>

                <div className="pt-2 border-t border-blue-500/20 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Recommended: Defensive Driving Refresher</span>
                  <Button variant="primary" size="sm" className="text-[11px] py-1">
                    Assign AI Coaching Module
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatedPage>
  );
}
