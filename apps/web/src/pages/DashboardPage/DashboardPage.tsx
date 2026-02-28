import { useDashboard } from '@/hooks/useDashboard.tsx'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
  AlertTriangle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

// ============================================================================
// COMPONENTS
// ============================================================================

// KPI Card Component
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
  color: 'blue' | 'green' | 'red' | 'amber'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  }

  const changeColor = changeType === 'up' ? 'text-green-600' : 'text-red-600'
  const changeIcon = changeType === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-cairo mb-1">{titleAr}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 font-sans mb-1">
            {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
          </h3>
          <p className="text-sm text-gray-500 font-cairo">{subtitle}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${changeColor}`}>
              {changeIcon}
              <span>{Math.abs(change)}%</span>
              <span className="text-gray-400 font-cairo text-xs">من الشهر الماضي</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// Skeleton Component
function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  )
}

// Alert Item Component
function AlertItem({ alert }: { alert: typeof import('@/hooks/useDashboard').Alert.prototype }) {
  const alertConfig = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' },
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500' },
  }

  const config = alertConfig[alert.type]

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${config.bg} ${config.border}`}>
      <div className={config.icon}>{alert.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 font-cairo">{alert.messageAr}</p>
        <p className="text-xs text-gray-500 mt-1 font-cairo">{alert.time}</p>
      </div>
      <button className="px-3 py-1.5 text-sm font-medium text-[#2563eb] hover:bg-blue-50 rounded-lg font-cairo transition-colors">
        عرض
      </button>
    </div>
  )
}

// Progress Bar Component
function ProgressBar({ progress, color = 'blue' }: { progress: number; color?: 'blue' | 'green' | 'amber' | 'red' }) {
  const colorClasses = {
    blue: 'bg-[#2563eb]',
    green: 'bg-[#16a34a]',
    amber: 'bg-[#d97706]',
    red: 'bg-[#dc2626]',
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full ${colorClasses[color]} transition-all duration-500`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Fleet Bar Component
function FleetBar({ item }: { item: typeof import('@/hooks/useDashboard').FleetUtilization.prototype }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 font-cairo">{item.typeAr}</span>
        <span className="text-gray-500 font-sans">
          {item.inUse}/{item.total} ({item.utilization}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${item.utilization}%`,
            backgroundColor: item.color,
          }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================
export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard()

  const breadcrumbs = [
    { label: 'Home', labelAr: 'الرئيسية', path: '/' },
    { label: 'Dashboard', labelAr: 'لوحة القيادة' },
  ]

  const headerActions = [
    {
      label: 'Add Project',
      labelAr: 'إضافة مشروع',
      icon: <Briefcase className="w-4 h-4" />,
      variant: 'primary' as const,
      onClick: () => console.log('Add project'),
    },
    {
      label: 'Export Report',
      labelAr: 'تصدير تقرير',
      icon: <TrendingUp className="w-4 h-4" />,
      variant: 'outline' as const,
      onClick: () => console.log('Export report'),
    },
  ]

  if (isLoading) {
    return (
      <AppLayout titleAr="لوحة القيادة">
        <PageHeader
          title="Dashboard"
          titleAr="لوحة القيادة"
          actions={headerActions}
          breadcrumbs={breadcrumbs}
        />
        <div className="space-y-6">
          {/* KPI Skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </div>
          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-80 animate-pulse" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-80 animate-pulse" />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !data) {
    return (
      <AppLayout titleAr="لوحة القيادة">
        <PageHeader
          title="Dashboard"
          titleAr="لوحة القيادة"
          actions={headerActions}
          breadcrumbs={breadcrumbs}
        />
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
          <p className="text-lg text-gray-700 font-cairo">فشل تحميل البيانات</p>
          <p className="text-sm text-gray-500 font-cairo">يرجى المحاولة مرة أخرى</p>
        </div>
      </AppLayout>
    )
  }

  const { stats, monthlyRevenue, projectsByStatus, alerts, recentProjects, fleetUtilization } = data

  return (
    <AppLayout titleAr="لوحة القيادة">
      <PageHeader
        title="Dashboard"
        titleAr="لوحة القيادة"
        subtitle="Welcome back! Here's what's happening today."
        subtitleAr="مرحباً بعودتك! إليك ما يحدث اليوم."
        actions={headerActions}
        breadcrumbs={breadcrumbs}
      />

      <div className="space-y-6">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Revenue"
            titleAr="الإيرادات الكلية"
            value="12.5M"
            subtitle="ريال"
            change={stats.revenue.change}
            changeType={stats.revenue.changeType}
            icon={<DollarSign className="w-6 h-6" />}
            color="green"
          />
          <KpiCard
            title="Total Expenses"
            titleAr="المصاريف"
            value="8.7M"
            subtitle="ريال"
            change={stats.expenses.change}
            changeType={stats.expenses.changeType}
            icon={<TrendingDown className="w-6 h-6" />}
            color="red"
          />
          <KpiCard
            title="Active Projects"
            titleAr="المشاريع النشطة"
            value={`${stats.activeProjects}/${stats.totalProjects}`}
            subtitle="مشروع"
            icon={<Briefcase className="w-6 h-6" />}
            color="blue"
          />
          <KpiCard
            title="Workforce"
            titleAr="العدد الكلي للعمالة"
            value={`${stats.workforce.present}/${stats.workforce.total}`}
            subtitle="موظف حاضر"
            icon={<Users className="w-6 h-6" />}
            color="amber"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-cairo">الإيرادات الشهرية</h2>
                <p className="text-sm text-gray-500 font-cairo">آخر 12 شهر</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-cairo">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-[#2563eb]" />
                  الإيرادات
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(value: number) => [
                    `${(value / 1000000).toFixed(2)}M ريال`,
                    'الإيرادات',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Projects Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 font-cairo mb-2">المشاريع حسب الحالة</h2>
            <p className="text-sm text-gray-500 font-cairo mb-6">توزيع المشاريع النشطة</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={projectsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                  label={({ statusAr, count, percent }) => (
                    <text
                      x={0}
                      y={0}
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-sm font-cairo"
                    >
                      {`${statusAr}: ${count}`}
                    </text>
                  )}
                >
                  {projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2b4a',
                    borderRadius: '8px',
                    fontFamily: 'Cairo, sans-serif',
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    value,
                    props.payload.statusAr,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {projectsByStatus.map((item) => (
                <div key={item.status} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 font-cairo">{item.statusAr}</span>
                  <span className="text-sm font-medium text-gray-900 font-sans">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-gray-900 font-cairo">التنبيهات الحرجة</h2>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full font-cairo">
                {alerts.length} تنبيهات
              </span>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
            {alerts.length > 4 && (
              <button className="w-full mt-4 py-2 text-[#2563eb] text-sm font-medium font-cairo hover:bg-blue-50 rounded-lg transition-colors">
                عرض جميع التنبيهات
              </button>
            )}
          </div>
        )}

        {/* Recent Projects Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 font-cairo">أحدث المشاريع</h2>
            <button className="flex items-center gap-2 text-sm text-[#2563eb] font-medium font-cairo hover:underline">
              عرض الكل <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 font-cairo">
                    اسم المشروع
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 font-cairo">
                    الحالة
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 font-cairo">
                    التقدم
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 font-cairo">
                    المدير
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 font-cairo">
                    الميزانية
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900 font-cairo">{project.nameAr}</p>
                        <p className="text-sm text-gray-500 font-cairo">{project.locationAr}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge
                        status={project.status as any}
                        size="sm"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600 font-sans">{project.progress}%</span>
                        </div>
                        <ProgressBar progress={project.progress} />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-700 font-cairo">{project.managerAr}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-900 font-sans">
                        {(project.budget / 1000000).toFixed(1)}M ريال
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#2563eb]" />
              <h2 className="text-lg font-bold text-gray-900 font-cairo">استغلال الأسطول</h2>
            </div>
            <span className="text-sm text-gray-500 font-cairo">نسبة المعدات المستخدمة</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fleetUtilization.map((item) => (
              <FleetBar key={item.type} item={item} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
