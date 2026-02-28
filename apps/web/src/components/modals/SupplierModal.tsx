import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import {
  useCreateSupplier,
  useUpdateSupplier,
  supplierCategoryLabels,
  type CreateSupplierData,
  type UpdateSupplierData,
  type SupplierCategory,
} from '@/hooks/useSuppliers'
import { Building2, X, User, Phone, Mail, MapPin, Star } from 'lucide-react'

// ============================================================================
// FORM INPUT COMPONENT
// ============================================================================
function FormField({
  label,
  labelAr,
  required = false,
  error,
  children,
}: {
  label: string
  labelAr: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
        {labelAr}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600 font-cairo">{error}</p>
      )}
    </div>
  )
}

// ============================================================================
// SUPPLIER MODAL COMPONENT
// ============================================================================
interface SupplierModalProps {
  isOpen: boolean
  onClose: () => void
  supplier?: any
}

export function SupplierModal({ isOpen, onClose, supplier }: SupplierModalProps) {
  const isEditing = !!supplier

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    category: 'materials' as SupplierCategory,
    contactPerson: '',
    contactPersonAr: '',
    phone: '',
    email: '',
    address: '',
    addressAr: '',
    rating: '5',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMutation = useCreateSupplier()
  const updateMutation = useUpdateSupplier()

  // Reset form when modal opens/closes or supplier changes
  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData({
          name: supplier.name || '',
          nameAr: supplier.nameAr || '',
          category: supplier.category || 'materials',
          contactPerson: supplier.contactPerson || '',
          contactPersonAr: supplier.contactPersonAr || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          address: supplier.address || '',
          addressAr: supplier.addressAr || '',
          rating: supplier.rating?.toString() || '5',
        })
      } else {
        setFormData({
          name: '',
          nameAr: '',
          category: 'materials',
          contactPerson: '',
          contactPersonAr: '',
          phone: '',
          email: '',
          address: '',
          addressAr: '',
          rating: '5',
        })
      }
      setErrors({})
    }
  }, [isOpen, supplier])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المورد مطلوب'
    }
    if (!formData.nameAr.trim()) {
      newErrors.nameAr = 'الاسم العربي مطلوب'
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'اسم المسؤول مطلوب'
    }
    if (!formData.contactPersonAr.trim()) {
      newErrors.contactPersonAr = 'الاسم العربي للمسؤول مطلوب'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب'
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب'
    }
    if (!formData.addressAr.trim()) {
      newErrors.addressAr = 'العنوان العربي مطلوب'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const submitData = {
        ...formData,
        rating: parseInt(formData.rating),
      } as CreateSupplierData

      if (isEditing) {
        await updateMutation.mutateAsync({ id: supplier.id, ...submitData } as UpdateSupplierData)
      } else {
        await createMutation.mutateAsync(submitData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving supplier:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'تعديل المورد' : 'إضافة مورد جديد'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-[#2563eb]" />
            <h3 className="font-semibold text-gray-900 font-cairo">المعلومات الأساسية</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Supplier Name"
              labelAr="اسم المورد"
              required
              error={errors.name}
            >
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                placeholder="Supplier Name"
              />
            </FormField>

            <FormField
              label="Arabic Name"
              labelAr="الاسم العربي"
              required
              error={errors.nameAr}
            >
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => handleChange('nameAr', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                placeholder="الاسم العربي"
              />
            </FormField>

            <FormField
              label="Category"
              labelAr="الفئة"
              required
              error={errors.category}
            >
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
              >
                {Object.entries(supplierCategoryLabels).map(([key, { labelAr, icon }]) => (
                  <option key={key} value={key}>
                    {icon} {labelAr}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Rating"
              labelAr="التقييم"
              error={errors.rating}
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <select
                  value={formData.rating}
                  onChange={(e) => handleChange('rating', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                >
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} {rating === 1 ? 'نجمة' : 'نجوم'}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>
          </div>
        </div>

        {/* Contact Person */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-[#2563eb]" />
            <h3 className="font-semibold text-gray-900 font-cairo">بيانات التواصل</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Contact Person"
              labelAr="المسؤول"
              required
              error={errors.contactPerson}
            >
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                placeholder="Contact Person"
              />
            </FormField>

            <FormField
              label="Arabic Name"
              labelAr="الاسم العربي"
              required
              error={errors.contactPersonAr}
            >
              <input
                type="text"
                value={formData.contactPersonAr}
                onChange={(e) => handleChange('contactPersonAr', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                placeholder="الاسم العربي"
              />
            </FormField>

            <FormField
              label="Phone"
              labelAr="الهاتف"
              required
              error={errors.phone}
            >
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  placeholder="+966-5x-xxxxxxx"
                />
              </div>
            </FormField>

            <FormField
              label="Email"
              labelAr="البريد الإلكتروني"
              error={errors.email}
            >
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  placeholder="email@example.com"
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* Address */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#2563eb]" />
            <h3 className="font-semibold text-gray-900 font-cairo">العنوان</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Address"
              labelAr="العنوان"
              required
              error={errors.address}
            >
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                placeholder="Address"
              />
            </FormField>

            <FormField
              label="Arabic Address"
              labelAr="العنوان بالعربي"
              required
              error={errors.addressAr}
            >
              <input
                type="text"
                value={formData.addressAr}
                onChange={(e) => handleChange('addressAr', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                placeholder="العنوان بالعربي"
              />
            </FormField>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="font-cairo"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="font-cairo"
          >
            {isSubmitting ? 'جاري الحفظ...' : isEditing ? 'حفظ التغييرات' : 'إضافة المورد'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
