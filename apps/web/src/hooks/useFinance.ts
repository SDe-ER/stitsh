import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type ExpenseCategory = 'materials' | 'labor' | 'equipment' | 'transport' | 'subcontractors' | 'utilities' | 'office' | 'other'

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  clientName: string
  clientNameAr: string
  projectId: string
  projectCode: string
  projectName: string
  projectNameAr: string
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  statusAr: string
  notes?: string
  notesAr?: string
  items: InvoiceItem[]
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  descriptionAr: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Expense {
  id: string
  category: ExpenseCategory
  categoryAr: string
  description: string
  descriptionAr: string
  amount: number
  projectId?: string
  projectCode?: string
  projectName?: string
  projectNameAr?: string
  date: string
  approvedBy: string
  approvedByAr: string
  receiptNumber?: string
  paymentMethod: 'cash' | 'bank' | 'credit'
  paymentMethodAr: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  pendingPayments: number
  overduePayments: number
}

export interface MonthlyData {
  month: string
  monthAr: string
  revenue: number
  expenses: number
  profit: number
}

export interface ExpenseByCategory {
  category: string
  categoryAr: string
  amount: number
  percentage: number
  color: string
}

export interface AuditTransaction {
  id: string
  type: 'invoice' | 'expense' | 'payment'
  typeAr: string
  description: string
  descriptionAr: string
  amount: number
  category: string
  categoryAr: string
  projectId?: string
  projectNameAr?: string
  date: string
  reference: string
  status: string
  statusAr: string
}

export interface ProfitLossSummary {
  totalRevenue: number
  directCosts: number
  grossProfit: number
  grossMargin: number
  operatingExpenses: number
  netProfit: number
  netMargin: number
}

export interface CreateInvoiceData {
  invoiceNumber: string
  clientId: string
  projectId: string
  issueDate: string
  dueDate: string
  items: Omit<InvoiceItem, 'id'>[]
  notes?: string
  notesAr?: string
}

export interface CreateExpenseData {
  category: ExpenseCategory
  description: string
  descriptionAr: string
  amount: number
  projectId?: string
  date: string
  approvedBy: string
  receiptNumber?: string
  paymentMethod: 'cash' | 'bank' | 'credit'
  notes?: string
}

export interface FinanceFilters {
  status?: InvoiceStatus
  category?: ExpenseCategory
  projectId?: string
  startDate?: string
  endDate?: string
}

// ============================================================================
// LABELS & CONSTANTS
// ============================================================================

export const invoiceStatusLabels: Record<InvoiceStatus, { label: string; labelAr: string; color: string }> = {
  draft: { label: 'Draft', labelAr: 'مسودة', color: 'bg-gray-100 text-gray-700' },
  sent: { label: 'Sent', labelAr: 'مرسلة', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid', labelAr: 'مدفوعة', color: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overdue', labelAr: 'متأخرة', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', labelAr: 'ملغاة', color: 'bg-slate-100 text-slate-600' },
}

export const expenseCategoryLabels: Record<ExpenseCategory, { label: string; labelAr: string; icon: string }> = {
  materials: { label: 'Materials', labelAr: 'المواد', icon: '📦' },
  labor: { label: 'Labor', labelAr: 'العمالة', icon: '👷' },
  equipment: { label: 'Equipment', labelAr: 'المعدات', icon: '🚛' },
  transport: { label: 'Transport', labelAr: 'النقل', icon: '🚚' },
  subcontractors: { label: 'Subcontractors', labelAr: 'المقاولين من الباطن', icon: '🤝' },
  utilities: { label: 'Utilities', labelAr: 'المرافق', icon: '⚡' },
  office: { label: 'Office', labelAr: 'المكتبي', icon: '📁' },
  other: { label: 'Other', labelAr: 'أخرى', icon: '📄' },
}

export const paymentMethodLabels: Record<'cash' | 'bank' | 'credit', { label: string; labelAr: string }> = {
  cash: { label: 'Cash', labelAr: 'نقدي' },
  bank: { label: 'Bank Transfer', labelAr: 'تحويل بنكي' },
  credit: { label: 'Credit', labelAr: 'آجل' },
}

const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  materials: '#2563eb',
  labor: '#16a34a',
  equipment: '#dc2626',
  transport: '#f59e0b',
  subcontractors: '#8b5cf6',
  utilities: '#06b6d4',
  office: '#ec4899',
  other: '#6b7280',
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const INVOICES_KEY = 'heavyops_invoices'
const EXPENSES_KEY = 'heavyops_expenses'

// ============================================================================
// DEFAULT DATA
// ============================================================================

const defaultInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    clientId: 'client-1',
    clientName: 'Al Rajhi Development',
    clientNameAr: 'الراجحي للتطوير العقاري',
    projectId: '1',
    projectCode: 'PRJ-001',
    projectName: 'Riyadh Residential Tower',
    projectNameAr: 'برج الرياض السكني',
    subtotal: 450000,
    taxRate: 15,
    taxAmount: 67500,
    totalAmount: 517500,
    issueDate: '2024-12-01',
    dueDate: '2024-12-31',
    status: 'paid',
    statusAr: 'مدفوعة',
    notes: 'Payment for Phase 1 completion',
    notesAr: 'دفعة لإكمال المرحلة الأولى',
    items: [
      {
        id: 'item-1',
        description: 'Foundation Works',
        descriptionAr: 'أعمال الأساسات',
        quantity: 1,
        unitPrice: 450000,
        total: 450000,
      },
    ],
    createdAt: '2024-12-01T08:00:00',
    updatedAt: '2024-12-25T10:30:00',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-002',
    clientId: 'client-2',
    clientName: 'Mada\'en Construction',
    clientNameAr: 'مدن للمقاولات',
    projectId: '2',
    projectCode: 'PRJ-002',
    projectName: 'Jeddah Commercial Mall',
    projectNameAr: 'مول جدة التجاري',
    subtotal: 320000,
    taxRate: 15,
    taxAmount: 48000,
    totalAmount: 368000,
    issueDate: '2024-12-05',
    dueDate: '2025-01-05',
    status: 'sent',
    statusAr: 'مرسلة',
    items: [
      {
        id: 'item-2',
        description: 'Steel Structure Works',
        descriptionAr: 'أعمال الهيكل الفولاذي',
        quantity: 1,
        unitPrice: 320000,
        total: 320000,
      },
    ],
    createdAt: '2024-12-05T09:00:00',
    updatedAt: '2024-12-05T09:00:00',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-003',
    clientId: 'client-1',
    clientName: 'Al Rajhi Development',
    clientNameAr: 'الراجحي للتطوير العقاري',
    projectId: '1',
    projectCode: 'PRJ-001',
    projectName: 'Riyadh Residential Tower',
    projectNameAr: 'برج الرياض السكني',
    subtotal: 180000,
    taxRate: 15,
    taxAmount: 27000,
    totalAmount: 207000,
    issueDate: '2024-11-20',
    dueDate: '2024-12-20',
    status: 'overdue',
    statusAr: 'متأخرة',
    items: [
      {
        id: 'item-3',
        description: 'Block Works - 3rd Floor',
        descriptionAr: 'أعمال البلوك - الدور الثالث',
        quantity: 1,
        unitPrice: 180000,
        total: 180000,
      },
    ],
    createdAt: '2024-11-20T08:00:00',
    updatedAt: '2024-11-20T08:00:00',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2024-004',
    clientId: 'client-3',
    clientName: 'Saudi Binladin Group',
    clientNameAr: 'مجموعة بن لادن السعودية',
    projectId: '3',
    projectCode: 'PRJ-003',
    projectName: 'Dammam Industrial Complex',
    projectNameAr: 'مجمع الدمام الصناعي',
    subtotal: 650000,
    taxRate: 15,
    taxAmount: 97500,
    totalAmount: 747500,
    issueDate: '2024-12-10',
    dueDate: '2025-01-10',
    status: 'draft',
    statusAr: 'مسودة',
    items: [
      {
        id: 'item-4',
        description: 'Earthworks & Site Preparation',
        descriptionAr: 'أعمال الحفر وتجهيز الموقع',
        quantity: 1,
        unitPrice: 650000,
        total: 650000,
      },
    ],
    createdAt: '2024-12-10T14:00:00',
    updatedAt: '2024-12-10T14:00:00',
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2024-005',
    clientId: 'client-4',
    clientName: 'El Seif Engineering',
    clientNameAr: 'السيف الهندسية',
    projectId: '4',
    projectCode: 'PRJ-004',
    projectName: 'Medina Metro Extension',
    projectNameAr: 'توسعة مترو المدينة',
    subtotal: 890000,
    taxRate: 15,
    taxAmount: 133500,
    totalAmount: 1023500,
    issueDate: '2024-11-15',
    dueDate: '2024-12-15',
    status: 'overdue',
    statusAr: 'متأخرة',
    items: [
      {
        id: 'item-5',
        description: 'Excavation & Shoring',
        descriptionAr: 'الحفر والردم',
        quantity: 1,
        unitPrice: 890000,
        total: 890000,
      },
    ],
    createdAt: '2024-11-15T10:00:00',
    updatedAt: '2024-11-15T10:00:00',
  },
]

const defaultExpenses: Expense[] = [
  {
    id: 'exp-1',
    category: 'materials',
    categoryAr: 'المواد',
    description: 'Cement purchase - Riyadh Plant',
    descriptionAr: 'شراء أسمنت - مصنع الرياض',
    amount: 85000,
    projectId: '1',
    projectCode: 'PRJ-001',
    projectName: 'Riyadh Residential Tower',
    projectNameAr: 'برج الرياض السكني',
    date: '2024-12-05',
    approvedBy: 'Ahmed Al-Rashid',
    approvedByAr: 'أحمد الرشيد',
    receiptNumber: 'RCPT-2024-1205',
    paymentMethod: 'bank',
    paymentMethodAr: 'تحويل بنكي',
    createdAt: '2024-12-05T10:00:00',
    updatedAt: '2024-12-05T10:00:00',
  },
  {
    id: 'exp-2',
    category: 'labor',
    categoryAr: 'العمالة',
    description: 'Weekly wages - November Week 4',
    descriptionAr: 'أجور أسبوعية - الأسبوع الرابع من نوفمبر',
    amount: 125000,
    projectId: '2',
    projectCode: 'PRJ-002',
    projectName: 'Jeddah Commercial Mall',
    projectNameAr: 'مول جدة التجاري',
    date: '2024-11-28',
    approvedBy: 'Khalid Al-Ghamdi',
    approvedByAr: 'خالد الغامدي',
    paymentMethod: 'bank',
    paymentMethodAr: 'تحويل بنكي',
    createdAt: '2024-11-28T14:00:00',
    updatedAt: '2024-11-28T14:00:00',
  },
  {
    id: 'exp-3',
    category: 'equipment',
    categoryAr: 'المعدات',
    description: 'Crane rental - 2 weeks',
    descriptionAr: 'إيجار رافعة - أسبوعين',
    amount: 45000,
    projectId: '1',
    projectCode: 'PRJ-001',
    projectName: 'Riyadh Residential Tower',
    projectNameAr: 'برج الرياض السكني',
    date: '2024-12-01',
    approvedBy: 'Ahmed Al-Rashid',
    approvedByAr: 'أحمد الرشيد',
    receiptNumber: 'CR-2024-1201',
    paymentMethod: 'credit',
    paymentMethodAr: 'آجل',
    createdAt: '2024-12-01T09:00:00',
    updatedAt: '2024-12-01T09:00:00',
  },
  {
    id: 'exp-4',
    category: 'transport',
    categoryAr: 'النقل',
    description: 'Truck fuel - November',
    descriptionAr: 'وقود الشاحنات - نوفمبر',
    amount: 32000,
    projectId: '3',
    projectCode: 'PRJ-003',
    projectName: 'Dammam Industrial Complex',
    projectNameAr: 'مجمع الدمام الصناعي',
    date: '2024-11-30',
    approvedBy: 'Saud Al-Dossary',
    approvedByAr: 'سعود الدوسري',
    receiptNumber: 'FL-2024-1130',
    paymentMethod: 'cash',
    paymentMethodAr: 'نقدي',
    createdAt: '2024-11-30T16:00:00',
    updatedAt: '2024-11-30T16:00:00',
  },
  {
    id: 'exp-5',
    category: 'subcontractors',
    categoryAr: 'المقاولين من الباطن',
    description: 'Electrical works - Phase 1',
    descriptionAr: 'أعمال كهرباء - المرحلة الأولى',
    amount: 180000,
    projectId: '4',
    projectCode: 'PRJ-004',
    projectName: 'Medina Metro Extension',
    projectNameAr: 'توسعة مترو المدينة',
    date: '2024-12-08',
    approvedBy: 'Fahad Al-Otaibi',
    approvedByAr: 'فهد العتيبي',
    paymentMethod: 'bank',
    paymentMethodAr: 'تحويل بنكي',
    createdAt: '2024-12-08T11:00:00',
    updatedAt: '2024-12-08T11:00:00',
  },
  {
    id: 'exp-6',
    category: 'utilities',
    categoryAr: 'المرافق',
    description: 'Office electricity - December',
    descriptionAr: 'كهرباء المكتب - ديسمبر',
    amount: 3500,
    date: '2024-12-01',
    approvedBy: 'Layla Mahmood',
    approvedByAr: 'ليلى محمود',
    paymentMethod: 'bank',
    paymentMethodAr: 'تحويل بنكي',
    createdAt: '2024-12-01T08:00:00',
    updatedAt: '2024-12-01T08:00:00',
  },
  {
    id: 'exp-7',
    category: 'office',
    categoryAr: 'المكتبي',
    description: 'Office supplies & stationery',
    descriptionAr: 'لوازم المكتب والأدوات المكتبية',
    amount: 4200,
    date: '2024-12-03',
    approvedBy: 'Layla Mahmood',
    approvedByAr: 'ليلى محمود',
    receiptNumber: 'OS-2024-1203',
    paymentMethod: 'cash',
    paymentMethodAr: 'نقدي',
    createdAt: '2024-12-03T10:00:00',
    updatedAt: '2024-12-03T10:00:00',
  },
  {
    id: 'exp-8',
    category: 'materials',
    categoryAr: 'المواد',
    description: 'Steel reinforcement bars - 50 tons',
    descriptionAr: 'حديد التسليح - 50 طن',
    amount: 225000,
    projectId: '2',
    projectCode: 'PRJ-002',
    projectName: 'Jeddah Commercial Mall',
    projectNameAr: 'مول جدة التجاري',
    date: '2024-12-07',
    approvedBy: 'Khalid Al-Ghamdi',
    approvedByAr: 'خالد الغامدي',
    receiptNumber: 'ST-2024-1207',
    paymentMethod: 'bank',
    paymentMethodAr: 'تحويل بنكي',
    createdAt: '2024-12-07T14:00:00',
    updatedAt: '2024-12-07T14:00:00',
  },
]

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

function getInvoices(): Invoice[] {
  if (typeof window === 'undefined') return defaultInvoices
  const stored = localStorage.getItem(INVOICES_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultInvoices
    }
  }
  return defaultInvoices
}

function saveInvoices(invoices: Invoice[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices))
  }
}

function getExpenses(): Expense[] {
  if (typeof window === 'undefined') return defaultExpenses
  const stored = localStorage.getItem(EXPENSES_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return defaultExpenses
    }
  }
  return defaultExpenses
}

function saveExpenses(expenses: Expense[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses))
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchFinancialSummary(): Promise<FinancialSummary> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const invoices = getInvoices()
  const expenses = getExpenses()

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  const pendingPayments = invoices
    .filter((inv) => inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  const overduePayments = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    pendingPayments,
    overduePayments,
  }
}

async function fetchInvoices(filters?: FinanceFilters): Promise<Invoice[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  let filtered = getInvoices()

  if (filters?.status) {
    filtered = filtered.filter((inv) => inv.status === filters.status)
  }

  if (filters?.projectId) {
    filtered = filtered.filter((inv) => inv.projectId === filters.projectId)
  }

  if (filters?.startDate) {
    filtered = filtered.filter((inv) => inv.issueDate >= filters.startDate!)
  }

  if (filters?.endDate) {
    filtered = filtered.filter((inv) => inv.issueDate <= filters.endDate!)
  }

  return filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
}

async function fetchExpenses(filters?: FinanceFilters): Promise<Expense[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  let filtered = getExpenses()

  if (filters?.category) {
    filtered = filtered.filter((exp) => exp.category === filters.category)
  }

  if (filters?.projectId) {
    filtered = filtered.filter((exp) => exp.projectId === filters.projectId)
  }

  if (filters?.startDate) {
    filtered = filtered.filter((exp) => exp.date >= filters.startDate!)
  }

  if (filters?.endDate) {
    filtered = filtered.filter((exp) => exp.date <= filters.endDate!)
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

async function fetchMonthlyData(): Promise<MonthlyData[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const invoices = getInvoices()
  const expenses = getExpenses()

  const monthlyData: MonthlyData[] = [
    {
      month: 'January',
      monthAr: 'يناير',
      revenue: 850000,
      expenses: 520000,
      profit: 330000,
    },
    {
      month: 'February',
      monthAr: 'فبراير',
      revenue: 920000,
      expenses: 580000,
      profit: 340000,
    },
    {
      month: 'March',
      monthAr: 'مارس',
      revenue: 1100000,
      expenses: 650000,
      profit: 450000,
    },
    {
      month: 'April',
      monthAr: 'أبريل',
      revenue: 1050000,
      expenses: 620000,
      profit: 430000,
    },
    {
      month: 'May',
      monthAr: 'مايو',
      revenue: 1250000,
      expenses: 720000,
      profit: 530000,
    },
    {
      month: 'June',
      monthAr: 'يونيو',
      revenue: 1350000,
      expenses: 780000,
      profit: 570000,
    },
    {
      month: 'July',
      monthAr: 'يوليو',
      revenue: 1280000,
      expenses: 750000,
      profit: 530000,
    },
    {
      month: 'August',
      monthAr: 'أغسطس',
      revenue: 1400000,
      expenses: 820000,
      profit: 580000,
    },
    {
      month: 'September',
      monthAr: 'سبتمبر',
      revenue: 1320000,
      expenses: 780000,
      profit: 540000,
    },
    {
      month: 'October',
      monthAr: 'أكتوبر',
      revenue: 1180000,
      expenses: 690000,
      profit: 490000,
    },
    {
      month: 'November',
      monthAr: 'نوفمبر',
      revenue: 1650000,
      expenses: 920000,
      profit: 730000,
    },
    {
      month: 'December',
      monthAr: 'ديسمبر',
      revenue: 1023500 + 368000 + 517500, // Current month from actual data
      expenses: expenses.reduce((sum, exp) => {
        if (exp.date.startsWith('2024-12')) return sum + exp.amount
        return sum
      }, 0),
      profit: 0, // Calculated below
    },
  ]

  // Calculate December profit
  const decIndex = monthlyData.findIndex((m) => m.month === 'December')
  if (decIndex !== -1) {
    monthlyData[decIndex].profit = monthlyData[decIndex].revenue - monthlyData[decIndex].expenses
  }

  return monthlyData
}

async function fetchExpensesByCategory(): Promise<ExpenseByCategory[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const expenses = getExpenses()
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const categoryMap = new Map<ExpenseCategory, number>()
  expenses.forEach((exp) => {
    categoryMap.set(exp.category, (categoryMap.get(exp.category) || 0) + exp.amount)
  })

  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    categoryAr: expenseCategoryLabels[category].labelAr,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    color: EXPENSE_CATEGORY_COLORS[category],
  }))
}

async function fetchAuditTransactions(filters?: FinanceFilters): Promise<AuditTransaction[]> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const invoices = getInvoices()
  const expenses = getExpenses()

  const transactions: AuditTransaction[] = [
    ...invoices.map((inv) => ({
      id: inv.id,
      type: 'invoice' as const,
      typeAr: 'فاتورة',
      description: `Invoice ${inv.invoiceNumber} - ${inv.clientNameAr}`,
      descriptionAr: `فاتورة ${inv.invoiceNumber} - ${inv.clientNameAr}`,
      amount: inv.totalAmount,
      category: 'Revenue',
      categoryAr: 'إيرادات',
      projectId: inv.projectId,
      projectNameAr: inv.projectNameAr,
      date: inv.issueDate,
      reference: inv.invoiceNumber,
      status: inv.status,
      statusAr: inv.statusAr,
    })),
    ...expenses.map((exp) => ({
      id: exp.id,
      type: 'expense' as const,
      typeAr: 'مصروف',
      description: exp.descriptionAr,
      descriptionAr: exp.descriptionAr,
      amount: exp.amount,
      category: exp.categoryAr,
      categoryAr: exp.categoryAr,
      projectId: exp.projectId,
      projectNameAr: exp.projectNameAr,
      date: exp.date,
      reference: exp.receiptNumber || '-',
      status: 'approved',
      statusAr: 'معتمد',
    })),
  ]

  let filtered = transactions

  if (filters?.projectId) {
    filtered = filtered.filter((t) => t.projectId === filters.projectId)
  }

  if (filters?.startDate) {
    filtered = filtered.filter((t) => t.date >= filters.startDate!)
  }

  if (filters?.endDate) {
    filtered = filtered.filter((t) => t.date <= filters.endDate!)
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

async function fetchProfitLossSummary(filters?: FinanceFilters): Promise<ProfitLossSummary> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const invoices = getInvoices()
  const expenses = getExpenses()

  let filteredInvoices = invoices
  let filteredExpenses = expenses

  if (filters?.projectId) {
    filteredInvoices = filteredInvoices.filter((inv) => inv.projectId === filters.projectId)
    filteredExpenses = filteredExpenses.filter((exp) => exp.projectId === filters.projectId)
  }

  if (filters?.startDate) {
    filteredInvoices = filteredInvoices.filter((inv) => inv.issueDate >= filters.startDate!)
    filteredExpenses = filteredExpenses.filter((exp) => exp.date >= filters.startDate!)
  }

  if (filters?.endDate) {
    filteredInvoices = filteredInvoices.filter((inv) => inv.issueDate <= filters.endDate!)
    filteredExpenses = filteredExpenses.filter((exp) => exp.date <= filters.endDate!)
  }

  const totalRevenue = filteredInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  const directCosts = filteredExpenses
    .filter((exp) => ['materials', 'labor', 'equipment', 'transport'].includes(exp.category))
    .reduce((sum, exp) => sum + exp.amount, 0)

  const operatingExpenses = filteredExpenses
    .filter((exp) => !['materials', 'labor', 'equipment', 'transport'].includes(exp.category))
    .reduce((sum, exp) => sum + exp.amount, 0)

  const grossProfit = totalRevenue - directCosts
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  const netProfit = grossProfit - operatingExpenses
  const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  return {
    totalRevenue,
    directCosts,
    grossProfit,
    grossMargin,
    operatingExpenses,
    netProfit,
    netMargin,
  }
}

async function createInvoice(data: CreateInvoiceData): Promise<Invoice> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const invoices = getInvoices()
  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = subtotal * 0.15 // 15% VAT in Saudi Arabia
  const totalAmount = subtotal + taxAmount

  const newInvoice: Invoice = {
    id: `inv-${Date.now()}`,
    invoiceNumber: data.invoiceNumber,
    clientId: data.clientId,
    clientName: 'Client Name', // Would be fetched from client data
    clientNameAr: 'اسم العميل',
    projectId: data.projectId,
    projectCode: 'PRJ-XXX',
    projectName: 'Project Name',
    projectNameAr: 'اسم المشروع',
    subtotal,
    taxRate: 15,
    taxAmount,
    totalAmount,
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    status: 'draft',
    statusAr: 'مسودة',
    notes: data.notes,
    notesAr: data.notesAr,
    items: data.items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      ...item,
      total: item.quantity * item.unitPrice,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  invoices.push(newInvoice)
  saveInvoices(invoices)

  return newInvoice
}

async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const invoices = getInvoices()
  const index = invoices.findIndex((inv) => inv.id === id)
  if (index === -1) throw new Error('Invoice not found')

  invoices[index].status = status
  invoices[index].statusAr = invoiceStatusLabels[status].labelAr
  invoices[index].updatedAt = new Date().toISOString()

  saveInvoices(invoices)
  return invoices[index]
}

async function deleteInvoice(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const invoices = getInvoices()
  const filtered = invoices.filter((inv) => inv.id !== id)
  saveInvoices(filtered)
}

async function createExpense(data: CreateExpenseData): Promise<Expense> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const expenses = getExpenses()

  const newExpense: Expense = {
    id: `exp-${Date.now()}`,
    category: data.category,
    categoryAr: expenseCategoryLabels[data.category].labelAr,
    description: data.description,
    descriptionAr: data.descriptionAr,
    amount: data.amount,
    projectId: data.projectId,
    projectName: data.projectId ? 'Project Name' : undefined,
    projectNameAr: data.projectId ? 'اسم المشروع' : undefined,
    date: data.date,
    approvedBy: data.approvedBy,
    approvedByAr: data.approvedBy, // In real app, would fetch from users
    receiptNumber: data.receiptNumber,
    paymentMethod: data.paymentMethod,
    paymentMethodAr: paymentMethodLabels[data.paymentMethod].labelAr,
    notes: data.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  expenses.push(newExpense)
  saveExpenses(expenses)

  return newExpense
}

async function deleteExpense(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const expenses = getExpenses()
  const filtered = expenses.filter((exp) => exp.id !== id)
  saveExpenses(filtered)
}

// ============================================================================
// HOOKS
// ============================================================================

export function useFinancialSummary() {
  return useQuery({
    queryKey: ['financialSummary'],
    queryFn: fetchFinancialSummary,
    staleTime: 2 * 60 * 1000,
    retry: false,
  })
}

export function useInvoices(filters?: FinanceFilters) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => fetchInvoices(filters),
    staleTime: 1 * 60 * 1000,
    retry: false,
  })
}

export function useExpenses(filters?: FinanceFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => fetchExpenses(filters),
    staleTime: 1 * 60 * 1000,
    retry: false,
  })
}

export function useMonthlyData() {
  return useQuery({
    queryKey: ['monthlyData'],
    queryFn: fetchMonthlyData,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useExpensesByCategory() {
  return useQuery({
    queryKey: ['expensesByCategory'],
    queryFn: fetchExpensesByCategory,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useAuditTransactions(filters?: FinanceFilters) {
  return useQuery({
    queryKey: ['auditTransactions', filters],
    queryFn: () => fetchAuditTransactions(filters),
    staleTime: 1 * 60 * 1000,
    retry: false,
  })
}

export function useProfitLossSummary(filters?: FinanceFilters) {
  return useQuery({
    queryKey: ['profitLossSummary', filters],
    queryFn: () => fetchProfitLossSummary(filters),
    staleTime: 2 * 60 * 1000,
    retry: false,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] })
      toast.success('تم إنشاء الفاتورة بنجاح')
    },
    onError: (error) => {
      console.error('Create invoice error:', error)
      toast.error('فشل إنشاء الفاتورة')
    },
  })
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      updateInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] })
      toast.success('تم تحديث حالة الفاتورة بنجاح')
    },
    onError: (error) => {
      console.error('Update invoice status error:', error)
      toast.error('فشل تحديث حالة الفاتورة')
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] })
      toast.success('تم حذف الفاتورة بنجاح')
    },
    onError: (error) => {
      console.error('Delete invoice error:', error)
      toast.error('فشل حذف الفاتورة')
    },
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] })
      queryClient.invalidateQueries({ queryKey: ['expensesByCategory'] })
      toast.success('تم إضافة المصروف بنجاح')
    },
    onError: (error) => {
      console.error('Create expense error:', error)
      toast.error('فشل إضافة المصروف')
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] })
      queryClient.invalidateQueries({ queryKey: ['expensesByCategory'] })
      toast.success('تم حذف المصروف بنجاح')
    },
    onError: (error) => {
      console.error('Delete expense error:', error)
      toast.error('فشل حذف المصروف')
    },
  })
}
