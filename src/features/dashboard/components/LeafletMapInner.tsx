'use client';

import React, { useEffect } from 'react';
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { StatusPill } from '@/components/ui';
import { CORRIDOR_WAYPOINTS } from '@/lib/services/simulationService';
import { Vehicle } from '@/types';

function markerIcon(vehicle: Vehicle) {
  const color = vehicle.maintenanceStatus === 'Breakdown' || vehicle.docStatus === 'Expired' ? 'var(--status-red)' : vehicle.maintenanceStatus === 'Scheduled Service' || vehicle.docStatus === 'Expiring Soon' ? 'var(--status-amber)' : 'var(--status-green)';
  return L.divIcon({ html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:3px solid var(--bg-surface)"></span>`, className: 'fleet-marker', iconSize: [16, 16], iconAnchor: [8, 8] });
}

function FocusVehicle({ vehicles, selectedVehicleId }: { vehicles: Vehicle[]; selectedVehicleId: string | null }) {
  const map = useMap();
  useEffect(() => {
    const vehicle = vehicles.find(item => item.id === selectedVehicleId);
    if (vehicle?.lastKnownLocation) map.flyTo([vehicle.lastKnownLocation.lat, vehicle.lastKnownLocation.lng], 8, { duration: 0.4 });
  }, [map, selectedVehicleId, vehicles]);
  return null;
}

export function LeafletMapInner({ vehicles, selectedVehicleId = null }: { vehicles: Vehicle[]; selectedVehicleId?: string | null }) {
  const corridorCoords = CORRIDOR_WAYPOINTS.map(point => [point.lat, point.lng] as [number, number]);
  return <MapContainer center={[19.2, 75]} zoom={6} scrollWheelZoom={false} className="h-full min-h-[320px] w-full" style={{ background: 'var(--bg-surface-muted)' }}>
    <FocusVehicle vehicles={vehicles} selectedVehicleId={selectedVehicleId} />
    <TileLayer attribution="&copy; OpenStreetMap contributors &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
    <Polyline positions={corridorCoords} pathOptions={{ color: 'var(--color-focus)', weight: 3, opacity: 0.7, dashArray: '6 6' }} />
    {vehicles.map(vehicle => {
      const location = vehicle.lastKnownLocation || { lat: 20.5937, lng: 78.9629, city: 'Transit corridor' };
      const status = vehicle.maintenanceStatus === 'In Service' ? 'success' : vehicle.maintenanceStatus === 'Scheduled Service' ? 'maintenance' : 'danger';
      return <Marker key={vehicle.id} position={[location.lat, location.lng]} icon={markerIcon(vehicle)}><Popup><div className="min-w-48 space-y-2 text-sm"><div className="flex items-center justify-between gap-3 border-b border-border pb-2"><span className="font-mono font-bold text-text-primary">{vehicle.regNumber}</span><StatusPill status={status}>{vehicle.maintenanceStatus}</StatusPill></div><p className="font-semibold text-text-primary">{vehicle.assignedDriver || 'Unassigned'}</p><p className="text-text-secondary">{location.city}</p><div className="grid grid-cols-2 gap-2 border-t border-border pt-2 text-xs"><span className="text-text-secondary">ETA <strong className="text-text-primary">{vehicle.maintenanceStatus === 'In Service' ? 'On route' : 'N/A'}</strong></span><span className="text-text-secondary">Fuel <strong className="text-text-primary">N/A</strong></span></div></div></Popup></Marker>;
    })}
  </MapContainer>;
}