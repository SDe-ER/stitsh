import { Link } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import {
  useFinancialSummary,
  useMonthlyData,
  useExpensesByCategory,
  useInvoices,
  invoiceStatusLabels,
} from '@/hooks/useFinance'
import { formatNumber } from '@/utils/format'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  FileText,
  ArrowLeft,
  Receipt,
  PieChart as PieChartIcon,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function FinanceOverviewPage() {
  const { data: summary, isLoading } = useFinancialSummary()
  const { data: monthlyData = [] } = useMonthlyData()
  const { data: expensesByCategory = [] } = useExpensesByCategory()
  const { data: invoices = [] } = useInvoices()

  const recentInvoices = invoices.slice(0, 10)

  if (isLoading) {
    return (
      <AppLayout titleAr="المالية">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full"></div>
        </div>
      </AppLayout>
    )
  }

  const totalRevenue = summary?.totalRevenue || 0
  const totalExpenses = summary?.totalExpenses || 0
  const netProfit = summary?.netProfit || 0
  const profitMargin = summary?.profitMargin || 0

  const kpis = [
    {
      label: 'إجمالي الإيرادات',
      value: formatNumber(totalRevenue),
      unit: 'ريال',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'green',
      trend: '+12%',
    },
    {
      label: 'إجمالي المصاريف',
      value: formatNumber(totalExpenses),
      unit: 'ريال',
      icon: <TrendingDown className="w-6 h-6" />,
      color: 'red',
      trend: '+8%',
    },
    {
      label: 'صافي الأرباح',
      value: formatNumber(netProfit),
      unit: 'ريال',
      icon: <DollarSign className="w-6 h-6" />,
      color: netProfit >= 0 ? 'green' : 'red',
      trend: '+15%',
    },
    {
      label: 'نسبة الربح',
      value: profitMargin.toFixed(1),
      unit: '%',
      icon: <PieChartIcon className="w-6 h-6" />,
      color: profitMargin >= 20 ? 'green' : profitMargin >= 10 ? 'amber' : 'red',
      trend: '+2%',
    },
  ]

  const colorMap: Record<string, string> = {
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
  }

  const areaColors = {
    revenue: '#16a34a',
    expenses: '#dc2626',
  }

  return (
    <AppLayout titleAr="المالية">
      <PageHeader
        title="Financial Overview"
        titleAr="نظرة عامة على المالية"
        subtitle="Track your financial performance"
        subtitleAr="تتبع الأداء المالي"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'Finance', labelAr: 'المالية' },
        ]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-lg ${colorMap[kpi.color]}`}>
                {kpi.icon}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                kpi.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-cairo mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900 font-sans">
              {kpi.value} <span className="text-sm font-normal text-gray-500">{kpi.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(summary?.pendingPayments || 0) > 0 || (summary?.overduePayments || 0) > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {(summary?.pendingPayments || 0) > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Receipt className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 font-cairo">مدفوعات معلقة</p>
                  <p className="text-lg font-bold text-amber-900 font-sans">
                    {formatNumber(summary.pendingPayments)} ريال
                  </p>
                </div>
              </div>
            </div>
          )}
          {(summary?.overduePayments || 0) > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 font-cairo">مدفوعات متأخرة</p>
                  <p className="text-lg font-bold text-red-900 font-sans">
                    {formatNumber(summary.overduePayments)} ريال
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue vs Expenses Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 font-cairo mb-4">الإيرادات مقابل المصاريف</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={areaColors.revenue} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={areaColors.revenue} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={areaColors.expenses} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={areaColors.expenses} stopOpacity={0}/>
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
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tick={{ fontFamily: 'Inter, sans-serif' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2b4a',
                  borderRadius: '8px',
                  fontFamily: 'Cairo, sans-serif',
                }}
                formatter={(value: number) => [`${formatNumber(value)} ريال`, '']}
                labelFormatter={(label) => label}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ fontFamily: 'Cairo, sans-serif' }}>
                    {value === 'revenue' ? 'الإيرادات' : 'المصاريف'}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={areaColors.revenue}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="revenue"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke={areaColors.expenses}
                fillOpacity={1}
                fill="url(#colorExpenses)"
                name="expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by Category Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 font-cairo mb-4">توزيع المصاريف</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2b4a',
                  borderRadius: '8px',
                  fontFamily: 'Cairo, sans-serif',
                }}
                formatter={(value: number) => [`${formatNumber(value)} ريال`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {expensesByCategory.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-cairo text-gray-700">{item.categoryAr}</span>
                </div>
                <span className="font-sans font-medium text-gray-900">
                  {formatNumber(item.amount)} ريال
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 font-cairo">أحدث الفواتير</h3>
          <Link to="/finance/invoices">
            <Button variant="outline" size="sm" className="font-cairo">
              عرض الكل
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">رقم الفاتورة</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">العميل</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المشروع</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المبلغ</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">تاريخ الاستحقاق</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-sans font-medium">{invoice.invoiceNumber}</td>
                  <td className="px-4 py-3 text-sm font-cairo">{invoice.clientNameAr}</td>
                  <td className="px-4 py-3 text-sm font-cairo">{invoice.projectNameAr}</td>
                  <td className="px-4 py-3 text-sm font-sans font-medium">
                    {formatNumber(invoice.totalAmount)} ريال
                  </td>
                  <td className="px-4 py-3 text-sm font-cairo">
                    {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${
                      invoice.status === 'overdue'
                        ? 'bg-red-100 text-red-700'
                        : invoiceStatusLabels[invoice.status].color
                    }`}>
                      {invoice.statusAr}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
