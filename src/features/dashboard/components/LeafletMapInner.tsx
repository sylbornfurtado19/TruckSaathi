'use client';

import { GoogleFleetMap } from '@/components/maps/GoogleFleetMap';
import { Vehicle } from '@/types';

interface LeafletMapInnerProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string | null;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  className?: string;
  zoom?: number;
  center?: { lat: number; lng: number };
  showCorridor?: boolean;
}

/**
 * Replaced Carto/Leaflet with Google Maps with dark operations styling.
 * Maintained export compatibility for any legacy callers.
 */
export function LeafletMapInner(props: LeafletMapInnerProps) {
  return <GoogleFleetMap {...props} />;
}

export default LeafletMapInner;