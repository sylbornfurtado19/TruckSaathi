'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle } from '@/types';

interface LeafletMapInnerProps {
  vehicles: Vehicle[];
}

// Helper to create custom divIcon per vehicle status
function getStatusDivIcon(vehicle: Vehicle) {
  let bgClass = 'bg-emerald-500';
  let shadowGlow = 'box-shadow: 0 0 12px var(--accent-emerald-glow);';
  let extraClass = '';

  if (vehicle.maintenanceStatus === 'Breakdown' || vehicle.docStatus === 'Expired') {
    bgClass = 'bg-rose-500';
    shadowGlow = 'box-shadow: 0 0 12px var(--accent-rose-glow);';
    extraClass = 'marker-pulse-critical';
  } else if (vehicle.maintenanceStatus === 'Scheduled Service' || vehicle.docStatus === 'Expiring Soon') {
    bgClass = 'bg-amber-500';
    shadowGlow = 'box-shadow: 0 0 12px var(--accent-amber-glow);';
  }

  const htmlString = `<div class="w-4 h-4 rounded-full ${bgClass} ${extraClass} border-2 border-slate-900" style="${shadowGlow}"></div>`;

  return L.divIcon({
    html: htmlString,
    className: 'custom-leaflet-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
}

export function LeafletMapInner({ vehicles }: LeafletMapInnerProps) {
  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      scrollWheelZoom={false}
      className="w-full h-full"
      style={{ background: '#090d16' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {vehicles.map(v => {
        const loc = v.lastKnownLocation || { lat: 20.5937, lng: 78.9629, city: 'Transit Hub' };
        const icon = getStatusDivIcon(v);

        return (
          <Marker key={v.id} position={[loc.lat, loc.lng]} icon={icon}>
            <Popup>
              <div className="space-y-1 text-xs">
                <div className="font-mono font-bold text-blue-400">{v.regNumber}</div>
                <div className="font-semibold text-slate-100">{v.make} {v.model} ({v.category})</div>
                <div className="text-[11px] text-slate-400">Location: {loc.city}</div>
                <div className="text-[11px] text-slate-400">Driver: {v.assignedDriver || 'Unassigned'}</div>
                <div className="text-[11px] font-medium text-slate-300">Status: {v.maintenanceStatus} ({v.docStatus})</div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
