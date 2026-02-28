import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useCreateProject, useUpdateProject, useClients, useManagers, type CreateProjectData, type UpdateProjectData } from '@/hooks/useProjects'
import { Building2, X } from 'lucide-react'

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
// PROJECT MODAL COMPONENT
// ============================================================================
interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project?: any
}

export function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const isEditing = !!project

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    code: '',
    description: '',
    descriptionAr: '',
    clientId: '',
    managerId: '',
    budget: '',
    startDate: '',
    endDate: '',
    location: '',
    locationAr: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: clients } = useClients()
  const { data: managers } = useManagers()
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData({
          name: project.name || '',
          nameAr: project.nameAr || '',
          code: project.code || '',
          description: project.description || '',
          descriptionAr: project.descriptionAr || '',
          clientId: project.clientId || '',
          managerId: project.managerId || '',
          budget: project.budget?.toString() || '',
          startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
          endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
          location: project.location || '',
          locationAr: project.locationAr || '',
        })
      } else {
        // Generate project code for new projects
        const timestamp = Date.now().toString().slice(-6)
        setFormData((prev) => ({
          ...prev,
          code: `PRJ-${timestamp}`,
          budget: '',
          startDate: '',
          endDate: '',
        }))
      }
      setErrors({})
    }
  }, [isOpen, project])

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
      newErrors.name = 'اسم المشروع مطلوب'
    }
    if (!formData.nameAr.trim()) {
      newErrors.nameAr = 'الاسم العربي مطلوب'
    }
    if (!formData.code.trim()) {
      newErrors.code = 'رمز المشروع مطلوب'
    }
    if (!formData.clientId) {
      newErrors.clientId = 'العميل مطلوب'
    }
    if (!formData.managerId) {
      newErrors.managerId = 'المدير مطلوب'
    }
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'الميزانية مطلوبة'
    }
    if (!formData.startDate) {
      newErrors.startDate = 'تاريخ البداية مطلوب'
    }
    if (!formData.endDate) {
      newErrors.endDate = 'تاريخ النهاية مطلوب'
    }
    if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'الموقع مطلوب'
    }
    if (!formData.locationAr.trim()) {
      newErrors.locationAr = 'الموقع بالعربية مطلوب'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const data: CreateProjectData = {
        name: formData.name,
        nameAr: formData.nameAr,
        code: formData.code,
        description: formData.description || undefined,
        descriptionAr: formData.descriptionAr || undefined,
        clientId: formData.clientId,
        managerId: formData.managerId,
        budget: parseFloat(formData.budget),
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        locationAr: formData.locationAr,
      }

      if (isEditing && project) {
        await updateMutation.mutateAsync({ id: project.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }

      onClose()
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'تعديل المشروع' : 'مشروع جديد'}
      titleAr={isEditing ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Project Name"
            labelAr="اسم المشروع"
            required
            error={errors.name}
          >
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter project name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-sans"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label="Project Name (Arabic)"
            labelAr="اسم المشروع (عربي)"
            required
            error={errors.nameAr}
          >
            <input
              type="text"
              value={formData.nameAr}
              onChange={(e) => handleChange('nameAr', e.target.value)}
              placeholder="اسم المشروع"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-cairo text-right"
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Row 2: Code + Client + Manager */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Project Code"
            labelAr="رمز المشروع"
            required
            error={errors.code}
          >
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="PRJ-001"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-mono text-sm"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label="Client"
            labelAr="العميل"
            required
            error={errors.clientId}
          >
            <select
              value={formData.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-cairo bg-white"
              disabled={isSubmitting}
            >
              <option value="">اختر العميل</option>
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nameAr}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Project Manager"
            labelAr="مدير المشروع"
            required
            error={errors.managerId}
          >
            <select
              value={formData.managerId}
              onChange={(e) => handleChange('managerId', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-cairo bg-white"
              disabled={isSubmitting}
            >
              <option value="">اختر المدير</option>
              {managers?.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.nameAr}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Row 3: Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Description"
            labelAr="الوصف"
          >
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter project description"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-sans resize-none"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label="Description (Arabic)"
            labelAr="الوصف (عربي)"
          >
            <textarea
              value={formData.descriptionAr}
              onChange={(e) => handleChange('descriptionAr', e.target.value)}
              placeholder="وصف المشروع"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-cairo resize-none text-right"
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Row 4: Budget + Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Budget"
            labelAr="الميزانية"
            required
            error={errors.budget}
          >
            <div className="relative">
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => handleChange('budget', e.target.value)}
                placeholder="0.00"
                min="0"
                step="1000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-sans pl-16"
                disabled={isSubmitting}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-cairo">
                ريال
              </span>
            </div>
          </FormField>

          <FormField
            label="Start Date"
            labelAr="تاريخ البداية"
            required
            error={errors.startDate}
          >
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-cairo"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label="End Date"
            labelAr="تاريخ النهاية"
            required
            error={errors.endDate}
          >
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              min={formData.startDate}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-cairo"
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Row 5: Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Location"
            labelAr="الموقع"
            required
            error={errors.location}
          >
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Enter location"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-sans"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label="Location (Arabic)"
            labelAr="الموقع (عربي)"
            required
            error={errors.locationAr}
          >
            <input
              type="text"
              value={formData.locationAr}
              onChange={(e) => handleChange('locationAr', e.target.value)}
              placeholder="الموقع"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-cairo text-right"
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="font-cairo"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="font-cairo"
          >
            {isEditing ? 'حفظ التغييرات' : 'إنشاء المشروع'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
