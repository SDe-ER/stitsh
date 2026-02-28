import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import {
  useInvoices,
  useDeleteInvoice,
  useUpdateInvoiceStatus,
  invoiceStatusLabels,
  type InvoiceStatus,
  type FinanceFilters,
} from '@/hooks/useFinance'
import { formatNumber } from '@/utils/format'
import { Plus, Trash2, Eye, Download, FileText } from 'lucide-react'

export default function InvoicesPage() {
  const [filters, setFilters] = useState<FinanceFilters>({})
  const { data: invoices = [], isLoading } = useInvoices(filters)
  const deleteMutation = useDeleteInvoice()
  const updateStatusMutation = useUpdateInvoiceStatus()

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      deleteMutation.mutate(id)
    }
  }

  const handleStatusChange = (id: string, status: InvoiceStatus) => {
    updateStatusMutation.mutate({ id, status })
  }

  // Calculate summary
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const paidAmount = invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0)
  const pendingAmount = invoices.filter((inv) => ['sent', 'overdue'].includes(inv.status)).reduce((sum, inv) => sum + inv.totalAmount, 0)

  return (
    <AppLayout titleAr="الفواتير">
      <PageHeader
        title="Invoices"
        titleAr="الفواتير"
        subtitle="Manage your invoices and payments"
        subtitleAr="إدارة الفواتير والمدفوعات"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'Finance', labelAr: 'المالية', path: '/finance' },
          { label: 'Invoices', labelAr: 'الفواتير' },
        ]}
        actions={[
          {
            label: 'New Invoice',
            labelAr: 'فاتورة جديدة',
            icon: <Plus className="w-4 h-4" />,
            variant: 'primary' as const,
            onClick: () => console.log('Create invoice'),
          },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-cairo">إجمالي الفواتير</p>
              <p className="text-2xl font-bold text-blue-700 font-sans">
                {formatNumber(totalAmount)} ريال
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-cairo">مدفوع</p>
              <p className="text-2xl font-bold text-green-700 font-sans">
                {formatNumber(paidAmount)} ريال
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-cairo">معلق</p>
              <p className="text-2xl font-bold text-amber-700 font-sans">
                {formatNumber(pendingAmount)} ريال
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 font-cairo">الحالة:</span>
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({
                ...filters,
                status: e.target.value === 'all' ? undefined : e.target.value as InvoiceStatus
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            >
              <option value="all">الكل</option>
              <option value="draft">مسودة</option>
              <option value="sent">مرسلة</option>
              <option value="paid">مدفوعة</option>
              <option value="overdue">متأخرة</option>
              <option value="cancelled">ملغاة</option>
            </select>
          </div>

          {(filters.status) && (
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

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2 font-cairo">جاري التحميل...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-700 font-cairo mb-2">لا توجد فواتير</p>
            <p className="text-sm text-gray-500 font-cairo">ابدأ بإنشاء أول فاتورة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">العميل</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المشروع</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المبلغ</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الضريبة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الإجمالي</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">تاريخ الاستحقاق</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الحالة</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className={`hover:bg-gray-50 ${
                      invoice.status === 'overdue' ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-sans font-medium">{invoice.invoiceNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-cairo">{invoice.clientNameAr}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-cairo">{invoice.projectNameAr}</p>
                      <p className="text-xs text-gray-500 font-sans">{invoice.projectCode}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-sans">
                      {formatNumber(invoice.subtotal)} ريال
                    </td>
                    <td className="px-4 py-3 text-sm font-sans text-gray-600">
                      {formatNumber(invoice.taxAmount)} ريال
                    </td>
                    <td className="px-4 py-3 text-sm font-sans font-bold">
                      {formatNumber(invoice.totalAmount)} ريال
                    </td>
                    <td className="px-4 py-3 text-sm font-cairo">
                      {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value as InvoiceStatus)}
                        className={`px-2 py-1 text-xs font-medium rounded-full font-cairo border-0 cursor-pointer ${
                          invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-700'
                            : invoiceStatusLabels[invoice.status].color
                        }`}
                      >
                        <option value="draft">مسودة</option>
                        <option value="sent">مرسلة</option>
                        <option value="paid">مدفوعة</option>
                        <option value="overdue">متأخرة</option>
                        <option value="cancelled">ملغاة</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg"
                          title="عرض"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg"
                          title="تحميل"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                          onClick={() => handleDelete(invoice.id)}
                          title="حذف"
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
