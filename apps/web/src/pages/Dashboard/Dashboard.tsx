import { AppLayout } from '@/components/layout/AppLayout'
import { KpiCard } from '@/components/ui/KpiCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { Plus, Download, TrendingUp, Users, Wrench, DollarSign, FileText, Calendar } from 'lucide-react'

export function Dashboard() {
  const kpiData = [
    {
      title: 'Active Projects',
      titleAr: 'المشاريع النشطة',
      value: 12,
      unit: 'مشروع',
      change: 8,
      changeType: 'up',
      icon: '🏗️',
      color: 'blue' as const,
    },
    {
      title: 'Total Employees',
      titleAr: 'إجمالي الموظفين',
      value: 156,
      unit: 'موظف',
      change: 12,
      changeType: 'up',
      icon: '👷',
      color: 'green' as const,
    },
    {
      title: 'Equipment',
      titleAr: 'المعدات',
      value: 48,
      unit: 'معدة',
      change: -5,
      changeType: 'down',
      icon: '🚛',
      color: 'amber' as const,
    },
    {
      title: 'Revenue',
      titleAr: 'الإيرادات',
      value: 1250000,
      unit: 'ريال',
      change: 15,
      changeType: 'up',
      icon: '💰',
      color: 'green' as const,
    },
  ]

  const headerActions = [
    {
      label: 'Add Project',
      labelAr: 'إضافة مشروع',
      icon: <Plus className="w-4 h-4" />,
      variant: 'primary' as const,
      onClick: () => console.log('Add project clicked'),
    },
    {
      label: 'Export',
      labelAr: 'تصدير',
      icon: <Download className="w-4 h-4" />,
      variant: 'outline' as const,
      onClick: () => console.log('Export clicked'),
    },
  ]

  const breadcrumbs = [
    { label: 'Home', labelAr: 'الرئيسية', path: '/' },
    { label: 'Dashboard', labelAr: 'لوحة القيادة' },
  ]

  return (
    <AppLayout titleAr="لوحة القيادة">
      <PageHeader
        title="Dashboard"
        titleAr="لوحة القيادة"
        subtitle="Welcome to your ERP dashboard"
        subtitleAr="مرحباً بك في لوحة القيادة"
        actions={headerActions}
        breadcrumbs={breadcrumbs}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <KpiCard {...kpiData[0]} />
        <KpiCard {...kpiData[1]} />
        <KpiCard {...kpiData[2]} />
        <KpiCard {...kpiData[3]} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 font-cairo">آخر المشاريع</h2>
            <button className="text-[#2563eb] text-sm font-cairo hover:underline">عرض الكل</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 font-cairo">برج الرياض السكني</p>
                <p className="text-sm text-gray-500">الرياض، المملكة العربية السعودية</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full font-cairo">
                نشط
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 font-cairo">مجمع البرج</p>
                <p className="text-sm text-gray-500">جدة، المملكة العربية السعودية</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full font-cairo">
                قيد التنفيذ
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 font-cairo">التنبيهات</h2>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
              5 جديد
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 border-r-4 border-red-500 rounded-lg">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 font-cairo">إقامة الموظف أحمد تنتهي خلال 7 أيام</p>
                <p className="text-sm text-gray-600 mt-1">يجب تجديد الإقامة قبل 7 مارس 2024</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 border-r-4 border-amber-500 rounded-lg">
              <span className="text-xl">🔧</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 font-cairo">صيانة المعدة EQ-001 مستحقة</p>
                <p className="text-sm text-gray-600 mt-1">آخر صيانة: منذ 45 يوم</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 font-cairo">إحصائيات سريعة</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-cairo">إجمالي المشاريع</span>
              <span className="font-bold text-gray-900 font-sans">15</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-cairo">الموظفين النشطين</span>
              <span className="font-bold text-gray-900 font-sans">142</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-cairo">المعدات العاملة</span>
              <span className="font-bold text-gray-900 font-sans">45</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-cairo">الفعوات هذا الشهر</span>
              <span className="font-bold text-[#2563eb] font-sans">2.5M ريال</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
