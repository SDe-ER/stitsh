import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useCreateClient, useUpdateClient, type CreateClientData, type UpdateClientData } from '@/hooks/useSuppliers'
import { Building2, X, User, Phone, Mail, MapPin, FileText } from 'lucide-react'

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
// CLIENT MODAL COMPONENT
// ============================================================================
interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  client?: any
}

export function ClientModal({ isOpen, onClose, client }: ClientModalProps) {
  const isEditing = !!client

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    commercialRegistration: '',
    vatNumber: '',
    contactPerson: '',
    contactPersonAr: '',
    phone: '',
    email: '',
    address: '',
    addressAr: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()

  // Reset form when modal opens/closes or client changes
  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData({
          name: client.name || '',
          nameAr: client.nameAr || '',
          commercialRegistration: client.commercialRegistration || '',
          vatNumber: client.vatNumber || '',
          contactPerson: client.contactPerson || '',
          contactPersonAr: client.contactPersonAr || '',
          phone: client.phone || '',
          email: client.email || '',
          address: client.address || '',
          addressAr: client.addressAr || '',
        })
      } else {
        setFormData({
          name: '',
          nameAr: '',
          commercialRegistration: '',
          vatNumber: '',
          contactPerson: '',
          contactPersonAr: '',
          phone: '',
          email: '',
          address: '',
          addressAr: '',
        })
      }
      setErrors({})
    }
  }, [isOpen, client])

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
      newErrors.name = 'اسم العميل مطلوب'
    }
    if (!formData.nameAr.trim()) {
      newErrors.nameAr = 'الاسم العربي مطلوب'
    }
    if (!formData.commercialRegistration.trim()) {
      newErrors.commercialRegistration = 'رقم السجل التجاري مطلوب'
    }
    if (!formData.vatNumber.trim()) {
      newErrors.vatNumber = 'رقم الضريبة مطلوب'
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
      if (isEditing) {
        await updateMutation.mutateAsync({ id: client.id, ...formData } as UpdateClientData)
      } else {
        await createMutation.mutateAsync(formData as CreateClientData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving client:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'تعديل العميل' : 'إضافة عميل جديد'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-[#2563eb]" />
            <h3 className="font-semibold text-gray-900 font-cairo">المعلومات الأساسية</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Client Name"
              labelAr="اسم العميل"
              required
              error={errors.name}
            >
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                placeholder="Client Name"
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
              label="Commercial Registration"
              labelAr="رقم السجل التجاري"
              required
              error={errors.commercialRegistration}
            >
              <input
                type="text"
                value={formData.commercialRegistration}
                onChange={(e) => handleChange('commercialRegistration', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                placeholder="1xxxxxxxxx"
              />
            </FormField>

            <FormField
              label="VAT Number"
              labelAr="رقم الضريبة"
              required
              error={errors.vatNumber}
            >
              <input
                type="text"
                value={formData.vatNumber}
                onChange={(e) => handleChange('vatNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                placeholder="3xxxxxxxxxxxxx"
              />
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
            {isSubmitting ? 'جاري الحفظ...' : isEditing ? 'حفظ التغييرات' : 'إضافة العميل'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
