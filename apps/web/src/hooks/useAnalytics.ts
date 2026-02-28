import { useQuery } from '@tanstack/react-query'

// ============================================================================
// TYPES
// ============================================================================

export interface MonthlyRevenue {
  month: string
  monthAr: string
  revenue: number
  expenses: number
  profit: number
  projects: number
}

export interface ProjectPerformance {
  id: string
  code: string
  name: string
  nameAr: string
  budget: number
  actualCost: number
  progress: number
  status: string
  statusAr: string
  profitMargin: number
  daysRemaining: number
}

export interface EquipmentUtilization {
  id: string
  code: string
  name: string
  nameAr: string
  type: string
  typeAr: string
  totalHours: number
  utilizationRate: number
  operatingCost: number
  revenue: number
  efficiency: number
}

export interface EmployeePerformance {
  id: string
  name: string
  nameAr: string
  role: string
  roleAr: string
  department: string
  departmentAr: string
  completedTasks: number
  attendanceRate: number
  efficiency: number
  projectsAssigned: number
}

export interface TopClient {
  id: string
  name: string
  nameAr: string
  projects: number
  totalValue: number
  pendingPayments: number
}

export interface CategoryExpense {
  category: string
  categoryAr: string
  amount: number
  percentage: number
  color: string
}

export interface KPIData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  activeProjects: number
  completedProjects: number
  totalEmployees: number
  activeEquipment: number
  avgProjectProgress: number
  equipmentUtilization: number
}

export interface Insight {
  id: string
  type: 'success' | 'warning' | 'info' | 'danger'
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  actionRequired?: boolean
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const defaultMonthlyRevenue: MonthlyRevenue[] = [
  { month: 'Jan', monthAr: 'يناير', revenue: 850000, expenses: 620000, profit: 230000, projects: 8 },
  { month: 'Feb', monthAr: 'فبراير', revenue: 920000, expenses: 680000, profit: 240000, projects: 9 },
  { month: 'Mar', monthAr: 'مارس', revenue: 1100000, expenses: 750000, profit: 350000, projects: 11 },
  { month: 'Apr', monthAr: 'أبريل', revenue: 980000, expenses: 710000, profit: 270000, projects: 10 },
  { month: 'May', monthAr: 'مايو', revenue: 1250000, expenses: 820000, profit: 430000, projects: 12 },
  { month: 'Jun', monthAr: 'يونيو', revenue: 1350000, expenses: 890000, profit: 460000, projects: 13 },
  { month: 'Jul', monthAr: 'يوليو', revenue: 1420000, expenses: 920000, profit: 500000, projects: 14 },
  { month: 'Aug', monthAr: 'أغسطس', revenue: 1180000, expenses: 840000, profit: 340000, projects: 11 },
  { month: 'Sep', monthAr: 'سبتمبر', revenue: 1290000, expenses: 880000, profit: 410000, projects: 13 },
  { month: 'Oct', monthAr: 'أكتوبر', revenue: 1380000, expenses: 910000, profit: 470000, projects: 14 },
  { month: 'Nov', monthAr: 'نوفمبر', revenue: 1480000, expenses: 950000, profit: 530000, projects: 15 },
  { month: 'Dec', monthAr: 'ديسمبر', revenue: 1550000, expenses: 980000, profit: 570000, projects: 16 },
]

const defaultProjectPerformance: ProjectPerformance[] = [
  {
    id: '1',
    code: 'PRJ-456789',
    name: 'Riyadh Metro Extension',
    nameAr: 'توسعة مترو الرياض',
    budget: 25000000,
    actualCost: 18750000,
    progress: 75,
    status: 'active',
    statusAr: 'نشط',
    profitMargin: 25,
    daysRemaining: 120,
  },
  {
    id: '2',
    code: 'PRJ-456790',
    name: 'Jeddah Coastal Road',
    nameAr: 'طريق جدة الساحلي',
    budget: 18000000,
    actualCost: 16200000,
    progress: 90,
    status: 'active',
    statusAr: 'نشط',
    profitMargin: 10,
    daysRemaining: 30,
  },
  {
    id: '3',
    code: 'PRJ-456791',
    name: 'Dammam Industrial City',
    nameAr: 'المدينة الصناعية بالدمام',
    budget: 32000000,
    actualCost: 22400000,
    progress: 70,
    status: 'active',
    statusAr: 'نشط',
    profitMargin: 30,
    daysRemaining: 180,
  },
  {
    id: '4',
    code: 'PRJ-456792',
    name: 'Riyadh Airport Terminal 5',
    nameAr: 'مطار الرياض مبنى 5',
    budget: 45000000,
    actualCost: 40500000,
    progress: 90,
    status: 'active',
    statusAr: 'نشط',
    profitMargin: 10,
    daysRemaining: 45,
  },
  {
    id: '5',
    code: 'PRJ-456793',
    name: 'NEOM Infrastructure Phase 1',
    nameAr: 'نيوم البنية التحتية المرحلة 1',
    budget: 85000000,
    actualCost: 42500000,
    progress: 50,
    status: 'active',
    statusAr: 'نشط',
    profitMargin: 25,
    daysRemaining: 365,
  },
  {
    id: '6',
    code: 'PRJ-456794',
    name: 'AlUla Heritage Site',
    nameAr: 'موقع العلا التراثي',
    budget: 12000000,
    actualCost: 11400000,
    progress: 95,
    status: 'completed',
    statusAr: 'مكتمل',
    profitMargin: 5,
    daysRemaining: 0,
  },
]

const defaultEquipmentUtilization: EquipmentUtilization[] = [
  {
    id: '1',
    code: 'EQ-001',
    name: 'CAT 320 Excavator',
    nameAr: 'حفار CAT 320',
    type: 'excavator',
    typeAr: 'حفارات',
    totalHours: 1850,
    utilizationRate: 88,
    operatingCost: 148000,
    revenue: 296000,
    efficiency: 92,
  },
  {
    id: '2',
    code: 'EQ-002',
    name: 'CAT 980 Loader',
    nameAr: 'لودر CAT 980',
    type: 'loader',
    typeAr: 'لودرات',
    totalHours: 2100,
    utilizationRate: 95,
    operatingCost: 147000,
    revenue: 294000,
    efficiency: 98,
  },
  {
    id: '3',
    code: 'EQ-003',
    name: 'JCB 3CX Backhoe',
    nameAr: 'backhoe JCB 3CX',
    type: 'backhoe',
    typeAr: 'bacKHoe',
    totalHours: 1680,
    utilizationRate: 80,
    operatingCost: 100800,
    revenue: 201600,
    efficiency: 85,
  },
  {
    id: '4',
    code: 'EQ-004',
    name: 'Komatsu D155 Bulldozer',
    nameAr: 'بلدوزر Komatsu D155',
    type: 'bulldozer',
    typeAr: 'بلدوزرات',
    totalHours: 1750,
    utilizationRate: 83,
    operatingCost: 131250,
    revenue: 262500,
    efficiency: 88,
  },
  {
    id: '5',
    code: 'EQ-005',
    name: 'Terex Cranes AC 100',
    nameAr: 'رافعة Terex AC 100',
    type: 'crane',
    typeAr: 'رافعات',
    totalHours: 1450,
    utilizationRate: 70,
    operatingCost: 145000,
    revenue: 290000,
    efficiency: 82,
  },
  {
    id: '6',
    code: 'EQ-006',
    name: 'Mobile Crusher Metso',
    nameAr: 'كسارة متحركة Metso',
    type: 'crusher',
    typeAr: 'كسارات',
    totalHours: 1920,
    utilizationRate: 92,
    operatingCost: 480000,
    revenue: 960000,
    efficiency: 95,
  },
]

const defaultEmployeePerformance: EmployeePerformance[] = [
  {
    id: '1',
    name: 'Ahmed Al-Rashid',
    nameAr: 'أحمد الرشيد',
    role: 'Project Manager',
    roleAr: 'مدير مشاريع',
    department: 'Projects',
    departmentAr: 'المشاريع',
    completedTasks: 47,
    attendanceRate: 98,
    efficiency: 95,
    projectsAssigned: 4,
  },
  {
    id: '2',
    name: 'Mohammed Al-Ghamdi',
    nameAr: 'محمد الغامدي',
    role: 'Site Engineer',
    roleAr: 'مهندس موقع',
    department: 'Engineering',
    departmentAr: 'الهندسة',
    completedTasks: 52,
    attendanceRate: 96,
    efficiency: 92,
    projectsAssigned: 3,
  },
  {
    id: '3',
    name: 'Khalid Al-Dossary',
    nameAr: 'خالد الدوسري',
    role: 'Equipment Operator',
    roleAr: 'مشغل معدات',
    department: 'Equipment',
    departmentAr: 'المعدات',
    completedTasks: 38,
    attendanceRate: 94,
    efficiency: 88,
    projectsAssigned: 5,
  },
  {
    id: '4',
    name: 'Fahad Al-Otaibi',
    nameAr: 'فهد العتيبي',
    role: 'Safety Officer',
    roleAr: 'ضابط سلامة',
    department: 'HSE',
    departmentAr: 'السلامة',
    completedTasks: 35,
    attendanceRate: 99,
    efficiency: 90,
    projectsAssigned: 6,
  },
  {
    id: '5',
    name: 'Abdullah Al-Rajhi',
    nameAr: 'عبدالله الراجحي',
    role: 'Quantity Surveyor',
    roleAr: 'مقدر كميات',
    department: 'Quantity Surveying',
    departmentAr: 'تقدير الكميات',
    completedTasks: 41,
    attendanceRate: 97,
    efficiency: 93,
    projectsAssigned: 4,
  },
]

const defaultTopClients: TopClient[] = [
  {
    id: '1',
    name: 'Saudi Binladin Group',
    nameAr: 'مجموعة بن لادن السعودية',
    projects: 4,
    totalValue: 65000000,
    pendingPayments: 8500000,
  },
  {
    id: '2',
    name: 'El Seif Engineering',
    nameAr: 'السيف للهندسة',
    projects: 3,
    totalValue: 48000000,
    pendingPayments: 3200000,
  },
  {
    id: '3',
    name: 'Nesma & Partners',
    nameAr: 'نسمة وشركاؤها',
    projects: 3,
    totalValue: 35000000,
    pendingPayments: 2100000,
  },
  {
    id: '4',
    name: 'Saudi Oger',
    nameAr: 'شركة أوجر السعودية',
    projects: 2,
    totalValue: 28000000,
    pendingPayments: 4500000,
  },
  {
    id: '5',
    name: 'Al Rajhi Construction',
    nameAr: 'الراجحي للمقاولات',
    projects: 2,
    totalValue: 22000000,
    pendingPayments: 1800000,
  },
]

const defaultCategoryExpenses: CategoryExpense[] = [
  { category: 'Materials', categoryAr: 'المواد', amount: 3500000, percentage: 35, color: '#3b82f6' },
  { category: 'Labor', categoryAr: 'العمالة', amount: 2800000, percentage: 28, color: '#10b981' },
  { category: 'Equipment', categoryAr: 'المعدات', amount: 2000000, percentage: 20, color: '#f59e0b' },
  { category: 'Transport', categoryAr: 'النقل', amount: 900000, percentage: 9, color: '#ef4444' },
  { category: 'Subcontractors', categoryAr: 'المقاولين من الباطن', amount: 500000, percentage: 5, color: '#8b5cf6' },
  { category: 'Other', categoryAr: 'أخرى', amount: 300000, percentage: 3, color: '#6b7280' },
]

const defaultKPIs: KPIData = {
  totalRevenue: 15500000,
  totalExpenses: 9800000,
  netProfit: 5700000,
  profitMargin: 36.8,
  activeProjects: 16,
  completedProjects: 24,
  totalEmployees: 145,
  activeEquipment: 32,
  avgProjectProgress: 72,
  equipmentUtilization: 84,
}

const defaultInsights: Insight[] = [
  {
    id: '1',
    type: 'success',
    title: 'Revenue Growth',
    titleAr: 'نمو الإيرادات',
    description: 'Monthly revenue increased by 18% compared to last month',
    descriptionAr: 'زيادة الإيرادات الشهرية بنسبة 18% مقارنة بالشهر الماضي',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Equipment Maintenance',
    titleAr: 'صيانة المعدات',
    description: '3 pieces of equipment are due for scheduled maintenance',
    descriptionAr: '3 قطع معدات تحتاج للصيانة المجدولة',
    actionRequired: true,
  },
  {
    id: '3',
    type: 'info',
    title: 'New Project Opportunity',
    titleAr: 'فرصة مشروع جديدة',
    description: 'NEOM has expressed interest in Phase 2 infrastructure project',
    descriptionAr: 'أبدت نيوم اهتمامها بمشروع البنية التحتية المرحلة 2',
  },
  {
    id: '4',
    type: 'danger',
    title: 'Pending Payments',
    titleAr: 'المدفوعات المعلقة',
    description: '2 clients have overdue payments exceeding 60 days',
    descriptionAr: 'عميلان لديهم مدفوعات متأخرة تزيد عن 60 يومًا',
    actionRequired: true,
  },
]

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

const ANALYTICS_STORAGE_KEY = 'heavyops_analytics'

function getAnalyticsFromStorage() {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

export function useKPIs() {
  return useQuery({
    queryKey: ['analytics-kpis'],
    queryFn: () => defaultKPIs,
    retry: false,
  })
}

export function useMonthlyRevenue() {
  return useQuery({
    queryKey: ['analytics-monthly-revenue'],
    queryFn: () => defaultMonthlyRevenue,
    retry: false,
  })
}

export function useProjectPerformance() {
  return useQuery({
    queryKey: ['analytics-project-performance'],
    queryFn: () => defaultProjectPerformance,
    retry: false,
  })
}

export function useEquipmentUtilization() {
  return useQuery({
    queryKey: ['analytics-equipment-utilization'],
    queryFn: () => defaultEquipmentUtilization,
    retry: false,
  })
}

export function useEmployeePerformance() {
  return useQuery({
    queryKey: ['analytics-employee-performance'],
    queryFn: () => defaultEmployeePerformance,
    retry: false,
  })
}

export function useTopClients() {
  return useQuery({
    queryKey: ['analytics-top-clients'],
    queryFn: () => defaultTopClients,
    retry: false,
  })
}

export function useCategoryExpenses() {
  return useQuery({
    queryKey: ['analytics-category-expenses'],
    queryFn: () => defaultCategoryExpenses,
    retry: false,
  })
}

export function useInsights() {
  return useQuery({
    queryKey: ['analytics-insights'],
    queryFn: () => defaultInsights,
    retry: false,
  })
}
