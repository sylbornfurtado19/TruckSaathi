'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Search, Mail, Shield, CheckCircle2, Clock, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { User } from '@/types';

export function UsersContent() {
  const { users, addUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<User['role']>('Fleet Manager');
  const [department, setDepartment] = useState('Operations');

  const filteredUsers = users.filter(
    u =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Team & User Directory</h1>
          <p className="text-sm text-slate-400">
            System account provisioning, administrative credentials, and departmental roles.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite User</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#121824] border border-[#202736] rounded-xl p-4 flex items-center justify-between">
        <div className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search full name, work email..."
            className="w-full bg-[#1c2333] border border-[#2e374a] focus:border-blue-500 focus:outline-none rounded-lg text-xs text-slate-200 placeholder:text-slate-500 pl-9 pr-3 py-2 transition-all"
          />
        </div>
      </div>

      {/* User Data Table */}
      <div className="bg-[#121824] border border-[#202736] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1c2333]/60 text-slate-400 border-b border-[#202736] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">User Name</th>
                <th className="py-3.5 px-4">Work Email</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736] text-slate-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-[#1c2333]/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
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
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        user.role === 'Company Admin'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : user.role === 'Fleet Manager'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{user.department}</td>
                  <td className="py-3.5 px-4">
                    {user.status === 'Active' ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[11px] font-medium inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[11px] font-medium inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Invited
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">{user.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-[#202736] rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#202736] pb-4">
              <div className="flex items-center gap-2 text-slate-100 font-semibold text-base">
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>Invite Team Member</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anish Shah"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Work Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Platform Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="Fleet Manager">Fleet Manager</option>
                    <option value="Dispatcher">Dispatcher</option>
                    <option value="Company Admin">Company Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#202736] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#1c2333] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
