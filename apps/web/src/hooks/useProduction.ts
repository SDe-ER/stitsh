import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================
export type ProductionMethod = 'tipper' | 'excavator' | 'hourly'
export type ShiftType = 'day' | 'night'
export type CrusherType = 'primary' | 'secondary' | 'tertiary' | 'screening'

export interface Crusher {
  id: string
  projectId: string
  name: string
  nameAr: string
  type: CrusherType
  typeAr: string
  location?: string
  locationAr?: string
  capacity?: number  // tons per hour
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductionRecord {
  id: string
  projectId: string
  date: string
  shift: ShiftType
  shiftAr: string
  method: ProductionMethod
  methodAr: string
  crusherId?: string  // Optional - if null, it's general site production
  crusherName?: string
  crusherNameAr?: string
  itemId?: string  // Link to BOQ item if applicable
  itemName?: string
  itemNameAr?: string
  // For tipper & excavator methods
  quantity?: number
  unit?: string
  unitAr?: string
  // For tipper method specific
  tipperCount?: number
  tipperVolume?: number  // Volume per trip in m3
  tripsCount?: number
  // For hourly method
  hours?: number
  hourlyRate?: number
  notes?: string
  notesAr?: string
  recordedBy: string
  recordedByAr: string
  createdAt: string
  updatedAt: string
}

export interface TipperType {
  id: string
  name: string
  nameAr: string
  volume: number  // in m3
  capacity: number  // in tons
}

export interface CreateProductionData {
  projectId: string
  date: string
  shift: ShiftType
  method: ProductionMethod
  crusherId?: string  // Optional - if not provided, it's general site production
  itemId?: string
  // For tipper & excavator
  quantity?: number
  // For tipper specific
  tipperTypeId?: string
  tripsCount?: number
  // For hourly
  hours?: number
  hourlyRate?: number
  notes?: string
}

// ============================================================================
// TIPPER TYPES (صندوق القلابات) - Stored in localStorage
// ============================================================================
const TIPPER_TYPES_KEY = 'heavyops_tipper_types'

const defaultTipperTypes: TipperType[] = [
  { id: 'tipper-1', name: 'Small Tipper', nameAr: 'قلاب صغير', volume: 8, capacity: 15 },
  { id: 'tipper-2', name: 'Medium Tipper', nameAr: 'قلاب متوسط', volume: 12, capacity: 20 },
  { id: 'tipper-3', name: 'Large Tipper', nameAr: 'قلاب كبير', volume: 16, capacity: 25 },
  { id: 'tipper-4', name: 'Extra Large Tipper', nameAr: 'قلاب كبير جداً', volume: 20, capacity: 30 },
  { id: 'tipper-5', name: 'Trailer Tipper', nameAr: 'قلاب تريل', volume: 24, capacity: 35 },
]

export function getTipperTypes(): TipperType[] {
  if (typeof window === 'undefined') return defaultTipperTypes
  const stored = localStorage.getItem(TIPPER_TYPES_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultTipperTypes
    }
  }
  return defaultTipperTypes
}

export function saveTipperTypes(types: TipperType[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TIPPER_TYPES_KEY, JSON.stringify(types))
  }
}

export const tipperTypes = getTipperTypes()

// Shift labels
export const shiftLabels = {
  day: { label: 'نهاري', labelEn: 'Day Shift', icon: '☀️' },
  night: { label: 'ليلي', labelEn: 'Night Shift', icon: '🌙' },
}

// Crusher type labels
export const crusherTypeLabels = {
  primary: { label: 'كسارة أولية', labelEn: 'Primary Crusher' },
  secondary: { label: 'كسارة ثانوية', labelEn: 'Secondary Crusher' },
  tertiary: { label: 'كسارة ثلاثية', labelEn: 'Tertiary Crusher' },
  screening: { label: 'غربلة', labelEn: 'Screening' },
}

// ============================================================================
// CRUSHERS (الكسارات) - Stored in localStorage
// ============================================================================
const CRUSHERS_KEY = 'heavyops_crushers'

const defaultCrushers: Crusher[] = [
  {
    id: 'crusher-1',
    projectId: '1',
    name: 'Primary Crusher 1',
    nameAr: 'كسارة أولية 1',
    type: 'primary',
    typeAr: 'كسارة أولية',
    location: 'Site A - North',
    locationAr: 'الموقع أ - شمال',
    capacity: 500,
    isActive: true,
    createdAt: '2024-01-10T00:00:00',
    updatedAt: '2024-01-10T00:00:00',
  },
  {
    id: 'crusher-2',
    projectId: '1',
    name: 'Secondary Crusher 1',
    nameAr: 'كسارة ثانوية 1',
    type: 'secondary',
    typeAr: 'كسارة ثانوية',
    location: 'Site A - South',
    locationAr: 'الموقع أ - جنوب',
    capacity: 300,
    isActive: true,
    createdAt: '2024-01-10T00:00:00',
    updatedAt: '2024-01-10T00:00:00',
  },
  {
    id: 'crusher-3',
    projectId: '1',
    name: 'Screening Plant 1',
    nameAr: 'غربلة 1',
    type: 'screening',
    typeAr: 'غربلة',
    location: 'Site B',
    locationAr: 'الموقع ب',
    capacity: 200,
    isActive: true,
    createdAt: '2024-01-15T00:00:00',
    updatedAt: '2024-01-15T00:00:00',
  },
]

export function getCrushers(projectId?: string): Crusher[] {
  if (typeof window === 'undefined') return defaultCrushers.filter(c => !projectId || c.projectId === projectId)
  const stored = localStorage.getItem(CRUSHERS_KEY)
  let crushers: Crusher[] = defaultCrushers
  if (stored) {
    try {
      crushers = JSON.parse(stored)
    } catch {
      crushers = defaultCrushers
    }
  }
  return crushers.filter(c => !projectId || c.projectId === projectId)
}

export function saveCrushers(crushers: Crusher[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CRUSHERS_KEY, JSON.stringify(crushers))
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================
const mockProductionRecords: ProductionRecord[] = [
  {
    id: 'prod-1',
    projectId: '1',
    date: '2024-12-20',
    shift: 'day',
    shiftAr: 'نهاري',
    method: 'tipper',
    methodAr: 'قلابات',
    crusherId: 'crusher-1',
    crusherName: 'Primary Crusher 1',
    crusherNameAr: 'كسارة أولية 1',
    itemId: 'item-1',
    itemName: 'Concrete Works - Foundation',
    itemNameAr: 'أعمال الخرسانة - الأساسات',
    quantity: 192,
    unit: 'm3',
    unitAr: 'متر مكعب',
    tipperCount: 8,
    tipperVolume: 12,
    tripsCount: 16,
    recordedBy: 'Ahmed Al-Rashid',
    recordedByAr: 'أحمد الرشيد',
    notes: 'Concrete pouring for foundation',
    notesAr: 'صب خرسانة للأساسات',
    createdAt: '2024-12-20T08:30:00',
    updatedAt: '2024-12-20T08:30:00',
  },
  {
    id: 'prod-2',
    projectId: '1',
    date: '2024-12-20',
    shift: 'day',
    shiftAr: 'نهاري',
    method: 'excavator',
    methodAr: 'رفع مساحي',
    // No crusher - general site production
    crusherName: 'عام',
    crusherNameAr: 'عام',
    itemId: 'item-3',
    itemName: 'Block Work - Walls',
    itemNameAr: 'أعمال البلوك - الجدران',
    quantity: 450,
    unit: 'm3',
    unitAr: 'متر مكعب',
    recordedBy: 'Khalid Al-Ghamdi',
    recordedByAr: 'خالد الغامدي',
    notes: 'Excavation for block work',
    notesAr: 'حفر لأعمال البلوك',
    createdAt: '2024-12-20T14:00:00',
    updatedAt: '2024-12-20T14:00:00',
  },
  {
    id: 'prod-3',
    projectId: '1',
    date: '2024-12-19',
    shift: 'night',
    shiftAr: 'ليلي',
    method: 'hourly',
    methodAr: 'بالساعة',
    crusherId: 'crusher-2',
    crusherName: 'Secondary Crusher 1',
    crusherNameAr: 'كسارة ثانوية 1',
    itemId: 'item-8',
    itemName: 'HVAC System',
    itemNameAr: 'نظام التكييف',
    hours: 8,
    hourlyRate: 150,
    recordedBy: 'Mohammed Al-Harbi',
    recordedByAr: 'محمد الحربي',
    notes: 'HVAC installation work',
    notesAr: 'تركيب نظام التكييف',
    createdAt: '2024-12-19T17:00:00',
    updatedAt: '2024-12-19T17:00:00',
  },
  {
    id: 'prod-4',
    projectId: '1',
    date: '2024-12-19',
    shift: 'night',
    shiftAr: 'ليلي',
    method: 'tipper',
    methodAr: 'قلابات',
    crusherId: 'crusher-1',
    crusherName: 'Primary Crusher 1',
    crusherNameAr: 'كسارة أولية 1',
    itemId: 'item-1',
    itemName: 'Concrete Works - Foundation',
    itemNameAr: 'أعمال الخرسانة - الأساسات',
    quantity: 240,
    unit: 'm3',
    unitAr: 'متر مكعب',
    tipperCount: 10,
    tipperVolume: 12,
    tripsCount: 20,
    recordedBy: 'Ahmed Al-Rashid',
    recordedByAr: 'أحمد الرشيد',
    createdAt: '2024-12-19T10:00:00',
    updatedAt: '2024-12-19T10:00:00',
  },
  {
    id: 'prod-5',
    projectId: '1',
    date: '2024-12-18',
    shift: 'day',
    shiftAr: 'نهاري',
    method: 'excavator',
    methodAr: 'رفع مساحي',
    // No crusher - general site production
    crusherName: 'عام',
    crusherNameAr: 'عام',
    itemId: 'item-2',
    itemName: 'Steel Reinforcement',
    itemNameAr: 'حديد التسليح',
    quantity: 85,
    unit: 'm3',
    unitAr: 'متر مكعب',
    recordedBy: 'Fahad Al-Otaibi',
    recordedByAr: 'فهد العتيبي',
    notes: 'Earth excavation for reinforcement',
    notesAr: 'حفر أرضي لحديد التسليح',
    createdAt: '2024-12-18T11:30:00',
    updatedAt: '2024-12-18T11:30:00',
  },
]

// ============================================================================
// API FUNCTIONS
// ============================================================================
export interface ProductionFilters {
  projectId: string
  startDate?: string
  endDate?: string
  method?: ProductionMethod | 'all'
}

async function fetchProductionRecords(filters: ProductionFilters): Promise<ProductionRecord[]> {
  try {
    const params = new URLSearchParams({ projectId: filters.projectId })
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.method && filters.method !== 'all') params.append('method', filters.method)

    const response = await fetch(`/api/production?${params}`)
    if (!response.ok) throw new Error('Failed to fetch production records')
    return await response.json()
  } catch (error) {
    console.warn('API fetch failed, using mock data:', error)
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filtered = mockProductionRecords.filter(r => r.projectId === filters.projectId)

    if (filters.method && filters.method !== 'all') {
      filtered = filtered.filter(r => r.method === filters.method)
    }

    if (filters.startDate) {
      filtered = filtered.filter(r => r.date >= filters.startDate!)
    }

    if (filters.endDate) {
      filtered = filtered.filter(r => r.date <= filters.endDate!)
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}

async function createProduction(data: CreateProductionData): Promise<ProductionRecord> {
  try {
    const response = await fetch('/api/production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create production record')
    return await response.json()
  } catch (error) {
    console.warn('API create failed, using mock response:', error)
    await new Promise((resolve) => setTimeout(resolve, 500))

    const tipperType = data.tipperTypeId ? tipperTypes.find(t => t.id === data.tipperTypeId) : undefined
    const quantity = data.method === 'tipper' && tipperType && data.tripsCount
      ? tipperType.volume * data.tripsCount
      : data.quantity

    const crusher = data.crusherId ? getCrushers(data.projectId).find(c => c.id === data.crusherId) : undefined

    return {
      id: `prod-${Date.now()}`,
      projectId: data.projectId,
      date: data.date,
      shift: data.shift,
      shiftAr: data.shift === 'day' ? 'نهاري' : 'ليلي',
      method: data.method,
      methodAr: data.method === 'tipper' ? 'قلابات' : data.method === 'excavator' ? 'رفع مساحي' : 'بالساعة',
      crusherId: data.crusherId,
      crusherName: crusher?.name || 'عام',
      crusherNameAr: crusher?.nameAr || 'عام',
      quantity,
      unit: data.method === 'hourly' ? undefined : 'm3',
      unitAr: data.method === 'hourly' ? undefined : 'متر مكعب',
      tipperVolume: tipperType?.volume,
      tripsCount: data.tripsCount,
      hours: data.hours,
      hourlyRate: data.hourlyRate,
      notes: data.notes,
      recordedBy: 'Ahmed Al-Rashid',
      recordedByAr: 'أحمد الرشيد',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

async function updateProduction(id: string, data: Partial<CreateProductionData>): Promise<ProductionRecord> {
  try {
    const response = await fetch(`/api/production/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update production record')
    return await response.json()
  } catch (error) {
    console.warn('API update failed, using mock response:', error)
    await new Promise((resolve) => setTimeout(resolve, 400))
    const existing = mockProductionRecords.find(r => r.id === id)
    if (!existing) throw new Error('Production record not found')
    return { ...existing, ...data, updatedAt: new Date().toISOString() } as ProductionRecord
  }
}

async function deleteProduction(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/production/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete production record')
  } catch (error) {
    console.warn('API delete failed, using mock response:', error)
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
}

// ============================================================================
// HOOKS
// ============================================================================
export function useProductionRecords(filters: ProductionFilters) {
  return useQuery({
    queryKey: ['production', filters],
    queryFn: () => fetchProductionRecords(filters),
    enabled: !!filters.projectId,
    staleTime: 1 * 60 * 1000,
  })
}

export function useCreateProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production'] })
      toast.success('تم تسجيل الإنتاج بنجاح')
    },
    onError: (error) => {
      console.error('Create production error:', error)
      toast.error('فشل تسجيل الإنتاج')
    },
  })
}

export function useUpdateProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductionData> }) =>
      updateProduction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['production'] })
      toast.success('تم تحديث الإنتاج بنجاح')
    },
    onError: (error) => {
      console.error('Update production error:', error)
      toast.error('فشل تحديث الإنتاج')
    },
  })
}

export function useDeleteProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production'] })
      toast.success('تم حذف سجل الإنتاج بنجاح')
    },
    onError: (error) => {
      console.error('Delete production error:', error)
      toast.error('فشل حذف سجل الإنتاج')
    },
  })
}

// ============================================================================
// TIPPER TYPE MANAGEMENT HOOKS
// ============================================================================
export function useTipperTypes() {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['tipperTypes'],
    queryFn: () => {
      const types = getTipperTypes()
      return types
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateTipperType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<TipperType, 'id'>) => {
      const types = getTipperTypes()
      const newType: TipperType = {
        ...data,
        id: `tipper-${Date.now()}`,
      }
      types.push(newType)
      saveTipperTypes(types)
      return newType
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipperTypes'] })
      toast.success('تم إضافة نوع القلاب بنجاح')
    },
    onError: (error) => {
      console.error('Create tipper type error:', error)
      toast.error('فشل إضافة نوع القلاب')
    },
  })
}

export function useUpdateTipperType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TipperType> }) => {
      const types = getTipperTypes()
      const index = types.findIndex(t => t.id === id)
      if (index === -1) throw new Error('Tipper type not found')
      types[index] = { ...types[index], ...data }
      saveTipperTypes(types)
      return types[index]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipperTypes'] })
      toast.success('تم تحديث نوع القلاب بنجاح')
    },
    onError: (error) => {
      console.error('Update tipper type error:', error)
      toast.error('فشل تحديث نوع القلاب')
    },
  })
}

export function useDeleteTipperType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      const types = getTipperTypes()
      const filtered = types.filter(t => t.id !== id)
      if (filtered.length === types.length) throw new Error('Tipper type not found')
      saveTipperTypes(filtered)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipperTypes'] })
      toast.success('تم حذف نوع القلاب بنجاح')
    },
    onError: (error) => {
      console.error('Delete tipper type error:', error)
      toast.error('فشل حذف نوع القلاب')
    },
  })
}

// ============================================================================
// CRUSHER MANAGEMENT HOOKS
// ============================================================================
export function useCrushers(projectId?: string) {
  return useQuery({
    queryKey: ['crushers', projectId],
    queryFn: () => getCrushers(projectId),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateCrusher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Crusher, 'id' | 'createdAt' | 'updatedAt'>) => {
      const crushers = getCrushers()
      const newCrusher: Crusher = {
        ...data,
        id: `crusher-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      crushers.push(newCrusher)
      saveCrushers(crushers)
      return newCrusher
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crushers'] })
      toast.success('تم إضافة الكسارة بنجاح')
    },
    onError: (error) => {
      console.error('Create crusher error:', error)
      toast.error('فشل إضافة الكسارة')
    },
  })
}

export function useUpdateCrusher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Crusher> }) => {
      const crushers = getCrushers()
      const index = crushers.findIndex(c => c.id === id)
      if (index === -1) throw new Error('Crusher not found')
      crushers[index] = { ...crushers[index], ...data, updatedAt: new Date().toISOString() }
      saveCrushers(crushers)
      return crushers[index]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crushers'] })
      toast.success('تم تحديث الكسارة بنجاح')
    },
    onError: (error) => {
      console.error('Update crusher error:', error)
      toast.error('فشل تحديث الكسارة')
    },
  })
}

export function useDeleteCrusher() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      const crushers = getCrushers()
      const filtered = crushers.filter(c => c.id !== id)
      if (filtered.length === crushers.length) throw new Error('Crusher not found')
      saveCrushers(filtered)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crushers'] })
      toast.success('تم حذف الكسارة بنجاح')
    },
    onError: (error) => {
      console.error('Delete crusher error:', error)
      toast.error('فشل حذف الكسارة')
    },
  })
}
