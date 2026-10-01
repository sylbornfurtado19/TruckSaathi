'use client';

import React, { useState } from 'react';
import { UserPlus, Search, Mail, CheckCircle2, Clock, Download, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { PageHeader, Card, Button, Badge, AnimatedPage, Modal, EmptyState, itemVariants } from '@/components/ui';
import { exportToCSV } from '@/lib/csvExport';

export function UsersContent() {
  const { users, addUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('Fleet Manager');
  const [department, setDepartment] = useState('Operations');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'Fleet Manager' | 'Driver'>('All');

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === 'All') return true;
    if (roleFilter === 'Admin') return u.role === 'Company Admin' || u.role === 'Super Admin';
    if (roleFilter === 'Fleet Manager') return u.role === 'Fleet Manager';
    if (roleFilter === 'Driver') return u.role === 'Driver';
    return true;
  });

  const handleExportCSV = () => {
    const exportData = filteredUsers.map(u => ({
      FullName: u.fullName,
      Email: u.email,
      Phone: u.phone,
      Role: u.role,
      Department: u.department,
      Status: u.status,
      LastActive: u.lastActive
    }));
    exportToCSV(exportData, `users_export_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleRoleSelection = (selected: UserRole) => {
    setRole(selected);
    if (selected === 'Driver') {
      setDepartment('Fleet Logistics');
    } else if (selected === 'Fleet Manager') {
      setDepartment('Operations');
    } else if (selected === 'Company Admin' || selected === 'Super Admin') {
      setDepartment('Executive Administration');
    }
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;

    addUser({
      fullName,
      email,
      phone: phone || '+91 90000 00000',
      role,
      department,
      status: 'Invited',
      lastActive: 'Pending Invite'
    });

    setIsModalOpen(false);
    setFullName('');
    setEmail('');
    setPhone('');
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-secondary">
              <Users className="w-3.5 h-3.5" />
              Access Control
            </span>
          }
          title="Team & User Directory"
          description="Enterprise system account provisioning, department access permissions, and authentication audit logs."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                icon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Invite User
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 2. Search & Role Filter Toolbar */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <div className="w-full sm:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search user name, email, department..."
                className="w-full rounded-control border border-border bg-surface px-3 py-2 pl-9 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus"
              />
            </div>

            {/* Quick Role Filters */}
            <div className="flex items-center gap-1 rounded-control border border-border bg-surface-muted p-1 text-xs">
              {(['All', 'Admin', 'Fleet Manager', 'Driver'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRoleFilter(tab)}
                  className={`rounded-control px-2.5 py-1.5 font-medium transition-colors ${
                    roleFilter === tab
                      ? 'bg-brand-orange text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 shrink-0">{filteredUsers.length} Users Provisioned</span>
        </Card>
      </motion.div>

      {/* 3. User Data Table */}
      <motion.div variants={itemVariants} className="overflow-hidden rounded-card border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th className="py-3.5 px-4">User Name</th>
                <th className="py-3.5 px-4 font-mono">Work Email</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 font-mono">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-primary">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      icon={<Users className="w-8 h-8 text-slate-500" />}
                      title="No Users Found"
                      description="No team members match your search criteria."
                      action={
                        <Button variant="secondary" size="sm" onClick={() => setSearchTerm('')}>
                          Clear Search
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="transition-colors hover:bg-surface-muted">
                    <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {user.fullName.charAt(0)}
                      </div>
                      <span>{user.fullName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {user.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <Badge
                        variant={
                          user.role === 'Super Admin' || user.role === 'Company Admin'
                            ? 'info'
                            : user.role === 'Fleet Manager'
                            ? 'info'
                            : user.role === 'Driver'
                            ? 'neutral'
                            : 'success'
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{user.department}</td>
                    <td className="py-3.5 px-4">
                      {user.status === 'Active' ? (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <Clock className="w-3 h-3" /> Invited
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-text-secondary">{user.lastActive}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 4. Invite User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invite Team Member"
        description="Provision administrative or dispatch credentials to collaborate on the TruckSaathi platform."
        size="md"
      >
        <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Anish Shah"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full rounded-control border border-border bg-surface px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Work Email Address *</label>
            <input
              type="email"
              required
              placeholder="name@mahindra.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Platform Role *</label>
              <select
                value={role}
                onChange={e => handleRoleSelection(e.target.value as UserRole)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
              >
                <option value="Company Admin">Admin (Company Admin)</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Driver">Driver</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
              />
            </div>
          </div>

          {/* Role Entitlements Note */}
          <div className="rounded-control border border-border bg-surface-muted p-2.5 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">Role Permissions: </span>
            {role === 'Company Admin' || role === 'Super Admin' ? (
              <span>Full control tower access, user provisioning, role matrix config, system and finance management.</span>
            ) : role === 'Fleet Manager' ? (
              <span>Vehicles registry, driver assignments, live dispatches, predictive maintenance, and fuel telemetry.</span>
            ) : role === 'Driver' ? (
              <span>Mobile Field Portal, active trip navigation, inspection reporting, and proof-of-delivery (POD) uploads.</span>
            ) : (
              <span>Dispatch operations and live shipment routing.</span>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Platform Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </AnimatedPage>
  );
}
