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

export function LeafletMapInner({
  vehicles,
  selectedVehicleId = null,
  onSelectVehicle
}: {
  vehicles: Vehicle[];
  selectedVehicleId?: string | null;
  onSelectVehicle?: (vehicle: Vehicle) => void;
}) {
  const corridorCoords = CORRIDOR_WAYPOINTS.map(point => [point.lat, point.lng] as [number, number]);
  return (
    <MapContainer
      center={[19.2, 75]}
      zoom={6}
      scrollWheelZoom={false}
      className="h-full min-h-[380px] w-full"
      style={{ background: 'var(--bg-canvas)' }}
    >
      <FocusVehicle vehicles={vehicles} selectedVehicleId={selectedVehicleId} />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Polyline
        positions={corridorCoords}
        pathOptions={{ color: '#06b6d4', weight: 2.5, opacity: 0.65, dashArray: '6 6' }}
      />
      {vehicles.map(vehicle => {
        const location = vehicle.lastKnownLocation || { lat: 20.5937, lng: 78.9629, city: 'Transit corridor' };
        const status =
          vehicle.maintenanceStatus === 'In Service'
            ? 'success'
            : vehicle.maintenanceStatus === 'Scheduled Service'
            ? 'maintenance'
            : 'danger';

        return (
          <Marker
            key={vehicle.id}
            position={[location.lat, location.lng]}
            icon={markerIcon(vehicle)}
            eventHandlers={{
              click: () => onSelectVehicle?.(vehicle)
            }}
          >
            <Popup className="ts-dark-popup">
              <div className="min-w-52 space-y-2 p-1 text-xs">
                <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-2">
                  <span className="font-mono font-bold text-text-primary text-sm">{vehicle.regNumber}</span>
                  <StatusPill status={status}>{vehicle.maintenanceStatus}</StatusPill>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-text-primary text-xs">
                    Driver: {vehicle.assignedDriver || 'Standby Pool'}
                  </p>
                  <p className="text-text-secondary text-[11px]">Sector: {location.city}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-border/80 pt-2 text-[11px]">
                  <div>
                    <span className="text-text-muted block">Type:</span>
                    <span className="font-medium text-text-primary">{vehicle.category}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Capacity:</span>
                    <span className="font-mono font-semibold text-text-primary">{vehicle.capacityTons} T</span>
                  </div>
                </div>
                {onSelectVehicle && (
                  <button
                    type="button"
                    onClick={() => onSelectVehicle(vehicle)}
                    className="mt-2 w-full rounded bg-cyan-500/20 py-1 text-center font-mono text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors"
                  >
                    Quick Inspect Asset →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}