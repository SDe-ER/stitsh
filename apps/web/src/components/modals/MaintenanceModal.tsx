import { useState, useEffect } from 'react'
import { X, Calendar, Wrench, DollarSign, User, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  useCreateMaintenance,
  useUpdateMaintenance,
  maintenanceTypeLabels,
  type MaintenanceType,
  type MaintenanceRecord,
} from '@/hooks/useEquipment'

interface MaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  equipmentId?: string
  equipmentName?: string
  equipmentNameAr?: string
  editRecord?: MaintenanceRecord
}

const maintenanceTypeOptions = [
  { value: 'preventive' as MaintenanceType, ...maintenanceTypeLabels.preventive },
  { value: 'corrective' as MaintenanceType, ...maintenanceTypeLabels.corrective },
  { value: 'emergency' as MaintenanceType, ...maintenanceTypeLabels.emergency },
]

export function MaintenanceModal({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  equipmentNameAr,
  editRecord,
}: MaintenanceModalProps) {
  const createMutation = useCreateMaintenance()
  const updateMutation = useUpdateMaintenance()

  const [type, setType] = useState<MaintenanceType>('preventive')
  const [description, setDescription] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [technician, setTechnician] = useState('')
  const [technicianAr, setTechnicianAr] = useState('')
  const [cost, setCost] = useState('')
  const [partsUsed, setPartsUsed] = useState('')
  const [partsUsedAr, setPartsUsedAr] = useState('')
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('')
  const [notes, setNotes] = useState('')
  const [notesAr, setNotesAr] = useState('')

  const isEditing = !!editRecord

  useEffect(() => {
    if (editRecord) {
      setType(editRecord.type)
      setDescription(editRecord.description)
      setDescriptionAr(editRecord.descriptionAr)
      setDate(editRecord.date)
      setTechnician(editRecord.technician)
      setTechnicianAr(editRecord.technicianAr)
      setCost(editRecord.cost.toString())
      setPartsUsed(editRecord.partsUsed || '')
      setPartsUsedAr(editRecord.partsUsedAr || '')
      setNextMaintenanceDate(editRecord.nextMaintenanceDate || '')
      setNotes(editRecord.notes || '')
      setNotesAr(editRecord.notesAr || '')
    }
  }, [editRecord])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isEditing && editRecord) {
      // Update existing record
      updateMutation.mutate({
        id: editRecord.id,
        data: {
          type,
          description,
          descriptionAr,
          date,
          status: 'completed' as const,
          statusAr: maintenanceStatusLabels.completed.label,
          completedDate: date,
          technician,
          technicianAr,
          cost: parseFloat(cost),
          partsUsed,
          partsUsedAr,
          nextMaintenanceDate: nextMaintenanceDate || undefined,
          notes,
          notesAr,
        },
      })
    } else if (equipmentId) {
      // Create new record
      createMutation.mutate({
        equipmentId,
        type,
        description,
        descriptionAr,
        date,
        technician,
        technicianAr,
        cost: parseFloat(cost),
        partsUsed,
        partsUsedAr,
        nextMaintenanceDate: nextMaintenanceDate || undefined,
        notes,
        notesAr,
      })
    }

    handleClose()
  }

  const handleClose = () => {
    setType('preventive')
    setDescription('')
    setDescriptionAr('')
    setDate(new Date().toISOString().split('T')[0])
    setTechnician('')
    setTechnicianAr('')
    setCost('')
    setPartsUsed('')
    setPartsUsedAr('')
    setNextMaintenanceDate('')
    setNotes('')
    setNotesAr('')
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
            <h2 className="text-xl font-bold text-gray-900 font-cairo">
              {isEditing ? 'تعديل الصيانة' : 'تسجيل صيانة'}
            </h2>
            {equipmentNameAr && (
              <p className="text-sm text-gray-500 font-cairo">{equipmentNameAr}</p>
            )}
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
          {/* Maintenance Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              نوع الصيانة
            </label>
            <div className="grid grid-cols-3 gap-3">
              {maintenanceTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all font-cairo font-medium ${
                    type === option.value
                      ? 'border-[#2563eb] bg-blue-50 text-[#2563eb]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              التاريخ
            </label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              الوصف
            </label>
            <input
              type="text"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              placeholder="وصف الصيانة..."
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            />
          </div>

          {/* Technician */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              الفني
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={technicianAr}
                onChange={(e) => setTechnicianAr(e.target.value)}
                placeholder="اسم الفني..."
                required
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              التكلفة (ريال)
            </label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                min="0"
                required
                placeholder="0.00"
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
              />
            </div>
          </div>

          {/* Parts Used */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              القطع المستخدمة (اختياري)
            </label>
            <input
              type="text"
              value={partsUsedAr}
              onChange={(e) => setPartsUsedAr(e.target.value)}
              placeholder="القطع المستخدمة في الصيانة..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            />
          </div>

          {/* Next Maintenance Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              موعد الصيانة القادمة (اختياري)
            </label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={nextMaintenanceDate}
                onChange={(e) => setNextMaintenanceDate(e.target.value)}
                min={date}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notesAr}
              onChange={(e) => setNotesAr(e.target.value)}
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
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 font-cairo"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'جاري الحفظ...'
                : isEditing
                ? 'تحديث'
                : 'حفظ'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const maintenanceStatusLabels = {
  scheduled: { label: 'مجدولة' },
  'in-progress': { label: 'قيد التنفيذ' },
  completed: { label: 'مكتملة' },
  cancelled: { label: 'ملغاة' },
}
