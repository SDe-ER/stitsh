import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================
export type EmployeeStatus = 'active' | 'on-leave' | 'terminated' | 'resigned'
export type ResidencyStatus = 'valid' | 'expiring-soon' | 'expired'

export interface Employee {
  id: string
  employeeNumber: string  // رقم الموظف
  name: string
  nameAr: string
  nationality: string
  nationalityCode: string  // e.g., 'SA', 'EG', 'IN' for flag emoji
  jobId: string
  jobTitle: string
  jobTitleAr: string
  department: string
  departmentAr: string
  projectId?: string
  projectName?: string
  projectNameAr?: string
  phone?: string
  email?: string
  salary: number
  joiningDate: string
  status: EmployeeStatus
  statusAr: string
  // Residency (Iqama) Info
  residencyNumber?: string
  residencyExpiryDate?: string
  // Passport Info
  passportNumber?: string
  passportExpiryDate?: string
  // Contract Info
  contractStartDate?: string
  contractEndDate?: string
  // Address
  city?: string
  cityAr?: string
  address?: string
  addressAr?: string
  // Emergency Contact
  emergencyContactName?: string
  emergencyContactPhone?: string
  // Photo & Documents URLs
  photoUrl?: string
  residencyDocumentUrl?: string
  passportDocumentUrl?: string
  contractDocumentUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeData {
  employeeNumber: string
  name: string
  nameAr: string
  nationality: string
  nationalityCode: string
  jobId: string
  jobTitle: string
  jobTitleAr: string
  department: string
  departmentAr: string
  projectId?: string
  phone?: string
  email?: string
  salary: number
  joiningDate: string
  residencyNumber?: string
  residencyExpiryDate?: string
  passportNumber?: string
  passportExpiryDate?: string
  contractStartDate?: string
  contractEndDate?: string
  city?: string
  cityAr?: string
  address?: string
  addressAr?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  photoUrl?: string
  residencyDocumentUrl?: string
  passportDocumentUrl?: string
  contractDocumentUrl?: string
}

export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {
  status?: EmployeeStatus
}

export interface EmployeeFilters {
  department?: string
  nationality?: string
  status?: EmployeeStatus | 'all'
  projectId?: string
  search?: string
}

export type PaymentMethod = 'madad' | 'transfer' | 'cash'

export interface SalaryRecord {
  id: string
  employeeId: string
  month: string  // YYYY-MM format
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  absences: number  // Days absent
  netSalary: number
  paymentDate?: string
  paymentStatus: 'pending' | 'paid' | 'partial'
  paymentMethod?: PaymentMethod
  notes?: string
  createdAt: string
}

export const paymentMethodLabels: Record<PaymentMethod, { label: string; labelAr: string; icon: string }> = {
  madad: { label: 'Madad', labelAr: 'مدد', icon: '🏦' },
  transfer: { label: 'Bank Transfer', labelAr: 'تحويل بنكي', icon: '🏧' },
  cash: { label: 'Cash', labelAr: 'نقداً', icon: '💵' },
}

// Status labels
export const employeeStatusLabels = {
  active: { label: 'نشط', labelEn: 'Active', color: 'bg-green-100 text-green-700' },
  'on-leave': { label: 'في إجازة', labelEn: 'On Leave', color: 'bg-amber-100 text-amber-700' },
  terminated: { label: 'منتهي خدمته', labelEn: 'Terminated', color: 'bg-red-100 text-red-700' },
  resigned: { label: 'مستقيل', labelEn: 'Resigned', color: 'bg-gray-100 text-gray-700' },
}

// Residency status helper
export function getResidencyStatus(expiryDate?: string): ResidencyStatus {
  if (!expiryDate) return 'valid'

  const today = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 30) return 'expiring-soon'
  return 'valid'
}

export function getResidencyStatusConfig(status: ResidencyStatus) {
  switch (status) {
    case 'expired':
      return { label: 'منتهية', labelEn: 'Expired', color: 'bg-red-100 text-red-700', icon: '⛔' }
    case 'expiring-soon':
      return { label: 'قريب الانتهاء', labelEn: 'Expiring Soon', color: 'bg-amber-100 text-amber-700', icon: '⚠️' }
    default:
      return { label: 'سارية', labelEn: 'Valid', color: 'bg-green-100 text-green-700', icon: '✅' }
  }
}

// Department options
export const departmentOptions = [
  { value: 'engineering', labelAr: 'الهندسة', labelEn: 'Engineering' },
  { value: 'operations', labelAr: 'العمليات', labelEn: 'Operations' },
  { value: 'maintenance', labelAr: 'الصيانة', labelEn: 'Maintenance' },
  { value: 'safety', labelAr: 'السلامة', labelEn: 'Safety' },
  { value: 'administration', labelAr: 'الإدارة', labelEn: 'Administration' },
  { value: 'finance', labelAr: 'المالية', labelEn: 'Finance' },
  { value: 'hr', labelAr: 'الموارد البشرية', labelEn: 'Human Resources' },
  { value: 'it', labelAr: 'تقنية المعلومات', labelEn: 'IT' },
  { value: 'logistics', labelAr: 'اللوجستيك', labelEn: 'Logistics' },
  { value: 'security', labelAr: 'الأمن', labelEn: 'Security' },
]

// Nationality options with flag emojis
export const nationalityOptions = [
  { code: 'SA', nameAr: 'المملكة العربية السعودية', flag: '🇸🇦' },
  { code: 'EG', nameAr: 'مصر', flag: '🇪🇬' },
  { code: 'IN', nameAr: 'الهند', flag: '🇮🇳' },
  { code: 'PK', nameAr: 'باكستان', flag: '🇵🇰' },
  { code: 'BD', nameAr: 'بنغلاديش', flag: '🇧🇩' },
  { code: 'PH', nameAr: 'الفلبين', flag: '🇵🇭' },
  { code: 'YE', nameAr: 'اليمن', flag: '🇾🇪' },
  { code: 'SY', nameAr: 'سوريا', flag: '🇸🇾' },
  { code: 'JO', nameAr: 'الأردن', flag: '🇯🇴' },
  { code: 'SUDAN', nameAr: 'السودان', flag: '🇸🇩' },
  { code: 'AE', nameAr: 'الإمارات', flag: '🇦🇪' },
  { code: 'QA', nameAr: 'قطر', flag: '🇶🇦' },
  { code: 'KW', nameAr: 'الكويت', flag: '🇰🇼' },
  { code: 'OM', nameAr: 'عمان', flag: '🇴🇲' },
  { code: 'BA', nameAr: 'البحرين', flag: '🇧🇭' },
  { code: 'LB', nameAr: 'لبنان', flag: '🇱🇧' },
  { code: 'TR', nameAr: 'تركيا', flag: '🇹🇷' },
  { code: 'GB', nameAr: 'بريطانيا', flag: '🇬🇧' },
  { code: 'US', nameAr: 'أمريكا', flag: '🇺🇸' },
]

// ============================================================================
// STORAGE KEY & DEFAULT DATA
// ============================================================================
const EMPLOYEES_KEY = 'heavyops_employees'
const SALARIES_KEY = 'heavyops_salaries'

const defaultEmployees: Employee[] = [
  {
    id: 'emp-1',
    employeeNumber: 'EMP001',
    name: 'Ahmed Al-Rashid',
    nameAr: 'أحمد الرشيد',
    nationality: 'المملكة العربية السعودية',
    nationalityCode: 'SA',
    jobId: 'eng-001',
    jobTitle: 'Senior Engineer',
    jobTitleAr: 'مهندس أول',
    department: 'engineering',
    departmentAr: 'الهندسة',
    projectId: '1',
    projectName: 'Riyadh Residential Tower',
    projectNameAr: 'برج الرياض السكني',
    phone: '+966501234567',
    email: 'ahmed.alrashid@heavyops.com',
    salary: 15000,
    joiningDate: '2022-01-15',
    status: 'active',
    statusAr: 'نشط',
    residencyNumber: '1234567890',
    residencyExpiryDate: '2025-12-31',
    passportNumber: 'A12345678',
    passportExpiryDate: '2026-06-30',
    contractStartDate: '2022-01-15',
    contractEndDate: '2027-01-14',
    city: 'Riyadh',
    cityAr: 'الرياض',
    address: 'Olaya St, Riyadh',
    addressAr: 'شارع العليا، الرياض',
    emergencyContactName: 'Mohammed Al-Rashid',
    emergencyContactPhone: '+966501234568',
    createdAt: '2022-01-10T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  },
  {
    id: 'emp-2',
    employeeNumber: 'EMP002',
    name: 'Mohammed Hassan',
    nameAr: 'محمد حسن',
    nationality: 'مصر',
    nationalityCode: 'EG',
    jobId: 'op-001',
    jobTitle: 'Equipment Operator',
    jobTitleAr: 'مشغل معدات',
    department: 'operations',
    departmentAr: 'العمليات',
    projectId: '1',
    projectName: 'Riyadh Residential Tower',
    projectNameAr: 'برج الرياض السكني',
    phone: '+966502345678',
    salary: 4500,
    joiningDate: '2023-03-01',
    status: 'active',
    statusAr: 'نشط',
    residencyNumber: '2345678901',
    residencyExpiryDate: '2024-02-15',
    passportNumber: 'E98765432',
    passportExpiryDate: '2025-08-20',
    city: 'Riyadh',
    cityAr: 'الرياض',
    emergencyContactName: 'Hassan Ali',
    emergencyContactPhone: '+966502345679',
    createdAt: '2023-02-20T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  },
  {
    id: 'emp-3',
    employeeNumber: 'EMP003',
    name: 'Rajesh Kumar',
    nameAr: 'راجيش كومار',
    nationality: 'الهند',
    nationalityCode: 'IN',
    jobId: 'op-002',
    jobTitle: 'Truck Driver',
    jobTitleAr: 'سائق شاحنة',
    department: 'logistics',
    departmentAr: 'اللوجستيك',
    projectId: '2',
    projectName: 'Jeddah Commercial Mall',
    projectNameAr: 'مول جدة التجاري',
    phone: '+966503456789',
    salary: 3500,
    joiningDate: '2023-06-01',
    status: 'active',
    statusAr: 'نشط',
    residencyNumber: '3456789012',
    residencyExpiryDate: '2025-05-20',
    passportNumber: 'I1234567',
    passportExpiryDate: '2025-11-15',
    city: 'Jeddah',
    cityAr: 'جدة',
    emergencyContactName: 'Suresh Kumar',
    emergencyContactPhone: '+966503456680',
    createdAt: '2023-05-15T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  },
  {
    id: 'emp-4',
    employeeNumber: 'EMP004',
    name: 'Khalid Ibrahim',
    nameAr: 'خليل إبراهيم',
    nationality: 'المملكة العربية السعودية',
    nationalityCode: 'SA',
    jobId: 'saf-001',
    jobTitle: 'Safety Officer',
    jobTitleAr: 'ضابط سلامة',
    department: 'safety',
    departmentAr: 'السلامة',
    projectId: '3',
    projectName: 'Dammam Industrial Complex',
    projectNameAr: 'مجمع الدمام الصناعي',
    phone: '+966504567890',
    salary: 8000,
    joiningDate: '2022-05-10',
    status: 'active',
    statusAr: 'نشط',
    residencyNumber: '4567890123',
    residencyExpiryDate: '2026-08-01',
    passportNumber: 'S76543210',
    passportExpiryDate: '2026-12-15',
    city: 'Dammam',
    cityAr: 'الدمام',
    emergencyContactName: 'Ibrahim Khalid',
    emergencyContactPhone: '+966504567891',
    createdAt: '2022-04-20T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  },
  {
    id: 'emp-5',
    employeeNumber: 'EMP-2021-005',
    name: 'Abdullah Al-Qahtani',
    nameAr: 'عبد الله القحطاني',
    nationality: 'المملكة العربية السعودية',
    nationalityCode: 'SA',
    jobId: 'admin-001',
    jobTitle: 'HR Manager',
    jobTitleAr: 'مدير موارد بشرية',
    department: 'hr',
    departmentAr: 'الموارد البشرية',
    phone: '+966505678901',
    email: 'abdullah@heavyops.com',
    salary: 18000,
    joiningDate: '2021-09-01',
    status: 'active',
    statusAr: 'نشط',
    residencyNumber: '5678901234',
    residencyExpiryDate: '2026-03-15',
    passportNumber: 'S65432109',
    passportExpiryDate: '2026-09-20',
    city: 'Riyadh',
    cityAr: 'الرياض',
    emergencyContactName: 'Qahtani Family',
    emergencyContactPhone: '+966505678902',
    createdAt: '2021-08-15T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  },
]

const defaultSalaries: SalaryRecord[] = [
  {
    id: 'sal-1',
    employeeId: 'emp-1',
    month: '2024-01',
    year: 2024,
    basicSalary: 15000,
    allowances: 3000,
    deductions: 0,
    netSalary: 18000,
    paymentStatus: 'paid',
    paymentDate: '2024-01-28',
    createdAt: '2024-01-28T00:00:00',
  },
  {
    id: 'sal-2',
    employeeId: 'emp-2',
    month: '2024-01',
    year: 2024,
    basicSalary: 4500,
    allowances: 500,
    deductions: 0,
    netSalary: 5000,
    paymentStatus: 'paid',
    paymentDate: '2024-01-28',
    createdAt: '2024-01-28T00:00:00',
  },
  {
    id: 'sal-3',
    employeeId: 'emp-3',
    month: '2024-01',
    year: 2024,
    basicSalary: 3500,
    allowances: 0,
    deductions: 0,
    netSalary: 3500,
    paymentStatus: 'paid',
    paymentDate: '2024-01-28',
    createdAt: '2024-01-28T00:00:00',
  },
]

// ============================================================================
// EMPLOYEE NUMBER GENERATION
// ============================================================================
// Auto-generate employee number in format: EMP-YYYY-NNN
export function generateEmployeeNumber(): string {
  const employees = getEmployees()
  const currentYear = new Date().getFullYear()

  // Find all employee numbers for the current year
  const yearPattern = `EMP-${currentYear}-`
  const yearEmployees = employees.filter(e => e.employeeNumber.startsWith(yearPattern))

  // Get the highest sequence number
  let maxSequence = 0
  yearEmployees.forEach(emp => {
    const parts = emp.employeeNumber.split('-')
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10)
      if (!isNaN(seq) && seq > maxSequence) {
        maxSequence = seq
      }
    }
  })

  // Generate new number with zero-padded sequence
  const newSequence = maxSequence + 1
  return `EMP-${currentYear}-${String(newSequence).padStart(3, '0')}`
}

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================
// Initialize localStorage with default data on first load
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(EMPLOYEES_KEY)) {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(defaultEmployees))
  }
  if (!localStorage.getItem(SALARIES_KEY)) {
    localStorage.setItem(SALARIES_KEY, JSON.stringify(defaultSalaries))
  }
}

export function getEmployees(): Employee[] {
  if (typeof window === 'undefined') return defaultEmployees
  const stored = localStorage.getItem(EMPLOYEES_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultEmployees
    }
  }
  return defaultEmployees
}

export function saveEmployees(employees: Employee[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees))
  }
}

export function getSalaries(): SalaryRecord[] {
  if (typeof window === 'undefined') return defaultSalaries
  const stored = localStorage.getItem(SALARIES_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultSalaries
    }
  }
  return defaultSalaries
}

export function saveSalaries(salaries: SalaryRecord[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SALARIES_KEY, JSON.stringify(salaries))
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================
async function fetchEmployees(filters?: EmployeeFilters): Promise<Employee[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.department) params.append('department', filters.department)
    if (filters?.nationality) params.append('nationality', filters.nationality)
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status)
    if (filters?.projectId) params.append('projectId', filters.projectId)
    if (filters?.search) params.append('search', filters.search)

    const response = await fetch(`/api/employees?${params}`)
    if (response.ok) return await response.json()
  } catch (error) {
    console.warn('API fetch failed, using mock data:', error)
  }

  await new Promise((resolve) => setTimeout(resolve, 300))
  let filtered = getEmployees()

  if (filters?.department) {
    filtered = filtered.filter(e => e.department === filters.department)
  }

  if (filters?.nationality) {
    filtered = filtered.filter(e => e.nationalityCode === filters.nationality)
  }

  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter(e => e.status === filters.status)
  }

  if (filters?.projectId) {
    filtered = filtered.filter(e => e.projectId === filters.projectId)
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(search) ||
      e.nameAr.includes(search) ||
      e.employeeNumber.includes(search)
    )
  }

  return filtered
}

async function fetchEmployeeById(id: string): Promise<Employee> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  const employees = getEmployees()
  const employee = employees.find(e => e.id === id)
  if (!employee) throw new Error('Employee not found')
  return employee
}

async function createEmployee(data: CreateEmployeeData): Promise<Employee> {
  try {
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (response.ok) return await response.json()
  } catch (error) {
    console.warn('API create failed, using mock response:', error)
  }

  await new Promise((resolve) => setTimeout(resolve, 500))

  const employees = getEmployees()
  const newEmployee: Employee = {
    id: `emp-${Date.now()}`,
    employeeNumber: data.employeeNumber,
    name: data.name,
    nameAr: data.nameAr,
    nationality: data.nationality,
    nationalityCode: data.nationalityCode,
    jobId: data.jobId,
    jobTitle: data.jobTitle,
    jobTitleAr: data.jobTitleAr,
    department: data.department,
    departmentAr: data.departmentAr,
    projectId: data.projectId,
    phone: data.phone,
    email: data.email,
    salary: data.salary,
    joiningDate: data.joiningDate,
    status: 'active',
    statusAr: 'نشط',
    residencyNumber: data.residencyNumber,
    residencyExpiryDate: data.residencyExpiryDate,
    passportNumber: data.passportNumber,
    passportExpiryDate: data.passportExpiryDate,
    contractStartDate: data.contractStartDate,
    contractEndDate: data.contractEndDate,
    city: data.city,
    cityAr: data.cityAr,
    address: data.address,
    addressAr: data.addressAr,
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactPhone,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  employees.push(newEmployee)
  saveEmployees(employees)
  return newEmployee
}

async function updateEmployee(id: string, data: UpdateEmployeeData): Promise<Employee> {
  try {
    const response = await fetch(`/api/employees/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (response.ok) return await response.json()
  } catch (error) {
    console.warn('API update failed, using mock response:', error)
  }

  await new Promise((resolve) => setTimeout(resolve, 400))

  const employees = getEmployees()
  const index = employees.findIndex(e => e.id === id)
  if (index === -1) throw new Error('Employee not found')

  const updated = { ...employees[index] }

  Object.keys(data).forEach((key) => {
    if (data[key as keyof UpdateEmployeeData] !== undefined) {
      ;(updated as any)[key] = data[key as keyof UpdateEmployeeData]
    }
  })

  if (data.status) {
    updated.statusAr = employeeStatusLabels[data.status].label
  }

  updated.updatedAt = new Date().toISOString()
  employees[index] = updated
  saveEmployees(employees)

  return updated
}

async function deleteEmployee(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
    })
    if (response.ok) return
  } catch (error) {
    console.warn('API delete failed, using mock response:', error)
  }

  await new Promise((resolve) => setTimeout(resolve, 300))

  const employees = getEmployees()
  const filtered = employees.filter(e => e.id !== id)
  saveEmployees(filtered)
}

// Get employee statistics
export function getEmployeeStats() {
  const employees = getEmployees()
  const today = new Date()

  const total = employees.length
  const onSite = employees.filter(e => e.status === 'active').length

  // Check residency status
  let expiredResidencies = 0
  let expiringSoonResidencies = 0

  employees.forEach(emp => {
    if (!emp.residencyExpiryDate) return

    const expiry = new Date(emp.residencyExpiryDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) {
      expiredResidencies++
    } else if (daysUntilExpiry <= 30) {
      expiringSoonResidencies++
    }
  })

  return {
    total,
    onSite,
    expiredResidencies,
    expiringSoonResidencies,
  }
}

// ============================================================================
// HOOKS
// ============================================================================
export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => fetchEmployees(filters),
    retry: false,
    initialData: () => getEmployees(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useEmployeeById(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => fetchEmployeeById(id),
    enabled: !!id,
    retry: false,
    initialData: () => {
      const employees = getEmployees()
      return employees.find(e => e.id === id)
    },
    staleTime: 1 * 60 * 1000,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('تمت إضافة الموظف بنجاح')
    },
    onError: (error) => {
      console.error('Create employee error:', error)
      toast.error('فشل إضافة الموظف')
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeData }) =>
      updateEmployee(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] })
      toast.success('تم تحديث بيانات الموظف بنجاح')
    },
    onError: (error) => {
      console.error('Update employee error:', error)
      toast.error('فشل تحديث بيانات الموظف')
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('تم حذف الموظف بنجاح')
    },
    onError: (error) => {
      console.error('Delete employee error:', error)
      toast.error('فشل حذف الموظف')
    },
  })
}

// Salary hooks
export function useSalaries(month?: string, year?: number) {
  return useQuery({
    queryKey: ['salaries', month, year],
    queryFn: () => {
      const salaries = getSalaries()
      let filtered = salaries

      if (month) {
        filtered = filtered.filter(s => s.month === month)
      }

      if (year) {
        filtered = filtered.filter(s => s.year === year)
      }

      return filtered
    },
    staleTime: 1 * 60 * 1000,
  })
}

export function useUpdateSalaryPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    // @ts-ignore - TanStack Query type inference issue with mutation return type
    mutationFn: ({ salaryId, paymentStatus, paymentDate }: { salaryId: string; paymentStatus: SalaryRecord['paymentStatus']; paymentDate?: string }) => {
      const salaries = getSalaries()
      const index = salaries.findIndex(s => s.id === salaryId)
      if (index === -1) throw new Error('Salary record not found')

      salaries[index].paymentStatus = paymentStatus
      if (paymentDate) salaries[index].paymentDate = paymentDate

      saveSalaries(salaries)
      return salaries[index]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
      toast.success('تم تحديث حالة الدفع بنجاح')
    },
    onError: (error) => {
      console.error('Update salary error:', error)
      toast.error('فشل تحديث حالة الدفع')
    },
  })
}

export function useCreateSalary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<SalaryRecord, 'id' | 'createdAt'>) => {
      const salaries = getSalaries()
      const newSalary: SalaryRecord = {
        ...data,
        id: `sal-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      salaries.push(newSalary)
      saveSalaries(salaries)
      return Promise.resolve(newSalary)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
      toast.success('تم إضافة السجل بنجاح')
    },
  })
}

export function useUpdateSalary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ salaryId, data }: { salaryId: string; data: Partial<SalaryRecord> }) => {
      const salaries = getSalaries()
      const index = salaries.findIndex(s => s.id === salaryId)
      if (index === -1) throw new Error('Salary record not found')

      // Recalculate net salary if allowances or deductions changed
      let netSalary = salaries[index].netSalary
      if (data.allowances !== undefined || data.deductions !== undefined || data.basicSalary !== undefined) {
        const basicSalary = data.basicSalary ?? salaries[index].basicSalary
        const allowances = data.allowances ?? salaries[index].allowances
        const deductions = data.deductions ?? salaries[index].deductions
        netSalary = basicSalary + allowances - deductions
      }

      salaries[index] = {
        ...salaries[index],
        ...data,
        netSalary,
      }

      saveSalaries(salaries)
      return salaries[index]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
      toast.success('تم تحديث السجل بنجاح')
    },
  })
}

export function useDeleteSalary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (salaryId: string) => {
      const salaries = getSalaries()
      const filtered = salaries.filter(s => s.id !== salaryId)
      saveSalaries(filtered)
      return Promise.resolve(salaryId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
      toast.success('تم حذف السجل بنجاح')
    },
  })
}
