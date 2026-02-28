import { useState, useEffect } from 'react'
import { X, Calendar, Building2, DollarSign, Clock, FileEdit, AlertCircle, Check } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import {
  useCreateDeduction,
  deductionTypeLabels,
  type DeductionType,
  calculateDeductionAmount,
} from '@/hooks/useDeductions'
import { Button } from '@/components/ui/Button'

interface DeductionModalProps {
  isOpen: boolean
  onClose: () => void
  employeeId: string
  employeeNameAr: string
  employeeSalary?: number
  defaultMonth?: number
  defaultYear?: number
  defaultDate?: string
  defaultProjectId?: string
}

export function DeductionModal({
  isOpen,
  onClose,
  employeeId,
  employeeNameAr,
  employeeSalary = 0,
  defaultMonth = new Date().getMonth() + 1,
  defaultYear = new Date().getFullYear(),
  defaultDate = new Date().toISOString().split('T')[0],
  defaultProjectId,
}: DeductionModalProps) {
  const [type, setType] = useState<DeductionType>('ABSENCE')
  const [date, setDate] = useState(defaultDate)
  const [month, setMonth] = useState(defaultMonth)
  const [year, setYear] = useState(defaultYear)
  const [projectId, setProjectId] = useState(defaultProjectId || '')
  const [amount, setAmount] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  const { data: projects = [] } = useProjects({ status: 'ACTIVE' })
  const createMutation = useCreateDeduction()

  // Calculate preview amount when type or hours/minutes change
  const previewAmount = amount
    ? parseFloat(amount)
    : calculateDeductionAmount(type, employeeSalary, hours ? parseFloat(hours) : undefined, minutes ? parseFloat(minutes) : undefined)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setType('ABSENCE')
      setDate(defaultDate)
      setMonth(defaultMonth)
      setYear(defaultYear)
      setProjectId(defaultProjectId || '')
      setAmount('')
      setHours('')
      setMinutes('')
      setReason('')
      setNotes('')
    }
  }, [isOpen, defaultDate, defaultMonth, defaultYear, defaultProjectId])

  const handleSubmit = () => {
    if (!projectId) {
      alert('الرجاء اختيار المشروع')
      return
    }

    const finalAmount = amount ? parseFloat(amount) : previewAmount

    if (finalAmount <= 0) {
      alert('الرجاء إدخال المبلغ أو الساعات/الدقائق')
      return
    }

    createMutation.mutate(
      {
        employeeId,
        projectId,
        type,
        amount: finalAmount,
        date,
        month,
        year,
        hours: hours ? parseFloat(hours) : undefined,
        minutes: minutes ? parseFloat(minutes) : undefined,
        reason,
        notes,
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  if (!isOpen) return null

  const currentMonthName = new Date(year, month - 1).toLocaleDateString('ar-SA', { month: 'long' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileEdit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-cairo">إضافة استقطاع جديد</h3>
              <p className="text-sm text-blue-100 font-cairo">{employeeNameAr}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Employee info */}
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-cairo">الراتب اليومي</p>
                <p className="text-xl font-bold text-slate-800 font-sans">{employeeSalary.toLocaleString('en-US')} ر.س</p>
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-500 font-cairo">الفترة</p>
                <p className="text-sm font-bold text-slate-800 font-cairo">{currentMonthName} {year}</p>
              </div>
            </div>
          </div>

          {/* Deduction Type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2 font-cairo">
              <Clock className="w-4 h-4 text-[#2563eb]" />
              نوع الاستقطاع
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DeductionType)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            >
              {Object.entries(deductionTypeLabels).map(([key, { labelAr, icon }]) => (
                <option key={key} value={key}>
                  {icon} {labelAr}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2 font-cairo">
              <Calendar className="w-4 h-4 text-[#2563eb]" />
              التاريخ
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
              required
            />
          </div>

          {/* Project */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2 font-cairo">
              <Building2 className="w-4 h-4 text-[#2563eb]" />
              المشروع
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
              required
            >
              <option value="">اختر المشروع</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.nameAr} ({project.code})
                </option>
              ))}
            </select>
          </div>

          {/* Hours/Minutes - for partial absence */}
          {(type === 'PARTIAL_ABSENCE' || type === 'ABSENCE') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2 font-cairo">
                  <Clock className="w-4 h-4 text-[#2563eb]" />
                  ساعات
                </label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="0"
                  max="24"
                  step="0.5"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2 font-cairo">
                  <Clock className="w-4 h-4 text-[#2563eb]" />
                  دقائق
                </label>
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  min="0"
                  max="59"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>
            </div>
          )}

          {/* Amount - manual input or auto-calculated */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2 font-cairo">
              <DollarSign className="w-4 h-4 text-[#2563eb]" />
              المبلغ (بالريال)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              placeholder={type === 'ABSENCE' ? 'يحسب تلقائياً' : ''}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            />
            <p className="text-xs text-slate-400 mt-1 font-cairo">
              {type === 'ABSENCE' && !amount
                ? `سيحسب تلقائياً: ${employeeSalary.toLocaleString('en-US')} ر.س (الراتب اليومي)`
                : type === 'PARTIAL_ABSENCE' && !amount
                ? `سيحسب بناءً على ساعات العمل: ${((employeeSalary / 30) / 8).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س/ساعة`
                : 'أدخل المبلغ يدوياً'}
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2 font-cairo">
              <AlertCircle className="w-4 h-4 text-[#2563eb]" />
              السبب
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: تأخر صباح، سلفة، غياب غير مبرر..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2 font-cairo">
              <FileEdit className="w-4 h-4 text-[#2563eb]" />
              ملاحظات
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="أي ملاحظات إضافية..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo resize-none"
            />
          </div>

          {/* Preview */}
          <div className="bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 font-cairo">المبلغ المتوقع:</span>
              <span className="text-lg font-bold text-slate-800 font-sans">
                {previewAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 font-cairo"
            disabled={createMutation.isPending}
          >
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex-1 font-cairo"
            disabled={createMutation.isPending || !projectId}
          >
            {createMutation.isPending ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                إضافة الاستقطاع
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
