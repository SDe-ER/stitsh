import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getEquipment, type EquipmentType } from './useEquipment'

// ============================================================================
// TYPES
// ============================================================================
export type ShiftType = 'day' | 'night'

export interface EquipmentOperation {
  id: string
  date: string
  equipmentId: string
  equipmentCode: string
  equipmentName: string
  equipmentNameAr: string
  equipmentType: EquipmentType
  equipmentTypeAr: string
  projectId: string
  projectCode: string
  projectName: string
  projectNameAr: string
  hours: number
  hourlyRate: number
  totalCost: number
  operator?: string
  operatorAr?: string
  notes?: string
  notesAr?: string
  shift: ShiftType
  shiftAr: string
  createdAt: string
  updatedAt: string
}

export interface CreateEquipmentOperationData {
  date: string
  equipmentId: string
  projectId: string
  hours: number
  hourlyRate?: number
  shift: ShiftType
  operator?: string
  operatorAr?: string
  notes?: string
  notesAr?: string
}

export interface UpdateEquipmentOperationData {
  date?: string
  equipmentId?: string
  projectId?: string
  hours?: number
  hourlyRate?: number
  shift?: ShiftType
  operator?: string
  operatorAr?: string
  notes?: string
  notesAr?: string
}

export interface EquipmentOperationFilters {
  startDate?: string
  endDate?: string
  projectId?: string
  equipmentId?: string
}

export interface EquipmentOperationStats {
  totalHours: number
  totalCost: number
  averageHoursPerOperation: number
  operationCount: number
  costByEquipmentType: { type: string; typeAr: string; cost: number; hours: number }[]
}

// ============================================================================
// FIXED HOURLY RATES
// ============================================================================
export const EQUIPMENT_HOURLY_RATES: Record<EquipmentType, number> = {
  excavator: 80,
  loader: 70,
  bulldozer: 75,
  crane: 100,
  truck: 60,
  crusher: 250,  // 2000 SAR/day ÷ 8 hours
  screening: 200,
  'concrete-mixer': 65,
  roller: 70,
  other: 50
}

// Shift labels
export const shiftLabels = {
  day: { label: 'نهاري', labelEn: 'Day Shift', icon: '☀️' },
  night: { label: 'ليلي', labelEn: 'Night Shift', icon: '🌙' },
}

// ============================================================================
// STORAGE KEY & DEFAULT DATA
// ============================================================================
const EQUIPMENT_OPERATIONS_KEY = 'heavyops_equipment_operations'

const defaultEquipmentOperations: EquipmentOperation[] = [
  {
    id: 'op-1',
    date: '2024-12-20',
    equipmentId: 'eq-1',
    equipmentCode: 'EQ-001',
    equipmentName: 'Caterpillar 320 GC',
    equipmentNameAr: 'كاتربيلر 320 جي سي',
    equipmentType: 'excavator',
    equipmentTypeAr: 'حفار',
    projectId: '1',
    projectCode: 'PRJ-001',
    projectName: 'Riyadh Residential Tower',
    projectNameAr: 'برج الرياض السكني',
    hours: 8,
    hourlyRate: 80,
    totalCost: 640,
    operator: 'Ahmed Al-Rashid',
    operatorAr: 'أحمد الرشيد',
    shift: 'day',
    shiftAr: 'نهاري',
    notes: 'Foundation excavation work',
    notesAr: 'حفر أساسات',
    createdAt: '2024-12-20T08:30:00',
    updatedAt: '2024-12-20T08:30:00',
  },
  {
    id: 'op-2',
    date: '2024-12-20',
    equipmentId: 'eq-2',
    equipmentCode: 'EQ-002',
    equipmentName: 'Komatsu WA380',
    equipmentNameAr: 'كوماتسو WA380',
    equipmentType: 'loader',
    equipmentTypeAr: 'لودر',
    projectId: '1',
    projectCode: 'PRJ-001',
    projectName: 'Riyadh Residential Tower',
    projectNameAr: 'برج الرياض السكني',
    hours: 10,
    hourlyRate: 70,
    totalCost: 700,
    operator: 'Khalid Al-Ghamdi',
    operatorAr: 'خالد الغامدي',
    shift: 'day',
    shiftAr: 'نهاري',
    notes: 'Material loading',
    notesAr: 'تحميل المواد',
    createdAt: '2024-12-20T10:00:00',
    updatedAt: '2024-12-20T10:00:00',
  },
  {
    id: 'op-3',
    date: '2024-12-19',
    equipmentId: 'eq-6',
    equipmentCode: 'EQ-006',
    equipmentName: 'Terex Finlay J-1175',
    equipmentNameAr: 'تيركس فينلي J-1175',
    equipmentType: 'crusher',
    equipmentTypeAr: 'كسارة',
    projectId: '3',
    projectCode: 'PRJ-003',
    projectName: 'Dammam Industrial Complex',
    projectNameAr: 'مجمع الدمام الصناعي',
    hours: 8,
    hourlyRate: 250,
    totalCost: 2000,
    operator: 'Mohammed Al-Harbi',
    operatorAr: 'محمد الحربي',
    shift: 'night',
    shiftAr: 'ليلي',
    notes: 'Crushing operations',
    notesAr: 'عمليات الكسر',
    createdAt: '2024-12-19T17:00:00',
    updatedAt: '2024-12-19T17:00:00',
  },
  {
    id: 'op-4',
    date: '2024-12-19',
    equipmentId: 'eq-5',
    equipmentCode: 'EQ-005',
    equipmentName: 'MAN TGS 41.400',
    equipmentNameAr: 'مان TGS 41.400',
    equipmentType: 'truck',
    equipmentTypeAr: 'شاحنة',
    projectId: '1',
    projectCode: 'PRJ-001',
    projectName: 'Riyadh Residential Tower',
    projectNameAr: 'برج الرياض السكني',
    hours: 6,
    hourlyRate: 60,
    totalCost: 360,
    operator: 'Fahad Al-Otaibi',
    operatorAr: 'فهد العتيبي',
    shift: 'day',
    shiftAr: 'نهاري',
    notes: 'Material transport',
    notesAr: 'نقل المواد',
    createdAt: '2024-12-19T09:00:00',
    updatedAt: '2024-12-19T09:00:00',
  },
  {
    id: 'op-5',
    date: '2024-12-18',
    equipmentId: 'eq-3',
    equipmentCode: 'EQ-003',
    equipmentName: 'Caterpillar D6',
    equipmentNameAr: 'كاتربيلر D6',
    equipmentType: 'bulldozer',
    equipmentTypeAr: 'بلدوزر',
    projectId: '2',
    projectCode: 'PRJ-002',
    projectName: 'Jeddah Commercial Mall',
    projectNameAr: 'مول جدة التجاري',
    hours: 8,
    hourlyRate: 75,
    totalCost: 600,
    operator: 'Saud Al-Dossary',
    operatorAr: 'سعود الدوسري',
    shift: 'day',
    shiftAr: 'نهاري',
    notes: 'Site grading',
    notesAr: 'تسوية الموقع',
    createdAt: '2024-12-18T08:00:00',
    updatedAt: '2024-12-18T08:00:00',
  },
]

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================
export function getEquipmentOperations(): EquipmentOperation[] {
  if (typeof window === 'undefined') return defaultEquipmentOperations
  const stored = localStorage.getItem(EQUIPMENT_OPERATIONS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultEquipmentOperations
    }
  }
  return defaultEquipmentOperations
}

export function saveEquipmentOperations(operations: EquipmentOperation[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EQUIPMENT_OPERATIONS_KEY, JSON.stringify(operations))
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================
async function fetchEquipmentOperations(filters: EquipmentOperationFilters = {}): Promise<EquipmentOperation[]> {
  try {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.projectId) params.append('projectId', filters.projectId)
    if (filters.equipmentId) params.append('equipmentId', filters.equipmentId)

    const response = await fetch(`/api/equipment-operations?${params}`)
    if (response.ok) return await response.json()
  } catch (error) {
    console.warn('API fetch failed, using mock data:', error)
  }

  // Mock data fallback
  await new Promise((resolve) => setTimeout(resolve, 300))
  let filtered = getEquipmentOperations()

  if (filters.startDate) {
    filtered = filtered.filter(op => op.date >= filters.startDate!)
  }

  if (filters.endDate) {
    filtered = filtered.filter(op => op.date <= filters.endDate!)
  }

  if (filters.projectId) {
    filtered = filtered.filter(op => op.projectId === filters.projectId)
  }

  if (filters.equipmentId) {
    filtered = filtered.filter(op => op.equipmentId === filters.equipmentId)
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

async function createEquipmentOperation(data: CreateEquipmentOperationData): Promise<EquipmentOperation> {
  try {
    const response = await fetch('/api/equipment-operations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (response.ok) return await response.json()
  } catch (error) {
    console.warn('API create failed, using mock response:', error)
  }

  // Mock response
  await new Promise((resolve) => setTimeout(resolve, 500))

  const equipment = getEquipment().find(e => e.id === data.equipmentId)
  if (!equipment) throw new Error('Equipment not found')

  // Get hourly rate: use custom rate if provided, otherwise use equipment's rate or default rate
  const hourlyRate = data.hourlyRate || equipment.hourlyRate || EQUIPMENT_HOURLY_RATES[equipment.type]
  const totalCost = data.hours * hourlyRate

  // Get project info (mock for now)
  const projectCode = 'PRJ-XXX'
  const projectName = 'Unknown Project'
  const projectNameAr = 'مشروع غير معروف'

  return {
    id: `op-${Date.now()}`,
    date: data.date,
    equipmentId: data.equipmentId,
    equipmentCode: equipment.code,
    equipmentName: equipment.name,
    equipmentNameAr: equipment.nameAr,
    equipmentType: equipment.type,
    equipmentTypeAr: equipment.typeAr,
    projectId: data.projectId,
    projectCode,
    projectName,
    projectNameAr,
    hours: data.hours,
    hourlyRate,
    totalCost,
    operator: data.operator,
    operatorAr: data.operatorAr,
    shift: data.shift,
    shiftAr: data.shift === 'day' ? 'نهاري' : 'ليلي',
    notes: data.notes,
    notesAr: data.notesAr,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

async function updateEquipmentOperation(id: string, data: UpdateEquipmentOperationData): Promise<EquipmentOperation> {
  try {
    const response = await fetch(`/api/equipment-operations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (response.ok) return await response.json()
  } catch (error) {
    console.warn('API update failed, using mock response:', error)
  }

  // Mock response
  await new Promise((resolve) => setTimeout(resolve, 400))
  const operations = getEquipmentOperations()
  const existing = operations.find(op => op.id === id)
  if (!existing) throw new Error('Equipment operation not found')

  const updated = { ...existing }

  if (data.date !== undefined) updated.date = data.date
  if (data.hours !== undefined) {
    updated.hours = data.hours
    updated.totalCost = data.hours * updated.hourlyRate
  }
  if (data.hourlyRate !== undefined) {
    updated.hourlyRate = data.hourlyRate
    updated.totalCost = updated.hours * data.hourlyRate
  }
  if (data.shift !== undefined) {
    updated.shift = data.shift
    updated.shiftAr = data.shift === 'day' ? 'نهاري' : 'ليلي'
  }
  if (data.operator !== undefined) updated.operator = data.operator
  if (data.operatorAr !== undefined) updated.operatorAr = data.operatorAr
  if (data.notes !== undefined) updated.notes = data.notes
  if (data.notesAr !== undefined) updated.notesAr = data.notesAr

  if (data.equipmentId !== undefined) {
    const equipment = getEquipment().find(e => e.id === data.equipmentId)
    if (equipment) {
      updated.equipmentId = data.equipmentId
      updated.equipmentCode = equipment.code
      updated.equipmentName = equipment.name
      updated.equipmentNameAr = equipment.nameAr
      updated.equipmentType = equipment.type
      updated.equipmentTypeAr = equipment.typeAr
    }
  }

  updated.updatedAt = new Date().toISOString()

  // Update in storage
  const index = operations.findIndex(op => op.id === id)
  if (index !== -1) {
    operations[index] = updated
    saveEquipmentOperations(operations)
  }

  return updated
}

async function deleteEquipmentOperation(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/equipment-operations/${id}`, {
      method: 'DELETE',
    })
    if (response.ok) return
  } catch (error) {
    console.warn('API delete failed, using mock response:', error)
  }

  // Mock response
  await new Promise((resolve) => setTimeout(resolve, 300))
  const operations = getEquipmentOperations()
  const filtered = operations.filter(op => op.id !== id)
  saveEquipmentOperations(filtered)
}

// Helper function to calculate stats from operations
function calculateStats(operations: EquipmentOperation[]): EquipmentOperationStats {
  const totalHours = operations.reduce((sum, op) => sum + op.hours, 0)
  const totalCost = operations.reduce((sum, op) => sum + op.totalCost, 0)
  const operationCount = operations.length
  const averageHoursPerOperation = operationCount > 0 ? totalHours / operationCount : 0

  // Group by equipment type
  const costByEquipmentTypeMap = new Map<string, { type: string; typeAr: string; cost: number; hours: number }>()
  operations.forEach(op => {
    const existing = costByEquipmentTypeMap.get(op.equipmentType)
    if (existing) {
      existing.cost += op.totalCost
      existing.hours += op.hours
    } else {
      costByEquipmentTypeMap.set(op.equipmentType, {
        type: op.equipmentType,
        typeAr: op.equipmentTypeAr,
        cost: op.totalCost,
        hours: op.hours,
      })
    }
  })

  const costByEquipmentType = Array.from(costByEquipmentTypeMap.values())

  return {
    totalHours,
    totalCost,
    averageHoursPerOperation,
    operationCount,
    costByEquipmentType,
  }
}

async function fetchEquipmentOperationStats(filters: EquipmentOperationFilters = {}): Promise<EquipmentOperationStats> {
  const operations = await fetchEquipmentOperations(filters)
  return calculateStats(operations)
}

// Calculate initial stats from default data
const initialStats = calculateStats(defaultEquipmentOperations)

// ============================================================================
// HOOKS
// ============================================================================
export function useEquipmentOperations(filters?: EquipmentOperationFilters) {
  return useQuery({
    queryKey: ['equipmentOperations', filters],
    queryFn: () => fetchEquipmentOperations(filters || {}),
    staleTime: 1 * 60 * 1000,
    retry: false,
    initialData: defaultEquipmentOperations,
  })
}

export function useCreateEquipmentOperation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEquipmentOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentOperations'] })
      toast.success('تم تسجيل تشغيل المعدة بنجاح')
    },
    onError: (error) => {
      console.error('Create equipment operation error:', error)
      toast.error('فشل تسجيل تشغيل المعدة')
    },
  })
}

export function useUpdateEquipmentOperation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEquipmentOperationData }) =>
      updateEquipmentOperation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentOperations'] })
      toast.success('تم تحديث تشغيل المعدة بنجاح')
    },
    onError: (error) => {
      console.error('Update equipment operation error:', error)
      toast.error('فشل تحديث تشغيل المعدة')
    },
  })
}

export function useDeleteEquipmentOperation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEquipmentOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentOperations'] })
      toast.success('تم حذف سجل التشغيل بنجاح')
    },
    onError: (error) => {
      console.error('Delete equipment operation error:', error)
      toast.error('فشل حذف سجل التشغيل')
    },
  })
}

export function useEquipmentOperationStats(filters?: EquipmentOperationFilters) {
  return useQuery({
    queryKey: ['equipmentOperationStats', filters],
    queryFn: () => fetchEquipmentOperationStats(filters || {}),
    staleTime: 1 * 60 * 1000,
    retry: false,
    initialData: initialStats,
  })
}

// Get hourly rate for equipment
export function getEquipmentHourlyRate(equipmentId: string): number {
  const equipment = getEquipment().find(e => e.id === equipmentId)
  if (!equipment) return 50 // Default fallback

  return equipment.hourlyRate || EQUIPMENT_HOURLY_RATES[equipment.type]
}
