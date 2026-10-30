'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  CreditCard,
  Download,
  Eye,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Trip, TripStatus } from '@/types';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  AnimatedPage,
  KPICard,
  EmptyState,
  itemVariants
} from '@/components/ui';
import { exportToCSV } from '@/lib/csvExport';
import { EwayBillBadge } from '@/features/trips/EwayBillBadge';
import { TripsKanban } from '@/features/trips/TripsKanban';
import { NewDispatchWizard } from '@/features/trips/NewDispatchWizard';
import { TripInspectModal } from '@/features/trips/TripInspectModal';

export function TripsContent() {
  const { trips, updateTrip } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // KPIs
  const activeTripsCount = trips.filter(t => t.status === 'In Transit').length;
  const delayedTripsCount = trips.filter(t => t.status === 'Delayed').length;
  const deliveredTodayCount = trips.filter(t => t.status === 'Delivered').length;
  const totalTollSpendINR = trips.reduce((acc, t) => acc + (t.tollSpendINR || 0), 0);

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

  const handleUpdateStatus = (tripId: string, newStatus: TripStatus) => {
    const updates: Partial<Trip> = { status: newStatus };
    if (newStatus === 'Delivered') {
      updates.actualArrival = new Date().toISOString().slice(0, 16).replace('T', ' ');
      updates.podReceived = true;
    } else if (newStatus === 'In Transit') {
      updates.actualDeparture = new Date().toISOString().slice(0, 16).replace('T', ' ');
    }
    updateTrip(tripId, updates);
  };

  const handleMarkDelivered = (tripId: string, notes: string) => {
    updateTrip(tripId, {
      status: 'Delivered',
      actualArrival: new Date().toISOString().slice(0, 16).replace('T', ' '),
      podReceived: true,
      podNotes: notes || 'POD physically verified and signed by consignee.'
    });
    if (selectedTrip && selectedTrip.id === tripId) {
      setSelectedTrip({
        ...selectedTrip,
        status: 'Delivered',
        actualArrival: new Date().toISOString().slice(0, 16).replace('T', ' '),
        podReceived: true,
        podNotes: notes || 'POD physically verified and signed by consignee.'
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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-muted px-2.5 py-1 text-xs font-mono text-brand-orange">
              <Route className="w-3.5 h-3.5" />
              DISPATCH MISSION CONTROL
            </span>
          }
          title="Trip & Dispatch Operations"
          description="Operational freight manifests, highway route tracking, consignee delivery verification, and FASTag toll reconciliation."
          actions={
            <div className="flex items-center gap-2">
              {/* View Switcher Pill */}
              <div className="flex items-center rounded-xl border border-white/10 bg-surface-muted p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-brand-orange text-black shadow-sm font-bold'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Kanban
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'table'
                      ? 'bg-brand-orange text-black shadow-sm font-bold'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  Table
                </button>
              </div>

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
                onClick={() => setIsWizardOpen(true)}
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
          icon={<Route className="w-4 h-4 text-brand-orange" />}
          iconBg="bg-brand-orange/15 border border-brand-orange/30 text-brand-orange"
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
        <Card className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between border-white/8 bg-surface/80 backdrop-blur-md">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search trip code, registration, pilot, corridor city..."
              className="w-full rounded-lg border border-white/10 bg-surface-muted px-3 py-2 pl-9 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-orange focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
              <Filter className="w-3.5 h-3.5 text-brand-orange" />
              <span>Status:</span>
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-surface-muted px-3 py-1.5 text-xs text-text-primary focus:border-brand-orange focus:outline-none"
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

      {/* 4. Main View: Kanban vs Table */}
      {viewMode === 'kanban' ? (
        <motion.div variants={itemVariants}>
          <TripsKanban
            trips={filteredTrips}
            onSelectTrip={trip => setSelectedTrip(trip)}
            onUpdateStatus={handleUpdateStatus}
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="overflow-hidden rounded-2xl border border-white/8 bg-surface/90 shadow-xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="sticky top-0 border-b border-white/8 bg-surface-muted/80 text-xs font-semibold text-text-secondary">
                  <th className="py-3.5 px-4 font-mono">Trip Code</th>
                  <th className="py-3.5 px-4 font-mono">Vehicle</th>
                  <th className="py-3.5 px-4">Driver Pilot</th>
                  <th className="py-3.5 px-4">Route Path</th>
                  <th className="py-3.5 px-4">Operational Status</th>
                  <th className="py-3.5 px-4">E-Way Bill Status</th>
                  <th className="py-3.5 px-4 font-mono">Distance / Toll</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 text-text-primary">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12">
                      <EmptyState
                        icon={<Route className="w-8 h-8 text-text-muted" />}
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
                    return (
                      <tr
                        key={trip.id}
                        onClick={() => setSelectedTrip(trip)}
                        className="cursor-pointer transition-colors hover:bg-surface-muted group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                          <span className="rounded-md border border-white/10 bg-surface-muted px-2.5 py-1 font-mono text-xs text-brand-orange">
                            {trip.tripCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-200 font-semibold">{trip.vehicleReg}</td>
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange/20 text-xs font-bold text-brand-orange">
                              {trip.driverName.charAt(0)}
                            </span>
                            <span>{trip.driverName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-slate-200">
                            <span className="text-blue-400">{trip.origin.city}</span>
                            <ArrowRight className="w-3 h-3 text-text-muted" />
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
                          <EwayBillBadge
                            ewayBillNumber={trip.ewayBillNumber}
                            ewayBillExpiry={trip.ewayBillExpiry}
                            size="sm"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {trip.distanceKm} km {trip.tollSpendINR ? `(₹${trip.tollSpendINR})` : ''}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5 text-text-muted group-hover:text-brand-orange" />}
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedTrip(trip);
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
      )}

      {/* 5. Dispatch New Trip Multi-Step Wizard */}
      <AnimatePresence>
        {isWizardOpen && (
          <NewDispatchWizard
            isOpen={isWizardOpen}
            onClose={() => setIsWizardOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 6. Trip Inspect Manifest Slide-Over Modal */}
      <AnimatePresence>
        {selectedTrip && (
          <TripInspectModal
            trip={selectedTrip}
            onClose={() => setSelectedTrip(null)}
            onMarkDelivered={handleMarkDelivered}
          />
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}
