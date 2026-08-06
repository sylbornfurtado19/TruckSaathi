import { Vehicle, Driver, User, Branch, ActivityLog } from '@/types';
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_USERS,
  INITIAL_BRANCHES,
  INITIAL_ACTIVITY_LOGS
} from '@/data/mockData';

class VehicleService {
  private vehicles: Vehicle[] = [...INITIAL_VEHICLES];

  async getVehicles(): Promise<Vehicle[]> {
    return this.vehicles;
  }

  async getVehicleById(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.find(v => v.id === id);
  }

  async createVehicle(data: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const newVehicle: Vehicle = {
      ...data,
      id: `v-${Date.now()}`
    };
    this.vehicles = [newVehicle, ...this.vehicles];
    return newVehicle;
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle | null> {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index === -1) return null;
    this.vehicles[index] = { ...this.vehicles[index], ...data };
    return this.vehicles[index];
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const prevLen = this.vehicles.length;
    this.vehicles = this.vehicles.filter(v => v.id !== id);
    return this.vehicles.length < prevLen;
  }
}

class DriverService {
  private drivers: Driver[] = [...INITIAL_DRIVERS];

  async getDrivers(): Promise<Driver[]> {
    return this.drivers;
  }

  async createDriver(data: Omit<Driver, 'id'>): Promise<Driver> {
    const newDriver: Driver = {
      ...data,
      id: `d-${Date.now()}`
    };
    this.drivers = [newDriver, ...this.drivers];
    return newDriver;
  }
}

class UserService {
  private users: User[] = [...INITIAL_USERS];

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      ...data,
      id: `u-${Date.now()}`
    };
    this.users = [newUser, ...this.users];
    return newUser;
  }
}

class CompanyService {
  private branches: Branch[] = [...INITIAL_BRANCHES];

  async getBranches(): Promise<Branch[]> {
    return this.branches;
  }

  async createBranch(data: Omit<Branch, 'id'>): Promise<Branch> {
    const newBranch: Branch = {
      ...data,
      id: `b-${Date.now()}`
    };
    this.branches = [newBranch, ...this.branches];
    return newBranch;
  }
}

export const vehicleService = new VehicleService();
export const driverService = new DriverService();
export const userService = new UserService();
export const companyService = new CompanyService();
