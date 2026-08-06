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
  fullName: string;
  phone: string;
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

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Company Admin' | 'Fleet Manager' | 'Dispatcher';
  department: string;
  status: 'Active' | 'Invited' | 'Suspended';
  lastActive: string;
}

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

export interface Trip {
  id: string;
  tripCode: string;
  vehicleId: string;
  vehicleReg: string;
  driverId: string;
  driverName: string;
  origin: { city: string; address: string; lat: number; lng: number };
  destination: { city: string; address: string; lat: number; lng: number };
  cargoDescription: string;
  cargoWeightTons: number;
  status: 'Scheduled' | 'In Transit' | 'Delayed' | 'Delivered' | 'Cancelled';
  scheduledDeparture: string;
  scheduledArrival: string;
  actualDeparture?: string;
  actualArrival?: string;
  distanceKm: number;
  ewayBillNumber?: string;
  ewayBillExpiry?: string;
  tollSpendINR?: number;
  podReceived: boolean;
  podNotes?: string;
}
