'use client';

import React, { createContext, useContext, useState } from 'react';
import { Vehicle, Driver, User, Branch, ActivityLog, Trip, FuelLog, TripExpense } from '../types';
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
  currentUser: {
    name: string;
    email: string;
    role: string;
    companyName: string;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(INITIAL_FUEL_LOGS);
  const [expenses, setExpenses] = useState<TripExpense[]>(INITIAL_EXPENSES);

  const currentUser = {
    name: 'Sylborn Furtado',
    email: 'sylborn@trucksaathi.in',
    role: 'Company Admin',
    companyName: 'Mahindra Logistics India'
  };

  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `v-${Date.now()}`
    };
    setVehicles(prev => [newVehicle, ...prev]);
    logActivity(`Registered new vehicle ${newVehicle.regNumber}`, 'Vehicle Management');
  };

  const updateVehicle = (id: string, updated: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, ...updated } : v)));
    logActivity(`Updated details for vehicle ${id}`, 'Vehicle Management');
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    logActivity(`Removed vehicle record ${id}`, 'Vehicle Management');
  };

  const addDriver = (driverData: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...driverData,
      id: `d-${Date.now()}`
    };
    setDrivers(prev => [newDriver, ...prev]);
    logActivity(`Onboarded new driver ${newDriver.fullName}`, 'Driver Management');
  };

  const updateDriver = (id: string, updated: Partial<Driver>) => {
    setDrivers(prev => prev.map(d => (d.id === id ? { ...d, ...updated } : d)));
    logActivity(`Updated profile for driver ${id}`, 'Driver Management');
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`
    };
    setUsers(prev => [newUser, ...prev]);
    logActivity(`Invited user ${newUser.email} as ${newUser.role}`, 'User Management');
  };

  const addBranch = (branchData: Omit<Branch, 'id'>) => {
    const newBranch: Branch = {
      ...branchData,
      id: `b-${Date.now()}`
    };
    setBranches(prev => [newBranch, ...prev]);
    logActivity(`Added branch depot ${newBranch.name}`, 'Company Management');
  };

  const addTrip = (tripData: Omit<Trip, 'id'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: `trp-${Date.now()}`
    };
    setTrips(prev => [newTrip, ...prev]);
    logActivity(`Dispatched new trip ${newTrip.tripCode} (${newTrip.origin.city} → ${newTrip.destination.city})`, 'Trip Management');
  };

  const updateTrip = (id: string, updated: Partial<Trip>) => {
    setTrips(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
    logActivity(`Updated trip ${id}`, 'Trip Management');
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    logActivity(`Cancelled trip ${id}`, 'Trip Management');
  };

  const addFuelLog = (log: Omit<FuelLog, 'id'>) => {
    const newLog: FuelLog = { ...log, id: `fl-${Date.now()}` };
    setFuelLogs(prev => [newLog, ...prev]);
    logActivity(`Added fuel refuel log for vehicle ${log.vehicleReg}`, 'Fuel Telemetry');
  };

  const logActivity = (action: string, module: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      user: currentUser.name,
      role: currentUser.role,
      action,
      module,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setActivityLogs(prev => [newLog, ...prev]);
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
        currentUser
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
