'use client';

import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { CORRIDOR_WAYPOINTS } from '@/lib/services/simulationService';
import { Vehicle } from '@/types';
import { Radio, AlertTriangle } from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao';

// Custom dark control-room theme for Google Maps
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0b111e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b111e' }, { weight: 3 }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e2e8f0' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#253549' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#141e2e' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#060b13' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0ea5e9' }]
  }
];

interface GoogleFleetMapProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string | null;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  className?: string;
  zoom?: number;
  center?: { lat: number; lng: number };
  showCorridor?: boolean;
}

export function GoogleFleetMap({
  vehicles,
  selectedVehicleId = null,
  onSelectVehicle,
  className = '',
  zoom = 6,
  center = { lat: 19.2, lng: 74.5 },
  showCorridor = true
}: GoogleFleetMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersMapRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 1. Initialize Google Maps once
  useEffect(() => {
    let isCancelled = false;

    try {
      setOptions({
        key: GOOGLE_MAPS_API_KEY,
        v: 'weekly'
      });
    } catch {
      // Options may have already been set
    }

    Promise.all([
      importLibrary('maps'),
      importLibrary('places')
    ])
      .then(() => {
        if (isCancelled || !containerRef.current || !window.google) return;

        const mapInstance = new window.google.maps.Map(containerRef.current, {
          center,
          zoom,
          styles: DARK_MAP_STYLE,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          backgroundColor: '#0b111e'
        });

        mapRef.current = mapInstance;
        infoWindowRef.current = new window.google.maps.InfoWindow();

        // Draw NH-48 Expressway corridor polyline
        if (showCorridor) {
          const path = CORRIDOR_WAYPOINTS.map((pt) => ({ lat: pt.lat, lng: pt.lng }));
          const polyline = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: '#06b6d4',
            strokeOpacity: 0.8,
            strokeWeight: 3.5,
            map: mapInstance
          });
          polylineRef.current = polyline;
        }

        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          console.error('Google Maps Load Error:', err);
          setLoadError(err instanceof Error ? err.message : 'Failed to load Google Maps SDK');
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
      markersMapRef.current.forEach((marker) => marker.setMap(null));
      markersMapRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Synchronize Vehicle Markers with Realtime Telemetry
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof window === 'undefined' || !window.google) return;

    const currentMarkers = markersMapRef.current;
    const activeVehicleIds = new Set(vehicles.map((v) => v.id));

    // Remove obsolete markers
    currentMarkers.forEach((marker, id) => {
      if (!activeVehicleIds.has(id)) {
        marker.setMap(null);
        currentMarkers.delete(id);
      }
    });

    // Add or update markers
    vehicles.forEach((vehicle) => {
      const loc = vehicle.lastKnownLocation || { lat: 19.076, lng: 72.8777, city: 'Base Hub' };
      const isCritical = vehicle.maintenanceStatus === 'Breakdown' || vehicle.docStatus === 'Expired';
      const isWarning = vehicle.maintenanceStatus === 'Scheduled Service' || vehicle.docStatus === 'Expiring Soon';

      const fillColor = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#10b981';
      const strokeColor = '#0b111e';

      // SVG Pin for high-DPI crystal-clear rendering
      const pinSvg = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 7.5,
        fillColor,
        fillOpacity: 1,
        strokeColor,
        strokeWeight: 2.5
      };

      const existingMarker = currentMarkers.get(vehicle.id);
      const position = new window.google.maps.LatLng(loc.lat, loc.lng);

      if (existingMarker) {
        // Animate position smoothly without recreating marker
        existingMarker.setPosition(position);
        existingMarker.setIcon(pinSvg);
      } else {
        const newMarker = new window.google.maps.Marker({
          position,
          map,
          title: `${vehicle.regNumber} (${vehicle.assignedDriver || 'Standby'})`,
          icon: pinSvg
        });

        newMarker.addListener('click', () => {
          onSelectVehicle?.(vehicle);

          if (infoWindowRef.current && map) {
            const statusBadgeClass =
              vehicle.maintenanceStatus === 'In Service'
                ? 'background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);'
                : vehicle.maintenanceStatus === 'Scheduled Service'
                ? 'background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);'
                : 'background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3);';

            const contentString = `
              <div style="font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #334155; min-width: 210px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
                  <strong style="font-family: monospace; font-size: 13px; color: #38bdf8;">${vehicle.regNumber}</strong>
                  <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; ${statusBadgeClass}">${vehicle.maintenanceStatus}</span>
                </div>
                <div style="font-size: 11px; line-height: 1.5; color: #cbd5e1;">
                  <div><strong>Pilot:</strong> ${vehicle.assignedDriver || 'Standby Pool'}</div>
                  <div><strong>Sector:</strong> ${loc.city}</div>
                  <div><strong>Payload:</strong> ${vehicle.capacityTons}T (${vehicle.model})</div>
                </div>
              </div>
            `;
            infoWindowRef.current.setContent(contentString);
            infoWindowRef.current.open(map, newMarker);
          }
        });

        currentMarkers.set(vehicle.id, newMarker);
      }
    });
  }, [vehicles, onSelectVehicle]);

  // 3. Pan to selected vehicle if changed
  useEffect(() => {
    if (!selectedVehicleId || !mapRef.current) return;
    const target = vehicles.find((v) => v.id === selectedVehicleId);
    if (target?.lastKnownLocation) {
      mapRef.current.panTo({
        lat: target.lastKnownLocation.lat,
        lng: target.lastKnownLocation.lng
      });
      mapRef.current.setZoom(8);
    }
  }, [selectedVehicleId, vehicles]);

  if (loadError) {
    return (
      <div className="flex h-[420px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-rose-500/30 bg-rose-950/20 p-6 text-center text-rose-300">
        <AlertTriangle className="h-8 w-8 text-rose-400" />
        <div>
          <h4 className="font-bold text-sm">Google Maps SDK Initialization</h4>
          <p className="text-xs text-rose-200/80 mt-1 max-w-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full min-h-[380px] w-full bg-[#0b111e] ${className}`}>
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#0b111e]/90 text-text-muted">
          <Radio className="h-6 w-6 animate-pulse text-cyan-400" />
          <span className="font-mono text-xs tracking-wider uppercase">
            Connecting Google Maps Satellite Grid...
          </span>
        </div>
      )}
      <div ref={containerRef} className="h-full min-h-[380px] w-full rounded-xl" />
    </div>
  );
}
