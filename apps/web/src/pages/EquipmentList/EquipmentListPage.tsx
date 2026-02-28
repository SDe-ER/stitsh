import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EquipmentModal } from '@/components/modals/EquipmentModal'
import {
  useEquipment,
  useDeleteEquipment,
  equipmentTypeLabels,
  equipmentStatusLabels,
  type EquipmentType,
  type EquipmentStatus,
  type Equipment,
} from '@/hooks/useEquipment'
import {
  Search,
  Plus,
  Wrench,
  Settings,
  Filter,
  Truck,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Edit,
  Trash2,
} from 'lucide-react'

export default function EquipmentListPage() {
  const navigate = useNavigate()
  const { data: equipment = [], isLoading } = useEquipment()
  const deleteMutation = useDeleteEquipment()
  const [filterType, setFilterType] = useState<EquipmentType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<EquipmentStatus | 'all'>('all')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | undefined>(undefined)

  // Get unique projects
  const projects = Array.from(
    new Set(equipment.filter(e => e.projectId).map(e => e.projectId))
  )

  // Filter equipment
  const filteredEquipment = equipment.filter(eq => {
    const matchesType = filterType === 'all' || eq.type === filterType
    const matchesStatus = filterStatus === 'all' || eq.status === filterStatus
    const matchesProject = filterProject === 'all' || eq.projectId === filterProject
    const matchesSearch =
      searchQuery === '' ||
      eq.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesStatus && matchesProject && matchesSearch
  })

  // Calculate KPIs
  const totalEquipment = equipment.length
  const activeCount = equipment.filter(e => e.status === 'active').length
  const inactiveCount = equipment.filter(e => e.status === 'inactive').length
  const maintenanceCount = equipment.filter(e => e.status === 'maintenance').length

  return (
    <AppLayout titleAr="إدارة المعدات">
      <PageHeader
        title="Equipment Management"
        titleAr="إدارة المعدات"
        subtitle="Fleet & Equipment"
        subtitleAr="الأسطول والمعدات"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'Equipment', labelAr: 'المعدات' },
        ]}
        actions={[
          {
            label: 'Add Equipment',
            labelAr: 'إضافة معدة',
            icon: <Plus className="w-4 h-4" />,
            variant: 'primary' as const,
            onClick: () => {
              setEditingEquipment(undefined)
              setIsModalOpen(true)
            },
          },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">إجمالي المعدات</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{totalEquipment}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">نشطة</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">خامدة</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{inactiveCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">في الصيانة</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{maintenanceCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الرمز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as EquipmentType | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            <option value="all">جميع الأنواع</option>
            {Object.entries(equipmentTypeLabels).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as EquipmentStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            <option value="all">جميع الحالات</option>
            {Object.entries(equipmentStatusLabels).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            <option value="all">جميع المشاريع</option>
            {projects.map((projectId) => {
              const project = equipment.find(e => e.projectId === projectId)
              return (
                <option key={projectId} value={projectId}>
                  {project?.projectNameAr || projectId}
                </option>
              )
            })}
          </select>

          <Button
            variant="outline"
            onClick={() => {
              setFilterType('all')
              setFilterStatus('all')
              setFilterProject('all')
              setSearchQuery('')
            }}
            className="font-cairo"
          >
            إعادة تعيين
          </Button>
        </div>
      </div>

      {/* Equipment Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-cairo mb-2">لا توجد معدات</p>
          <p className="text-sm text-gray-500 font-cairo">لم يتم العثور على معدات مطابقة للفلاتر</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEquipment.map((eq) => {
            const statusConfig = equipmentStatusLabels[eq.status]
            return (
              <div
                key={eq.id}
                onClick={() => navigate(`/equipment/${eq.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Equipment Image */}
                {eq.imageUrl ? (
                  <img
                    src={eq.imageUrl}
                    alt={eq.nameAr}
                    className="w-full h-32 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <Settings className="w-12 h-12 text-gray-300" />
                  </div>
                )}

                {/* Equipment Code */}
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded mb-2 inline-block">
                  {eq.code}
                </span>

                {/* Equipment Name */}
                <h3 className="text-lg font-bold text-gray-900 font-cairo mb-1">{eq.nameAr}</h3>
                <p className="text-sm text-gray-500 mb-3">{eq.name}</p>

                {/* Type & Brand */}
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-600 font-cairo">{eq.typeAr}</span>
                  <span className="text-gray-500 font-sans">{eq.brand}</span>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Project */}
                {eq.projectNameAr && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="font-cairo truncate">{eq.projectNameAr}</span>
                  </div>
                )}

                {/* Location */}
                {eq.currentLocationAr && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-cairo truncate">{eq.currentLocationAr}</span>
                  </div>
                )}

                {/* Usage Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="font-cairo">نسبة الاستخدام</span>
                    <span className="font-sans">{eq.usagePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        eq.usagePercentage > 80
                          ? 'bg-red-500'
                          : eq.usagePercentage > 50
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${eq.usagePercentage}%` }}
                    />
                  </div>
                </div>

                {/* Maintenance Info */}
                {eq.nextMaintenanceDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-cairo">
                      الصيانة القادمة: {new Date(eq.nextMaintenanceDate).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                )}

                {/* Maintenance Alert */}
                {eq.nextMaintenanceDate &&
                  new Date(eq.nextMaintenanceDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="font-cairo">صيانة قريبة</span>
                    </div>
                  )}

                {/* Edit Button */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingEquipment(eq)
                      setIsModalOpen(true)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors font-cairo"
                  >
                    <Edit className="w-4 h-4" />
                    تعديل
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm(`هل أنت متأكد من حذف ${eq.nameAr}؟`)) {
                        deleteMutation.mutate(eq.id)
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-cairo disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingEquipment(undefined)
        }}
        editEquipment={editingEquipment}
      />
    </AppLayout>
  )
}
