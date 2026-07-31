'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Shield,
  FileCheck,
  X,
  UserPlus
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Driver } from '@/types';

export function DriversContent() {
  const { drivers, addDriver } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState<Driver['licenseCategory']>('HMV');
  const [experienceYears, setExperienceYears] = useState(5);
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  const filteredDrivers = drivers.filter(
    d =>
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm)
  );

  const handleOnboardDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !licenseNumber) return;

    addDriver({
      fullName,
      phone: phone || '+91 98765 00000',
      licenseNumber: licenseNumber.toUpperCase(),
      licenseCategory,
      licenseExpiry: '2029-10-30',
      experienceYears: Number(experienceYears),
      assignedVehicle: 'Unassigned',
      status: 'Active',
      verificationStatus: 'Fully Verified',
      aadhaarNumber: aadhaarNumber || '9000 0000 0000',
      emergencyContact: {
        name: 'Family Contact',
        phone: '+91 98765 00001',
        relation: 'Spouse'
      }
    });

    setIsModalOpen(false);
    setFullName('');
    setLicenseNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Human Capital & Drivers Directory</h1>
          <p className="text-sm text-slate-400">
            Commercial driver profiles, license verification status, and vehicle assignments.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard Driver</span>
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
            placeholder="Search driver name, phone, license..."
            className="w-full bg-[#1c2333] border border-[#2e374a] focus:border-blue-500 focus:outline-none rounded-lg text-xs text-slate-200 placeholder:text-slate-500 pl-9 pr-3 py-2 transition-all"
          />
        </div>
      </div>

      {/* Driver Data Table */}
      <div className="bg-[#121824] border border-[#202736] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1c2333]/60 text-slate-400 border-b border-[#202736] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Driver Name</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">License Number</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Experience</th>
                <th className="py-3.5 px-4">Assigned Vehicle</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736] text-slate-200">
              {filteredDrivers.map(driver => (
                <tr key={driver.id} className="hover:bg-[#1c2333]/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
                      {driver.fullName.charAt(0)}
                    </div>
                    <span>{driver.fullName}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {driver.phone}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{driver.licenseNumber}</td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="bg-[#1c2333] border border-[#2e374a] px-2 py-0.5 rounded text-[11px]">
                      {driver.licenseCategory}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{driver.experienceYears} Years</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-blue-400">
                    {driver.assignedVehicle || 'Unassigned'}
                  </td>
                  <td className="py-3.5 px-4">
                    {driver.verificationStatus === 'Fully Verified' ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-400">{driver.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-[#202736] rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#202736] pb-4">
              <div className="flex items-center gap-2 text-slate-100 font-semibold text-lg">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <span>Onboard Commercial Driver</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardDriver} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Commercial DL Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH12 20180091234"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono uppercase focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">License Category</label>
                  <select
                    value={licenseCategory}
                    onChange={e => setLicenseCategory(e.target.value as any)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                    <option value="Trailer">Multi-Axle Trailer</option>
                    <option value="Hazardous Goods">Hazardous Cargo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Experience (Years)</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={e => setExperienceYears(Number(e.target.value))}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Aadhaar Card Number</label>
                  <input
                    type="text"
                    placeholder="12-digit Aadhaar"
                    value={aadhaarNumber}
                    onChange={e => setAadhaarNumber(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
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
                  Complete Driver Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
