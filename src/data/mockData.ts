import { Vehicle, Driver, User, Branch, ActivityLog } from '../types';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v-1',
    regNumber: 'MH-12-Q-4521',
    category: 'Container',
    make: 'Tata Motors',
    model: 'Signa 4825.T',
    capacityTons: 30,
    assignedDriver: 'Ramesh Kumar',
    assignedDriverId: 'd-1',
    docStatus: 'Compliant',
    maintenanceStatus: 'In Service',
    chassisNumber: 'MAT628045M1290381',
    engineNumber: 'ENG89021349',
    rcExpiry: '2027-08-15',
    insuranceExpiry: '2026-11-20',
    fitnessExpiry: '2026-12-10',
    lastKnownLocation: { lat: 19.0760, lng: 72.8777, city: 'Mumbai (Bhiwandi Hub)' }
  },
  {
    id: 'v-2',
    regNumber: 'KA-01-EA-9011',
    category: 'Trailer',
    make: 'Ashok Leyland',
    model: 'AVTR 5525',
    capacityTons: 35,
    assignedDriver: 'Suresh Patil',
    assignedDriverId: 'd-2',
    docStatus: 'Expiring Soon',
    maintenanceStatus: 'In Service',
    chassisNumber: 'MB1354098K0912441',
    engineNumber: 'ENG44120931',
    rcExpiry: '2026-08-10',
    insuranceExpiry: '2026-08-05',
    fitnessExpiry: '2027-01-14',
    lastKnownLocation: { lat: 12.9716, lng: 77.5946, city: 'Bengaluru (Nelamangala Yard)' }
  },
  {
    id: 'v-3',
    regNumber: 'GJ-06-ZZ-3342',
    category: 'Open Body',
    make: 'Eicher',
    model: 'Pro 6028',
    capacityTons: 20,
    assignedDriver: 'Vikram Singh',
    assignedDriverId: 'd-3',
    docStatus: 'Compliant',
    maintenanceStatus: 'Scheduled Service',
    chassisNumber: 'ME1908234L0912384',
    engineNumber: 'ENG10239412',
    rcExpiry: '2028-03-30',
    insuranceExpiry: '2027-02-18',
    fitnessExpiry: '2026-10-05',
    lastKnownLocation: { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad (Sanand Hub)' }
  },
  {
    id: 'v-4',
    regNumber: 'HR-55-AB-1290',
    category: 'Refrigerated',
    make: 'BharatBenz',
    model: '2823R',
    capacityTons: 18,
    assignedDriver: 'Unassigned',
    docStatus: 'Expired',
    maintenanceStatus: 'Breakdown',
    chassisNumber: 'MBL902341M0981234',
    engineNumber: 'ENG90123845',
    rcExpiry: '2026-06-01',
    insuranceExpiry: '2026-05-15',
    fitnessExpiry: '2026-07-10',
    lastKnownLocation: { lat: 28.4595, lng: 77.0266, city: 'Gurugram (NCR Hub)' }
  },
  {
    id: 'v-5',
    regNumber: 'MH-04-JK-7810',
    category: 'Tanker',
    make: 'Tata Motors',
    model: 'Prima 3530.K',
    capacityTons: 25,
    assignedDriver: 'Mahesh Sharma',
    assignedDriverId: 'd-4',
    docStatus: 'Compliant',
    maintenanceStatus: 'In Service',
    chassisNumber: 'MAT901238K9012384',
    engineNumber: 'ENG09123841',
    rcExpiry: '2027-10-12',
    insuranceExpiry: '2026-12-01',
    fitnessExpiry: '2027-04-18',
    lastKnownLocation: { lat: 13.0827, lng: 80.2707, city: 'Chennai Port Yard' }
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'd-1',
    fullName: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    licenseNumber: 'MH12 20150091234',
    licenseCategory: 'HMV',
    licenseExpiry: '2028-04-12',
    experienceYears: 8,
    assignedVehicle: 'MH-12-Q-4521',
    status: 'Active',
    verificationStatus: 'Fully Verified',
    aadhaarNumber: '9012 3456 7890',
    emergencyContact: {
      name: 'Sunita Kumar',
      phone: '+91 98765 43211',
      relation: 'Wife'
    }
  },
  {
    id: 'd-2',
    fullName: 'Suresh Patil',
    phone: '+91 98123 90812',
    licenseNumber: 'KA01 20180041239',
    licenseCategory: 'Trailer',
    licenseExpiry: '2026-08-15',
    experienceYears: 12,
    assignedVehicle: 'KA-01-EA-9011',
    status: 'Active',
    verificationStatus: 'Pending Verification',
    aadhaarNumber: '4512 8901 2345',
    emergencyContact: {
      name: 'Prakash Patil',
      phone: '+91 98123 90813',
      relation: 'Brother'
    }
  },
  {
    id: 'd-3',
    fullName: 'Vikram Singh',
    phone: '+91 97654 32109',
    licenseNumber: 'GJ06 20120019283',
    licenseCategory: 'HMV',
    licenseExpiry: '2029-01-10',
    experienceYears: 15,
    assignedVehicle: 'GJ-06-ZZ-3342',
    status: 'Active',
    verificationStatus: 'Fully Verified',
    aadhaarNumber: '7812 3409 1234',
    emergencyContact: {
      name: 'Manju Singh',
      phone: '+91 97654 32110',
      relation: 'Wife'
    }
  },
  {
    id: 'd-4',
    fullName: 'Mahesh Sharma',
    phone: '+91 99887 76655',
    licenseNumber: 'HR55 20160081234',
    licenseCategory: 'Hazardous Goods',
    licenseExpiry: '2027-09-25',
    experienceYears: 10,
    assignedVehicle: 'MH-04-JK-7810',
    status: 'Active',
    verificationStatus: 'Fully Verified',
    aadhaarNumber: '3412 9081 2345',
    emergencyContact: {
      name: 'Rajeev Sharma',
      phone: '+91 99887 76656',
      relation: 'Father'
    }
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    fullName: 'Sylborn Furtado',
    email: 'sylborn@trucksaathi.in',
    phone: '+91 90000 11111',
    role: 'Company Admin',
    department: 'Executive Management',
    status: 'Active',
    lastActive: 'Just now'
  },
  {
    id: 'u-2',
    fullName: 'Rajesh Varma',
    email: 'rajesh.v@trucksaathi.in',
    phone: '+91 98000 22222',
    role: 'Fleet Manager',
    department: 'Operations',
    status: 'Active',
    lastActive: '12 mins ago'
  },
  {
    id: 'u-3',
    fullName: 'Anil Deshmukh',
    email: 'anil.d@trucksaathi.in',
    phone: '+91 97000 33333',
    role: 'Dispatcher',
    department: 'Dispatch & Routing',
    status: 'Active',
    lastActive: '1 hour ago'
  },
  {
    id: 'u-4',
    fullName: 'Pooja Hegde',
    email: 'pooja.h@trucksaathi.in',
    phone: '+91 96000 44444',
    role: 'Fleet Manager',
    department: 'Compliance',
    status: 'Invited',
    lastActive: 'Pending Invite'
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b-1',
    name: 'Bhiwandi Hub & Logistics Park',
    code: 'BR-BHI-01',
    city: 'Mumbai',
    state: 'Maharashtra',
    contactPerson: 'Karan Malhotra',
    phone: '+91 98220 12345',
    capacity: 65
  },
  {
    id: 'b-2',
    name: 'Nelamangala Depot',
    code: 'BR-BLR-02',
    city: 'Bengaluru',
    state: 'Karnataka',
    contactPerson: 'Shivakumar N',
    phone: '+91 98450 67890',
    capacity: 40
  },
  {
    id: 'b-3',
    name: 'Sanand Transport Yard',
    code: 'BR-AMD-03',
    city: 'Ahmedabad',
    state: 'Gujarat',
    contactPerson: 'Jitendra Shah',
    phone: '+91 98980 54321',
    capacity: 50
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-1',
    user: 'Sylborn Furtado',
    role: 'Company Admin',
    action: 'Updated Vehicle RC Document for MH-12-Q-4521',
    module: 'Vehicle Management',
    timestamp: '14:15 PM'
  },
  {
    id: 'act-2',
    user: 'Rajesh Varma',
    role: 'Fleet Manager',
    action: 'Assigned Driver Ramesh Kumar to vehicle MH-12-Q-4521',
    module: 'Driver Allocation',
    timestamp: '13:40 PM'
  },
  {
    id: 'act-3',
    user: 'Sylborn Furtado',
    role: 'Company Admin',
    action: 'Added new Branch Office Nelamangala Depot (BR-BLR-02)',
    module: 'Company Management',
    timestamp: '11:05 AM'
  },
  {
    id: 'act-4',
    user: 'Anil Deshmukh',
    role: 'Dispatcher',
    action: 'Flagged vehicle HR-55-AB-1290 for Breakdown Service',
    module: 'Maintenance',
    timestamp: '09:22 AM'
  }
];
