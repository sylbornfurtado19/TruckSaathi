'use client';

import React, { useState, useMemo } from 'react';
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
  Truck,
  Calendar,
  Clock,
  ArrowRight,
  ShieldAlert,
  Route,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Driver, Trip } from '@/types';
import {
  PageHeader,
  Card,
  Panel,
  Button,
  Badge,
  AnimatedPage,
  KpiStrip,
  Drawer,
  Modal,
  EmptyState,
  StatusPill,
  itemVariants
} from '@/components/ui';
import { exportToCSV } from '@/lib/csvExport';

export function DriversContent() {
  const { drivers, addDriver, trips } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'On Leave'>('All');
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

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch =
        d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone.includes(searchTerm) ||
        (d.assignedVehicle && d.assignedVehicle.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  // Recent trips for selected driver
  const driverTrips = useMemo(() => {
    if (!selectedDriver) return [];
    return trips.filter(
      t => t.driverId === selectedDriver.id || t.driverName.toLowerCase() === selectedDriver.fullName.toLowerCase()
    );
  }, [selectedDriver, trips]);

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
    exportToCSV(exportData, `drivers_roster_${new Date().toISOString().slice(0, 10)}`);
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
      {/* 1. Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-cyan-300">
              <Users className="w-3.5 h-3.5" />
              COMMERCIAL PERSONNEL
            </span>
          }
          title="Commercial Pilots & Driver Directory"
          description="Sarathi DL verification status, telematics behavior monitoring, route assignments, and emergency contact protocols."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Export Roster
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                icon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Onboard Pilot
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 2. Compact KPI Command Strip */}
      <motion.div variants={itemVariants}>
        <KpiStrip
          items={[
            {
              label: 'TOTAL PILOTS',
              value: totalDrivers,
              subtext: 'Rostered commercial pilots',
              icon: <Users className="h-4 w-4 text-cyan-400" />,
              status: 'cyan'
            },
            {
              label: 'ACTIVE ON CORRIDOR',
              value: activeDrivers,
              subtext: `${Math.round((activeDrivers / Math.max(totalDrivers, 1)) * 100)}% active duty readiness`,
              icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
              status: 'success'
            },
            {
              label: 'SARATHI VERIFIED',
              value: verifiedDrivers,
              subtext: `${totalDrivers - verifiedDrivers} pending KYC / RTO check`,
              icon: <ShieldCheck className="h-4 w-4 text-sky-400" />,
              status: 'info'
            },
            {
              label: 'AVG SAFETY RATING',
              value: `${avgSafetyScore}%`,
              subtext: 'Fleet behavior nominal',
              icon: <Award className="h-4 w-4 text-orange-400" />,
              status: 'vibe'
            }
          ]}
        />
      </motion.div>

      {/* 3. Search & Quick Filter Toolbar */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 shadow-xs">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search pilot name, DL number, mobile, assigned truck..."
              className="w-full rounded-lg border border-border bg-canvas px-3 py-1.5 pl-9 text-xs text-text-primary placeholder:text-text-muted transition-colors focus:border-cyan-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border bg-canvas/70 p-1 w-full sm:w-auto">
            {(['All', 'Active', 'On Leave'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 4. REDESIGNED DRIVER ROSTER: MODERN CARD/ROW PRESENTATION (NOT HEAVY MONOLITHIC TABLE) */}
      <motion.div variants={itemVariants}>
        {filteredDrivers.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center">
            <EmptyState
              icon={<Users className="w-8 h-8 text-text-muted" />}
              title="No Pilots Found"
              description="No driver profiles match your active search terms or status filter."
              action={
                <Button variant="secondary" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>
                  Clear Filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredDrivers.map((driver, index) => {
              const safety = driver.safetyScore || 92;
              const isAssigned = driver.assignedVehicle && driver.assignedVehicle !== 'Unassigned';
              const lastActiveMins = 8 + (index * 7) % 45;

              return (
                <div
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:border-cyan-500/50 hover:bg-surface-muted/40 cursor-pointer shadow-xs"
                >
                  {/* Left: Avatar + Identity */}
                  <div className="flex items-center gap-3.5 min-w-64">
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 font-mono text-sm font-black text-cyan-300 shadow-xs">
                        {driver.fullName.charAt(0)}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-surface ${
                          driver.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-text-primary text-sm group-hover:text-cyan-300 transition-colors">
                          {driver.fullName}
                        </h3>
                        <StatusPill status={driver.status === 'Active' ? 'success' : 'neutral'}>
                          {driver.status}
                        </StatusPill>
                      </div>

                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[11px] text-text-muted">
                        <span>ID: {driver.id.slice(0, 8)}</span>
                        <span>•</span>
                        <span className="text-text-secondary">{driver.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column 1: Assigned Asset */}
                  <div className="min-w-44">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      Assigned Commercial Asset
                    </span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-text-muted" />
                      {isAssigned ? (
                        <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300">
                          {driver.assignedVehicle}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-text-muted">Standby Pool</span>
                      )}
                    </div>
                  </div>

                  {/* Middle Column 2: Safety Telematics Score */}
                  <div className="min-w-36">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      Telematics Safety Score
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-surface-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${safety}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-black text-emerald-400">
                        {safety} / 100
                      </span>
                    </div>
                  </div>

                  {/* Middle Column 3: Verification & Last Activity */}
                  <div className="min-w-40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      Sarathi Verification
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={driver.verificationStatus === 'Fully Verified' ? 'success' : 'warning'}>
                        {driver.verificationStatus === 'Fully Verified' ? 'Verified' : 'Pending'}
                      </Badge>
                      <span className="text-[11px] text-text-muted font-mono">
                        {lastActiveMins} min ago
                      </span>
                    </div>
                  </div>

                  {/* Right: Quick Action */}
                  <div className="flex items-center justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                    <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-xs font-bold text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
                      Inspect Dossier <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* 5. Onboard Driver Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard Commercial Pilot"
        description="Verify commercial driving license credentials and register personnel into the active fleet roster."
        size="lg"
      >
        <form onSubmit={handleOnboardDriver} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1 font-medium">Full Legal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar Verma"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-1 font-medium">Contact Mobile Phone *</label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1 font-medium">Commercial DL Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. MH12 20180091234"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-1 font-medium">License Category</label>
              <select
                value={licenseCategory}
                onChange={e => setLicenseCategory(e.target.value as Driver['licenseCategory'])}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-cyan-500 focus:outline-hidden"
              >
                <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                <option value="Trailer">Multi-Axle Trailer Commercial</option>
                <option value="Hazardous Goods">Hazardous & Flammable Cargo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1 font-medium">Highway Experience (Years)</label>
              <input
                type="number"
                min={1}
                max={40}
                value={experienceYears}
                onChange={e => setExperienceYears(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-1 font-medium">Aadhaar Card Number</label>
              <input
                type="text"
                placeholder="12-digit UIDAI Number"
                value={aadhaarNumber}
                onChange={e => setAadhaarNumber(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary focus:border-cyan-500 focus:outline-hidden"
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

      {/* 6. DETAILED SIDE DRAWER (NO NAVIGATION AWAY) */}
      <Drawer
        isOpen={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
        title={`Commercial Pilot Dossier: ${selectedDriver?.fullName || ''}`}
        subtitle={`Sarathi DL: ${selectedDriver?.licenseNumber} • ${selectedDriver?.licenseCategory}`}
      >
        {selectedDriver && (
          <div className="space-y-6 text-sm">
            {/* Header Profile Card */}
            <div className="flex items-center gap-3.5 rounded-xl border border-border bg-surface-muted/30 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 font-mono text-lg font-black text-white shadow-xs">
                {selectedDriver.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-primary text-base">{selectedDriver.fullName}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-text-muted">ID: {selectedDriver.id.slice(0, 10)}</span>
                  <span>•</span>
                  <StatusPill status={selectedDriver.status === 'Active' ? 'success' : 'neutral'}>
                    {selectedDriver.status}
                  </StatusPill>
                </div>
              </div>
            </div>

            {/* License & Commercial Credentials */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Parivahan Sarathi License
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <span className="text-text-muted block text-[11px]">License Number:</span>
                  <span className="font-mono font-bold text-text-primary text-xs">{selectedDriver.licenseNumber}</span>
                </div>
                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <span className="text-text-muted block text-[11px]">License Expiry:</span>
                  <span className="font-mono font-semibold text-text-primary text-xs">{selectedDriver.licenseExpiry || '2029-10-30'}</span>
                </div>
                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <span className="text-text-muted block text-[11px]">Highway Experience:</span>
                  <span className="font-semibold text-text-primary text-xs">{selectedDriver.experienceYears} Years Heavy Haul</span>
                </div>
                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <span className="text-text-muted block text-[11px]">Assigned Commercial Truck:</span>
                  <span className="font-mono font-bold text-cyan-300 text-xs">{selectedDriver.assignedVehicle || 'Standby Pool'}</span>
                </div>
              </div>
            </div>

            {/* Safety Score & Violations */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Telematics Safety & Behavior
              </h4>
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">Safety Rating Score</span>
                  <span className="font-mono text-lg font-black text-emerald-400">
                    {selectedDriver.safetyScore || 92} / 100
                  </span>
                </div>
                <div className="mt-2 h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${selectedDriver.safetyScore || 92}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-surface-muted/40 p-2">
                    <span className="text-text-muted block text-[10px]">Overspeed Alerts</span>
                    <span className="font-mono font-bold text-text-primary">{selectedDriver.safetyEvents?.overspeedCount ?? 0}</span>
                  </div>
                  <div className="rounded bg-surface-muted/40 p-2">
                    <span className="text-text-muted block text-[10px]">Harsh Braking</span>
                    <span className="font-mono font-bold text-text-primary">{selectedDriver.safetyEvents?.harshBrakingCount ?? 0}</span>
                  </div>
                  <div className="rounded bg-surface-muted/40 p-2">
                    <span className="text-text-muted block text-[10px]">Fatigue Events</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedDriver.safetyEvents?.fatigueAlertCount ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Trips Log for this Pilot */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Assigned Recent Trips ({driverTrips.length})
              </h4>
              {driverTrips.length === 0 ? (
                <div className="rounded-lg border border-border/80 bg-surface/60 p-3 text-xs text-text-muted text-center">
                  No previous trip manifests recorded for this driver.
                </div>
              ) : (
                <div className="divide-y divide-border/60 rounded-lg border border-border bg-surface text-xs overflow-hidden">
                  {driverTrips.map(trip => (
                    <div key={trip.id} className="flex items-center justify-between p-2.5 hover:bg-surface-muted/40 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-300">{trip.tripCode}</span>
                          <span className="font-mono text-[11px] text-text-muted">{trip.vehicleReg}</span>
                        </div>
                        <p className="text-[11px] text-text-secondary mt-0.5">
                          {trip.origin.city} → {trip.destination.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusPill status={trip.status === 'In Transit' ? 'info' : trip.status === 'Delivered' ? 'success' : 'neutral'}>
                          {trip.status}
                        </StatusPill>
                        <span className="block font-mono text-[10px] text-text-muted mt-0.5">{trip.scheduledArrival.slice(0, 10)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact & Emergency Protocols */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Contact & Emergency Protocol
              </h4>
              <div className="divide-y divide-border rounded-lg border border-border bg-surface text-xs">
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">Direct Mobile Phone</span>
                  <a href={`tel:${selectedDriver.phone}`} className="font-mono font-bold text-cyan-400 hover:underline">
                    {selectedDriver.phone}
                  </a>
                </div>
                {selectedDriver.emergencyContact && (
                  <>
                    <div className="flex items-center justify-between p-2.5">
                      <span className="text-text-secondary">Emergency Contact Name</span>
                      <span className="font-medium text-text-primary">
                        {selectedDriver.emergencyContact.name} ({selectedDriver.emergencyContact.relation})
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5">
                      <span className="text-text-secondary">Emergency Phone</span>
                      <a href={`tel:${selectedDriver.emergencyContact.phone}`} className="font-mono font-bold text-rose-300 hover:underline">
                        {selectedDriver.emergencyContact.phone}
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedDriver(null)}
              >
                Close Dossier
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </AnimatedPage>
  );
}
