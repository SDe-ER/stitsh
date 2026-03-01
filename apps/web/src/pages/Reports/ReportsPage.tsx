import { useState } from 'react'
import { useReports, useRunReport, useVATSummary } from '@/hooks/useReports'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { Button } from '@/components/ui/Button'
import type { ReportType } from '@/services/reports'

// ============================================================================
// REPORT TEMPLATES CONFIG (from Stitch)
// ============================================================================

const reportTemplates = [
  {
    type: 'PROJECT_PROFITABILITY' as ReportType,
    name: 'تقرير ربحية المشاريع',
    nameEn: 'Project Profitability Report',
    description: 'تحليل شامل للإيرادات والمصروفات لكل مشروع على حدة مع حساب هامش الربح الصافي.',
    descriptionEn: 'Comprehensive analysis of revenues and expenses for each project with net profit margin calculation.',
    icon: 'trending_up',
    color: 'blue',
    frequency: 'شهري',
    frequencyEn: 'Monthly',
    category: 'projects',
  },
  {
    type: 'EQUIPMENT_OPERATION' as ReportType,
    name: 'سجل تشغيل المعدة المالي',
    nameEn: 'Equipment Operation Log',
    description: 'تتبع تكاليف التشغيل والصيانة لكل معدة مقارنة بساعات العمل والإنتاجية.',
    descriptionEn: 'Track operating and maintenance costs for each equipment compared to work hours and productivity.',
    icon: 'construction',
    color: 'amber',
    frequency: 'يومي',
    frequencyEn: 'Daily',
    category: 'equipment',
  },
  {
    type: 'SUPPLIER_STATEMENT' as ReportType,
    name: 'كشف حساب الموردين',
    nameEn: 'Supplier Account Statement',
    description: 'تفاصيل المديونيات، الدفعات المستحقة، وتاريخ التعاملات مع الموردين.',
    descriptionEn: 'Details of outstanding balances, due payments, and transaction history with suppliers.',
    icon: 'inventory_2',
    color: 'purple',
    frequency: 'ربع سنوي',
    frequencyEn: 'Quarterly',
    category: 'financial',
  },
  {
    type: 'LABOR_COSTS' as ReportType,
    name: 'تقرير تكاليف العمالة',
    nameEn: 'Labor Cost Report',
    description: 'تحليل رواتب، إضافي، وبدلات العمالة موزعة حسب المشاريع والأقسام.',
    descriptionEn: 'Analysis of salaries, overtime, and allowances distributed by projects and departments.',
    icon: 'group',
    color: 'indigo',
    frequency: 'شهري',
    frequencyEn: 'Monthly',
    category: 'payroll',
  },
  {
    type: 'FUEL_CONSUMPTION' as ReportType,
    name: 'استهلاك الوقود والمحروقات',
    nameEn: 'Fuel and Fuel Consumption',
    description: 'مراقبة دقيقة لاستهلاك الديزل للمعدات والشاحنات وكشف التجاوزات.',
    descriptionEn: 'Monitor diesel consumption for equipment and trucks and detect violations.',
    icon: 'gas_meter',
    color: 'teal',
    frequency: 'أسبوعي',
    frequencyEn: 'Weekly',
    category: 'equipment',
  },
  {
    type: 'DOCUMENT_EXPIRY' as ReportType,
    name: 'سجل الحوادث والمخالفات',
    nameEn: 'Accident & Violation Log',
    description: 'توثيق الحوادث الموقعية ومخالفات السلامة مع التكاليف المترتبة عليها.',
    descriptionEn: 'Document site accidents and safety violations with associated costs.',
    icon: 'warning',
    color: 'orange',
    frequency: 'فوري',
    frequencyEn: 'Instant',
    category: 'documents',
  },
]

// ============================================================================
// REPORT CATEGORIES
// ============================================================================

const reportCategories = [
  { value: '', label: 'التقارير المالية', labelEn: 'Financial Reports' },
  { value: 'projects', label: 'تقارير المشاريع', labelEn: 'Project Reports' },
  { value: 'equipment', label: 'سجلات المعدات', labelEn: 'Equipment Logs' },
  { value: 'payroll', label: 'شؤون الموظفين', labelEn: 'HR Reports' },
  { value: 'documents', label: 'كشف الموردين', labelEn: 'Supplier Reports' },
]

const periodOptions = [
  { value: 'month', label: 'الربع الحالي (Q3 2023)', labelEn: 'Current Quarter (Q3 2023)' },
  { value: 'today', label: 'الشهر الحالي', labelEn: 'Current Month' },
  { value: 'year', label: 'السنة الحالية', labelEn: 'Current Year' },
  { value: 'custom', label: 'فترة مخصصة', labelEn: 'Custom Period' },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReportsPage() {
  const { data: reports } = useReports()
  const { data: vatSummary } = useVATSummary()
  const runReport = useRunReport()

  const [filters, setFilters] = useState({
    category: '',
    target: '',
    period: 'month',
  })

  const handleRunReport = (reportType: ReportType) => {
    runReport.mutate({
      reportType,
      period: filters.period as any,
    })
  }

  const handleApplyFilters = () => {
    // Apply filters logic here
    console.log('Applying filters:', filters)
  }

  const handleResetFilters = () => {
    setFilters({
      category: '',
      target: '',
      period: 'month',
    })
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800">مركز التقارير الذكي</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-primary transition-colors relative">
              <MaterialSymbol icon="notifications" className="text-xl" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <Button variant="primary" className="flex items-center gap-2">
              <MaterialSymbol icon="download" className="text-xl" />
              تصدير شامل
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Report Type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">نوع التقرير</label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 border border-slate-300 text-slate-700 rounded-lg py-2.5 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                {reportCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <MaterialSymbol icon="expand_more" className="text-xl" />
              </span>
            </div>
          </div>

          {/* Target */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">تحديد الهدف</label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 border border-slate-300 text-slate-700 rounded-lg py-2.5 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                value={filters.target}
                onChange={(e) => setFilters({ ...filters, target: e.target.value })}
              >
                <option value="">الكل</option>
                <option value="project-1">مشروع نيوم - ذا لاين</option>
                <option value="project-2">مشروع مترو الرياض</option>
                <option value="warehouse">المستودع المركزي</option>
              </select>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <MaterialSymbol icon="expand_more" className="text-xl" />
              </span>
            </div>
          </div>

          {/* Time Period */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">الفترة الزمنية</label>
            <div className="relative">
              <div className="flex items-center w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary">
                <span className="material-symbols-outlined text-slate-500 ml-2">calendar_month</span>
                <select
                  className="w-full bg-transparent border-none p-0 text-slate-700 focus:ring-0 appearance-none"
                  value={filters.period}
                  onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                >
                  {periodOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 bg-slate-800 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
            >
              <MaterialSymbol icon="filter_list" className="text-xl" />
              تطبيق
            </button>
            <button
              onClick={handleResetFilters}
              className="bg-white border border-slate-300 text-slate-600 py-2.5 px-4 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              <MaterialSymbol icon="restart_alt" className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* VAT Summary Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MaterialSymbol icon="receipt_long" className="text-primary" />
            ملخص ضريبة القيمة المضافة (VAT)
          </h3>
          <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold border border-green-200">
            متوافق مع ZATCA
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Purchases Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <p className="text-slate-500 text-sm font-medium mb-1">إجمالي المشتريات الخاضعة للضريبة</p>
              <p className="text-2xl font-bold text-slate-700">
                {vatSummary ? `${vatSummary.totalPurchases.toLocaleString('en-US')} ر.س` : '0 ر.س'}
              </p>
              <div className="mt-4 flex items-center text-xs text-slate-500">
                <span className="text-emerald-600 font-bold ml-1">+12%</span>
                عن الربع السابق
              </div>
            </div>
            <div className="absolute top-6 left-6 text-blue-100">
              <MaterialSymbol icon="shopping_cart" className="text-5xl" />
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-purple-50 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <p className="text-slate-500 text-sm font-medium mb-1">إجمالي الإيرادات الخاضعة للضريبة</p>
              <p className="text-2xl font-bold text-slate-700">
                {vatSummary ? `${vatSummary.totalRevenue.toLocaleString('en-US')} ر.س` : '0 ر.س'}
              </p>
              <div className="mt-4 flex items-center text-xs text-slate-500">
                <span className="text-emerald-600 font-bold ml-1">+5%</span>
                عن الربع السابق
              </div>
            </div>
            <div className="absolute top-6 left-6 text-purple-100">
              <MaterialSymbol icon="payments" className="text-5xl" />
            </div>
          </div>

          {/* Net Tax Due Card */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden group text-white">
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/5 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <p className="text-slate-300 text-sm font-medium mb-1">صافي الضريبة المستحقة</p>
              <p className="text-3xl font-bold text-white mb-1">
                {vatSummary ? `${vatSummary.netTaxDue.toLocaleString('en-US')} ر.س` : '0 ر.س'}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button className="text-xs bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg transition-colors">
                  سداد الآن
                </button>
                <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                  تنزيل الإقرار
                </button>
              </div>
            </div>
            <div className="absolute top-6 left-6 text-white/10">
              <MaterialSymbol icon="account_balance" className="text-5xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Templates Grid */}
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <MaterialSymbol icon="grid_view" className="text-primary" />
        قوالب التقارير الجاهزة
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTemplates.map((template) => (
          <div
            key={template.type}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${template.color}-50 text-${template.color}-600 flex items-center justify-center`}>
                <MaterialSymbol icon={template.icon} className="text-2xl" />
              </div>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium">
                {template.frequency}
              </span>
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-2">{template.name}</h4>
            <p className="text-slate-500 text-sm mb-6 flex-1">{template.description}</p>
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                  title="تصدير PDF"
                  onClick={() => handleRunReport(template.type)}
                >
                  <MaterialSymbol icon="picture_as_pdf" className="text-[18px]" />
                </button>
                <button
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
                  title="تصدير Excel"
                  onClick={() => handleRunReport(template.type)}
                >
                  <MaterialSymbol icon="table_view" className="text-[18px]" />
                </button>
                <button
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-colors"
                  title="مشاركة واتساب"
                >
                  <MaterialSymbol icon="chat" className="text-[18px]" />
                </button>
              </div>
              <button
                className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1"
                onClick={() => handleRunReport(template.type)}
              >
                عرض
                <span className="rtl:rotate-180">
                  <MaterialSymbol icon="arrow_forward" className="text-[16px]" />
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
