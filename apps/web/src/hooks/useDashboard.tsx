import { useQuery } from '@tanstack/react-query'
import { formatCurrency, formatNumber } from '@/utils/format'
import { AlertTriangle, Wrench, Clock, CheckCircle, XCircle } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================
export interface DashboardStats {
  revenue: {
    total: number
    change: number
    changeType: 'up' | 'down'
  }
  expenses: {
    total: number
    change: number
    changeType: 'up' | 'down'
  }
  activeProjects: number
  totalProjects: number
  workforce: {
    total: number
    present: number
  }
}

export interface MonthlyRevenue {
  month: string
  monthAr: string
  revenue: number
}

export interface ProjectByStatus {
  status: string
  statusAr: string
  count: number
  color: string
}

export interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  icon: React.ReactNode
  message: string
  messageAr: string
  time: string
  entityId?: string
  entityType?: 'employee' | 'equipment' | 'project'
}

export interface RecentProject {
  id: string
  name: string
  nameAr: string
  status: string
  statusAr: string
  progress: number
  manager: string
  managerAr: string
  budget: number
  location: string
  locationAr: string
}

export interface FleetUtilization {
  type: string
  typeAr: string
  total: number
  inUse: number
  utilization: number
  color: string
}

export interface DashboardData {
  stats: DashboardStats
  monthlyRevenue: MonthlyRevenue[]
  projectsByStatus: ProjectByStatus[]
  alerts: Alert[]
  recentProjects: RecentProject[]
  fleetUtilization: FleetUtilization[]
}

// ============================================================================
// MOCK DATA
// ============================================================================
const mockDashboardData: DashboardData = {
  stats: {
    revenue: {
      total: 12500000,
      change: 15.3,
      changeType: 'up',
    },
    expenses: {
      total: 8700000,
      change: 8.7,
      changeType: 'up',
    },
    activeProjects: 12,
    totalProjects: 18,
    workforce: {
      total: 156,
      present: 142,
    },
  },
  monthlyRevenue: [
    { month: 'Jan', monthAr: 'يناير', revenue: 850000 },
    { month: 'Feb', monthAr: 'فبراير', revenue: 920000 },
    { month: 'Mar', monthAr: 'مارس', revenue: 890000 },
    { month: 'Apr', monthAr: 'أبريل', revenue: 1050000 },
    { month: 'May', monthAr: 'مايو', revenue: 1100000 },
    { month: 'Jun', monthAr: 'يونيو', revenue: 1250000 },
    { month: 'Jul', monthAr: 'يوليو', revenue: 1180000 },
    { month: 'Aug', monthAr: 'أغسطس', revenue: 1320000 },
    { month: 'Sep', monthAr: 'سبتمبر', revenue: 1280000 },
    { month: 'Oct', monthAr: 'أكتوبر', revenue: 1150000 },
    { month: 'Nov', monthAr: 'نوفمبر', revenue: 1350000 },
    { month: 'Dec', monthAr: 'ديسمبر', revenue: 1450000 },
  ],
  projectsByStatus: [
    { status: 'active', statusAr: 'نشط', count: 12, color: '#2563eb' },
    { status: 'completed', statusAr: 'منتهي', count: 4, color: '#16a34a' },
    { status: 'on-hold', statusAr: 'مؤجل', count: 2, color: '#d97706' },
  ],
  alerts: [
    {
      id: '1',
      type: 'critical',
      icon: <XCircle className="w-5 h-5" />,
      message: 'Iqama expiration for Ahmed Al-Rashid',
      messageAr: 'إقامة الموظف أحمد الرشيد تنتهي غداً',
      time: '2 ساعة',
      entityId: 'emp-001',
      entityType: 'employee',
    },
    {
      id: '2',
      type: 'warning',
      icon: <Wrench className="w-5 h-5" />,
      message: 'Caterpillar excavator EQ-005 needs maintenance',
      messageAr: 'حفارة كاتربيلر EQ-005 تحتاج صيانة عاجلة',
      time: '5 ساعات',
      entityId: 'eq-005',
      entityType: 'equipment',
    },
    {
      id: '3',
      type: 'warning',
      icon: <Clock className="w-5 h-5" />,
      message: 'Project deadline approaching: Riyadh Tower',
      messageAr: 'موعد تسليم مشروع برج الرياض يقترب',
      time: 'يوم واحد',
      entityId: 'proj-001',
      entityType: 'project',
    },
    {
      id: '4',
      type: 'info',
      icon: <CheckCircle className="w-5 h-5" />,
      message: 'New materials arrived at warehouse',
      messageAr: 'وصول مواد جديدة للمستودع',
      time: '3 ساعات',
    },
  ],
  recentProjects: [
    {
      id: '1',
      name: 'Riyadh Residential Tower',
      nameAr: 'برج الرياض السكني',
      status: 'active',
      statusAr: 'نشط',
      progress: 78,
      manager: 'Mohammed Al-Saud',
      managerAr: 'محمد السعود',
      budget: 45000000,
      location: 'Riyadh, Olaya St',
      locationAr: 'الرياض، شارع العليا',
    },
    {
      id: '2',
      name: 'Jeddah Commercial Mall',
      nameAr: 'مول جدة التجاري',
      status: 'active',
      statusAr: 'نشط',
      progress: 45,
      manager: 'Khalid Ibrahim',
      managerAr: 'خليل إبراهيم',
      budget: 85000000,
      location: 'Jeddah, Palestine St',
      locationAr: 'جدة، شارع فلسطين',
    },
    {
      id: '3',
      name: 'Dammam Industrial Complex',
      nameAr: 'مجمع الدمام الصناعي',
      status: 'on-hold',
      statusAr: 'مؤجل',
      progress: 30,
      manager: 'Fahad Al-Otaibi',
      managerAr: 'فهد العتيبي',
      budget: 32000000,
      location: 'Dammam, Industrial City',
      locationAr: 'الدمام، المدينة الصناعية',
    },
    {
      id: '4',
      name: 'Medina Highway Extension',
      nameAr: 'توسعة طريق المدينة',
      status: 'active',
      statusAr: 'نشط',
      progress: 92,
      manager: 'Abdullah Al-Qahtani',
      managerAr: 'عبد الله القحطاني',
      budget: 120000000,
      location: 'Medina',
      locationAr: 'المدينة المنورة',
    },
    {
      id: '5',
      name: 'Al-Khobar Waterfront',
      nameAr: 'واجهة الخبر البحرية',
      status: 'active',
      statusAr: 'نشط',
      progress: 15,
      manager: 'Saud Al-Dossary',
      managerAr: 'سعود الدوسري',
      budget: 55000000,
      location: 'Al-Khobar, Corniche',
      locationAr: 'الخبر، الكورنيش',
    },
  ],
  fleetUtilization: [
    { type: 'excavators', typeAr: 'حفارات', total: 8, inUse: 6, utilization: 75, color: '#2563eb' },
    { type: 'cranes', typeAr: 'رافعات', total: 5, inUse: 5, utilization: 100, color: '#16a34a' },
    { type: 'bulldozers', typeAr: 'جرارات', total: 6, inUse: 4, utilization: 67, color: '#d97706' },
    { type: 'trucks', typeAr: 'شاحنات', total: 12, inUse: 9, utilization: 75, color: '#2563eb' },
    { type: 'mixers', typeAr: 'خلاطات', total: 4, inUse: 2, utilization: 50, color: '#dc2626' },
  ],
}

// ============================================================================
// API FUNCTIONS
// ============================================================================
async function fetchDashboardStats(): Promise<DashboardData> {
  try {
    const response = await fetch('/api/dashboard/stats')
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data')
    }
    return await response.json()
  } catch (error) {
    console.warn('API fetch failed, using mock data:', error)
    // Return mock data after a short delay to simulate network
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockDashboardData
  }
}

// ============================================================================
// HOOK
// ============================================================================
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
