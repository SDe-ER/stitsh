import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  useKPIs,
  useMonthlyRevenue,
  useProjectPerformance,
  useEquipmentUtilization,
  useEmployeePerformance,
  useTopClients,
  useCategoryExpenses,
  useInsights,
  type Insight,
} from '@/hooks/useAnalytics'
import { formatNumber } from '@/utils/format'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Users,
  Truck,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
  Filter,
  Download,
} from 'lucide-react'

// ============================================================================
// COLORS
// ============================================================================

const COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  pink: '#ec4899',
  gray: '#6b7280',
}

const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#6b7280',
]

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

function KpiCard({
  title,
  titleAr,
  value,
  subtitle,
  change,
  changeType,
  icon,
  color,
}: {
  title: string
  titleAr: string
  value: string | number
  subtitle: string
  change?: number
  changeType?: 'up' | 'down'
  icon: React.ReactNode
  color: 'blue' | 'green' | 'red' | 'amber' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  }

  const changeColor = changeType === 'up' ? 'text-green-600' : 'text-red-600'
  const changeIcon = changeType === 'up' ? (
    <TrendingUp className="w-3 h-3" />
  ) : (
    <TrendingDown className="w-3 h-3" />
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-cairo mb-1">{titleAr}</p>
          <h3 className="text-2xl font-bold text-gray-900 font-sans mb-1">
            {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
          </h3>
          <p className="text-xs text-gray-500 font-cairo">{subtitle}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${changeColor}`}>
              {changeIcon}
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-400 font-cairo text-xs">من الشهر الماضي</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  )
}

// ============================================================================
// INSIGHT CARD COMPONENT
// ============================================================================

function InsightCard({ insight, onDismiss }: { insight: Insight; onDismiss: (id: string) => void }) {
  const typeConfig = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
    },
    danger: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
    },
  }

  const config = typeConfig[insight.type]

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 relative`}>
      {insight.actionRequired && (
        <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full font-cairo">
          مطلوب إجراء
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className={`${config.textColor} flex-shrink-0 mt-0.5`}>{config.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${config.textColor} font-cairo mb-1`}>{insight.titleAr}</h4>
          <p className="text-sm text-gray-700 font-cairo">{insight.descriptionAr}</p>
        </div>
        <button
          onClick={() => onDismiss(insight.id)}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set())

  const { data: kpis } = useKPIs()
  const { data: monthlyRevenue } = useMonthlyRevenue()
  const { data: projectPerformance } = useProjectPerformance()
  const { data: equipmentUtilization } = useEquipmentUtilization()
  const { data: employeePerformance } = useEmployeePerformance()
  const { data: topClients } = useTopClients()
  const { data: categoryExpenses } = useCategoryExpenses()
  const { data: insights } = useInsights()

  const activeInsights = insights?.filter((i) => !dismissedInsights.has(i.id)) || []

  const handleDismissInsight = (id: string) => {
    setDismissedInsights((prev) => new Set([...prev, id]))
  }

  const handleExportReport = () => {
    window.print()
  }

  return (
    <AppLayout titleAr="التحليلات المتقدمة">
      <PageHeader
        title="Advanced Analytics"
        titleAr="التحليلات المتقدمة"
        subtitle="Comprehensive business intelligence and insights"
        subtitleAr="معلومات شاملة ورؤى الأعمال"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'Analytics', labelAr: 'التحليلات' },
        ]}
        actions={[
          {
            label: 'Export Report',
            labelAr: 'تصدير التقرير',
            icon: <Download className="w-4 h-4" />,
            variant: 'outline' as const,
            onClick: handleExportReport,
          },
        ]}
      />

      {/* Period Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors font-cairo ${
              selectedPeriod === 'month'
                ? 'bg-[#2563eb] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            شهري
          </button>
          <button
            onClick={() => setSelectedPeriod('quarter')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors font-cairo ${
              selectedPeriod === 'quarter'
                ? 'bg-[#2563eb] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ربع سنوي
          </button>
          <button
            onClick={() => setSelectedPeriod('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors font-cairo ${
              selectedPeriod === 'year'
                ? 'bg-[#2563eb] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            سنوي
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Total Revenue"
          titleAr="إجمالي الإيرادات"
          value={`${formatNumber(kpis?.totalRevenue || 0)} ريال`}
          subtitle="للشهر الحالي"
          change={18}
          changeType="up"
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
        />
        <KpiCard
          title="Net Profit"
          titleAr="صافي الربح"
          value={`${formatNumber(kpis?.netProfit || 0)} ريال`}
          subtitle="هامش الربح"
          change={kpis?.profitMargin}
          changeType="up"
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <KpiCard
          title="Active Projects"
          titleAr="المشاريع النشطة"
          value={kpis?.activeProjects || 0}
          subtitle={`${kpis?.completedProjects || 0} مكتمل`}
          change={12}
          changeType="up"
          icon={<Briefcase className="w-6 h-6" />}
          color="purple"
        />
        <KpiCard
          title="Equipment Utilization"
          titleAr="استخدام المعدات"
          value={`${kpis?.equipmentUtilization || 0}%`}
          subtitle="من إجمالي الأسطول"
          change={5}
          changeType="up"
          icon={<Truck className="w-6 h-6" />}
          color="amber"
        />
      </div>

      {/* Insights */}
      {activeInsights.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 font-cairo mb-4">تنبيهات وملاحظات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onDismiss={handleDismissInsight}
              />
            ))}
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 font-cairo mb-4">تحليل الإيرادات والمصاريف</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyRevenue}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="monthAr"
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fill: '#6b7280' }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'Cairo, sans-serif',
              }}
              formatter={(value: number) => `${formatNumber(value)} ريال`}
            />
            <Legend
              wrapperStyle={{ fontFamily: 'Cairo, sans-serif' }}
              formatter={(value) =>
                value === 'revenue'
                  ? 'الإيرادات'
                  : value === 'expenses'
                  ? 'المصاريف'
                  : 'الأرباح'
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={COLORS.blue}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke={COLORS.red}
              fillOpacity={1}
              fill="url(#colorExpenses)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke={COLORS.green}
              fillOpacity={1}
              fill="url(#colorProfit)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Project Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 font-cairo mb-4">أداء المشاريع</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={projectPerformance?.slice(0, 5)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                type="number"
                stroke="#6b7280"
                tick={{ fill: '#6b7280' }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="nameAr"
                stroke="#6b7280"
                tick={{ fill: '#6b7280' }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'Cairo, sans-serif',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'progress') return [`%${value}`, 'التقدم']
                  if (name === 'profitMargin') return [`%${value}`, 'هامش الربح']
                  return [value, name]
                }}
              />
              <Legend
                wrapperStyle={{ fontFamily: 'Cairo, sans-serif' }}
                formatter={(value) =>
                  value === 'progress' ? 'التقدم' : value === 'profitMargin' ? 'هامش الربح' : value
                }
              />
              <Bar dataKey="progress" fill={COLORS.blue} radius={[0, 4, 4, 0]} />
              <Bar dataKey="profitMargin" fill={COLORS.green} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 font-cairo mb-4">المصاريف حسب الفئة</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryExpenses}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categoryAr, percentage }) => `${categoryAr} (%${percentage})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {categoryExpenses?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'Cairo, sans-serif',
                }}
                formatter={(value: number) => `${formatNumber(value)} ريال`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Equipment Utilization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 font-cairo mb-4">استخدام المعدات</h2>
          <div className="space-y-4">
            {equipmentUtilization?.slice(0, 5).map((eq) => (
              <div key={eq.id}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-cairo">{eq.nameAr}</p>
                    <p className="text-xs text-gray-500 font-sans">{eq.code}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-700 font-sans">%{eq.utilizationRate}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      eq.utilizationRate >= 90
                        ? 'bg-green-500'
                        : eq.utilizationRate >= 70
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${eq.utilizationRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 font-cairo mb-4">أهم العملاء</h2>
          <div className="space-y-4">
            {topClients?.map((client, index) => (
              <div key={client.id} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white font-sans ${
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                      ? 'bg-gray-400'
                      : index === 2
                      ? 'bg-amber-600'
                      : 'bg-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 font-cairo truncate">
                    {client.nameAr}
                  </p>
                  <p className="text-xs text-gray-500 font-sans">{client.projects} مشاريع</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 font-sans">
                    {formatNumber(client.totalValue)} ريال
                  </p>
                  {client.pendingPayments > 0 && (
                    <p className="text-xs text-red-600 font-cairo">
                      معلق: {formatNumber(client.pendingPayments)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 font-cairo mb-4">أداء الموظفين</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الموظف</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">القسم</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">المهام المكتملة</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">نسبة الحضور</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">الكفاءة</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">المشاريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employeePerformance?.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 font-cairo">{emp.nameAr}</p>
                    <p className="text-xs text-gray-500 font-sans">{emp.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-700 font-cairo">{emp.departmentAr}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 font-sans">
                      {emp.completedTasks}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium font-sans ${
                        emp.attendanceRate >= 95
                          ? 'bg-green-100 text-green-700'
                          : emp.attendanceRate >= 85
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      %{emp.attendanceRate}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            emp.efficiency >= 90
                              ? 'bg-green-500'
                              : emp.efficiency >= 75
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${emp.efficiency}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-700 font-sans">%{emp.efficiency}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-700 font-sans">{emp.projectsAssigned}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .bg-white { box-shadow: none; border: 1px solid #ddd; }
        }
      `}</style>
    </AppLayout>
  )
}
