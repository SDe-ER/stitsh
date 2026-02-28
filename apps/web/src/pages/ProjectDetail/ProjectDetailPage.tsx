import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { ProjectModal } from '@/components/modals/ProjectModal'
import { ProductionModal } from '@/components/modals/ProductionModal'
import { TipperTypesModal } from '@/components/modals/TipperTypesModal'
import { CrushersModal } from '@/components/modals/CrushersModal'
import { AssignEquipmentModal } from '@/components/modals/AssignEquipmentModal'
import { EquipmentOperationModal } from '@/components/modals/EquipmentOperationModal'
import { useProjectDetail } from '@/hooks/useProjects'
import { useProductionRecords, useDeleteProduction, shiftLabels, getCrushers, type ProductionRecord, type Crusher } from '@/hooks/useProduction'
import { useEquipment } from '@/hooks/useEquipment'
import { useEquipmentOperations, useDeleteEquipmentOperation } from '@/hooks/useEquipmentOperations'
import { formatMillions, formatNumber } from '@/utils/format'
import {
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Wrench,
  FileText,
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  ChevronRight,
  Edit,
  Trash2,
  Download,
  Plus,
  BarChart3,
  Truck,
  Construction,
  Timer,
  Sun,
  Moon,
  Factory,
  Activity,
  Settings,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// ============================================================================
// TAB TYPES
// ============================================================================
type TabType = 'overview' | 'financial' | 'team' | 'equipment' | 'items' | 'production'

const tabs: { id: TabType; label: string; labelAr: string }[] = [
  { id: 'overview', label: 'Overview', labelAr: 'نظرة عامة' },
  { id: 'financial', label: 'Financial', labelAr: 'مالي' },
  { id: 'team', label: 'Team', labelAr: 'الفريق' },
  { id: 'equipment', label: 'Equipment', labelAr: 'المعدات والتشغيل' },
  { id: 'items', label: 'Items', labelAr: 'البنود' },
  { id: 'production', label: 'Production', labelAr: 'الإنتاج' },
]

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================
function KpiCard({
  title,
  titleAr,
  value,
  unit,
  change,
  changeType,
  icon,
  color,
}: {
  title: string
  titleAr: string
  value: string | number
  unit: string
  change?: number
  changeType?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: 'blue' | 'green' | 'red' | 'amber'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  }

  const changeColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${changeColors[changeType]}`}>
            {changeType === 'up' && <TrendingUp className="w-4 h-4" />}
            {changeType === 'down' && <TrendingDown className="w-4 h-4" />}
            <span className="font-sans">{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 font-cairo mb-1">{titleAr}</p>
      <p className="text-2xl font-bold text-gray-900 font-sans">
        {typeof value === 'number' ? formatMillions(value) : value}
        <span className="text-sm font-normal text-gray-500 mr-1 font-cairo">{unit}</span>
      </p>
    </div>
  )
}

// ============================================================================
// MILESTONE COMPONENT
// ============================================================================
function Milestone({ milestone }: { milestone: any }) {
  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    'in-progress': { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    pending: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50' },
  }

  const config = statusConfig[milestone.status]
  const Icon = config.icon

  return (
    <div className="flex items-start gap-4">
      <div className={`p-2 rounded-full ${config.bg} flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>
      <div className="flex-1 pb-6 border-r-2 border-gray-200 last:border-0">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h4 className="font-medium text-gray-900 font-cairo">{milestone.nameAr}</h4>
            <p className="text-sm text-gray-500 font-cairo">{milestone.name}</p>
          </div>
          <span className="text-sm text-gray-500 font-sans">{milestone.progress}%</span>
        </div>
        <p className="text-xs text-gray-400 font-cairo">
          {new Date(milestone.date).toLocaleDateString('ar-SA')}
        </p>
        {/* Mini progress bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-[#2563eb] h-1.5 rounded-full transition-all"
            style={{ width: `${milestone.progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================
function OverviewTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Budget"
          titleAr="الميزانية"
          value={data.kpis.budget}
          unit="ريال"
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
        />
        <KpiCard
          title="Spent"
          titleAr="المصروف"
          value={data.kpis.spent}
          unit="ريال"
          change={Math.round((data.kpis.spent / data.kpis.budget) * 100)}
          changeType="neutral"
          icon={<TrendingDown className="w-5 h-5" />}
          color="amber"
        />
        <KpiCard
          title="Remaining"
          titleAr="المتبقي"
          value={data.kpis.remaining}
          unit="ريال"
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <KpiCard
          title="Progress"
          titleAr="التقدم"
          value={data.kpis.progress}
          unit="%"
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 font-cairo mb-6">خطة الإنجازات</h2>
        <div className="pr-2">
          {data.milestones.map((milestone: any) => (
            <Milestone key={milestone.id} milestone={milestone} />
          ))}
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 font-cairo mb-4">معلومات المشروع</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-cairo">رمز المشروع</span>
              <span className="font-medium text-gray-900 font-sans">{data.code}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-cairo">الحالة</span>
              <StatusBadge status={data.status} size="sm" />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-cairo">تاريخ البداية</span>
              <span className="font-medium text-gray-900 font-cairo">
                {new Date(data.startDate).toLocaleDateString('ar-SA')}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500 font-cairo">تاريخ النهاية</span>
              <span className="font-medium text-gray-900 font-cairo">
                {new Date(data.endDate).toLocaleDateString('ar-SA')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 font-cairo mb-4">الأطراف المعنية</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-cairo">العميل</span>
              <span className="font-medium text-gray-900 font-cairo">{data.clientNameAr}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-cairo">مدير المشروع</span>
              <span className="font-medium text-gray-900 font-cairo">{data.managerNameAr}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-cairo">عدد الموظفين</span>
              <span className="font-medium text-gray-900 font-sans">{data.employeeCount}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500 font-cairo">المعدات</span>
              <span className="font-medium text-gray-900 font-sans">{data.kpis.equipmentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// FINANCIAL TAB
// ============================================================================
function FinancialTab({ data }: { data: any }) {
  const expenseColors = ['#2563eb', '#16a34a', '#d97706', '#dc2626']

  const invoiceStatusConfig = {
    paid: { label: 'مدفوع', color: 'bg-green-100 text-green-700' },
    pending: { label: 'معلق', color: 'bg-blue-100 text-blue-700' },
    overdue: { label: 'متأخر', color: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Budget"
          titleAr="الميزانية الكلية"
          value={data.kpis.budget}
          unit="ريال"
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
        />
        <KpiCard
          title="Total Spent"
          titleAr="إجمالي المصروفات"
          value={data.kpis.spent}
          unit="ريال"
          icon={<TrendingDown className="w-5 h-5" />}
          color="red"
        />
        <KpiCard
          title="Remaining"
          titleAr="المتبقي"
          value={data.kpis.remaining}
          unit="ريال"
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <KpiCard
          title="Projected Profit"
          titleAr="الربح المتوقع"
          value={data.kpis.profit}
          unit="ريال"
          change={15}
          changeType="up"
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* Monthly Expenses Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 font-cairo mb-2">المصروفات الشهرية</h2>
        <p className="text-sm text-gray-500 font-cairo mb-6">تتبع الإنفاق على مدار العام</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data.monthlyExpenses}>
            <defs>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              tick={{ fontFamily: 'Inter, sans-serif' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a2b4a',
                borderRadius: '8px',
                fontFamily: 'Cairo, sans-serif',
              }}
              formatter={(value: number) => [`${formatMillions(value)} ريال`, 'المصروفات']}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#2563eb"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 font-cairo mb-2">المصروفات حسب الفئة</h2>
          <p className="text-sm text-gray-500 font-cairo mb-6">توزيع المصروفات</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.expenses}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
                label={({ categoryAr, percent }) => (
                  <text
                    x={0}
                    y={0}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-cairo"
                  >
                    {categoryAr}
                  </text>
                )}
              >
                {data.expenses.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={expenseColors[index % expenseColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2b4a',
                  borderRadius: '8px',
                  fontFamily: 'Cairo, sans-serif',
                }}
                formatter={(value: number, name: string, props: any) => [
                  formatMillions(value),
                  props.payload.categoryAr,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {data.expenses.map((expense: any, index: number) => (
              <div key={expense.id} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: expenseColors[index % expenseColors.length] }}
                />
                <span className="text-sm text-gray-600 font-cairo">{expense.categoryAr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 font-cairo">الفواتير</h2>
            <Button variant="outline" size="sm" className="font-cairo">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
          <div className="space-y-3">
            {data.invoices.map((invoice: any) => (
              <div
                key={invoice.id}
                className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 font-sans">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-gray-500 font-cairo">
                      الاستحقاق: {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${
                    invoiceStatusConfig[invoice.status].color
                  }`}>
                    {invoiceStatusConfig[invoice.status].label}
                  </span>
                </div>
                <p className="text-lg font-bold text-[#2563eb] font-sans">
                  {formatMillions(invoice.amount)} ريال
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TEAM TAB
// ============================================================================
function TeamTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Team Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">إجمالي الفريق</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{data.employees.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">متفرغون بالكامل</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">
                {data.employees.filter((e: any) => e.allocation === 100).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">جزئياً</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">
                {data.employees.filter((e: any) => e.allocation < 100).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-cairo">الموظف</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-cairo">الدور</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-cairo">التاريخ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-cairo">التخصيص</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.employees.map((employee: any) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 font-cairo">{employee.nameAr}</p>
                      <p className="text-sm text-gray-500 font-cairo">{employee.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900 font-cairo">{employee.roleAr}</p>
                      <p className="text-sm text-gray-500 font-cairo">{employee.role}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 font-cairo">
                      {new Date(employee.joinedDate).toLocaleDateString('ar-SA')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#2563eb] h-2 rounded-full"
                          style={{ width: `${employee.allocation}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 font-sans">
                        {employee.allocation}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EQUIPMENT TAB
// ============================================================================
function EquipmentTab({ data, onManageEquipment, onRecordOperation }: { data: any; onManageEquipment: () => void; onRecordOperation: () => void }) {
  const { data: equipment = [] } = useEquipment()
  const { data: operations = [] } = useEquipmentOperations({ projectId: data.id })
  const deleteOperationMutation = useDeleteEquipmentOperation()

  // Get assigned equipment
  const assignedEquipment = equipment.filter(eq => data.assignedEquipmentIds?.includes(eq.id))

  const statusConfig = {
    active: { label: 'نشطة', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    inactive: { label: 'خامدة', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
    maintenance: { label: 'تحت الصيانة', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  }

  const handleDeleteOperation = (operationId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      deleteOperationMutation.mutate(operationId)
    }
  }

  // Calculate operations statistics
  const totalOperationHours = operations.reduce((sum: number, op: any) => sum + op.hours, 0)
  const totalOperationCost = operations.reduce((sum: number, op: any) => sum + op.totalCost, 0)

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="primary" onClick={onManageEquipment} className="font-cairo">
          <Settings className="w-4 h-4 ml-2" />
          إدارة المعدات
        </Button>
        {assignedEquipment.length > 0 && (
          <Button variant="outline" onClick={onRecordOperation} className="font-cairo">
            <Activity className="w-4 h-4 ml-2" />
            تسجيل تشغيل
          </Button>
        )}
      </div>

      {/* Equipment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">المعدات المضافة</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{assignedEquipment.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">نشطة</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">
                {assignedEquipment.filter((e: any) => e.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">تحت الصيانة</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">
                {assignedEquipment.filter((e: any) => e.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">ساعات التشغيل</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{formatNumber(totalOperationHours)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      {assignedEquipment.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-cairo mb-2">لم يتم إضافة أي معدات للمشروع</p>
          <p className="text-sm text-gray-500 font-cairo mb-4">اضغط على "إدارة المعدات" لإضافة معدات</p>
          <Button variant="primary" onClick={onManageEquipment} className="font-cairo">
            <Plus className="w-4 h-4 ml-2" />
            إضافة معدات
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedEquipment.map((item: any) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-gray-100">
                  <Wrench className="w-5 h-5 text-gray-600" />
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${
                  statusConfig[item.status]?.color || 'bg-gray-100 text-gray-700'
                }`}>
                  {statusConfig[item.status]?.label || item.status}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 font-cairo mb-1">{item.nameAr}</h4>
              <p className="text-sm text-gray-500 font-cairo mb-3">{item.name}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-cairo">الرمز</span>
                  <span className="font-medium text-gray-900 font-sans">{item.code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-cairo">النوع</span>
                  <span className="font-medium text-gray-900 font-cairo">{item.typeAr}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-cairo">الساعات</span>
                  <span className="font-medium text-gray-900 font-sans">{formatNumber(item.totalHours)} ساعة</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Equipment Operations Section */}
      {assignedEquipment.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-cairo">سجل تشغيل المعدات</h2>
              <p className="text-sm text-gray-500 font-cairo">Equipment Operations Records</p>
            </div>
            <div className="flex gap-2">
              <div className="bg-blue-50 rounded-lg px-4 py-2">
                <p className="text-xs text-blue-600 font-cairo">إجمالي الساعات</p>
                <p className="text-lg font-bold text-blue-700 font-sans">{formatNumber(totalOperationHours)} ساعة</p>
              </div>
              <div className="bg-green-50 rounded-lg px-4 py-2">
                <p className="text-xs text-green-600 font-cairo">إجمالي التكلفة</p>
                <p className="text-lg font-bold text-green-700 font-sans">{formatNumber(totalOperationCost)} ريال</p>
              </div>
            </div>
          </div>

          {operations.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 font-cairo mb-2">لا توجد سجلات تشغيل</p>
              <p className="text-sm text-gray-500 font-cairo mb-4">ابدأ بتسجيل تشغيل المعدات</p>
              <Button variant="outline" onClick={onRecordOperation} className="font-cairo">
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
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الدوام</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الساعات</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المعدل</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الإجمالي</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {operations.map((operation: any) => (
                    <tr key={operation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-cairo">
                        {new Date(operation.date).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 font-cairo">{operation.equipmentNameAr}</p>
                        <p className="text-xs text-gray-500 font-sans">{operation.equipmentCode}</p>
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
    </div>
  )
}

// ============================================================================
// ITEMS TAB (BOQ)
// ============================================================================
function ItemsTab({ data }: { data: any }) {
  // Calculate totals
  const totalAmount = data.items?.reduce((sum: number, item: any) => sum + item.totalPrice, 0) || 0
  const totalQuantity = data.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
  const completedItems = data.items?.filter((item: any) => item.status === 'completed').length || 0
  const inProgressItems = data.items?.filter((item: any) => item.status === 'in-progress').length || 0

  const categoryTotals = data.items?.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = { count: 0, total: 0, categoryAr: item.categoryAr }
    }
    acc[item.category].count++
    acc[item.category].total += item.totalPrice
    return acc
  }, {}) || {}

  const statusConfig = {
    pending: { label: 'معلق', color: 'bg-gray-100 text-gray-700' },
    approved: { label: 'معتمد', color: 'bg-blue-100 text-blue-700' },
    'in-progress': { label: 'قيد التنفيذ', color: 'bg-amber-100 text-amber-700' },
    completed: { label: 'مكتمل', color: 'bg-green-100 text-green-700' },
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA').format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">إجمالي البنود</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{data.items?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">إجمالي المبلغ</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{formatMillions(totalAmount)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">مكتمل</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{completedItems}/{data.items?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">قيد التنفيذ</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{inProgressItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-cairo">جدول البنود (BOQ)</h2>
            <p className="text-sm text-gray-500 font-cairo">Bill of Quantities - بنود الأعمال والأسعار</p>
          </div>
          <Button variant="primary" size="sm" className="font-cairo">
            <Plus className="w-4 h-4 ml-2" />
            إضافة بند
          </Button>
        </div>

        {/* Category Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 font-cairo">ملخص حسب الفئة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(categoryTotals).map(([key, val]: any) => (
              <div key={key} className="bg-white p-3 rounded-lg">
                <p className="text-sm text-gray-500 font-cairo">{val.categoryAr}</p>
                <p className="text-lg font-bold text-gray-900 font-sans">{val.count} بنود</p>
                <p className="text-sm font-medium text-[#2563eb] font-sans">{formatMillions(val.total)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الرمز</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">البند</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الفئة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الوحدة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الكمية</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">سعر الوحدة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الإجمالي</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الحالة</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items?.map((item: any, index: number) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {item.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 font-cairo">{item.nameAr}</p>
                      <p className="text-sm text-gray-500 font-cairo">{item.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 font-cairo">
                      {item.categoryAr}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 font-cairo">{item.unitAr}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900 font-sans">{formatNumber(item.quantity)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 font-sans">{formatCurrency(item.unitPrice)} ريال</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-[#2563eb] font-sans">{formatCurrency(item.totalPrice)} ريال</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${statusConfig[item.status].color}`}>
                      {statusConfig[item.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="حذف"
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

        {/* Total Summary */}
        <div className="mt-6 p-4 bg-[#1a2b4a] rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300 font-cairo">إجمالي قيمة البنود</p>
              <p className="text-xs text-gray-400 font-cairo">{data.items?.length || 0} بنود</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-sans">{formatCurrency(totalAmount)} ريال</p>
              <p className="text-sm text-gray-300 font-cairo">{formatMillions(totalAmount)} ريال</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PRODUCTION TAB
// ============================================================================
function ProductionTab({ projectId, items }: { projectId: string; items: any[] }) {
  const { data: records, isLoading } = useProductionRecords({ projectId })
  const deleteMutation = useDeleteProduction()
  const [filterMethod, setFilterMethod] = useState<'all' | 'tipper' | 'excavator' | 'hourly'>('all')
  const [filterCrusher, setFilterCrusher] = useState<string>('all')
  const [isTipperModalOpen, setIsTipperModalOpen] = useState(false)
  const [isCrushersModalOpen, setIsCrushersModalOpen] = useState(false)
  const crushers = getCrushers(projectId)

  const methodConfig = {
    tipper: { label: 'قلابات', color: 'bg-blue-100 text-blue-700', icon: Truck },
    excavator: { label: 'رفع مساحي', color: 'bg-amber-100 text-amber-700', icon: Construction },
    hourly: { label: 'بالساعة', color: 'bg-green-100 text-green-700', icon: Timer },
  }

  const filteredRecords = records?.filter(r =>
    (filterMethod === 'all' || r.method === filterMethod) &&
    (filterCrusher === 'all' || r.crusherId === filterCrusher || (!r.crusherId && filterCrusher === 'general'))
  ) || []

  // Calculate totals
  const totalQuantity = filteredRecords
    .filter(r => r.method === 'tipper' || r.method === 'excavator')
    .reduce((sum, r) => sum + (r.quantity || 0), 0)

  const totalTrips = filteredRecords
    .filter(r => r.method === 'tipper')
    .reduce((sum, r) => sum + (r.tripsCount || 0), 0)

  const totalHours = filteredRecords
    .filter(r => r.method === 'hourly')
    .reduce((sum, r) => sum + (r.hours || 0), 0)

  const handleDelete = (recordId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      deleteMutation.mutate(recordId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">إجمالي السجلات</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{records?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">إجمالي الرحلات</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{totalTrips}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600">
              <Construction className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">الكمية (م³)</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{formatNumber(totalQuantity)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">الساعات</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{totalHours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Production Records */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-cairo">سجلات الإنتاج</h2>
            <p className="text-sm text-gray-500 font-cairo">Production Records - سجلات الإنتاج اليومي والشهري</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTipperModalOpen(true)}
              className="font-cairo"
            >
              إدارة القلابات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCrushersModalOpen(true)}
              className="font-cairo"
            >
              <Factory className="w-4 h-4 ml-1" />
              إدارة الكسارات
            </Button>
            {crushers.length > 0 && (
              <select
                value={filterCrusher}
                onChange={(e) => setFilterCrusher(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
              >
                <option value="all">جميع الكسارات</option>
                <option value="general">عام</option>
                {crushers.map((crusher) => (
                  <option key={crusher.id} value={crusher.id}>
                    {crusher.nameAr}
                  </option>
                ))}
              </select>
            )}
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            >
              <option value="all">جميع الطرق</option>
              <option value="tipper">قلابات</option>
              <option value="excavator">رفع مساحي</option>
              <option value="hourly">بالساعة</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">التاريخ</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الدوام</th>
                {crushers.length > 0 && <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الكسارة</th>}
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الطريقة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">البند</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">التفاصيل</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الكمية</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الملاحظات</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={crushers.length > 0 ? 9 : 8} className="px-4 py-12 text-center text-gray-500 font-cairo">
                    لا توجد سجلات إنتاج
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record: ProductionRecord) => {
                  const config = methodConfig[record.method]
                  const Icon = config.icon
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 font-cairo">
                          {new Date(record.date).toLocaleDateString('ar-SA')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full font-cairo ${
                          record.shift === 'day' ? 'bg-yellow-100 text-yellow-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {record.shift === 'day' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                          {record.shiftAr}
                        </span>
                      </td>
                      {crushers.length > 0 && (
                        <td className="px-4 py-3">
                          {record.crusherId ? (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 font-cairo`}>
                              {record.crusherNameAr}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 font-cairo">عام</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 font-cairo">{record.itemNameAr || '-'}</p>
                          <p className="text-xs text-gray-500 font-cairo">{record.itemName || '-'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {record.method === 'tipper' && (
                          <div className="text-sm text-gray-600 font-cairo">
                            <span>{record.tripsCount} رحلة</span>
                            {record.tipperVolume && (
                              <span className="text-gray-500 text-xs mr-1">({record.tipperVolume} م³)</span>
                            )}
                          </div>
                        )}
                        {record.method === 'excavator' && (
                          <span className="text-sm text-gray-600 font-cairo">رفع مساحي</span>
                        )}
                        {record.method === 'hourly' && (
                          <div className="text-sm text-gray-600 font-cairo">
                            <span>{record.hours} ساعة</span>
                            {record.hourlyRate && (
                              <span className="text-gray-500 text-xs mr-1">({record.hourlyRate} ريال/ساعة)</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {record.method === 'hourly' ? (
                          <span className="text-sm font-bold text-green-600 font-sans">
                            {((record.hours || 0) * (record.hourlyRate || 0)).toLocaleString('ar-SA')} ريال
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-blue-600 font-sans">
                            {formatNumber(record.quantity || 0)} م³
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-500 font-cairo max-w-xs truncate">
                          {record.notesAr || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            onClick={() => handleDelete(record.id)}
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tipper Types Management Modal */}
      <TipperTypesModal
        isOpen={isTipperModalOpen}
        onClose={() => setIsTipperModalOpen(false)}
      />

      {/* Crushers Management Modal */}
      <CrushersModal
        isOpen={isCrushersModalOpen}
        onClose={() => setIsCrushersModalOpen(false)}
        projectId={projectId}
      />
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false)
  const [isAssignEquipmentModalOpen, setIsAssignEquipmentModalOpen] = useState(false)
  const [isEquipmentOperationModalOpen, setIsEquipmentOperationModalOpen] = useState(false)

  const { data, isLoading, error } = useProjectDetail(id || '')

  if (isLoading) {
    return (
      <AppLayout titleAr="تفاصيل المشروع">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </AppLayout>
    )
  }

  if (error || !data) {
    return (
      <AppLayout titleAr="تفاصيل المشروع">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Building2 className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-lg text-gray-700 font-cairo mb-2">فشل تحميل المشروع</p>
          <p className="text-sm text-gray-500 font-cairo mb-6">يرجى المحاولة مرة أخرى</p>
          <Button variant="outline" onClick={() => navigate('/projects')} className="font-cairo">
            العودة للمشاريع
          </Button>
        </div>
      </AppLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Home', labelAr: 'الرئيسية', path: '/' },
    { label: 'Projects', labelAr: 'المشاريع', path: '/projects' },
    { label: 'Project', labelAr: 'المشروع' },
  ]

  const headerActions = [
    {
      label: 'Record Production',
      labelAr: 'تسجيل إنتاج',
      icon: <Plus className="w-4 h-4" />,
      variant: 'primary' as const,
      onClick: () => setIsProductionModalOpen(true),
    },
    {
      label: 'Edit',
      labelAr: 'تعديل',
      icon: <Edit className="w-4 h-4" />,
      variant: 'outline' as const,
      onClick: () => setIsModalOpen(true),
    },
    {
      label: 'Delete',
      labelAr: 'حذف',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger' as const,
      onClick: () => {
        if (window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
          console.log('Delete project:', id)
          // TODO: Implement delete functionality
          navigate('/projects')
        }
      },
    },
  ]

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab data={data} />
      case 'financial':
        return <FinancialTab data={data} />
      case 'team':
        return <TeamTab data={data} />
      case 'equipment':
        return (
          <EquipmentTab
            data={data}
            onManageEquipment={() => setIsAssignEquipmentModalOpen(true)}
            onRecordOperation={() => setIsEquipmentOperationModalOpen(true)}
          />
        )
      case 'items':
        return <ItemsTab data={data} />
      case 'production':
        return <ProductionTab projectId={id || ''} items={data.items || []} />
      default:
        return <OverviewTab data={data} />
    }
  }

  return (
    <>
    <AppLayout titleAr={data.nameAr}>
      <PageHeader
        title={data.name}
        titleAr={data.nameAr}
        subtitle={`Project Code: ${data.code}`}
        subtitleAr={`رمز المشروع: ${data.code}`}
        actions={headerActions}
        breadcrumbs={breadcrumbs}
      />

      {/* Project Status Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <StatusBadge status={data.status} size="md" />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="font-cairo">{data.locationAr}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="font-cairo">
                {new Date(data.startDate).toLocaleDateString('ar-SA')} - {new Date(data.endDate).toLocaleDateString('ar-SA')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-cairo">التقدم:</span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#2563eb] h-2 rounded-full transition-all"
                style={{ width: `${data.progress}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-900 font-sans">{data.progress}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 transition-colors font-cairo font-medium ${
                activeTab === tab.id
                  ? 'border-[#2563eb] text-[#2563eb]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.labelAr}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTab()}
    </AppLayout>

    {/* Edit Project Modal */}
    <ProjectModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      project={data}
    />

    {/* Production Recording Modal */}
    <ProductionModal
      isOpen={isProductionModalOpen}
      onClose={() => setIsProductionModalOpen(false)}
      projectId={id || ''}
      projectItems={data.items}
    />

    {/* Assign Equipment Modal */}
    <AssignEquipmentModal
      isOpen={isAssignEquipmentModalOpen}
      onClose={() => setIsAssignEquipmentModalOpen(false)}
      project={data}
    />

    {/* Equipment Operation Modal */}
    <EquipmentOperationModal
      isOpen={isEquipmentOperationModalOpen}
      onClose={() => setIsEquipmentOperationModalOpen(false)}
      projectId={id || ''}
    />
    </>
  )
}
