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
  radarSweepEnabled?: boolean;
}

export function OsmFleetFallback({
  vehicles,
  selectedVehicleId = null,
  onSelectVehicle,
  className = '',
  zoom = 7,
  center = { lat: 19.2, lng: 74.5 },
  radarSweepEnabled = false
}: OsmFleetFallbackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    let isCancelled = false;

    // Dynamically load leaflet on client side
    import('leaflet').then((L) => {
      if (isCancelled || !containerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(containerRef.current, {
          center: [center.lat, center.lng],
          zoom,
          zoomControl: true,
          attributionControl: false
        });

        // Use standard official OpenStreetMap tiles with dark operations filter
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          className: 'osm-dark-tiles'
        }).addTo(map);

        // Corridor Flow Polyline
        const coords = CORRIDOR_WAYPOINTS.map((p) => [p.lat, p.lng] as [number, number]);
        
        // Base outer glow polyline
        L.polyline(coords, {
          color: '#ff6b00',
          weight: 6,
          opacity: 0.25
        }).addTo(map);

        // Main luminous corridor track
        L.polyline(coords, {
          color: '#06b6d4',
          weight: 3.5,
          opacity: 0.9,
          dashArray: '10, 10'
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

      // Add or update markers with animated SVG pulsing halos and direction indicators
      vehicles.forEach((vehicle) => {
        const loc = vehicle.lastKnownLocation || { lat: 19.076, lng: 72.8777, city: 'Base Hub' };
        const isCritical = vehicle.maintenanceStatus === 'Breakdown' || vehicle.docStatus === 'Expired';
        const isWarning = vehicle.maintenanceStatus === 'Scheduled Service' || vehicle.docStatus === 'Expiring Soon';
        const isSelected = selectedVehicleId === vehicle.id;

        const pinColor = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#10b981';
        const pulseAnim = isCritical ? 'animation: pulseRingRed 1.8s infinite;' : 'animation: pulseRingCyan 2.4s infinite;';
        const ringBorder = isSelected ? 'border: 2px solid #ff6b00; transform: scale(1.2);' : `border: 2px solid ${pinColor};`;

        const customIcon = L.divIcon({
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; items-center; justify-content: center; cursor: pointer;">
              <!-- Pulsing Halo Ring -->
              <span style="position: absolute; inset: 2px; border-radius: 50%; background: ${pinColor}; opacity: 0.25; ${pulseAnim}"></span>
              
              <!-- Vehicle Core Bead -->
              <div style="position: absolute; top: 6px; left: 6px; width: 20px; height: 20px; border-radius: 50%; background: #0b1726; ${ringBorder} display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px ${pinColor}88;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${pinColor};"></span>
              </div>
            </div>
          `,
          className: 'custom-fleet-pin-wrap',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const existing = currentMarkers.get(vehicle.id);
        if (existing) {
          existing.setLatLng([loc.lat, loc.lng]);
          existing.setIcon(customIcon);
        } else {
          const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

          const popupContent = `
            <div style="font-family: var(--font-inter), system-ui, sans-serif; background: #0b1726; color: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 16px 36px rgba(0,0,0,0.8); min-width: 210px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 6px;">
                <strong style="font-family: var(--font-jetbrains-mono), monospace; font-size: 13px; font-weight: 800; color: #38bdf8; letter-spacing: 0.05em;">${vehicle.regNumber}</strong>
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${pinColor}; background: ${pinColor}22; padding: 2px 6px; border-radius: 4px; border: 1px solid ${pinColor}44;">${vehicle.maintenanceStatus}</span>
              </div>
              <div style="font-size: 11px; line-height: 1.6; color: #94a3b8;">
                <div style="display: flex; justify-content: space-between;"><strong style="color: #cbd5e1;">Pilot:</strong> <span style="color: #f8fafc;">${vehicle.assignedDriver || 'Standby'}</span></div>
                <div style="display: flex; justify-content: space-between;"><strong style="color: #cbd5e1;">Location:</strong> <span>${loc.city}</span></div>
                <div style="display: flex; justify-content: space-between;"><strong style="color: #cbd5e1;">Payload:</strong> <span style="font-family: monospace;">${vehicle.capacityTons}T (${vehicle.model})</span></div>
                <div style="display: flex; justify-content: space-between; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.06);"><strong style="color: #cbd5e1;">RC / Docs:</strong> <span style="color: ${vehicle.docStatus === 'Compliant' ? '#10b981' : '#f43f5e'}; font-weight: 700;">${vehicle.docStatus}</span></div>
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
  }, [vehicles, center, zoom, onSelectVehicle, selectedVehicleId]);

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
    <div className={`relative h-full min-h-[380px] w-full rounded-xl overflow-hidden bg-[#050b14] ${className}`}>
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ width: '100%', height: '100%', minHeight: '380px' }}
      />

      {/* Sweep Radar Overlay (Mission Control Radar) */}
      {radarSweepEnabled && (
        <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center overflow-hidden">
          {/* Radar Circles */}
          <div className="absolute w-[460px] h-[460px] rounded-full border border-cyan-500/20" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-cyan-500/15" />
          <div className="absolute w-[160px] h-[160px] rounded-full border border-cyan-500/10" />
          
          {/* Rotating Beam */}
          <div className="absolute w-[500px] h-[500px] rounded-full animate-radar origin-center">
            <div
              className="w-1/2 h-1/2 origin-bottom-right"
              style={{
                background: 'conic-gradient(from 180deg at 100% 100%, rgba(6, 182, 212, 0.28) 0deg, rgba(6, 182, 212, 0.05) 45deg, transparent 90deg)',
                borderRight: '1.5px solid rgba(6, 182, 212, 0.7)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
