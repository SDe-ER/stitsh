'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useEmployeeById,
  useUpdateEmployee,
  useEmployeeDocuments,
  nationalityOptions,
  employeeStatusLabels,
  getResidencyStatus,
  getResidencyStatusConfig,
  documentTypeLabels,
  getDocumentStatusConfig,
  type EmployeeDocument
} from '@/hooks/useEmployees'
import { useAttendanceStats } from '@/hooks/useAttendance'
import { useEmployeeDeductionStats, useDeductions, useCreateDeduction, deductionTypeLabels, type DeductionType } from '@/hooks/useDeductions'
import { EmployeeModal, DeductionModal } from '@/components/modals'
import { useQueryClient } from '@tanstack/react-query'

const DEFAULT_PHOTO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWD8DrVW2zKEEp36bqEWnStYtEopalfxD184RkIrIjt77GXO4FeXOALMMHfYgvcST99DHI-jpnyZKKDhDfyUYrLDULTpUjPtRGptJPwD1xOhg7jXzv_Mujxyq2lrkKdEdCbtrBWugo9BYuCCOX4wr9jN06qq-T7wpZpovcaeuPJIxvWEVD7u7UyVqV9485e0_9MwKxyVq-KpkxF1ILsSy6rp7a61JONmSr1uDL7x3Jc_eUSj2O0QnwiTQ2JbmL92lwSY4NVUFH4rNz'
const SAUDI_FLAG_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOWNjEsEHHqrAuv7cd4prZ-GDk8PWz4-st4vsPi6AygKiMPhuExDgy7TWjMKdP4F3rRWYZ3brKIM0HZGyRdO7GD9jkqV7jJ97Bw_GF3HyTjft_NFKGAFCxPGk6r1nL4a_trzxGVfgVQq4dPx3TYYikjPx4bytg5Z0Q6Dy-orCMyujoMo-lc4dCGcsMGuVV9a2lQoEDXnKB8GtPAUWeLNDygSaIbu0b500gMjDQ9REFAgR7dI5DXd-dTjvUxqjhjVlgAewvZtoJA988'

// Mock compliance documents with expiry dates, statuses, and preview images
const mockComplianceDocs = [
  {
    id: '1',
    title: 'الهوية الوطنية',
    icon: 'id_card',
    expiryDate: '12/05/2025',
    status: 'valid' as const, // valid, expiring-soon, expired
    statusText: 'سارية',
    description: 'تنتهي في: 12/05/2025',
    previewUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: 'رخصة قيادة معدات',
    icon: 'directions_car',
    expiryDate: '20/08/2024',
    status: 'expiring-soon' as const,
    statusText: 'تجديد قريباً',
    description: 'تنتهي في: 20/08/2024',
    previewUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: 'التأمين الطبي',
    icon: 'health_and_safety',
    expiryDate: null,
    status: 'valid' as const,
    statusText: 'سارية',
    description: 'بوبا العربية (Class B)',
    previewUrl: 'https://images.unsplash.com/photo-1584982751601-97dcc756314a?w=400&h=300&fit=crop',
  }
]

// Mock salary records
const mockSalaryRecords = [
  { id: '1', month: 'أكتوبر 2023', paymentDate: '27/10/2023', amount: '11,000 ر.س', status: 'paid' },
  { id: '2', month: 'سبتمبر 2023', paymentDate: '26/09/2023', amount: '11,000 ر.س', status: 'paid' },
  { id: '3', month: 'أغسطس 2023', paymentDate: '28/08/2023', amount: '10,850 ر.س', status: 'paid' },
]

// Mock work history
const mockWorkHistory = [
  {
    id: '1',
    project: 'مشروع نيوم - ذا لاين (Site B)',
    description: 'تشغيل بلدوزر D9T لأعمال التسوية والحفر في القطاع الشمالي.',
    since: '10 فبراير 2023',
    supervisor: 'م. خالد السالم',
    isCurrent: true,
    period: '2023 - الآن',
  },
  {
    id: '2',
    project: 'مترو الرياض - الخط الأزرق',
    description: 'مشغل معدات ثقيلة (حفار وبلدوزر) في محطة العليا.',
    period: '2020 - 2023',
    isCurrent: false,
  },
  {
    id: '3',
    project: 'مشروع القدية الترفيهي',
    description: 'أعمال تمهيد الطرق الرئيسية.',
    period: '2019 - 2020',
    isCurrent: false,
  },
]

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [documentPreview, setDocumentPreview] = useState<{ url: string; name: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const updateEmployeeMutation = useUpdateEmployee()

  const { data: employee, isLoading } = useEmployeeById(id || '')

  // Fetch employee documents from database
  const { data: documents = [], isLoading: documentsLoading } = useEmployeeDocuments(id || '')

  // Get current month for attendance stats
  const currentDate = new Date()
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  const currentMonthNum = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  const { data: attendanceStats } = useAttendanceStats(id || '', currentMonth)

  // Get employee deduction stats for current month
  const { data: deductionStats } = useEmployeeDeductionStats(id || '', currentMonthNum, currentYear)

  // Calculate age from birth year
  const birthYear = 1988
  const age = currentDate.getFullYear() - birthYear

  // Format date in Arabic
  const formatDateAr = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Transform documents to display format
  const displayDocuments = documents.length > 0 ? documents : mockComplianceDocs

  // Handle photo click
  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('الرجاء اختيار ملف صورة صالح')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت')
        return
      }
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        setIsPhotoModalOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle save photo
  const handleSavePhoto = () => {
    if (photoPreview && employee) {
      updateEmployeeMutation.mutate(
        { id: employee.id, data: { photoUrl: photoPreview } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee', id] })
            setIsPhotoModalOpen(false)
            setPhotoPreview(null)
            setSelectedPhoto(photoPreview)
          }
        }
      )
    }
  }

  // Handle cancel photo
  const handleCancelPhoto = () => {
    setIsPhotoModalOpen(false)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#2563eb] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-700 mb-4">فشل تحميل بيانات الموظف</p>
          <button
            onClick={() => navigate('/hr/employees')}
            className="px-4 py-2 bg-[#2563eb] text-white rounded-xl hover:bg-[#1d4ed8] transition-colors"
          >
            العودة للموظفين
          </button>
        </div>
      </div>
    )
  }

  const statusConfig = employeeStatusLabels[employee.status]
  const nationality = nationalityOptions.find(n => n.code === employee.nationalityCode) || { flag: '🏳', nameAr: employee.nationality }
  const residencyStatus = getResidencyStatus(employee.residencyExpiryDate)
  const residencyConfig = getResidencyStatusConfig(residencyStatus)

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col overflow-hidden">
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
            <h2 className="text-xl font-bold text-slate-800">{employee.nameAr}</h2>
            <span className="text-xs text-slate-500">
              ID: {employee.employeeNumber} • {employee.jobTitleAr}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border-2 border-[#1a2b4a] text-[#1a2b4a] hover:bg-slate-50 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-[20px]">print</span>
            طباعة بطاقة الموظف
          </button>
          <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">upload_file</span>
            تحديث الوثائق
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
            تعديل الملف
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-start gap-6">
              <div className="relative">
                <div
                  onClick={handlePhotoClick}
                  className="relative group cursor-pointer"
                >
                  <img
                    alt="Employee Profile"
                    className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-md"
                    src={selectedPhoto || employee.photoUrl || DEFAULT_PHOTO_URL}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center text-white">
                      <span className="material-symbols-outlined text-3xl">photo_camera</span>
                      <p className="text-xs mt-1 font-bold">تعديل الصورة</p>
                    </div>
                  </div>
                </div>
                <span className="absolute -bottom-3 -right-3 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[16px]">check</span>
                </span>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1 pt-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">{employee.nameAr}</h1>
                    <div className="flex items-center gap-3 text-slate-500 text-sm mb-4">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-slate-600">
                        <span className="material-symbols-outlined text-[16px]">engineering</span>
                        قسم المعدات الثقيلة
                      </span>
                      <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-[#2563eb]">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        نيوم - ذا لاين
                      </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-400 mb-1">تاريخ الانضمام</p>
                    <p className="font-bold text-slate-700">{formatDateAr(employee.joiningDate)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 mt-2">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">رقم الهوية / الإقامة</p>
                    <p className="font-bold text-slate-800">{employee.residencyNumber || employee.employeeNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">الجنسية</p>
                    <p className="font-bold text-slate-800 flex items-center gap-2">
                      <img alt="Saudi Arabia" className="w-5 rounded-sm shadow-sm" src={SAUDI_FLAG_URL} />
                      سعودي
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">تاريخ الميلاد</p>
                    <p className="font-bold text-slate-800">12/05/{birthYear} ({age} سنة)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work History Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563eb]">work_history</span>
                سجل العمل والمشاريع
              </h3>
              <div className="relative pl-4 border-r border-slate-200 mr-2 space-y-8">
                {mockWorkHistory.map((item, index) => (
                  <div key={item.id} className={`relative pr-6 ${item.isCurrent ? 'group' : 'opacity-75 hover:opacity-100 transition-opacity'}`}>
                    <span className={`absolute -right-[29px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${item.isCurrent ? 'bg-[#2563eb] ring-2 ring-blue-100' : 'bg-slate-300'}`}></span>
                    {item.isCurrent ? (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800">{item.project}</h4>
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">مشروع حالي</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                            منذ: {item.since}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            المشرف: {item.supervisor}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-700">{item.project}</h4>
                          <span className="text-xs text-slate-400">{item.period}</span>
                        </div>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Data Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2563eb]">payments</span>
                  البيانات المالية
                </h3>
                <button className="text-sm text-[#2563eb] hover:underline">عرض قسيمة الراتب</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">الراتب الأساسي</p>
                  <p className="text-2xl font-bold text-slate-800">8,500 <span className="text-sm font-normal text-slate-500">ريال</span></p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">بدل سكن ونقل</p>
                  <p className="text-2xl font-bold text-slate-800">2,500 <span className="text-sm font-normal text-slate-500">ريال</span></p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-700 mb-3">سجل الرواتب (آخر 3 أشهر)</h4>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">الشهر</th>
                        <th className="px-4 py-3 font-medium">تاريخ التحويل</th>
                        <th className="px-4 py-3 font-medium">المبلغ الإجمالي</th>
                        <th className="px-4 py-3 font-medium">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockSalaryRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-800">{record.month}</td>
                          <td className="px-4 py-3 text-slate-500">{record.paymentDate}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{record.amount}</td>
                          <td className="px-4 py-3">
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">تم التحويل</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 col) */}
          <div className="space-y-6">
            {/* Work ID Card */}
            <div className="bg-gradient-to-br from-[#1a2b4a] to-[#2c436d] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-10 -translate-y-10 blur-2xl"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="font-bold text-lg">بطاقة العمل</h3>
                  <p className="text-xs text-blue-200">HeavyOps Employee ID</p>
                </div>
                <span className="material-symbols-outlined text-white/30 text-4xl">badge</span>
              </div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <img
                  className="w-16 h-16 rounded-lg border-2 border-white/20 object-cover"
                  src={selectedPhoto || employee.photoUrl || DEFAULT_PHOTO_URL}
                  alt=""
                />
                <div>
                  <p className="font-bold text-lg">{employee.nameAr}</p>
                  <p className="text-sm text-blue-200">{employee.jobTitleAr}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 relative z-10">
                <div className="flex justify-between text-xs text-blue-200 mb-1">
                  <span>ID No.</span>
                  <span className="text-white font-mono">{employee.employeeNumber}</span>
                </div>
                <div className="flex justify-between text-xs text-blue-200">
                  <span>Expiry</span>
                  <span className="text-white font-mono">12/2025</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm">
                <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  طباعة البطاقة
                </button>
              </div>
            </div>

            {/* Compliance & Documents Card - Tawakkalna Style */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563eb]">verified_user</span>
                الامتثال والوثائق
              </h3>
              <div className="space-y-4">
                {displayDocuments.map((doc) => {
                  // Handle both mock data structure and database structure
                  const isMockData = 'title' in doc
                  const title = isMockData ? doc.title : doc.typeLabelAr
                  const previewUrl = isMockData ? doc.previewUrl : doc.fileUrl
                  const icon = isMockData ? doc.icon : documentTypeLabels[doc.type]?.icon || 'description'
                  const status = isMockData ? doc.status : doc.status
                  const statusText = isMockData ? doc.statusText : doc.statusTextAr
                  const expiryDate = isMockData ? doc.expiryDate : doc.expiryDate

                  const statusConfig = {
                    valid: { color: 'bg-emerald-500', textColor: 'text-white', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', label: 'سارية' },
                    'expiring-soon': { color: 'bg-amber-500', textColor: 'text-white', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', label: 'تجديد قريباً' },
                    expired: { color: 'bg-red-500', textColor: 'text-white', badgeBg: 'bg-red-100', badgeText: 'text-red-700', label: 'منتهية' }
                  }[status]

                  return (
                    <div
                      key={doc.id}
                      onClick={() => previewUrl && setDocumentPreview({ url: previewUrl, name: title })}
                      className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Card Container - Tawakkalna Style */}
                      <div className="relative overflow-hidden rounded-2xl shadow-lg transition-shadow duration-300 group-hover:shadow-2xl bg-gradient-to-br from-slate-50 to-slate-100">
                        {/* Background Document Image */}
                        {previewUrl ? (
                          <div className="relative h-36 w-full">
                            <img
                              src={previewUrl}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            {/* Card Content Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                              {/* Document Icon */}
                              <div className="mb-2">
                                <span className={`material-symbols-outlined text-4xl ${statusConfig.textColor} drop-shadow-lg`}>
                                  {icon}
                                </span>
                              </div>

                              {/* Document Title */}
                              <h4 className="text-lg font-bold text-white text-center drop-shadow-md font-cairo">
                                {title}
                              </h4>

                              {/* Status Badge */}
                              <div className={`mt-2 px-4 py-1.5 rounded-full ${statusConfig.badgeBg} ${statusConfig.badgeText} text-sm font-bold shadow-lg backdrop-blur-sm`}>
                                {statusText}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Placeholder Card */
                          <div className="relative h-36 w-full bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center">
                            <div className="text-center">
                              <span className="material-symbols-outlined text-5xl text-slate-400 mb-2">
                                {icon}
                              </span>
                              <p className="text-sm font-medium text-slate-500">{title}</p>
                              <p className="text-xs text-slate-400 mt-1">لم يتم الرفع</p>
                            </div>
                          </div>
                        )}

                        {/* Hover Effect - Visibility Indicator */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-2xl" />

                        {/* Zoom Icon on Hover */}
                        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                            <span className="material-symbols-outlined text-slate-700 text-xl">zoom_in</span>
                          </div>
                        </div>

                        {/* Status Indicator Bar */}
                        <div className={`absolute bottom-0 right-0 left-0 h-1.5 ${statusConfig.color}`} />
                      </div>

                      {/* Expiry Info Below Card */}
                      {expiryDate && (
                        <div className="mt-2 flex items-center justify-between px-2">
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">event</span>
                            تنتهي في: {expiryDate}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Attendance Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2563eb]">schedule</span>
                الحضور والانصراف (أكتوبر)
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-[#2563eb]">{attendanceStats?.totalWorkHours || 182}</p>
                  <p className="text-xs text-slate-500">ساعات العمل</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">+{attendanceStats?.lateDays || 12}</p>
                  <p className="text-xs text-slate-500">ساعات إضافية</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">نسبة الحضور</span>
                  <span className="font-bold text-slate-800">{(attendanceStats?.attendanceRate || 98).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${attendanceStats?.attendanceRate || 98}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-left">
                  آخر غياب: {(attendanceStats?.absentDays ?? 0) === 0 ? 'لا يوجد في آخر 3 أشهر' : `${attendanceStats?.absentDays ?? 0} أيام`}
                </p>
              </div>

              {/* Deductions Section */}
              <div className="border-t border-slate-100 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">account_balance_wallet</span>
                    الاستقطاعات
                  </h4>
                  <button
                    onClick={() => setIsDeductionModalOpen(true)}
                    className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    إضافة
                  </button>
                </div>

                {/* Total Deductions */}
                <div className="bg-red-50 p-3 rounded-xl mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">إجمالي الاستقطاعات</span>
                    <span className="text-lg font-bold text-red-600">
                      {deductionStats ? parseFloat(deductionStats.totalAmount).toLocaleString('en-US') : '0'} ر.س
                    </span>
                  </div>
                </div>

                {/* Breakdown by Type */}
                {deductionStats && deductionStats.total > 0 ? (
                  <div className="space-y-2">
                    {deductionStats.byType.absence.count > 0 && (
                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-red-600">event_busy</span>
                          <span className="text-slate-600">غياب كامل</span>
                        </span>
                        <span className="font-bold text-slate-800">
                          {deductionStats.byType.absence.count} × {parseFloat(deductionStats.byType.absence.amount).toLocaleString('en-US')} ر.س
                        </span>
                      </div>
                    )}
                    {deductionStats.byType.partial_absence.count > 0 && (
                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-amber-600">schedule</span>
                          <span className="text-slate-600">غياب جزئي / تأخير</span>
                        </span>
                        <span className="font-bold text-slate-800">
                          {deductionStats.byType.partial_absence.count} × {parseFloat(deductionStats.byType.partial_absence.amount).toLocaleString('en-US')} ر.س
                        </span>
                      </div>
                    )}
                    {deductionStats.byType.advance.count > 0 && (
                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-purple-600">payments</span>
                          <span className="text-slate-600">سلف</span>
                        </span>
                        <span className="font-bold text-slate-800">
                          {deductionStats.byType.advance.count} × {parseFloat(deductionStats.byType.advance.amount).toLocaleString('en-US')} ر.س
                        </span>
                      </div>
                    )}
                    {deductionStats.byType.manual.count > 0 && (
                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-gray-600">edit_note</span>
                          <span className="text-slate-600">خصومات يدوية</span>
                        </span>
                        <span className="font-bold text-slate-800">
                          {deductionStats.byType.manual.count} × {parseFloat(deductionStats.byType.manual.amount).toLocaleString('en-US')} ر.س
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400">لا توجد استقطاعات هذا الشهر</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editEmployee={employee}
      />

      {/* Deduction Modal */}
      <DeductionModal
        isOpen={isDeductionModalOpen}
        onClose={() => setIsDeductionModalOpen(false)}
        employeeId={employee.id}
        employeeNameAr={employee.nameAr}
        employeeSalary={parseFloat(employee.salary)}
        defaultMonth={currentMonthNum}
        defaultYear={currentYear}
        defaultDate={currentDate.toISOString().split('T')[0]}
      />

      {/* Photo Preview Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 font-cairo">معاينة الصورة الجديدة</h3>
            </div>

            {/* Preview Image */}
            <div className="p-8 flex justify-center bg-slate-50">
              <div className="relative">
                <img
                  src={photoPreview || DEFAULT_PHOTO_URL}
                  alt="Preview"
                  className="w-48 h-48 rounded-2xl object-cover shadow-lg border-4 border-white"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[16px]">check</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 flex gap-3">
              <button
                onClick={handleSavePhoto}
                disabled={updateEmployeeMutation.isPending}
                className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-cairo"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                حفظ الصورة
              </button>
              <button
                onClick={handleCancelPhoto}
                disabled={updateEmployeeMutation.isPending}
                className="flex-1 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-cairo"
              >
                <span className="material-symbols-outlined text-[20px]">cancel</span>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal - Tawakkalna Style */}
      {documentPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setDocumentPreview(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setDocumentPreview(null)}
              className="absolute -top-12 right-0 z-10 p-2 text-white hover:text-white/80 transition-colors"
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>

            {/* Document Container */}
            <div className="bg-transparent rounded-3xl overflow-hidden shadow-2xl">
              {/* Document Image at Real Size */}
              <div className="flex items-center justify-center bg-black/50 p-4">
                <img
                  src={documentPreview.url}
                  alt={documentPreview.name}
                  className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
                />
              </div>

              {/* Document Info Bar */}
              <div className="bg-white/95 backdrop-blur-sm border-t border-white/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-white">description</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 font-cairo">{documentPreview.name}</h3>
                      <p className="text-xs text-slate-500">اضغط في أي مكان خارج الصورة للإغلاق</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = documentPreview.url
                        link.download = `${documentPreview.name}.jpg`
                        link.target = '_blank'
                        link.click()
                      }}
                      className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[20px]">download</span>
                      <span className="text-sm font-cairo">تحميل</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
