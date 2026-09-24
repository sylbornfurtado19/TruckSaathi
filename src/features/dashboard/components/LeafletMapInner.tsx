'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle } from '@/types';

interface LeafletMapInnerProps {
  vehicles: Vehicle[];
}

// Helper to create glowing radar divIcon per vehicle status
function getStatusDivIcon(vehicle: Vehicle) {
  let ringColor = 'bg-emerald-400';
  let dotColor = 'bg-emerald-400';
  let shadowGlow = '#10b981';

  if (vehicle.maintenanceStatus === 'Breakdown' || vehicle.docStatus === 'Expired') {
    ringColor = 'bg-rose-500';
    dotColor = 'bg-rose-500';
    shadowGlow = '#f43f5e';
  } else if (vehicle.maintenanceStatus === 'Scheduled Service' || vehicle.docStatus === 'Expiring Soon') {
    ringColor = 'bg-amber-400';
    dotColor = 'bg-amber-400';
    shadowGlow = '#f59e0b';
  }

  const htmlString = `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background-color: ${shadowGlow}; opacity: 0.35;" class="radar-ring"></div>
      <div style="position: relative; width: 12px; height: 12px; border-radius: 9999px; background-color: ${shadowGlow}; border: 2px solid #090b10; box-shadow: 0 0 10px ${shadowGlow};"></div>
    </div>
  `;

  return L.divIcon({
    html: htmlString,
    className: 'custom-leaflet-radar-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

export function LeafletMapInner({ vehicles }: LeafletMapInnerProps) {
  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      scrollWheelZoom={false}
      className="w-full h-full"
      style={{ background: '#090b10' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {vehicles.map(v => {
        const loc = v.lastKnownLocation || { lat: 20.5937, lng: 78.9629, city: 'Transit Corridor Hub' };
        const icon = getStatusDivIcon(v);

        return (
          <Marker key={v.id} position={[loc.lat, loc.lng]} icon={icon}>
            <Popup>
              <div className="space-y-1.5 text-xs p-1">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-1">
                  <span className="font-mono font-black text-cyan-400 tracking-wider text-sm">{v.regNumber}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    {v.category}
                  </span>
                </div>
                <div className="font-semibold text-white text-xs">{v.make} {v.model}</div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Hub: <strong className="text-slate-200">{loc.city}</strong></span>
                  <span>Driver: <strong className="text-slate-200">{v.assignedDriver || 'Unassigned'}</strong></span>
                </div>
                <div className="text-[10px] font-mono pt-1 text-slate-400 flex items-center justify-between">
                  <span>Health: <strong className="text-emerald-400">{v.maintenanceStatus}</strong></span>
                  <span>Docs: <strong className={v.docStatus === 'Compliant' ? 'text-emerald-400' : 'text-amber-400'}>{v.docStatus}</strong></span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
