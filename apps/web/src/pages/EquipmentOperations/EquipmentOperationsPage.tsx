import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EquipmentOperationModal } from '@/components/modals/EquipmentOperationModal'
import {
  useEquipmentOperations,
  useEquipmentOperationStats,
  useDeleteEquipmentOperation,
  shiftLabels,
  type EquipmentOperationFilters,
} from '@/hooks/useEquipmentOperations'
import { useEquipment } from '@/hooks/useEquipment'
import { useProjects } from '@/hooks/useProjects'
import { formatNumber } from '@/utils/format'
import {
  Plus,
  Edit2,
  Trash2,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
} from 'lucide-react'

export default function EquipmentOperationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState<EquipmentOperationFilters>({})

  const { data: operations = [], isLoading } = useEquipmentOperations(filters)
  const { data: stats } = useEquipmentOperationStats(filters)
  const { data: equipment = [] } = useEquipment()
  const { data: projectsResponse } = useProjects()
  const deleteMutation = useDeleteEquipmentOperation()

  const projects = projectsResponse?.projects || []

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <AppLayout titleAr="تشغيل المعدات">
      <PageHeader
        title="Equipment Operations"
        titleAr="تشغيل المعدات"
        subtitle="Track equipment working hours and costs"
        subtitleAr="تتبع ساعات عمل وتكاليف المعدات"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'Equipment', labelAr: 'المعدات', path: '/equipment' },
          { label: 'Operations', labelAr: 'التشغيل' },
        ]}
        actions={[
          {
            label: 'New Operation',
            labelAr: 'تسجيل تشغيل',
            icon: <Plus className="w-4 h-4" />,
            variant: 'primary' as const,
            onClick: () => setIsModalOpen(true),
          },
        ]}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 font-cairo">تصفية:</span>
          </div>

          {/* Project Filter */}
          <select
            value={filters.projectId || ''}
            onChange={(e) => setFilters({ ...filters, projectId: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            <option value="">جميع المشاريع</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.code} - {project.nameAr}
              </option>
            ))}
          </select>

          {/* Equipment Filter */}
          <select
            value={filters.equipmentId || ''}
            onChange={(e) => setFilters({ ...filters, equipmentId: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            <option value="">جميع المعدات</option>
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.code} - {eq.nameAr}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(filters.projectId || filters.equipmentId) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({})}
              className="font-cairo"
            >
              مسح التصفية
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-cairo">إجمالي الساعات</p>
                <p className="text-2xl font-bold text-blue-700 font-sans">
                  {formatNumber(stats.totalHours)} ساعة
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-cairo">إجمالي التكلفة</p>
                <p className="text-2xl font-bold text-green-700 font-sans">
                  {formatNumber(stats.totalCost)} ريال
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-600 font-cairo">متوسط الساعات</p>
                <p className="text-2xl font-bold text-amber-700 font-sans">
                  {formatNumber(stats.averageHoursPerOperation)} ساعة
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-cairo">عدد العمليات</p>
                <p className="text-2xl font-bold text-purple-700 font-sans">
                  {stats.operationCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost by Equipment Type */}
      {stats && stats.costByEquipmentType.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h3 className="text-lg font-bold text-gray-900 font-cairo mb-4">التكلفة حسب نوع المعدة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.costByEquipmentType.map((item) => (
              <div key={item.type} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 font-cairo">{item.typeAr}</p>
                <p className="text-lg font-bold text-gray-900 font-sans">
                  {formatNumber(item.cost)} ريال
                </p>
                <p className="text-xs text-gray-500 font-cairo">
                  {formatNumber(item.hours)} ساعة
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2 font-cairo">جاري التحميل...</p>
          </div>
        ) : operations.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-700 font-cairo mb-2">لا توجد سجلات تشغيل</p>
            <p className="text-sm text-gray-500 font-cairo mb-4">ابدأ بتسجيل أول عملية تشغيل</p>
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="font-cairo"
            >
              <Plus className="w-4 h-4 ml-2" />
              تسجيل تشغيل
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">التاريخ</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المعدة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المشروع</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الدوام</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الساعات</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المعدل</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الإجمالي</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {operations.map((operation) => {
                  const eq = equipment.find(e => e.id === operation.equipmentId)
                  const proj = projects.find(p => p.id === operation.projectId)

                  return (
                    <tr key={operation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-cairo">
                        {new Date(operation.date).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 font-cairo">{operation.equipmentNameAr}</p>
                        <p className="text-xs text-gray-500 font-sans">{operation.equipmentCode}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 font-cairo">{proj?.nameAr || operation.projectNameAr}</p>
                        <p className="text-xs text-gray-500 font-sans">{operation.projectCode}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-sm text-gray-700 font-cairo">
                          <span>{shiftLabels[operation.shift].icon}</span>
                          {operation.shiftAr}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-sans font-medium">
                        {operation.hours} ساعة
                      </td>
                      <td className="px-4 py-3 text-sm font-sans">
                        {formatNumber(operation.hourlyRate)} ريال/ساعة
                      </td>
                      <td className="px-4 py-3 text-sm font-sans font-bold text-green-600">
                        {formatNumber(operation.totalCost)} ريال
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                            onClick={() => handleDelete(operation.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <EquipmentOperationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </AppLayout>
  )
}
