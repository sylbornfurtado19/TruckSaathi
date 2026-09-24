'use client';

import React, { useState } from 'react';
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
  Scale
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Vehicle } from '@/types';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  AnimatedPage,
  Modal,
  Drawer,
  EmptyState,
  KPICard,
  itemVariants
} from '@/components/ui';
import { exportToCSV } from '@/lib/csvExport';

export function VehiclesContent() {
  const { vehicles, addVehicle, deleteVehicle } = useApp();

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

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch =
      v.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || v.category === categoryFilter;
    const matchesDoc = docFilter === 'All' || v.docStatus === docFilter;
    return matchesSearch && matchesCat && matchesDoc;
  });

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
      chassisNumber: chassisNumber.trim() || 'MAT' + Math.floor(Math.random() * 10000000),
      engineNumber: engineNumber.trim() || 'ENG' + Math.floor(Math.random() * 10000000),
      rcExpiry: '2028-12-31',
      insuranceExpiry: '2027-10-15',
      fitnessExpiry: '2027-08-20'
    });

    setIsModalOpen(false);
    setRegNumber('');
    setModel('');
    setChassisNumber('');
    setEngineNumber('');
    setAssignedDriver('Unassigned');
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-secondary">
              <Truck className="w-3.5 h-3.5" />
              Fleet Registry
            </span>
          }
          title="Vehicle Asset Registry"
          description="Commercial fleet asset database, payload specifications, maintenance status, and government compliance vault."
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

      {/* 2. Quick Fleet Stats Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Registered Commercial Assets"
          value={totalVehicles}
          subtext="Total GPS-monitored fleet"
          icon={<Truck className="w-4 h-4 text-blue-400" />}
          iconBg="bg-blue-600/15 border border-blue-500/30 text-blue-400"
        />
        <KPICard
          title="In-Service Units"
          value={inServiceVehicles}
          subtext={`${Math.round((inServiceVehicles / (totalVehicles || 1)) * 100)}% active duty readiness`}
          trend={{ value: `${inServiceVehicles} ready`, isPositive: true }}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          iconBg="bg-emerald-600/15 border border-emerald-500/30 text-emerald-400"
        />
        <KPICard
          title="Total Payload Capacity"
          value={`${totalCapacityTons} T`}
          subtext="Aggregate fleet cargo capacity"
          icon={<Scale className="w-4 h-4 text-cyan-400" />}
          iconBg="bg-cyan-600/15 border border-cyan-500/30 text-cyan-400"
        />
        <KPICard
          title="Compliance & Audit Alerts"
          value={expiringDocs}
          subtext="RC, Insurance or Fitness renewals"
          trend={expiringDocs > 0 ? { value: `${expiringDocs} action items`, isPositive: false } : { value: "Fully compliant", isPositive: true }}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          iconBg="bg-amber-600/15 border border-amber-500/30 text-amber-400"
        />
      </motion.div>

      {/* 3. Filter & Search Toolbar */}
      <motion.div variants={itemVariants}>
        <Card className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search registration, make, model, driver..."
              className="w-full rounded-control border border-border bg-surface px-3 py-2 pl-9 text-sm text-text-primary placeholder:text-text-muted"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <span>Filters:</span>
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
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
              className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            >
              <option value="All">All Compliance States</option>
              <option value="Compliant">Compliant</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* 4. Enterprise Data Table */}
      <motion.div variants={itemVariants} className="overflow-hidden rounded-card border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="sticky top-0 border-b border-border bg-surface-muted text-xs font-semibold text-text-secondary">
                <th className="py-3.5 px-4 font-mono">Registration Plate</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Make & Model</th>
                <th className="py-3.5 px-4 font-mono">Capacity</th>
                <th className="py-3.5 px-4">Assigned Driver</th>
                <th className="py-3.5 px-4">Document Status</th>
                <th className="py-3.5 px-4">Maintenance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-primary">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12">
                    <EmptyState
                      icon={<Truck className="w-8 h-8 text-slate-500" />}
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
                  </td>
                </tr>
              ) : (
                filteredVehicles.map(vehicle => (
                  <tr
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="cursor-pointer transition-colors hover:bg-surface-muted group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="rounded-control border border-border bg-surface-muted px-2.5 py-1 font-mono text-xs text-focus transition-colors">
                          {vehicle.regNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      <Badge variant="neutral">{vehicle.category}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="font-semibold text-slate-100">{vehicle.make}</div>
                      <div className="text-xs text-text-secondary">{vehicle.model}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <span className="font-bold text-slate-100">{vehicle.capacityTons}</span> Tons
                    </td>
                    <td className="py-3.5 px-4">
                      {vehicle.assignedDriver === 'Unassigned' || !vehicle.assignedDriver ? (
                        <Badge variant="neutral">Unassigned</Badge>
                      ) : (
                        <span className="text-slate-200 font-medium flex items-center gap-1.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-brand-navy">
                            {vehicle.assignedDriver.charAt(0)}
                          </span>
                          {vehicle.assignedDriver}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {vehicle.docStatus === 'Compliant' && (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3" /> Compliant
                        </Badge>
                      )}
                      {vehicle.docStatus === 'Expiring Soon' && (
                        <Badge variant="warning">
                          <AlertTriangle className="w-3 h-3" /> Expiring Soon
                        </Badge>
                      )}
                      {vehicle.docStatus === 'Expired' && (
                        <Badge variant="danger">
                          <XCircle className="w-3 h-3" /> Expired
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {vehicle.maintenanceStatus === 'In Service' ? (
                        <span className="inline-flex items-center gap-1.5 text-green-700 font-medium text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          In Service
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {vehicle.maintenanceStatus}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />}
                          onClick={() => setSelectedVehicle(vehicle)}
                          title="View Profile"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-400" />}
                          onClick={() => deleteVehicle(vehicle.id)}
                          title="Delete Vehicle"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              <label className="block text-slate-300 mb-1 font-medium">Registration Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. MH-12-RN-8812"
                value={regNumber}
                onChange={e => setRegNumber(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Vehicle Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Vehicle['category'])}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
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
              <label className="block text-slate-300 mb-1 font-medium">Commercial Manufacturer</label>
              <select
                value={make}
                onChange={e => setMake(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              >
                <option value="Tata Motors">Tata Motors</option>
                <option value="Ashok Leyland">Ashok Leyland</option>
                <option value="Eicher">Eicher</option>
                <option value="BharatBenz">BharatBenz</option>
                <option value="Mahindra">Mahindra</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Model Specification *</label>
              <input
                type="text"
                required
                placeholder="e.g. Signa 4825.T Heavy Axle"
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Payload Capacity (Metric Tons)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={capacityTons}
                onChange={e => setCapacityTons(Number(e.target.value))}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Assigned Driver</label>
              <input
                type="text"
                value={assignedDriver}
                onChange={e => setAssignedDriver(e.target.value)}
                placeholder="Unassigned or Driver Name"
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Chassis VIN Number</label>
              <input
                type="text"
                value={chassisNumber}
                onChange={e => setChassisNumber(e.target.value)}
                placeholder="Auto-generated if empty"
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Engine Serial Number</label>
              <input
                type="text"
                value={engineNumber}
                onChange={e => setEngineNumber(e.target.value)}
                placeholder="Auto-generated if empty"
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
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

      {/* 6. Vehicle Detail Modal */}
      {selectedVehicle && (
        <Drawer
          isOpen={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          title={`Asset Dossier: ${selectedVehicle.regNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between rounded-control border border-border bg-surface-muted p-4">
              <div>
                <span className="text-xs text-text-secondary font-mono">Payload capacity</span>
                <div className="text-xl font-bold font-mono text-slate-100">{selectedVehicle.capacityTons} Metric Tons</div>
              </div>
              <div>
                <span className="text-xs text-text-secondary font-mono">Assigned driver</span>
                <div className="text-sm font-semibold text-blue-400">{selectedVehicle.assignedDriver || 'Unassigned'}</div>
              </div>
              <div>
                <span className="text-xs text-text-secondary font-mono">Operational state</span>
                <div className="mt-0.5">
                  <Badge variant={selectedVehicle.maintenanceStatus === 'In Service' ? 'success' : 'warning'}>
                    {selectedVehicle.maintenanceStatus}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-control border border-border bg-surface-muted p-3">
                <div className="text-text-secondary text-xs font-medium">Chassis VIN number</div>
                <div className="font-mono text-slate-100 font-bold mt-0.5">{selectedVehicle.chassisNumber || 'MAT78291032'}</div>
              </div>
              <div className="rounded-control border border-border bg-surface-muted p-3">
                <div className="text-text-secondary text-xs font-medium">Engine serial number</div>
                <div className="font-mono text-slate-100 font-bold mt-0.5">{selectedVehicle.engineNumber || 'ENG99420188'}</div>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-2">
              <div className="font-semibold text-text-secondary">Government compliance</div>
              
              <div className="flex items-center justify-between rounded-control border border-border bg-surface-muted p-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-slate-200 font-medium">Registration Certificate (RC)</div>
                    <div className="text-xs text-text-muted font-mono">Vahan National Portal ID</div>
                  </div>
                </div>
                <span className="rounded-control border border-border bg-surface px-2 py-1 font-mono text-xs text-text-secondary">
                  Valid to {selectedVehicle.rcExpiry}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-control border border-border bg-surface-muted p-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-slate-200 font-medium">Comprehensive Commercial Insurance</div>
                    <div className="text-xs text-text-muted font-mono">Third-Party and cargo coverage</div>
                  </div>
                </div>
                <span className="rounded-control border border-border bg-surface px-2 py-1 font-mono text-xs text-text-secondary">
                  Valid to {selectedVehicle.insuranceExpiry}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-control border border-border bg-surface-muted p-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-slate-200 font-medium">RTO Fitness Certificate (FC)</div>
                    <div className="text-xs text-text-muted font-mono">Mandatory annual inspection</div>
                  </div>
                </div>
                <span className="rounded-control border border-border bg-surface px-2 py-1 font-mono text-xs text-text-secondary">
                  Valid to {selectedVehicle.fitnessExpiry}
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-border pt-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedVehicle(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Drawer>
      )}
    </AnimatedPage>
  );
}
