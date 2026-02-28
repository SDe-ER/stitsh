import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { useProjects, type ProjectStatus } from '@/hooks/useProjects'
import { ProjectModal } from '@/components/modals/ProjectModal'
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react'

// ============================================================================
// PROJECT CARD COMPONENT
// ============================================================================
function ProjectCard({ project, onViewDetails }: { project: any; onViewDetails: (id: string) => void }) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return amount.toString()
  }

  const progressColor = project.progress >= 75 ? 'bg-green-500' : project.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all hover:-translate-y-1">
      {/* Header: Code + Status */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {project.code}
          </span>
          <h3 className="text-lg font-bold text-gray-900 font-cairo mt-2">{project.nameAr}</h3>
          <p className="text-sm text-gray-500 font-cairo">{project.name}</p>
        </div>
        <StatusBadge status={project.status} size="sm" />
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="font-cairo">{project.locationAr}</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700 font-cairo">التقدم</span>
          <span className="text-sm font-bold text-gray-900 font-sans">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-500`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg">
          <Users className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500 font-cairo">الموظفين</p>
            <p className="text-sm font-bold text-gray-900 font-sans">{project.employeeCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg">
          <DollarSign className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-xs text-gray-500 font-cairo">الميزانية</p>
            <p className="text-sm font-bold text-gray-900 font-sans">{formatCurrency(project.budget)}</p>
          </div>
        </div>
      </div>

      {/* Manager + Client */}
      <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-cairo">المدير</span>
          <span className="font-medium text-gray-900 font-cairo">{project.managerNameAr}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-cairo">العميل</span>
          <span className="font-medium text-gray-900 font-cairo">{project.clientNameAr}</span>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Calendar className="w-4 h-4" />
        <span className="font-cairo">
          {new Date(project.startDate).toLocaleDateString('ar-SA')} - {new Date(project.endDate).toLocaleDateString('ar-SA')}
        </span>
      </div>

      {/* View Details Button */}
      <Button
        variant="outline"
        size="sm"
        fullWidth
        onClick={() => onViewDetails(project.id)}
        className="font-cairo"
      >
        عرض التفاصيل
      </Button>
    </div>
  )
}

// ============================================================================
// SKELETON CARD COMPONENT
// ============================================================================
function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-16 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-2 bg-gray-200 rounded-full w-full mb-4"></div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="h-14 bg-gray-200 rounded-lg"></div>
          <div className="h-14 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN LIST PAGE
// ============================================================================
export default function ProjectsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any | null>(null)

  const pageSize = 12
  const { data, isLoading, error } = useProjects(
    { search, status: statusFilter },
    page,
    pageSize
  )

  const projects = data?.projects || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  const handleViewDetails = (id: string) => {
    navigate(`/projects/${id}`)
  }

  const handleEdit = (project: any) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingProject(null)
  }

  const statusOptions: { value: ProjectStatus | 'all'; label: string; labelAr: string }[] = [
    { value: 'all', label: 'All', labelAr: 'كل الحالات' },
    { value: 'active', label: 'Active', labelAr: 'نشط' },
    { value: 'completed', label: 'Completed', labelAr: 'منتهي' },
    { value: 'on-hold', label: 'On Hold', labelAr: 'متوقف' },
    { value: 'planning', label: 'Planning', labelAr: 'في التخطيط' },
    { value: 'cancelled', label: 'Cancelled', labelAr: 'ملغي' },
  ]

  const breadcrumbs = [
    { label: 'Home', labelAr: 'الرئيسية', path: '/' },
    { label: 'Projects', labelAr: 'المشاريع' },
  ]

  const headerActions = [
    {
      label: 'Add Project',
      labelAr: 'مشروع جديد +',
      icon: <Plus className="w-4 h-4" />,
      variant: 'primary' as const,
      onClick: handleAddNew,
    },
    {
      label: 'Filter',
      labelAr: 'تصفية',
      icon: <Filter className="w-4 h-4" />,
      variant: 'outline' as const,
      onClick: () => setShowFilters(!showFilters),
    },
  ]

  return (
    <AppLayout titleAr="المشاريع">
      <PageHeader
        title="Projects"
        titleAr="إدارة المشاريع"
        subtitle="Manage and track all your construction projects"
        subtitleAr="إدارة وتتبع جميع مشاريع البناء"
        actions={headerActions}
        breadcrumbs={breadcrumbs}
      />

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 fade-in">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">الحالة</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ProjectStatus | 'all')
                  setPage(1)
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-cairo bg-white"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.labelAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="px-4 py-2.5 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 font-cairo">
                <span className="font-bold text-[#2563eb]">{total}</span> مشروع
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، الرمز، أو العميل..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:bg-white transition-all font-cairo"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-cairo mb-2">فشل تحميل المشاريع</p>
          <p className="text-sm text-gray-500 font-cairo">يرجى المحاولة مرة أخرى</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && projects.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-cairo mb-2">لا توجد مشاريع</p>
          <p className="text-sm text-gray-500 font-cairo mb-6">ابدأ بإضافة مشروع جديد</p>
          <Button variant="primary" onClick={handleAddNew} className="font-cairo">
            <Plus className="w-4 h-4 ml-2" />
            مشروع جديد
          </Button>
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && !error && projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 font-cairo">
                  عرض {(page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, total)} من {total} مشروع
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-sans transition-colors ${
                          page === pageNum
                            ? 'bg-[#2563eb] text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        project={editingProject}
      />
    </AppLayout>
  )
}
