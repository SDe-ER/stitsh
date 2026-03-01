import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { MaterialSymbol } from '@/components/ui/MaterialSymbol'
import { Button } from '@/components/ui/Button'
import { reportsService } from '@/services/reports'

// ============================================================================
// TYPES
// ============================================================================

interface ReportPreview {
  reportRun: {
    id: string
    status: string
    startDate: string | null
    endDate: string | null
    createdAt: string
    completedAt: string | null
    reference: string
  }
  reportDefinition: {
    id: string
    type: string
    name: string
    nameAr: string | null
    category: string
    description: string | null
    descriptionAr: string | null
  }
  parameters: any
  data: any
  display: {
    columns: Array<{
      key: string
      label: string
      align?: string
      format?: string
    }>
    rows: any[]
    totals?: {
      debit?: number
      credit?: number
      balance?: number
    }
    entityInfo?: {
      name: string
      nameAr: string
      address: string
    }
    period?: {
      from: string
      to: string
    }
  }
}

interface ReportExportRecord {
  id: string
  format: string
  status: string
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  createdAt: string
  completedAt: string | null
}

type ExportFormat = 'PDF' | 'EXCEL' | 'CSV'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ReportPreviewPage() {
  const { runId } = useParams<{ runId: string }>()
  const navigate = useNavigate()

  // Export options state
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('PDF')
  const [exportOptions, setExportOptions] = useState({
    includeTax: true,
    includeSignature: true,
    attachInvoices: false,
  })
  const [recipientEmail, setRecipientEmail] = useState('finance@modern-build.com')
  const [isExporting, setIsExporting] = useState(false)

  // Fetch preview data
  const { data: preview, isLoading, error } = useQuery({
    queryKey: ['reportPreview', runId],
    queryFn: () => reportsService.getPreview(runId || ''),
    enabled: !!runId,
  })

  // Fetch exports list
  const { data: exports = [] } = useQuery({
    queryKey: ['reportExports', runId],
    queryFn: () => reportsService.getExports(runId || ''),
    enabled: !!runId,
  })

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (format: ExportFormat) => {
      return reportsService.export(runId || '', {
        format,
        recipientEmail,
        exportOptions,
      })
    },
    onSuccess: (data: ReportExportRecord) => {
      setIsExporting(false)
      toast.success('تم إعداد التقرير بنجاح', {
        description: 'Report has been prepared successfully',
      })
    },
    onError: (error: any) => {
      setIsExporting(false)
      toast.error('فشل إعداد التقرير', {
        description: error.message || 'Failed to prepare report',
      })
    },
  })

  const handleExport = (format: ExportFormat) => {
    setIsExporting(true)
    setSelectedFormat(format)
    exportMutation.mutate(format)
  }

  const handleDownload = (exportRecord: ReportExportRecord) => {
    if (exportRecord.fileUrl) {
      window.open(`/api/reports/exports/${exportRecord.id}/download`, '_blank')
    }
  }

  if (isLoading) {
    return (
      <AppLayout titleAr="معاينة التقرير">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-slate-600">جاري تحميل التقرير...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !preview) {
    return (
      <AppLayout titleAr="معاينة التقرير">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <MaterialSymbol icon="error" className="text-6xl text-red-500 mb-4" />
          <p className="text-lg text-slate-700">فشل تحميل التقرير</p>
          <button
            onClick={() => navigate('/reports')}
            className="mt-4 text-primary hover:underline"
          >
            العودة إلى التقارير
          </button>
        </div>
      </AppLayout>
    )
  }

  const { reportRun, reportDefinition, display } = preview.data as ReportPreview

  // Build breadcrumb
  const breadcrumbs = [
    { label: 'Home', labelAr: 'الرئيسية', path: '/' },
    { label: 'Reports', labelAr: 'مركز التقارير', path: '/reports' },
    { label: reportDefinition.nameAr || reportDefinition.name, labelAr: reportDefinition.nameAr || reportDefinition.name },
    { label: 'Preview', labelAr: 'معاينة' },
  ]

  return (
    <AppLayout titleAr="معاينة التقرير">
      {/* Page Header */}
      <PageHeader
        title="Report Preview"
        titleAr="تصدير ومعاينة التقرير"
        subtitle="Smart Reports Center"
        subtitleAr="مركز التقارير الذكي"
        breadcrumbs={breadcrumbs}
      />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-0 overflow-hidden h-[calc(100vh-64px-64px)]">
        {/* Left/Center: A4 Paper Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 lg:p-8 flex justify-center">
          <div className="a4-paper bg-white text-slate-900 p-6 lg:p-12 text-sm shadow-xl">
            {/* Company Header */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-slate-800 pb-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">HeavyOps ERP</h1>
                <p className="text-slate-500 text-xs">للمقاولات العامة</p>
                <p className="text-slate-500 text-xs">الرياض، المملكة العربية السعودية</p>
                <p className="text-slate-500 text-xs">س.ت: 1010101010 | ضريبة: 300000000000003</p>
              </div>
              <div className="text-left" dir="ltr">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                  {reportDefinition.name.toUpperCase()}
                </h2>
                <h3 className="text-lg text-slate-600 font-medium" dir="rtl">
                  {reportDefinition.nameAr || reportDefinition.descriptionAr}
                </h3>
                <p className="text-slate-500 text-xs mt-2">Ref: {reportRun.reference}</p>
                <p className="text-slate-500 text-xs">
                  Date: {new Date(reportRun.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Entity & Period Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 mb-6 lg:mb-8">
              {display.entityInfo && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">{display.entityInfo.nameAr}</p>
                  <p className="font-bold text-slate-800">{display.entityInfo.name}</p>
                  <p className="text-xs text-slate-500">{display.entityInfo.address}</p>
                </div>
              )}
              {display.period && (
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-slate-500">الفترة من:</span>
                    <span className="text-xs font-bold">{display.period.from}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">إلى:</span>
                    <span className="text-xs font-bold">{display.period.to}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Data Table */}
            {display.columns && display.rows && (
              <table className="w-full text-right mb-6 lg:mb-8 border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white text-xs">
                    {display.columns.map((col, index) => (
                      <th
                        key={col.key}
                        className={`py-2 px-2 lg:px-3 ${index === 0 ? 'rounded-tr-md' : ''} ${index === display.columns.length - 1 ? 'rounded-tl-md' : ''}`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {display.rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`border-b border-slate-100 ${rowIndex % 2 === 1 ? 'bg-slate-50' : ''}`}
                    >
                      {display.columns.map((col) => (
                        <td key={col.key} className="py-2 lg:py-3 px-2 lg:px-3">
                          {col.format === 'currency'
                            ? (row[col.key] || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : col.format === 'percentage'
                            ? `${(row[col.key] || 0).toFixed(1)}%`
                            : row[col.key] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                {display.totals && (
                  <tfoot>
                    <tr className="font-bold border-t-2 border-slate-800">
                      <td className="py-2 lg:py-3 px-2 lg:px-3 text-left pl-4 lg:pl-8" colSpan={display.columns.length - 2}>
                        الإجمالي
                      </td>
                      <td className="py-2 lg:py-3 px-2 lg:px-3 text-red-600">
                        {display.totals.debit?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                      </td>
                      <td className="py-2 lg:py-3 px-2 lg:px-3">
                        {display.totals.credit?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                      </td>
                    </tr>
                    {display.totals.balance !== undefined && (
                      <tr className="bg-primary/10 text-primary">
                        <td className="py-2 lg:py-3 px-2 lg:px-3 text-left pl-4 lg:pl-8 font-bold" colSpan={display.columns.length - 1}>
                          الرصيد المستحق
                        </td>
                        <td className="py-2 lg:py-3 px-2 lg:px-3 font-bold text-base lg:text-lg text-center">
                          {display.totals.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                        </td>
                      </tr>
                    )}
                  </tfoot>
                )}
              </table>
            )}

            {/* Signature Section */}
            <div className="flex items-end justify-between mt-auto pt-8 lg:pt-12">
              <div className="flex flex-col gap-2 lg:gap-4 w-1/2">
                <div className="h-12 lg:h-16 border-b border-slate-300 w-32 lg:w-48 mb-1"></div>
                <p className="text-xs font-medium text-slate-500">التوقيع والختم</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white p-1 lg:p-2 border border-slate-200 rounded-lg">
                  <div className="w-16 lg:w-24 h-16 lg:h-24 bg-slate-900 flex items-center justify-center text-white text-[6px] lg:text-[8px] text-center leading-none p-1">
                    [ZATCA QR Code]
                    <br />
                    BASE64_ENCODED
                  </div>
                </div>
                <span className="text-[8px] lg:text-[10px] text-slate-400 mt-1">فاتورة ضريبية إلكترونية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Export Settings Drawer (400px) */}
        <div className="w-full lg:w-[400px] bg-white border-r border-slate-200 shadow-xl z-20 overflow-y-auto flex flex-col h-full">
          <div className="p-4 lg:p-6 border-b border-slate-100">
            <h3 className="text-base lg:text-lg font-bold text-slate-800">إعدادات التصدير</h3>
            <p className="text-sm text-slate-500 mt-1">قم بتخصيص خيارات الملف قبل التحميل</p>
          </div>

          <div className="p-4 lg:p-6 space-y-6 lg:space-y-8 flex-1 overflow-y-auto">
            {/* File Format Selection */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-3">صيغة الملف</label>
              <div className="grid grid-cols-1 gap-3">
                {/* PDF Option */}
                <label className="cursor-pointer group relative">
                  <input
                    type="radio"
                    name="format"
                    value="PDF"
                    checked={selectedFormat === 'PDF'}
                    onChange={() => setSelectedFormat('PDF')}
                    className="peer sr-only"
                  />
                  <div className={`p-3 lg:p-4 rounded-xl border-2 transition-all flex items-center gap-3 lg:gap-4 ${
                    selectedFormat === 'PDF'
                      ? 'border-primary bg-blue-50/50'
                      : 'border-slate-200 hover:border-blue-200'
                  }`}>
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center ${
                      selectedFormat === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <MaterialSymbol icon="picture_as_pdf" className="text-xl lg:text-2xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">مستند PDF</span>
                        <MaterialSymbol
                          icon="check_circle"
                          className={`text-sm ${selectedFormat === 'PDF' ? 'text-primary opacity-100' : 'opacity-0'}`}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">مناسب للطباعة والمشاركة الرسمية</p>
                    </div>
                  </div>
                </label>

                {/* Excel Option */}
                <label className="cursor-pointer group relative">
                  <input
                    type="radio"
                    name="format"
                    value="EXCEL"
                    checked={selectedFormat === 'EXCEL'}
                    onChange={() => setSelectedFormat('EXCEL')}
                    className="peer sr-only"
                  />
                  <div className={`p-3 lg:p-4 rounded-xl border-2 transition-all flex items-center gap-3 lg:gap-4 ${
                    selectedFormat === 'EXCEL'
                      ? 'border-green-500 bg-green-50/50'
                      : 'border-slate-200 hover:border-green-200'
                  }`}>
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center ${
                      selectedFormat === 'EXCEL' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <MaterialSymbol icon="table_view" className="text-xl lg:text-2xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">جدول Excel</span>
                        <MaterialSymbol
                          icon="check_circle"
                          className={`text-sm ${selectedFormat === 'EXCEL' ? 'text-green-500 opacity-100' : 'opacity-0'}`}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">قابل للتعديل والتحليل المتقدم</p>
                    </div>
                  </div>
                </label>

                {/* CSV Option */}
                <label className="cursor-pointer group relative">
                  <input
                    type="radio"
                    name="format"
                    value="CSV"
                    checked={selectedFormat === 'CSV'}
                    onChange={() => setSelectedFormat('CSV')}
                    className="peer sr-only"
                  />
                  <div className={`p-3 lg:p-4 rounded-xl border-2 transition-all flex items-center gap-3 lg:gap-4 ${
                    selectedFormat === 'CSV'
                      ? 'border-slate-500 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center ${
                      selectedFormat === 'CSV' ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <span className="text-xs lg:text-sm font-bold">CSV</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">بيانات CSV</span>
                        <MaterialSymbol
                          icon="check_circle"
                          className={`text-sm ${selectedFormat === 'CSV' ? 'text-slate-600 opacity-100' : 'opacity-0'}`}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">بيانات خام للأنظمة المحاسبية</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Inclusion Options */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-3">خيارات التضمين</label>
              <div className="space-y-3 lg:space-y-4 bg-slate-50 p-3 lg:p-4 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">تضمين تفاصيل الضريبة</span>
                  <button
                    onClick={() => setExportOptions({ ...exportOptions, includeTax: !exportOptions.includeTax })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      exportOptions.includeTax ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        exportOptions.includeTax ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">تضمين التوقيع والختم</span>
                  <button
                    onClick={() => setExportOptions({ ...exportOptions, includeSignature: !exportOptions.includeSignature })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      exportOptions.includeSignature ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        exportOptions.includeSignature ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">إرفاق الفواتير المصدرية</span>
                  <button
                    onClick={() => setExportOptions({ ...exportOptions, attachInvoices: !exportOptions.attachInvoices })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      exportOptions.attachInvoices ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        exportOptions.attachInvoices ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Email Recipient */}
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">إرسال نسخة إلى</label>
              <div className="relative">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg py-2.5 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-mono"
                  placeholder="email@example.com"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <MaterialSymbol icon="mail" className="text-xl" />
                </span>
              </div>
            </div>

            {/* Export History */}
            {exports.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-3">التصديرات السابقة</label>
                <div className="space-y-2">
                  {exports.slice(0, 5).map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <MaterialSymbol
                          icon={exp.format === 'PDF' ? 'picture_as_pdf' : exp.format === 'EXCEL' ? 'table_view' : 'csv'}
                          className={exp.format === 'PDF' ? 'text-red-600' : exp.format === 'EXCEL' ? 'text-green-600' : 'text-slate-600'}
                        />
                        <div>
                          <p className="text-xs font-medium text-slate-700">{exp.format}</p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(exp.createdAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>
                      {exp.status === 'COMPLETED' && exp.fileUrl ? (
                        <button
                          onClick={() => handleDownload(exp)}
                          className="text-primary hover:text-primary-dark text-xs font-medium"
                        >
                          تحميل
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">{exp.status === 'PENDING' ? 'جاري...' : 'فشل'}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 lg:p-6 border-t border-slate-100 bg-slate-50 mt-auto">
            <button
              onClick={() => handleExport(selectedFormat)}
              disabled={isExporting}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold text-base lg:text-lg mb-3 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <MaterialSymbol icon="download" className="text-xl" />
              {isExporting ? 'جاري الإعداد...' : 'تحميل الآن'}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button className="w-full bg-whatsapp hover:brightness-90 text-white py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
                <MaterialSymbol icon="chat" className="text-lg" />
                واتساب
              </button>
              <button className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
                <MaterialSymbol icon="send" className="text-lg" />
                بريد إلكتروني
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {exportMutation.isSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-slate-800 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-full shadow-lg flex items-center gap-2 lg:gap-3">
            <MaterialSymbol icon="check_circle" className="text-green-400" />
            <span className="text-xs lg:text-sm font-medium">تم إعداد التقرير بنجاح</span>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
