import { useState, useEffect } from 'react'
import { X, User, FileText, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/ui/FileUpload'
import {
  useCreateEmployee,
  useUpdateEmployee,
  generateEmployeeNumber,
  departmentOptions,
  nationalityOptions,
  type CreateEmployeeData,
  type Employee,
} from '@/hooks/useEmployees'
import { useProjects } from '@/hooks/useProjects'

interface EmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  editEmployee?: Employee
}

export function EmployeeModal({ isOpen, onClose, editEmployee }: EmployeeModalProps) {
  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee()
  const { data: projectsResponse } = useProjects()

  const projects = projectsResponse?.projects || []

  const [employeeNumber, setEmployeeNumber] = useState('')
  const [name, setName] = useState('')
  const [nameAr, setNameAr] = useState('')
  const [nationalityCode, setNationalityCode] = useState('SA')
  const [jobTitle, setJobTitle] = useState('')
  const [jobTitleAr, setJobTitleAr] = useState('')
  const [department, setDepartment] = useState('')
  const [projectId, setProjectId] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [salary, setSalary] = useState('')
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0])
  const [residencyNumber, setResidencyNumber] = useState('')
  const [residencyExpiryDate, setResidencyExpiryDate] = useState('')
  const [passportNumber, setPassportNumber] = useState('')
  const [passportExpiryDate, setPassportExpiryDate] = useState('')
  const [contractStartDate, setContractStartDate] = useState('')
  const [contractEndDate, setContractEndDate] = useState('')
  const [city, setCity] = useState('')
  const [cityAr, setCityAr] = useState('')
  const [address, setAddress] = useState('')
  const [addressAr, setAddressAr] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [residencyDocumentUrl, setResidencyDocumentUrl] = useState('')
  const [passportDocumentUrl, setPassportDocumentUrl] = useState('')
  const [contractDocumentUrl, setContractDocumentUrl] = useState('')

  const isEditing = !!editEmployee

  useEffect(() => {
    if (editEmployee) {
      setEmployeeNumber(editEmployee.employeeNumber)
      setName(editEmployee.name)
      setNameAr(editEmployee.nameAr)
      setNationalityCode(editEmployee.nationalityCode)
      setJobTitle(editEmployee.jobTitle)
      setJobTitleAr(editEmployee.jobTitleAr)
      setDepartment(editEmployee.department)
      setProjectId(editEmployee.projectId || '')
      setPhone(editEmployee.phone || '')
      setEmail(editEmployee.email || '')
      setSalary(editEmployee.salary.toString())
      setJoiningDate(editEmployee.joiningDate.split('T')[0])
      setResidencyNumber(editEmployee.residencyNumber || '')
      setResidencyExpiryDate(editEmployee.residencyExpiryDate || '')
      setPassportNumber(editEmployee.passportNumber || '')
      setPassportExpiryDate(editEmployee.passportExpiryDate || '')
      setContractStartDate(editEmployee.contractStartDate || '')
      setContractEndDate(editEmployee.contractEndDate || '')
      setCity(editEmployee.city || '')
      setCityAr(editEmployee.cityAr || '')
      setAddress(editEmployee.address || '')
      setAddressAr(editEmployee.addressAr || '')
      setEmergencyContactName(editEmployee.emergencyContactName || '')
      setEmergencyContactPhone(editEmployee.emergencyContactPhone || '')
      setPhotoUrl(editEmployee.photoUrl || '')
      setResidencyDocumentUrl(editEmployee.residencyDocumentUrl || '')
      setPassportDocumentUrl(editEmployee.passportDocumentUrl || '')
      setContractDocumentUrl(editEmployee.contractDocumentUrl || '')
    } else {
      // Auto-generate employee number for new employee
      setEmployeeNumber(generateEmployeeNumber())
    }
  }, [editEmployee, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data: CreateEmployeeData = {
      employeeNumber,
      name,
      nameAr,
      nationality: nationalityOptions.find(n => n.code === nationalityCode)?.nameAr || '',
      nationalityCode,
      jobId: `job-${Date.now()}`,
      jobTitle,
      jobTitleAr,
      department,
      departmentAr: departmentOptions.find(d => d.value === department)?.labelAr || '',
      projectId: projectId || undefined,
      phone: phone || undefined,
      email: email || undefined,
      salary: parseFloat(salary),
      joiningDate,
      residencyNumber: residencyNumber || undefined,
      residencyExpiryDate: residencyExpiryDate || undefined,
      passportNumber: passportNumber || undefined,
      passportExpiryDate: passportExpiryDate || undefined,
      contractStartDate: contractStartDate || undefined,
      contractEndDate: contractEndDate || undefined,
      city: city || undefined,
      cityAr: cityAr || undefined,
      address: address || undefined,
      addressAr: addressAr || undefined,
      emergencyContactName: emergencyContactName || undefined,
      emergencyContactPhone: emergencyContactPhone || undefined,
      photoUrl: photoUrl || undefined,
      residencyDocumentUrl: residencyDocumentUrl || undefined,
      passportDocumentUrl: passportDocumentUrl || undefined,
      contractDocumentUrl: contractDocumentUrl || undefined,
    }

    if (isEditing && editEmployee) {
      updateMutation.mutate({
        id: editEmployee.id,
        data,
      })
    } else {
      createMutation.mutate(data)
    }

    handleClose()
  }

  const handleClose = () => {
    setEmployeeNumber(generateEmployeeNumber())
    setName('')
    setNameAr('')
    setNationalityCode('SA')
    setJobTitle('')
    setJobTitleAr('')
    setDepartment('')
    setProjectId('')
    setPhone('')
    setEmail('')
    setSalary('')
    setJoiningDate(new Date().toISOString().split('T')[0])
    setResidencyNumber('')
    setResidencyExpiryDate('')
    setPassportNumber('')
    setPassportExpiryDate('')
    setContractStartDate('')
    setContractEndDate('')
    setCity('')
    setCityAr('')
    setAddress('')
    setAddressAr('')
    setEmergencyContactName('')
    setEmergencyContactPhone('')
    setPhotoUrl('')
    setResidencyDocumentUrl('')
    setPassportDocumentUrl('')
    setContractDocumentUrl('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-cairo">
              {isEditing ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
            </h2>
            <p className="text-sm text-gray-500 font-cairo">
              {isEditing ? 'Employee Information' : 'Add New Employee'}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              المعلومات الأساسية
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  رقم الموظف * <span className="text-xs text-gray-400 font-normal">(تلقائي)</span>
                </label>
                <input
                  type="text"
                  value={employeeNumber}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-sans cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  الاسم (عربي) *
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="الاسم باللغة العربية"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  الاسم (إنجليزي) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name in English"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  الجنسية *
                </label>
                <select
                  value={nationalityCode}
                  onChange={(e) => setNationalityCode(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                >
                  {nationalityOptions.map((nation) => (
                    <option key={nation.code} value={nation.code}>
                      {nation.flag} {nation.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  المسمى الوظيفي *
                </label>
                <input
                  type="text"
                  value={jobTitleAr}
                  onChange={(e) => setJobTitleAr(e.target.value)}
                  placeholder="المسمى الوظيفي بالعربي"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  المسمى الوظيفي (EN) *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Job Title"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  القسم *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                >
                  <option value="">اختر القسم...</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.labelAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  المشروع
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                >
                  <option value="">غير محدد</option>
                  {projects.filter(p => p.status === 'active').map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  الراتب (ريال) *
                </label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="5000"
                  required
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  تاريخ الانضمام *
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="md:col-span-2 lg:col-span-3">
            <FileUpload
              labelAr="الصورة الشخصية"
              value={photoUrl}
              onChange={setPhotoUrl}
              accept="image/*"
              fileType="image"
              maxSize={2}
              imageType="photo"
            />
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              معلومات الاتصال
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+9665XXXXXXXX"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              الوثائق
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  رقم الإقامة
                </label>
                <input
                  type="text"
                  value={residencyNumber}
                  onChange={(e) => setResidencyNumber(e.target.value)}
                  placeholder="رقم الإقامة"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  تاريخ انتهاء الإقامة
                </label>
                <input
                  type="date"
                  value={residencyExpiryDate}
                  onChange={(e) => setResidencyExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  رقم الجواز
                </label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="رقم الجواز"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  تاريخ انتهاء الجواز
                </label>
                <input
                  type="date"
                  value={passportExpiryDate}
                  onChange={(e) => setPassportExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  بداية العقد
                </label>
                <input
                  type="date"
                  value={contractStartDate}
                  onChange={(e) => setContractStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  نهاية العقد
                </label>
                <input
                  type="date"
                  value={contractEndDate}
                  onChange={(e) => setContractEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>
            </div>

            {/* Document Uploads */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <FileUpload
                labelAr="وثيقة الإقامة"
                value={residencyDocumentUrl}
                onChange={setResidencyDocumentUrl}
                accept=".pdf,.jpg,.jpeg,.png"
                fileType="document"
                maxSize={5}
                imageType="residencyCard"
                onIdCardDataExtracted={(data) => {
                  if (data.number) setResidencyNumber(data.number)
                  if (data.expiryDate) setResidencyExpiryDate(data.expiryDate)
                }}
              />

              <FileUpload
                labelAr="وثيقة الجواز"
                value={passportDocumentUrl}
                onChange={setPassportDocumentUrl}
                accept=".pdf,.jpg,.jpeg,.png"
                fileType="document"
                maxSize={5}
                imageType="passportCard"
                onIdCardDataExtracted={(data) => {
                  if (data.number) setPassportNumber(data.number)
                  if (data.expiryDate) setPassportExpiryDate(data.expiryDate)
                }}
              />

              <FileUpload
                labelAr="وثيقة العقد"
                value={contractDocumentUrl}
                onChange={setContractDocumentUrl}
                accept=".pdf,.jpg,.jpeg,.png"
                fileType="document"
                maxSize={5}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              العنوان
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  المدينة
                </label>
                <input
                  type="text"
                  value={cityAr}
                  onChange={(e) => setCityAr(e.target.value)}
                  placeholder="المدينة"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  العنوان
                </label>
                <input
                  type="text"
                  value={addressAr}
                  onChange={(e) => setAddressAr(e.target.value)}
                  placeholder="العنوان بالتفصيل"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              للطوارئ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  اسم جهة الاتصال
                </label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="اسم الشخص للمطارئ"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+9665XXXXXXXX"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
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
              {createMutation.isPending || updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
