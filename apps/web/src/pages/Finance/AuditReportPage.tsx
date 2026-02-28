import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import {
  useAuditTransactions,
  useProfitLossSummary,
  type FinanceFilters,
} from '@/hooks/useFinance'
import { formatNumber } from '@/utils/format'
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
} from 'lucide-react'

export default function AuditReportPage() {
  const [filters, setFilters] = useState<FinanceFilters>({})
  const { data: transactions = [], isLoading: loadingTransactions } = useAuditTransactions(filters)
  const { data: plSummary, isLoading: loadingPL } = useProfitLossSummary(filters)

  const handleExportPDF = () => {
    window.print()
  }

  // Group transactions by date
  const groupedTransactions: Record<string, typeof transactions> = {}
  transactions.forEach((t) => {
    if (!groupedTransactions[t.date]) {
      groupedTransactions[t.date] = []
    }
    groupedTransactions[t.date].push(t)
  })

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <AppLayout titleAr="تقرير التدقيق">
      <PageHeader
        title="Audit Report"
        titleAr="تقرير التدقيق"
        subtitle="Detailed financial audit and P&L summary"
        subtitleAr="تقرير تدقيق مالي مفصل وملخص الأرباح والخسائر"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'Finance', labelAr: 'المالية', path: '/finance' },
          { label: 'Audit', labelAr: 'التدقيق' },
        ]}
        actions={[
          {
            label: 'Export PDF',
            labelAr: 'تصدير PDF',
            icon: <Download className="w-4 h-4" />,
            variant: 'outline' as const,
            onClick: handleExportPDF,
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

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({
                ...filters,
                startDate: e.target.value || undefined
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            />
          </div>

          <span className="text-gray-400">-</span>

          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({
              ...filters,
              endDate: e.target.value || undefined
            })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          />

          {(filters.startDate || filters.endDate) && (
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

      {/* Profit & Loss Summary */}
      {!loadingPL && plSummary && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 font-cairo mb-6">ملخص الأرباح والخسائر</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 font-cairo">الإيرادات</h3>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-cairo">إجمالي الإيرادات</span>
                  <span className="text-lg font-bold text-green-700 font-sans">
                    {formatNumber(plSummary.totalRevenue)} ريال
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Costs */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 font-cairo">التكاليف المباشرة</h3>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-cairo">إجمالي التكاليف المباشرة</span>
                  <span className="text-lg font-bold text-red-700 font-sans">
                    {formatNumber(plSummary.directCosts)} ريال
                  </span>
                </div>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 font-cairo">الربح الإجمالي</h3>
              <div className={`rounded-lg p-4 ${plSummary.grossProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-700 font-cairo">الربح الإجمالي</span>
                  <span className={`text-lg font-bold font-sans ${
                    plSummary.grossProfit >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {formatNumber(plSummary.grossProfit)} ريال
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-cairo">نسبة هامش الربح</span>
                  <span className={`text-sm font-bold font-sans ${
                    plSummary.grossMargin >= 20 ? 'text-green-600' : plSummary.grossMargin >= 10 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {plSummary.grossMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 font-cairo">المصاريف التشغيلية</h3>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-cairo">إجمالي المصاريف التشغيلية</span>
                  <span className="text-lg font-bold text-amber-700 font-sans">
                    {formatNumber(plSummary.operatingExpenses)} ريال
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Profit - Full Width */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className={`rounded-xl p-6 ${plSummary.netProfit >= 0 ? 'bg-gradient-to-r from-green-50 to-green-100' : 'bg-gradient-to-r from-red-50 to-red-100'}`}>
              <div className="flex items-center justify-center gap-4">
                {plSummary.netProfit >= 0 ? (
                  <TrendingUp className="w-12 h-12 text-green-600" />
                ) : (
                  <TrendingDown className="w-12 h-12 text-red-600" />
                )}
                <div className="text-center">
                  <p className="text-lg text-gray-700 font-cairo mb-1">صافي الربح</p>
                  <p className={`text-4xl font-bold font-sans ${
                    plSummary.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {formatNumber(plSummary.netProfit)} ريال
                  </p>
                  <p className={`text-sm font-bold font-cairo mt-1 ${
                    plSummary.netMargin >= 15 ? 'text-green-600' : plSummary.netMargin >= 5 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    هامش الربح: {plSummary.netMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 font-cairo mb-4">سجل الحركات المفصل</h2>

        {loadingTransactions ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2 font-cairo">جاري التحميل...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-700 font-cairo mb-2">لا توجد حركات</p>
            <p className="text-sm text-gray-500 font-cairo">لا توجد حركات مالية في الفترة المحددة</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-[#2563eb] rounded-full"></div>
                  <h3 className="font-semibold text-gray-800 font-cairo">
                    {new Date(date).toLocaleDateString('ar-SA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 font-cairo">النوع</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 font-cairo">الوصف</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 font-cairo">الفئة</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 font-cairo">المشروع</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 font-cairo">المرجع</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 font-cairo">المبلغ</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 font-cairo">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {groupedTransactions[date].map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${
                              transaction.type === 'invoice'
                                ? 'bg-green-100 text-green-700'
                                : transaction.type === 'expense'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {transaction.typeAr}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-900 font-cairo">{transaction.descriptionAr}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600 font-cairo">{transaction.categoryAr}</span>
                          </td>
                          <td className="px-4 py-3">
                            {transaction.projectNameAr ? (
                              <span className="text-sm text-gray-700 font-cairo">{transaction.projectNameAr}</span>
                            ) : (
                              <span className="text-sm text-gray-400 font-cairo">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-500 font-sans">{transaction.reference}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold font-sans ${
                              transaction.type === 'invoice'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {transaction.type === 'invoice' ? '+' : '-'}
                              {formatNumber(transaction.amount)} ريال
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs font-medium rounded-full font-cairo bg-gray-100 text-gray-700">
                              {transaction.statusAr}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
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
