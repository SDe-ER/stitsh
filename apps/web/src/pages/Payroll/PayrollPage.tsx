import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { useEmployees, useSalaries, useUpdateSalaryPayment } from '@/hooks/useEmployees'
import { formatNumber } from '@/utils/format'
import {
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  Send,
  AlertCircle,
} from 'lucide-react'

const months = [
  { value: '01', labelAr: 'يناير', labelEn: 'January' },
  { value: '02', labelAr: 'فبراير', labelEn: 'February' },
  { value: '03', labelAr: 'مارس', labelEn: 'March' },
  { value: '04', labelAr: 'أبريل', labelEn: 'April' },
  { value: '05', labelAr: 'مايو', labelEn: 'May' },
  { value: '06', labelAr: 'يونيو', labelEn: 'June' },
  { value: '07', labelAr: 'يوليو', labelEn: 'July' },
  { value: '08', labelAr: 'أغسطس', labelEn: 'August' },
  { value: '09', labelAr: 'سبتمبر', labelEn: 'September' },
  { value: '10', labelAr: 'أكتوبر', labelEn: 'October' },
  { value: '11', labelAr: 'نوفمبر', labelEn: 'November' },
  { value: '12', labelAr: 'ديسمبر', labelEn: 'December' },
]

const currentYear = new Date().getFullYear()
const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0')

const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const { data: employees = [] } = useEmployees({ status: 'active' })
  const { data: salaries = [] } = useSalaries(
    `${selectedYear}-${selectedMonth}`,
    selectedYear
  )
  const updatePaymentMutation = useUpdateSalaryPayment()

  // Create salary records for employees who don't have one for this month
  const payrollData = employees.map((emp) => {
    const existingSalary = salaries.find(s => s.employeeId === emp.id)
    return {
      employee: emp,
      basicSalary: emp.salary,
      allowances: 0,
      deductions: 0,
      netSalary: emp.salary,
      paymentStatus: existingSalary?.paymentStatus || 'pending',
      paymentDate: existingSalary?.paymentDate || '',
      salaryRecordId: existingSalary?.id,
    }
  })

  const totalBasicSalary = payrollData.reduce((sum, item) => sum + item.basicSalary, 0)
  const totalAllowances = payrollData.reduce((sum, item) => sum + item.allowances, 0)
  const totalDeductions = payrollData.reduce((sum, item) => sum + item.deductions, 0)
  const totalNetSalary = payrollData.reduce((sum, item) => sum + item.netSalary, 0)
  const paidCount = payrollData.filter(item => item.paymentStatus === 'paid').length
  const pendingCount = payrollData.filter(item => item.paymentStatus === 'pending').length

  const handleSendPayment = (salaryId: string) => {
    updatePaymentMutation.mutate({
      salaryId,
      paymentStatus: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
    })
  }

  const handleSendAllPayments = () => {
    const pendingItems = payrollData.filter(item => item.paymentStatus === 'pending')
    pendingItems.forEach((item, index) => {
      setTimeout(() => {
        if (item.salaryRecordId) {
          handleSendPayment(item.salaryRecordId)
        }
      }, index * 100)
    })
  }

  return (
    <AppLayout titleAr="الرواتب">
      <PageHeader
        title="Payroll"
        titleAr="الرواتب"
        subtitle="Salary Management"
        subtitleAr="إدارة الرواتب"
        breadcrumbs={[
          { label: 'Home', labelAr: 'ال الرئيسية', path: '/' },
          { label: 'HR', labelAr: 'الموارد البشرية', path: '/hr' },
          { label: 'Payroll', labelAr: 'الرواتب' },
        ]}
      />

      {/* Month/Year Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 font-cairo">الفترة:</span>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.labelAr} {selectedYear}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-cairo">عدد الموظفين</p>
              <p className="text-2xl font-bold text-blue-700 font-sans">{payrollData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gray-50 text-gray-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-cairo">الأساسي</p>
              <p className="text-xl font-bold text-gray-900 font-sans">{formatNumber(totalBasicSalary)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-cairo">الإضافي</p>
              <p className="text-xl font-bold text-green-700 font-sans">{formatNumber(totalAllowances)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
              <TrendingUp className="w-5 h-5 rotate-180" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-cairo">الخصومات</p>
              <p className="text-xl font-bold text-red-700 font-sans">{formatNumber(totalDeductions)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-cairo">الصافي</p>
              <p className="text-xl font-bold text-purple-700 font-sans">{formatNumber(totalNetSalary)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="flex gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex-1">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-cairo">تم الدفع</p>
              <p className="text-xl font-bold text-green-700 font-sans">{paidCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex-1">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm text-amber-600 font-cairo">قيد الانتظار</p>
              <p className="text-xl font-bold text-amber-700 font-sans">{pendingCount}</p>
            </div>
          </div>
        </div>

        {pendingCount > 0 && (
          <Button
            variant="primary"
            onClick={handleSendAllPayments}
            className="flex-1 font-cairo"
          >
            <Send className="w-4 h-4 ml-2" />
            إرسال الرواتب
          </Button>
        )}
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الموظف</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الراتب الأساسي</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الإضافي</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الخصومات</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الصافي</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">تاريخ الدفع</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الحالة</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payrollData.map((item) => {
                const statusConfig = {
                  paid: { label: 'مدفوع', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
                  pending: { label: 'معلق', color: 'bg-amber-100 text-amber-700', icon: Clock },
                  partial: { label: 'جزئي', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
                }[item.paymentStatus]

                const StatusIcon = statusConfig.icon

                return (
                  <tr key={item.employee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 font-cairo">{item.employee.nameAr}</p>
                      <p className="text-xs text-gray-500 font-sans">{item.employee.name}</p>
                      <p className="text-xs text-gray-400 font-sans">{item.employee.employeeNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-sans">{formatNumber(item.basicSalary)}</td>
                    <td className="px-4 py-3 text-sm font-sans text-green-600">{formatNumber(item.allowances)}</td>
                    <td className="px-4 py-3 text-sm font-sans text-red-600">{formatNumber(item.deductions)}</td>
                    <td className="px-4 py-3 text-sm font-bold font-sans">{formatNumber(item.netSalary)}</td>
                    <td className="px-4 py-3 text-sm font-cairo">
                      {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full font-cairo ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.paymentStatus === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (item.salaryRecordId) {
                              handleSendPayment(item.salaryRecordId)
                            }
                          }}
                          disabled={updatePaymentMutation.isPending}
                          className="font-cairo text-xs"
                        >
                          <Send className="w-3 h-3 ml-1" />
                          إرسال
                        </Button>
                      )}
                      {item.paymentStatus === 'paid' && (
                        <span className="text-xs text-green-600 font-cairo flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تم الدفع
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Footer */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900 font-cairo">الإجمالي الرواتب</div>
          <div className="text-2xl font-bold text-purple-700 font-sans">
            {formatNumber(totalNetSalary)} ريال
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
