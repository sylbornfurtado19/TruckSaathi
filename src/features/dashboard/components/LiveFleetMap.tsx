'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Truck, MapPin, Radio, Activity } from 'lucide-react';
import { Card, Badge } from '@/components/ui';

// Dynamically import Leaflet map to ensure SSR safety in Next.js App Router
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

interface FleetMapProps {
  vehicles: Array<{
    id: string;
    regNumber: string;
    category: string;
    make: string;
    model: string;
    assignedDriver?: string;
    maintenanceStatus: string;
  }>;
}

// Major Logistics Nodes across India
const INDIA_FLEET_COORDS = [
  { lat: 19.076, lng: 72.8777, name: 'Mumbai Hub (Bhiwandi)', reg: 'MH-12-Q-4521', status: 'En-Route to Delhi' },
  { lat: 12.9716, lng: 77.5946, name: 'Bengaluru Yard (Nelamangala)', reg: 'KA-01-EA-9011', status: 'Active Telemetry' },
  { lat: 23.0225, lng: 72.5714, name: 'Sanand Hub (Ahmedabad)', reg: 'GJ-06-ZZ-3342', status: 'Loading Cargo' },
  { lat: 28.4595, lng: 77.0266, name: 'NCR Logistics Hub (Gurugram)', reg: 'HR-55-AB-1290', status: 'Maintenance Service' },
  { lat: 13.0827, lng: 80.2707, name: 'Chennai Port Hub', reg: 'MH-04-JK-7810', status: 'Idle in Depot' }
];

export function LiveFleetMap({ vehicles }: FleetMapProps) {
  return (
    <Card glow="blue" className="p-0 overflow-hidden flex flex-col h-[380px] relative border-blue-500/20">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-[#090d16]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#202736] pointer-events-auto">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-100 tracking-tight">Live Fleet Command Telemetry</span>
          <Badge variant="success" pulse className="ml-1 text-[10px]">
            5 Nodes Online
          </Badge>
        </div>

        <div className="bg-[#090d16]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#202736] text-[11px] font-mono text-slate-400 pointer-events-auto flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>GPS Refresh: 2s</span>
        </div>
      </div>

      {/* Map Embed Layer */}
      <div className="w-full h-full z-0 relative">
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

          {INDIA_FLEET_COORDS.map((node, i) => (
            <Marker key={i} position={[node.lat, node.lng]}>
              <Popup className="dark-popup">
                <div className="p-2 text-xs bg-[#121824] text-slate-100 rounded space-y-1">
                  <div className="font-mono font-bold text-blue-400">{node.reg}</div>
                  <div className="font-semibold text-slate-200">{node.name}</div>
                  <div className="text-[11px] text-slate-400">{node.status}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Bottom Ticker */}
      <div className="bg-[#0c1019]/90 backdrop-blur-md px-4 py-2 border-t border-[#202736] z-10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Transit (3)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Depot Yard (1)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Maintenance (1)
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">Pan-India Transit Network</span>
      </div>
    </Card>
  );
}
