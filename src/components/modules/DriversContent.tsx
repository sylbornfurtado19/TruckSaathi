'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Phone,
  UserPlus,
  Download,
  ShieldCheck,
  Award,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Driver } from '@/types';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  AnimatedPage,
  KPICard,
  Modal,
  EmptyState,
  itemVariants
} from '@/components/ui';
import { exportToCSV } from '@/lib/csvExport';

export function DriversContent() {
  const { drivers, addDriver } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState<Driver['licenseCategory']>('HMV');
  const [experienceYears, setExperienceYears] = useState(5);
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  // Stats calculation
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.status === 'Active').length;
  const verifiedDrivers = drivers.filter(d => d.verificationStatus === 'Fully Verified').length;
  const avgSafetyScore = Math.round(
    drivers.reduce((acc, d) => acc + (d.safetyScore || 90), 0) / (totalDrivers || 1)
  );

  const filteredDrivers = drivers.filter(
    d =>
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm)
  );

  const handleExportCSV = () => {
    const exportData = filteredDrivers.map(d => ({
      FullName: d.fullName,
      Phone: d.phone,
      LicenseNumber: d.licenseNumber,
      LicenseCategory: d.licenseCategory,
      LicenseExpiry: d.licenseExpiry,
      ExperienceYears: d.experienceYears,
      AssignedVehicle: d.assignedVehicle || 'Unassigned',
      Status: d.status,
      VerificationStatus: d.verificationStatus,
      SafetyScore: d.safetyScore || 90
    }));
    exportToCSV(exportData, `drivers_export_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleOnboardDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !licenseNumber) return;

    addDriver({
      fullName,
      phone: phone || '+91 98765 00000',
      licenseNumber: licenseNumber.toUpperCase().trim(),
      licenseCategory,
      licenseExpiry: '2029-10-30',
      experienceYears: Number(experienceYears),
      assignedVehicle: 'Unassigned',
      status: 'Active',
      verificationStatus: 'Fully Verified',
      aadhaarNumber: aadhaarNumber || '9000 0000 0000',
      emergencyContact: {
        name: 'Family Emergency Contact',
        phone: '+91 98765 00001',
        relation: 'Spouse'
      }
    });

    setIsModalOpen(false);
    setFullName('');
    setPhone('');
    setLicenseNumber('');
    setAadhaarNumber('');
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Users className="w-3.5 h-3.5" />
              Human Capital
            </span>
          }
          title="Human Capital & Drivers Directory"
          description="Commercial driver profiles, Sarathi DL verification status, telematics safety scores, and vehicle route assignments."
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
                Onboard Driver
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 2. Drivers KPI Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Registered Drivers"
          value={totalDrivers}
          subtext="Commercial transport roster"
          icon={<Users className="w-4 h-4 text-blue-400" />}
          iconBg="bg-blue-600/15 border border-blue-500/30 text-blue-400"
        />
        <KPICard
          title="Active on Duty"
          value={activeDrivers}
          subtext={`${Math.round((activeDrivers / (totalDrivers || 1)) * 100)}% roster deployment rate`}
          trend={{ value: `${activeDrivers} ready`, isPositive: true }}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          iconBg="bg-emerald-600/15 border border-emerald-500/30 text-emerald-400"
        />
        <KPICard
          title="KYC & Sarathi Verified"
          value={verifiedDrivers}
          subtext="Government portal checked"
          trend={{ value: "100% compliant", isPositive: true }}
          icon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
          iconBg="bg-indigo-600/15 border border-indigo-500/30 text-indigo-400"
        />
        <KPICard
          title="Average Fleet Safety"
          value={`${avgSafetyScore}/100`}
          subtext="Telematics driving score"
          trend={{ value: "Low accident risk", isPositive: true }}
          icon={<Award className="w-4 h-4 text-cyan-400" />}
          iconBg="bg-cyan-600/15 border border-cyan-500/30 text-cyan-400"
        />
      </motion.div>

      {/* 3. Search & Filter Bar */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 flex items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search driver name, phone, commercial license..."
              className="w-full rounded-control border border-border bg-surface px-3 py-2 pl-9 text-sm text-text-primary placeholder:text-text-muted"
            />
          </div>
        </Card>
      </motion.div>

      {/* 4. Enterprise Driver Data Table */}
      <motion.div variants={itemVariants} className="overflow-hidden rounded-card border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="sticky top-0 border-b border-border bg-surface-muted text-xs font-semibold text-text-secondary">
                <th className="py-3.5 px-4">Driver Profile</th>
                <th className="py-3.5 px-4 font-mono">Contact Phone</th>
                <th className="py-3.5 px-4 font-mono">License Number</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Experience</th>
                <th className="py-3.5 px-4 font-mono">Assigned Asset</th>
                <th className="py-3.5 px-4">Safety Score</th>
                <th className="py-3.5 px-4">KYC Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#16233b] text-slate-200">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12">
                    <EmptyState
                      icon={<Users className="w-8 h-8 text-slate-500" />}
                      title="No Drivers Found"
                      description="No driver records match your search criteria."
                      action={
                        <Button variant="secondary" size="sm" onClick={() => setSearchTerm('')}>
                          Clear Search
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredDrivers.map(driver => (
                  <tr
                    key={driver.id}
                    onClick={() => setSelectedDriver(driver)}
                    className="cursor-pointer transition-colors hover:bg-surface-muted group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
                        {driver.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100">{driver.fullName}</div>
                        <div className="text-xs text-text-muted font-mono">ID: {driver.id.slice(0, 8)}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {driver.phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-200 font-semibold">{driver.licenseNumber}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="neutral">{driver.licenseCategory}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">{driver.experienceYears} Years</td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      {driver.assignedVehicle === 'Unassigned' || !driver.assignedVehicle ? (
                        <span className="text-slate-500">Standby</span>
                      ) : (
                        <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {driver.assignedVehicle}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-12 overflow-hidden rounded-full border border-border bg-surface-muted">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${driver.safetyScore || 92}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-emerald-400">
                          {driver.safetyScore || 92}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {driver.verificationStatus === 'Fully Verified' ? (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <AlertTriangle className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedDriver(driver);
                        }}
                        title="View Profile"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 5. Onboard Driver Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard Commercial Driver"
        description="Verify commercial driving license credentials and register personnel into the active fleet roster."
        size="lg"
      >
        <form onSubmit={handleOnboardDriver} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Full Legal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar Verma"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Contact Mobile Phone *</label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Commercial DL Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. MH12 20180091234"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">License Category</label>
              <select
                value={licenseCategory}
                onChange={e => setLicenseCategory(e.target.value as Driver['licenseCategory'])}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              >
                <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                <option value="Trailer">Multi-Axle Trailer Commercial</option>
                <option value="Hazardous Goods">Hazardous & Flammable Cargo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Highway Experience (Years)</label>
              <input
                type="number"
                min={1}
                max={40}
                value={experienceYears}
                onChange={e => setExperienceYears(Number(e.target.value))}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Aadhaar Card Number</label>
              <input
                type="text"
                placeholder="12-digit UIDAI Number"
                value={aadhaarNumber}
                onChange={e => setAadhaarNumber(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Verify & Complete Onboarding
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Driver Detail Modal */}
      {selectedDriver && (
        <Modal
          isOpen={!!selectedDriver}
          onClose={() => setSelectedDriver(null)}
          title={`Driver Dossier: ${selectedDriver.fullName}`}
          description={`License: ${selectedDriver.licenseNumber} • ${selectedDriver.licenseCategory}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between rounded-control border border-border bg-surface-muted p-4">
              <div>
                <span className="text-[11px] text-slate-400 font-mono">Assigned Asset</span>
                <div className="text-base font-bold font-mono text-blue-400">{selectedDriver.assignedVehicle || 'Standby Pool'}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono">Highway Experience</span>
                <div className="text-base font-bold font-mono text-slate-100">{selectedDriver.experienceYears} Years</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-mono">Safety Telematics</span>
                <div className="text-base font-bold font-mono text-emerald-400">{selectedDriver.safetyScore || 94}% Nominal</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-control border border-border bg-surface-muted p-3">
                <div className="text-slate-400 text-[11px] font-medium">Contact Phone</div>
                <div className="font-mono text-slate-100 font-bold mt-0.5">{selectedDriver.phone}</div>
              </div>
              <div className="rounded-control border border-border bg-surface-muted p-3">
                <div className="text-slate-400 text-[11px] font-medium">Sarathi DL Expiry</div>
                <div className="font-mono text-slate-100 font-bold mt-0.5">{selectedDriver.licenseExpiry || '2029-10-30'}</div>
              </div>
            </div>

            {selectedDriver.emergencyContact && (
              <div className="space-y-1.5 rounded-control border border-border bg-surface-muted p-3.5">
                <div className="font-semibold text-text-secondary">Family emergency contact</div>
                <div className="flex items-center justify-between text-slate-200">
                  <span className="font-medium">{selectedDriver.emergencyContact.name} ({selectedDriver.emergencyContact.relation})</span>
                  <span className="font-mono text-blue-400">{selectedDriver.emergencyContact.phone}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end border-t border-border pt-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedDriver(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatedPage>
  );
}
