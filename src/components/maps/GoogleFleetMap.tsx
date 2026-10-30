'use client';

import React, { useEffect, useRef, useState, Component, ErrorInfo, ReactNode } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { CORRIDOR_WAYPOINTS } from '@/lib/services/simulationService';
import { Vehicle } from '@/types';
import { Radio, AlertTriangle, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { OsmFleetFallback } from './OsmFleetFallback';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

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
  radarSweepEnabled?: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Map rendering caught by ErrorBoundary, switching to resilient fallback:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function GoogleFleetMap(props: GoogleFleetMapProps) {
  return (
    <MapErrorBoundary
      fallback={
        <OsmFleetFallback
          vehicles={props.vehicles}
          selectedVehicleId={props.selectedVehicleId}
          onSelectVehicle={props.onSelectVehicle}
          className={props.className}
          zoom={props.zoom}
          center={props.center}
          radarSweepEnabled={props.radarSweepEnabled}
        />
      }
    >
      <GoogleFleetMapInner {...props} />
    </MapErrorBoundary>
  );
}

function GoogleFleetMapInner({
  vehicles,
  selectedVehicleId = null,
  onSelectVehicle,
  className = '',
  zoom = 6,
  center = { lat: 19.2, lng: 74.5 },
  showCorridor = true,
  radarSweepEnabled = false
}: GoogleFleetMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersMapRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  const hasApiKey = Boolean(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.trim().length > 6);
  const [activeEngine, setActiveEngine] = useState<'google' | 'osm'>(hasApiKey ? 'google' : 'osm');
  const [loading, setLoading] = useState(hasApiKey);
  const [authFailed, setAuthFailed] = useState(!hasApiKey);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Global listener for Google Maps authentication failures
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gm_authFailure = () => {
        console.warn('Google Maps Authentication Notice: Maps JavaScript API is not active. Using OSM.');
        setAuthFailed(true);
        setActiveEngine('osm');
        setLoading(false);
      };
    }
  }, []);

  // 1. Initialize Google Maps with strict guards
  useEffect(() => {
    let isCancelled = false;
    if (activeEngine === 'osm') {
      return;
    }

    const setupMap = () => {
      try {
        if (isCancelled || !containerRef.current || !window.google?.maps?.Map) {
          return;
        }

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
        if (showCorridor && window.google?.maps?.Polyline) {
          const path = CORRIDOR_WAYPOINTS.map((pt) => ({ lat: pt.lat, lng: pt.lng }));
          const polyline = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: '#06b6d4',
            strokeOpacity: 0.85,
            strokeWeight: 3.5,
            map: mapInstance
          });
          polylineRef.current = polyline;
        }

        // Auto-fit bounds
        if (vehicles.length > 1 && !selectedVehicleId && window.google?.maps?.LatLngBounds) {
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
      } catch (err) {
        console.warn('Error setting up Google Maps, falling back to OSM:', err);
        if (!isCancelled) {
          setActiveEngine('osm');
          setLoading(false);
        }
      }
    };

    if (window.google?.maps?.Map) {
      setupMap();
    } else {
      try {
        setOptions({
          key: GOOGLE_MAPS_API_KEY,
          v: 'weekly'
        });

        Promise.all([
          importLibrary('maps'),
          importLibrary('places')
        ])
          .then(() => {
            setupMap();
          })
          .catch((err: unknown) => {
            if (!isCancelled) {
              console.warn('Google Maps Load Warning:', err);
              setLoadError(err instanceof Error ? err.message : 'SDK Unavailable');
              setAuthFailed(true);
              setActiveEngine('osm');
              setLoading(false);
            }
          });
      } catch {
        setTimeout(() => {
          setActiveEngine('osm');
          setLoading(false);
        }, 0);
      }
    }

    return () => {
      isCancelled = true;
      try {
        if (polylineRef.current) {
          polylineRef.current.setMap(null);
        }
        markersMapRef.current.forEach((marker) => marker.setMap(null));
        markersMapRef.current.clear();
      } catch {
        // Safe cleanup
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEngine]);

  // 2. Synchronize Vehicle Markers with Realtime Telemetry
  useEffect(() => {
    if (activeEngine !== 'google') return;
    const map = mapRef.current;
    if (!map || typeof window === 'undefined' || !window.google?.maps?.Marker) return;

    try {
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
                <div style="font-family: var(--font-inter), system-ui, sans-serif; background: #0b1726; color: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.12); min-width: 210px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 6px;">
                    <strong style="font-family: var(--font-jetbrains-mono), monospace; font-size: 13px; font-weight: 800; color: #38bdf8;">${vehicle.regNumber}</strong>
                    <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; ${statusBadgeClass}">${vehicle.maintenanceStatus}</span>
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
    } catch (err) {
      console.warn('Error during Google Maps marker update, falling back to OSM:', err);
      setTimeout(() => {
        setActiveEngine('osm');
      }, 0);
    }
  }, [vehicles, onSelectVehicle, activeEngine]);

  // 3. Pan to selected vehicle if changed
  useEffect(() => {
    if (activeEngine !== 'google') return;
    if (!selectedVehicleId || !mapRef.current) return;
    try {
      const target = vehicles.find((v) => v.id === selectedVehicleId);
      if (target?.lastKnownLocation) {
        mapRef.current.panTo({
          lat: target.lastKnownLocation.lat,
          lng: target.lastKnownLocation.lng
        });
        mapRef.current.setZoom(8);
      }
    } catch {
      // Safe guard
    }
  }, [selectedVehicleId, vehicles, activeEngine]);

  // If in OpenStreetMap fallback mode
  if (activeEngine === 'osm' || authFailed) {
    return (
      <div className={`relative h-full min-h-[380px] w-full bg-[#050b14] ${className}`}>
        {/* Optional Diagnostic Note for Developers */}
        {hasApiKey && authFailed && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 bg-amber-950/40 px-3.5 py-1.5 backdrop-blur-md text-[11px] text-amber-200">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>Google Maps JavaScript API inactive. Active radar auto-switched to High-Precision OpenStreetMap.</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:underline"
              >
                <span>Console</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setAuthFailed(false);
                  setActiveEngine('google');
                  setLoading(true);
                }}
                className="text-[10px] font-bold text-cyan-400 hover:underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Live Fallback Map: Standard OSM (Free, active, zero watermarks, zero API key) */}
        <OsmFleetFallback
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={onSelectVehicle}
          zoom={zoom}
          center={center}
          radarSweepEnabled={radarSweepEnabled}
        />
      </div>
    );
  }

  return (
    <div className={`relative h-full min-h-[380px] w-full bg-[#050b14] ${className}`}>
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#050b14]/90 text-text-muted">
          <Radio className="h-6 w-6 animate-pulse text-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-wider">
            Locking onto Highway Telemetry...
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ width: '100%', height: '100%', minHeight: '380px' }}
      />

      {/* Sweep Radar Overlay for Google Maps as well */}
      {radarSweepEnabled && (
        <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center overflow-hidden">
          <div className="absolute w-[460px] h-[460px] rounded-full border border-cyan-500/20" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-cyan-500/15" />
          <div className="absolute w-[160px] h-[160px] rounded-full border border-cyan-500/10" />
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
