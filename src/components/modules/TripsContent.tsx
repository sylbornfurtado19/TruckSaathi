'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Route,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  X,
  FileText,
  Truck,
  User,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  CreditCard
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Trip } from '@/types';
import { PageHeader, Card, Button, Badge, AnimatedPage, KPICard, itemVariants } from '@/components/ui';

export function TripsContent() {
  const { trips, vehicles, drivers, addTrip, updateTrip } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // New Trip Form State
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [destCity, setDestCity] = useState('');
  const [destAddress, setDestAddress] = useState('');
  const [cargoDesc, setCargoDesc] = useState('');
  const [cargoWeight, setCargoWeight] = useState(20);
  const [scheduledDeparture, setScheduledDeparture] = useState('');
  const [scheduledArrival, setScheduledArrival] = useState('');
  const [distanceKm, setDistanceKm] = useState(300);
  const [ewayBill, setEwayBill] = useState('');

  // POD Notes State for Detail Drawer
  const [podNotes, setPodNotes] = useState('');

  // Active vehicles/drivers logic for New Trip dropdowns (not currently on an active trip)
  const activeTripVehicleIds = new Set(
    trips.filter(t => t.status === 'In Transit' || t.status === 'Delayed' || t.status === 'Scheduled').map(t => t.vehicleId)
  );
  const activeTripDriverIds = new Set(
    trips.filter(t => t.status === 'In Transit' || t.status === 'Delayed' || t.status === 'Scheduled').map(t => t.driverId)
  );

  const availableVehicles = vehicles.filter(v => v.maintenanceStatus === 'In Service' && !activeTripVehicleIds.has(v.id));
  const availableDrivers = drivers.filter(d => d.status === 'Active' && !activeTripDriverIds.has(d.id));

  // Helper for E-Way Bill expiry status (Compliant / Expiring Soon / Expired)
  const getEwayBillStatus = (expiryDateStr?: string) => {
    if (!expiryDateStr) return { label: 'No E-Way Bill', variant: 'neutral' as const };
    const expiry = new Date(expiryDateStr).getTime();
    const now = new Date('2026-08-06').getTime();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Expired', variant: 'danger' as const };
    if (diffDays <= 2) return { label: 'Expiring Soon', variant: 'warning' as const };
    return { label: 'Compliant', variant: 'success' as const };
  };

  // KPIs
  const activeTripsCount = trips.filter(t => t.status === 'In Transit').length;
  const delayedTripsCount = trips.filter(t => t.status === 'Delayed').length;
  const deliveredTodayCount = trips.filter(t => t.status === 'Delivered').length;
  const totalTollSpendINR = trips.reduce((acc, t) => acc + (t.tollSpendINR || 0), 0);

  const selectedVehicleObj = vehicles.find(v => v.id === vehicleId);
  const isOverloaded = selectedVehicleObj && cargoWeight > selectedVehicleObj.capacityTons;

  const filteredTrips = trips.filter(t => {
    const matchesSearch =
      t.tripCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.vehicleReg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.origin.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const selVehicle = vehicles.find(v => v.id === vehicleId);
    const selDriver = drivers.find(d => d.id === driverId);

    if (!selVehicle || !selDriver || !originCity || !destCity) return;

    const tripCode = `TRP-2026-0${Math.floor(1000 + Math.random() * 9000)}`;

    addTrip({
      tripCode,
      vehicleId: selVehicle.id,
      vehicleReg: selVehicle.regNumber,
      driverId: selDriver.id,
      driverName: selDriver.fullName,
      origin: { city: originCity, address: originAddress || `${originCity} Central Yard`, lat: 19.076, lng: 72.8777 },
      destination: { city: destCity, address: destAddress || `${destCity} Industrial Freight Hub`, lat: 18.5204, lng: 73.8567 },
      cargoDescription: cargoDesc || 'General Cargo Payload',
      cargoWeightTons: Number(cargoWeight),
      status: 'Scheduled',
      scheduledDeparture: scheduledDeparture || new Date().toISOString().slice(0, 16).replace('T', ' '),
      scheduledArrival: scheduledArrival || new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
      distanceKm: Number(distanceKm),
      ewayBillNumber: ewayBill || `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      ewayBillExpiry: new Date(Date.now() + 172800000).toISOString().slice(0, 10) + ' 23:59',
      podReceived: false
    });

    setIsModalOpen(false);
    setVehicleId('');
    setDriverId('');
    setOriginCity('');
    setDestCity('');
  };

  const handleMarkDelivered = (tripId: string) => {
    updateTrip(tripId, {
      status: 'Delivered',
      actualArrival: new Date().toISOString().slice(0, 16).replace('T', ' '),
      podReceived: true,
      podNotes: podNotes || 'POD physically verified and signed by consignee.'
    });
    if (selectedTrip) {
      setSelectedTrip({
        ...selectedTrip,
        status: 'Delivered',
        actualArrival: new Date().toISOString().slice(0, 16).replace('T', ' '),
        podReceived: true,
        podNotes: podNotes || 'POD physically verified and signed by consignee.'
      });
    }
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Trip & Dispatch Management"
          description="Operational job assignments, route tracking, cargo manifests, and POD verification."
          actions={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Dispatch New Trip
            </Button>
          }
        />
      </motion.div>

      {/* 2. KPI Cards Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active In Transit"
          value={activeTripsCount}
          subtext="On-route commercial movements"
          icon={<Route className="w-4 h-4" />}
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/30"
          glow="blue"
        />
        <KPICard
          title="Delayed Freight"
          value={delayedTripsCount}
          subtext="Requires dispatcher intervention"
          icon={<AlertTriangle className="w-4 h-4" />}
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/30"
          glow="amber"
        />
        <KPICard
          title="Delivered Trips"
          value={deliveredTodayCount}
          subtext="Completed movements"
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          glow="emerald"
        />
        <KPICard
          title="FASTag Toll Spend"
          value={totalTollSpendINR}
          subtext="Total FASTag highway tolls (₹)"
          icon={<CreditCard className="w-4 h-4" />}
          iconBg="bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
          glow="blue"
        />
      </motion.div>

      {/* 3. Filter Bar */}
      <motion.div variants={itemVariants}>
        <Card glow="blue" className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search trip code, plate, driver, origin/dest..."
              className="w-full bg-[#1c2333]/80 border border-[#2e374a] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none rounded-lg text-xs text-slate-200 placeholder:text-slate-500 pl-9 pr-3 py-2 transition-all backdrop-blur-md"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#1c2333]/80 border border-[#2e374a] rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80"
            >
              <option value="All">All Trip Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Transit">In Transit</option>
              <option value="Delayed">Delayed</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* 4. Trips Data Table */}
      <motion.div variants={itemVariants} className="glass-panel rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1c2333]/80 backdrop-blur-md text-slate-400 border-b border-[#202736] font-semibold uppercase tracking-wider sticky top-0 z-10">
                <th className="py-3.5 px-4">Trip Code</th>
                <th className="py-3.5 px-4">Assigned Vehicle</th>
                <th className="py-3.5 px-4">Assigned Driver</th>
                <th className="py-3.5 px-4">Route Path</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">E-Way Bill Status</th>
                <th className="py-3.5 px-4">Distance / Toll</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202736]/60 text-slate-200">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No trip dispatches found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredTrips.map(trip => {
                  const ewayStatus = getEwayBillStatus(trip.ewayBillExpiry);
                  return (
                    <tr
                      key={trip.id}
                      onClick={() => {
                        setSelectedTrip(trip);
                        setPodNotes(trip.podNotes || '');
                      }}
                      className="hover:bg-[#1c2333]/50 transition-colors cursor-pointer group relative border-l-2 border-transparent hover:border-blue-500"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100 flex items-center gap-2">
                        <span className="bg-[#1c2333] border border-[#2e374a] px-2 py-1 rounded text-xs text-blue-400">
                          {trip.tripCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200 font-semibold">{trip.vehicleReg}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">{trip.driverName}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          <span className="text-blue-400">{trip.origin.city}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-emerald-400">{trip.destination.city}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {trip.status === 'In Transit' && (
                          <Badge variant="info">
                            <Route className="w-3 h-3" /> In Transit
                          </Badge>
                        )}
                        {trip.status === 'Scheduled' && (
                          <Badge variant="neutral">
                            <Clock className="w-3 h-3" /> Scheduled
                          </Badge>
                        )}
                        {trip.status === 'Delayed' && (
                          <Badge variant="warning" pulse>
                            <AlertTriangle className="w-3 h-3" /> Delayed
                          </Badge>
                        )}
                        {trip.status === 'Delivered' && (
                          <Badge variant="success">
                            <CheckCircle2 className="w-3 h-3" /> Delivered
                          </Badge>
                        )}
                        {trip.status === 'Cancelled' && <Badge variant="danger">Cancelled</Badge>}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={ewayStatus.variant}>
                          <FileText className="w-3 h-3" /> {ewayStatus.label}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {trip.distanceKm} km {trip.tollSpendINR ? `(₹${trip.tollSpendINR})` : ''}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 5. Dispatch New Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-[#202736] rounded-2xl w-full max-w-xl p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#202736] pb-4">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-lg">
                <Route className="w-5 h-5 text-blue-400" />
                <span>Dispatch New Commercial Trip</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Select Available Vehicle *</label>
                  <select
                    required
                    value={vehicleId}
                    onChange={e => setVehicleId(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.regNumber} ({v.make} {v.model} - {v.capacityTons}T)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Select Available Driver *</label>
                  <select
                    required
                    value={driverId}
                    onChange={e => setDriverId(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Choose Driver --</option>
                    {availableDrivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Origin City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={originCity}
                    onChange={e => setOriginCity(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Destination City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune"
                    value={destCity}
                    onChange={e => setDestCity(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Cargo Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Auto Spare Components"
                    value={cargoDesc}
                    onChange={e => setCargoDesc(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Payload Weight (Tons)</label>
                  <input
                    type="number"
                    value={cargoWeight}
                    onChange={e => setCargoWeight(Number(e.target.value))}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                  {isOverloaded && (
                    <div className="mt-1.5">
                      <Badge variant="danger" pulse>
                        <AlertTriangle className="w-3 h-3" /> Overloading Warning: Cargo exceeds vehicle capacity ({selectedVehicleObj.capacityTons}T)
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Distance (Km)</label>
                  <input
                    type="number"
                    value={distanceKm}
                    onChange={e => setDistanceKm(Number(e.target.value))}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">E-Way Bill Number</label>
                  <input
                    type="text"
                    placeholder="12-digit E-Way Bill"
                    value={ewayBill}
                    onChange={e => setEwayBill(e.target.value)}
                    className="w-full bg-[#1c2333] border border-[#2e374a] rounded-lg px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#202736] flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Dispatch Commercial Trip
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Trip Detail Drawer */}
      {selectedTrip && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md glass-panel border-l border-[#202736] shadow-2xl p-6 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between border-b border-[#202736] pb-4">
            <div>
              <span className="text-xs text-blue-400 font-mono font-bold">TRIP MANIFEST</span>
              <h2 className="text-xl font-extrabold font-mono text-slate-50">{selectedTrip.tripCode}</h2>
            </div>
            <button onClick={() => setSelectedTrip(null)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Route Card */}
            <Card glow="blue" className="space-y-3">
              <div className="text-slate-400 font-medium flex items-center justify-between">
                <span>Route & Distance</span>
                <span className="font-mono text-slate-200">{selectedTrip.distanceKm} km</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-100">{selectedTrip.origin.city}</div>
                    <div className="text-[11px] text-slate-400">{selectedTrip.origin.address}</div>
                  </div>
                </div>
                <div className="ml-2 pl-3 border-l-2 border-dashed border-[#2e374a] py-1 text-[11px] text-slate-500 font-mono">
                  Route Leg
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-100">{selectedTrip.destination.city}</div>
                    <div className="text-[11px] text-slate-400">{selectedTrip.destination.address}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Assets & Personnel */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736] space-y-1">
                <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-blue-400" /> Vehicle
                </div>
                <div className="font-mono font-bold text-slate-200">{selectedTrip.vehicleReg}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736] space-y-1">
                <div className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Driver
                </div>
                <div className="font-semibold text-slate-200">{selectedTrip.driverName}</div>
              </div>
            </div>

            {/* Cargo & E-Way Bill */}
            <div className="space-y-2">
              <div className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Cargo & E-Way Compliance</div>
              <div className="p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">{selectedTrip.cargoDescription}</span>
                  <span className="font-mono text-slate-400">{selectedTrip.cargoWeightTons} Tons</span>
                </div>
                {selectedTrip.ewayBillNumber && (
                  <div className="flex items-center justify-between pt-2 border-t border-[#202736]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="font-mono">{selectedTrip.ewayBillNumber}</span>
                    </div>
                    {(() => {
                      const st = getEwayBillStatus(selectedTrip.ewayBillExpiry);
                      return <Badge variant={st.variant}>{st.label}</Badge>;
                    })()}
                  </div>
                )}
                {selectedTrip.tollSpendINR && (
                  <div className="flex items-center justify-between pt-2 border-t border-[#202736] text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> FASTag Toll Spend:
                    </span>
                    <span className="font-mono font-bold text-slate-200">₹{selectedTrip.tollSpendINR}</span>
                  </div>
                )}
              </div>
            </div>

            {/* POD & Mark Delivered Action */}
            <div className="space-y-3 pt-2">
              <div className="text-slate-400 font-medium uppercase text-[10px] tracking-wider">Proof of Delivery (POD)</div>
              {selectedTrip.podReceived ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckSquare className="w-4 h-4" /> POD Verified & Received
                  </div>
                  {selectedTrip.podNotes && <div className="text-[11px] text-slate-300">{selectedTrip.podNotes}</div>}
                </div>
              ) : (
                <div className="space-y-3 p-3 rounded-xl bg-[#1c2333]/50 border border-[#202736]">
                  <textarea
                    rows={2}
                    value={podNotes}
                    onChange={e => setPodNotes(e.target.value)}
                    placeholder="Enter POD verification notes upon arrival..."
                    className="w-full bg-[#121824] border border-[#2e374a] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleMarkDelivered(selectedTrip.id)}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Mark Trip Delivered
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}
