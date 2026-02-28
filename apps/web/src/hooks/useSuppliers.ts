import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================

export type SupplierCategory =
  | 'materials'
  | 'equipment'
  | 'subcontractor'
  | 'services'
  | 'fuel'
  | 'rentals'
  | 'other'

export interface Client {
  id: string
  name: string
  nameAr: string
  commercialRegistration: string
  vatNumber: string
  contactPerson: string
  contactPersonAr: string
  phone: string
  email?: string
  address: string
  addressAr: string
  activeProjects: number
  totalContracts: number
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: string
  name: string
  nameAr: string
  category: SupplierCategory
  categoryAr: string
  contactPerson: string
  contactPersonAr: string
  phone: string
  email?: string
  address: string
  addressAr: string
  rating: number
  lastOrderDate?: string
  totalOrders: number
  createdAt: string
  updatedAt: string
}

export interface CreateClientData {
  name: string
  nameAr: string
  commercialRegistration: string
  vatNumber: string
  contactPerson: string
  contactPersonAr: string
  phone: string
  email?: string
  address: string
  addressAr: string
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: string
}

export interface CreateSupplierData {
  name: string
  nameAr: string
  category: SupplierCategory
  contactPerson: string
  contactPersonAr: string
  phone: string
  email?: string
  address: string
  addressAr: string
  rating?: number
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  id: string
}

// ============================================================================
// LABELS
// ============================================================================

export const supplierCategoryLabels: Record<SupplierCategory, { label: string; labelAr: string; icon: string }> = {
  materials: { label: 'Materials', labelAr: 'المواد', icon: '🧱' },
  equipment: { label: 'Equipment', labelAr: 'المعدات', icon: '⚙️' },
  subcontractor: { label: 'Subcontractor', labelAr: 'المقاولين من الباطن', icon: '👷' },
  services: { label: 'Services', labelAr: 'الخدمات', icon: '🔧' },
  fuel: { label: 'Fuel', labelAr: 'الوقود', icon: '⛽' },
  rentals: { label: 'Rentals', labelAr: 'الإيجارات', icon: '🚛' },
  other: { label: 'Other', labelAr: 'أخرى', icon: '📦' },
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const defaultClients: Client[] = [
  {
    id: '1',
    name: 'Saudi Binladin Group',
    nameAr: 'مجموعة بن لادن السعودية',
    commercialRegistration: '1010000000',
    vatNumber: '300000000000003',
    contactPerson: 'Mohammed Al-Ghamdi',
    contactPersonAr: 'محمد الغامدي',
    phone: '+966-50-1234567',
    email: 'projects@binladin.com.sa',
    address: 'P.O. Box 54425, Riyadh',
    addressAr: 'ص.ب. 54425، الرياض',
    activeProjects: 3,
    totalContracts: 15000000,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Al Rajhi Construction',
    nameAr: 'الراجحي للمقاولات',
    commercialRegistration: '1020000000',
    vatNumber: '300000000000004',
    contactPerson: 'Abdullah Al-Rajhi',
    contactPersonAr: 'عبدالله الراجحي',
    phone: '+966-50-2345678',
    email: 'info@alrajhi-const.com.sa',
    address: 'P.O. Box 78945, Jeddah',
    addressAr: 'ص.ب. 78945، جدة',
    activeProjects: 2,
    totalContracts: 8500000,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-11-15T10:00:00Z',
  },
  {
    id: '3',
    name: 'Saudi Oger Ltd.',
    nameAr: 'شركة أوجر السعودية المحدودة',
    commercialRegistration: '1030000000',
    vatNumber: '300000000000005',
    contactPerson: 'Khaled Al-Harbi',
    contactPersonAr: 'خالد الحربي',
    phone: '+966-50-3456789',
    email: 'contact@saudioger.com.sa',
    address: 'P.O. Box 65432, Dammam',
    addressAr: 'ص.ب. 65432، الدمام',
    activeProjects: 1,
    totalContracts: 5000000,
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-10-20T10:00:00Z',
  },
  {
    id: '4',
    name: 'El Seif Engineering Contracting',
    nameAr: 'السيف للهندسة والمقاولات',
    commercialRegistration: '1040000000',
    vatNumber: '300000000000006',
    contactPerson: 'Fahad Al-Otaibi',
    contactPersonAr: 'فهد العتيبي',
    phone: '+966-50-4567890',
    email: 'projects@elseif.com.sa',
    address: 'P.O. Box 12345, Riyadh',
    addressAr: 'ص.ب. 12345، الرياض',
    activeProjects: 4,
    totalContracts: 22000000,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  {
    id: '5',
    name: 'Nesma & Partners',
    nameAr: 'نسمة وشركاؤها',
    commercialRegistration: '1050000000',
    vatNumber: '300000000000007',
    contactPerson: 'Rashid Al-Mutairi',
    contactPersonAr: 'راشع المطيري',
    phone: '+966-50-5678901',
    email: 'info@nesma.com',
    address: 'P.O. Box 98765, Al-Khobar',
    addressAr: 'ص.ب. 98765، الخبر',
    activeProjects: 2,
    totalContracts: 12000000,
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-11-25T10:00:00Z',
  },
]

const defaultSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Saudi Ready Mix',
    nameAr: 'الخرسانة الجاهزة السعودية',
    category: 'materials',
    categoryAr: 'المواد',
    contactPerson: 'Ahmed Al-Qahtani',
    contactPersonAr: 'أحمد القحطاني',
    phone: '+966-53-1234567',
    email: 'sales@saudi-ready-mix.com',
    address: 'Industrial City, Riyadh',
    addressAr: 'ال مدينة الصناعية، الرياض',
    rating: 5,
    lastOrderDate: '2024-12-10T10:00:00Z',
    totalOrders: 45,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z',
  },
  {
    id: '2',
    name: 'Al-Kifah Equipment Rental',
    nameAr: 'الكفح لتأجير المعدات',
    category: 'rentals',
    categoryAr: 'الإيجارات',
    contactPerson: 'Omar Al-Zahrani',
    contactPersonAr: 'عمر الزهراني',
    phone: '+966-53-2345678',
    email: 'rentals@alkifah.com',
    address: 'P.O. Box 34567, Dammam',
    addressAr: 'ص.ب. 34567، الدمام',
    rating: 4,
    lastOrderDate: '2024-12-08T10:00:00Z',
    totalOrders: 32,
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-12-08T10:00:00Z',
  },
  {
    id: '3',
    name: 'Petromin Corporation',
    nameAr: 'مؤسسة بترومين',
    category: 'fuel',
    categoryAr: 'الوقود',
    contactPerson: 'Khalid Al-Dossary',
    contactPersonAr: 'خالد الدوسري',
    phone: '+966-53-3456789',
    email: 'fuel@petromin.com.sa',
    address: 'Riyadh - Jeddah Highway',
    addressAr: 'طريق الرياض - جدة',
    rating: 5,
    lastOrderDate: '2024-12-12T10:00:00Z',
    totalOrders: 67,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-12-12T10:00:00Z',
  },
  {
    id: '4',
    name: 'Al-Ayuni Investment and Contracting',
    nameAr: 'الأيوني للاستثمار والمقاولات',
    category: 'subcontractor',
    categoryAr: 'المقاولين من الباطن',
    contactPerson: 'Saud Al-Shammari',
    contactPersonAr: 'سعود الشمري',
    phone: '+966-53-4567890',
    email: 'projects@alayuni.com',
    address: 'P.O. Box 56789, Riyadh',
    addressAr: 'ص.ب. 56789، الرياض',
    rating: 4,
    lastOrderDate: '2024-11-28T10:00:00Z',
    totalOrders: 18,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-11-28T10:00:00Z',
  },
  {
    id: '5',
    name: 'Hassan Allam Holding',
    nameAr: 'حسن علام القابضة',
    category: 'subcontractor',
    categoryAr: 'المقاولين من الباطن',
    contactPerson: 'Majid Al-Saud',
    contactPersonAr: 'ماجد السعود',
    phone: '+966-53-5678901',
    email: 'ksa@hassanallam.com',
    address: 'Olaya Street, Riyadh',
    addressAr: 'شارع العليا، الرياض',
    rating: 5,
    lastOrderDate: '2024-12-05T10:00:00Z',
    totalOrders: 24,
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z',
  },
  {
    id: '6',
    name: 'Zamil Heavy Industries',
    nameAr: 'الزامل للصناعات الثقيلة',
    category: 'equipment',
    categoryAr: 'المعدات',
    contactPerson: 'Faisal Al-Bugami',
    contactPersonAr: 'فيصل البقامي',
    phone: '+966-53-6789012',
    email: 'sales@zamil.com',
    address: 'Dammam Industrial City',
    addressAr: 'ال مدينة الصناعية بالدمام',
    rating: 4,
    lastOrderDate: '2024-11-30T10:00:00Z',
    totalOrders: 15,
    createdAt: '2024-04-10T10:00:00Z',
    updatedAt: '2024-11-30T10:00:00Z',
  },
  {
    id: '7',
    name: 'Abdullah Al-Barrak & Sons',
    nameAr: 'عبدالله البراك وأبناؤه',
    category: 'materials',
    categoryAr: 'المواد',
    contactPerson: 'Nawaf Al-Barrak',
    contactPersonAr: 'نواف البراك',
    phone: '+966-53-7890123',
    email: 'sales@albarrak.com',
    address: 'Riyadh',
    addressAr: 'الرياض',
    rating: 5,
    lastOrderDate: '2024-12-09T10:00:00Z',
    totalOrders: 56,
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-12-09T10:00:00Z',
  },
  {
    id: '8',
    name: 'Kamal Al-Din Electrical Works',
    nameAr: 'كمال الدين للأعمال الكهربائية',
    category: 'services',
    categoryAr: 'الخدمات',
    contactPerson: 'Ibrahim Al-Omar',
    contactPersonAr: 'إبراهيم العمر',
    phone: '+966-53-8901234',
    email: 'info@kamalaldin.com',
    address: 'P.O. Box 23456, Jeddah',
    addressAr: 'ص.ب. 23456، جدة',
    rating: 4,
    lastOrderDate: '2024-11-20T10:00:00Z',
    totalOrders: 12,
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2024-11-20T10:00:00Z',
  },
]

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

const CLIENTS_STORAGE_KEY = 'heavyops_clients'
const SUPPLIERS_STORAGE_KEY = 'heavyops_suppliers'

function getClientsFromStorage(): Client[] {
  if (typeof window === 'undefined') return defaultClients
  try {
    const stored = localStorage.getItem(CLIENTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : defaultClients
  } catch {
    return defaultClients
  }
}

function getSuppliersFromStorage(): Supplier[] {
  if (typeof window === 'undefined') return defaultSuppliers
  try {
    const stored = localStorage.getItem(SUPPLIERS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : defaultSuppliers
  } catch {
    return defaultSuppliers
  }
}

function saveClientsToStorage(clients: Client[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients))
}

function saveSuppliersToStorage(suppliers: Supplier[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SUPPLIERS_STORAGE_KEY, JSON.stringify(suppliers))
}

// ============================================================================
// CLIENTS HOOKS
// ============================================================================

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => getClientsFromStorage(),
    retry: false,
    initialData: getClientsFromStorage(),
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClientData) => {
      const clients = getClientsFromStorage()
      const newClient: Client = {
        id: Date.now().toString(),
        ...data,
        activeProjects: 0,
        totalContracts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      clients.push(newClient)
      saveClientsToStorage(clients)
      return Promise.resolve(newClient)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('تم إضافة العميل بنجاح', { description: 'Client added successfully' })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateClientData) => {
      const clients = getClientsFromStorage()
      const index = clients.findIndex((c) => c.id === data.id)
      if (index === -1) throw new Error('Client not found')

      const updatedClient = {
        ...clients[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      clients[index] = updatedClient
      saveClientsToStorage(clients)
      return Promise.resolve(updatedClient)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('تم تحديث بيانات العميل بنجاح', { description: 'Client updated successfully' })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      const clients = getClientsFromStorage()
      const filtered = clients.filter((c) => c.id !== id)
      saveClientsToStorage(filtered)
      return Promise.resolve(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('تم حذف العميل بنجاح', { description: 'Client deleted successfully' })
    },
  })
}

// ============================================================================
// SUPPLIERS HOOKS
// ============================================================================

export function useSuppliers(category?: SupplierCategory) {
  return useQuery({
    queryKey: ['suppliers', category],
    queryFn: () => {
      const suppliers = getSuppliersFromStorage()
      if (category) {
        return suppliers.filter((s) => s.category === category)
      }
      return suppliers
    },
    retry: false,
    initialData: () => {
      const suppliers = getSuppliersFromStorage()
      if (category) {
        return suppliers.filter((s) => s.category === category)
      }
      return suppliers
    },
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSupplierData) => {
      const suppliers = getSuppliersFromStorage()
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        ...data,
        categoryAr: supplierCategoryLabels[data.category].labelAr,
        rating: data.rating || 5,
        totalOrders: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      suppliers.push(newSupplier)
      saveSuppliersToStorage(suppliers)
      return Promise.resolve(newSupplier)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('تم إضافة المورد بنجاح', { description: 'Supplier added successfully' })
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSupplierData) => {
      const suppliers = getSuppliersFromStorage()
      const index = suppliers.findIndex((s) => s.id === data.id)
      if (index === -1) throw new Error('Supplier not found')

      const updatedSupplier = {
        ...suppliers[index],
        ...data,
        categoryAr: data.category ? supplierCategoryLabels[data.category].labelAr : suppliers[index].categoryAr,
        updatedAt: new Date().toISOString(),
      }
      suppliers[index] = updatedSupplier
      saveSuppliersToStorage(suppliers)
      return Promise.resolve(updatedSupplier)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('تم تحديث بيانات المورد بنجاح', { description: 'Supplier updated successfully' })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      const suppliers = getSuppliersFromStorage()
      const filtered = suppliers.filter((s) => s.id !== id)
      saveSuppliersToStorage(filtered)
      return Promise.resolve(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('تم حذف المورد بنجاح', { description: 'Supplier deleted successfully' })
    },
  })
}

// ============================================================================
// STATS HOOKS
// ============================================================================

export interface ClientStats {
  totalClients: number
  totalActiveProjects: number
  totalContracts: number
  topClients: Client[]
}

export interface SupplierStats {
  totalSuppliers: number
  totalOrders: number
  averageRating: number
  topSuppliers: Supplier[]
}

export function useClientStats() {
  return useQuery({
    queryKey: ['client-stats'],
    queryFn: () => {
      const clients = getClientsFromStorage()
      const totalClients = clients.length
      const totalActiveProjects = clients.reduce((sum, c) => sum + c.activeProjects, 0)
      const totalContracts = clients.reduce((sum, c) => sum + c.totalContracts, 0)
      const topClients = [...clients].sort((a, b) => b.totalContracts - a.totalContracts).slice(0, 5)

      return {
        totalClients,
        totalActiveProjects,
        totalContracts,
        topClients,
      }
    },
    retry: false,
  })
}

export function useSupplierStats() {
  return useQuery({
    queryKey: ['supplier-stats'],
    queryFn: () => {
      const suppliers = getSuppliersFromStorage()
      const totalSuppliers = suppliers.length
      const totalOrders = suppliers.reduce((sum, s) => sum + s.totalOrders, 0)
      const averageRating = suppliers.length > 0
        ? suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length
        : 0
      const topSuppliers = [...suppliers].sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 5)

      return {
        totalSuppliers,
        totalOrders,
        averageRating: Math.round(averageRating * 10) / 10,
        topSuppliers,
      }
    },
    retry: false,
  })
}
