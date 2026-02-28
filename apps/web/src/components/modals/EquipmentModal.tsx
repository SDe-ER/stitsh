import { useState, useEffect } from 'react'
import { X, Settings, MapPin, DollarSign, FileText, Package, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  useCreateEquipment,
  useUpdateEquipment,
  equipmentTypeLabels,
  equipmentStatusLabels,
  equipmentOwnershipLabels,
  type CreateEquipmentData,
  type Equipment,
  type EquipmentType,
  type EquipmentStatus,
  type EquipmentOwnership,
} from '@/hooks/useEquipment'

interface EquipmentModalProps {
  isOpen: boolean
  onClose: () => void
  editEquipment?: Equipment
}

const equipmentTypeOptions = Object.entries(equipmentTypeLabels).map(([key, { label }]) => ({
  value: key as EquipmentType,
  label,
}))

const statusOptions = Object.entries(equipmentStatusLabels).map(([key, { label }]) => ({
  value: key as EquipmentStatus,
  label,
}))

const ownershipOptions = Object.entries(equipmentOwnershipLabels).map(([key, { label }]) => ({
  value: key as EquipmentOwnership,
  label,
}))

export function EquipmentModal({ isOpen, onClose, editEquipment }: EquipmentModalProps) {
  const createMutation = useCreateEquipment()
  const updateMutation = useUpdateEquipment()

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [type, setType] = useState<EquipmentType>('excavator')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [status, setStatus] = useState<EquipmentStatus>('active')
  const [ownership, setOwnership] = useState<EquipmentOwnership>('owned')
  const [capacity, setCapacity] = useState('')
  const [capacityUnit, setCapacityUnit] = useState('m³')
  const [weight, setWeight] = useState('')
  const [power, setPower] = useState('')
  const [fuelCapacity, setFuelCapacity] = useState('')
  const [serviceIntervalHours, setServiceIntervalHours] = useState('500')
  const [purchaseCost, setPurchaseCost] = useState('')
  const [dailyOperatingCost, setDailyOperatingCost] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [currentLocation, setCurrentLocation] = useState('')
  const [currentLocationAr, setCurrentLocationAr] = useState('')
  const [tuvDocumentUrl, setTuvDocumentUrl] = useState('')
  const [tuvExpiryDate, setTuvExpiryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [notesAr, setNotesAr] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const isEditing = !!editEquipment

  useEffect(() => {
    if (editEquipment) {
      setCode(editEquipment.code)
      setName(editEquipment.name)
      setNameAr(editEquipment.nameAr)
      setType(editEquipment.type)
      setBrand(editEquipment.brand)
      setModel(editEquipment.model)
      setYear(editEquipment.year.toString())
      setStatus(editEquipment.status)
      setOwnership(editEquipment.ownership)
      setCapacity(editEquipment.capacity || '')
      setCapacityUnit(editEquipment.capacityUnit || 'm³')
      setWeight(editEquipment.weight?.toString() || '')
      setPower(editEquipment.power?.toString() || '')
      setFuelCapacity(editEquipment.fuelCapacity?.toString() || '')
      setServiceIntervalHours(editEquipment.serviceIntervalHours?.toString() || '500')
      setPurchaseCost(editEquipment.purchaseCost?.toString() || '')
      setDailyOperatingCost(editEquipment.dailyOperatingCost?.toString() || '')
      setHourlyRate(editEquipment.hourlyRate?.toString() || '')
      setCurrentLocation(editEquipment.currentLocation || '')
      setCurrentLocationAr(editEquipment.currentLocationAr || '')
      setTuvDocumentUrl(editEquipment.tuvDocumentUrl || '')
      setTuvExpiryDate(editEquipment.tuvExpiryDate || '')
      setNotes(editEquipment.notes || '')
      setNotesAr(editEquipment.notesAr || '')
      setImageUrl(editEquipment.imageUrl || '')
    }
  }, [editEquipment])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data: CreateEquipmentData = {
      code,
      name,
      nameAr,
      type,
      brand,
      model,
      year: parseInt(year),
      ownership,
      capacity: capacity || undefined,
      capacityUnit: capacityUnit || undefined,
      weight: weight ? parseFloat(weight) : undefined,
      power: power ? parseFloat(power) : undefined,
      fuelCapacity: fuelCapacity ? parseFloat(fuelCapacity) : undefined,
      serviceIntervalHours: serviceIntervalHours ? parseFloat(serviceIntervalHours) : undefined,
      purchaseCost: purchaseCost ? parseFloat(purchaseCost) : undefined,
      dailyOperatingCost: dailyOperatingCost ? parseFloat(dailyOperatingCost) : undefined,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      currentLocation: currentLocation || undefined,
      currentLocationAr: currentLocationAr || undefined,
      tuvDocumentUrl: tuvDocumentUrl || undefined,
      tuvExpiryDate: tuvExpiryDate || undefined,
      notes: notes || undefined,
      notesAr: notesAr || undefined,
      imageUrl: imageUrl || undefined,
    }

    if (isEditing && editEquipment) {
      updateMutation.mutate({
        id: editEquipment.id,
        data: { ...data, status },
      })
    } else {
      createMutation.mutate(data)
    }

    handleClose()
  }

  const handleClose = () => {
    setCode('')
    setName('')
    setNameAr('')
    setType('excavator')
    setBrand('')
    setModel('')
    setYear(new Date().getFullYear().toString())
    setStatus('active')
    setOwnership('owned')
    setCapacity('')
    setCapacityUnit('m³')
    setWeight('')
    setPower('')
    setFuelCapacity('')
    setServiceIntervalHours('500')
    setPurchaseCost('')
    setDailyOperatingCost('')
    setHourlyRate('')
    setCurrentLocation('')
    setCurrentLocationAr('')
    setTuvDocumentUrl('')
    setTuvExpiryDate('')
    setNotes('')
    setNotesAr('')
    setImageUrl('')
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-cairo">
              {isEditing ? 'تعديل المعدة' : 'إضافة معدة جديدة'}
            </h2>
            <p className="text-sm text-gray-500 font-cairo">
              {isEditing ? 'تعديل بيانات المعدة' : 'أدخل بيانات المعدة الجديدة'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              المعلومات الأساسية
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  الرمز *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="EQ-001"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              {/* Equipment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  نوع المعدة *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EquipmentType)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                >
                  {equipmentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name (English) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  الاسم (إنجليزي) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Caterpillar 320 GC"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              {/* Name (Arabic) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  الاسم (عربي) *
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="كاتربيلر 320 جي سي"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  العلامة التجارية *
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Caterpillar"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  الموديل *
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="320 GC"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  سنة الصنع *
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="1980"
                  max={new Date().getFullYear() + 1}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  الحالة *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Specifications Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              المواصفات (اختياري)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  السعة
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="1.2"
                    step="0.1"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                  <select
                    value={capacityUnit}
                    onChange={(e) => setCapacityUnit(e.target.value)}
                    className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans text-sm"
                  >
                    <option value="m³">m³</option>
                    <option value="tons">tons</option>
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="tph">tph</option>
                  </select>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  الوزن (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="14000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              {/* Power */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  القدرة (حصان)
                </label>
                <input
                  type="number"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  placeholder="120"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              {/* Fuel Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  سعة الوقود (لتر)
                </label>
                <input
                  type="number"
                  value={fuelCapacity}
                  onChange={(e) => setFuelCapacity(e.target.value)}
                  placeholder="300"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              {/* Service Interval */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  فترة الصيانة (ساعة)
                </label>
                <input
                  type="number"
                  value={serviceIntervalHours}
                  onChange={(e) => setServiceIntervalHours(e.target.value)}
                  placeholder="500"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              الموقع (اختياري)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  الموقع (إنجليزي)
                </label>
                <input
                  type="text"
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="Riyadh - Site A"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  الموقع (عربي)
                </label>
                <input
                  type="text"
                  value={currentLocationAr}
                  onChange={(e) => setCurrentLocationAr(e.target.value)}
                  placeholder="الرياض - الموقع أ"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>
            </div>
          </div>

          {/* Costs Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              التكاليف (اختياري)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  تكلفة الشراء (ريال)
                </label>
                <input
                  type="number"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  placeholder="450000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  التكلفة اليومية (ريال)
                </label>
                <input
                  type="number"
                  value={dailyOperatingCost}
                  onChange={(e) => setDailyOperatingCost(e.target.value)}
                  placeholder="350"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  المعدل بالساعة (ريال)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="اترك فارغاً للمعدل الافتراضي"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
                <p className="text-xs text-gray-500 mt-1 font-cairo">
                  يترك فارغاً لاستخدام المعدل الافتراضي
                </p>
              </div>
            </div>
          </div>

          {/* Ownership Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              الملكية
            </h3>

            <div className="flex gap-4">
              {ownershipOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ownership"
                    value={option.value}
                    checked={ownership === option.value}
                    onChange={(e) => setOwnership(e.target.value as EquipmentOwnership)}
                    className="w-4 h-4 text-[#2563eb] focus:ring-[#2563eb]"
                  />
                  <span className="text-sm font-medium text-gray-700 font-cairo">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* TUV Documents Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              مستندات TUV (اختياري)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  رابط المستند
                </label>
                <div className="relative">
                  <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={tuvDocumentUrl}
                    onChange={(e) => setTuvDocumentUrl(e.target.value)}
                    placeholder="https://example.com/document.pdf"
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  تاريخ انتهاء الصلاحية
                </label>
                <input
                  type="date"
                  value={tuvExpiryDate}
                  onChange={(e) => setTuvExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
              رابط الصورة (اختياري)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
            />
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  onError={() => setImageUrl('')}
                />
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              ملاحظات (اختياري)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  ملاحظات (إنجليزي)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  ملاحظات (عربي)
                </label>
                <textarea
                  value={notesAr}
                  onChange={(e) => setNotesAr(e.target.value)}
                  rows={3}
                  placeholder="ملاحظات إضافية..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo resize-none"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-200">
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
                : 'إضافة'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
