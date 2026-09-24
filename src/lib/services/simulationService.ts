'use client';

import { TelemetrySimulationState } from '@/types';

export interface HighwayWaypoint {
  lat: number;
  lng: number;
  city: string;
  checkpoint: string;
  nextMilestone: string;
  speed: number;
  progress: number;
  distanceRemainingKm: number;
  isToll?: boolean;
  tollName?: string;
  tollAmount?: number;
}

export const CORRIDOR_WAYPOINTS: HighwayWaypoint[] = [
  {
    lat: 19.2968,
    lng: 73.0630,
    city: 'Mumbai (Bhiwandi Hub)',
    checkpoint: 'Gate 4 Outbound Clearance',
    nextMilestone: 'Kalamboli Expressway Entry (28 km)',
    speed: 38,
    progress: 0,
    distanceRemainingKm: 148
  },
  {
    lat: 19.1982,
    lng: 73.0984,
    city: 'Kalyan Phata Junction',
    checkpoint: 'Shilphata Arterial Corridor',
    nextMilestone: 'Taloja Freight Link (14 km)',
    speed: 52,
    progress: 10,
    distanceRemainingKm: 133
  },
  {
    lat: 19.0522,
    lng: 73.0768,
    city: 'Taloja MIDC Bypass',
    checkpoint: 'Navi Mumbai Outer Ring',
    nextMilestone: 'Kalamboli Toll Plaza (8 km)',
    speed: 58,
    progress: 18,
    distanceRemainingKm: 121
  },
  {
    lat: 19.0180,
    lng: 73.1026,
    city: 'Kalamboli Expressway Zero-Point',
    checkpoint: 'FASTag Entry Barrier #03 (Valid)',
    nextMilestone: 'Rasayani Flyover (16 km)',
    speed: 68,
    progress: 25,
    distanceRemainingKm: 111,
    isToll: true,
    tollName: 'Kalamboli Toll Plaza',
    tollAmount: 430
  },
  {
    lat: 18.9102,
    lng: 73.1954,
    city: 'Rasayani Industrial Viaduct',
    checkpoint: 'NH-48 High-Speed Corridor',
    nextMilestone: 'Khalapur Main Toll Portal (18 km)',
    speed: 74,
    progress: 35,
    distanceRemainingKm: 96
  },
  {
    lat: 18.7905,
    lng: 73.2842,
    city: 'Khalapur Toll Plaza',
    checkpoint: 'FASTag Auto-Debit Portal #06 (₹430)',
    nextMilestone: 'Khopoli Foothills & Ghat Incline (9 km)',
    speed: 46,
    progress: 46,
    distanceRemainingKm: 80,
    isToll: true,
    tollName: 'Khalapur Expressway Plaza',
    tollAmount: 430
  },
  {
    lat: 18.7542,
    lng: 73.3421,
    city: 'Khopoli Foothills',
    checkpoint: 'Ghat Section Entrance • Speed Restricted',
    nextMilestone: 'Khandala Ghat Tunnel (6 km)',
    speed: 40,
    progress: 54,
    distanceRemainingKm: 68
  },
  {
    lat: 18.7495,
    lng: 73.3712,
    city: 'Khandala Ghat Pass',
    checkpoint: 'Batori Tunnel • ADAS Safe Following Active',
    nextMilestone: 'Lonavala Viaduct Overpass (5 km)',
    speed: 36,
    progress: 62,
    distanceRemainingKm: 56
  },
  {
    lat: 18.7557,
    lng: 73.4091,
    city: 'Lonavala Viaduct Overpass',
    checkpoint: 'Grade 4% Descent • Engine Braking Active',
    nextMilestone: 'Kamshet High-Speed Section (18 km)',
    speed: 42,
    progress: 70,
    distanceRemainingKm: 44
  },
  {
    lat: 18.7328,
    lng: 73.5412,
    city: 'Kamshet Lake Corridor',
    checkpoint: 'Expressway Plains Sector • Cruise 72 km/h',
    nextMilestone: 'Talegaon Dabhade Exit Plaza (16 km)',
    speed: 72,
    progress: 78,
    distanceRemainingKm: 32
  },
  {
    lat: 18.7231,
    lng: 73.6669,
    city: 'Talegaon Dabhade Toll Plaza',
    checkpoint: 'FASTag Exit Portal #02 (₹390)',
    nextMilestone: 'Dehu Road Expressway Junction (10 km)',
    speed: 48,
    progress: 86,
    distanceRemainingKm: 21,
    isToll: true,
    tollName: 'Talegaon Toll Plaza',
    tollAmount: 390
  },
  {
    lat: 18.7188,
    lng: 73.7428,
    city: 'Dehu Road Expressway Exit',
    checkpoint: 'Dehu Cantt Bypass • Entering Chakan Link',
    nextMilestone: 'Talawade Industrial Checkpost (7 km)',
    speed: 54,
    progress: 92,
    distanceRemainingKm: 12
  },
  {
    lat: 18.7392,
    lng: 73.7915,
    city: 'Talawade Industrial Spine',
    checkpoint: 'Chakan Arterial Road • Approaching Depot',
    nextMilestone: 'Chakan MIDC Phase 2 (5 km)',
    speed: 44,
    progress: 96,
    distanceRemainingKm: 6
  },
  {
    lat: 18.7588,
    lng: 73.8552,
    city: 'Pune (Chakan Industrial Complex)',
    checkpoint: 'Consignee Bay #04 Arrived • Awaiting POD',
    nextMilestone: 'Delivery Handover Complete',
    speed: 0,
    progress: 100,
    distanceRemainingKm: 0
  }
];

const STORAGE_KEY = 'trucksaathi_telemetry_sim_state_v1';
const BROADCAST_NAME = 'trucksaathi_telemetry_sim_channel_v1';

export const INITIAL_SIMULATION_STATE: TelemetrySimulationState = {
  isRunning: false,
  stepIndex: 0,
  speedKmh: 38,
  odometerKm: 42850,
  fuelPercent: 78.4,
  engineTempC: 84,
  engineRpm: 1520,
  currentCheckpoint: CORRIDOR_WAYPOINTS[0].checkpoint,
  nextMilestone: CORRIDOR_WAYPOINTS[0].nextMilestone,
  progressPercent: 0,
  distanceRemainingKm: 148,
  location: {
    lat: CORRIDOR_WAYPOINTS[0].lat,
    lng: CORRIDOR_WAYPOINTS[0].lng,
    city: CORRIDOR_WAYPOINTS[0].city
  },
  vehicleId: 'v-1',
  vehicleReg: 'MH-12-Q-4521',
  driverId: 'd-1',
  driverName: 'Ramesh Kumar',
  tripId: 'trp-1',
  tripCode: 'TRP-2026-0142',
  tripStatus: 'In Transit',
  sosActive: false,
  podUploaded: false,
  speedMultiplier: 1,
  lastEvent: {
    type: 'checkpoint',
    text: 'Outbound departure logged at Bhiwandi Logistics Hub, Gate 4.',
    timestamp: '14:20 PM'
  }
};

class SimulationManager {
  private state: TelemetrySimulationState;
  private timer: NodeJS.Timeout | null = null;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(state: TelemetrySimulationState) => void> = new Set();

  constructor() {
    this.state = this.loadState();

    if (typeof window !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(BROADCAST_NAME);
        this.channel.onmessage = (event) => {
          if (event.data && typeof event.data === 'object') {
            this.handleRemoteUpdate(event.data as TelemetrySimulationState);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported, falling back to storage events', e);
      }

      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            this.handleRemoteUpdate(parsed);
          } catch {
            // Ignore parse errors
          }
        }
      });

      // If state was running, resume timer in this tab
      if (this.state.isRunning) {
        this.startTimer();
      }
    }
  }

  private loadState(): TelemetrySimulationState {
    if (typeof window === 'undefined') return INITIAL_SIMULATION_STATE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...INITIAL_SIMULATION_STATE, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return INITIAL_SIMULATION_STATE;
  }

  private saveAndBroadcast(newState: TelemetrySimulationState) {
    this.state = newState;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        this.channel?.postMessage(newState);
      } catch {
        // Ignore
      }
    }
    this.notifyListeners();
  }

  private handleRemoteUpdate(remoteState: TelemetrySimulationState) {
    this.state = remoteState;
    if (this.state.isRunning && !this.timer) {
      this.startTimer();
    } else if (!this.state.isRunning && this.timer) {
      this.stopTimer();
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    const currentState = { ...this.state };
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('Simulation listener error:', err);
      }
    });
  }

  private startTimer() {
    this.stopTimer();
    const intervalMs = Math.max(800, Math.floor(2400 / (this.state.speedMultiplier || 1)));
    this.timer = setInterval(() => {
      this.tick();
    }, intervalMs);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private tick() {
    if (!this.state.isRunning) return;

    let nextIndex = this.state.stepIndex + 1;
    let isDelivered = false;

    if (nextIndex >= CORRIDOR_WAYPOINTS.length) {
      nextIndex = CORRIDOR_WAYPOINTS.length - 1;
      isDelivered = true;
    }

    const waypoint = CORRIDOR_WAYPOINTS[nextIndex];
    const isAtEnd = nextIndex === CORRIDOR_WAYPOINTS.length - 1;

    // Realistic fluctuating telemetry calculations
    const kmDelta = (this.state.distanceRemainingKm - waypoint.distanceRemainingKm) || 1.2;
    const newOdometer = Math.round((this.state.odometerKm + Math.max(0, kmDelta)) * 10) / 10;
    const newFuel = Math.max(20, Math.round((this.state.fuelPercent - 0.12) * 10) / 10);
    const newTemp = Math.floor(83 + Math.random() * 5);
    const newRpm = waypoint.speed > 0 ? Math.floor(1400 + (waypoint.speed / 80) * 450) : 750;

    let event: TelemetrySimulationState['lastEvent'] = undefined;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (waypoint.isToll) {
      event = {
        type: 'toll',
        text: `FASTag Auto-Debit: ₹${waypoint.tollAmount} processed at ${waypoint.tollName}.`,
        timestamp: nowTime
      };
    } else if (isAtEnd) {
      event = {
        type: 'checkpoint',
        text: `Destination reached at ${waypoint.city}. Consignee bay ready for electronic POD.`,
        timestamp: nowTime
      };
    } else {
      event = {
        type: 'checkpoint',
        text: `Corridor Milestone: Passing ${waypoint.checkpoint} at ${waypoint.speed} km/h.`,
        timestamp: nowTime
      };
    }

    const updated: TelemetrySimulationState = {
      ...this.state,
      stepIndex: nextIndex,
      isRunning: !isDelivered,
      speedKmh: waypoint.speed,
      odometerKm: newOdometer,
      fuelPercent: newFuel,
      engineTempC: newTemp,
      engineRpm: newRpm,
      currentCheckpoint: waypoint.checkpoint,
      nextMilestone: waypoint.nextMilestone,
      progressPercent: waypoint.progress,
      distanceRemainingKm: waypoint.distanceRemainingKm,
      location: {
        lat: waypoint.lat,
        lng: waypoint.lng,
        city: waypoint.city
      },
      tripStatus: isDelivered ? 'Delivered' : 'In Transit',
      lastEvent: event || this.state.lastEvent
    };

    if (isDelivered) {
      this.stopTimer();
    }

    this.saveAndBroadcast(updated);
  }

  /* Public API */

  public getState(): TelemetrySimulationState {
    return { ...this.state };
  }

  public subscribe(listener: (state: TelemetrySimulationState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public start(multiplier?: number): void {
    const updated: TelemetrySimulationState = {
      ...this.state,
      isRunning: true,
      speedMultiplier: multiplier || this.state.speedMultiplier || 1
    };
    this.saveAndBroadcast(updated);
    this.startTimer();
  }

  public pause(): void {
    this.stopTimer();
    const updated: TelemetrySimulationState = {
      ...this.state,
      isRunning: false
    };
    this.saveAndBroadcast(updated);
  }

  public reset(): void {
    this.stopTimer();
    const updated: TelemetrySimulationState = {
      ...INITIAL_SIMULATION_STATE,
      speedMultiplier: this.state.speedMultiplier || 1
    };
    this.saveAndBroadcast(updated);
  }

  public toggle(): void {
    if (this.state.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  public setSpeed(multiplier: number): void {
    const updated: TelemetrySimulationState = {
      ...this.state,
      speedMultiplier: multiplier
    };
    this.saveAndBroadcast(updated);
    if (this.state.isRunning) {
      this.startTimer();
    }
  }

  public triggerSOS(driverName?: string): void {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const updated: TelemetrySimulationState = {
      ...this.state,
      sosActive: true,
      lastEvent: {
        type: 'sos',
        text: `CRITICAL: Highway Emergency SOS triggered by ${driverName || this.state.driverName} at ${this.state.location.city}!`,
        timestamp: nowTime
      }
    };
    this.saveAndBroadcast(updated);
  }

  public clearSOS(): void {
    const updated: TelemetrySimulationState = {
      ...this.state,
      sosActive: false
    };
    this.saveAndBroadcast(updated);
  }

  public uploadPOD(notes?: string): void {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const updated: TelemetrySimulationState = {
      ...this.state,
      podUploaded: true,
      tripStatus: 'Delivered',
      speedKmh: 0,
      isRunning: false,
      lastEvent: {
        type: 'pod',
        text: `Electronic POD Uploaded: Handover verified. Consignee note: "${notes || 'LR copy stamped and signed.'}"`,
        timestamp: nowTime
      }
    };
    this.stopTimer();
    this.saveAndBroadcast(updated);
  }
}

// Global singleton instance
export const simulationService = new SimulationManager();
