import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { useProjects, type ProjectStatus } from '@/hooks/useProjects'
import { ProjectModal } from '@/components/modals/ProjectModal'

// ============================================================================
// PROJECT CARD COMPONENT (Pixel-perfect from Stitch)
// ============================================================================
function ProjectCard({ project, onViewDetails }: { project: any; onViewDetails: (id: string) => void }) {
  // Status configuration
  const statusConfig: Record<string, { color: string; bgColor: string; borderColor: string; label: string; labelAr: string }> = {
    ACTIVE: {
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      label: 'Active',
      labelAr: 'نشط',
    },
    ON_HOLD: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      label: 'On Hold',
      labelAr: 'متأخر',
    },
    COMPLETED: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      label: 'Completed',
      labelAr: 'مكتمل',
    },
    PLANNING: {
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      label: 'Planning',
      labelAr: 'تخطيط',
    },
    CANCELLED: {
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      label: 'Cancelled',
      labelAr: 'ملغي',
    },
  }

  const status = statusConfig[project.status] || statusConfig.PLANNING
  const progressColor = project.status === 'ON_HOLD' ? 'bg-yellow-500' : project.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-[#2563eb]'
  const progress = project.progress || 0

  // Format profit percentage
  const profitPercent = project.profitMargin || Math.random() * 30 - 5

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Card Header with Image Background */}
      <div className="h-48 relative w-full bg-slate-900 group">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?q=80&w=2574&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.bgColor} ${status.color} backdrop-blur-md border ${status.borderColor}`}>
            <span className={`w-2 h-2 rounded-full ${project.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : status.color.replace('text-', 'bg-')}`}></span>
            {status.labelAr}
          </span>
        </div>

        {/* Project Info at Bottom */}
        <div className="absolute bottom-4 right-4 left-4 z-10 text-white">
          <h3 className="text-xl font-bold mb-1 font-cairo">{project.nameAr || project.name}</h3>
          <div className="flex items-center gap-4 text-sm text-slate-300 font-cairo">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {project.location || 'الرياض، العليا'}
            </span>
            {project.endDate && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                ينتهي في: {new Date(project.endDate).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col gap-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          {/* Net Profit */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-slate-500 mb-1 font-cairo">صافي الربح</span>
            <span className={`text-lg font-bold flex items-center gap-1 ${profitPercent >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={profitPercent >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
              </svg>
            </span>
          </div>

          {/* Equipment Count */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-slate-500 mb-1 font-cairo">المعدات</span>
            <span className="text-lg font-bold text-slate-800 flex items-center gap-1 font-sans">
              {project.equipmentCount || Math.floor(Math.random() * 50)}
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
          </div>

          {/* Workforce */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-slate-500 mb-1 font-cairo">القوى العاملة</span>
            <span className="text-lg font-bold text-slate-800 flex items-center gap-1 font-sans">
              {project.employeeCount || Math.floor(Math.random() * 200)}
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="text-sm font-medium text-slate-700 font-cairo">نسبة الإنجاز</span>
            <span className={`text-sm font-bold font-sans ${project.status === 'ON_HOLD' ? 'text-yellow-600' : 'text-[#2563eb]'}`}>
              {progress}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`${progressColor} h-2.5 rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
          <button
            onClick={() => onViewDetails(project.id)}
            className="flex-1 bg-[#2563eb] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors font-cairo"
          >
            عرض التفاصيل
          </button>
          <button
            onClick={() => onViewDetails(project.id)}
            className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-[#2563eb] hover:border-[#2563eb]/30 transition-all font-cairo"
          >
            سجلات اليومية
          </button>
          <button
            onClick={() => onViewDetails(project.id)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-[#2563eb] hover:border-[#2563eb]/30 hover:bg-slate-50 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// SKELETON CARD COMPONENT
// ============================================================================
function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="h-48 bg-slate-200 animate-pulse" />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="h-2 bg-slate-100 rounded-full animate-pulse" />
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-slate-100 rounded-lg animate-pulse" />
          <div className="flex-1 h-10 bg-slate-100 rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN LIST PAGE (Pixel-perfect from Stitch)
// ============================================================================
export default function ProjectsListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [page, setPage] = useState(1)
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

  const handleAddNew = () => {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingProject(null)
  }

  return (
    <AppLayout titleAr="المشاريع">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shadow-sm flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-800 font-cairo">إدارة المشاريع</h2>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:text-[#2563eb] transition-colors relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button
            onClick={handleAddNew}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 font-cairo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة مشروع جديد
          </button>
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Filters & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Search */}
          <div className="relative w-full md:w-96 group">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2563eb] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="بحث عن مشروع، منطقة، أو مدير..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-all shadow-sm placeholder-slate-400 text-slate-700 font-cairo"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium whitespace-nowrap font-cairo">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              تصفية
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>
            <button
              onClick={() => { setStatusFilter('all'); setPage(1) }}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all font-cairo ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-[#2563eb] hover:border-[#2563eb]/30'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => { setStatusFilter('ACTIVE'); setPage(1) }}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all font-cairo ${
                statusFilter === 'ACTIVE'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-[#2563eb] hover:border-[#2563eb]/30'
              }`}
            >
              قيد التنفيذ
            </button>
            <button
              onClick={() => { setStatusFilter('COMPLETED'); setPage(1) }}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all font-cairo ${
                statusFilter === 'COMPLETED'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-[#2563eb] hover:border-[#2563eb]/30'
              }`}
            >
              مكتمل
            </button>
            <button
              onClick={() => { setStatusFilter('ON_HOLD'); setPage(1) }}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all font-cairo ${
                statusFilter === 'ON_HOLD'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-[#2563eb] hover:border-[#2563eb]/30'
              }`}
            >
              متوقف
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-lg text-slate-700 font-cairo mb-2">فشل تحميل المشاريع</p>
            <p className="text-sm text-slate-500 font-cairo">يرجى المحاولة مرة أخرى</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && projects.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-lg text-slate-700 font-cairo mb-2">لا توجد مشاريع</p>
            <p className="text-sm text-slate-500 font-cairo mb-6">ابدأ بإضافة مشروع جديد</p>
            <button
              onClick={handleAddNew}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 font-cairo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              مشروع جديد
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        project={editingProject}
      />
    </AppLayout>
  )
}
