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
  FileText,
  Truck,
  User,
  ArrowRight,
  CreditCard,
  Download,
  Eye,
  CheckSquare
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Trip } from '@/types';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  AnimatedPage,
  KPICard,
  Drawer,
  EmptyState,
  itemVariants
} from '@/components/ui';
import { exportToCSV } from '@/lib/csvExport';

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
    setOriginAddress('');
    setDestAddress('');
    setCargoDesc('');
    setEwayBill('');
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

  const handleExportCSV = () => {
    const exportData = filteredTrips.map(t => ({
      TripCode: t.tripCode,
      VehicleReg: t.vehicleReg,
      DriverName: t.driverName,
      OriginCity: t.origin.city,
      OriginAddress: t.origin.address,
      DestinationCity: t.destination.city,
      DestinationAddress: t.destination.address,
      CargoDescription: t.cargoDescription,
      CargoWeightTons: t.cargoWeightTons,
      Status: t.status,
      DistanceKm: t.distanceKm,
      EwayBillNumber: t.ewayBillNumber || '',
      EwayBillExpiry: t.ewayBillExpiry || '',
      TollSpendINR: t.tollSpendINR || 0,
      PODReceived: t.podReceived
    }));
    exportToCSV(exportData, `trips_export_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <AnimatedPage>
      {/* 1. Page Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          badge={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-secondary">
              <Route className="w-3.5 h-3.5" />
              Dispatch Operations
            </span>
          }
          title="Trip & Dispatch Operations"
          description="Operational freight manifests, highway route tracking, consignee delivery verification, and FASTag toll reconciliation."
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
                Dispatch New Trip
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 2. Primary Dispatch KPI Strip */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active In Transit"
          value={activeTripsCount}
          subtext="Commercial freight en-route"
          trend={{ value: `${activeTripsCount} on corridor`, isPositive: true }}
          icon={<Route className="w-4 h-4 text-blue-400" />}
          iconBg="bg-blue-600/15 border border-blue-500/30 text-blue-400"
        />
        <KPICard
          title="Delayed Freight"
          value={delayedTripsCount}
          subtext="Requires dispatcher intervention"
          trend={delayedTripsCount > 0 ? { value: `${delayedTripsCount} delayed`, isPositive: false } : { value: "On-time schedule", isPositive: true }}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          iconBg="bg-amber-600/15 border border-amber-500/30 text-amber-400"
        />
        <KPICard
          title="Delivered Trips"
          value={deliveredTodayCount}
          subtext="Successful cargo drop-offs"
          trend={{ value: "POD recorded", isPositive: true }}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          iconBg="bg-emerald-600/15 border border-emerald-500/30 text-emerald-400"
        />
        <KPICard
          title="FASTag Highway Tolls"
          value={`₹${totalTollSpendINR.toLocaleString('en-IN')}`}
          subtext="Automated electronic toll fee"
          icon={<CreditCard className="w-4 h-4 text-indigo-400" />}
          iconBg="bg-indigo-600/15 border border-indigo-500/30 text-indigo-400"
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
              placeholder="Search trip code, registration, driver, city..."
              className="w-full rounded-control border border-border bg-surface px-3 py-2 pl-9 text-sm text-text-primary placeholder:text-text-muted"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <span>Status Filter:</span>
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
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
      <motion.div variants={itemVariants} className="overflow-hidden rounded-card border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="sticky top-0 border-b border-border bg-surface-muted text-xs font-semibold text-text-secondary">
                <th className="py-3.5 px-4 font-mono">Trip Code</th>
                <th className="py-3.5 px-4 font-mono">Vehicle</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Route Path</th>
                <th className="py-3.5 px-4">Operational Status</th>
                <th className="py-3.5 px-4">E-Way Bill Status</th>
                <th className="py-3.5 px-4 font-mono">Distance / Toll</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-primary">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12">
                    <EmptyState
                      icon={<Route className="w-8 h-8 text-slate-500" />}
                      title="No Trips Found"
                      description="No commercial dispatch dispatches match your search filters."
                      action={
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('All');
                          }}
                        >
                          Clear Filters
                        </Button>
                      }
                    />
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
                      className="cursor-pointer transition-colors hover:bg-surface-muted group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                        <span className="rounded-control border border-border bg-surface-muted px-2.5 py-1 font-mono text-xs text-focus transition-colors">
                          {trip.tripCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200 font-semibold">{trip.vehicleReg}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-brand-navy">
                            {trip.driverName.charAt(0)}
                          </span>
                          <span>{trip.driverName}</span>
                        </div>
                      </td>
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
                          <Badge variant="warning">
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
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedTrip(trip);
                            setPodNotes(trip.podNotes || '');
                          }}
                          title="View Manifest"
                        />
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
      <Drawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Dispatch New Commercial Trip"
      >
        <form onSubmit={handleCreateTrip} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Select Available Vehicle *</label>
              <select
                required
                value={vehicleId}
                onChange={e => setVehicleId(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              >
                <option value="">-- Choose Commercial Asset --</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.regNumber} ({v.make} {v.model} - {v.capacityTons}T)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Select Available Driver *</label>
              <select
                required
                value={driverId}
                onChange={e => setDriverId(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              >
                <option value="">-- Choose Verified Driver --</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Origin Logistics Hub *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mumbai Hub"
                value={originCity}
                onChange={e => setOriginCity(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Destination Hub / City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Bengaluru Depot"
                value={destCity}
                onChange={e => setDestCity(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Origin Address</label>
              <input
                type="text"
                placeholder="e.g. Gate 4, Bhiwandi Logistics Park"
                value={originAddress}
                onChange={e => setOriginAddress(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Destination Address</label>
              <input
                type="text"
                placeholder="e.g. Nelamangala Cargo Terminal"
                value={destAddress}
                onChange={e => setDestAddress(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Cargo Description</label>
              <input
                type="text"
                placeholder="e.g. Precision Engineering Parts & Modules"
                value={cargoDesc}
                onChange={e => setCargoDesc(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Payload Weight (Metric Tons)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={cargoWeight}
                onChange={e => setCargoWeight(Number(e.target.value))}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
              />
              {isOverloaded && (
                <div className="mt-1.5">
                  <Badge variant="danger">
                    <AlertTriangle className="w-3 h-3" /> Overload Warning: Exceeds asset capacity ({selectedVehicleObj?.capacityTons}T)
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Estimated Distance (Km)</label>
              <input
                type="number"
                value={distanceKm}
                onChange={e => setDistanceKm(Number(e.target.value))}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">GST E-Way Bill Number</label>
              <input
                type="text"
                placeholder="12-digit GST E-Way Bill"
                value={ewayBill}
                onChange={e => setEwayBill(e.target.value)}
                className="w-full rounded-control border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm & Dispatch Trip
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 6. Trip Detail Pop-Up Modal */}
      {selectedTrip && (
        <Drawer
          isOpen={!!selectedTrip}
          onClose={() => setSelectedTrip(null)}
          title={`Trip Manifest: ${selectedTrip.tripCode}`}
        >
          <div className="space-y-4 text-xs">
            {/* Route Timeline Card */}
            <div className="space-y-3 rounded-control border border-border bg-surface-muted p-4">
              <div className="text-text-secondary flex items-center justify-between font-mono text-xs">
                <span>Highway Route Corridor</span>
                <span className="text-slate-200 font-bold">{selectedTrip.distanceKm} km</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-100">{selectedTrip.origin.city}</div>
                    <div className="text-xs text-text-secondary">{selectedTrip.origin.address}</div>
                  </div>
                </div>
                <div className="ml-2 border-l-2 border-dashed border-border py-1 pl-4 font-mono text-xs text-text-muted">
                  Transit Corridor Leg
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-100">{selectedTrip.destination.city}</div>
                    <div className="text-xs text-text-secondary">{selectedTrip.destination.address}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets & Personnel */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 rounded-control border border-border bg-surface-muted p-3">
                <div className="text-text-secondary flex items-center gap-1.5 font-medium text-xs">
                  <Truck className="w-3.5 h-3.5 text-blue-400" /> Commercial Asset
                </div>
                <div className="font-mono font-bold text-slate-100">{selectedTrip.vehicleReg}</div>
              </div>
              <div className="space-y-1 rounded-control border border-border bg-surface-muted p-3">
                <div className="text-text-secondary flex items-center gap-1.5 font-medium text-xs">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Assigned Driver
                </div>
                <div className="font-semibold text-slate-100">{selectedTrip.driverName}</div>
              </div>
            </div>

            {/* Cargo & E-Way Bill Compliance */}
            <div className="space-y-2">
              <div className="font-semibold text-text-secondary">Cargo and E-Way compliance</div>
              <div className="space-y-2 rounded-control border border-border bg-surface-muted p-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-semibold">{selectedTrip.cargoDescription}</span>
                  <span className="font-mono text-slate-300 font-bold">{selectedTrip.cargoWeightTons} Tons</span>
                </div>
                {selectedTrip.ewayBillNumber && (
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="font-mono text-slate-300">{selectedTrip.ewayBillNumber}</span>
                    </div>
                    {(() => {
                      const st = getEwayBillStatus(selectedTrip.ewayBillExpiry);
                      return <Badge variant={st.variant}>{st.label}</Badge>;
                    })()}
                  </div>
                )}
                {selectedTrip.tollSpendINR && (
                  <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> FASTag Highway Toll:
                    </span>
                    <span className="font-mono font-bold text-slate-100">₹{selectedTrip.tollSpendINR}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Proof of Delivery (POD) Section */}
            <div className="space-y-3 pt-2">
              <div className="font-semibold text-text-secondary">Proof of delivery verification</div>
              {selectedTrip.podReceived ? (
                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckSquare className="w-4 h-4" /> POD Physically Verified & Logged
                  </div>
                  {selectedTrip.podNotes && <div className="text-xs text-text-secondary">{selectedTrip.podNotes}</div>}
                </div>
              ) : (
                <div className="space-y-3 rounded-control border border-border bg-surface-muted p-3.5">
                  <textarea
                    rows={2}
                    value={podNotes}
                    onChange={e => setPodNotes(e.target.value)}
                    placeholder="Enter consignee signature notes, seal number, or gate receipt details..."
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                  />
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleMarkDelivered(selectedTrip.id)}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Confirm Delivery & Record POD
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-border pt-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedTrip(null)}>
                Close Manifest
              </Button>
            </div>
          </div>
        </Drawer>
      )}
    </AnimatedPage>
  );
}
