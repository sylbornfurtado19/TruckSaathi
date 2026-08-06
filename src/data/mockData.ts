import { Vehicle, Driver, User, Branch, ActivityLog, Trip } from '../types';

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

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trp-1',
    tripCode: 'TRP-2026-0142',
    vehicleId: 'v-1',
    vehicleReg: 'MH-12-Q-4521',
    driverId: 'd-1',
    driverName: 'Ramesh Kumar',
    origin: { city: 'Mumbai', address: 'Bhiwandi Logistics Hub, Gate 4', lat: 19.0760, lng: 72.8777 },
    destination: { city: 'Pune', address: 'Chakan Industrial Complex, Phase 2', lat: 18.5204, lng: 73.8567 },
    cargoDescription: 'Auto Spare Components & Alloy Wheel Freight',
    cargoWeightTons: 24,
    status: 'In Transit',
    scheduledDeparture: '2026-08-06 06:00',
    scheduledArrival: '2026-08-06 14:00',
    actualDeparture: '2026-08-06 06:20',
    distanceKm: 148,
    ewayBillNumber: '3819-0921-4412',
    ewayBillExpiry: '2026-08-08 23:59',
    podReceived: false
  },
  {
    id: 'trp-2',
    tripCode: 'TRP-2026-0143',
    vehicleId: 'v-2',
    vehicleReg: 'KA-01-EA-9011',
    driverId: 'd-2',
    driverName: 'Suresh Patil',
    origin: { city: 'Bengaluru', address: 'Nelamangala ICD Yard', lat: 12.9716, lng: 77.5946 },
    destination: { city: 'Chennai', address: 'Chennai Port Container Freight Station', lat: 13.0827, lng: 80.2707 },
    cargoDescription: 'Electronics & Semiconductor Equipment',
    cargoWeightTons: 32,
    status: 'Delayed',
    scheduledDeparture: '2026-08-05 20:00',
    scheduledArrival: '2026-08-06 08:00',
    actualDeparture: '2026-08-05 21:15',
    distanceKm: 346,
    ewayBillNumber: '8910-4412-0921',
    ewayBillExpiry: '2026-08-07 23:59',
    podReceived: false,
    podNotes: 'Stuck at Hosur Checkpost due to RTO inspection clearance'
  },
  {
    id: 'trp-3',
    tripCode: 'TRP-2026-0144',
    vehicleId: 'v-5',
    vehicleReg: 'MH-04-JK-7810',
    driverId: 'd-4',
    driverName: 'Mahesh Sharma',
    origin: { city: 'Chennai', address: 'Ennore Industrial Tanker Hub', lat: 13.0827, lng: 80.2707 },
    destination: { city: 'Hyderabad', address: 'Pashamylaram Chemical Zone', lat: 17.3850, lng: 78.4867 },
    cargoDescription: 'Industrial Solvents & Liquid Polymers',
    cargoWeightTons: 22,
    status: 'In Transit',
    scheduledDeparture: '2026-08-06 02:00',
    scheduledArrival: '2026-08-06 18:00',
    actualDeparture: '2026-08-06 02:10',
    distanceKm: 625,
    ewayBillNumber: '7721-0091-8823',
    ewayBillExpiry: '2026-08-09 23:59',
    podReceived: false
  },
  {
    id: 'trp-4',
    tripCode: 'TRP-2026-0140',
    vehicleId: 'v-3',
    vehicleReg: 'GJ-06-ZZ-3342',
    driverId: 'd-3',
    driverName: 'Vikram Singh',
    origin: { city: 'Ahmedabad', address: 'Sanand Industrial Estate', lat: 23.0225, lng: 72.5714 },
    destination: { city: 'Jaipur', address: 'VKIA Industrial Area, Zone 3', lat: 26.9124, lng: 75.7873 },
    cargoDescription: 'Cotton Textiles & FMCG Goods',
    cargoWeightTons: 18,
    status: 'Delivered',
    scheduledDeparture: '2026-08-04 10:00',
    scheduledArrival: '2026-08-05 16:00',
    actualDeparture: '2026-08-04 10:05',
    actualArrival: '2026-08-05 15:45',
    distanceKm: 670,
    ewayBillNumber: '1109-8823-4412',
    ewayBillExpiry: '2026-08-07 23:59',
    podReceived: true,
    podNotes: 'Delivered in full. Signed copy verified by consignee.'
  },
  {
    id: 'trp-5',
    tripCode: 'TRP-2026-0145',
    vehicleId: 'v-1',
    vehicleReg: 'MH-12-Q-4521',
    driverId: 'd-1',
    driverName: 'Ramesh Kumar',
    origin: { city: 'Pune', address: 'Chakan Hub', lat: 18.5204, lng: 73.8567 },
    destination: { city: 'Goa', address: 'Verna Industrial Estate', lat: 15.2993, lng: 74.1240 },
    cargoDescription: 'Heavy Machinery Equipment',
    cargoWeightTons: 28,
    status: 'Scheduled',
    scheduledDeparture: '2026-08-07 05:00',
    scheduledArrival: '2026-08-07 19:00',
    distanceKm: 440,
    ewayBillNumber: '5541-0923-1122',
    ewayBillExpiry: '2026-08-10 23:59',
    podReceived: false
  },
  {
    id: 'trp-6',
    tripCode: 'TRP-2026-0138',
    vehicleId: 'v-2',
    vehicleReg: 'KA-01-EA-9011',
    driverId: 'd-2',
    driverName: 'Suresh Patil',
    origin: { city: 'Bengaluru', address: 'Peenya Industrial Area', lat: 12.9716, lng: 77.5946 },
    destination: { city: 'Coimbatore', address: 'TIDEL Park Freight Yard', lat: 11.0168, lng: 76.9558 },
    cargoDescription: 'Textile Machinery Parts',
    cargoWeightTons: 30,
    status: 'Delivered',
    scheduledDeparture: '2026-08-03 08:00',
    scheduledArrival: '2026-08-03 20:00',
    actualDeparture: '2026-08-03 08:15',
    actualArrival: '2026-08-03 19:40',
    distanceKm: 365,
    ewayBillNumber: '9921-3341-0012',
    ewayBillExpiry: '2026-08-05 23:59',
    podReceived: true,
    podNotes: 'Clean POD stamped by warehouse manager.'
  },
  {
    id: 'trp-7',
    tripCode: 'TRP-2026-0146',
    vehicleId: 'v-5',
    vehicleReg: 'MH-04-JK-7810',
    driverId: 'd-4',
    driverName: 'Mahesh Sharma',
    origin: { city: 'Hyderabad', address: 'Patancheru Hub', lat: 17.3850, lng: 78.4867 },
    destination: { city: 'Nagpur', address: 'MIHAN SEZ Freight Complex', lat: 21.1458, lng: 79.0882 },
    cargoDescription: 'Pharma & Bulk Intermediates',
    cargoWeightTons: 20,
    status: 'Scheduled',
    scheduledDeparture: '2026-08-08 04:00',
    scheduledArrival: '2026-08-08 17:00',
    distanceKm: 500,
    ewayBillNumber: '4412-7712-9901',
    ewayBillExpiry: '2026-08-11 23:59',
    podReceived: false
  },
  {
    id: 'trp-8',
    tripCode: 'TRP-2026-0139',
    vehicleId: 'v-3',
    vehicleReg: 'GJ-06-ZZ-3342',
    driverId: 'd-3',
    driverName: 'Vikram Singh',
    origin: { city: 'Surat', address: 'Hazira Port Yard', lat: 21.1702, lng: 72.8311 },
    destination: { city: 'Mumbai', address: 'Jawaharlal Nehru Port Trust (JNPT)', lat: 18.9500, lng: 72.9500 },
    cargoDescription: 'Export Containerized Cargo',
    cargoWeightTons: 22,
    status: 'Delivered',
    scheduledDeparture: '2026-08-02 12:00',
    scheduledArrival: '2026-08-02 22:00',
    actualDeparture: '2026-08-02 12:10',
    actualArrival: '2026-08-02 21:30',
    distanceKm: 280,
    ewayBillNumber: '6612-4410-8819',
    ewayBillExpiry: '2026-08-04 23:59',
    podReceived: true,
    podNotes: 'Gate-in receipt uploaded.'
  }
];

