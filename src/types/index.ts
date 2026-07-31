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
  user: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
}
