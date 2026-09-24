'use client';

import React, { useState } from 'react';
import { ShieldCheck, Save, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserRole } from '@/types';
import { PageHeader, Card, Button, AnimatedPage, itemVariants } from '@/components/ui';

export function RolesContent() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Fleet Manager');
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const ROLES_LIST: UserRole[] = [
    'Super Admin',
    'Company Admin',
    'Fleet Manager',
    'Dispatcher',
    'Driver'
  ];

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              RBAC Governance
            </span>
          }
          title="Roles & Granular Permissions Matrix"
          description="Define enterprise authorization boundaries, granular CRUD entitlements, and role-based data isolation rules."
          actions={
            <Button
              variant="primary"
              size="sm"
              icon={savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              onClick={handleSave}
            >
              {savedSuccess ? 'Matrix Saved!' : 'Save Permissions'}
            </Button>
          }
        />
      </motion.div>

      {/* 2. Role Selector Tabs */}
      <motion.div variants={itemVariants} className="flex border-b border-[#1e2e4a] gap-2 overflow-x-auto pb-px text-xs">
        {ROLES_LIST.map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`pb-3 px-3.5 font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedRole === role
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{role}</span>
          </button>
        ))}
      </motion.div>

      {/* 3. Capability Matrix Table */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 space-y-6 border-[#1e2e4a]">
          <div className="flex items-center justify-between border-b border-[#1e2e4a] pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">Capability Entitlement Matrix: {selectedRole}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Toggle CRUD operations and module access allowed for users in this role group.</p>
            </div>
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5" /> Changes committed to database
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0d1527] text-slate-400 border-b border-[#1e2e4a] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Platform Module</th>
                  <th className="py-3.5 px-4 text-center">Read / View</th>
                  <th className="py-3.5 px-4 text-center">Create / Dispatch</th>
                  <th className="py-3.5 px-4 text-center">Edit / Update</th>
                  <th className="py-3.5 px-4 text-center">Delete / Purge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16233b] text-slate-200">
                {[
                  { key: 'vehicles', name: 'Commercial Vehicle Registry' },
                  { key: 'drivers', name: 'Human Capital & Drivers Directory' },
                  { key: 'company', name: 'Company Profile & Hub Network' },
                  { key: 'users', name: 'User Management & Provisioning' },
                  { key: 'roles', name: 'Security Roles & RBAC Settings' }
                ].map(item => (
                  <tr key={item.key} className="hover:bg-[#131f38] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-100">{item.name}</td>
                    {['read', 'create', 'update', 'delete'].map(action => {
                      const isChecked = matrix[item.key]?.[action] ?? false;
                      return (
                        <td key={action} className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(item.key, action)}
                            className="w-4 h-4 rounded bg-[#0a0f1d] border-[#1e2e4a] text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
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
