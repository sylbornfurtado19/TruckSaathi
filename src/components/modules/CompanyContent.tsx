'use client';

import React, { useState } from 'react';
import { Building2, Plus, MapPin, Phone, Building, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { PageHeader, Card, Button, Badge, AnimatedPage, Modal, itemVariants } from '@/components/ui';

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
    setContactPerson('');
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Building2 className="w-3.5 h-3.5" />
              Corporate Identity
            </span>
          }
          title="Company Profile & Operational Hubs"
          description="Organization legal registration credentials, GSTIN tax identifiers, and regional transport depot network."
          actions={
            activeTab === 'branches' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsBranchModalOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Regional Hub
              </Button>
            )
          }
        />
      </motion.div>

      {/* 2. Navigation Tabs */}
      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex border-b border-[#1e2e4a] gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'profile' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Company Credentials & GSTIN</span>
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'branches' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Regional Hubs & Depots ({branches.length})</span>
          </button>
        </div>

        {activeTab === 'profile' ? (
          <Card className="p-6 space-y-6 max-w-4xl border-[#1e2e4a]">
            <div className="flex items-center gap-4 pb-6 border-b border-[#1e2e4a]">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-xl font-mono">
                ML
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  Mahindra Logistics India Ltd.
                  <Badge variant="success" className="text-[10px]">Verified Enterprise</Badge>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Commercial Road Transport & Multimodal Logistics Division</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Legal Corporate Entity</label>
                  <input
                    type="text"
                    readOnly
                    value="Mahindra Logistics India Ltd."
                    className="w-full bg-[#0a0f1d] border border-[#1e2e4a] rounded-lg px-3 py-2.5 text-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">GSTIN Identification Number</label>
                  <input
                    type="text"
                    readOnly
                    value="27AAAAA0000A1Z5"
                    className="w-full bg-[#0a0f1d] border border-[#1e2e4a] rounded-lg px-3 py-2.5 text-blue-300 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Corporate PAN Number</label>
                  <input
                    type="text"
                    readOnly
                    value="AAAAA0000A"
                    className="w-full bg-[#0a0f1d] border border-[#1e2e4a] rounded-lg px-3 py-2.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">MTO Transport License</label>
                  <input
                    type="text"
                    readOnly
                    value="MTO/MH/2024/09124"
                    className="w-full bg-[#0a0f1d] border border-[#1e2e4a] rounded-lg px-3 py-2.5 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5 font-medium">Registered Head Office Address</label>
                  <textarea
                    readOnly
                    rows={3}
                    value="1A & B, Techniplex-I, Off Veer Savarkar Flyover, Goregaon West, Mumbai, Maharashtra 400062"
                    className="w-full bg-[#0a0f1d] border border-[#1e2e4a] rounded-lg p-3 text-slate-200 leading-relaxed font-sans"
                  />
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map(branch => (
              <Card key={branch.id} className="p-5 space-y-3 border-[#1e2e4a] hover:border-blue-500/40 transition-colors">
                <div className="flex items-center justify-between border-b border-[#1e2e4a] pb-3">
                  <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                    {branch.code}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{branch.capacity} Vehicles Yard</span>
                </div>
                <h3 className="font-bold text-slate-100 text-sm">{branch.name}</h3>
                <div className="text-xs text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{branch.city}, {branch.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{branch.contactPerson} ({branch.phone})</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Branch Modal */}
      <Modal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title="Add Regional Logistics Hub"
        description="Register a distribution center, parking yard, or transit terminal into your operations network."
        size="md"
      >
        <form onSubmit={handleAddBranch} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Branch Hub Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bhiwandi Freight Terminal"
              value={branchName}
              onChange={e => setBranchName(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#1e2e4a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mumbai"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e2e4a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">State</label>
              <input
                type="text"
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e2e4a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Depot Operations Lead"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-[#1e2e4a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Yard Capacity (Vehicles)</label>
              <input
                type="number"
                min={5}
                max={500}
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                className="w-full bg-[#0a0f1d] border border-[#1e2e4a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#1e2e4a] flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsBranchModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Hub
            </Button>
          </div>
        </form>
      </Modal>
    </AnimatedPage>
  );
}
