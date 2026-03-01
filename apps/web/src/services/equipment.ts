import api from './api'
import type { Equipment, CreateEquipmentData, UpdateEquipmentData } from '@/hooks/useEquipment'

// Types for API responses
export interface ApiEquipmentResponse {
  id: string
  name: string
  nameAr: string | null
  code: string
  type: string
  brand: string | null
  model: string | null
  serialNumber: string | null
  status: string
  currentProjectId: string | null
  purchaseDate: string | null
  purchaseCost: number | null
  lastMaintenanceDate: string | null
  nextMaintenanceDate: string | null
  hourlyCost: number | null
  dailyCost: number | null
  location: string | null
  operator: string | null
  fuelConsumption: number | null
  description: string | null
  plateNumber: string | null
  manufacturingYear: number | null
  totalWorkHours: number
  nextMaintenanceHours: number | null
  hourlyRate: number | null
  totalOperatingCost: number
  imageUrl: string | null
  operatorId: string | null
  createdAt: string
  updatedAt: string
  project?: {
    id: string
    name: string
    code: string
  } | null
  _count?: {
    maintenanceRecords: number
  }
}

export interface PaginatedEquipmentResponse {
  data: ApiEquipmentResponse[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Status enum mapping: Backend -> Frontend
const statusMap: Record<string, Equipment['status']> = {
  'ACTIVE': 'active',
  'IDLE': 'inactive',
  'MAINTENANCE': 'maintenance',
  'RETIRED': 'inactive',
}

// Reverse status mapping: Frontend -> Backend
export const statusToApiMap: Record<Equipment['status'], string> = {
  'active': 'ACTIVE',
  'inactive': 'IDLE',
  'maintenance': 'MAINTENANCE',
}

// Type enum mapping: Backend -> Frontend
const typeMap: Record<string, Equipment['type']> = {
  'EXCAVATOR': 'excavator',
  'LOADER': 'loader',
  'BULLDOZER': 'bulldozer',
  'CRANE': 'crane',
  'TRUCK': 'truck',
  'CRUSHER': 'crusher',
  'OTHER': 'other',
}

// Reverse type mapping: Frontend -> Backend
export const typeToApiMap: Record<Equipment['type'], string> = {
  'excavator': 'EXCAVATOR',
  'loader': 'LOADER',
  'bulldozer': 'BULLDOZER',
  'crane': 'CRANE',
  'truck': 'TRUCK',
  'crusher': 'CRUSHER',
  'screening': 'OTHER',
  'concrete-mixer': 'OTHER',
  'roller': 'OTHER',
  'other': 'OTHER',
}

// Import labels for Arabic translations
const equipmentTypeLabels = {
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

const equipmentStatusLabels = {
  active: { label: 'نشطة', labelEn: 'Active', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  inactive: { label: 'خامدة', labelEn: 'Inactive', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  maintenance: { label: 'في الصيانة', labelEn: 'In Maintenance', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

// Transform API response to frontend Equipment type
export function transformApiEquipment(apiEquipment: ApiEquipmentResponse): Equipment {
  const status = statusMap[apiEquipment.status] || 'inactive'
  const type = typeMap[apiEquipment.type] || 'other'

  return {
    id: apiEquipment.id,
    code: apiEquipment.code,
    name: apiEquipment.name,
    nameAr: apiEquipment.nameAr || '',
    type,
    typeAr: equipmentTypeLabels[type].label,
    brand: apiEquipment.brand || '',
    model: apiEquipment.model || '',
    year: apiEquipment.manufacturingYear || new Date().getFullYear(),
    status,
    statusAr: equipmentStatusLabels[status].label,
    projectId: apiEquipment.currentProjectId || undefined,
    projectName: apiEquipment.project?.name || '',
    projectNameAr: apiEquipment.project?.name || '',
    ownership: 'owned', // Default - backend doesn't track
    ownershipAr: 'ملك الشركة',
    capacity: '',
    capacityUnit: '',
    weight: 0,
    power: 0,
    fuelCapacity: apiEquipment.fuelConsumption || 0,
    totalHours: apiEquipment.totalWorkHours || 0,
    usagePercentage: 0, // Not tracked in backend
    lastMaintenanceDate: apiEquipment.lastMaintenanceDate?.split('T')[0],
    nextMaintenanceDate: apiEquipment.nextMaintenanceDate?.split('T')[0],
    lastServiceHours: 0,
    serviceIntervalHours: 500,
    currentLocation: apiEquipment.location || '',
    currentLocationAr: apiEquipment.location || '',
    purchaseCost: apiEquipment.purchaseCost || 0,
    dailyOperatingCost: apiEquipment.dailyCost || 0,
    hourlyRate: apiEquipment.hourlyRate || 0,
    totalMaintenanceCost: apiEquipment.totalOperatingCost || 0,
    tuvDocumentUrl: '',
    tuvExpiryDate: '',
    assignedWorkerIds: apiEquipment.operatorId ? [apiEquipment.operatorId] : [],
    notes: apiEquipment.description || '',
    notesAr: apiEquipment.description || '',
    imageUrl: apiEquipment.imageUrl || '',
    createdAt: apiEquipment.createdAt,
    updatedAt: apiEquipment.updatedAt,
  }
}

// Transform frontend data to API format
export function transformToApiEquipment(data: CreateEquipmentData | UpdateEquipmentData) {
  const result: Record<string, any> = {}

  if (data.code !== undefined) result.code = data.code
  if (data.name !== undefined) result.name = data.name
  if (data.nameAr !== undefined) result.nameAr = data.nameAr
  if (data.type !== undefined) result.type = typeToApiMap[data.type]
  if (data.brand !== undefined) result.brand = data.brand
  if (data.model !== undefined) result.model = data.model
  if (data.year !== undefined) result.manufacturingYear = data.year
  if (data.status !== undefined) result.status = statusToApiMap[data.status]
  if (data.projectId !== undefined) result.currentProjectId = data.projectId
  if (data.currentLocation !== undefined) result.location = data.currentLocation
  if (data.notes !== undefined) result.description = data.notes
  if (data.imageUrl !== undefined) result.imageUrl = data.imageUrl
  if (data.purchaseCost !== undefined) result.purchaseCost = data.purchaseCost
  if (data.dailyOperatingCost !== undefined) result.dailyCost = data.dailyOperatingCost
  if (data.hourlyRate !== undefined) result.hourlyRate = data.hourlyRate
  if (data.fuelCapacity !== undefined) result.fuelConsumption = data.fuelCapacity
  if (data.totalHours !== undefined) result.totalWorkHours = data.totalHours

  return result
}

// Equipment Service API
export const equipmentService = {
  async getAll(filters?: { type?: string; status?: string; projectId?: string; search?: string }) {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', typeToApiMap[filters.type as Equipment['type']] || filters.type)
    if (filters?.status) params.append('status', statusToApiMap[filters.status as Equipment['status']] || filters.status)
    if (filters?.projectId) params.append('projectId', filters.projectId)
    if (filters?.search) params.append('search', filters.search)
    params.append('page', '1')
    params.append('limit', '100')

    const response = await api.get<PaginatedEquipmentResponse>(`/equipment?${params}`)
    return response.data.data.map(transformApiEquipment)
  },

  async getById(id: string) {
    const response = await api.get<{ success: boolean; data: ApiEquipmentResponse }>(`/equipment/${id}`)
    return transformApiEquipment(response.data.data)
  },

  async create(data: CreateEquipmentData) {
    const apiData = transformToApiEquipment(data)
    const response = await api.post<{ success: boolean; data: ApiEquipmentResponse }>('/equipment', apiData)
    return transformApiEquipment(response.data.data)
  },

  async update(id: string, data: UpdateEquipmentData) {
    const apiData = { id, ...transformToApiEquipment(data) }
    const response = await api.put<{ success: boolean; data: ApiEquipmentResponse }>(`/equipment/${id}`, apiData)
    return transformApiEquipment(response.data.data)
  },

  async delete(id: string) {
    const response = await api.delete(`/equipment/${id}`)
    return response.data
  },
}
