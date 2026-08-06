'use client';

import React, { useState } from 'react';
import { Building2, Plus, MapPin, Phone, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader, Card, Button, AnimatedPage } from '@/components/ui';

export function CompanyContent() {
  const { branches, addBranch } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'branches'>('profile');

  // Branch Modal
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [capacity, setCapacity] = useState(50);
  const [contactPerson, setContactPerson] = useState('');

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName || !city) return;

    addBranch({
      name: branchName,
      code: `BR-${city.substring(0, 3).toUpperCase()}-0${branches.length + 1}`,
      city,
      state,
      contactPerson: contactPerson || 'Operations Lead',
      phone: '+91 98000 00000',
      capacity: Number(capacity)
    });

    setIsBranchModalOpen(false);
    setBranchName('');
    setCity('');
  };

  return (
    <AnimatedPage>
      {/* Page Header */}
      <PageHeader
        title="Company Profile & Branch Depots"
        description="Organization registration credentials, tax identifiers, and operational hubs."
        actions={
          activeTab === 'branches' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsBranchModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Branch Hub
            </Button>
          )
        }
      />

      {/* Tabs Header */}
      <div className="flex border-b border-[#202736] gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'profile' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent hover:text-slate-200'
          }`}
        >
          Company Information & GSTIN
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'branches' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent hover:text-slate-200'
          }`}
        >
          Branch Offices & Hubs ({branches.length})
        </button>
      </div>

      {activeTab === 'profile' ? (
        <Card glow="blue" className="p-6 space-y-6 max-w-4xl">
          <div className="flex items-center gap-4 pb-6 border-b border-[#202736]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-extrabold text-2xl shadow-xl shadow-blue-500/10">
              ML
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Mahindra Logistics India Ltd.</h2>
              <p className="text-xs text-slate-400">Transport & Enterprise Commercial Fleet Operations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Legal Company Name</label>
                <input
                  type="text"
                  readOnly
                  value="Mahindra Logistics India Ltd."
                  className="w-full bg-[#1c2333]/80 border border-[#2e374a] rounded-lg px-3 py-2 text-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">GSTIN Identification Number</label>
                <input
                  type="text"
                  readOnly
                  value="27AAAAA0000A1Z5"
                  className="w-full bg-[#1c2333]/80 border border-[#2e374a] rounded-lg px-3 py-2 text-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Permanent Account Number (PAN)</label>
                <input
                  type="text"
                  readOnly
                  value="AAAAA0000A"
                  className="w-full bg-[#1c2333]/80 border border-[#2e374a] rounded-lg px-3 py-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Motor Transport Operator (MTO) License</label>
                <input
                  type="text"
                  readOnly
                  value="MTO/MH/2024/09124"
                  className="w-full bg-[#1c2333]/80 border border-[#2e374a] rounded-lg px-3 py-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Registered Head Office Address</label>
                <textarea
                  readOnly
                  rows={3}
                  value="1A & B, Techniplex-I, Off Veer Savarkar Flyover, Goregaon West, Mumbai, Maharashtra 400062"
                  className="w-full bg-[#1c2333]/80 border border-[#2e374a] rounded-lg p-3 text-slate-200 leading-relaxed"
                />
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map(branch => (
            <Card key={branch.id} glow="blue" className="p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#202736] pb-3">
                <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                  {branch.code}
                </span>
                <span className="text-[11px] text-slate-400">{branch.capacity} Vehicles Yard</span>
              </div>
              <h3 className="font-bold text-slate-100 text-sm">{branch.name}</h3>
              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {branch.city}, {branch.state}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {branch.contactPerson} ({branch.phone})
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-[#202736] rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#202736] pb-4">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Add Branch Depot</span>
              </div>
              <button onClick={() => setIsBranchModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Branch Hub Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhiwandi Logistics Park"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Contact Lead</label>
                  <input
                    type="text"
                    placeholder="Person Name"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Yard Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#202736] flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsBranchModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add Branch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
