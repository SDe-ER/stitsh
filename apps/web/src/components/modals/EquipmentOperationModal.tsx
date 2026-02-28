import { useState, useEffect } from 'react'
import { X, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateEquipmentOperation, getEquipmentHourlyRate, type ShiftType } from '@/hooks/useEquipmentOperations'
import { useEquipment } from '@/hooks/useEquipment'
import { useProjects } from '@/hooks/useProjects'
import { useWorkers } from '@/hooks/useWorkers'

interface EquipmentOperationModalProps {
  isOpen: boolean
  onClose: () => void
  equipmentId?: string
  projectId?: string
}

const shiftOptions = [
  { value: 'day' as ShiftType, label: 'نهاري', labelEn: 'Day Shift', icon: Sun },
  { value: 'night' as ShiftType, label: 'ليلي', labelEn: 'Night Shift', icon: Moon },
]

export function EquipmentOperationModal({ isOpen, onClose, equipmentId, projectId }: EquipmentOperationModalProps) {
  const createMutation = useCreateEquipmentOperation()
  const { data: equipment = [] } = useEquipment()
  const { data: projectsResponse } = useProjects()
  const { data: workers = [] } = useWorkers()

  const projects = projectsResponse?.projects || []

  // Get the current project to filter equipment
  const projectData = projects.find(p => p.id === projectId)
  const assignedEquipmentIds = projectData?.assignedEquipmentIds || []

  // Filter equipment to only show those assigned to this project
  const availableEquipment = equipment.filter(eq =>
    eq.status === 'active' && assignedEquipmentIds.includes(eq.id)
  )

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(equipmentId || '')
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '')
  const [shift, setShift] = useState<ShiftType>('day')
  const [hours, setHours] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [useCustomRate, setUseCustomRate] = useState(false)
  const [operator, setOperator] = useState('')
  const [operatorAr, setOperatorAr] = useState('')
  const [notes, setNotes] = useState('')

  // Get available operators for the selected equipment (after state declaration)
  const availableOperators = selectedEquipmentId
    ? workers.filter(w =>
        w.isActive &&
        (w.role === 'operator' || w.role === 'driver') &&
        w.assignedEquipmentIds.includes(selectedEquipmentId)
      )
    : []

  // Auto-fetch hourly rate when equipment changes
  useEffect(() => {
    if (selectedEquipmentId && !useCustomRate) {
      const rate = getEquipmentHourlyRate(selectedEquipmentId)
      setHourlyRate(rate.toString())
    }
  }, [selectedEquipmentId, useCustomRate])

  // Update selected equipment ID when prop changes
  useEffect(() => {
    if (equipmentId) {
      setSelectedEquipmentId(equipmentId)
    }
  }, [equipmentId])

  // Update selected project ID when prop changes
  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId)
    }
  }, [projectId])

  if (!isOpen) return null

  const selectedEquipment = availableEquipment.find(e => e.id === selectedEquipmentId)
  const selectedProject = projects.find(p => p.id === selectedProjectId)

  const calculatedTotal = hours && hourlyRate ? parseFloat(hours) * parseFloat(hourlyRate) : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      date,
      equipmentId: selectedEquipmentId,
      projectId: selectedProjectId,
      hours: parseFloat(hours),
      shift,
      operator: operator || undefined,
      operatorAr: operatorAr || undefined,
      notes: notes || undefined,
      hourlyRate: useCustomRate ? parseFloat(hourlyRate) : undefined,
    }

    createMutation.mutate(data, {
      onSuccess: () => {
        handleClose()
      },
    })
  }

  const handleClose = () => {
    setDate(new Date().toISOString().split('T')[0])
    setSelectedEquipmentId(equipmentId || '')
    setSelectedProjectId(projectId || '')
    setShift('day')
    setHours('')
    setHourlyRate('')
    setUseCustomRate(false)
    setOperator('')
    setOperatorAr('')
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
            <h2 className="text-xl font-bold text-gray-900 font-cairo">تسجيل تشغيل المعدة</h2>
            <p className="text-sm text-gray-500 font-cairo">Equipment Operation Record</p>
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

          {/* Equipment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              المعدة
            </label>
            {availableEquipment.length === 0 ? (
              <div className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-cairo">لا توجد معدات مضافة لهذا المشروع</p>
                <p className="text-xs text-amber-600 font-cairo mt-1">يرجى إضافة معدات من خلال "إدارة المعدات"</p>
              </div>
            ) : (
              <select
                value={selectedEquipmentId}
                onChange={(e) => {
                  setSelectedEquipmentId(e.target.value)
                  setUseCustomRate(false)
                }}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
              >
                <option value="">اختر المعدة...</option>
                {availableEquipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.code} - {eq.nameAr}
                  </option>
                ))}
              </select>
            )}
            {selectedEquipment && (
              <p className="text-xs text-gray-500 mt-1 font-cairo">
                {selectedEquipment.typeAr} - {selectedEquipment.nameAr}
              </p>
            )}
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              المشروع
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            >
              <option value="">اختر المشروع...</option>
              {projects.filter(p => p.status === 'active').map((project) => (
                <option key={project.id} value={project.id}>
                  {project.code} - {project.nameAr}
                </option>
              ))}
            </select>
            {selectedProject && (
              <p className="text-xs text-gray-500 mt-1 font-cairo">
                {selectedProject.locationAr}
              </p>
            )}
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

          {/* Hours Input */}
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

          {/* Hourly Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 font-cairo">
                المعدل بالساعة (ريال)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomRate}
                  onChange={(e) => setUseCustomRate(e.target.checked)}
                  className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb] rounded"
                />
                <span className="text-xs text-gray-600 font-cairo">معدل مخصص</span>
              </label>
            </div>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              min="0"
              required
              disabled={!useCustomRate && !!selectedEquipment}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent font-sans ${
                !useCustomRate && selectedEquipment
                  ? 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                  : 'border-gray-300 focus:ring-[#2563eb] focus:border-transparent'
              }`}
            />
            {!useCustomRate && selectedEquipment && (
              <p className="text-xs text-gray-500 mt-1 font-cairo">
                المعدل الافتراضي ({selectedEquipment.typeAr})
              </p>
            )}
          </div>

          {/* Total Cost Preview */}
          {hours && hourlyRate && calculatedTotal > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 font-cairo">الإجمالي:</span>
                <span className="text-2xl font-bold text-green-600 font-sans">
                  {calculatedTotal.toLocaleString('ar-SA')} ريال
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-cairo">
                {parseFloat(hours).toLocaleString('ar-SA')} ساعة × {parseFloat(hourlyRate).toLocaleString('ar-SA')} ريال/ساعة
              </p>
            </div>
          )}

          {/* Operator (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              المشغل (اختياري)
            </label>
            {selectedEquipmentId && availableOperators.length > 0 ? (
              <select
                value={operator}
                onChange={(e) => {
                  const selectedWorker = workers.find(w => w.id === e.target.value)
                  if (selectedWorker) {
                    setOperator(selectedWorker.name)
                    setOperatorAr(selectedWorker.nameAr)
                  }
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
              >
                <option value="">اختر المشغل...</option>
                {availableOperators.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.nameAr} ({worker.roleAr})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder={selectedEquipmentId ? 'لا يوجد مشغلين معينين لهذه المعدة' : 'اسم المشغل'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                disabled={!!selectedEquipmentId && availableOperators.length === 0}
              />
            )}
            {selectedEquipmentId && availableOperators.length > 0 && (
              <p className="text-xs text-gray-500 mt-1 font-cairo">
                {availableOperators.length} مشغل متاح لهذه المعدة
              </p>
            )}
          </div>

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
