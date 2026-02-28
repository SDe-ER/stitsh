import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmployeeModal } from '@/components/modals/EmployeeModal'
import { AttendanceModal } from '@/components/modals/AttendanceModal'
import { useEmployeeById } from '@/hooks/useEmployees'
import {
  useAttendance,
  useAttendanceStats,
  useCreateAttendance,
  useUpdateAttendance,
  useDeleteAttendance,
  attendanceStatusLabels,
} from '@/hooks/useAttendance'
import { formatNumber } from '@/utils/format'
import {
  User,
  FileText,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Building,
  Edit,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Home,
  Briefcase,
  Download,
  TrendingUp,
  Timer,
  Plus,
  MoreVertical,
  Trash2,
} from 'lucide-react'

type TabType = 'personal' | 'documents' | 'salary' | 'attendance'

const tabs: { id: TabType; label: string; labelAr: string; icon: any }[] = [
  { id: 'personal', label: 'Personal', labelAr: 'المعلومات الشخصية', icon: User },
  { id: 'documents', label: 'Documents', labelAr: 'الوثائق', icon: FileText },
  { id: 'salary', label: 'Salary', labelAr: 'الرواتب', icon: DollarSign },
  { id: 'attendance', label: 'Attendance', labelAr: 'الحضور', icon: Calendar },
]

const nationalityOptions = {
  SA: { flag: '🇸🇦', nameAr: 'المملكة العربية السعودية' },
  EG: { flag: '🇪🇬', nameAr: 'مصر' },
  IN: { flag: '🇮🇳', nameAr: 'الهند' },
  PK: { flag: '🇵🇰', nameAr: 'باكستان' },
  BD: { flag: '🇧🇩', nameAr: 'بنغلاديش' },
  PH: { flag: '🇵🇭', nameAr: 'الفلبين' },
  YE: { flag: '🇾🇪', nameAr: 'اليمن' },
  SY: { flag: '🇸🇾', nameAr: 'سوريا' },
  JO: { flag: '🇯🇴', nameAr: 'الأردن' },
}

const departmentColors: Record<string, string> = {
  engineering: 'bg-blue-100 text-blue-700',
  operations: 'bg-green-100 text-green-700',
  maintenance: 'bg-amber-100 text-amber-700',
  safety: 'bg-red-100 text-red-700',
  administration: 'bg-purple-100 text-purple-700',
  finance: 'bg-emerald-100 text-emerald-700',
  hr: 'bg-pink-100 text-pink-700',
  it: 'bg-indigo-100 text-indigo-700',
  logistics: 'bg-cyan-100 text-cyan-700',
  security: 'bg-slate-100 text-slate-700',
}

// Mock salary records
const mockSalaryRecords = [
  { id: '1', month: '2024-01', monthAr: 'يناير 2024', basicSalary: 15000, allowances: 3000, deductions: 0, netSalary: 18000, paymentDate: '2024-01-28', paymentStatus: 'paid' },
  { id: '2', month: '2024-02', monthAr: 'فبراير 2024', basicSalary: 15000, allowances: 3000, deductions: 0, netSalary: 18000, paymentDate: '2024-02-28', paymentStatus: 'paid' },
  { id: '3', month: '2024-03', monthAr: 'مارس 2024', basicSalary: 15000, allowances: 3000, deductions: 500, netSalary: 17500, paymentDate: '2024-03-28', paymentStatus: 'paid' },
  { id: '4', month: '2024-04', monthAr: 'أبريل 2024', basicSalary: 15000, allowances: 3000, deductions: 0, netSalary: 18000, paymentStatus: 'pending' },
]

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('personal')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to current month
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })

  // Attendance modal state
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [editAttendanceRecord, setEditAttendanceRecord] = useState<any>(undefined)

  const { data: employee, isLoading } = useEmployeeById(id || '')
  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useAttendance({
    employeeId: id || '',
    month: selectedMonth,
  })
  const { data: attendanceStats, isLoading: isLoadingStats } = useAttendanceStats(id || '', selectedMonth)

  // Attendance CRUD hooks
  const createAttendance = useCreateAttendance()
  const updateAttendance = useUpdateAttendance()
  const deleteAttendance = useDeleteAttendance()

  const handleSaveAttendance = (data: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editAttendanceRecord) {
      updateAttendance.mutate({ id: editAttendanceRecord.id, data })
    } else {
      createAttendance.mutate(data)
    }
  }

  const handleEditAttendance = (record: AttendanceRecord) => {
    setEditAttendanceRecord(record)
    setIsAttendanceModalOpen(true)
  }

  const handleDeleteAttendance = (recordId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      deleteAttendance.mutate(recordId)
    }
  }

  const handleAddAttendance = () => {
    setEditAttendanceRecord(undefined)
    setIsAttendanceModalOpen(true)
  }

  if (isLoading) {
    return (
      <AppLayout titleAr="الملف الشخصي">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </AppLayout>
    )
  }

  if (!employee) {
    return (
      <AppLayout titleAr="الملف الشخصي">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-cairo mb-2">فشل تحميل بيانات الموظف</p>
          <Button variant="outline" onClick={() => navigate('/hr/employees')} className="font-cairo">
            العودة للموظفين
          </Button>
        </div>
      </AppLayout>
    )
  }

  const statusConfig = {
    active: { label: 'نشط', labelEn: 'Active', color: 'bg-green-100 text-green-700' },
    'on-leave': { label: 'في إجازة', labelEn: 'On Leave', color: 'bg-amber-100 text-amber-700' },
    terminated: { label: 'منتهي خدمته', labelEn: 'Terminated', color: 'bg-red-100 text-red-700' },
    resigned: { label: 'مستقيل', labelEn: 'Resigned', color: 'bg-gray-100 text-gray-700' },
  }[employee.status]

  const nationality = nationalityOptions[employee.nationalityCode as keyof typeof nationalityOptions] || {
    flag: '🏳',
    nameAr: employee.nationality,
  }

  return (
    <AppLayout titleAr={employee.nameAr}>
      {/* Page Title Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-cairo">{employee.nameAr}</h1>
            <p className="text-lg text-gray-600 font-sans mt-1">{employee.name}</p>
            <p className="text-sm text-gray-500 font-cairo mt-1">
              <span className="font-medium">رقم الموظف:</span> {employee.employeeNumber}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="font-cairo gap-2"
          >
            <Edit className="w-4 h-4" />
            تعديل
          </Button>
        </div>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mt-4 text-gray-500">
          <a href="/" className="hover:text-[#2563eb] font-cairo">الرئيسية</a>
          <span>/</span>
          <a href="/hr" className="hover:text-[#2563eb] font-cairo">الموارد البشرية</a>
          <span>/</span>
          <a href="/hr/employees" className="hover:text-[#2563eb] font-cairo">الموظفين</a>
          <span>/</span>
          <span className="text-gray-700 font-cairo">الملف الشخصي</span>
        </nav>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar / Photo */}
          {employee.photoUrl ? (
            <img
              src={employee.photoUrl}
              alt={employee.nameAr}
              className="rounded-xl object-cover border-4 border-[#2563eb] shadow-lg"
              style={{ width: '160px', height: '240px' }}
            />
          ) : (
            <div className="w-32 h-32 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-2xl flex items-center justify-center text-white text-4xl font-bold font-cairo shadow-lg shadow-blue-900/30">
              {employee.nameAr.charAt(0)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 font-cairo">{employee.nameAr}</h2>
              <span className="text-lg text-gray-400 font-sans">|</span>
              <span className="text-lg text-gray-600 font-sans">{employee.name}</span>
              <span className={`px-4 py-1.5 text-sm font-semibold rounded-full font-cairo ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Briefcase className="w-5 h-5 text-[#2563eb]" />
                <span className="text-sm font-cairo text-gray-700">{employee.jobTitleAr}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${departmentColors[employee.department] || 'bg-gray-100 text-gray-700'}`}>
                <Building className="w-5 h-5" />
                <span className="text-sm font-semibold font-cairo">{employee.departmentAr}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-2xl">{nationality.flag}</span>
                <span className="text-sm font-cairo text-gray-700">{nationality.nameAr}</span>
              </div>
              {employee.projectNameAr && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Home className="w-5 h-5 text-[#2563eb]" />
                  <span className="text-sm font-cairo text-gray-700">{employee.projectNameAr}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Actions */}
          <div className="flex flex-col gap-3">
            {employee.phone && (
              <a
                href={`tel:${employee.phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#2563eb] rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-sans font-medium" dir="ltr">{employee.phone}</span>
              </a>
            )}
            {employee.email && (
              <a
                href={`mailto:${employee.email}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#2563eb] rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm font-sans font-medium">{employee.email}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <nav className="flex gap-2 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 rounded-lg font-cairo font-medium flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.labelAr}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Personal Info Tab */}
        {activeTab === 'personal' && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-[#2563eb]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 font-cairo">المعلومات الشخصية</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <span className="text-2xl">👤</span>
                  <h3 className="font-bold text-gray-900 font-cairo">المعلومات الأساسية</h3>
                </div>
                <div className="space-y-3">
                  <InfoRow label="رقم الموظف" value={employee.employeeNumber} />
                  <InfoRow label="الاسم (عربي)" value={employee.nameAr} />
                  <InfoRow label="الاسم (إنجليزي)" value={employee.name} />
                  <InfoRow label="الجنسية" value={`${nationality.flag} ${nationality.nameAr}`} />
                  <InfoRow label="المسمى الوظيفي (عربي)" value={employee.jobTitleAr} />
                  <InfoRow label="المسمى الوظيفي (إنجليزي)" value={employee.jobTitle} />
                  <InfoRow label="القسم" value={employee.departmentAr} />
                </div>
              </div>

              {/* Work Info */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <span className="text-2xl">💼</span>
                  <h3 className="font-bold text-gray-900 font-cairo">معلومات العمل</h3>
                </div>
                <div className="space-y-3">
                  <InfoRow label="الراتب" value={`${formatNumber(employee.salary)} ريال`} highlight />
                  <InfoRow label="تاريخ الانضمام" value={new Date(employee.joiningDate).toLocaleDateString('ar-SA')} />
                  {employee.projectNameAr && <InfoRow label="المشروع" value={employee.projectNameAr} />}
                  <InfoRow label="الحالة" value={statusConfig.label} />
                  {employee.contractStartDate && (
                    <InfoRow label="بداية العقد" value={new Date(employee.contractStartDate).toLocaleDateString('ar-SA')} />
                  )}
                  {employee.contractEndDate && (
                    <InfoRow label="نهاية العقد" value={new Date(employee.contractEndDate).toLocaleDateString('ar-SA')} />
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <span className="text-2xl">📞</span>
                  <h3 className="font-bold text-gray-900 font-cairo">بيانات الاتصال</h3>
                </div>
                <div className="space-y-3">
                  {employee.phone && <InfoRow label="رقم الهاتف" value={employee.phone} />}
                  {employee.email && <InfoRow label="البريد الإلكتروني" value={employee.email} />}
                  {employee.cityAr && <InfoRow label="المدينة" value={employee.cityAr} />}
                  {employee.addressAr && <InfoRow label="العنوان" value={employee.addressAr} />}
                  {employee.emergencyContactName && (
                    <InfoRow label="جهة الاتصال للطوارئ" value={employee.emergencyContactName} />
                  )}
                  {employee.emergencyContactPhone && (
                    <InfoRow label="رقم جهة الاتصال" value={employee.emergencyContactPhone} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 font-cairo">الوثائق</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Residency Card */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-[#2563eb]" />
                    </div>
                    <h3 className="font-bold text-gray-900 font-cairo text-lg">بطاقة الإقامة</h3>
                  </div>
                  {employee.residencyExpiryDate && (
                    <ResidencyExpiryBadge expiryDate={employee.residencyExpiryDate} />
                  )}
                </div>
                {employee.residencyNumber ? (
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <InfoRow label="رقم الإقامة" value={employee.residencyNumber} />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 font-cairo mb-4">لم يتم تسجيل رقم الإقامة</p>
                )}
                {employee.residencyDocumentUrl && (
                  <div>
                    {employee.residencyDocumentUrl.startsWith('blob:') ||
                    employee.residencyDocumentUrl.match(/\.(jpg|jpeg|png)$/i) ? (
                      <div className="mb-4 flex flex-col items-center gap-2">
                        <div className="text-xs text-gray-500 font-cairo flex items-center gap-1">
                          <div className="w-6 h-4 border border-gray-300 rounded"></div>
                          <span>المقاس الحقيقي: 85.6 × 53.98 مم</span>
                        </div>
                        <div className="relative rounded-xl shadow-lg overflow-hidden border border-gray-200 bg-white">
                          <img
                            src={employee.residencyDocumentUrl}
                            alt="بطاقة الإقامة"
                            className="block object-cover"
                            style={{ width: '322px', height: '204px' }}
                          />
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-transparent to-white/20 rounded-tr-xl"></div>
                        </div>
                      </div>
                    ) : null}
                    <a
                      href={employee.residencyDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-cairo text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      عرض/تحميل الوثيقة
                    </a>
                  </div>
                )}
              </div>

              {/* Passport */}
              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 font-cairo text-lg">جواز السفر</h3>
                  </div>
                  {employee.passportExpiryDate && (
                    <ResidencyExpiryBadge expiryDate={employee.passportExpiryDate} />
                  )}
                </div>
                {employee.passportNumber ? (
                  <div className="bg-white rounded-lg p-3 mb-4">
                    <InfoRow label="رقم الجواز" value={employee.passportNumber} />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 font-cairo mb-4">لم يتم تسجيل رقم الجواز</p>
                )}
                {employee.passportDocumentUrl && (
                  <div>
                    {employee.passportDocumentUrl.startsWith('blob:') ||
                    employee.passportDocumentUrl.match(/\.(jpg|jpeg|png)$/i) ? (
                      <div className="mb-4 flex flex-col items-center gap-2">
                        <div className="text-xs text-gray-500 font-cairo flex items-center gap-1">
                          <div className="w-6 h-4 border border-gray-300 rounded"></div>
                          <span>المقاس الحقيقي: 85.6 × 53.98 مم</span>
                        </div>
                        <div className="relative rounded-xl shadow-lg overflow-hidden border border-gray-200 bg-white">
                          <img
                            src={employee.passportDocumentUrl}
                            alt="جواز السفر"
                            className="block object-cover"
                            style={{ width: '322px', height: '204px' }}
                          />
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-transparent to-white/20 rounded-tr-xl"></div>
                        </div>
                      </div>
                    ) : null}
                    <a
                      href={employee.passportDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-cairo text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      عرض/تحميل الوثيقة
                    </a>
                  </div>
                )}
              </div>

              {/* Employment Contract */}
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-5 lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 font-cairo text-lg">عقد العمل</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {employee.contractStartDate && (
                    <div className="bg-white rounded-lg p-3">
                      <InfoRow label="تاريخ البداية" value={new Date(employee.contractStartDate).toLocaleDateString('ar-SA')} />
                    </div>
                  )}
                  {employee.contractEndDate && (
                    <div className="bg-white rounded-lg p-3">
                      <InfoRow label="تاريخ النهاية" value={new Date(employee.contractEndDate).toLocaleDateString('ar-SA')} />
                    </div>
                  )}
                  {employee.contractDocumentUrl && (
                    <div className="flex items-center justify-center">
                      <a
                        href={employee.contractDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-cairo text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        عرض/تحميل العقد
                      </a>
                    </div>
                  )}
                  {!employee.contractStartDate && !employee.contractEndDate && !employee.contractDocumentUrl && (
                    <p className="text-sm text-gray-400 font-cairo">لم يتم تسجيل بيانات العقد</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Salary Tab */}
        {activeTab === 'salary' && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 font-cairo">سجل الرواتب</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-cairo">إجمالي المدفوع</p>
                    <p className="text-xl font-bold text-gray-900 font-cairo">{formatNumber(54000)} ريال</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#2563eb]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-cairo">عدد الأشهر</p>
                    <p className="text-xl font-bold text-gray-900 font-cairo">٣ أشهر</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-cairo">معلق</p>
                    <p className="text-xl font-bold text-gray-900 font-cairo">{formatNumber(18000)} ريال</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">الشهر</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">الأساسي</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">الإضافي</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">الخصومات</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">الصافي</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">تاريخ الدفع</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockSalaryRecords.map((record) => {
                    const statusConfig = {
                      paid: { label: 'مدفوع', color: 'bg-green-100 text-green-700' },
                      pending: { label: 'معلق', color: 'bg-amber-100 text-amber-700' },
                      partial: { label: 'جزئي', color: 'bg-blue-100 text-blue-700' },
                    }[record.paymentStatus] || { label: 'غير معروف', color: 'bg-gray-100 text-gray-700' }

                    return (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-cairo">{record.monthAr}</td>
                        <td className="px-4 py-3 text-sm font-sans">{formatNumber(record.basicSalary)}</td>
                        <td className="px-4 py-3 text-sm font-sans text-green-600 font-medium">{formatNumber(record.allowances)}</td>
                        <td className="px-4 py-3 text-sm font-sans text-red-600 font-medium">{formatNumber(record.deductions)}</td>
                        <td className="px-4 py-3 text-sm font-bold font-sans text-gray-900">{formatNumber(record.netSalary)}</td>
                        <td className="px-4 py-3 text-sm font-cairo">
                          {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString('ar-SA') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full font-cairo ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-cairo">سجل الحضور</h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Month Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 font-cairo">الشهر:</label>
                <label className="text-sm text-gray-600 font-cairo">الشهر:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddAttendance}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-cairo text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  إضافة تسجيل
                </button>
              </div>
            </div>

            {/* Loading State */}
            {(isLoadingAttendance || isLoadingStats) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-cairo">جاري تحميل البيانات...</p>
              </div>
            )}

            {/* Stats Cards */}
            {attendanceStats && !isLoadingStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Present Days */}
                <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-cairo">أيام الحضور</p>
                      <p className="text-2xl font-bold text-gray-900 font-cairo">{attendanceStats.presentDays}</p>
                    </div>
                  </div>
                </div>

                {/* Absent Days */}
                <div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <span className="text-2xl">❌</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-cairo">أيام الغياب</p>
                      <p className="text-2xl font-bold text-gray-900 font-cairo">{attendanceStats.absentDays}</p>
                    </div>
                  </div>
                </div>

                {/* Late Days */}
                <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <span className="text-2xl">⏰</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-cairo">أيام التأخير</p>
                      <p className="text-2xl font-bold text-gray-900 font-cairo">{attendanceStats.lateDays}</p>
                    </div>
                  </div>
                </div>

                {/* Attendance Rate */}
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-cairo">نسبة الحضور</p>
                      <p className="text-2xl font-bold text-gray-900 font-cairo">{attendanceStats.attendanceRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Stats */}
            {attendanceStats && !isLoadingStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Timer className="w-5 h-5 text-[#2563eb]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-cairo">إجمالي ساعات العمل</p>
                      <p className="text-xl font-bold text-gray-900 font-cairo">{formatNumber(attendanceStats.totalWorkHours)} ساعة</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-white rounded-xl border border-cyan-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-cairo">متوسط الساعات اليومي</p>
                      <p className="text-xl font-bold text-gray-900 font-cairo">{attendanceStats.averageHoursPerDay.toFixed(1)} ساعة</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-cairo">إجمالي الأيام</p>
                      <p className="text-xl font-bold text-gray-900 font-cairo">{attendanceStats.totalDays} يوم</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Records Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">التاريخ</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">الحضور</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">الانصراف</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">ساعات العمل</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">الحالة</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">ملاحظات</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 font-cairo border-b">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                          <p className="text-gray-600 font-cairo">لا توجد سجلات حضور لهذا الشهر</p>
                          <button
                            onClick={handleAddAttendance}
                            className="mt-4 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors font-cairo text-sm font-medium"
                          >
                            إضافة سجل جديد
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    attendanceRecords.map((record) => {
                      const statusConfig = attendanceStatusLabels[record.status]
                      return (
                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-cairo">
                            {new Date(record.date).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm font-sans">
                            {record.checkIn || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-sans">
                            {record.checkOut || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold font-sans text-gray-900">
                            {record.workHours > 0 ? `${record.workHours} ساعة` : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.color} flex items-center gap-1 w-fit`}>
                              <span>{statusConfig.icon}</span>
                              <span className="font-cairo">{statusConfig.labelAr}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-cairo text-gray-500">
                            {record.notesAr || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditAttendance(record)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAttendance(record.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-3">
              <p className="text-sm text-gray-500 font-cairo">الحالات:</p>
              {Object.entries(attendanceStatusLabels).map(([key, value]) => (
                <span key={key} className={`px-3 py-1 text-xs font-medium rounded-full ${value.color} flex items-center gap-1`}>
                  <span>{value.icon}</span>
                  <span className="font-cairo">{value.labelAr}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editEmployee={employee}
      />

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => {
          setIsAttendanceModalOpen(false)
          setEditAttendanceRecord(undefined)
        }}
        onSave={handleSaveAttendance}
        onDelete={editAttendanceRecord ? handleDeleteAttendance : undefined}
        editRecord={editAttendanceRecord}
        employeeId={id || ''}
        employeeNameAr={employee?.nameAr || ''}
      />
    </AppLayout>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-500 font-cairo">{label}</span>
      <span className={`text-sm font-medium font-sans ${highlight ? 'text-[#2563eb] font-bold' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  )
}

function ResidencyExpiryBadge({ expiryDate }: { expiryDate: string }) {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) {
    return (
      <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
        <AlertTriangle className="w-3 h-3" />
        منتهية
      </span>
    )
  }

  if (daysUntilExpiry <= 30) {
    return (
      <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
        <Clock className="w-3 h-3" />
        {daysUntilExpiry} يوم
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
      <CheckCircle2 className="w-3 h-3" />
      سارية
    </span>
  )
}
