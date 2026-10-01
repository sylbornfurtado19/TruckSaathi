'use client';

import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ShieldCheck,
  Download,
  Trash2,
  Eye,
  Scale,
  Fuel,
  Activity,
  MapPin,
  Clock,
  ArrowRight,
  Wrench
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Vehicle } from '@/types';
import {
  PageHeader,
  Card,
  Panel,
  Button,
  Badge,
  AnimatedPage,
  Modal,
  Drawer,
  EmptyState,
  KpiStrip,
  StatusPill,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  itemVariants
} from '@/components/ui';
import { exportToCSV } from '@/lib/csvExport';

export function VehiclesContent() {
  const { vehicles, addVehicle, deleteVehicle, fuelLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [docFilter, setDocFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [regNumber, setRegNumber] = useState('');
  const [category, setCategory] = useState<Vehicle['category']>('Container');
  const [make, setMake] = useState('Tata Motors');
  const [model, setModel] = useState('');
  const [capacityTons, setCapacityTons] = useState(25);
  const [chassisNumber, setChassisNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [assignedDriver, setAssignedDriver] = useState('Unassigned');

  // Stats calculation
  const totalVehicles = vehicles.length;
  const inServiceVehicles = vehicles.filter(v => v.maintenanceStatus === 'In Service').length;
  const expiringDocs = vehicles.filter(v => v.docStatus === 'Expiring Soon' || v.docStatus === 'Expired').length;
  const totalCapacityTons = vehicles.reduce((sum, v) => sum + (v.capacityTons || 0), 0);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch =
        v.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.assignedDriver && v.assignedDriver.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCat = categoryFilter === 'All' || v.category === categoryFilter;
      const matchesDoc = docFilter === 'All' || v.docStatus === docFilter;
      return matchesSearch && matchesCat && matchesDoc;
    });
  }, [vehicles, searchTerm, categoryFilter, docFilter]);

  // Helper to get fuel level for vehicle
  const getVehicleFuel = (reg: string) => {
    const log = fuelLogs.find(f => f.vehicleReg === reg);
    return log ? log.fuelLevelPercent : 68;
  };

  const handleExportCSV = () => {
    const exportData = filteredVehicles.map(v => ({
      Registration: v.regNumber,
      Category: v.category,
      Make: v.make,
      Model: v.model,
      CapacityTons: v.capacityTons,
      AssignedDriver: v.assignedDriver || 'Unassigned',
      DocumentStatus: v.docStatus,
      MaintenanceStatus: v.maintenanceStatus,
      RCExpiry: v.rcExpiry,
      InsuranceExpiry: v.insuranceExpiry,
      FitnessExpiry: v.fitnessExpiry
    }));
    exportToCSV(exportData, `vehicles_export_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumber || !model) return;

    addVehicle({
      regNumber: regNumber.toUpperCase().trim(),
      category,
      make,
      model,
      capacityTons: Number(capacityTons),
      assignedDriver: assignedDriver.trim() || 'Unassigned',
      docStatus: 'Compliant',
      maintenanceStatus: 'In Service',
      chassisNumber: chassisNumber.toUpperCase().trim() || `MAT-${Math.floor(100000 + Math.random() * 900000)}`,
      engineNumber: engineNumber.toUpperCase().trim() || `ENG-${Math.floor(100000 + Math.random() * 900000)}`,
      rcExpiry: '2028-12-31',
      insuranceExpiry: '2027-06-30',
      fitnessExpiry: '2028-04-15',
      lastKnownLocation: {
        lat: 19.076,
        lng: 72.8777,
        city: 'Mumbai Hub'
      },
      componentHealth: {
        brakes: 90,
        battery: 95,
        engine: 92,
        tyres: 88,
        lastServiceDate: '2026-06-15',
        predictedNextServiceDate: '2026-12-15'
      }
    });

    setIsModalOpen(false);
    setRegNumber('');
    setModel('');
    setCapacityTons(25);
    setChassisNumber('');
    setEngineNumber('');
    setAssignedDriver('Unassigned');
  };

  return (
    <AnimatedPage>
      {/* 1. Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-cyan-300">
              <Truck className="w-3.5 h-3.5" />
              FLEET INVENTORY
            </span>
          }
          title="Commercial Transport Asset Registry"
          description="Live telematics state, Parivahan document compliance, payload metrics, and OBD-II health diagnostics."
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
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Register Asset
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 2. Refined KPI Strip */}
      <motion.div variants={itemVariants}>
        <KpiStrip
          items={[
            {
              label: 'REGISTERED ASSETS',
              value: totalVehicles,
              subtext: 'GPS-monitored commercial units',
              icon: <Truck className="h-4 w-4 text-cyan-400" />,
              status: 'cyan'
            },
            {
              label: 'IN-SERVICE READINESS',
              value: inServiceVehicles,
              subtext: `${Math.round((inServiceVehicles / Math.max(totalVehicles, 1)) * 100)}% active duty readiness`,
              icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
              status: 'success'
            },
            {
              label: 'FLEET PAYLOAD CAPACITY',
              value: `${totalCapacityTons} T`,
              subtext: 'Aggregate hauling capacity',
              icon: <Scale className="h-4 w-4 text-sky-400" />,
              status: 'info'
            },
            {
              label: 'COMPLIANCE AUDIT ALERTS',
              value: expiringDocs,
              subtext: expiringDocs > 0 ? `${expiringDocs} renewals required` : 'All documents compliant',
              icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
              status: expiringDocs > 0 ? 'warning' : 'success'
            }
          ]}
        />
      </motion.div>

      {/* 3. Filter & Search Toolbar */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between rounded-xl border border-border bg-surface p-3 shadow-xs">
          <div className="w-full md:w-96 relative">
            <Search className="h-3.5 w-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search registration, make, model, driver..."
              className="w-full rounded-lg border border-border bg-canvas px-3 py-1.5 pl-9 text-xs text-text-primary placeholder:text-text-muted transition-colors focus:border-cyan-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Filter:</span>
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-border bg-canvas px-2.5 py-1 text-xs text-text-primary focus:border-cyan-500 focus:outline-hidden"
            >
              <option value="All">All Categories</option>
              <option value="Container">Container</option>
              <option value="Trailer">Trailer</option>
              <option value="Open Body">Open Body</option>
              <option value="Refrigerated">Refrigerated</option>
              <option value="Tanker">Tanker</option>
              <option value="Tipper">Tipper</option>
            </select>

            <select
              value={docFilter}
              onChange={e => setDocFilter(e.target.value)}
              className="rounded-lg border border-border bg-canvas px-2.5 py-1 text-xs text-text-primary focus:border-cyan-500 focus:outline-hidden"
            >
              <option value="All">All Compliance States</option>
              <option value="Compliant">Compliant</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* 4. MODERN TABLE / LIST HYBRID:
             DESKTOP: Modern Table
             SMALLER SCREENS: Stacked Vehicle Command Cards
      */}
      <motion.div variants={itemVariants}>
        {filteredVehicles.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-12 text-center">
            <EmptyState
              icon={<Truck className="w-8 h-8 text-text-muted" />}
              title="No Commercial Vehicles Found"
              description="No vehicles match your active search terms or category filters."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('All');
                    setDocFilter('All');
                  }}
                >
                  Clear All Filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW: CLEAN STREAMLINED TABLE */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-surface shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono">Registration</TableHead>
                    <TableHead>Type & Specs</TableHead>
                    <TableHead>Assigned Driver</TableHead>
                    <TableHead>Current Location</TableHead>
                    <TableHead>Operating Status</TableHead>
                    <TableHead>Fuel Level</TableHead>
                    <TableHead>Component Health</TableHead>
                    <TableHead>Last Telemetry</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle, index) => {
                    const fuel = getVehicleFuel(vehicle.regNumber);
                    const health = vehicle.componentHealth?.engine || 92;
                    const minsAgo = 3 + (index * 4) % 30;

                    return (
                      <TableRow
                        key={vehicle.id}
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="cursor-pointer hover:bg-surface-muted/50"
                      >
                        <TableCell className="font-mono font-bold text-text-primary text-xs">
                          <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-cyan-300">
                            {vehicle.regNumber}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="neutral">{vehicle.category}</Badge>
                            <span className="text-xs text-text-secondary truncate max-w-36">
                              {vehicle.make}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs font-medium text-text-primary">
                            {vehicle.assignedDriver || 'Standby Pool'}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs text-text-secondary flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-text-muted" />
                            {vehicle.lastKnownLocation?.city || 'Transit Corridor'}
                          </span>
                        </TableCell>

                        <TableCell>
                          <StatusPill
                            status={
                              vehicle.maintenanceStatus === 'In Service'
                                ? 'success'
                                : vehicle.maintenanceStatus === 'Scheduled Service'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {vehicle.maintenanceStatus}
                          </StatusPill>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2 min-w-24">
                            <div className="h-1.5 w-14 bg-surface-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${fuel < 25 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                                style={{ width: `${fuel}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs text-text-secondary">{fuel}%</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              {health}%
                            </span>
                            <span className="text-[10px] text-text-muted">Nominal</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono text-xs text-text-muted">
                            {minsAgo}m ago
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={e => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="w-3.5 h-3.5 text-text-muted hover:text-cyan-400" />}
                              onClick={() => setSelectedVehicle(vehicle)}
                              title="Inspect Asset"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-rose-400" />}
                              onClick={() => deleteVehicle(vehicle.id)}
                              title="Delete Asset"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE & TABLET VIEW: RESPONSIVE STACKED CARDS */}
            <div className="block md:hidden space-y-3">
              {filteredVehicles.map((vehicle, index) => {
                const fuel = getVehicleFuel(vehicle.regNumber);
                const health = vehicle.componentHealth?.engine || 92;
                const minsAgo = 3 + (index * 4) % 30;

                return (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="rounded-xl border border-border bg-surface p-4 space-y-3 hover:border-cyan-500/50 cursor-pointer transition-colors shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-cyan-300">
                        {vehicle.regNumber}
                      </span>
                      <StatusPill
                        status={
                          vehicle.maintenanceStatus === 'In Service'
                            ? 'success'
                            : vehicle.maintenanceStatus === 'Scheduled Service'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {vehicle.maintenanceStatus}
                      </StatusPill>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Badge variant="neutral">{vehicle.category}</Badge>
                      <span>{vehicle.make} {vehicle.model}</span>
                      <span>•</span>
                      <span>{vehicle.capacityTons} T</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-y border-border/60 py-2.5">
                      <div>
                        <span className="text-[10px] text-text-muted uppercase block">Pilot</span>
                        <span className="font-medium text-text-primary truncate block">
                          {vehicle.assignedDriver || 'Standby Pool'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted uppercase block">Sector</span>
                        <span className="text-text-secondary truncate block">
                          {vehicle.lastKnownLocation?.city || 'Transit Corridor'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-text-muted">Fuel: <strong className="text-text-primary">{fuel}%</strong></span>
                        <span className="font-mono text-text-muted">Health: <strong className="text-emerald-400">{health}%</strong></span>
                      </div>
                      <span className="font-mono text-[11px] text-text-muted">{minsAgo}m ago</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </motion.div>

      {/* 5. Register Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Commercial Asset"
        description="Add a new commercial transport asset to your fleet registry and document compliance vault."
        size="lg"
      >
        <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1 font-medium">Registration Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. MH-12-RN-8812"
                value={regNumber}
                onChange={e => setRegNumber(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-1 font-medium">Vehicle Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Vehicle['category'])}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-cyan-500 focus:outline-hidden"
              >
                <option value="Container">Container</option>
                <option value="Trailer">Trailer</option>
                <option value="Open Body">Open Body</option>
                <option value="Refrigerated">Refrigerated</option>
                <option value="Tanker">Tanker</option>
                <option value="Tipper">Tipper</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1 font-medium">Commercial Manufacturer</label>
              <select
                value={make}
                onChange={e => setMake(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-cyan-500 focus:outline-hidden"
              >
                <option value="Tata Motors">Tata Motors</option>
                <option value="Ashok Leyland">Ashok Leyland</option>
                <option value="Eicher">Eicher</option>
                <option value="BharatBenz">BharatBenz</option>
                <option value="Mahindra">Mahindra</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary mb-1 font-medium">Model Specification *</label>
              <input
                type="text"
                required
                placeholder="e.g. Signa 4825.T Heavy Axle"
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary mb-1 font-medium">Payload Capacity (Metric Tons)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={capacityTons}
                onChange={e => setCapacityTons(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-1 font-medium">Assigned Commercial Pilot</label>
              <input
                type="text"
                value={assignedDriver}
                onChange={e => setAssignedDriver(e.target.value)}
                placeholder="Pilot name or Standby"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Commercial Asset
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Comprehensive Asset Drawer */}
      <Drawer
        isOpen={Boolean(selectedVehicle)}
        onClose={() => setSelectedVehicle(null)}
        title={`Asset Dossier: ${selectedVehicle?.regNumber || ''}`}
        subtitle={`${selectedVehicle?.make} ${selectedVehicle?.model} • ${selectedVehicle?.category}`}
      >
        {selectedVehicle && (
          <div className="space-y-6 text-sm">
            {/* Status Strip */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/30 p-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-text-muted block">
                  Operating State
                </span>
                <StatusPill
                  status={
                    selectedVehicle.maintenanceStatus === 'In Service'
                      ? 'success'
                      : selectedVehicle.maintenanceStatus === 'Scheduled Service'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {selectedVehicle.maintenanceStatus}
                </StatusPill>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase text-text-muted block">
                  Sector Hub
                </span>
                <span className="font-semibold text-text-primary text-xs">
                  {selectedVehicle.lastKnownLocation?.city || 'Transit Corridor'}
                </span>
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Technical Specifications
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <span className="text-text-muted block text-[11px]">Chassis Number:</span>
                  <span className="font-mono font-bold text-text-primary text-xs">{selectedVehicle.chassisNumber}</span>
                </div>
                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <span className="text-text-muted block text-[11px]">Engine Number:</span>
                  <span className="font-mono font-semibold text-text-primary text-xs">{selectedVehicle.engineNumber}</span>
                </div>
                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <span className="text-text-muted block text-[11px]">Payload Capacity:</span>
                  <span className="font-mono font-bold text-text-primary text-xs">{selectedVehicle.capacityTons} Metric Tons</span>
                </div>
                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <span className="text-text-muted block text-[11px]">Assigned Pilot:</span>
                  <span className="font-semibold text-cyan-300 text-xs">{selectedVehicle.assignedDriver || 'Standby Pool'}</span>
                </div>
              </div>
            </div>

            {/* Component Diagnostics */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                OBD-II Telematics & Component Health
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <div className="flex justify-between text-text-secondary mb-1">
                    <span>Engine Block:</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedVehicle.componentHealth?.engine || 94}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedVehicle.componentHealth?.engine || 94}%` }} />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <div className="flex justify-between text-text-secondary mb-1">
                    <span>Air Brakes:</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedVehicle.componentHealth?.brakes || 88}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedVehicle.componentHealth?.brakes || 88}%` }} />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <div className="flex justify-between text-text-secondary mb-1">
                    <span>Tyres & TPMS:</span>
                    <span className="font-mono font-bold text-cyan-400">{selectedVehicle.componentHealth?.tyres || 82}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${selectedVehicle.componentHealth?.tyres || 82}%` }} />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-2.5">
                  <div className="flex justify-between text-text-secondary mb-1">
                    <span>24V Alternator:</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedVehicle.componentHealth?.battery || 95}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedVehicle.componentHealth?.battery || 95}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Parivahan Document Compliance */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Parivahan Document Vault
              </h4>
              <div className="divide-y divide-border rounded-lg border border-border bg-surface text-xs">
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">Vehicle RC Expiry</span>
                  <span className="font-mono font-semibold text-text-primary">{selectedVehicle.rcExpiry}</span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">Insurance Policy Expiry</span>
                  <span className="font-mono font-semibold text-text-primary">{selectedVehicle.insuranceExpiry}</span>
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <span className="text-text-secondary">Fitness Certificate Expiry</span>
                  <span className="font-mono font-semibold text-text-primary">{selectedVehicle.fitnessExpiry}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setSelectedVehicle(null)}
              >
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </AnimatedPage>
  );
}
