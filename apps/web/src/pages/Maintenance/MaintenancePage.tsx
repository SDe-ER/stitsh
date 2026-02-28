import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { MaintenanceModal } from '@/components/modals/MaintenanceModal'
import {
  useScheduledMaintenances,
  useUpdateMaintenance,
  useEquipment,
  maintenanceTypeLabels,
  maintenanceStatusLabels,
  type MaintenanceType,
} from '@/hooks/useEquipment'
import { formatNumber } from '@/utils/format'
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  DollarSign,
  ChevronRight,
  Filter,
  Plus,
} from 'lucide-react'

export default function MaintenancePage() {
  const navigate = useNavigate()
  const { data: scheduledMaintenances = [], isLoading } = useScheduledMaintenances()
  const { data: equipment = [] } = useEquipment()
  const updateMutation = useUpdateMaintenance()

  const [filterType, setFilterType] = useState<MaintenanceType | 'all'>('all')
  const [selectedEquipment, setSelectedEquipment] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter scheduled maintenances
  const filteredMaintenances = scheduledMaintenances.filter(m => {
    const matchesType = filterType === 'all' || m.type === filterType
    const matchesEquipment = !selectedEquipment || m.equipmentId === selectedEquipment
    return matchesType && matchesEquipment && m.status === 'scheduled'
  })

  // Get equipment info for display
  const getEquipmentInfo = (equipmentId: string) => {
    return equipment.find(e => e.id === equipmentId)
  }

  // Calculate summary stats
  const emergencyCount = filteredMaintenances.filter(m => m.type === 'emergency').length
  const correctiveCount = filteredMaintenances.filter(m => m.type === 'corrective').length
  const preventiveCount = filteredMaintenances.filter(m => m.type === 'preventive').length
  const totalEstimatedCost = filteredMaintenances.reduce((sum, m) => sum + m.cost, 0)

  const handleCompleteMaintenance = (recordId: string) => {
    updateMutation.mutate({
      id: recordId,
      data: {
        status: 'completed' as const,
        statusAr: maintenanceStatusLabels.completed.label,
        completedDate: new Date().toISOString().split('T')[0],
      },
    })
  }

  const getPriorityColor = (type: MaintenanceType) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'corrective':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'preventive':
        return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getDaysUntilDue = (date: string) => {
    const today = new Date()
    const dueDate = new Date(date)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <AppLayout titleAr="الصيانة">
      <PageHeader
        title="Maintenance"
        titleAr="الصيانة"
        subtitle="Schedule & Management"
        subtitleAr="جدولة وإدارة الصيانة"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'Equipment', labelAr: 'المعدات', path: '/equipment' },
          { label: 'Maintenance', labelAr: 'الصيانة' },
        ]}
        actions={[
          {
            label: 'Schedule Maintenance',
            labelAr: 'جدولة صيانة',
            icon: <Plus className="w-4 h-4" />,
            variant: 'primary' as const,
            onClick: () => setIsModalOpen(true),
          },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">إجمالي الصيانات</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{filteredMaintenances.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">طارئة</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{emergencyCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">تصحيحية</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{correctiveCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">التكلفة التقديرية</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{formatNumber(totalEstimatedCost)} ريال</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as MaintenanceType | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            <option value="all">جميع أنواع الصيانة</option>
            <option value="emergency">طارئة</option>
            <option value="corrective">تصحيحية</option>
            <option value="preventive">وقائية</option>
          </select>

          {/* Equipment Filter */}
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            <option value="">جميع المعدات</option>
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.code} - {eq.nameAr}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            onClick={() => {
              setFilterType('all')
              setSelectedEquipment('')
            }}
            className="font-cairo"
          >
            إعادة تعيين
          </Button>
        </div>
      </div>

      {/* Maintenance List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 font-cairo">الصيانات المجدولة</h2>
          <p className="text-sm text-gray-500 font-cairo">مرتبة حسب الأولوية</p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto"></div>
          </div>
        ) : filteredMaintenances.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-100 mx-auto mb-4" />
            <p className="text-lg text-gray-700 font-cairo mb-2">لا توجد صيانات مجدولة</p>
            <p className="text-sm text-gray-500 font-cairo">جميع الصيانات مكتملة</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMaintenances.map((record) => {
              const eqInfo = getEquipmentInfo(record.equipmentId)
              const daysUntilDue = getDaysUntilDue(record.date)
              const isOverdue = daysUntilDue < 0
              const isUrgent = daysUntilDue >= 0 && daysUntilDue <= 3

              return (
                <div
                  key={record.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    isOverdue ? 'bg-red-50' : isUrgent ? 'bg-amber-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Priority Badge */}
                      <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg border ${getPriorityColor(record.type)}`}>
                        <span className="text-xs font-medium font-cairo">{record.typeAr}</span>
                      </div>

                      {/* Equipment Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 font-cairo">{record.equipmentNameAr}</h3>
                          {eqInfo && (
                            <span className="text-xs text-gray-500 font-sans bg-gray-100 px-2 py-0.5 rounded">
                              {eqInfo.code}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-cairo mb-2">{record.descriptionAr}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          {/* Due Date */}
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : isUrgent ? 'text-amber-600' : ''}`}>
                            <Calendar className="w-4 h-4" />
                            <span className="font-cairo">
                              {new Date(record.date).toLocaleDateString('ar-SA')}
                            </span>
                            {isOverdue && (
                              <span className="text-xs font-medium mr-1">(متأخر {Math.abs(daysUntilDue)} أيام)</span>
                            )}
                            {!isOverdue && isUrgent && (
                              <span className="text-xs font-medium mr-1">(خلال {daysUntilDue} أيام)</span>
                            )}
                            {!isOverdue && !isUrgent && daysUntilDue <= 14 && (
                              <span className="text-xs font-medium mr-1">(خلال {daysUntilDue} يوم)</span>
                            )}
                          </div>

                          {/* Technician */}
                          <div className="flex items-center gap-1">
                            <Wrench className="w-4 h-4" />
                            <span className="font-cairo">{record.technicianAr}</span>
                          </div>

                          {/* Cost */}
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-sans">{formatNumber(record.cost)} ريال</span>
                          </div>

                          {/* Location */}
                          {eqInfo?.currentLocationAr && (
                            <div className="flex items-center gap-1">
                              <span className="font-cairo">{eqInfo.currentLocationAr}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/equipment/${record.equipmentId}`)}
                        className="font-cairo"
                      >
                        عرض المعدة
                        <ChevronRight className="w-4 h-4 mr-1" />
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCompleteMaintenance(record.id)}
                        disabled={updateMutation.isPending}
                        className="font-cairo"
                      >
                        <CheckCircle2 className="w-4 h-4 ml-1" />
                        مكتملة
                      </Button>
                    </div>
                  </div>

                  {/* Parts Used */}
                  {record.partsUsedAr && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 font-cairo mb-1">القطع المطلوبة:</p>
                      <p className="text-sm text-gray-700 font-cairo">{record.partsUsedAr}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {record.notesAr && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 font-cairo">{record.notesAr}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Schedule Maintenance Modal */}
      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </AppLayout>
  )
}
