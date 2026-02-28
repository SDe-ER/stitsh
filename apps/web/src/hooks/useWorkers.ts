import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================
export type WorkerRole = 'operator' | 'driver' | 'technician' | 'laborer' | 'supervisor'

export interface Worker {
  id: string
  name: string
  nameAr: string
  role: WorkerRole
  roleAr: string
  phone?: string
  nationalId?: string
  salary?: number
  isActive: boolean
  assignedEquipmentIds: string[]  // Equipment this worker can operate
  createdAt: string
  updatedAt: string
}

export interface CreateWorkerData {
  name: string
  nameAr: string
  role: WorkerRole
  phone?: string
  nationalId?: string
  salary?: number
  assignedEquipmentIds?: string[]
}

export interface UpdateWorkerData extends Partial<CreateWorkerData> {
  isActive?: boolean
}

// Role labels
export const workerRoleLabels = {
  operator: { label: 'مشغل معدات', labelEn: 'Equipment Operator', color: 'bg-blue-100 text-blue-700' },
  driver: { label: 'سائق', labelEn: 'Driver', color: 'bg-green-100 text-green-700' },
  technician: { label: 'فني', labelEn: 'Technician', color: 'bg-amber-100 text-amber-700' },
  laborer: { label: 'عامل', labelEn: 'Laborer', color: 'bg-gray-100 text-gray-700' },
  supervisor: { label: 'مشرف', labelEn: 'Supervisor', color: 'bg-purple-100 text-purple-700' },
}

// ============================================================================
// STORAGE KEY & DEFAULT DATA
// ============================================================================
const WORKERS_KEY = 'heavyops_workers'

const defaultWorkers: Worker[] = [
  {
    id: 'w-1',
    name: 'Ahmed Al-Rashid',
    nameAr: 'أحمد الرشيد',
    role: 'operator',
    roleAr: 'مشغل معدات',
    phone: '+966501234567',
    nationalId: '1234567890',
    salary: 5000,
    isActive: true,
    assignedEquipmentIds: ['eq-1', 'eq-2'],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  },
  {
    id: 'w-2',
    name: 'Khalid Al-Ghamdi',
    nameAr: 'خالد الغامدي',
    role: 'operator',
    roleAr: 'مشغل معدات',
    phone: '+966502345678',
    nationalId: '1234567891',
    salary: 5500,
    isActive: true,
    assignedEquipmentIds: ['eq-3', 'eq-4'],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  },
  {
    id: 'w-3',
    name: 'Mohammed Al-Harbi',
    nameAr: 'محمد الحربي',
    role: 'driver',
    roleAr: 'سائق',
    phone: '+966503456789',
    nationalId: '1234567892',
    salary: 4000,
    isActive: true,
    assignedEquipmentIds: ['eq-5', 'eq-7'],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  },
  {
    id: 'w-4',
    name: 'Fahad Al-Otaibi',
    nameAr: 'فهد العتيبي',
    role: 'technician',
    roleAr: 'فني',
    phone: '+966504567890',
    nationalId: '1234567893',
    salary: 6000,
    isActive: true,
    assignedEquipmentIds: [],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  },
  {
    id: 'w-5',
    name: 'Saud Al-Dossary',
    nameAr: 'سعود الدوسري',
    role: 'supervisor',
    roleAr: 'مشرف',
    phone: '+966505678901',
    nationalId: '1234567894',
    salary: 8000,
    isActive: true,
    assignedEquipmentIds: [],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  },
]

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================
export function getWorkers(): Worker[] {
  if (typeof window === 'undefined') return defaultWorkers
  const stored = localStorage.getItem(WORKERS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultWorkers
    }
  }
  return defaultWorkers
}

export function saveWorkers(workers: Worker[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(workers))
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================
async function fetchWorkers(): Promise<Worker[]> {
  try {
    const response = await fetch('/api/workers')
    if (response.ok) return await response.json()
  } catch (error) {
    console.warn('API fetch failed, using mock data:', error)
  }
  await new Promise((resolve) => setTimeout(resolve, 300))
  return getWorkers().filter(w => w.isActive)
}

async function createWorker(data: CreateWorkerData): Promise<Worker> {
  try {
    const response = await fetch('/api/workers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (response.ok) return await response.json()
  } catch (error) {
    console.warn('API create failed, using mock response:', error)
  }

  await new Promise((resolve) => setTimeout(resolve, 500))

  const workers = getWorkers()
  const newWorker: Worker = {
    id: `w-${Date.now()}`,
    name: data.name,
    nameAr: data.nameAr,
    role: data.role,
    roleAr: workerRoleLabels[data.role].label,
    phone: data.phone,
    nationalId: data.nationalId,
    salary: data.salary,
    isActive: true,
    assignedEquipmentIds: data.assignedEquipmentIds || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  workers.push(newWorker)
  saveWorkers(workers)
  return newWorker
}

async function updateWorker(id: string, data: UpdateWorkerData): Promise<Worker> {
  try {
    const response = await fetch(`/api/workers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (response.ok) return await response.json()
  } catch (error) {
    console.warn('API update failed, using mock response:', error)
  }

  await new Promise((resolve) => setTimeout(resolve, 400))

  const workers = getWorkers()
  const index = workers.findIndex(w => w.id === id)
  if (index === -1) throw new Error('Worker not found')

  const updated = { ...workers[index] }
  if (data.name !== undefined) updated.name = data.name
  if (data.nameAr !== undefined) updated.nameAr = data.nameAr
  if (data.role !== undefined) {
    updated.role = data.role
    updated.roleAr = workerRoleLabels[data.role].label
  }
  if (data.phone !== undefined) updated.phone = data.phone
  if (data.nationalId !== undefined) updated.nationalId = data.nationalId
  if (data.salary !== undefined) updated.salary = data.salary
  if (data.isActive !== undefined) updated.isActive = data.isActive
  if (data.assignedEquipmentIds !== undefined) updated.assignedEquipmentIds = data.assignedEquipmentIds

  updated.updatedAt = new Date().toISOString()
  workers[index] = updated
  saveWorkers(workers)

  return updated
}

async function deleteWorker(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/workers/${id}`, {
      method: 'DELETE',
    })
    if (response.ok) return
  } catch (error) {
    console.warn('API delete failed, using mock response:', error)
  }

  await new Promise((resolve) => setTimeout(resolve, 300))

  const workers = getWorkers()
  const index = workers.findIndex(w => w.id === id)
  if (index !== -1) {
    workers[index].isActive = false
    workers[index].updatedAt = new Date().toISOString()
    saveWorkers(workers)
  }
}

// ============================================================================
// HOOKS
// ============================================================================
export function useWorkers() {
  return useQuery({
    queryKey: ['workers'],
    queryFn: fetchWorkers,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateWorker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      toast.success('تمت إضافة العامل بنجاح')
    },
    onError: (error) => {
      console.error('Create worker error:', error)
      toast.error('فشل إضافة العامل')
    },
  })
}

export function useUpdateWorker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkerData }) =>
      updateWorker(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      toast.success('تم تحديث بيانات العامل بنجاح')
    },
    onError: (error) => {
      console.error('Update worker error:', error)
      toast.error('فشل تحديث بيانات العامل')
    },
  })
}

export function useDeleteWorker() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      toast.success('تم حذف العامل بنجاح')
    },
    onError: (error) => {
      console.error('Delete worker error:', error)
      toast.error('فشل حذف العامل')
    },
  })
}

// Get workers by equipment ID
export function getWorkersByEquipmentId(equipmentId: string): Worker[] {
  const workers = getWorkers()
  return workers.filter(w => w.isActive && w.assignedEquipmentIds.includes(equipmentId))
}

// Get available workers for equipment (those who can operate this equipment type)
export function getAvailableOperatorsForEquipment(equipmentId: string): Worker[] {
  const workers = getWorkers()
  return workers.filter(w =>
    w.isActive &&
    (w.role === 'operator' || w.role === 'driver') &&
    w.assignedEquipmentIds.includes(equipmentId)
  )
}
