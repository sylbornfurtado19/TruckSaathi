export interface Vehicle {
  id: string;
  regNumber: string;
  category: 'Container' | 'Open Body' | 'Trailer' | 'Refrigerated' | 'Tipper' | 'Tanker';
  make: string;
  model: string;
  capacityTons: number;
  assignedDriver?: string;
  assignedDriverId?: string;
  docStatus: 'Compliant' | 'Expiring Soon' | 'Expired';
  maintenanceStatus: 'In Service' | 'Scheduled Service' | 'Breakdown';
  chassisNumber: string;
  engineNumber: string;
  rcExpiry: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  lastKnownLocation?: {
    lat: number;
    lng: number;
    city: string;
  };
  componentHealth?: {
    brakes: number; // 0-100
    battery: number;
    engine: number;
    tyres: number;
    lastServiceDate: string;
    predictedNextServiceDate: string;
    predictedIssue?: string;
    predictionConfidence?: number; // 0-100
  };
}

export interface Driver {
  id: string;
  userId?: string | null;
  fullName: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  licenseCategory: 'HMV' | 'Trailer' | 'Hazardous Goods';
  licenseExpiry: string;
  experienceYears: number;
  assignedVehicle?: string;
  assignedVehicleReg?: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  verificationStatus: 'Fully Verified' | 'Pending Verification' | 'Expired License';
  aadhaarNumber: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  safetyScore?: number; // 0-100
  safetyEvents?: {
    overspeedCount: number;
    harshBrakingCount: number;
    rapidAccelCount: number;
    fatigueAlertCount: number;
    seatbeltViolationCount: number;
  };
}

export type UserRole =
  | 'Super Admin'
  | 'Company Admin'
  | 'Fleet Manager'
  | 'Dispatcher'
  | 'Driver';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Invited' | 'Suspended';
  lastActive: string;
  companyId?: string | null;
  driverId?: string | null;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  driverId?: string | null;
  companyId?: string | null;
  companyName: string;
  phone?: string;
  department?: string;
  status?: 'Active' | 'Invited' | 'Suspended';
  createdAt?: string;
}

export type CurrentUser = UserProfile;


export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  contactPerson: string;
  phone: string;
  capacity: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
}

export type TripStatus =
  | 'Scheduled'
  | 'Assigned'
  | 'Accepted'
  | 'In Transit'
  | 'Delayed'
  | 'Delivered'
  | 'Cancelled';

export interface Trip {
  id: string;
  companyId?: string;
  tripCode: string;
  vehicleId: string;
  vehicleReg: string;
  driverId: string;
  driverName: string;
  origin: { city: string; address: string; lat?: number; lng?: number };
  destination: { city: string; address: string; lat?: number; lng?: number };
  cargoDescription: string;
  cargoWeightTons: number;
  status: TripStatus;
  scheduledDeparture: string;
  scheduledArrival: string;
  actualDeparture?: string;
  actualArrival?: string;
  distanceKm: number;
  distanceRemainingKm?: number;
  progressPercent?: number;
  currentLocation?: { lat: number; lng: number; city: string };
  currentCheckpoint?: string;
  nextMilestone?: string;
  ewayBillNumber?: string;
  ewayBillExpiry?: string;
  tollSpendINR?: number;
  fuelSpendINR?: number;
  driverAdvanceINR?: number;
  freightRevenueINR?: number;
  podReceived: boolean;
  podNotes?: string;
  podImageUrl?: string;
  fuelEfficiencyKmpl?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  date: string;
  fuelLevelPercent: number; // 0-100
  fuelLiters: number;
  avgKmpl: number;
  lastRefuelStation: string;
  lastRefuelLiters: number;
  lastRefuelCostINR: number;
  theftAlert: boolean;
  theftDetails?: string;
}

export interface TripExpense {
  id: string;
  tripId: string;
  tripCode: string;
  vehicleReg: string;
  driverName: string;
  freightRevenue: number;
  fuelCost: number;
  tollCost: number;
  driverAllowance: number;
  otherExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
}

export interface TelemetrySimulationState {
  isRunning: boolean;
  stepIndex: number;
  speedKmh: number;
  odometerKm: number;
  fuelPercent: number;
  engineTempC: number;
  engineRpm: number;
  currentCheckpoint: string;
  nextMilestone: string;
  progressPercent: number;
  distanceRemainingKm: number;
  location: { lat: number; lng: number; city: string };
  vehicleId: string;
  vehicleReg: string;
  driverId: string;
  driverName: string;
  tripId: string;
  tripCode: string;
  tripStatus: 'In Transit' | 'Delivered';
  sosActive: boolean;
  podUploaded: boolean;
  speedMultiplier: number;
  lastEvent?: {
    type: 'checkpoint' | 'toll' | 'sos' | 'pod' | 'overspeed';
    text: string;
    timestamp: string;
  };
}

export interface VehicleLiveState {
  vehicleId: string;
  companyId: string;
  tripId?: string | null;
  driverId?: string | null;
  vehicleReg: string;
  driverName?: string | null;
  latitude: number;
  longitude: number;
  speedKmh: number;
  fuelPercent: number;
  engineTempC: number;
  engineRpm: number;
  odometerKm: number;
  progressPercent: number;
  distanceRemainingKm: number;
  currentCheckpoint: string;
  nextMilestone: string;
  isMoving: boolean;
  isSos: boolean;
  updatedAt: string;
}

export interface EmergencyEvent {
  id: string;
  companyId: string;
  driverId?: string | null;
  driverName?: string | null;
  vehicleId?: string | null;
  vehicleReg?: string | null;
  tripId?: string | null;
  tripCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationName: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  triggeredAt: string;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface Notification {
  id: string;
  companyId: string;
  recipientUserId?: string | null;
  recipientDriverId?: string | null;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface DriverPresence {
  driverId: string;
  companyId: string;
  userId: string;
  driverName: string;
  isOnline: boolean;
  currentVehicleReg?: string | null;
  lastSeenAt: string;
}

