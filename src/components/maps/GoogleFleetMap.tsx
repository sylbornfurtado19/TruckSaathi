'use client';

import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { CORRIDOR_WAYPOINTS } from '@/lib/services/simulationService';
import { Vehicle } from '@/types';
import { Radio, AlertTriangle, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';
import { OsmFleetFallback } from './OsmFleetFallback';

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
  const [authFailed, setAuthFailed] = useState(false);
  const [activeEngine, setActiveEngine] = useState<'google' | 'osm'>('google');
  const [loadError, setLoadError] = useState<string | null>(null);

  // Global listener for Google Maps authentication failures (e.g. ApiNotActivatedMapError)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gm_authFailure = () => {
        console.warn('Google Maps Authentication Notice: Maps JavaScript API is not activated for this API key.');
        setAuthFailed(true);
        setActiveEngine('osm');
        setLoading(false);
      };
    }
  }, []);

  // 1. Initialize Google Maps
  useEffect(() => {
    let isCancelled = false;
    if (activeEngine === 'osm') return;

    const setupMap = () => {
      if (isCancelled || !containerRef.current || !window.google?.maps) return;

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

      // Auto-fit bounds to show all active vehicles on map
      if (vehicles.length > 1 && !selectedVehicleId) {
        const bounds = new window.google.maps.LatLngBounds();
        let validPoints = 0;
        vehicles.forEach((v) => {
          if (v.lastKnownLocation) {
            bounds.extend(new window.google.maps.LatLng(v.lastKnownLocation.lat, v.lastKnownLocation.lng));
            validPoints++;
          }
        });
        if (validPoints > 1) {
          mapInstance.fitBounds(bounds, 40);
        }
      }

      setLoading(false);
    };

    if (window.google?.maps) {
      setupMap();
    } else {
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
          setupMap();
        })
        .catch((err: unknown) => {
          if (!isCancelled) {
            console.error('Google Maps Load Error:', err);
            setLoadError(err instanceof Error ? err.message : 'Failed to load Google Maps SDK');
            setAuthFailed(true);
            setActiveEngine('osm');
            setLoading(false);
          }
        });
    }

    return () => {
      isCancelled = true;
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
      markersMapRef.current.forEach((marker) => marker.setMap(null));
      markersMapRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEngine]);

  // 2. Synchronize Vehicle Markers with Realtime Telemetry
  useEffect(() => {
    if (activeEngine !== 'google') return;
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
  }, [vehicles, onSelectVehicle, activeEngine]);

  // 3. Pan to selected vehicle if changed
  useEffect(() => {
    if (activeEngine !== 'google') return;
    if (!selectedVehicleId || !mapRef.current) return;
    const target = vehicles.find((v) => v.id === selectedVehicleId);
    if (target?.lastKnownLocation) {
      mapRef.current.panTo({
        lat: target.lastKnownLocation.lat,
        lng: target.lastKnownLocation.lng
      });
      mapRef.current.setZoom(8);
    }
  }, [selectedVehicleId, vehicles, activeEngine]);

  // If in OpenStreetMap fallback mode (due to ApiNotActivated or manual toggle)
  if (activeEngine === 'osm' || authFailed) {
    return (
      <div className={`relative h-full min-h-[380px] w-full bg-[#0b111e] ${className}`}>
        {/* Diagnostic Banner explaining Google Cloud activation */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 bg-amber-950/40 px-3.5 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              <strong>Google Maps Activation Required:</strong> {loadError ? `${loadError}. ` : ''}Enable &quot;Maps JavaScript API&quot; in Google Cloud Console for key <code className="bg-black/50 px-1 py-0.5 rounded font-mono text-[10px] text-amber-300">AIzaSy...Lao</code>.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded bg-amber-500 hover:bg-amber-400 text-black px-2.5 py-1 font-bold text-[11px] transition shadow-xs"
            >
              <ExternalLink className="h-3 w-3" />
              Enable API (1-Click)
            </a>
            <button
              type="button"
              onClick={() => {
                setAuthFailed(false);
                setActiveEngine('google');
                setLoading(true);
              }}
              className="inline-flex items-center gap-1 rounded border border-border bg-surface-muted hover:bg-surface px-2.5 py-1 text-[11px] font-medium text-text-primary transition"
            >
              <RefreshCw className="h-3 w-3 text-cyan-400" />
              Retry Google Maps
            </button>
          </div>
        </div>

        {/* Live Fallback Map: Standard OSM (Free, active, zero watermarks, zero API key) */}
        <OsmFleetFallback
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={onSelectVehicle}
          zoom={zoom}
          center={center}
        />
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

      {/* Engine Switcher bar */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 rounded-lg border border-border/80 bg-canvas/90 px-2 py-1 shadow-lg backdrop-blur-md text-[11px]">
        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
          <CheckCircle2 className="h-3 w-3" />
          Google Maps
        </span>
        <button
          type="button"
          onClick={() => setActiveEngine('osm')}
          className="text-text-muted hover:text-text-primary text-[10px] underline ml-1"
        >
          OSM Mode
        </button>
      </div>

      <div
        ref={containerRef}
        className="h-full min-h-[380px] w-full rounded-xl overflow-hidden"
        style={{ width: '100%', height: '100%', minHeight: '380px' }}
      />
    </div>
  );
}
