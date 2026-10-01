'use client';

import React, { useEffect, useRef } from 'react';
import { CORRIDOR_WAYPOINTS } from '@/lib/services/simulationService';
import { Vehicle } from '@/types';

interface OsmFleetFallbackProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string | null;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  className?: string;
  zoom?: number;
  center?: { lat: number; lng: number };
}

export function OsmFleetFallback({
  vehicles,
  selectedVehicleId = null,
  onSelectVehicle,
  className = '',
  zoom = 7,
  center = { lat: 19.2, lng: 74.5 }
}: OsmFleetFallbackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    let isCancelled = false;

    // Dynamically load leaflet on the client side
    import('leaflet').then((L) => {
      if (isCancelled || !containerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(containerRef.current, {
          center: [center.lat, center.lng],
          zoom,
          zoomControl: true,
          attributionControl: false
        });

        // Use standard official OpenStreetMap tiles (100% free, NO Carto watermark, NO API key required)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          className: 'osm-dark-tiles'
        }).addTo(map);

        // Corridor Polyline
        const coords = CORRIDOR_WAYPOINTS.map((p) => [p.lat, p.lng] as [number, number]);
        L.polyline(coords, {
          color: '#06b6d4',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '6, 6'
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      const currentMarkers = markersRef.current;
      const activeIds = new Set(vehicles.map((v) => v.id));

      // Remove defunct markers
      currentMarkers.forEach((marker, id) => {
        if (!activeIds.has(id)) {
          marker.remove();
          currentMarkers.delete(id);
        }
      });

      // Add or update markers
      vehicles.forEach((vehicle) => {
        const loc = vehicle.lastKnownLocation || { lat: 19.076, lng: 72.8777, city: 'Base Hub' };
        const isCritical = vehicle.maintenanceStatus === 'Breakdown' || vehicle.docStatus === 'Expired';
        const isWarning = vehicle.maintenanceStatus === 'Scheduled Service' || vehicle.docStatus === 'Expiring Soon';
        const pinColor = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#10b981';

        const customIcon = L.divIcon({
          html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${pinColor};border:3px solid #0b111e;box-shadow:0 0 12px ${pinColor}"></span>`,
          className: 'custom-fleet-pin',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const existing = currentMarkers.get(vehicle.id);
        if (existing) {
          existing.setLatLng([loc.lat, loc.lng]);
          existing.setIcon(customIcon);
        } else {
          const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

          const popupContent = `
            <div style="font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 10px; border-radius: 8px; min-width: 190px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #1e293b; padding-bottom: 4px;">
                <strong style="font-family: monospace; font-size: 13px; color: #38bdf8;">${vehicle.regNumber}</strong>
                <span style="font-size: 10px; font-weight: 700; color: ${pinColor}">${vehicle.maintenanceStatus}</span>
              </div>
              <div style="font-size: 11px; line-height: 1.4; color: #cbd5e1;">
                <div><strong>Pilot:</strong> ${vehicle.assignedDriver || 'Standby'}</div>
                <div><strong>Sector:</strong> ${loc.city}</div>
                <div><strong>Payload:</strong> ${vehicle.capacityTons}T (${vehicle.model})</div>
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
          marker.on('click', () => onSelectVehicle?.(vehicle));
          currentMarkers.set(vehicle.id, marker);
        }
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [vehicles, center, zoom, onSelectVehicle]);

  // Focus on selected vehicle
  useEffect(() => {
    if (!selectedVehicleId || !mapInstanceRef.current) return;
    const target = vehicles.find((v) => v.id === selectedVehicleId);
    if (target?.lastKnownLocation) {
      mapInstanceRef.current.flyTo([target.lastKnownLocation.lat, target.lastKnownLocation.lng], 9, {
        duration: 0.5
      });
    }
  }, [selectedVehicleId, vehicles]);

  return (
    <div
      ref={containerRef}
      className={`h-full min-h-[380px] w-full rounded-xl overflow-hidden bg-[#0b111e] ${className}`}
      style={{ width: '100%', height: '100%', minHeight: '380px' }}
    />
  );
}
