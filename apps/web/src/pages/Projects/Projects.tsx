import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { KpiCard } from '@/components/ui/KpiCard'
import {
  Plus,
  Filter,
  Download,
  Search,
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

type ProjectStatus = 'active' | 'pending' | 'completed' | 'on-hold' | 'delayed'
type Priority = 'low' | 'medium' | 'high' | 'urgent'

interface Project {
  id: string
  name: string
  nameAr: string
  location: string
  client: string
  startDate: string
  endDate: string
  budget: number
  spent: number
  progress: number
  status: ProjectStatus
  priority: Priority
  employees: number
  manager: string
}

const statusConfig = {
  active: { label: 'نشط', labelEn: 'Active', color: 'bg-green-100 text-green-700' },
  pending: { label: 'معلق', labelEn: 'Pending', color: 'bg-gray-100 text-gray-700' },
  completed: { label: 'مكتمل', labelEn: 'Completed', color: 'bg-blue-100 text-blue-700' },
  'on-hold': { label: 'مؤجل', labelEn: 'On Hold', color: 'bg-amber-100 text-amber-700' },
  delayed: { label: 'متأخر', labelEn: 'Delayed', color: 'bg-red-100 text-red-700' },
}

const priorityConfig = {
  low: { label: 'منخفض', labelEn: 'Low', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  medium: { label: 'متوسط', labelEn: 'Medium', color: 'bg-blue-100 text-blue-600', dot: 'bg-blue-500' },
  high: { label: 'عالي', labelEn: 'High', color: 'bg-amber-100 text-amber-600', dot: 'bg-amber-500' },
  urgent: { label: 'عاجل', labelEn: 'Urgent', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
}

export function Projects() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'all'>('all')
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const projects: Project[] = [
    {
      id: 'PRJ-001',
      name: 'Riyadh Residential Tower',
      nameAr: 'برج الرياض السكني',
      location: 'الرياض، المملكة العربية السعودية',
      client: 'شركة التطوير العقاري',
      startDate: '2024-01-15',
      endDate: '2025-06-30',
      budget: 15000000,
      spent: 8500000,
      progress: 57,
      status: 'active',
      priority: 'high',
      employees: 45,
      manager: 'أحمد الرشيد',
    },
    {
      id: 'PRJ-002',
      name: 'Jeddah Commercial Complex',
      nameAr: 'مجمع جدة التجاري',
      location: 'جدة، المملكة العربية السعودية',
      client: 'مجموعة الأبراج',
      startDate: '2024-02-01',
      endDate: '2025-08-15',
      budget: 25000000,
      spent: 12000000,
      progress: 48,
      status: 'active',
      priority: 'urgent',
      employees: 68,
      manager: 'محمد العتيبي',
    },
    {
      id: 'PRJ-003',
      name: 'Dammam Industrial Facility',
      nameAr: 'منشأة الدمام الصناعية',
      location: 'الدمام، المملكة العربية السعودية',
      client: 'الشركة الصناعية المتحدة',
      startDate: '2023-09-01',
      endDate: '2024-12-31',
      budget: 8000000,
      spent: 7800000,
      progress: 95,
      status: 'active',
      priority: 'high',
      employees: 32,
      manager: 'خالد القحطاني',
    },
    {
      id: 'PRJ-004',
      name: 'Mecca Road Extension',
      nameAr: 'توسعة طريق مكة',
      location: 'مكة المكرمة، المملكة العربية السعودية',
      client: 'وزارة النقل',
      startDate: '2024-03-01',
      endDate: '2024-11-30',
      budget: 12000000,
      spent: 3000000,
      progress: 25,
      status: 'delayed',
      priority: 'urgent',
      employees: 55,
      manager: 'عبدالله السديري',
    },
    {
      id: 'PRJ-005',
      name: 'Medina Hospital Complex',
      nameAr: 'مجمع المدينة الطبي',
      location: 'المدينة المنورة، المملكة العربية السعودية',
      client: 'الصحة الأولى',
      startDate: '2024-04-01',
      endDate: '2026-02-28',
      budget: 45000000,
      spent: 8000000,
      progress: 18,
      status: 'active',
      priority: 'medium',
      employees: 85,
      manager: 'فهد الدوسري',
    },
    {
      id: 'PRJ-006',
      name: 'Qassim Shopping Mall',
      nameAr: 'مول القصيم',
      location: 'القصيم، المملكة العربية السعودية',
      client: 'التجارية للمراكز',
      startDate: '2023-06-01',
      endDate: '2024-10-31',
      budget: 18000000,
      spent: 18200000,
      progress: 100,
      status: 'completed',
      priority: 'medium',
      employees: 0,
      manager: 'سعود الشمري',
    },
    {
      id: 'PRJ-007',
      name: 'Tabuk Water Treatment Plant',
      nameAr: 'محطة معالجة مياه تبوك',
      location: 'تبوك، المملكة العربية السعودية',
      client: 'المياه الوطنية',
      startDate: '2024-05-01',
      endDate: '2025-03-31',
      budget: 9500000,
      spent: 2500000,
      progress: 26,
      status: 'on-hold',
      priority: 'low',
      employees: 18,
      manager: 'راشد المالكي',
    },
    {
      id: 'PRJ-008',
      name: 'Abha Resort Village',
      nameAr: 'قرية أبها السياحية',
      location: 'أبها، المملكة العربية السعودية',
      client: 'السياحة الفاخرة',
      startDate: '2024-06-01',
      endDate: '2025-12-15',
      budget: 22000000,
      spent: 5000000,
      progress: 23,
      status: 'active',
      priority: 'medium',
      employees: 42,
      manager: 'تركى الحربي',
    },
  ]

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchQuery === '' ||
      project.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  // Calculate stats
  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => p.status === 'active').length
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0)

  const kpiData = [
    {
      title: 'Total Projects',
      titleAr: 'إجمالي المشاريع',
      value: totalProjects,
      unit: 'مشروع',
      change: 8,
      changeType: 'up' as const,
      icon: '🏗️',
      color: 'blue' as const,
    },
    {
      title: 'Active Projects',
      titleAr: 'المشاريع النشطة',
      value: activeProjects,
      unit: 'مشروع',
      change: 5,
      changeType: 'up' as const,
      icon: '🏠',
      color: 'green' as const,
    },
    {
      title: 'Total Budget',
      titleAr: 'الميزانية الإجمالية',
      value: totalBudget,
      unit: 'ريال',
      change: 12,
      changeType: 'up' as const,
      icon: '💰',
      color: 'amber' as const,
    },
    {
      title: 'Budget Spent',
      titleAr: 'المصروف',
      value: totalSpent,
      unit: 'ريال',
      change: 0,
      changeType: 'neutral' as const,
      icon: '📊',
      color: 'red' as const,
    },
  ]

  const headerActions = [
    {
      label: 'Add Project',
      labelAr: 'إضافة مشروع',
      icon: <Plus className="w-4 h-4" />,
      variant: 'primary' as const,
      onClick: () => console.log('Add project clicked'),
    },
    {
      label: 'Filter',
      labelAr: 'تصفية',
      icon: <Filter className="w-4 h-4" />,
      variant: 'outline' as const,
      onClick: () => setShowFilters(!showFilters),
    },
    {
      label: 'Export',
      labelAr: 'تصدير',
      icon: <Download className="w-4 h-4" />,
      variant: 'outline' as const,
      onClick: () => console.log('Export clicked'),
    },
  ]

  const breadcrumbs = [
    { label: 'Home', labelAr: 'الرئيسية', path: '/' },
    { label: 'Projects', labelAr: 'المشاريع' },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA').format(amount)
  }

  return (
    <AppLayout titleAr="المشاريع">
      <PageHeader
        title="Projects"
        titleAr="المشاريع"
        subtitle="Manage all your construction projects"
        subtitleAr="إدارة جميع مشاريع البناء"
        actions={headerActions}
        breadcrumbs={breadcrumbs}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {kpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">الحالة</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ProjectStatus | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-cairo"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="pending">معلق</option>
                <option value="completed">مكتمل</option>
                <option value="on-hold">مؤجل</option>
                <option value="delayed">متأخر</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">الأولوية</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-cairo"
              >
                <option value="all">جميع الأولويات</option>
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">عالي</option>
                <option value="urgent">عاجل</option>
              </select>
            </div>

            {/* Items Per Page */}
            <div className="w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">عرض</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-cairo"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، الموقع، أو العميل..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:bg-white transition-all font-cairo"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-cairo">المشروع</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-cairo">العميل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-cairo">الميزانية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-cairo">التقدم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-cairo">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-cairo">الأولوية</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-cairo">الموظفين</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 font-cairo">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-cairo">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-3">🏗️</span>
                      <p>لا توجد مشاريع مطابقة</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedProject(project.id === selectedProject ? null : project.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                          🏗️
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 font-cairo">{project.nameAr}</p>
                          <p className="text-sm text-gray-500 font-cairo">{project.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span className="font-cairo">{project.location}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-cairo">{project.client}</p>
                      <p className="text-sm text-gray-500 font-sans">{project.manager}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 font-sans">{formatCurrency(project.budget)} ريال</p>
                        <p className="text-sm text-gray-500 font-sans">{formatCurrency(project.spent)} ريال</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 font-sans">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#2563eb] h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full font-cairo ${statusConfig[project.status].color}`}>
                        {statusConfig[project.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${priorityConfig[project.priority].dot}`} />
                        <span className={`px-2 py-1 text-xs font-medium rounded ${priorityConfig[project.priority].color} font-cairo`}>
                          {priorityConfig[project.priority].label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="font-medium font-sans">{project.employees}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('View', project.id)
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="عرض"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Edit', project.id)
                          }}
                          className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Delete', project.id)
                          }}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProjects.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 font-cairo">
              عرض {startIndex + 1} إلى {Math.min(endIndex, filteredProjects.length)} من {filteredProjects.length} مشروع
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-cairo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                .map((page, index, arr) => {
                  const prevPage = arr[index - 1]
                  if (prevPage && page - prevPage > 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    )
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors font-sans ${
                        currentPage === page
                          ? 'bg-[#2563eb] text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-cairo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
