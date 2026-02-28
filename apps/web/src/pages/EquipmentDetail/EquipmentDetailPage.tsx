import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { MaintenanceModal } from '@/components/modals/MaintenanceModal'
import { EquipmentOperationModal } from '@/components/modals/EquipmentOperationModal'
import {
  useEquipmentDetail,
  useMaintenanceRecords,
  useUpdateEquipment,
  useDeleteMaintenance,
  equipmentStatusLabels,
  getEquipmentMonthlyUsage,
  type EquipmentStatus,
} from '@/hooks/useEquipment'
import {
  useEquipmentOperations,
  useDeleteEquipmentOperation,
  shiftLabels,
} from '@/hooks/useEquipmentOperations'
import { formatNumber, formatMillions } from '@/utils/format'
import {
  ArrowRight,
  MapPin,
  Settings,
  Wrench,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  FileText,
  Activity,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type TabType = 'info' | 'operations' | 'maintenance' | 'usage' | 'costs'

const tabs: { id: TabType; label: string; labelAr: string; icon: any }[] = [
  { id: 'info', label: 'Info', labelAr: 'المعلومات', icon: Settings },
  { id: 'operations', label: 'Operations', labelAr: 'التشغيل', icon: Activity },
  { id: 'maintenance', label: 'Maintenance', labelAr: 'الصيانة', icon: Wrench },
  { id: 'usage', label: 'Usage', labelAr: 'الاستخدام', icon: BarChart3 },
  { id: 'costs', label: 'Costs', labelAr: 'التكاليف', icon: DollarSign },
]

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-amber-500',
  maintenance: 'bg-red-500',
}

const barColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)
  const [isOperationModalOpen, setIsOperationModalOpen] = useState(false)

  const { data: equipment, isLoading } = useEquipmentDetail(id || '')
  const { data: maintenanceRecords = [] } = useMaintenanceRecords(id)
  const { data: operations = [] } = useEquipmentOperations({ equipmentId: id })
  const updateMutation = useUpdateEquipment()
  const deleteMaintenanceMutation = useDeleteMaintenance()
  const deleteOperationMutation = useDeleteEquipmentOperation()

  if (isLoading) {
    return (
      <AppLayout titleAr="تفاصيل المعدة">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </AppLayout>
    )
  }

  if (!equipment) {
    return (
      <AppLayout titleAr="تفاصيل المعدة">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Settings className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-lg text-gray-700 font-cairo mb-2">فشل تحميل المعدة</p>
          <Button variant="outline" onClick={() => navigate('/equipment')} className="font-cairo">
            العودة للمعدات
          </Button>
        </div>
      </AppLayout>
    )
  }

  const statusConfig = equipmentStatusLabels[equipment.status]

  // Calculate cost statistics
  const totalMaintenanceCost = maintenanceRecords.reduce((sum, r) => sum + r.cost, 0)
  const averageCostPerMaintenance = maintenanceRecords.length > 0
    ? totalMaintenanceCost / maintenanceRecords.length
    : 0

  // Get monthly usage data
  const monthlyUsage = getEquipmentMonthlyUsage(equipment.id)

  // Calculate operating costs
  const annualOperatingCost = equipment.dailyOperatingCost
    ? equipment.dailyOperatingCost * 365
    : 0

  const handleStatusChange = (status: EquipmentStatus) => {
    updateMutation.mutate({
      id: equipment.id,
      data: { status },
    })
  }

  const handleDeleteMaintenance = (recordId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      deleteMaintenanceMutation.mutate(recordId)
    }
  }

  const handleDeleteOperation = (operationId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      deleteOperationMutation.mutate(operationId)
    }
  }

  // Calculate operations statistics
  const totalOperationHours = operations.reduce((sum, op) => sum + op.hours, 0)
  const totalOperationCost = operations.reduce((sum, op) => sum + op.totalCost, 0)
  const averageDailyUsage = operations.length > 0 ? totalOperationHours / operations.length : 0

  return (
    <AppLayout titleAr={equipment.nameAr}>
      <PageHeader
        title={equipment.name}
        titleAr={equipment.nameAr}
        subtitle={`Equipment Code: ${equipment.code}`}
        subtitleAr={`رمز المعدة: ${equipment.code}`}
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'Equipment', labelAr: 'المعدات', path: '/equipment' },
          { label: 'Detail', labelAr: 'التفاصيل' },
        ]}
        actions={[
          {
            label: 'Record Maintenance',
            labelAr: 'تسجيل صيانة',
            icon: <Plus className="w-4 h-4" />,
            variant: 'primary' as const,
            onClick: () => setIsMaintenanceModalOpen(true),
          },
          {
            label: 'Edit',
            labelAr: 'تعديل',
            icon: <Edit className="w-4 h-4" />,
            variant: 'outline' as const,
            onClick: () => navigate(`/equipment/${equipment.id}/edit`),
          },
        ]}
      />

      {/* Status Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="font-cairo">
                {equipment.currentLocationAr || 'غير محدد'}
              </span>
            </div>
          </div>

          {/* Status Actions */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-cairo">تغيير الحالة:</span>
            {Object.entries(equipmentStatusLabels).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleStatusChange(key as EquipmentStatus)}
                className={`px-3 py-1 text-xs font-medium rounded-full font-cairo transition-colors ${
                  equipment.status === key
                    ? config.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 transition-colors font-cairo font-medium flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-[#2563eb] text-[#2563eb]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.labelAr}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-cairo mb-6">معلومات المعدة</h2>

            {/* Image */}
            {equipment.imageUrl && (
              <div className="mb-6">
                <img
                  src={equipment.imageUrl}
                  alt={equipment.nameAr}
                  className="w-full max-w-md h-64 object-cover rounded-xl"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 font-cairo">المعلومات الأساسية</h3>
                <div className="space-y-3">
                  <InfoRow label="الرمز" value={equipment.code} />
                  <InfoRow label="الاسم (عربي)" value={equipment.nameAr} />
                  <InfoRow label="الاسم (إنجليزي)" value={equipment.name} />
                  <InfoRow label="النوع" value={equipment.typeAr} />
                  <InfoRow label="العلامة التجارية" value={equipment.brand} />
                  <InfoRow label="الموديل" value={equipment.model} />
                  <InfoRow label="سنة الصنع" value={equipment.year.toString()} />
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 font-cairo">المواصفات</h3>
                <div className="space-y-3">
                  {equipment.capacity && (
                    <InfoRow
                      label="السعة"
                      value={`${equipment.capacity} ${equipment.capacityUnit || ''}`}
                    />
                  )}
                  {equipment.weight && (
                    <InfoRow label="الوزن" value={`${formatNumber(equipment.weight)} kg`} />
                  )}
                  {equipment.power && (
                    <InfoRow label="القدرة" value={`${equipment.power} حصان`} />
                  )}
                  {equipment.fuelCapacity && (
                    <InfoRow label="سعة الوقود" value={`${equipment.fuelCapacity} لتر`} />
                  )}
                  {equipment.serviceIntervalHours && (
                    <InfoRow
                      label="فترة الصيانة"
                      value={`كل ${equipment.serviceIntervalHours} ساعة`}
                    />
                  )}
                </div>
              </div>

              {/* Usage & Location */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 font-cairo">الاستخدام والموقع</h3>
                <div className="space-y-3">
                  <InfoRow label="إجمالي الساعات" value={`${formatNumber(equipment.totalHours)} ساعة`} />
                  <InfoRow label="نسبة الاستخدام" value={`${equipment.usagePercentage}%`} />
                  {equipment.projectNameAr && (
                    <InfoRow label="المشروع" value={equipment.projectNameAr} />
                  )}
                  {equipment.currentLocationAr && (
                    <InfoRow label="الموقع" value={equipment.currentLocationAr} />
                  )}
                  {equipment.lastMaintenanceDate && (
                    <InfoRow
                      label="آخر صيانة"
                      value={new Date(equipment.lastMaintenanceDate).toLocaleDateString('ar-SA')}
                    />
                  )}
                  {equipment.nextMaintenanceDate && (
                    <InfoRow
                      label="الصيانة القادمة"
                      value={new Date(equipment.nextMaintenanceDate).toLocaleDateString('ar-SA')}
                    />
                  )}
                </div>
              </div>

              {/* Costs */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 font-cairo">التكاليف</h3>
                <div className="space-y-3">
                  {equipment.purchaseCost && (
                    <InfoRow
                      label="تكلفة الشراء"
                      value={`${formatNumber(equipment.purchaseCost)} ريال`}
                    />
                  )}
                  {equipment.dailyOperatingCost && (
                    <InfoRow
                      label="التكلفة اليومية"
                      value={`${formatNumber(equipment.dailyOperatingCost)} ريال`}
                    />
                  )}
                  <InfoRow
                    label="إجمالي تكاليف الصيانة"
                    value={`${formatNumber(equipment.totalMaintenanceCost)} ريال`}
                  />
                </div>
              </div>

              {/* Notes */}
              {(equipment.notesAr || equipment.notes) && (
                <div className="space-y-4 md:col-span-2 lg:col-span-3">
                  <h3 className="font-semibold text-gray-900 font-cairo">ملاحظات</h3>
                  <p className="text-gray-700 font-cairo">{equipment.notesAr || equipment.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Operations Tab */}
        {activeTab === 'operations' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 font-cairo">سجل تشغيل المعدة</h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsOperationModalOpen(true)}
                className="font-cairo"
              >
                <Plus className="w-4 h-4 ml-2" />
                تسجيل تشغيل
              </Button>
            </div>

            {/* Operations Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600 font-cairo mb-1">إجمالي الساعات</p>
                <p className="text-2xl font-bold text-blue-700 font-sans">{formatNumber(totalOperationHours)} ساعة</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600 font-cairo mb-1">إجمالي التكلفة</p>
                <p className="text-2xl font-bold text-green-700 font-sans">
                  {formatNumber(totalOperationCost)} ريال
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm text-amber-600 font-cairo mb-1">متوسط التشغيل</p>
                <p className="text-2xl font-bold text-amber-700 font-sans">
                  {formatNumber(averageDailyUsage)} ساعة
                </p>
              </div>
            </div>

            {operations.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-700 font-cairo mb-2">لا توجد سجلات تشغيل</p>
                <p className="text-sm text-gray-500 font-cairo">ابدأ بتسجيل أول عملية تشغيل لهذه المعدة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">التاريخ</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المشروع</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الدوام</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الساعات</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المعدل</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الإجمالي</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {operations.map((operation) => (
                      <tr key={operation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-cairo">
                          {new Date(operation.date).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900 font-cairo">{operation.projectNameAr}</p>
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
                              onClick={() => handleDeleteOperation(operation.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 font-cairo">سجل الصيانة</h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsMaintenanceModalOpen(true)}
                className="font-cairo"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة صيانة
              </Button>
            </div>

            {maintenanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-700 font-cairo mb-2">لا توجد سجلات صيانة</p>
                <p className="text-sm text-gray-500 font-cairo">ابدأ بتسجيل أول صيانة لهذه المعدة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">التاريخ</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">النوع</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الوصف</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الفني</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">التكلفة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الحالة</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {maintenanceRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-cairo">
                          {new Date(record.date).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${
                            record.type === 'preventive'
                              ? 'bg-blue-100 text-blue-700'
                              : record.type === 'corrective'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record.typeAr}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900 font-cairo">{record.descriptionAr}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-cairo">{record.technicianAr}</td>
                        <td className="px-4 py-3 text-sm font-sans font-medium">
                          {formatNumber(record.cost)} ريال
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${
                            record.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : record.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {record.statusAr}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                              onClick={() => handleDeleteMaintenance(record.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-cairo mb-6">ساعات الاستخدام الشهرية</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600 font-cairo mb-1">إجمالي الساعات</p>
                <p className="text-2xl font-bold text-blue-700 font-sans">{formatNumber(equipment.totalHours)} ساعة</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-green-600 font-cairo mb-1">متوسط شهري</p>
                <p className="text-2xl font-bold text-green-700 font-sans">
                  {formatNumber(Math.round(equipment.totalHours / 12))} ساعة
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm text-amber-600 font-cairo mb-1">نسبة الاستخدام</p>
                <p className="text-2xl font-bold text-amber-700 font-sans">{equipment.usagePercentage}%</p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="monthAr"
                    stroke="#9ca3af"
                    fontSize={12}
                    tick={{ fontFamily: 'Cairo, sans-serif' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) => `${value} ساعة`}
                    tick={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a2b4a',
                      borderRadius: '8px',
                      fontFamily: 'Cairo, sans-serif',
                    }}
                    formatter={(value: number) => [`${value} ساعة`, 'ساعات العمل']}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {monthlyUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Costs Tab */}
        {activeTab === 'costs' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-cairo mb-6">التكاليف المالية</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-600 font-cairo">تكلفة الشراء</p>
                </div>
                <p className="text-xl font-bold text-blue-700 font-sans">
                  {equipment.purchaseCost ? formatNumber(equipment.purchaseCost) : '-'} ريال
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-amber-600 font-cairo">التكلفة اليومية</p>
                </div>
                <p className="text-xl font-bold text-amber-700 font-sans">
                  {equipment.dailyOperatingCost ? formatNumber(equipment.dailyOperatingCost) : '-'} ريال
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-600 font-cairo">إجمالي الصيانة</p>
                </div>
                <p className="text-xl font-bold text-green-700 font-sans">
                  {formatNumber(equipment.totalMaintenanceCost)} ريال
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-600 font-cairo">التكلفة السنوية</p>
                </div>
                <p className="text-xl font-bold text-red-700 font-sans">
                  {equipment.dailyOperatingCost ? formatNumber(annualOperatingCost) : '-'} ريال
                </p>
              </div>
            </div>

            {/* Maintenance Cost Breakdown */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 font-cairo mb-4">تحليل تكاليف الصيانة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 font-cairo mb-1">عدد مرات الصيانة</p>
                  <p className="text-2xl font-bold text-gray-900 font-sans">{maintenanceRecords.length}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 font-cairo mb-1">إجمالي تكاليف الصيانة</p>
                  <p className="text-2xl font-bold text-gray-900 font-sans">
                    {formatNumber(totalMaintenanceCost)} ريال
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 font-cairo mb-1">متوسط التكلفة</p>
                  <p className="text-2xl font-bold text-gray-900 font-sans">
                    {formatNumber(Math.round(averageCostPerMaintenance))} ريال
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        equipmentId={equipment.id}
        equipmentName={equipment.name}
        equipmentNameAr={equipment.nameAr}
      />

      {/* Equipment Operation Modal */}
      <EquipmentOperationModal
        isOpen={isOperationModalOpen}
        onClose={() => setIsOperationModalOpen(false)}
        equipmentId={equipment.id}
      />
    </AppLayout>
  )
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-500 font-cairo">{label}</span>
      <span className="text-sm font-medium text-gray-900 font-sans">{value}</span>
    </div>
  )
}
