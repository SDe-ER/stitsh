import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================
export type EquipmentStatus = 'active' | 'inactive' | 'maintenance'
export type MaintenanceType = 'preventive' | 'corrective' | 'emergency'
export type EquipmentType = 'excavator' | 'loader' | 'bulldozer' | 'crane' | 'truck' | 'crusher' | 'screening' | 'concrete-mixer' | 'roller' | 'other'

export type EquipmentOwnership = 'owned' | 'rental'

export interface Equipment {
  id: string
  code: string  // e.g., EQ-001
  name: string
  nameAr: string
  type: EquipmentType
  typeAr: string
  brand: string
  model: string
  year: number
  status: EquipmentStatus
  statusAr: string
  projectId?: string
  projectName?: string
  projectNameAr?: string
  // Ownership
  ownership: EquipmentOwnership
  ownershipAr: string
  // Specifications
  capacity?: string
  capacityUnit?: string
  weight?: number  // kg
  power?: number  // hp
  fuelCapacity?: number  // liters
  // Usage tracking
  totalHours: number
  usagePercentage: number
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
  lastServiceHours: number
  serviceIntervalHours: number  // Service every X hours
  // Location
  currentLocation?: string
  currentLocationAr?: string
  // Costs
  purchaseCost?: number
  dailyOperatingCost?: number
  hourlyRate?: number  // Custom hourly rate override
  totalMaintenanceCost: number
  // TUV Documents
  tuvDocumentUrl?: string
  tuvExpiryDate?: string
  // Workers
  assignedWorkerIds: string[]  // Workers/operators assigned to this equipment
  // Notes
  notes?: string
  notesAr?: string
  // Images
  imageUrl?: string
  // Tracking
  createdAt: string
  updatedAt: string
}

export interface MaintenanceRecord {
  id: string
  equipmentId: string
  equipmentName: string
  equipmentNameAr: string
  type: MaintenanceType
  typeAr: string
  description: string
  descriptionAr: string
  date: string
  completedDate?: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  statusAr: string
  technician: string
  technicianAr: string
  cost: number
  partsUsed?: string
  partsUsedAr?: string
  nextMaintenanceDate?: string
  notes?: string
  notesAr?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEquipmentData {
  code: string
  name: string
  nameAr: string
  type: EquipmentType
  brand: string
  model: string
  year: number
  ownership?: EquipmentOwnership
  capacity?: string
  capacityUnit?: string
  weight?: number
  power?: number
  fuelCapacity?: number
  serviceIntervalHours?: number
  purchaseCost?: number
  dailyOperatingCost?: number
  hourlyRate?: number
  currentLocation?: string
  currentLocationAr?: string
  tuvDocumentUrl?: string
  tuvExpiryDate?: string
  notes?: string
  notesAr?: string
  imageUrl?: string
}

export interface UpdateEquipmentData {
  code?: string
  name?: string
  nameAr?: string
  type?: EquipmentType
  brand?: string
  model?: string
  year?: number
  status?: EquipmentStatus
  ownership?: EquipmentOwnership
  projectId?: string
  capacity?: string
  capacityUnit?: string
  weight?: number
  power?: number
  fuelCapacity?: number
  serviceIntervalHours?: number
  purchaseCost?: number
  dailyOperatingCost?: number
  hourlyRate?: number
  currentLocation?: string
  currentLocationAr?: string
  tuvDocumentUrl?: string
  tuvExpiryDate?: string
  notes?: string
  notesAr?: string
  imageUrl?: string
  totalHours?: number
}

export interface CreateMaintenanceData {
  equipmentId: string
  type: MaintenanceType
  description: string
  descriptionAr: string
  date: string
  technician: string
  technicianAr: string
  cost: number
  partsUsed?: string
  partsUsedAr?: string
  nextMaintenanceDate?: string
  notes?: string
  notesAr?: string
}

// ============================================================================
// LABELS & CONFIG
// ============================================================================
export const equipmentTypeLabels = {
  excavator: { label: 'حفار', labelEn: 'Excavator' },
  loader: { label: 'لودر', labelEn: 'Loader' },
  bulldozer: { label: 'بلدوزر', labelEn: 'Bulldozer' },
  crane: { label: 'رافعة', labelEn: 'Crane' },
  truck: { label: 'شاحنة', labelEn: 'Truck' },
  crusher: { label: 'كسارة', labelEn: 'Crusher' },
  'screening': { label: 'غربلة', labelEn: 'Screening Plant' },
  'concrete-mixer': { label: 'خلاطة إسمنت', labelEn: 'Concrete Mixer' },
  roller: { label: 'مدحلة', labelEn: 'Roller' },
  other: { label: 'أخرى', labelEn: 'Other' },
}

export const equipmentStatusLabels = {
  active: { label: 'نشطة', labelEn: 'Active', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  inactive: { label: 'خامدة', labelEn: 'Inactive', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  maintenance: { label: 'في الصيانة', labelEn: 'In Maintenance', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

export const maintenanceTypeLabels = {
  preventive: { label: 'وقائية', labelEn: 'Preventive', priority: 3, color: 'bg-blue-100 text-blue-700' },
  corrective: { label: 'تصحيحية', labelEn: 'Corrective', priority: 2, color: 'bg-amber-100 text-amber-700' },
  emergency: { label: 'طارئة', labelEn: 'Emergency', priority: 1, color: 'bg-red-100 text-red-700' },
}

export const maintenanceStatusLabels = {
  scheduled: { label: 'مجدولة', labelEn: 'Scheduled', color: 'bg-gray-100 text-gray-700' },
  'in-progress': { label: 'قيد التنفيذ', labelEn: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'مكتملة', labelEn: 'Completed', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'ملغاة', labelEn: 'Cancelled', color: 'bg-red-100 text-red-700' },
}

export const equipmentOwnershipLabels = {
  owned: { label: 'ملك الشركة', labelEn: 'Company Owned', color: 'bg-blue-100 text-blue-700' },
  rental: { label: 'إيجار', labelEn: 'Rental', color: 'bg-amber-100 text-amber-700' },
}

// ============================================================================
// STORAGE KEYS & DEFAULT DATA
// ============================================================================
const EQUIPMENT_KEY = 'heavyops_equipment'
const MAINTENANCE_KEY = 'heavyops_maintenance'

const defaultEquipment: Equipment[] = [
  {
    id: 'eq-1',
    code: 'EQ-001',
    name: 'Caterpillar 320 GC',
    nameAr: 'كاتربيلر 320 جي سي',
    type: 'excavator',
    typeAr: 'حفار',
    brand: 'Caterpillar',
    model: '320 GC',
    year: 2022,
    status: 'active',
    statusAr: 'نشطة',
    ownership: 'owned',
    ownershipAr: 'ملك الشركة',
    projectId: '1',
    projectName: 'Riyadh Metro Extension',
    projectNameAr: 'توسعة مترو الرياض',
    capacity: '1.2',
    capacityUnit: 'm³',
    weight: 14000,
    power: 120,
    fuelCapacity: 300,
    totalHours: 2450,
    usagePercentage: 65,
    lastMaintenanceDate: '2024-01-15',
    nextMaintenanceDate: '2024-03-15',
    lastServiceHours: 2000,
    serviceIntervalHours: 500,
    currentLocation: 'Riyadh - Site A',
    currentLocationAr: 'الرياض - الموقع أ',
    purchaseCost: 450000,
    dailyOperatingCost: 350,
    hourlyRate: 80,
    totalMaintenanceCost: 12500,
    tuvDocumentUrl: 'https://example.com/tuv/eq-001.pdf',
    tuvExpiryDate: '2025-12-31',
    assignedWorkerIds: ['w-1'],
    imageUrl: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=400',
    notes: 'Well maintained machine',
    notesAr: 'معدة محفوظة جيداً',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-02-01T00:00:00',
  },
  {
    id: 'eq-2',
    code: 'EQ-002',
    name: 'Komatsu WA380',
    nameAr: 'كوماتسو WA380',
    type: 'loader',
    typeAr: 'لودر',
    brand: 'Komatsu',
    model: 'WA380',
    year: 2021,
    status: 'active',
    statusAr: 'نشطة',
    ownership: 'owned',
    ownershipAr: 'ملك الشركة',
    projectId: '1',
    projectName: 'Riyadh Metro Extension',
    projectNameAr: 'توسعة مترو الرياض',
    capacity: '3.5',
    capacityUnit: 'm³',
    weight: 18500,
    power: 180,
    fuelCapacity: 400,
    totalHours: 3200,
    usagePercentage: 80,
    lastMaintenanceDate: '2024-01-20',
    nextMaintenanceDate: '2024-03-20',
    lastServiceHours: 2500,
    serviceIntervalHours: 500,
    currentLocation: 'Riyadh - Site B',
    currentLocationAr: 'الرياض - الموقع ب',
    purchaseCost: 380000,
    dailyOperatingCost: 300,
    hourlyRate: 70,
    totalMaintenanceCost: 18200,
    tuvDocumentUrl: 'https://example.com/tuv/eq-002.pdf',
    tuvExpiryDate: '2025-06-30',
    assignedWorkerIds: ['w-1', 'w-2'],
    notesAr: 'تعمل بكفاءة عالية',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-02-01T00:00:00',
  },
  {
    id: 'eq-3',
    code: 'EQ-003',
    name: 'Caterpillar D6',
    nameAr: 'كاتربيلر D6',
    type: 'bulldozer',
    typeAr: 'بلدوزر',
    brand: 'Caterpillar',
    model: 'D6',
    year: 2020,
    status: 'maintenance',
    statusAr: 'في الصيانة',
    ownership: 'owned',
    ownershipAr: 'ملك الشركة',
    projectId: '2',
    projectName: 'Jeddah Airport Road',
    projectNameAr: 'طريق مطار جدة',
    weight: 18000,
    power: 150,
    fuelCapacity: 450,
    totalHours: 5800,
    usagePercentage: 0,
    lastMaintenanceDate: '2024-02-01',
    nextMaintenanceDate: '2024-03-01',
    lastServiceHours: 5500,
    serviceIntervalHours: 500,
    currentLocation: 'Jeddah - Workshop',
    currentLocationAr: 'جدة - الورشة',
    purchaseCost: 420000,
    dailyOperatingCost: 320,
    hourlyRate: 75,
    totalMaintenanceCost: 28500,
    tuvDocumentUrl: 'https://example.com/tuv/eq-003.pdf',
    tuvExpiryDate: '2025-09-30',
    assignedWorkerIds: ['w-2'],
    notes: 'Under major engine overhaul',
    notesAr: 'إصلاح شامل للمحرك',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-02-10T00:00:00',
  },
  {
    id: 'eq-4',
    code: 'EQ-004',
    name: 'Liebherr LTM 1130',
    nameAr: 'ليبهر LTM 1130',
    type: 'crane',
    typeAr: 'رافعة',
    brand: 'Liebherr',
    model: 'LTM 1130',
    year: 2023,
    status: 'active',
    statusAr: 'نشطة',
    ownership: 'rental',
    ownershipAr: 'إيجار',
    projectId: '2',
    projectName: 'Jeddah Airport Road',
    projectNameAr: 'طريق مطار جدة',
    capacity: '130',
    capacityUnit: 'tons',
    weight: 48000,
    power: 400,
    fuelCapacity: 600,
    totalHours: 850,
    usagePercentage: 45,
    lastMaintenanceDate: '2024-01-25',
    nextMaintenanceDate: '2024-04-25',
    lastServiceHours: 500,
    serviceIntervalHours: 500,
    currentLocation: 'Jeddah - Site A',
    currentLocationAr: 'جدة - الموقع أ',
    purchaseCost: 1200000,
    dailyOperatingCost: 800,
    hourlyRate: 100,
    totalMaintenanceCost: 5000,
    tuvDocumentUrl: 'https://example.com/tuv/eq-004.pdf',
    tuvExpiryDate: '2025-03-31',
    assignedWorkerIds: ['w-2', 'w-5'],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-02-01T00:00:00',
  },
  {
    id: 'eq-5',
    code: 'EQ-005',
    name: 'MAN TGS 41.400',
    nameAr: 'مان TGS 41.400',
    type: 'truck',
    typeAr: 'شاحنة',
    brand: 'MAN',
    model: 'TGS 41.400',
    year: 2022,
    status: 'active',
    statusAr: 'نشطة',
    ownership: 'owned',
    ownershipAr: 'ملك الشركة',
    projectId: '1',
    projectName: 'Riyadh Metro Extension',
    projectNameAr: 'توسعة مترو الرياض',
    capacity: '30',
    capacityUnit: 'tons',
    weight: 12000,
    power: 400,
    fuelCapacity: 500,
    totalHours: 1800,
    usagePercentage: 70,
    lastMaintenanceDate: '2024-02-01',
    nextMaintenanceDate: '2024-05-01',
    lastServiceHours: 1500,
    serviceIntervalHours: 1000,
    currentLocation: 'Riyadh - Site A',
    currentLocationAr: 'الرياض - الموقع أ',
    purchaseCost: 580000,
    dailyOperatingCost: 250,
    hourlyRate: 60,
    totalMaintenanceCost: 8500,
    tuvDocumentUrl: 'https://example.com/tuv/eq-005.pdf',
    tuvExpiryDate: '2025-07-31',
    assignedWorkerIds: ['w-3'],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-02-01T00:00:00',
  },
  {
    id: 'eq-6',
    code: 'EQ-006',
    name: 'Terex Finlay J-1175',
    nameAr: 'تيركس فينلي J-1175',
    type: 'crusher',
    typeAr: 'كسارة',
    brand: 'Terex',
    model: 'Finlay J-1175',
    year: 2021,
    status: 'active',
    statusAr: 'نشطة',
    ownership: 'owned',
    ownershipAr: 'ملك الشركة',
    projectId: '3',
    projectName: 'Dammam Highway',
    projectNameAr: 'طريق الدمام',
    capacity: '250',
    capacityUnit: 'tph',
    power: 250,
    fuelCapacity: 800,
    totalHours: 4200,
    usagePercentage: 85,
    lastMaintenanceDate: '2024-01-10',
    nextMaintenanceDate: '2024-03-10',
    lastServiceHours: 4000,
    serviceIntervalHours: 500,
    currentLocation: 'Dammam - Quarry',
    currentLocationAr: 'الدمام - المحجر',
    purchaseCost: 680000,
    dailyOperatingCost: 500,
    hourlyRate: 250,
    totalMaintenanceCost: 32000,
    tuvDocumentUrl: 'https://example.com/tuv/eq-006.pdf',
    tuvExpiryDate: '2025-12-31',
    assignedWorkerIds: ['w-1'],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-02-01T00:00:00',
  },
  {
    id: 'eq-7',
    code: 'EQ-007',
    name: 'Volvo A40G',
    nameAr: 'فولفو A40G',
    type: 'truck',
    typeAr: 'شاحنة',
    brand: 'Volvo',
    model: 'A40G',
    year: 2020,
    status: 'inactive',
    statusAr: 'خامدة',
    ownership: 'rental',
    ownershipAr: 'إيجار',
    weight: 35000,
    power: 470,
    fuelCapacity: 650,
    totalHours: 8900,
    usagePercentage: 0,
    lastMaintenanceDate: '2024-01-05',
    nextMaintenanceDate: '2024-04-05',
    lastServiceHours: 8500,
    serviceIntervalHours: 500,
    currentLocation: 'Riyadh - Yard',
    currentLocationAr: 'الرياض - الساحة',
    purchaseCost: 620000,
    dailyOperatingCost: 400,
    hourlyRate: 60,
    totalMaintenanceCost: 45000,
    assignedWorkerIds: ['w-3'],
    notes: 'Pending tire replacement',
    notesAr: 'في انتظار استبدال الإطارات',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-02-01T00:00:00',
  },
  {
    id: 'eq-8',
    code: 'EQ-008',
    name: 'Bomag BW 213',
    nameAr: 'بوماغ BW 213',
    type: 'roller',
    typeAr: 'مدحلة',
    brand: 'Bomag',
    model: 'BW 213',
    year: 2023,
    status: 'active',
    statusAr: 'نشطة',
    ownership: 'owned',
    ownershipAr: 'ملك الشركة',
    projectId: '3',
    projectName: 'Dammam Highway',
    projectNameAr: 'طريق الدمام',
    weight: 13000,
    power: 100,
    fuelCapacity: 200,
    totalHours: 620,
    usagePercentage: 55,
    lastMaintenanceDate: '2024-01-28',
    nextMaintenanceDate: '2024-04-28',
    lastServiceHours: 500,
    serviceIntervalHours: 500,
    currentLocation: 'Dammam - Site A',
    currentLocationAr: 'الدمام - الموقع أ',
    purchaseCost: 180000,
    dailyOperatingCost: 150,
    hourlyRate: 70,
    totalMaintenanceCost: 2500,
    tuvDocumentUrl: 'https://example.com/tuv/eq-008.pdf',
    tuvExpiryDate: '2025-11-30',
    assignedWorkerIds: [],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-02-01T00:00:00',
  },
]

const defaultMaintenance: MaintenanceRecord[] = [
  {
    id: 'maint-1',
    equipmentId: 'eq-1',
    equipmentName: 'Caterpillar 320 GC',
    equipmentNameAr: 'كاتربيلر 320 جي سي',
    type: 'preventive',
    typeAr: 'وقائية',
    description: 'Regular service - oil change, filter replacement',
    descriptionAr: 'صيانة دورية - تغيير الزيت، استبدال الفلاتر',
    date: '2024-01-15',
    completedDate: '2024-01-15',
    status: 'completed',
    statusAr: 'مكتملة',
    technician: 'Ahmed Ali',
    technicianAr: 'أحمد علي',
    cost: 2500,
    partsUsed: 'Engine oil, hydraulic filter, fuel filter',
    partsUsedAr: 'زيت المحرك، فلتر هيدروليكي، فلتر الوقود',
    nextMaintenanceDate: '2024-03-15',
    createdAt: '2024-01-15T00:00:00',
    updatedAt: '2024-01-15T00:00:00',
  },
  {
    id: 'maint-2',
    equipmentId: 'eq-3',
    equipmentName: 'Caterpillar D6',
    equipmentNameAr: 'كاتربيلر D6',
    type: 'corrective',
    typeAr: 'تصحيحية',
    description: 'Engine overhaul - piston replacement',
    descriptionAr: 'إصلاح شامل للمحرك - استبدال المكابس',
    date: '2024-02-01',
    status: 'in-progress',
    statusAr: 'قيد التنفيذ',
    technician: 'Mohammed Hassan',
    technicianAr: 'محمد حسن',
    cost: 28000,
    partsUsedAr: 'مجموعة المكابس، حلقات المكابس، bearings',
    notes: 'Major repair - expected completion in 5 days',
    notesAr: 'إصلاح رئيسي - المتوقع الإنجاز خلال 5 أيام',
    createdAt: '2024-02-01T00:00:00',
    updatedAt: '2024-02-10T00:00:00',
  },
  {
    id: 'maint-3',
    equipmentId: 'eq-2',
    equipmentName: 'Komatsu WA380',
    equipmentNameAr: 'كوماتسو WA380',
    type: 'preventive',
    typeAr: 'وقائية',
    description: 'Scheduled maintenance - hydraulic system check',
    descriptionAr: 'صيانة مجدولة - فحص النظام الهيدروليكي',
    date: '2024-01-20',
    completedDate: '2024-01-20',
    status: 'completed',
    statusAr: 'مكتملة',
    technician: 'Khalid Ibrahim',
    technicianAr: 'خالد إبراهيم',
    cost: 3200,
    partsUsedAr: 'زيت هيدروليكي، seals',
    createdAt: '2024-01-20T00:00:00',
    updatedAt: '2024-01-20T00:00:00',
  },
  {
    id: 'maint-4',
    equipmentId: 'eq-3',
    equipmentName: 'Caterpillar D6',
    equipmentNameAr: 'كاتربيلر D6',
    type: 'emergency',
    typeAr: 'طارئة',
    description: 'Hydraulic hose failure - immediate repair',
    descriptionAr: 'فشل خرطوم هيدروليكي - إصلاح فوري',
    date: '2024-01-25',
    completedDate: '2024-01-25',
    status: 'completed',
    statusAr: 'مكتملة',
    technician: 'Emergency Team',
    technicianAr: 'فريق الطوارئ',
    cost: 1800,
    partsUsedAr: 'خرطوم هيدروليكي، fittings',
    createdAt: '2024-01-25T00:00:00',
    updatedAt: '2024-01-25T00:00:00',
  },
  {
    id: 'maint-5',
    equipmentId: 'eq-6',
    equipmentName: 'Terex Finlay J-1175',
    equipmentNameAr: 'تيركس فينلي J-1175',
    type: 'preventive',
    typeAr: 'وقائية',
    description: 'Jaw plates replacement',
    descriptionAr: 'استبدال لوحات الفك',
    date: '2024-01-10',
    completedDate: '2024-01-10',
    status: 'completed',
    statusAr: 'مكتملة',
    technician: 'Workshop Team',
    technicianAr: 'فريق الورشة',
    cost: 12000,
    partsUsedAr: 'لوحات الفك، bolts',
    createdAt: '2024-01-10T00:00:00',
    updatedAt: '2024-01-10T00:00:00',
  },
  {
    id: 'maint-6',
    equipmentId: 'eq-7',
    equipmentName: 'Volvo A40G',
    equipmentNameAr: 'فولفو A40G',
    type: 'corrective',
    typeAr: 'تصحيحية',
    description: 'Tire replacement needed',
    descriptionAr: 'استبدال الإطارات مطلوب',
    date: '2024-02-15',
    status: 'scheduled',
    statusAr: 'مجدولة',
    technician: 'Tire Service',
    technicianAr: 'خدمة الإطارات',
    cost: 25000,
    partsUsedAr: '6 إطارات مقاس 29.5R25',
    createdAt: '2024-02-01T00:00:00',
    updatedAt: '2024-02-01T00:00:00',
  },
]

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================
export function getEquipment(): Equipment[] {
  if (typeof window === 'undefined') return defaultEquipment
  const stored = localStorage.getItem(EQUIPMENT_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultEquipment
    }
  }
  return defaultEquipment
}

export function saveEquipment(equipment: Equipment[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(equipment))
  }
}

export function getMaintenanceRecords(): MaintenanceRecord[] {
  if (typeof window === 'undefined') return defaultMaintenance
  const stored = localStorage.getItem(MAINTENANCE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultMaintenance
    }
  }
  return defaultMaintenance
}

export function saveMaintenanceRecords(records: MaintenanceRecord[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(records))
  }
}

// ============================================================================
// HOOKS
// ============================================================================
export function useEquipment(filters?: { type?: EquipmentType; status?: EquipmentStatus; projectId?: string }) {
  return useQuery({
    queryKey: ['equipment', filters],
    queryFn: () => {
      let equipment = getEquipment()
      if (filters?.type) equipment = equipment.filter(e => e.type === filters.type)
      if (filters?.status) equipment = equipment.filter(e => e.status === filters.status)
      if (filters?.projectId) equipment = equipment.filter(e => e.projectId === filters.projectId)
      return equipment
    },
  })
}

export function useEquipmentDetail(id: string) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => getEquipment().find(e => e.id === id),
    enabled: !!id,
  })
}

export function useCreateEquipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEquipmentData) => {
      const equipment = getEquipment()
      const typeAr = equipmentTypeLabels[data.type].label
      const ownership = data.ownership || 'owned'
      const newEquipment: Equipment = {
        id: `eq-${Date.now()}`,
        code: data.code,
        name: data.name,
        nameAr: data.nameAr,
        type: data.type,
        typeAr,
        brand: data.brand,
        model: data.model,
        year: data.year,
        status: 'active',
        statusAr: equipmentStatusLabels.active.label,
        ownership,
        ownershipAr: equipmentOwnershipLabels[ownership].label,
        capacity: data.capacity,
        capacityUnit: data.capacityUnit,
        weight: data.weight,
        power: data.power,
        fuelCapacity: data.fuelCapacity,
        serviceIntervalHours: data.serviceIntervalHours || 500,
        lastServiceHours: 0,
        totalHours: 0,
        usagePercentage: 0,
        purchaseCost: data.purchaseCost,
        dailyOperatingCost: data.dailyOperatingCost,
        hourlyRate: data.hourlyRate,
        currentLocation: data.currentLocation,
        currentLocationAr: data.currentLocationAr,
        tuvDocumentUrl: data.tuvDocumentUrl,
        tuvExpiryDate: data.tuvExpiryDate,
        notes: data.notes,
        notesAr: data.notesAr,
        imageUrl: data.imageUrl,
        totalMaintenanceCost: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      equipment.push(newEquipment)
      saveEquipment(equipment)
      return newEquipment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('تمت إضافة المعدة بنجاح', { description: 'Equipment added successfully' })
    },
  })
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEquipmentData }) => {
      const equipment = getEquipment()
      const index = equipment.findIndex(e => e.id === id)
      if (index === -1) throw new Error('Equipment not found')

      const updated = { ...equipment[index] }
      if (data.code !== undefined) updated.code = data.code
      if (data.name !== undefined) updated.name = data.name
      if (data.nameAr !== undefined) updated.nameAr = data.nameAr
      if (data.type !== undefined) {
        updated.type = data.type
        updated.typeAr = equipmentTypeLabels[data.type].label
      }
      if (data.brand !== undefined) updated.brand = data.brand
      if (data.model !== undefined) updated.model = data.model
      if (data.year !== undefined) updated.year = data.year
      if (data.status !== undefined) {
        updated.status = data.status
        updated.statusAr = equipmentStatusLabels[data.status].label
      }
      if (data.ownership !== undefined) {
        updated.ownership = data.ownership
        updated.ownershipAr = equipmentOwnershipLabels[data.ownership].label
      }
      if (data.projectId !== undefined) updated.projectId = data.projectId
      if (data.capacity !== undefined) updated.capacity = data.capacity
      if (data.capacityUnit !== undefined) updated.capacityUnit = data.capacityUnit
      if (data.weight !== undefined) updated.weight = data.weight
      if (data.power !== undefined) updated.power = data.power
      if (data.fuelCapacity !== undefined) updated.fuelCapacity = data.fuelCapacity
      if (data.serviceIntervalHours !== undefined) updated.serviceIntervalHours = data.serviceIntervalHours
      if (data.purchaseCost !== undefined) updated.purchaseCost = data.purchaseCost
      if (data.dailyOperatingCost !== undefined) updated.dailyOperatingCost = data.dailyOperatingCost
      if (data.hourlyRate !== undefined) updated.hourlyRate = data.hourlyRate
      if (data.currentLocation !== undefined) updated.currentLocation = data.currentLocation
      if (data.currentLocationAr !== undefined) updated.currentLocationAr = data.currentLocationAr
      if (data.tuvDocumentUrl !== undefined) updated.tuvDocumentUrl = data.tuvDocumentUrl
      if (data.tuvExpiryDate !== undefined) updated.tuvExpiryDate = data.tuvExpiryDate
      if (data.notes !== undefined) updated.notes = data.notes
      if (data.notesAr !== undefined) updated.notesAr = data.notesAr
      if (data.imageUrl !== undefined) updated.imageUrl = data.imageUrl
      if (data.totalHours !== undefined) updated.totalHours = data.totalHours

      updated.updatedAt = new Date().toISOString()
      equipment[index] = updated
      saveEquipment(equipment)
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('تم تحديث المعدة بنجاح', { description: 'Equipment updated successfully' })
    },
  })
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      const equipment = getEquipment()
      const filtered = equipment.filter(e => e.id !== id)
      saveEquipment(filtered)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('تم حذف المعدة بنجاح', { description: 'Equipment deleted successfully' })
    },
  })
}

// Maintenance Hooks
export function useMaintenanceRecords(equipmentId?: string) {
  return useQuery({
    queryKey: ['maintenance', equipmentId],
    queryFn: () => {
      let records = getMaintenanceRecords()
      if (equipmentId) records = records.filter(r => r.equipmentId === equipmentId)
      return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
  })
}

export function useScheduledMaintenances() {
  return useQuery({
    queryKey: ['maintenance', 'scheduled'],
    queryFn: () => {
      const records = getMaintenanceRecords()
      return records
        .filter(r => r.status === 'scheduled')
        .sort((a, b) => {
          const priorityA = maintenanceTypeLabels[a.type].priority
          const priorityB = maintenanceTypeLabels[b.type].priority
          if (priorityA !== priorityB) return priorityA - priorityB
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        })
    },
  })
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMaintenanceData) => {
      const records = getMaintenanceRecords()
      const equipment = getEquipment().find(e => e.id === data.equipmentId)
      if (!equipment) throw new Error('Equipment not found')

      const typeAr = maintenanceTypeLabels[data.type].label
      const newRecord: MaintenanceRecord = {
        id: `maint-${Date.now()}`,
        equipmentId: data.equipmentId,
        equipmentName: equipment.name,
        equipmentNameAr: equipment.nameAr,
        type: data.type,
        typeAr,
        description: data.description,
        descriptionAr: data.descriptionAr,
        date: data.date,
        status: 'scheduled',
        statusAr: maintenanceStatusLabels.scheduled.label,
        technician: data.technician,
        technicianAr: data.technicianAr,
        cost: data.cost,
        partsUsed: data.partsUsed,
        partsUsedAr: data.partsUsedAr,
        nextMaintenanceDate: data.nextMaintenanceDate,
        notes: data.notes,
        notesAr: data.notesAr,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Update equipment next maintenance date
      const equipmentList = getEquipment()
      const eqIndex = equipmentList.findIndex(e => e.id === data.equipmentId)
      if (eqIndex !== -1) {
        equipmentList[eqIndex].nextMaintenanceDate = data.nextMaintenanceDate || data.date
        saveEquipment(equipmentList)
      }

      records.push(newRecord)
      saveMaintenanceRecords(records)
      return newRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('تمت إضافة الصيانة بنجاح', { description: 'Maintenance added successfully' })
    },
  })
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaintenanceRecord> }) => {
      const records = getMaintenanceRecords()
      const index = records.findIndex(r => r.id === id)
      if (index === -1) throw new Error('Maintenance record not found')

      const updated = { ...records[index], ...data, updatedAt: new Date().toISOString() }
      records[index] = updated
      saveMaintenanceRecords(records)

      // If completing maintenance, update equipment
      if (data.status === 'completed' && data.completedDate) {
        const equipment = getEquipment()
        const eqIndex = equipment.findIndex(e => e.id === records[index].equipmentId)
        if (eqIndex !== -1) {
          equipment[eqIndex].lastMaintenanceDate = data.completedDate
          if (data.nextMaintenanceDate) {
            equipment[eqIndex].nextMaintenanceDate = data.nextMaintenanceDate
          }
          equipment[eqIndex].totalMaintenanceCost += records[index].cost
          saveEquipment(equipment)
        }
      }

      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('تم تحديث الصيانة بنجاح', { description: 'Maintenance updated successfully' })
    },
  })
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      const records = getMaintenanceRecords()
      const filtered = records.filter(r => r.id !== id)
      saveMaintenanceRecords(filtered)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('تم حذف سجل الصيانة', { description: 'Maintenance record deleted' })
    },
  })
}

// Get monthly usage data for charts
export function getEquipmentMonthlyUsage(equipmentId: string): { month: string; monthAr: string; hours: number }[] {
  // Mock data - in real app, this would come from a database
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

  return months.map((month, i) => ({
    month,
    monthAr: monthsAr[i],
    hours: Math.floor(Math.random() * 200) + 50,
  }))
}
