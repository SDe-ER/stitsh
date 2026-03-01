'use client'

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { useCreateEmployee } from '@/hooks/useEmployees'
import { nationalityOptions } from '@/hooks/useEmployees'
import { documentTypeLabels, type DocumentType } from '@/hooks/useEmployeeDocuments'

const jobTitleOptions = [
  { value: 'operator', labelAr: 'مشغل معدات ثقيلة' },
  { value: 'engineer', labelAr: 'مهندس موقع' },
  { value: 'supervisor', labelAr: 'مشرف عمال' },
  { value: 'driver', labelAr: 'سائق شاحنة' },
]

// Document type mapping
const documentFieldMapping: Record<string, string> = {
  idCardFront: 'ID_CARD',
  idCardBack: 'ID_CARD',
  drivingLicense: 'DRIVING_LICENSE',
  medicalInsurance: 'MEDICAL_INSURANCE',
  iqama: 'IQAMA',
  passport: 'PASSPORT',
}

// API function to upload employee document
async function uploadEmployeeDocumentApi(employeeId: string, data: { type: DocumentType; expiryDate?: string; notes?: string }, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', data.type)
  if (data.expiryDate) {
    formData.append('expiryDate', data.expiryDate)
  }
  if (data.notes) {
    formData.append('notes', data.notes)
  }

  const response = await fetch(`/api/employees/${employeeId}/documents`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Failed to upload document')
  }

  return response.json()
}

export default function AddEmployeePage() {
  const navigate = useNavigate()
  const createMutation = useCreateEmployee()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const documentInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadingDocuments, setUploadingDocuments] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedDocsCount, setUploadedDocsCount] = useState(0)

  // Form state
  const [formData, setFormData] = useState({
    nameAr: '',
    name: '',
    residencyNumber: '',
    nationalityCode: '',
    dateOfBirth: '',
    jobTitleAr: '',
    jobTitle: '',
    photoUrl: '',
    departmentAr: 'قسم المعدات الثقيلة',
    salary: 8500,
    salaryDecimal: '8500.00',
    phone: '',
    email: '',
    address: '',
  })

  // Documents state - enhanced with metadata
  const [documents, setDocuments] = useState<Record<string, {
    file: File | null
    type: string
    expiryDate: string
    notes?: string
  }>>({
    idCardFront: { file: null, type: 'ID_CARD', expiryDate: '', notes: '' },
    idCardBack: { file: null, type: 'ID_CARD', expiryDate: '', notes: '背面' },
    drivingLicense: { file: null, type: 'DRIVING_LICENSE', expiryDate: '', notes: '' },
    medicalInsurance: { file: null, type: 'MEDICAL_INSURANCE', expiryDate: '', notes: '' },
  })

  const [createdEmployeeId, setCreatedEmployeeId] = useState<string | null>(null)

  // Initialize document input refs
  const initDocumentInput = (docType: string) => {
    if (!documentInputRefs.current[docType]) {
      documentInputRefs.current[docType] = document.createElement('input')
      documentInputRefs.current[docType].type = 'file'
      documentInputRefs.current[docType].style.display = 'none'
      documentInputRefs.current[docType].accept = 'image/*,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      documentInputRefs.current[docType].onchange = (e) => handleDocumentInputChange(docType, e)
      document.body.appendChild(documentInputRefs.current[docType])
    }
  }

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        setFormData({ ...formData, photoUrl: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle document input change
  const handleDocumentInputChange = (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت')
        return
      }

      setDocuments({
        ...documents,
        [docType]: {
          ...documents[docType],
          file,
        }
      })
    }
  }

  // Handle document upload click
  const handleDocumentUploadClick = (docType: string) => {
    initDocumentInput(docType)
    documentInputRefs.current[docType]?.click()
  }

  // Handle document remove
  const handleDocumentRemove = (docType: string) => {
    setDocuments({
      ...documents,
      [docType]: {
        ...documents[docType],
        file: null,
      }
    })
  }

  // Update document metadata
  const updateDocumentMeta = (docType: string, field: 'expiryDate' | 'notes', value: string) => {
    setDocuments({
      ...documents,
      [docType]: {
        ...documents[docType],
        [field]: value,
      }
    })
  }

  // Validate required documents
  const validateDocuments = () => {
    const requiredDocs: Record<string, string[]> = {
      idCardFront: ['ID_CARD'],
    }
    return true // Documents are optional for now
  }

  // Upload documents after employee creation
  const uploadDocuments = async (employeeId: string) => {
    const docsToUpload = Object.entries(documents).filter(([_, doc]) => doc.file !== null)

    if (docsToUpload.length === 0) {
      return true
    }

    setUploadingDocuments(true)
    let uploadedCount = 0
    const totalDocs = docsToUpload.length

    for (const [docKey, docData] of docsToUpload) {
      try {
        await uploadEmployeeDocumentApi(employeeId, {
          type: docData.type as DocumentType,
          expiryDate: docData.expiryDate || undefined,
          notes: docData.notes,
        }, docData.file!)
        uploadedCount++
        setUploadProgress(Math.round((uploadedCount / totalDocs) * 100))
      } catch (error) {
        console.error(`Failed to upload ${docKey}:`, error)
      }
    }

    setUploadingDocuments(false)
    setUploadedDocsCount(uploadedCount)
    return uploadedCount > 0
  }

  // Handle form submit
  const handleSubmit = () => {
    // Validate required fields
    if (!formData.nameAr || !formData.residencyNumber || !formData.nationalityCode || !formData.dateOfBirth || !formData.jobTitleAr) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة')
      return
    }

    // Create employee first
    createMutation.mutate(formData, {
      onSuccess: async (result: any) => {
        const employeeId = result?.data?.id || result?.id
        if (employeeId) {
          setCreatedEmployeeId(employeeId)

          // Upload documents after employee creation
          const docsUploaded = await uploadDocuments(employeeId)

          // Navigate to employee profile
          setTimeout(() => {
            navigate(`/hr/employees/${employeeId}`)
          }, 500)
        }
      },
      onError: (error) => {
        console.error('Failed to create employee:', error)
        alert('فشل إنشاء الموظف')
      }
    })
  }

  // Get document file name for display
  const getDocumentFileName = (docKey: string) => {
    const doc = documents[docKey]
    if (doc?.file) {
      return doc.file.name
    }
    return ''
  }

  // Get document icon
  const getDocumentIcon = (docKey: string) => {
    const doc = documents[docKey]
    const type = doc?.type || 'OTHER'
    const iconMap: Record<string, string> = {
      ID_CARD: 'badge',
      PASSPORT: 'passport',
      DRIVING_LICENSE: 'description',
      MEDICAL_INSURANCE: 'local_hospital',
      IQAMA: 'credit_card',
    }
    return iconMap[type] || 'description'
  }

  return (
    <AppLayout titleAr="إضافة موظف">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shadow-sm flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/hr/employees')}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800">إضافة موظف جديد</h2>
            <span className="text-xs text-slate-500">إدارة الموارد البشرية • ملفات الموظفين</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/hr/employees')}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || uploadingDocuments}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            {createMutation.isPending ? 'جاري الحفظ...' : uploadingDocuments ? `جاري رفع المستندات (${uploadProgress}%)` : 'حفظ'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          {/* Progress Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between w-full relative">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-200 -z-10 rounded-full"></div>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold shadow-lg ring-4 ring-white ${currentStep >= 1 ? 'bg-[#2563eb]' : 'bg-slate-200'}`}>1</div>
                <span className={`text-sm ${currentStep >= 1 ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>البيانات الشخصية</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold shadow-lg ring-4 ring-white ${currentStep >= 2 ? 'bg-[#2563eb]' : 'bg-slate-200'}`}>2</div>
                <span className={`text-sm ${currentStep >= 2 ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>الوثائق الرسمية</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold shadow-lg ring-4 ring-white ${currentStep >= 3 ? 'bg-[#2563eb]' : 'bg-slate-200'}`}>3</div>
                <span className={`text-sm ${currentStep >= 3 ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>البيانات المالية</span>
              </div>
            </div>
          </div>

          {/* Step 1: Personal Info */}
          <div className={`${currentStep === 1 ? 'block' : 'hidden'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Photo Upload */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">الصورة الشخصية</h3>
                  <div className="relative group cursor-pointer w-48 h-48 mx-auto mb-6" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-full h-full rounded-full border-4 border-slate-100 bg-slate-50 flex flex-col items-center justify-center overflow-hidden group-hover:border-[#2563eb]/30 transition-colors">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 group-hover:text-[#2563eb] transition-colors">add_a_photo</span>
                          <span className="text-xs text-slate-400 group-hover:text-[#2563eb] transition-colors">تحميل صورة شخصية</span>
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-3xl">crop</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    اسحب الصورة وأفلتها هنا أو اضغط للتحميل<br />
                    (الحد الأقصى 5MB - JPG, PNG)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>

                {/* Documents Preview */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">المستندات</h3>
                  <div className="space-y-3">
                    {/* ID Card Front */}
                    {documents.idCardFront.file && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-blue-500">badge</span>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{getDocumentFileName('idCardFront')}</p>
                            <p className="text-xs text-slate-500">{documentTypeLabels.ID_CARD.labelAr}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDocumentRemove('idCardFront')}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    )}
                    {/* ID Card Back */}
                    {documents.idCardBack.file && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-blue-500">badge</span>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{getDocumentFileName('idCardBack')}</p>
                            <p className="text-xs text-slate-500">背面 - الهوية</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDocumentRemove('idCardBack')}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    )}
                    {/* Driving License */}
                    {documents.drivingLicense.file && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-orange-500">description</span>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{getDocumentFileName('drivingLicense')}</p>
                            <p className="text-xs text-slate-500">{documentTypeLabels.DRIVING_LICENSE.labelAr}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDocumentRemove('drivingLicense')}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    )}
                    {/* Medical Insurance */}
                    {documents.medicalInsurance.file && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-green-500">local_hospital</span>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{getDocumentFileName('medicalInsurance')}</p>
                            <p className="text-xs text-slate-500">{documentTypeLabels.MEDICAL_INSURANCE.labelAr}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDocumentRemove('medicalInsurance')}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6">معلومات الموظف</h3>
                <div className="grid grid-cols-2 gap-6">
                  {/* Name (Arabic) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">الاسم الكامل (عربي) *</label>
                    <input
                      type="text"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-cairo"
                      placeholder="أحمد محمد العلي"
                    />
                  </div>

                  {/* Residency Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">رقم الإقامة *</label>
                    <input
                      type="text"
                      value={formData.residencyNumber}
                      onChange={(e) => setFormData({ ...formData, residencyNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-cairo font-sans"
                      placeholder="2xxxxxxxxx"
                    />
                  </div>

                  {/* Nationality */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">الجنسية *</label>
                    <select
                      value={formData.nationalityCode}
                      onChange={(e) => setFormData({ ...formData, nationalityCode: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-cairo"
                    >
                      <option value="">اختر الجنسية</option>
                      {nationalityOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.labelAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">تاريخ الميلاد *</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-cairo font-sans"
                    />
                  </div>

                  {/* Job Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">المسمب الوظيفة *</label>
                    <input
                      type="text"
                      value={formData.jobTitleAr}
                      onChange={(e) => setFormData({ ...formData, jobTitleAr: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-cairo"
                      placeholder="مشغل معدات"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-sans"
                      placeholder="+966501234567"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-sans"
                      placeholder="employee@example.com"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-slate-700">العنوان</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-cairo"
                      placeholder="الرياض، حي العليا"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-lg font-medium transition-all"
                  >
                    التالي
                    <span className="material-symbols-outlined align-middle mr-1">arrow_back</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Documents */}
          <div className={`${currentStep === 2 ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6">الوثائق الرسمية</h3>
              <p className="text-sm text-slate-500 mb-6">ارفع الوثائق المطلوبة (اختياري - يمكن إضافتها لاحقاً)</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Card Front */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-[#2563eb]/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-2xl text-blue-500">badge</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{documentTypeLabels.ID_CARD.labelAr} - الوجهة الأمامية</p>
                        <p className="text-xs text-slate-500">JPG, PNG, PDF (حد أقصى 10MB)</p>
                      </div>
                    </div>
                  </div>
                  {documents.idCardFront.file ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{getDocumentFileName('idCardFront')}</span>
                      <button
                        onClick={() => handleDocumentRemove('idCardFront')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDocumentUploadClick('idCardFront')}
                      className="w-full py-3 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#2563eb] hover:border-[#2563eb]/30 transition-all font-cairo"
                    >
                      <span className="material-symbols-outlined align-middle text-lg mr-2">upload_file</span>
                      تحميل الملف
                    </button>
                  )}
                </div>

                {/* ID Card Back */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-[#2563eb]/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-2xl text-blue-500">badge</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{documentTypeLabels.ID_CARD.labelAr} - الوجهة الخلفية</p>
                        <p className="text-xs text-slate-500">JPG, PNG, PDF (حد أقصى 10MB)</p>
                      </div>
                    </div>
                  </div>
                  {documents.idCardBack.file ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{getDocumentFileName('idCardBack')}</span>
                      <button
                        onClick={() => handleDocumentRemove('idCardBack')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDocumentUploadClick('idCardBack')}
                      className="w-full py-3 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#2563eb] hover:border-[#2563eb]/30 transition-all font-cairo"
                    >
                      <span className="material-symbols-outlined align-middle text-lg mr-2">upload_file</span>
                      تحميل الملف
                    </button>
                  )}
                </div>

                {/* Driving License */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-[#2563eb]/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-2xl text-orange-500">description</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{documentTypeLabels.DRIVING_LICENSE.labelAr}</p>
                        <p className="text-xs text-slate-500">JPG, PNG, PDF (حد أقصى 10MB)</p>
                      </div>
                    </div>
                  </div>
                  {documents.drivingLicense.file ? (
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{getDocumentFileName('drivingLicense')}</span>
                      <button
                        onClick={() => handleDocumentRemove('drivingLicense')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDocumentUploadClick('drivingLicense')}
                      className="w-full py-3 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#2563eb] hover:border-[#2563eb]/30 transition-all font-cairo"
                    >
                      <span className="material-symbols-outlined align-middle text-lg mr-2">upload_file</span>
                      تحميل الملف
                    </button>
                  )}
                </div>

                {/* Medical Insurance */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-[#2563eb]/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-2xl text-green-500">local_hospital</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{documentTypeLabels.MEDICAL_INSURANCE.labelAr}</p>
                        <p className="text-xs text-slate-500">JPG, PNG, PDF (حد أقصى 10MB)</p>
                      </div>
                    </div>
                  </div>
                  {documents.medicalInsurance.file ? (
                    <>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg mb-3">
                        <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{getDocumentFileName('medicalInsurance')}</span>
                        <button
                          onClick={() => handleDocumentRemove('medicalInsurance')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-slate-600">تاريخ الانتهاء</label>
                          <input
                            type="date"
                            value={documents.medicalInsurance.expiryDate}
                            onChange={(e) => updateDocumentMeta('medicalInsurance', 'expiryDate', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDocumentUploadClick('medicalInsurance')}
                      className="w-full py-3 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-[#2563eb] hover:border-[#2563eb]/30 transition-all font-cairo"
                    >
                      <span className="material-symbols-outlined align-middle text-lg mr-2">upload_file</span>
                      تحميل الملف
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-lg font-medium transition-all"
                >
                  <span className="material-symbols-outlined align-middle mr-1">arrow_forward</span>
                  السابق
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-lg font-medium transition-all"
                >
                  التالي
                  <span className="material-symbols-outlined align-middle mr-1">arrow_back</span>
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Financial Info */}
          <div className={`${currentStep === 3 ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6">البيانات المالية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Salary */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">الراتب الشهري (ريال) *</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-sans"
                    placeholder="8500"
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">القسم</label>
                  <input
                    type="text"
                    value={formData.departmentAr}
                    onChange={(e) => setFormData({ ...formData, departmentAr: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-cairo"
                    placeholder="قسم المعدات الثقيلة"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-lg font-medium transition-all"
                >
                  <span className="material-symbols-outlined align-middle mr-1">arrow_forward</span>
                  السابق
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || uploadingDocuments}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  {createMutation.isPending ? 'جاري الحفظ...' : uploadingDocuments ? `جاري رفع المستندات (${uploadProgress}%)` : 'حفظ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress Modal */}
      {uploadingDocuments && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#2563eb] border-t-transparent"></div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">جاري رفع المستندات</h3>
              <p className="text-slate-600 mb-4">يرجى الانتظار...</p>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#2563eb] h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">{uploadProgress}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
