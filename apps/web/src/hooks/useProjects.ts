import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================
export type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'cancelled' | 'planning'

export interface Project {
  id: string
  code: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  status: ProjectStatus
  statusAr: string
  clientId: string
  clientName: string
  clientNameAr: string
  managerId: string
  managerName: string
  managerNameAr: string
  budget: number
  spent: number
  progress: number
  startDate: string
  endDate: string
  location: string
  locationAr: string
  employeeCount: number
  assignedEquipmentIds: string[]  // IDs of equipment assigned to this project
  createdAt: string
  updatedAt: string
}

export interface ProjectFilters {
  search?: string
  status?: ProjectStatus | 'all'
}

export interface CreateProjectData {
  name: string
  nameAr: string
  code: string
  description?: string
  descriptionAr?: string
  clientId: string
  managerId: string
  budget: number
  startDate: string
  endDate: string
  location: string
  locationAr: string
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: ProjectStatus
  progress?: number
}

export interface ProjectKPIs {
  budget: number
  spent: number
  remaining: number
  profit: number
  progress: number
  daysRemaining: number
  employeeCount: number
  equipmentCount: number
}

export interface Milestone {
  id: string
  name: string
  nameAr: string
  status: 'completed' | 'in-progress' | 'pending'
  statusAr: string
  date: string
  progress: number
}

export interface Expense {
  id: string
  category: string
  categoryAr: string
  amount: number
  date: string
  description: string
  descriptionAr: string
}

export interface MonthlyExpense {
  month: string
  monthAr: string
  amount: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  statusAr: string
  dueDate: string
  paidDate?: string
}

export interface ProjectEmployee {
  id: string
  employeeId: string
  name: string
  nameAr: string
  role: string
  roleAr: string
  joinedDate: string
  allocation: number
}

export interface ProjectEquipment {
  id: string
  equipmentId: string
  name: string
  nameAr: string
  type: string
  typeAr: string
  status: 'in-use' | 'maintenance' | 'available'
  statusAr: string
}

export interface ProjectItem {
  id: string
  code: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  unit: string
  unitAr: string
  quantity: number
  unitPrice: number
  totalPrice: number
  category: string
  categoryAr: string
  status: 'pending' | 'approved' | 'in-progress' | 'completed'
  statusAr: string
}

export interface ProjectDetail extends Project {
  kpis: ProjectKPIs
  milestones: Milestone[]
  expenses: Expense[]
  monthlyExpenses: MonthlyExpense[]
  invoices: Invoice[]
  employees: ProjectEmployee[]
  equipment: ProjectEquipment[]
  items: ProjectItem[]
}

export interface ProjectsListResponse {
  projects: Project[]
  total: number
  page: number
  pageSize: number
}

// ============================================================================
// MOCK DATA
// ============================================================================
const mockProjects: Project[] = [
  {
    id: '1',
    code: 'PRJ-001',
    name: 'Riyadh Residential Tower',
    nameAr: 'برج الرياض السكني',
    description: 'Luxury residential tower with 40 floors',
    descriptionAr: 'برج سكني فاخر مكون من 40 طابقاً',
    status: 'active',
    statusAr: 'نشط',
    clientId: 'client-1',
    clientName: 'Al Rajhi Development',
    clientNameAr: 'الراجحي للتطوير العقاري',
    managerId: 'mgr-1',
    managerName: 'Mohammed Al-Saud',
    managerNameAr: 'محمد السعود',
    budget: 45000000,
    spent: 35100000,
    progress: 78,
    startDate: '2024-01-15',
    endDate: '2025-06-30',
    location: 'Riyadh, Olaya St',
    locationAr: 'الرياض، شارع العليا',
    employeeCount: 45,
    assignedEquipmentIds: ['eq-1', 'eq-2', 'eq-5'],  // Assigned equipment
    createdAt: '2024-01-10',
    updatedAt: '2024-12-15',
  },
  {
    id: '2',
    code: 'PRJ-002',
    name: 'Jeddah Commercial Mall',
    nameAr: 'مول جدة التجاري',
    description: 'Modern shopping mall with entertainment facilities',
    descriptionAr: 'مول تسوق حديث مع مرافق ترفيهية',
    status: 'active',
    statusAr: 'نشط',
    clientId: 'client-2',
    clientName: 'Red Sea Global',
    clientNameAr: 'البحر الأحمر العالمية',
    managerId: 'mgr-2',
    managerName: 'Khalid Ibrahim',
    managerNameAr: 'خليل إبراهيم',
    budget: 85000000,
    spent: 38250000,
    progress: 45,
    startDate: '2024-03-01',
    endDate: '2025-12-31',
    location: 'Jeddah, Palestine St',
    locationAr: 'جدة، شارع فلسطين',
    employeeCount: 78,
    assignedEquipmentIds: ['eq-3', 'eq-4'],
    createdAt: '2024-02-20',
    updatedAt: '2024-12-10',
  },
  {
    id: '3',
    code: 'PRJ-003',
    name: 'Dammam Industrial Complex',
    nameAr: 'مجمع الدمام الصناعي',
    description: 'Industrial complex with warehouses and offices',
    descriptionAr: 'مجمع صناعي مع مستودعات ومكاتب',
    status: 'on-hold',
    statusAr: 'مؤجل',
    clientId: 'client-3',
    clientName: 'Saudi Aramco',
    clientNameAr: 'أرامكو السعودية',
    managerId: 'mgr-3',
    managerName: 'Fahad Al-Otaibi',
    managerNameAr: 'فهد العتيبي',
    budget: 32000000,
    spent: 9600000,
    progress: 30,
    startDate: '2024-05-01',
    endDate: '2025-08-15',
    location: 'Dammam, Industrial City',
    locationAr: 'الدمام، المدينة الصناعية',
    employeeCount: 25,
    assignedEquipmentIds: ['eq-6', 'eq-8'],
    createdAt: '2024-04-15',
    updatedAt: '2024-11-20',
  },
  {
    id: '4',
    code: 'PRJ-004',
    name: 'Medina Highway Extension',
    nameAr: 'توسعة طريق المدينة',
    description: 'Highway expansion project connecting holy cities',
    descriptionAr: 'مشروع توسعة الطريق السريع رابط المدن المقدسة',
    status: 'active',
    statusAr: 'نشط',
    clientId: 'client-4',
    clientName: 'Ministry of Transport',
    clientNameAr: 'وزارة النقل',
    managerId: 'mgr-4',
    managerName: 'Abdullah Al-Qahtani',
    managerNameAr: 'عبد الله القحطاني',
    budget: 120000000,
    spent: 110400000,
    progress: 92,
    startDate: '2023-08-01',
    endDate: '2025-03-31',
    location: 'Medina',
    locationAr: 'المدينة المنورة',
    employeeCount: 120,
    assignedEquipmentIds: ['eq-2'],
    createdAt: '2023-07-15',
    updatedAt: '2024-12-20',
  },
  {
    id: '5',
    code: 'PRJ-005',
    name: 'Al-Khobar Waterfront',
    nameAr: 'واجهة الخبر البحرية',
    description: 'Waterfront development with parks and promenades',
    descriptionAr: 'تطوير الواجهة البحرية مع حدائق وممشيات',
    status: 'active',
    statusAr: 'نشط',
    clientId: 'client-5',
    clientName: 'Eastern Province Municipality',
    clientNameAr: 'بلدية المنطقة الشرقية',
    managerId: 'mgr-5',
    managerName: 'Saud Al-Dossary',
    managerNameAr: 'سعود الدوسري',
    budget: 55000000,
    spent: 8250000,
    progress: 15,
    startDate: '2024-10-01',
    endDate: '2026-01-31',
    location: 'Al-Khobar, Corniche',
    locationAr: 'الخبر، الكورنيش',
    employeeCount: 32,
    assignedEquipmentIds: [],
    createdAt: '2024-09-15',
    updatedAt: '2024-12-01',
  },
  {
    id: '6',
    code: 'PRJ-006',
    name: 'Riyadh Metro Station',
    nameAr: 'محطة مترو الرياض',
    description: 'Underground metro station construction',
    descriptionAr: 'بناء محطة مترو تحت الأرض',
    status: 'completed',
    statusAr: 'منتهي',
    clientId: 'client-6',
    clientName: 'Public Transport Authority',
    clientNameAr: 'هيئة النقل العام',
    managerId: 'mgr-1',
    managerName: 'Mohammed Al-Saud',
    managerNameAr: 'محمد السعود',
    budget: 28000000,
    spent: 27440000,
    progress: 100,
    startDate: '2023-01-01',
    endDate: '2024-09-30',
    location: 'Riyadh, King Fahd Rd',
    locationAr: 'الرياض، شارع الملك فهد',
    employeeCount: 0,
    assignedEquipmentIds: [],
    createdAt: '2022-12-01',
    updatedAt: '2024-10-01',
  },
]

const mockProjectDetail: ProjectDetail = {
  ...mockProjects[0],
  kpis: {
    budget: 45000000,
    spent: 35100000,
    remaining: 9900000,
    profit: 6000000,
    progress: 78,
    daysRemaining: 166,
    employeeCount: 45,
    equipmentCount: 12,
  },
  milestones: [
    {
      id: 'm1',
      name: 'Foundation Work',
      nameAr: 'أعمال الأساسات',
      status: 'completed',
      statusAr: 'مكتمل',
      date: '2024-04-30',
      progress: 100,
    },
    {
      id: 'm2',
      name: 'Structural Frame',
      nameAr: 'الهيكل الإنشائي',
      status: 'completed',
      statusAr: 'مكتمل',
      date: '2024-09-30',
      progress: 100,
    },
    {
      id: 'm3',
      name: 'External Cladding',
      nameAr: 'الأعمال الخارجية',
      status: 'in-progress',
      statusAr: 'قيد التنفيذ',
      date: '2025-01-31',
      progress: 75,
    },
    {
      id: 'm4',
      name: 'Internal Finishing',
      nameAr: 'الأعمال الداخلية',
      status: 'in-progress',
      statusAr: 'قيد التنفيذ',
      date: '2025-04-30',
      progress: 45,
    },
    {
      id: 'm5',
      name: 'MEP Works',
      nameAr: 'أعمال الميكانيكا',
      status: 'in-progress',
      statusAr: 'قيد التنفيذ',
      date: '2025-05-31',
      progress: 60,
    },
    {
      id: 'm6',
      name: 'Final Handover',
      nameAr: 'التسليم النهائي',
      status: 'pending',
      statusAr: 'معلق',
      date: '2025-06-30',
      progress: 0,
    },
  ],
  expenses: [
    {
      id: 'e1',
      category: 'Labor',
      categoryAr: 'الأيدي العاملة',
      amount: 15750000,
      date: '2024-12-01',
      description: 'Monthly salaries and wages',
      descriptionAr: 'الرواتب والأجور الشهرية',
    },
    {
      id: 'e2',
      category: 'Materials',
      categoryAr: 'المواد',
      amount: 12390000,
      date: '2024-12-01',
      description: 'Construction materials procurement',
      descriptionAr: 'توريد مواد البناء',
    },
    {
      id: 'e3',
      category: 'Equipment',
      categoryAr: 'المعدات',
      amount: 4560000,
      date: '2024-12-01',
      description: 'Heavy equipment rental and maintenance',
      descriptionAr: 'إيجار وصيانة المعدات الثقيلة',
    },
    {
      id: 'e4',
      category: 'Subcontractors',
      categoryAr: 'المقاولين من الباطن',
      amount: 2400000,
      date: '2024-12-01',
      description: 'Specialized subcontractor services',
      descriptionAr: 'خدمات المقاولين المتخصصين',
    },
  ],
  monthlyExpenses: [
    { month: 'Jan', monthAr: 'يناير', amount: 2100000 },
    { month: 'Feb', monthAr: 'فبراير', amount: 2350000 },
    { month: 'Mar', monthAr: 'مارس', amount: 2800000 },
    { month: 'Apr', monthAr: 'أبريل', amount: 3100000 },
    { month: 'May', monthAr: 'مايو', amount: 2950000 },
    { month: 'Jun', monthAr: 'يونيو', amount: 3200000 },
    { month: 'Jul', monthAr: 'يوليو', amount: 2850000 },
    { month: 'Aug', monthAr: 'أغسطس', amount: 3050000 },
    { month: 'Sep', monthAr: 'سبتمبر', amount: 2900000 },
    { month: 'Oct', monthAr: 'أكتوبر', amount: 3150000 },
    { month: 'Nov', monthAr: 'نوفمبر', amount: 3000000 },
    { month: 'Dec', monthAr: 'ديسمبر', amount: 1650000 },
  ],
  invoices: [
    {
      id: 'inv-1',
      invoiceNumber: 'INV-2024-001',
      amount: 7500000,
      status: 'paid',
      statusAr: 'مدفوع',
      dueDate: '2024-06-30',
      paidDate: '2024-06-25',
    },
    {
      id: 'inv-2',
      invoiceNumber: 'INV-2024-002',
      amount: 8000000,
      status: 'paid',
      statusAr: 'مدفوع',
      dueDate: '2024-09-30',
      paidDate: '2024-09-28',
    },
    {
      id: 'inv-3',
      invoiceNumber: 'INV-2024-003',
      amount: 9000000,
      status: 'pending',
      statusAr: 'معلق',
      dueDate: '2024-12-31',
    },
    {
      id: 'inv-4',
      invoiceNumber: 'INV-2024-004',
      amount: 8500000,
      status: 'overdue',
      statusAr: 'متأخر',
      dueDate: '2024-11-30',
    },
  ],
  employees: [
    {
      id: 'pe-1',
      employeeId: 'emp-001',
      name: 'Ahmed Al-Rashid',
      nameAr: 'أحمد الرشيد',
      role: 'Project Manager',
      roleAr: 'مدير المشروع',
      joinedDate: '2024-01-15',
      allocation: 100,
    },
    {
      id: 'pe-2',
      employeeId: 'emp-002',
      name: 'Khalid Al-Ghamdi',
      nameAr: 'خالد الغامدي',
      role: 'Site Engineer',
      roleAr: 'مهندس موقع',
      joinedDate: '2024-01-20',
      allocation: 100,
    },
    {
      id: 'pe-3',
      employeeId: 'emp-003',
      name: 'Fahad Al-Otaibi',
      nameAr: 'فهد العتيبي',
      role: 'Architect',
      roleAr: 'مهندس معماري',
      joinedDate: '2024-02-01',
      allocation: 75,
    },
    {
      id: 'pe-4',
      employeeId: 'emp-004',
      name: 'Saud Al-Dossary',
      nameAr: 'سعود الدوسري',
      role: 'Quantity Surveyor',
      roleAr: 'مهندس كميات',
      joinedDate: '2024-02-15',
      allocation: 50,
    },
    {
      id: 'pe-5',
      employeeId: 'emp-005',
      name: 'Mohammed Al-Harbi',
      nameAr: 'محمد الحربي',
      role: 'Safety Officer',
      roleAr: 'ضابط سلامة',
      joinedDate: '2024-01-25',
      allocation: 100,
    },
  ],
  equipment: [
    {
      id: 'eq-1',
      equipmentId: 'eq-001',
      name: 'Tower Crane TC-1',
      nameAr: 'رافعة برجية TC-1',
      type: 'crane',
      typeAr: 'رافعة',
      status: 'in-use',
      statusAr: 'قيد الاستخدام',
    },
    {
      id: 'eq-2',
      equipmentId: 'eq-002',
      name: 'Tower Crane TC-2',
      nameAr: 'رافعة برجية TC-2',
      type: 'crane',
      typeAr: 'رافعة',
      status: 'in-use',
      statusAr: 'قيد الاستخدام',
    },
    {
      id: 'eq-3',
      equipmentId: 'eq-003',
      name: 'Excavator CAT-320',
      nameAr: 'حفارة كاتربيلر-320',
      type: 'excavator',
      typeAr: 'حفارة',
      status: 'in-use',
      statusAr: 'قيد الاستخدام',
    },
    {
      id: 'eq-4',
      equipmentId: 'eq-004',
      name: 'Concrete Mixer',
      nameAr: 'خلاطة خرسانة',
      type: 'mixer',
      typeAr: 'خلاطة',
      status: 'maintenance',
      statusAr: 'تحت الصيانة',
    },
    {
      id: 'eq-5',
      equipmentId: 'eq-005',
      name: 'Bulldozer D6',
      nameAr: 'جرافة D6',
      type: 'bulldozer',
      typeAr: 'جرافة',
      status: 'available',
      statusAr: 'متاح',
    },
  ],
  items: [
    {
      id: 'item-1',
      code: 'ITM-001',
      name: 'Concrete Works - Foundation',
      nameAr: 'أعمال الخرسانة - الأساسات',
      description: 'Reinforced concrete for foundation and substructure',
      descriptionAr: 'الخرسانة المسلحة للأساسات والتحتstructure',
      unit: 'm3',
      unitAr: 'متر مكعب',
      quantity: 2500,
      unitPrice: 450,
      totalPrice: 1125000,
      category: 'Concrete',
      categoryAr: 'خرسانة',
      status: 'completed',
      statusAr: 'مكتمل',
    },
    {
      id: 'item-2',
      code: 'ITM-002',
      name: 'Steel Reinforcement',
      nameAr: 'حديد التسليح',
      description: 'Steel bars and mesh for reinforcement',
      descriptionAr: 'حديد وقضمان التسليح',
      unit: 'ton',
      unitAr: 'طن',
      quantity: 380,
      unitPrice: 3200,
      totalPrice: 1216000,
      category: 'Steel',
      categoryAr: 'حديد',
      status: 'completed',
      statusAr: 'مكتمل',
    },
    {
      id: 'item-3',
      code: 'ITM-003',
      name: 'Block Work - Walls',
      nameAr: 'أعمال البلوك - الجدران',
      description: 'AAC block walls for interior and exterior',
      descriptionAr: 'جدران بلوك AAC للداخل والخارج',
      unit: 'm2',
      unitAr: 'متر مربع',
      quantity: 15000,
      unitPrice: 85,
      totalPrice: 1275000,
      category: 'Masonry',
      categoryAr: 'بناء',
      status: 'in-progress',
      statusAr: 'قيد التنفيذ',
    },
    {
      id: 'item-4',
      code: 'ITM-004',
      name: 'Plastering Works',
      nameAr: 'أعمال اللياسة',
      description: 'Internal and external plastering',
      descriptionAr: 'لياسة داخلية وخارجية',
      unit: 'm2',
      unitAr: 'متر مربع',
      quantity: 22000,
      unitPrice: 55,
      totalPrice: 1210000,
      category: 'Finishing',
      categoryAr: 'تشطيبات',
      status: 'pending',
      statusAr: 'معلق',
    },
    {
      id: 'item-5',
      code: 'ITM-005',
      name: 'Floor Tiling',
      nameAr: 'تبليط الأرضيات',
      description: 'Ceramic and porcelain tiles for floors',
      descriptionAr: 'بلاط سيراميك وبورسلان للأرضيات',
      unit: 'm2',
      unitAr: 'متر مربع',
      quantity: 12500,
      unitPrice: 120,
      totalPrice: 1500000,
      category: 'Finishing',
      categoryAr: 'تشطيبات',
      status: 'pending',
      statusAr: 'معلق',
    },
    {
      id: 'item-6',
      code: 'ITM-006',
      name: 'Painting Works',
      nameAr: 'أعمال الدهان',
      description: 'Internal and external painting',
      descriptionAr: 'دهان داخلي وخارجي',
      unit: 'm2',
      unitAr: 'متر مربع',
      quantity: 28000,
      unitPrice: 45,
      totalPrice: 1260000,
      category: 'Finishing',
      categoryAr: 'تشطيبات',
      status: 'pending',
      statusAr: 'معلق',
    },
    {
      id: 'item-7',
      code: 'ITM-007',
      name: 'Aluminum Windows',
      nameAr: 'نوافذ ألومنيوم',
      description: 'Aluminum frames and glass windows',
      descriptionAr: 'أطر ألومنيوم وزجاج نوافذ',
      unit: 'piece',
      unitAr: 'قطعة',
      quantity: 450,
      unitPrice: 1200,
      totalPrice: 540000,
      category: 'Joinery',
      categoryAr: 'نجارة',
      status: 'approved',
      statusAr: 'معتمد',
    },
    {
      id: 'item-8',
      code: 'ITM-008',
      name: 'HVAC System',
      nameAr: 'نظام التكييف',
      description: 'Central air conditioning system',
      descriptionAr: 'نظام تكييف مركزي',
      unit: 'set',
      unitAr: 'مجموعة',
      quantity: 1,
      unitPrice: 2800000,
      totalPrice: 2800000,
      category: 'MEP',
      categoryAr: 'ميكانيكا',
      status: 'approved',
      statusAr: 'معتمد',
    },
  ],
}

// ============================================================================
// API FUNCTIONS
// ============================================================================
async function fetchProjects(
  filters: ProjectFilters = {},
  page: number = 1,
  pageSize: number = 12
): Promise<ProjectsListResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    if (filters.search) params.append('search', filters.search)
    if (filters.status && filters.status !== 'all') params.append('status', filters.status)

    const response = await fetch(`/api/projects?${params}`)
    if (!response.ok) throw new Error('Failed to fetch projects')
    return await response.json()
  } catch (error) {
    console.warn('API fetch failed, using mock data:', error)
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filtered = mockProjects
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.nameAr.includes(search) ||
          p.code.toLowerCase().includes(search)
      )
    }
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((p) => p.status === filters.status)
    }

    const start = (page - 1) * pageSize
    const paginated = filtered.slice(start, start + pageSize)

    return {
      projects: paginated,
      total: filtered.length,
      page,
      pageSize,
    }
  }
}

async function fetchProjectDetail(id: string): Promise<ProjectDetail> {
  try {
    const response = await fetch(`/api/projects/${id}`)
    if (!response.ok) throw new Error('Failed to fetch project detail')
    return await response.json()
  } catch (error) {
    console.warn('API fetch failed, using mock data:', error)
    await new Promise((resolve) => setTimeout(resolve, 400))
    return mockProjectDetail
  }
}

async function createProject(data: CreateProjectData): Promise<Project> {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create project')
    return await response.json()
  } catch (error) {
    console.warn('API create failed, using mock response:', error)
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      id: `new-${Date.now()}`,
      code: data.code,
      name: data.name,
      nameAr: data.nameAr,
      description: data.description,
      descriptionAr: data.descriptionAr,
      status: 'planning',
      statusAr: 'في التخطيط',
      clientId: data.clientId,
      clientName: 'New Client',
      clientNameAr: 'عميل جديد',
      managerId: data.managerId,
      managerName: 'New Manager',
      managerNameAr: 'مدير جديد',
      budget: data.budget,
      spent: 0,
      progress: 0,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      locationAr: data.locationAr,
      employeeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

async function updateProject(id: string, data: UpdateProjectData): Promise<Project> {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update project')
    return await response.json()
  } catch (error) {
    console.warn('API update failed, using mock response:', error)
    await new Promise((resolve) => setTimeout(resolve, 400))
    const project = mockProjects.find((p) => p.id === id)
    if (!project) throw new Error('Project not found')
    return { ...project, ...data, updatedAt: new Date().toISOString() }
  }
}

async function deleteProject(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete project')
  } catch (error) {
    console.warn('API delete failed, using mock response:', error)
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
}

// ============================================================================
// CLIENTS & MANAGERS (for dropdowns)
// ============================================================================
export interface Client {
  id: string
  name: string
  nameAr: string
  company: string
  companyAr: string
}

export interface Manager {
  id: string
  name: string
  nameAr: string
  role: string
  roleAr: string
}

const mockClients: Client[] = [
  { id: 'client-1', name: 'Al Rajhi Development', nameAr: 'الراجحي للتطوير العقاري', company: 'Al Rajhi', companyAr: 'الراجحي' },
  { id: 'client-2', name: 'Red Sea Global', nameAr: 'البحر الأحمر العالمية', company: 'RSG', companyAr: 'البحر الأحمر' },
  { id: 'client-3', name: 'Saudi Aramco', nameAr: 'أرامكو السعودية', company: 'Aramco', companyAr: 'أرامكو' },
  { id: 'client-4', name: 'Ministry of Transport', nameAr: 'وزارة النقل', company: 'MOT', companyAr: 'وزارة النقل' },
  { id: 'client-5', name: 'Eastern Province Municipality', nameAr: 'بلدية المنطقة الشرقية', company: 'Municipality', companyAr: 'البلدية' },
]

const mockManagers: Manager[] = [
  { id: 'mgr-1', name: 'Mohammed Al-Saud', nameAr: 'محمد السعود', role: 'Senior Project Manager', roleAr: 'مدير مشاريع أول' },
  { id: 'mgr-2', name: 'Khalid Ibrahim', nameAr: 'خليل إبراهيم', role: 'Project Manager', roleAr: 'مدير مشاريع' },
  { id: 'mgr-3', name: 'Fahad Al-Otaibi', nameAr: 'فهد العتيبي', role: 'Project Manager', roleAr: 'مدير مشاريع' },
  { id: 'mgr-4', name: 'Abdullah Al-Qahtani', nameAr: 'عبد الله القحطاني', role: 'Senior Project Manager', roleAr: 'مدير مشاريع أول' },
  { id: 'mgr-5', name: 'Saud Al-Dossary', nameAr: 'سعود الدوسري', role: 'Project Manager', roleAr: 'مدير مشاريع' },
]

export async function getClients(): Promise<Client[]> {
  try {
    const response = await fetch('/api/clients')
    if (response.ok) return await response.json()
  } catch (error) {
    console.warn('Clients API fetch failed, using mock data')
  }
  return mockClients
}

export async function getManagers(): Promise<Manager[]> {
  try {
    const response = await fetch('/api/managers')
    if (response.ok) return await response.json()
  } catch (error) {
    console.warn('Managers API fetch failed, using mock data')
  }
  return mockManagers
}

// ============================================================================
// HOOKS
// ============================================================================
export function useProjects(filters?: ProjectFilters, page?: number, pageSize?: number) {
  return useQuery({
    queryKey: ['projects', filters, page, pageSize],
    queryFn: () => fetchProjects(filters, page, pageSize),
    staleTime: 2 * 60 * 1000,
  })
}

export function useProjectDetail(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProjectDetail(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('تم إنشاء المشروع بنجاح')
    },
    onError: (error) => {
      console.error('Create project error:', error)
      toast.error('فشل إنشاء المشروع')
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
      toast.success('تم تحديث المشروع بنجاح')
    },
    onError: (error) => {
      console.error('Update project error:', error)
      toast.error('فشل تحديث المشروع')
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('تم حذف المشروع بنجاح')
    },
    onError: (error) => {
      console.error('Delete project error:', error)
      toast.error('فشل حذف المشروع')
    },
  })
}

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
    staleTime: 10 * 60 * 1000,
  })
}

export function useManagers() {
  return useQuery({
    queryKey: ['managers'],
    queryFn: getManagers,
    staleTime: 10 * 60 * 1000,
  })
}

// Storage key for projects
const PROJECTS_STORAGE_KEY = 'heavyops_projects'

// Local storage functions for projects
function getStoredProjects(): Project[] {
  if (typeof window === 'undefined') return mockProjects
  const stored = localStorage.getItem(PROJECTS_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return mockProjects
    }
  }
  return mockProjects
}

function saveStoredProjects(projects: Project[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects))
  }
}

// Hook to assign equipment to project
export function useAssignEquipmentToProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, equipmentId }: { projectId: string; equipmentId: string }) => {
      const projects = getStoredProjects()
      const projectIndex = projects.findIndex(p => p.id === projectId)
      if (projectIndex === -1) throw new Error('Project not found')

      const project = projects[projectIndex]
      if (!project.assignedEquipmentIds.includes(equipmentId)) {
        project.assignedEquipmentIds = [...project.assignedEquipmentIds, equipmentId]
        project.updatedAt = new Date().toISOString()
      }

      saveStoredProjects(projects)
      return { projectId, equipmentId, project }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
      toast.success('تم إضافة المعدة للمشروع بنجاح')
    },
    onError: (error) => {
      console.error('Assign equipment error:', error)
      toast.error('فشل إضافة المعدة للمشروع')
    },
  })
}

// Hook to unassign equipment from project
export function useUnassignEquipmentFromProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, equipmentId }: { projectId: string; equipmentId: string }) => {
      const projects = getStoredProjects()
      const projectIndex = projects.findIndex(p => p.id === projectId)
      if (projectIndex === -1) throw new Error('Project not found')

      const project = projects[projectIndex]
      project.assignedEquipmentIds = project.assignedEquipmentIds.filter(id => id !== equipmentId)
      project.updatedAt = new Date().toISOString()

      saveStoredProjects(projects)
      return { projectId, equipmentId, project }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] })
      toast.success('تم إزالة المعدة من المشروع بنجاح')
    },
    onError: (error) => {
      console.error('Unassign equipment error:', error)
      toast.error('فشل إزالة المعدة من المشروع')
    },
  })
}
