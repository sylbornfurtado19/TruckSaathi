'use client';

import React, { useState } from 'react';
import { Settings, Bell, Shield, FileText, Moon, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function SettingsContent() {
  const { activityLogs } = useApp();
  const [activeTab, setActiveTab] = useState<'general' | 'audit'>('general');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">System Settings & Audit Logs</h1>
        <p className="text-sm text-slate-400">
          Organization thresholds, compliance alerts, security preferences, and audit trails.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#202736] gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'general' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent hover:text-slate-200'
          }`}
        >
          General Configuration & Thresholds
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'audit' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent hover:text-slate-200'
          }`}
        >
          System Audit Stream ({activityLogs.length})
        </button>
      </div>

      {activeTab === 'general' ? (
        <div className="bg-[#121824] border border-[#202736] rounded-xl p-6 space-y-6 max-w-3xl text-xs">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Compliance Document Expiry Thresholds</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Warning Threshold (Days Before Expiry)</label>
                <input
                  type="number"
                  defaultValue={30}
                  className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Critical Alert Threshold (Days)</label>
                <input
                  type="number"
                  defaultValue={7}
                  className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#202736] space-y-4">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Security & Session Policies</span>
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-blue-600" />
                <span>Enforce Row Level Security (RLS) on Supabase PostgreSQL tables</span>
              </label>

              <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-blue-600" />
                <span>Require 2FA authentication for Company Admin users</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#202736]">
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg">
              Save Settings Configuration
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#121824] border border-[#202736] rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#202736] font-semibold text-slate-200 text-xs">
            Chronological Audit History
          </div>
          <div className="divide-y divide-[#202736] text-xs">
            {activityLogs.map(log => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-[#1c2333]/30">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200">{log.action}</div>
                  <div className="text-slate-500">
                    User: <span className="text-slate-300">{log.user}</span> ({log.role}) • Module:{' '}
                    <span className="text-blue-400">{log.module}</span>
                  </div>
                </div>
                <div className="text-slate-500 font-mono text-right">{log.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
