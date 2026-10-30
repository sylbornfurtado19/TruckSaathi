'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Vehicle, Driver, Trip } from '@/types';

import { DashboardHeader } from './DashboardHeader';
import { DashboardKpiStrip } from './DashboardKpiStrip';
import { AttentionRequiredFeed, UrgentItem } from './AttentionRequiredFeed';
import { LiveFleetMap } from './LiveFleetMap';
import { SimulationControlBar } from './SimulationControlBar';
import { LiveFleetRadarFeed, LiveFleetFeedItem } from './LiveFleetRadarFeed';
import { OperationsDeckTabs } from './OperationsDeckTabs';
import { DashboardMetricsStrip } from './DashboardMetricsStrip';
import { VehicleInspectDrawer } from './VehicleInspectDrawer';
import { DriverInspectDrawer } from './DriverInspectDrawer';
import { TripInspectDrawer } from './TripInspectDrawer';

export function DashboardFeature() {
  const {
    vehicles,
    drivers,
    trips,
    fuelLogs,
    currentUser,
    simState,
        resetSimulation,
    toggleSimulation,
    setSimulationSpeed,
    triggerSOS,
    clearSOS,
    activeEmergency,
    acknowledgeSOS,
    assignTrip
  } = useApp();

  // Selected entities for quick slide-out inspect drawers
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const avgDriverSafety = drivers.length
    ? Math.round(drivers.reduce((sum, d) => sum + (d.safetyScore || 90), 0) / drivers.length)
    : 92;

  // Operational Urgency Queue ("ATTENTION REQUIRED")
  const attentionItems: UrgentItem[] = useMemo(() => {
    const list: UrgentItem[] = [];

    // 1. Live Realtime Emergency SOS (Database or Local Simulation)
    if (activeEmergency && activeEmergency.status === 'ACTIVE') {
      list.push({
        id: `sos-${activeEmergency.id}`,
        urgency: 'critical',
        type: 'sos',
        title: `EMERGENCY SOS: ${activeEmergency.vehicleReg || simState.vehicleReg} (${activeEmergency.driverName || simState.driverName})`,
        description: `CRITICAL PANIC BROADCAST TRIGGERED at ${activeEmergency.locationName || simState.currentCheckpoint || 'Highway Corridor'} [${activeEmergency.latitude?.toFixed(4) || '18.75'}, ${activeEmergency.longitude?.toFixed(4) || '73.40'}]. Immediate dispatch response required.`,
        actionLabel: 'Acknowledge Emergency SOS',
        onAction: async () => {
          await acknowledgeSOS(activeEmergency.id);
          clearSOS();
        }
      });
    } else if (simState.sosActive) {
      list.push({
        id: 'sos-active',
        urgency: 'critical',
        type: 'sos',
        title: `EMERGENCY SOS: ${simState.vehicleReg} (${simState.driverName})`,
        description: `Driver activated panic broadcast near ${simState.currentCheckpoint} on NH-48. Speed: ${simState.speedKmh} km/h.`,
        actionLabel: 'Resolve SOS / Clear Alert',
        onAction: () => clearSOS()
      });
    }

    // 2. Breakdown assets
    vehicles
      .filter(v => v.maintenanceStatus === 'Breakdown')
      .forEach(v => {
        list.push({
          id: `breakdown-${v.id}`,
          urgency: 'critical',
          type: 'breakdown',
          title: `Vehicle Breakdown: ${v.regNumber}`,
          description: `${v.make} ${v.model} (${v.category}) reported immobilised. Assigned driver: ${v.assignedDriver || 'Unassigned'}.`,
          actionLabel: 'Inspect Vehicle',
          onAction: () => setSelectedVehicle(v)
        });
      });

    // 3. Delayed shipments
    trips
      .filter(t => t.status === 'Delayed')
      .forEach(t => {
        list.push({
          id: `delayed-${t.id}`,
          urgency: 'high',
          type: 'delayed',
          title: `Transit Delay: ${t.tripCode} (${t.origin.city} → ${t.destination.city})`,
          description: `Vehicle ${t.vehicleReg} behind schedule. Driver ${t.driverName}. Estimated arrival delayed.`,
          actionLabel: 'Inspect Trip',
          onAction: () => setSelectedTrip(t)
        });
      });

    // 4. Low Fuel or Theft Alerts
    fuelLogs
      .filter(f => f.theftAlert || f.fuelLevelPercent < 20)
      .forEach(f => {
        list.push({
          id: `fuel-${f.id}`,
          urgency: f.theftAlert ? 'high' : 'medium',
          type: 'fuel_theft',
          title: f.theftAlert ? `Fuel Siphoning Alert: ${f.vehicleReg}` : `Critical Low Fuel: ${f.vehicleReg}`,
          description: f.theftAlert
            ? (f.theftDetails || 'Abrupt fuel drop detected during transit.')
            : `Tank level at ${f.fuelLevelPercent}% (${f.fuelLiters}L remaining). Refuel required.`,
          actionLabel: 'Review Fuel Log',
          onAction: () => {
            const v = vehicles.find(item => item.regNumber === f.vehicleReg);
            if (v) setSelectedVehicle(v);
          }
        });
      });

    // 5. Expiring Compliance Docs
    vehicles
      .filter(v => v.docStatus === 'Expired' || v.docStatus === 'Expiring Soon')
      .slice(0, 3)
      .forEach(v => {
        list.push({
          id: `doc-${v.id}`,
          urgency: v.docStatus === 'Expired' ? 'critical' : 'medium',
          type: 'doc_expired',
          title: `Compliance Expiry: ${v.regNumber}`,
          description: `Vehicle RC/Insurance/Fitness status is ${v.docStatus}. Risk of RTO impoundment on interstate routes.`,
          actionLabel: 'Inspect Document',
          onAction: () => setSelectedVehicle(v)
        });
      });

    // 6. Scheduled maintenance
    vehicles
      .filter(v => v.maintenanceStatus === 'Scheduled Service')
      .slice(0, 2)
      .forEach(v => {
        list.push({
          id: `service-${v.id}`,
          urgency: 'medium',
          type: 'service',
          title: `Scheduled Preventive Service: ${v.regNumber}`,
          description: `Routine maintenance window open. Component health inspection due.`,
          actionLabel: 'Schedule Workshop',
          onAction: () => setSelectedVehicle(v)
        });
      });

    return list;
  }, [activeEmergency, acknowledgeSOS, simState, vehicles, trips, fuelLogs, clearSOS]);

  // Live Fleet Stream: Combines real trips and vehicles
  const liveFleetFeed: LiveFleetFeedItem[] = useMemo(() => {
    return vehicles.map(v => {
      const activeTrip = trips.find(t => t.vehicleId === v.id && t.status === 'In Transit');
      const isSimulated = v.regNumber === simState.vehicleReg;

      let speed = 0;
      let route = 'Yard / Base Hub';
      let statusText = 'Idle';
      let statusVariant: 'success' | 'info' | 'warning' | 'danger' | 'neutral' = 'neutral';

      if (v.maintenanceStatus === 'Breakdown') {
        statusText = 'Breakdown';
        route = 'Immobilised on Corridor';
        statusVariant = 'danger';
      } else if (v.maintenanceStatus === 'Scheduled Service') {
        statusText = 'Workshop Service';
        route = 'Central Maintenance Depot';
        statusVariant = 'warning';
      } else if (isSimulated && simState.isRunning) {
        speed = simState.speedKmh;
        route = 'Mumbai Bhiwandi → Pune Chakan';
        statusText = simState.speedKmh > 0 ? 'On Route' : 'Checkpoint Stop';
        statusVariant = 'info';
      } else if (activeTrip) {
        speed = Math.floor(55 + (v.capacityTons % 20));
        route = `${activeTrip.origin.city} → ${activeTrip.destination.city}`;
        statusText = 'On Route';
        statusVariant = 'info';
      } else {
        statusText = 'Ready / Standby';
        route = v.lastKnownLocation?.city ? `${v.lastKnownLocation.city} Hub` : 'Depot Yard';
        statusVariant = 'success';
      }

      return {
        vehicle: v,
        activeTrip,
        speed,
        route,
        statusText,
        statusVariant,
        isSimulated
      };
    });
  }, [vehicles, trips, simState]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <DashboardHeader
        currentUser={currentUser}
        totalVehicles={vehicles.length}
      />

      {/* 2. Top KPI Command Strip */}
      <DashboardKpiStrip
        vehicles={vehicles}
        trips={trips}
        drivers={drivers}
      />

      {/* 3. Attention Required Feed */}
      <AttentionRequiredFeed
        items={attentionItems}
        isSosActive={Boolean(simState.sosActive || (activeEmergency && activeEmergency.status === 'ACTIVE'))}
      />

      {/* 4. Main Command Center (2-Column Split Deck) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Fleet Map + Simulation Control Bar (8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <LiveFleetMap
            vehicles={vehicles}
            selectedVehicleId={selectedVehicle?.id}
            onSelectVehicle={v => setSelectedVehicle(v)}
          />

          <SimulationControlBar
            simState={simState}
            onToggle={toggleSimulation}
            onReset={resetSimulation}
            onSetSpeed={setSimulationSpeed}
            onTriggerSOS={() => triggerSOS()}
            onClearSOS={clearSOS}
          />
        </div>

        {/* Right Column: Live Fleet Radar Feed (4 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <LiveFleetRadarFeed
            feed={liveFleetFeed}
            onSelectVehicle={v => setSelectedVehicle(v)}
          />
        </div>
      </div>

      {/* 5. Operations Control Deck (Tabs: Trips, Vehicles, Drivers) */}
      <OperationsDeckTabs
        trips={trips}
        vehicles={vehicles}
        drivers={drivers}
        simState={simState}
        onSelectTrip={t => setSelectedTrip(t)}
        onSelectVehicle={v => setSelectedVehicle(v)}
        onSelectDriver={d => setSelectedDriver(d)}
      />

      {/* 6. Fleet Analytics Derived Metrics Strip */}
      <DashboardMetricsStrip
        fuelLogs={fuelLogs}
        trips={trips}
        avgDriverSafety={avgDriverSafety}
      />

      {/* 7. Quick Inspect Slide-Out Drawers */}
      <VehicleInspectDrawer
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
      />

      <DriverInspectDrawer
        driver={selectedDriver}
        onClose={() => setSelectedDriver(null)}
      />

      <TripInspectDrawer
        trip={selectedTrip}
        drivers={drivers}
        vehicles={vehicles}
        onAssignTrip={assignTrip}
        onUpdateTrip={updated => setSelectedTrip(updated)}
        onClose={() => setSelectedTrip(null)}
      />
    </div>
  );
}
