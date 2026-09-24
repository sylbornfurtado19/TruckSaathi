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
  UserCheck,
  Bot,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  AnimatedPage,
  AnimatedNumber,
  itemVariants
} from '@/components/ui';

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

  // Identify at-risk drivers (score < 85)
  const atRiskDrivers = sortedDrivers.filter(d => d.score < 85);

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Safety Telematics
            </span>
          }
          title="Fleet Driver Safety & Risk Analytics"
          description="Real-time telematics scoring, road violation telemetry, collision risk mitigation, and personalized driver coaching."
        />
      </motion.div>

      {/* 2. Hero KPI: Aggregate Fleet Safety Score */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 border-[#1e2e4a] bg-[#080d1a]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] text-blue-400 font-mono font-bold uppercase tracking-wider">ENTERPRISE TELEMATICS INDEX</span>
                <h2 className="text-xl font-bold text-slate-100">Fleet Aggregate Safety Rating</h2>
                <p className="text-xs text-slate-400 mt-0.5">Calculated from harsh braking, highway overspeed, rapid acceleration, and DMS fatigue sensors.</p>
              </div>
            </div>
            <div className="text-right bg-[#0a0f1d] px-6 py-3 rounded-xl border border-[#1e2e4a] shrink-0">
              <div className="text-3xl font-extrabold font-mono text-emerald-400 flex items-center gap-1 justify-end">
                <AnimatedNumber value={aggregateSafetyScore} />
                <span className="text-lg text-slate-500">/100</span>
              </div>
              <div className="text-[11px] text-emerald-400/90 font-medium">Top Tier Commercial Safety</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 3. Safety Event Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedEventType(selectedEventType === 'overspeed' ? null : 'overspeed')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedEventType === 'overspeed'
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-[#0b1120] border-[#1e2e4a] hover:border-blue-500/40 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Overspeed</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">{totalOverspeed}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">&gt;80 km/h limit</div>
        </button>

        <button
          onClick={() => setSelectedEventType(selectedEventType === 'braking' ? null : 'braking')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedEventType === 'braking'
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-[#0b1120] border-[#1e2e4a] hover:border-blue-500/40 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Harsh Brakes</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">{totalHarshBraking}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">&gt;0.4g de-accel</div>
        </button>

        <button
          onClick={() => setSelectedEventType(selectedEventType === 'accel' ? null : 'accel')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedEventType === 'accel'
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-[#0b1120] border-[#1e2e4a] hover:border-blue-500/40 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Rapid Accel</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">{totalRapidAccel}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Throttle spikes</div>
        </button>

        <button
          onClick={() => setSelectedEventType(selectedEventType === 'fatigue' ? null : 'fatigue')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedEventType === 'fatigue'
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-[#0b1120] border-[#1e2e4a] hover:border-blue-500/40 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Fatigue Alerts</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">{totalFatigue}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">DMS camera</div>
        </button>

        <button
          onClick={() => setSelectedEventType(selectedEventType === 'seatbelt' ? null : 'seatbelt')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedEventType === 'seatbelt'
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-[#0b1120] border-[#1e2e4a] hover:border-blue-500/40 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Seatbelt Alerts</span>
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">{totalSeatbelt}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">In-motion alert</div>
        </button>
      </motion.div>

      {/* 4. Driver Safety Leaderboard Table */}
      <motion.div variants={itemVariants} className="border border-[#1e2e4a] rounded-xl overflow-hidden bg-[#0b1120]/80 backdrop-blur-md shadow-xl">
        <div className="p-4 border-b border-[#1e2e4a] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Driver Safety Leaderboard & Risk Rankings
            </h3>
            <p className="text-xs text-slate-400">Ranked by composite telematics score. Identifies top performers and coaching targets.</p>
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
              <tr className="bg-[#0d1527] text-slate-400 border-b border-[#1e2e4a] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-mono">Rank</th>
                <th className="py-3.5 px-4">Driver Name</th>
                <th className="py-3.5 px-4 font-mono">Safety Score</th>
                <th className="py-3.5 px-4 font-mono">Assigned Asset</th>
                <th className="py-3.5 px-4 font-mono">Overspeed</th>
                <th className="py-3.5 px-4 font-mono">Harsh Brakes</th>
                <th className="py-3.5 px-4 font-mono">Fatigue Alerts</th>
                <th className="py-3.5 px-4">Risk Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233b] text-slate-200">
              {filteredDrivers.map((driver, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;
                return (
                  <tr key={driver.id} className="hover:bg-[#131f38] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {isTop3 ? (
                        <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                          Rank #{rank}
                        </span>
                      ) : (
                        <span className="text-slate-400">#{rank}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] text-blue-400">
                        {driver.fullName.charAt(0)}
                      </div>
                      <span>{driver.fullName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs">
                      <span className={driver.score >= 90 ? 'text-emerald-400' : driver.score >= 75 ? 'text-amber-400' : 'text-rose-400'}>
                        {driver.score} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{driver.assignedVehicle || 'Standby'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{driver.events.overspeedCount}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{driver.events.harshBrakingCount}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{driver.events.fatigueAlertCount}</td>
                    <td className="py-3.5 px-4">
                      {driver.score >= 90 ? (
                        <Badge variant="success">Low Risk</Badge>
                      ) : driver.score >= 75 ? (
                        <Badge variant="warning">Moderate Risk</Badge>
                      ) : (
                        <Badge variant="danger">High Risk</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 5. AI Safety Coaching Recommendations */}
      {atRiskDrivers.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>AI Safety Coaching Recommendations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {atRiskDrivers.map(driver => (
              <div
                key={driver.id}
                className="bg-[#0b1329] border border-cyan-500/30 rounded-xl p-5 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>{driver.fullName} ({driver.assignedVehicle || 'Unassigned'})</span>
                  </div>
                  <Badge variant="warning">Score: {driver.score}/100</Badge>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Recorded <span className="font-mono text-amber-300 font-bold">{driver.events.harshBrakingCount} harsh-braking</span> and{' '}
                  <span className="font-mono text-amber-300 font-bold">{driver.events.overspeedCount} overspeed</span> events this cycle. Recommend defensive driving course for payload safety.
                </p>

                <div className="pt-2 border-t border-[#1e2e4a] flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Recommended: Defensive Driving Refresher</span>
                  <Button variant="primary" size="sm" className="text-[11px] py-1 bg-gradient-to-r from-blue-600 to-cyan-600">
                    Assign Coaching Module
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
