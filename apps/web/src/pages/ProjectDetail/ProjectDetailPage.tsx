import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { useProjectDetail } from '@/hooks/useProjects'
import { formatMillions } from '@/utils/format'
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
type TabType = 'overview' | 'financial' | 'team' | 'equipment'

const tabs: { id: TabType; label: string; labelAr: string }[] = [
  { id: 'overview', label: 'Overview', labelAr: 'نظرة عامة' },
  { id: 'financial', label: 'Financial', labelAr: 'مالي' },
  { id: 'team', label: 'Team', labelAr: 'الفريق' },
  { id: 'equipment', label: 'Equipment', labelAr: 'المعدات' },
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
function EquipmentTab({ data }: { data: any }) {
  const statusConfig = {
    'in-use': { label: 'قيد الاستخدام', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    'maintenance': { label: 'تحت الصيانة', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    'available': { label: 'متاح', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  }

  return (
    <div className="space-y-6">
      {/* Equipment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">إجمالي المعدات</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">{data.equipment.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-cairo">قيد الاستخدام</p>
              <p className="text-2xl font-bold text-gray-900 font-sans">
                {data.equipment.filter((e: any) => e.status === 'in-use').length}
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
                {data.equipment.filter((e: any) => e.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.equipment.map((item: any) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-gray-100">
                <Wrench className="w-5 h-5 text-gray-600" />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${
                statusConfig[item.status].color
              }`}>
                {statusConfig[item.status].label}
              </span>
            </div>
            <h4 className="font-medium text-gray-900 font-cairo mb-1">{item.nameAr}</h4>
            <p className="text-sm text-gray-500 font-cairo mb-3">{item.name}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-cairo">النوع</span>
              <span className="font-medium text-gray-900 font-cairo">{item.typeAr}</span>
            </div>
          </div>
        ))}
      </div>
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
      label: 'Edit',
      labelAr: 'تعديل',
      icon: <Edit className="w-4 h-4" />,
      variant: 'outline' as const,
      onClick: () => console.log('Edit project'),
    },
    {
      label: 'Delete',
      labelAr: 'حذف',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger' as const,
      onClick: () => console.log('Delete project'),
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
        return <EquipmentTab data={data} />
      default:
        return <OverviewTab data={data} />
    }
  }

  return (
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
  )
}
