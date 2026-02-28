import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import {
  useExpenses,
  useDeleteExpense,
  expenseCategoryLabels,
  type ExpenseCategory,
  type FinanceFilters,
} from '@/hooks/useFinance'
import { formatNumber } from '@/utils/format'
import { Plus, Trash2, Receipt } from 'lucide-react'

export default function ExpensesPage() {
  const [filters, setFilters] = useState<FinanceFilters>({})
  const { data: expenses = [], isLoading } = useExpenses(filters)
  const deleteMutation = useDeleteExpense()

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      deleteMutation.mutate(id)
    }
  }

  // Calculate summary
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const thisMonthExpenses = expenses
    .filter((exp) => exp.date.startsWith('2024-12'))
    .reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <AppLayout titleAr="المصاريف">
      <PageHeader
        title="Expenses"
        titleAr="المصاريف"
        subtitle="Track and manage all expenses"
        subtitleAr="تتبع وإدارة جميع المصاريف"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'Finance', labelAr: 'المالية', path: '/finance' },
          { label: 'Expenses', labelAr: 'المصاريف' },
        ]}
        actions={[
          {
            label: 'New Expense',
            labelAr: 'مصروف جديد',
            icon: <Plus className="w-4 h-4" />,
            variant: 'primary' as const,
            onClick: () => console.log('Create expense'),
          },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Receipt className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-cairo">إجمالي المصاريف</p>
              <p className="text-2xl font-bold text-red-700 font-sans">
                {formatNumber(totalExpenses)} ريال
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Receipt className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-cairo">مصاريف هذا الشهر</p>
              <p className="text-2xl font-bold text-amber-700 font-sans">
                {formatNumber(thisMonthExpenses)} ريال
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 font-cairo">الفئة:</span>
            <select
              value={filters.category || 'all'}
              onChange={(e) => setFilters({
                ...filters,
                category: e.target.value === 'all' ? undefined : e.target.value as ExpenseCategory
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            >
              <option value="all">الكل</option>
              {Object.entries(expenseCategoryLabels).map(([key, { labelAr }]) => (
                <option key={key} value={key}>{labelAr}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 font-cairo">من:</span>
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

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 font-cairo">إلى:</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({
                ...filters,
                endDate: e.target.value || undefined
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            />
          </div>

          {(filters.category || filters.startDate || filters.endDate) && (
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

      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2 font-cairo">جاري التحميل...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-700 font-cairo mb-2">لا توجد مصاريف</p>
            <p className="text-sm text-gray-500 font-cairo">ابدأ بتسجيل أول مصروف</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">التاريخ</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الفئة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الوصف</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المبلغ</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المشروع</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">طريقة الدفع</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المعتمد من</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-cairo">
                      {new Date(expense.date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{expenseCategoryLabels[expense.category].icon}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo bg-gray-100 text-gray-700`}>
                          {expense.categoryAr}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 font-cairo">{expense.descriptionAr}</p>
                      {expense.receiptNumber && (
                        <p className="text-xs text-gray-500 font-sans">رقم الإيصال: {expense.receiptNumber}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-sans font-bold text-red-600">
                      {formatNumber(expense.amount)} ريال
                    </td>
                    <td className="px-4 py-3">
                      {expense.projectNameAr ? (
                        <div>
                          <p className="text-sm text-gray-900 font-cairo">{expense.projectNameAr}</p>
                          <p className="text-xs text-gray-500 font-sans">{expense.projectCode}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 font-cairo">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${
                        expense.paymentMethod === 'cash'
                          ? 'bg-green-100 text-green-700'
                          : expense.paymentMethod === 'bank'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {expense.paymentMethodAr}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-cairo">{expense.approvedByAr}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                          onClick={() => handleDelete(expense.id)}
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
    </AppLayout>
  )
}
