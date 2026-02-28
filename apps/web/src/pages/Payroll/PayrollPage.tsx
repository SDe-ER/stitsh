import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import {
  useEmployees,
  useSalaries,
  useUpdateSalaryPayment,
  useCreateSalary,
  useUpdateSalary,
  useDeleteSalary,
  paymentMethodLabels,
  type PaymentMethod,
  type SalaryRecord,
} from '@/hooks/useEmployees'
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
  Edit,
  Trash2,
  X,
  Download,
  Plus,
  Printer,
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

interface PayrollItem {
  employee: any
  basicSalary: number
  allowances: number
  deductions: number
  absences: number
  netSalary: number
  paymentStatus: 'pending' | 'paid' | 'partial'
  paymentDate?: string
  paymentMethod?: PaymentMethod
  salaryRecordId?: string
  notes?: string
}

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSalary, setEditingSalary] = useState<PayrollItem | null>(null)

  const { data: employees = [] } = useEmployees({ status: 'active' })
  const { data: salaries = [] } = useSalaries(
    `${selectedYear}-${selectedMonth}`,
    selectedYear
  )
  const updatePaymentMutation = useUpdateSalaryPayment()
  const createSalaryMutation = useCreateSalary()
  const updateSalaryMutation = useUpdateSalary()
  const deleteSalaryMutation = useDeleteSalary()

  // Create salary records for employees who don't have one for this month
  const payrollData: PayrollItem[] = employees.map((emp) => {
    const existingSalary = salaries.find((s) => s.employeeId === emp.id)
    return {
      employee: emp,
      basicSalary: emp.salary,
      allowances: existingSalary?.allowances || 0,
      deductions: existingSalary?.deductions || 0,
      absences: existingSalary?.absences || 0,
      netSalary: existingSalary?.netSalary || emp.salary,
      paymentStatus: existingSalary?.paymentStatus || 'pending',
      paymentDate: existingSalary?.paymentDate || '',
      paymentMethod: existingSalary?.paymentMethod,
      salaryRecordId: existingSalary?.id,
      notes: existingSalary?.notes,
    }
  })

  const totalBasicSalary = payrollData.reduce((sum, item) => sum + item.basicSalary, 0)
  const totalAllowances = payrollData.reduce((sum, item) => sum + item.allowances, 0)
  const totalDeductions = payrollData.reduce((sum, item) => sum + item.deductions, 0)
  const totalNetSalary = payrollData.reduce((sum, item) => sum + item.netSalary, 0)
  const paidCount = payrollData.filter((item) => item.paymentStatus === 'paid').length
  const pendingCount = payrollData.filter((item) => item.paymentStatus === 'pending').length

  const handleSendPayment = (salaryId: string) => {
    updatePaymentMutation.mutate({
      salaryId,
      paymentStatus: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
    })
  }

  const handleSendAllPayments = () => {
    const pendingItems = payrollData.filter((item) => item.paymentStatus === 'pending')
    pendingItems.forEach((item, index) => {
      setTimeout(() => {
        if (item.salaryRecordId) {
          handleSendPayment(item.salaryRecordId)
        }
      }, index * 100)
    })
  }

  const handleEdit = (item: PayrollItem) => {
    setEditingSalary(item)
    setIsModalOpen(true)
  }

  const handleSaveSalary = (data: {
    allowances: number
    deductions: number
    absences: number
    paymentMethod: PaymentMethod
    notes: string
  }) => {
    if (!editingSalary) return

    const netSalary =
      editingSalary.basicSalary +
      data.allowances -
      data.deductions -
      (data.absences * editingSalary.basicSalary) / 30

    if (editingSalary.salaryRecordId) {
      // Update existing salary record
      updateSalaryMutation.mutate({
        salaryId: editingSalary.salaryRecordId,
        data: {
          allowances: data.allowances,
          deductions: data.deductions,
          absences: data.absences,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          netSalary,
        },
      })
    } else {
      // Create new salary record
      createSalaryMutation.mutate({
        employeeId: editingSalary.employee.id,
        month: `${selectedYear}-${selectedMonth}`,
        year: selectedYear,
        basicSalary: editingSalary.basicSalary,
        allowances: data.allowances,
        deductions: data.deductions,
        absences: data.absences,
        netSalary,
        paymentStatus: 'pending',
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      })
    }
    setIsModalOpen(false)
    setEditingSalary(null)
  }

  const handleDelete = (salaryId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      deleteSalaryMutation.mutate(salaryId)
    }
  }

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const monthName = months.find((m) => m.value === selectedMonth)?.labelAr

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>كشف الرواتب - ${monthName} ${selectedYear}</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: right; border: 1px solid #ddd; }
          th { background: #f5f5f5; font-weight: bold; }
          .total { margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px; }
          .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HeavyOps ERP</h1>
          <p>نظام إدارة المشاريع</p>
          <h2>كشف الرواتب - ${monthName} ${selectedYear}</h2>
          <p>تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>الموظف</th>
              <th>الراتب الأساسي</th>
              <th>الإضافي</th>
              <th>الخصومات</th>
              <th>الصافي</th>
              <th>طريقة الدفع</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${payrollData
              .map(
                (item) => `
              <tr>
                <td>${item.employee.nameAr}<br><small>${item.employee.name}</small></td>
                <td>${formatNumber(item.basicSalary)}</td>
                <td style="color: green;">${formatNumber(item.allowances)}</td>
                <td style="color: red;">${formatNumber(item.deductions)}</td>
                <td><strong>${formatNumber(item.netSalary)}</strong></td>
                <td>${item.paymentMethod ? paymentMethodLabels[item.paymentMethod].labelAr : '-'}</td>
                <td>${item.paymentStatus === 'paid' ? '✅ مدفوع' : '⏳ معلق'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="total">
          <div class="total-row">
            <span>الإجمالي:</span>
            <span>${formatNumber(totalNetSalary)} ريال</span>
          </div>
        </div>
        <div class="footer">
          <p>تم إنشاء هذا الكشف بواسطة HeavyOps ERP</p>
          <p>© ${new Date().getFullYear()} HeavyOps. جميع الحقوق محفوظة.</p>
        </div>
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; cursor: pointer;">طباعة</button>
          <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; cursor: pointer; margin-right: 10px;">إغلاق</button>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <AppLayout titleAr="الرواتب">
      <PageHeader
        title="Payroll"
        titleAr="الرواتب"
        subtitle="Salary Management"
        subtitleAr="إدارة الرواتب"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'HR', labelAr: 'الموارد البشرية', path: '/hr' },
          { label: 'Payroll', labelAr: 'الرواتب' },
        ]}
        actions={[
          {
            label: 'Export PDF',
            labelAr: 'تصدير PDF',
            icon: <Download className="w-4 h-4" />,
            variant: 'outline' as const,
            onClick: handleExportPDF,
          },
          {
            label: 'Print',
            labelAr: 'طباعة',
            icon: <Printer className="w-4 h-4" />,
            variant: 'outline' as const,
            onClick: () => window.print(),
          },
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
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الغيابات</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الصافي</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">طريقة الدفع</th>
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
                    <td className="px-4 py-3 text-sm font-sans text-amber-600">{item.absences} يوم</td>
                    <td className="px-4 py-3 text-sm font-bold font-sans">{formatNumber(item.netSalary)}</td>
                    <td className="px-4 py-3">
                      {item.paymentMethod ? (
                        <span className="text-sm font-cairo">
                          {paymentMethodLabels[item.paymentMethod].icon} {paymentMethodLabels[item.paymentMethod].labelAr}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 font-cairo">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full font-cairo ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"
                          onClick={() => handleEdit(item)}
                          title="تعديل"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {item.salaryRecordId && (
                          <button
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                            onClick={() => handleDelete(item.salaryRecordId!)}
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
                      </div>
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

      {/* Edit Salary Modal */}
      {isModalOpen && editingSalary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold font-cairo">تعديل بيانات الراتب</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingSalary(null)
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium font-cairo">{editingSalary.employee.nameAr}</p>
                <p className="text-sm text-gray-500 font-sans">{editingSalary.employee.name}</p>
                <p className="text-sm text-gray-400 font-sans">{editingSalary.employee.employeeNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-cairo mb-1">
                  البدلات والإضافات
                </label>
                <input
                  type="number"
                  defaultValue={editingSalary.allowances}
                  id="allowances-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-cairo mb-1">
                  الخصومات
                </label>
                <input
                  type="number"
                  defaultValue={editingSalary.deductions}
                  id="deductions-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-cairo mb-1">
                  أيام الغياب
                </label>
                <input
                  type="number"
                  defaultValue={editingSalary.absences}
                  id="absences-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-cairo mb-1">
                  طريقة الدفع
                </label>
                <select
                  defaultValue={editingSalary.paymentMethod || 'madad'}
                  id="payment-method-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                >
                  {Object.entries(paymentMethodLabels).map(([key, { icon, labelAr }]) => (
                    <option key={key} value={key}>
                      {icon} {labelAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 font-cairo mb-1">
                  ملاحظات
                </label>
                <textarea
                  defaultValue={editingSalary.notes || ''}
                  id="notes-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                  rows={2}
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-cairo">الصافي المتوقع:</span>
                  <span className="text-lg font-bold text-blue-700 font-sans" id="preview-net-salary">
                    {formatNumber(editingSalary.netSalary)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingSalary(null)
                }}
                className="flex-1 font-cairo"
              >
                إلغاء
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const allowances = Number((document.getElementById('allowances-input') as HTMLInputElement)?.value) || 0
                  const deductions = Number((document.getElementById('deductions-input') as HTMLInputElement)?.value) || 0
                  const absences = Number((document.getElementById('absences-input') as HTMLInputElement)?.value) || 0
                  const paymentMethod = (document.getElementById('payment-method-input') as HTMLSelectElement)?.value as PaymentMethod
                  const notes = (document.getElementById('notes-input') as HTMLTextAreaElement)?.value || ''

                  handleSaveSalary({ allowances, deductions, absences, paymentMethod, notes })
                }}
                className="flex-1 font-cairo"
              >
                حفظ
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
