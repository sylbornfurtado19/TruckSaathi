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
  X,
  FileText,
  ShieldCheck,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Vehicle } from '@/types';
import { PageHeader, Card, Button, Badge, AnimatedPage, itemVariants } from '@/components/ui';
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
      regNumber: regNumber.toUpperCase(),
      category,
      make,
      model,
      capacityTons: Number(capacityTons),
      assignedDriver,
      docStatus: 'Compliant',
      maintenanceStatus: 'In Service',
      chassisNumber: chassisNumber || 'MAT' + Math.floor(Math.random() * 10000000),
      engineNumber: engineNumber || 'ENG' + Math.floor(Math.random() * 10000000),
      rcExpiry: '2028-12-31',
      insuranceExpiry: '2027-10-15',
      fitnessExpiry: '2027-08-20'
    });

    setIsModalOpen(false);
    setRegNumber('');
    setModel('');
  };

  return (
    <AnimatedPage>
      {/* Title & Action Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Vehicle Asset Registry"
          description="Commercial vehicle database, payload specs, and document compliance vault."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                icon={<Download className="w-4 h-4" />}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Register Vehicle
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* Filter & Search Bar */}
      <motion.div variants={itemVariants}>
        <Card glow="blue" className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search plate number, make, model..."
              className="w-full bg-[#1c2333]/80 border border-[#2e374a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none rounded-lg text-xs text-slate-200 placeholder:text-slate-500 pl-9 pr-3 py-2 transition-all backdrop-blur-md"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Category:</span>
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-[#1c2333]/80 border border-[#2e374a] rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80"
            >
              <option value="All">All Categories</option>
              <option value="Container">Container</option>
              <option value="Trailer">Trailer</option>
              <option value="Open Body">Open Body</option>
              <option value="Refrigerated">Refrigerated</option>
              <option value="Tanker">Tanker</option>
            </select>

            <select
              value={docFilter}
              onChange={e => setDocFilter(e.target.value)}
              className="bg-[#1c2333]/80 border border-[#2e374a] rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80"
            >
              <option value="All">All Document Statuses</option>
              <option value="Compliant">Compliant</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Styled Data Table */}
      <motion.div variants={itemVariants} className="glass-panel rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1c2333]/80 backdrop-blur-md text-slate-400 border-b border-[#202736] font-semibold uppercase tracking-wider sticky top-0 z-10">
                <th className="py-3.5 px-4">Registration Plate</th>
                <th className="py-3.5 px-4">Category & Type</th>
                <th className="py-3.5 px-4">Make / Model</th>
                <th className="py-3.5 px-4">Capacity</th>
                <th className="py-3.5 px-4">Assigned Driver</th>
                <th className="py-3.5 px-4">Document Status</th>
                <th className="py-3.5 px-4">Maintenance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736]/60 text-slate-200">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No vehicles found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map(vehicle => (
                  <tr
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="hover:bg-[#1c2333]/50 transition-colors cursor-pointer group relative border-l-2 border-transparent hover:border-blue-500"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-100 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="bg-[#1c2333] border border-[#2e374a] px-2 py-1 rounded text-xs">
                        {vehicle.regNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{vehicle.category}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {vehicle.make} {vehicle.model}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{vehicle.capacityTons} Tons</td>
                    <td className="py-3.5 px-4">
                      {vehicle.assignedDriver === 'Unassigned' ? (
                        <Badge variant="neutral">Unassigned</Badge>
                      ) : (
                        <span className="text-slate-200 font-medium">{vehicle.assignedDriver}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {vehicle.docStatus === 'Compliant' && (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3" /> Compliant
                        </Badge>
                      )}
                      {vehicle.docStatus === 'Expiring Soon' && (
                        <Badge variant="warning" pulse>
                          <AlertTriangle className="w-3 h-3" /> Expiring Soon
                        </Badge>
                      )}
                      {vehicle.docStatus === 'Expired' && (
                        <Badge variant="danger" pulse>
                          <XCircle className="w-3 h-3" /> Expired
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-400">{vehicle.maintenanceStatus}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          deleteVehicle(vehicle.id);
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Register Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-[#202736] rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#202736] pb-4">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-lg">
                <Truck className="w-5 h-5 text-blue-400" />
                <span>Register Commercial Asset</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Registration Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-12-AB-1234"
                    value={regNumber}
                    onChange={e => setRegNumber(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 uppercase focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Manufacturer</label>
                  <select
                    value={make}
                    onChange={e => setMake(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
                  >
                    <option value="Tata Motors">Tata Motors</option>
                    <option value="Ashok Leyland">Ashok Leyland</option>
                    <option value="Eicher">Eicher</option>
                    <option value="BharatBenz">BharatBenz</option>
                    <option value="Mahindra">Mahindra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Signa 4825.T"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Capacity (Tons)</label>
                  <input
                    type="number"
                    value={capacityTons}
                    onChange={e => setCapacityTons(Number(e.target.value))}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Assigned Driver</label>
                  <input
                    type="text"
                    value={assignedDriver}
                    onChange={e => setAssignedDriver(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#202736] flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Vehicle Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedVehicle && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md glass-panel border-l border-[#202736] shadow-2xl p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between border-b border-[#202736] pb-4">
            <div>
              <span className="text-xs text-blue-400 font-mono font-bold">ASSET PROFILE</span>
              <h2 className="text-xl font-extrabold font-mono text-slate-50">{selectedVehicle.regNumber}</h2>
            </div>
            <button onClick={() => setSelectedVehicle(null)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <Card glow="blue" className="space-y-2">
              <div className="text-slate-400 font-medium">Specs Summary</div>
              <div className="grid grid-cols-2 gap-2 text-slate-200">
                <div>
                  Make: <span className="font-semibold">{selectedVehicle.make}</span>
                </div>
                <div>
                  Model: <span className="font-semibold">{selectedVehicle.model}</span>
                </div>
                <div>
                  Capacity: <span className="font-semibold font-mono">{selectedVehicle.capacityTons} Tons</span>
                </div>
                <div>
                  Type: <span className="font-semibold">{selectedVehicle.category}</span>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <div className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Document Vault</div>
              <div className="p-3 rounded-lg bg-[#1c2333]/50 border border-[#202736] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Registration Certificate (RC)</span>
                </div>
                <span className="text-slate-400 font-mono">{selectedVehicle.rcExpiry}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#1c2333]/50 border border-[#202736] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Insurance Policy</span>
                </div>
                <span className="text-slate-400 font-mono">{selectedVehicle.insuranceExpiry}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
