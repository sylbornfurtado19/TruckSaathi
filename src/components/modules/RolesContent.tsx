'use client';

import React, { useState } from 'react';
import { ShieldCheck, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader, Card, Button, AnimatedPage, itemVariants } from '@/components/ui';

export function RolesContent() {
  const [selectedRole, setSelectedRole] = useState<'Company Admin' | 'Fleet Manager' | 'Dispatcher'>('Fleet Manager');

  // Permission Matrix State
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({
    vehicles: { read: true, create: true, update: true, delete: false },
    drivers: { read: true, create: true, update: true, delete: false },
    company: { read: true, create: false, update: false, delete: false },
    users: { read: true, create: false, update: false, delete: false },
    roles: { read: false, create: false, update: false, delete: false }
  });

  const togglePermission = (module: string, action: string) => {
    setMatrix(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module]?.[action]
      }
    }));
  };

  return (
    <AnimatedPage>
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Roles & Granular Permissions Matrix (RBAC)"
          description="Configure security authorization bounds and CRUD capabilities per enterprise role."
          actions={
            <Button variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
              Save Matrix
            </Button>
          }
        />
      </motion.div>

      {/* Role Selector Tabs */}
      <motion.div variants={itemVariants} className="flex border-b border-[#202736] gap-4">
        {(['Company Admin', 'Fleet Manager', 'Dispatcher'] as const).map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              selectedRole === role
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{role}</span>
          </button>
        ))}
      </motion.div>

      {/* Permission Table */}
      <motion.div variants={itemVariants}>
        <Card glow="blue" className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#202736] pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100">Capability Matrix for {selectedRole}</h2>
            <p className="text-xs text-slate-400">Check or uncheck CRUD actions permitted for this role</p>
          </div>
          <Button variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
            Save Permission Matrix
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1c2333]/80 backdrop-blur-md text-slate-400 border-b border-[#202736] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Platform Module</th>
                <th className="py-3.5 px-4 text-center">Read / View</th>
                <th className="py-3.5 px-4 text-center">Create / Onboard</th>
                <th className="py-3.5 px-4 text-center">Edit / Update</th>
                <th className="py-3.5 px-4 text-center">Delete / Purge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736]/60 text-slate-200">
              {[
                { key: 'vehicles', name: 'Vehicle Asset Registry' },
                { key: 'drivers', name: 'Driver Human Capital' },
                { key: 'company', name: 'Company Profile & Hubs' },
                { key: 'users', name: 'User Management' },
                { key: 'roles', name: 'Roles & RBAC Settings' }
              ].map(item => (
                <tr key={item.key} className="hover:bg-[#1c2333]/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{item.name}</td>
                  {['read', 'create', 'update', 'delete'].map(action => {
                    const isChecked = matrix[item.key]?.[action] ?? false;
                    return (
                      <td key={action} className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(item.key, action)}
                          className="w-4 h-4 rounded bg-[#1c2333] border-[#2e374a] text-blue-600 focus:ring-0 focus-visible:ring-2 focus-visible:ring-blue-500/80 cursor-pointer accent-blue-600"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </motion.div>
    </AnimatedPage>
  );
}
