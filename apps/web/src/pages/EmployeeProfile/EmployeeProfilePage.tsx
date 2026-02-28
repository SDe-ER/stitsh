import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmployeeModal } from '@/components/modals/EmployeeModal'
import { useEmployeeById } from '@/hooks/useEmployees'
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

  const { data: employee, isLoading } = useEmployeeById(id || '')

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
      <PageHeader
        title={employee.name}
        titleAr={employee.nameAr}
        subtitle={`Employee #: ${employee.employeeNumber}`}
        subtitleAr={`رقم الموظف: ${employee.employeeNumber}`}
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'HR', labelAr: 'الموارد البشرية', path: '/hr' },
          { label: 'Employees', labelAr: 'الموظفين', path: '/hr/employees' },
          { label: 'Profile', labelAr: 'الملف الشخصي' },
        ]}
        actions={[
          {
            label: 'Edit',
            labelAr: 'تعديل',
            icon: <Edit className="w-4 h-4" />,
            variant: 'outline' as const,
            onClick: () => setIsEditModalOpen(true),
          },
        ]}
      />

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar / Photo */}
          {employee.photoUrl ? (
            <img
              src={employee.photoUrl}
              alt={employee.nameAr}
              className="rounded-lg object-cover border-4 border-[#2563eb]"
              style={{ width: '160px', height: '240px' }} // 4:6 aspect ratio (4x6 cm portrait)
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-full flex items-center justify-center text-white text-2xl font-bold font-cairo">
              {employee.nameAr.charAt(0)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-2xl font-bold text-gray-900 font-cairo">{employee.nameAr}</h2>
              <span className="text-xl text-gray-500 font-sans">{employee.name}</span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full font-cairo ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span className="font-cairo">{employee.jobTitleAr}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg w-fit ${departmentColors[employee.department] || 'bg-gray-100 text-gray-700'}`}>
                <Building className="w-4 h-4" />
                <span className="font-medium font-cairo">{employee.departmentAr}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-2xl">{nationality.flag}</span>
                <span className="font-cairo">{nationality.nameAr}</span>
              </div>
              {employee.projectNameAr && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Home className="w-4 h-4" />
                  <span className="font-cairo">{employee.projectNameAr}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {employee.phone && (
              <a href={`tel:${employee.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-[#2563ab]">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-sans" dir="ltr">{employee.phone}</span>
              </a>
            )}
            {employee.email && (
              <a href={`mailto:${employee.email}`} className="flex items-center gap-2 text-gray-600 hover:text-[#2563ab]">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-sans">{employee.email}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 transition-colors font-cairo font-medium flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-[#2563eb] text-[#2563eb]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
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
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-cairo mb-6">المعلومات الشخصية</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 font-cairo border-b border-gray-200 pb-2">المعلومات الأساسية</h3>
                <InfoRow label="رقم الموظف" value={employee.employeeNumber} />
                <InfoRow label="الاسم (عربي)" value={employee.nameAr} />
                <InfoRow label="الاسم (إنجليزي)" value={employee.name} />
                <InfoRow label="الجنسية" value={`${nationality.flag} ${nationality.nameAr}`} />
                <InfoRow label="المسمى الوظيفي (عربي)" value={employee.jobTitleAr} />
                <InfoRow label="المسمى الوظيفي (إنجليزي)" value={employee.jobTitle} />
                <InfoRow label="القسم" value={employee.departmentAr} />
              </div>

              {/* Work Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 font-cairo border-b border-gray-200 pb-2">معلومات العمل</h3>
                <InfoRow label="الراتب" value={`${formatNumber(employee.salary)} ريال`} />
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

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 font-cairo border-b border-gray-200 pb-2">بيانات الاتصال</h3>
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
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-cairo mb-6">الوثائق</h2>

            <div className="space-y-4">
              {/* Residency Card */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 font-cairo flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    بطاقة الإقامة
                  </h3>
                  {employee.residencyExpiryDate && (
                    <ResidencyExpiryBadge expiryDate={employee.residencyExpiryDate} />
                  )}
                </div>
                {employee.residencyNumber ? (
                  <InfoRow label="رقم الإقامة" value={employee.residencyNumber} />
                ) : (
                  <p className="text-sm text-gray-400 font-cairo">لم يتم تسجيل رقم الإقامة</p>
                )}
                {employee.residencyDocumentUrl && (
                  <div className="mt-3">
                    {/* ID Card Preview - displayed at actual credit card size (85.6x53.98mm) */}
                    {employee.residencyDocumentUrl.startsWith('blob:') ||
                    employee.residencyDocumentUrl.match(/\.(jpg|jpeg|png)$/i) ? (
                      <div className="mb-3 flex flex-col items-center gap-2">
                        {/* Size indicator */}
                        <div className="text-xs text-gray-500 font-cairo flex items-center gap-1">
                          <div className="w-6 h-4 border border-gray-300 rounded"></div>
                          <span>المقاس الحقيقي: 85.6 × 53.98 مم (ISO/IEC 7810 ID-1)</span>
                        </div>
                        {/* Credit card style display */}
                        <div className="relative rounded-xl shadow-lg overflow-hidden border border-gray-200 bg-white">
                          <img
                            src={employee.residencyDocumentUrl}
                            alt="بطاقة الإقامة"
                            className="block object-cover"
                            style={{ width: '322px', height: '204px' }} // Actual credit card size at 96 DPI
                          />
                          {/* Corner cut indicator (like real credit cards) */}
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-transparent to-white/20 rounded-tr-xl"></div>
                        </div>
                      </div>
                    ) : null}
                    <a
                      href={employee.residencyDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#2563eb] hover:underline font-cairo"
                    >
                      <Download className="w-4 h-4" />
                      عرض/تحميل وثيقة الإقامة
                    </a>
                  </div>
                )}
              </div>

              {/* Passport */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 font-cairo flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    جواز السفر
                  </h3>
                  {employee.passportExpiryDate && (
                    <ResidencyExpiryBadge expiryDate={employee.passportExpiryDate} />
                  )}
                </div>
                {employee.passportNumber ? (
                  <InfoRow label="رقم الجواز" value={employee.passportNumber} />
                ) : (
                  <p className="text-sm text-gray-400 font-cairo">لم يتم تسجيل رقم الجواز</p>
                )}
                {employee.passportDocumentUrl && (
                  <div className="mt-3">
                    {/* Passport Data Page Preview - displayed at actual credit card size (85.6x53.98mm) */}
                    {employee.passportDocumentUrl.startsWith('blob:') ||
                    employee.passportDocumentUrl.match(/\.(jpg|jpeg|png)$/i) ? (
                      <div className="mb-3 flex flex-col items-center gap-2">
                        {/* Size indicator */}
                        <div className="text-xs text-gray-500 font-cairo flex items-center gap-1">
                          <div className="w-6 h-4 border border-gray-300 rounded"></div>
                          <span>المقاس الحقيقي: 85.6 × 53.98 مم (ISO/IEC 7810 ID-1)</span>
                        </div>
                        {/* Credit card style display */}
                        <div className="relative rounded-xl shadow-lg overflow-hidden border border-gray-200 bg-white">
                          <img
                            src={employee.passportDocumentUrl}
                            alt="جواز السفر"
                            className="block object-cover"
                            style={{ width: '322px', height: '204px' }} // Actual credit card size at 96 DPI
                          />
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-transparent to-white/20 rounded-tr-xl"></div>
                        </div>
                      </div>
                    ) : null}
                    <a
                      href={employee.passportDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#2563eb] hover:underline font-cairo"
                    >
                      <Download className="w-4 h-4" />
                      عرض/تحميل وثيقة الجواز
                    </a>
                  </div>
                )}
              </div>

              {/* Employment Contract */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 font-cairo flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5" />
                  عقد العمل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.contractStartDate && (
                    <InfoRow label="تاريخ البداية" value={new Date(employee.contractStartDate).toLocaleDateString('ar-SA')} />
                  )}
                  {employee.contractEndDate && (
                    <InfoRow label="تاريخ النهاية" value={new Date(employee.contractEndDate).toLocaleDateString('ar-SA')} />
                  )}
                  {!employee.contractStartDate && !employee.contractEndDate && (
                    <p className="text-sm text-gray-400 font-cairo col-span-2">لم يتم تسجيل بيانات العقد</p>
                  )}
                  {employee.contractDocumentUrl && (
                    <div className="mt-3">
                      <a
                        href={employee.contractDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[#2563eb] hover:underline font-cairo"
                      >
                        <Download className="w-4 h-4" />
                        عرض/تحميل وثيقة العقد
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Salary Tab */}
        {activeTab === 'salary' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-cairo mb-6">سجل الرواتب</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الشهر</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الأساسي</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الإضافي</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الخصومات</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الصافي</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">تاريخ الدفع</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الحالة</th>
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
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-cairo">{record.monthAr}</td>
                        <td className="px-4 py-3 text-sm font-sans">{formatNumber(record.basicSalary)}</td>
                        <td className="px-4 py-3 text-sm font-sans text-green-600">{formatNumber(record.allowances)}</td>
                        <td className="px-4 py-3 text-sm font-sans text-red-600">{formatNumber(record.deductions)}</td>
                        <td className="px-4 py-3 text-sm font-bold font-sans">{formatNumber(record.netSalary)}</td>
                        <td className="px-4 py-3 text-sm font-cairo">
                          {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString('ar-SA') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${statusConfig.color}`}>
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
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-cairo mb-6">سجل الحضور</h2>

            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-700 font-cairo mb-2">سجل الحضور قيد التطوير</p>
              <p className="text-sm text-gray-500 font-cairo">سيتم إضافة ميزة تسجيل الحضور والانصراف قريباً</p>
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
    </AppLayout>
  )
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-500 font-cairo">{label}</span>
      <span className="text-sm font-medium text-gray-900 font-sans">{value}</span>
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
