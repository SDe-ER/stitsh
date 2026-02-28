import { useState, useEffect } from 'react'
import { X, Sun, Moon, Factory } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateProduction, getTipperTypes, getCrushers, shiftLabels, type ProductionMethod, type ShiftType } from '@/hooks/useProduction'
import type { ProjectItem } from '@/hooks/useProjects'

interface ProductionModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectItems?: ProjectItem[]
}

const methodOptions = [
  { value: 'tipper' as ProductionMethod, label: 'قلابات', labelEn: 'Tipper Loading' },
  { value: 'excavator' as ProductionMethod, label: 'رفع مساحي', labelEn: 'Excavator Work' },
  { value: 'hourly' as ProductionMethod, label: 'بالساعة', labelEn: 'Hourly Work' },
]

const shiftOptions = [
  { value: 'day' as ShiftType, label: 'نهاري', labelEn: 'Day Shift', icon: Sun },
  { value: 'night' as ShiftType, label: 'ليلي', labelEn: 'Night Shift', icon: Moon },
]

export function ProductionModal({ isOpen, onClose, projectId, projectItems = [] }: ProductionModalProps) {
  const [method, setMethod] = useState<ProductionMethod>('tipper')
  const [shift, setShift] = useState<ShiftType>('day')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [crusherId, setCrusherId] = useState('')  // Empty = general site production
  const [itemId, setItemId] = useState('')
  const [tipperTypes, setTipperTypes] = useState<any[]>([])
  const [tipperTypeId, setTipperTypeId] = useState('tipper-2')
  const [tripsCount, setTripsCount] = useState('')
  const [quantity, setQuantity] = useState('')
  const [hours, setHours] = useState('')
  const [hourlyRate, setHourlyRate] = useState('150')
  const [notes, setNotes] = useState('')

  const createMutation = useCreateProduction()
  const crushers = getCrushers(projectId)

  useEffect(() => {
    setTipperTypes(getTipperTypes())
  }, [])

  if (!isOpen) return null

  const selectedTipper = tipperTypes.find(t => t.id === tipperTypeId)
  const calculatedQuantity = method === 'tipper' && selectedTipper && tripsCount
    ? selectedTipper.volume * parseInt(tripsCount)
    : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data: any = {
      projectId,
      date,
      shift,
      method,
      notes,
    }

    if (crusherId) {
      data.crusherId = crusherId
    }

    if (itemId) {
      data.itemId = itemId
    }

    if (method === 'tipper') {
      data.tipperTypeId = tipperTypeId
      data.tripsCount = parseInt(tripsCount)
    } else if (method === 'excavator') {
      data.quantity = parseFloat(quantity)
    } else if (method === 'hourly') {
      data.hours = parseFloat(hours)
      data.hourlyRate = parseFloat(hourlyRate)
    }

    createMutation.mutate(data, {
      onSuccess: () => {
        handleClose()
      },
    })
  }

  const handleClose = () => {
    setMethod('tipper')
    setShift('day')
    setDate(new Date().toISOString().split('T')[0])
    setCrusherId('')
    setItemId('')
    setTipperTypeId('tipper-2')
    setTripsCount('')
    setQuantity('')
    setHours('')
    setHourlyRate('150')
    setNotes('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-cairo">تسجيل إنتاج</h2>
            <p className="text-sm text-gray-500 font-cairo">Production Record</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              التاريخ
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            />
          </div>

          {/* Shift Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              الدوام
            </label>
            <div className="grid grid-cols-2 gap-3">
              {shiftOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setShift(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all font-cairo font-medium flex items-center justify-center gap-2 ${
                      shift === option.value
                        ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="text-lg">{option.label}</div>
                      <div className="text-xs opacity-75">{option.labelEn}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Crusher Selection */}
          {crushers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                الكسارة
              </label>
              <select
                value={crusherId}
                onChange={(e) => setCrusherId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
              >
                <option value="">عام (الموقع بصفة عامة)</option>
                {crushers.map((crusher) => (
                  <option key={crusher.id} value={crusher.id}>
                    {crusher.nameAr} - {crusher.typeAr}
                  </option>
                ))}
              </select>
              {crusherId && (
                <p className="text-xs text-gray-500 mt-1 font-cairo">
                  {crushers.find(c => c.id === crusherId)?.locationAr || ''}
                </p>
              )}
            </div>
          )}

          {/* Production Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              طريقة الإنتاج
            </label>
            <div className="grid grid-cols-3 gap-3">
              {methodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMethod(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all font-cairo font-medium ${
                    method === option.value
                      ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg">{option.label}</div>
                  <div className="text-xs opacity-75">{option.labelEn}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Project Item (Optional) */}
          {projectItems.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                بند المشروع (اختياري)
              </label>
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
              >
                <option value="">اختر البند...</option>
                {projectItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} - {item.nameAr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tipper Method Fields */}
          {method === 'tipper' && (
            <>
              {/* Tipper Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  نوع القلاب
                </label>
                <select
                  value={tipperTypeId}
                  onChange={(e) => setTipperTypeId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                >
                  {tipperTypes.map((tipper) => (
                    <option key={tipper.id} value={tipper.id}>
                      {tipper.nameAr} - {tipper.volume} م³ ({tipper.capacity} طن)
                    </option>
                  ))}
                </select>
              </div>

              {/* Trips Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  عدد الرحلات
                </label>
                <input
                  type="number"
                  value={tripsCount}
                  onChange={(e) => setTripsCount(e.target.value)}
                  min="1"
                  required
                  placeholder="أدخل عدد الرحلات"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              {/* Calculated Quantity */}
              {calculatedQuantity !== null && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 font-cairo">الكمية المحسوبة:</span>
                    <span className="text-2xl font-bold text-[#2563eb] font-sans">
                      {calculatedQuantity.toLocaleString('ar-SA')} م³
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-cairo">
                    {selectedTipper?.volume} م³ × {tripsCount} رحلة
                  </p>
                </div>
              )}
            </>
          )}

          {/* Excavator Method Fields */}
          {method === 'excavator' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                الكمية (متر مكعب)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="0.01"
                required
                placeholder="أدخل الكمية بالمتر المكعب"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
              />
            </div>
          )}

          {/* Hourly Method Fields */}
          {method === 'hourly' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  عدد الساعات
                </label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="0.5"
                  step="0.5"
                  required
                  placeholder="أدخل عدد الساعات"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  السعر بالساعة (ريال)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  min="0"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              {hours && hourlyRate && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 font-cairo">الإجمالي:</span>
                    <span className="text-2xl font-bold text-green-600 font-sans">
                      {(parseFloat(hours) * parseFloat(hourlyRate)).toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="أضف ملاحظات..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 font-cairo"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending}
              className="flex-1 font-cairo"
            >
              {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
