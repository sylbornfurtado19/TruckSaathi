'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import {
  Vehicle,
  Driver,
  User,
  Branch,
  ActivityLog,
  Trip,
  FuelLog,
  TripExpense,
  CurrentUser,
  TelemetrySimulationState,
  EmergencyEvent,
  VehicleLiveState
} from '../types';
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_USERS,
  INITIAL_BRANCHES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_TRIPS,
  INITIAL_FUEL_LOGS,
  INITIAL_EXPENSES
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { ensureUserProfile, fetchUserProfile } from '@/lib/services/profileService';
import { simulationService, INITIAL_SIMULATION_STATE } from '@/lib/services/simulationService';
import { tripService, mapDbTripToTrip } from '@/lib/services/tripService';
import { emergencyService, mapDbEmergencyToModel } from '@/lib/services/emergencyService';
import { telemetryService, mapDbLiveStateToModel } from '@/lib/services/telemetryService';
import { activityService } from '@/lib/services/activityService';

// Helper for unique IDs
const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

interface AppContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  users: User[];
  branches: Branch[];
  activityLogs: ActivityLog[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: TripExpense[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updated: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, updated: Partial<Driver>) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (id: string, updated: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  addFuelLog: (log: Omit<FuelLog, 'id'>) => void;

  // Real Supabase Operations
  assignTrip: (tripId: string, driverId: string, vehicleId: string) => Promise<{ success: boolean; error?: string }>;
  acceptTrip: (tripId: string) => Promise<{ success: boolean; error?: string }>;
  startTrip: (tripId: string) => Promise<{ success: boolean; error?: string }>;
  completeTripWithPOD: (tripId: string, notes?: string, imageUrl?: string) => Promise<{ success: boolean; error?: string }>;
  acknowledgeSOS: (emergencyId: string) => Promise<{ success: boolean; error?: string }>;

  currentUser: CurrentUser | null;
  currentDriver: Driver | null;
  session: Session | null;
  user: SupabaseUser | null;
  authLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  realtimeConnected: boolean;

  /* Live Transit Simulation across windows */
  simState: TelemetrySimulationState;
  activeEmergency: EmergencyEvent | null;
  startSimulation: (multiplier?: number) => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  toggleSimulation: () => void;
  setSimulationSpeed: (multiplier: number) => void;
  triggerSOS: (driverName?: string) => void;
  clearSOS: () => void;
  uploadSimulationPOD: (notes?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const existingContext = useContext(AppContext);
  if (existingContext) {
    return <>{children}</>;
  }

  return <AppProviderInner>{children}</AppProviderInner>;
};

const AppProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(INITIAL_FUEL_LOGS);
  const [expenses, setExpenses] = useState<TripExpense[]>(INITIAL_EXPENSES);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyEvent | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);

  // Live Simulation state synced via BroadcastChannel and Supabase Realtime
  const [simState, setSimState] = useState<TelemetrySimulationState>(INITIAL_SIMULATION_STATE);
  const lastEventRef = useRef<string | null>(null);

  // Real Supabase Auth & Application Profile State
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(() => isSupabaseConfigured());

  // Connect simulationService to AppContext
  useEffect(() => {
    const unsubscribe = simulationService.subscribe((newSimState) => {
      setSimState(newSimState);

      // Sync vehicle location in state
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === newSimState.vehicleId
            ? { ...v, lastKnownLocation: newSimState.location }
            : v
        )
      );

      // Sync trip status in state
      setTrips((prev) =>
        prev.map((t) =>
          t.id === newSimState.tripId
            ? {
                ...t,
                status: newSimState.tripStatus,
                podReceived: newSimState.podUploaded
              }
            : t
        )
      );

      // If new simulation event occurred, log it
      if (newSimState.lastEvent && newSimState.lastEvent.text !== lastEventRef.current) {
        lastEventRef.current = newSimState.lastEvent.text;
        const newLog: ActivityLog = {
          id: createId('act'),
          timestamp: newSimState.lastEvent.timestamp,
          user: newSimState.driverName,
          role: 'Driver Telemetry',
          action: newSimState.lastEvent.text,
          module: newSimState.lastEvent.type === 'sos' ? 'Safety Center' : 'Live Dispatch'
        };
        setActivityLogs((prev) => [newLog, ...prev.slice(0, 25)]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Architecture: Supabase Auth User -> TruckSaathi User Profile -> Driver Profile
  const currentDriver = useMemo<Driver | null>(() => {
    if (!currentUser || currentUser.role !== 'Driver') return null;

    if (currentUser.driverId) {
      const match = drivers.find((d) => d.id === currentUser.driverId);
      if (match) return match;
    }

    const matchByUserId = drivers.find((d) => d.userId && d.userId === currentUser.id);
    if (matchByUserId) return matchByUserId;

    if (currentUser.email) {
      const matchByEmail = drivers.find(
        (d) => d.email && d.email.toLowerCase() === currentUser.email?.toLowerCase()
      );
      if (matchByEmail) return matchByEmail;
    }

    if (currentUser.phone) {
      const matchByPhone = drivers.find((d) => d.phone && d.phone === currentUser.phone);
      if (matchByPhone) return matchByPhone;
    }

    return null;
  }, [currentUser, drivers]);

  // Sync session and profile strictly from Supabase
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured()) {
      return;
    }

    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession } }) => {
        if (!isMounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const profile = await ensureUserProfile(initialSession.user);
          if (isMounted) {
            setCurrentUser(profile);
          }
        } else {
          if (isMounted) {
            setCurrentUser(null);
          }
        }
        if (isMounted) setAuthLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to retrieve Supabase session:', err);
        if (isMounted) {
          setCurrentUser(null);
          setAuthLoading(false);
        }
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const profile = await ensureUserProfile(currentSession.user);
        if (isMounted) {
          setCurrentUser(profile);
        }
      } else {
        if (isMounted) {
          setCurrentUser(null);
        }
      }
      if (isMounted) setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch initial data from Supabase DB on startup
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;

    const loadBackendData = async () => {
      try {
        // Load Trips
        const dbTrips = await tripService.fetchTrips();
        if (isMounted && dbTrips.length > 0) {
          setTrips(dbTrips);
        }

        // Load Vehicles
        const { data: dbVehicles } = await supabase.from('vehicles').select('*');
        if (isMounted && dbVehicles && dbVehicles.length > 0) {
          const mappedVehicles: Vehicle[] = dbVehicles.map((row: Record<string, unknown>) => ({
            id: String(row.id || ''),
            regNumber: String(row.reg_number || 'Commercial Asset'),
            category: (row.category as Vehicle['category']) || 'Heavy Commercial Vehicle',
            make: String(row.make || 'Tata'),
            model: String(row.model || 'Prima'),
            capacityTons: Number(row.payload_capacity_tons || row.capacity_tons || 25),
            assignedDriver: row.assigned_driver_id ? 'Assigned' : 'Unassigned',
            assignedDriverId: (row.assigned_driver_id as string) || undefined,
            docStatus: (row.doc_status as Vehicle['docStatus']) || 'Compliant',
            maintenanceStatus:
              row.maintenance_status === 'scheduled_maintenance'
                ? 'Scheduled Service'
                : row.maintenance_status === 'breakdown'
                ? 'Breakdown'
                : 'In Service',
            chassisNumber: String(row.chassis_number || 'MAT-100200'),
            engineNumber: String(row.engine_number || 'ENG-100200'),
            rcExpiry: String(row.rc_expiry || '2028-12-31'),
            insuranceExpiry: String(row.insurance_expiry || '2027-06-30'),
            fitnessExpiry: String(row.fitness_expiry || '2028-04-15'),
            lastKnownLocation: (row.last_known_location as Vehicle['lastKnownLocation']) || { lat: 19.076, lng: 72.8777, city: 'Mumbai Hub' },
            componentHealth: (row.component_health as Vehicle['componentHealth']) || { brakes: 90, battery: 95, engine: 92, tyres: 88, lastServiceDate: '2026-06-15', predictedNextServiceDate: '2026-12-15' }
          }));
          setVehicles(mappedVehicles);
        }

        // Load Drivers
        const { data: dbDrivers } = await supabase.from('drivers').select('*');
        if (isMounted && dbDrivers && dbDrivers.length > 0) {
          const mappedDrivers: Driver[] = dbDrivers.map((row: Record<string, unknown>) => ({
            id: String(row.id || ''),
            userId: (row.user_id as string) || undefined,
            fullName: String(row.full_name || 'Driver'),
            phone: String(row.phone || '+91 98000 00000'),
            licenseNumber: String(row.license_number || 'DL-MH-2022-001'),
            licenseCategory: (row.license_category as Driver['licenseCategory']) || 'HMV',
            licenseExpiry: String(row.license_expiry || '2029-10-30'),
            experienceYears: Number(row.experience_years || 5),
            assignedVehicle: (row.assigned_vehicle as string) || 'Unassigned',
            status: row.status === 'on_leave' ? 'On Leave' : row.status === 'terminated' ? 'Terminated' : 'Active',
            verificationStatus: (row.verification_status as Driver['verificationStatus']) || 'Fully Verified',
            aadhaarNumber: String(row.aadhaar_number || '9000 0000 0000'),
            emergencyContact: (row.emergency_contact as Driver['emergencyContact']) || { name: 'Family Contact', phone: '+91 98000 00000', relation: 'Spouse' },
            safetyScore: Number(row.safety_score || 92)
          }));
          setDrivers(mappedDrivers);
        }

        // Load Active Emergencies
        const emergencies = await emergencyService.fetchActiveEmergencyEvents();
        if (isMounted && emergencies.length > 0) {
          setActiveEmergency(emergencies[0]);
        }

        // Load Activity Logs
        const logs = await activityService.fetchActivityLogs();
        if (isMounted && logs.length > 0) {
          setActivityLogs(logs);
        }
      } catch (err) {
        console.warn('AppContext initial fetch error:', err);
      }
    };

    loadBackendData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Bind driver's active trip to simulationService when driver logs in
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Driver') return;

    const driverTrip = trips.find(
      (t) =>
        (t.driverId === currentDriver?.id || t.driverName === currentDriver?.fullName) &&
        (t.status === 'In Transit' || t.status === 'Accepted' || t.status === 'Assigned')
    );

    if (driverTrip) {
      simulationService.bindActiveTrip(driverTrip);
    }
  }, [currentUser, currentDriver, trips]);

  // =========================================================================
  // SUPABASE REALTIME SUBSCRIPTION (CROSS-PORTAL REAL-TIME SYNCHRONIZATION)
  // =========================================================================
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const realtimeChannel = supabase
      .channel('trucksaathi-global-fleet-sync')
      // 1. Trips Synchronization (Assignments, Accept, Start, Deliver)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trips' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTrip = mapDbTripToTrip(payload.new);
            setTrips((prev) => {
              if (prev.some((t) => t.id === newTrip.id)) return prev;
              return [newTrip, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDbTripToTrip(payload.new);
            setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

            // If active trip was updated, sync simulation state
            if (updated.id === simulationService.getState().tripId) {
              if (updated.status === 'Delivered') {
                simulationService.pause();
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setTrips((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      // 2. Vehicle Live Telemetry Synchronization
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicle_live_state' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const live = mapDbLiveStateToModel(payload.new);

            // Update vehicle coordinates in fleet map
            setVehicles((prev) =>
              prev.map((v) =>
                v.id === live.vehicleId
                  ? {
                      ...v,
                      lastKnownLocation: {
                        lat: live.latitude,
                        lng: live.longitude,
                        city: live.currentCheckpoint
                      }
                    }
                  : v
              )
            );

            // Sync into simulation state if this unit is simulated
            if (live.vehicleId === simulationService.getState().vehicleId) {
              simulationService.syncFromRemoteLiveState(live);
            }
          }
        }
      )
      // 3. Emergency SOS Events
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emergency_events' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const ev = mapDbEmergencyToModel(payload.new);
            setActiveEmergency(ev);
            setSimState((prev) => ({ ...prev, sosActive: true }));
          } else if (payload.eventType === 'UPDATE') {
            const ev = mapDbEmergencyToModel(payload.new);
            if (ev.status === 'RESOLVED') {
              setActiveEmergency(null);
              setSimState((prev) => ({ ...prev, sosActive: false }));
            } else {
              setActiveEmergency(ev);
            }
          }
        }
      )
      // 4. Activity Logs
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload) => {
          const row = payload.new;
          const newLog: ActivityLog = {
            id: row.id,
            timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user: row.metadata?.driver_name || 'System',
            role: row.module || 'Fleet Operations',
            action: row.action,
            module: row.module
          };
          setActivityLogs((prev) => [newLog, ...prev.slice(0, 25)]);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(realtimeChannel);
      setRealtimeConnected(false);
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchUserProfile(user.id);
    if (profile) {
      setCurrentUser(profile);
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error during signOut:', err);
    } finally {
      setSession(null);
      setUser(null);
      setCurrentUser(null);
    }
  };

  // Real Database Actions
  const assignTrip = async (tripId: string, driverId: string, vehicleId: string) => {
    const res = await tripService.assignTrip(tripId, driverId, vehicleId);
    if (res.success && res.trip) {
      setTrips((prev) => prev.map((t) => (t.id === tripId ? res.trip! : t)));
    }
    return res;
  };

  const acceptTrip = async (tripId: string) => {
    const res = await tripService.acceptTrip(tripId);
    if (res.success && res.trip) {
      setTrips((prev) => prev.map((t) => (t.id === tripId ? res.trip! : t)));
    }
    return res;
  };

  const startTrip = async (tripId: string) => {
    const res = await tripService.startTrip(tripId);
    if (res.success && res.trip) {
      setTrips((prev) => prev.map((t) => (t.id === tripId ? res.trip! : t)));
      simulationService.start();
    }
    return res;
  };

  const completeTripWithPOD = async (tripId: string, notes?: string, imageUrl?: string) => {
    const res = await tripService.completeTripWithPOD(tripId, notes, imageUrl);
    if (res.success && res.trip) {
      setTrips((prev) => prev.map((t) => (t.id === tripId ? res.trip! : t)));
      simulationService.uploadPOD(notes);
    }
    return res;
  };

  const acknowledgeSOS = async (emergencyId: string) => {
    const res = await emergencyService.acknowledgeSOS(emergencyId);
    if (res.success) {
      setActiveEmergency((prev) => (prev?.id === emergencyId ? { ...prev, status: 'ACKNOWLEDGED' } : prev));
    }
    return res;
  };

  // Local helper mutations
  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = { ...vehicleData, id: createId('v') };
    setVehicles((prev) => [newVehicle, ...prev]);
  };

  const updateVehicle = (id: string, updated: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const addDriver = (driverData: Omit<Driver, 'id'>) => {
    const newDriver: Driver = { ...driverData, id: createId('d') };
    setDrivers((prev) => [newDriver, ...prev]);
  };

  const updateDriver = (id: string, updated: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: createId('u') };
    setUsers((prev) => [newUser, ...prev]);
  };

  const addBranch = (branchData: Omit<Branch, 'id'>) => {
    const newBranch: Branch = { ...branchData, id: createId('b') };
    setBranches((prev) => [newBranch, ...prev]);
  };

  const addTrip = async (tripData: Omit<Trip, 'id'>) => {
    const res = await tripService.createTrip(tripData);
    if (res.success && res.trip) {
      setTrips((prev) => [res.trip!, ...prev]);
    } else {
      const newTrip: Trip = { ...tripData, id: createId('trp') };
      setTrips((prev) => [newTrip, ...prev]);
    }
  };

  const updateTrip = (id: string, updated: Partial<Trip>) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const addFuelLog = (logData: Omit<FuelLog, 'id'>) => {
    const newLog: FuelLog = { ...logData, id: createId('fl') };
    setFuelLogs((prev) => [newLog, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        vehicles,
        drivers,
        users,
        branches,
        activityLogs,
        trips,
        fuelLogs,
        expenses,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        addUser,
        addBranch,
        addTrip,
        updateTrip,
        deleteTrip,
        addFuelLog,

        // Real Database Operations
        assignTrip,
        acceptTrip,
        startTrip,
        completeTripWithPOD,
        acknowledgeSOS,

        currentUser,
        currentDriver,
        session,
        user,
        authLoading,
        signOut,
        refreshProfile,
        realtimeConnected,

        // Simulation
        simState,
        activeEmergency,
        startSimulation: (m) => simulationService.start(m),
        pauseSimulation: () => simulationService.pause(),
        resetSimulation: () => simulationService.reset(),
        toggleSimulation: () => simulationService.toggle(),
        setSimulationSpeed: (m) => simulationService.setSpeed(m),
        triggerSOS: (name) => simulationService.triggerSOS(name),
        clearSOS: () => simulationService.clearSOS(),
        uploadSimulationPOD: (notes) => simulationService.uploadPOD(notes)
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
