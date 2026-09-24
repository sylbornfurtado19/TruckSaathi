'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  TelemetrySimulationState
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

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

// Offline fallback for prototype mode
export const DEMO_FALLBACK_USER: CurrentUser = {
  id: 'u-1',
  userId: 'u-1',
  name: 'Sylborn Furtado',
  email: 'sylborn@trucksaathi.in',
  role: 'Company Admin',
  companyId: null,
  companyName: 'Mahindra Logistics India'
};

export const DEMO_DRIVER_USER: CurrentUser = {
  id: 'u-5',
  userId: 'u-5',
  name: 'Ramesh Kumar',
  email: 'ramesh.k@trucksaathi.in',
  role: 'Driver',
  companyId: null,
  companyName: 'Mahindra Logistics India',
  driverId: 'd-1',
  phone: '+91 98765 43210'
};

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
  currentUser: CurrentUser | null;
  currentDriver: Driver | null;
  session: Session | null;
  user: SupabaseUser | null;
  authLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  /* Live Transit Simulation across windows */
  simState: TelemetrySimulationState;
  startSimulation: (multiplier?: number) => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  toggleSimulation: () => void;
  setSimulationSpeed: (multiplier: number) => void;
  triggerSOS: (driverName?: string) => void;
  clearSOS: () => void;
  uploadSimulationPOD: (notes?: string) => void;
  loginAsDemoRole: (role: 'Fleet Manager' | 'Driver', driverId?: string) => void;
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

  // Live Simulation state synced via BroadcastChannel
  const [simState, setSimState] = useState<TelemetrySimulationState>(INITIAL_SIMULATION_STATE);
  const lastEventRef = useRef<string | null>(null);

  // Real Supabase Auth & Application Profile State
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    if (typeof window !== 'undefined') {
      const storedRole = sessionStorage.getItem('trucksaathi_demo_role');
      if (storedRole === 'Driver') return DEMO_DRIVER_USER;
      if (storedRole === 'Manager') return DEMO_FALLBACK_USER;
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);

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

      // If new simulation event occurred, log it to activity feed
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
        setActivityLogs((prev) => [newLog, ...prev.slice(0, 20)]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Architecture: Supabase Auth User -> TruckSaathi User Profile -> Driver Profile
  const currentDriver = React.useMemo<Driver | null>(() => {
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

  // Sync session and profile from Supabase
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured()) {
      if (typeof window !== 'undefined') {
        const storedRole = sessionStorage.getItem('trucksaathi_demo_role');
        if (storedRole === 'Driver') {
          setCurrentUser(DEMO_DRIVER_USER);
        } else {
          setCurrentUser(DEMO_FALLBACK_USER);
        }
      } else {
        setCurrentUser(DEMO_FALLBACK_USER);
      }
      setAuthLoading(false);
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
            const storedRole = sessionStorage.getItem('trucksaathi_demo_role');
            if (storedRole === 'Driver') {
              setCurrentUser(DEMO_DRIVER_USER);
            } else if (storedRole === 'Manager') {
              setCurrentUser(DEMO_FALLBACK_USER);
            } else {
              setCurrentUser(null);
            }
          }
        }
        if (isMounted) setAuthLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to retrieve Supabase session:', err);
        if (isMounted) setAuthLoading(false);
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
          const storedRole = sessionStorage.getItem('trucksaathi_demo_role');
          if (storedRole === 'Driver') {
            setCurrentUser(DEMO_DRIVER_USER);
          } else if (storedRole === 'Manager') {
            setCurrentUser(DEMO_FALLBACK_USER);
          } else {
            setCurrentUser(null);
          }
        }
      }
      if (isMounted) setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
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
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('trucksaathi_demo_role');
      }
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

  const loginAsDemoRole = (role: 'Fleet Manager' | 'Driver', driverId?: string) => {
    if (typeof window !== 'undefined') {
      if (role === 'Driver') {
        sessionStorage.setItem('trucksaathi_demo_role', 'Driver');
        const driverUser = driverId
          ? { ...DEMO_DRIVER_USER, driverId }
          : DEMO_DRIVER_USER;
        setCurrentUser(driverUser);
      } else {
        sessionStorage.setItem('trucksaathi_demo_role', 'Manager');
        setCurrentUser(DEMO_FALLBACK_USER);
      }
    }
  };

  const logActivity = (action: string, module: string) => {
    const newLog: ActivityLog = {
      id: createId('act'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: currentUser?.name || 'System Operator',
      role: currentUser?.role || 'Admin',
      action,
      module
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: createId('v')
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    logActivity(`Registered new vehicle ${newVehicle.regNumber}`, 'Vehicle Management');
  };

  const updateVehicle = (id: string, updated: Partial<Vehicle>) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
    logActivity(`Updated details for vehicle ${id}`, 'Vehicle Management');
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    logActivity(`Removed vehicle record ${id}`, 'Vehicle Management');
  };

  const addDriver = (driverData: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...driverData,
      id: createId('d')
    };
    setDrivers((prev) => [newDriver, ...prev]);
    logActivity(`Onboarded new driver ${newDriver.fullName}`, 'Driver Management');
  };

  const updateDriver = (id: string, updated: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
    logActivity(`Updated profile for driver ${id}`, 'Driver Management');
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: createId('u')
    };
    setUsers((prev) => [newUser, ...prev]);
    logActivity(`Invited user ${newUser.email} as ${newUser.role}`, 'User Management');
  };

  const addBranch = (branchData: Omit<Branch, 'id'>) => {
    const newBranch: Branch = {
      ...branchData,
      id: createId('b')
    };
    setBranches((prev) => [newBranch, ...prev]);
    logActivity(`Created branch ${newBranch.name}`, 'Company Profile');
  };

  const addTrip = (tripData: Omit<Trip, 'id'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: createId('trp')
    };
    setTrips((prev) => [newTrip, ...prev]);
    logActivity(`Dispatched trip ${newTrip.tripCode} to ${newTrip.destination.city}`, 'Trip Dispatch');
  };

  const updateTrip = (id: string, updated: Partial<Trip>) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    logActivity(`Updated status for trip ${id}`, 'Trip Dispatch');
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    logActivity(`Cancelled trip record ${id}`, 'Trip Dispatch');
  };

  const addFuelLog = (logData: Omit<FuelLog, 'id'>) => {
    const newLog: FuelLog = {
      ...logData,
      id: createId('fl')
    };
    setFuelLogs((prev) => [newLog, ...prev]);
    logActivity(`Recorded refuel entry for ${newLog.vehicleReg}`, 'Fuel Monitoring');
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
        currentUser,
        currentDriver,
        session,
        user,
        authLoading,
        signOut,
        refreshProfile,

        // Simulation
        simState,
        startSimulation: (m) => simulationService.start(m),
        pauseSimulation: () => simulationService.pause(),
        resetSimulation: () => simulationService.reset(),
        toggleSimulation: () => simulationService.toggle(),
        setSimulationSpeed: (m) => simulationService.setSpeed(m),
        triggerSOS: (name) => simulationService.triggerSOS(name),
        clearSOS: () => simulationService.clearSOS(),
        uploadSimulationPOD: (notes) => simulationService.uploadPOD(notes),
        loginAsDemoRole
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
