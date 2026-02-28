import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmployeeModal } from '@/components/modals/EmployeeModal'
import {
  useEmployees,
  useDeleteEmployee,
  getEmployeeStats,
  getResidencyStatus,
  getResidencyStatusConfig,
  departmentOptions,
  nationalityOptions,
  employeeStatusLabels,
  type EmployeeFilters,
  type Employee,
} from '@/hooks/useEmployees'
import { useProjects } from '@/hooks/useProjects'
import {
  Plus,
  Users,
  UserCheck,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
} from 'lucide-react'

export default function EmployeesListPage() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editEmployee, setEditEmployee] = useState<Employee | undefined>()
  const [filters, setFilters] = useState<EmployeeFilters>({})

  const { data: employees = [], isLoading, isError, error } = useEmployees(filters)
  const { data: projectsResponse } = useProjects()
  const projects = projectsResponse?.projects || []
  const deleteEmployee = useDeleteEmployee()

  const stats = getEmployeeStats()

  // Check for expired residencies warning
  const hasExpiredResidencies = stats.expiredResidencies > 0

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      deleteEmployee.mutate(id)
    }
  }

  const clearFilters = () => {
    setFilters({})
  }

  return (
    <AppLayout titleAr="الموارد البشرية">
      <PageHeader
        title="Employees"
        titleAr="الموظفين"
        subtitle="Human Resources Management"
        subtitleAr="إدارة شؤون الموظفين"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'HR', labelAr: 'الموارد البشرية', path: '/hr' },
          { label: 'Employees', labelAr: 'الموظفين' },
        ]}
        actions={[
          {
            label: 'Add Employee',
            labelAr: 'إضافة موظف',
            icon: <Plus className="w-4 h-4" />,
            variant: 'primary' as const,
            onClick: () => {
              setEditEmployee(undefined)
              setIsModalOpen(true)
            },
          },
        ]}
      />

      {/* Residency Warning Alert */}
      {hasExpiredResidencies && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900 font-cairo">تحذير: إقامات منتهية أو قريبة الانتهاء</h3>
              <p className="text-sm text-red-700 font-cairo">
                يوجد {stats.expiredResidencies} إقامة منتهية و {stats.expiringSoonResidencies} إقامة تنتهي خلال 30 يوم
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-cairo">إجمالي العمالة</p>
              <p className="text-2xl font-bold text-blue-700 font-sans">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-cairo">بالمواقع</p>
              <p className="text-2xl font-bold text-green-700 font-sans">{stats.onSite}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-cairo">إقامات منتهية</p>
              <p className="text-2xl font-bold text-red-700 font-sans">{stats.expiredResidencies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-cairo">قريبة الانتهاء</p>
              <p className="text-2xl font-bold text-amber-700 font-sans">{stats.expiringSoonResidencies}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 font-cairo">تصفية:</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo w-64"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filters.department || ''}
            onChange={(e) => setFilters({ ...filters, department: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            <option value="">جميع الأقسام</option>
            {departmentOptions.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.labelAr}
              </option>
            ))}
          </select>

          {/* Nationality Filter */}
          <select
            value={filters.nationality || ''}
            onChange={(e) => setFilters({ ...filters, nationality: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            <option value="">جميع الجنسيات</option>
            {nationalityOptions.map((nation) => (
              <option key={nation.code} value={nation.code}>
                {nation.flag} {nation.nameAr}
              </option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            value={filters.projectId || ''}
            onChange={(e) => setFilters({ ...filters, projectId: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            <option value="">جميع المشاريع</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.nameAr}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          >
            <option value="all">جميع الحالات</option>
            {Object.entries(employeeStatusLabels).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          {(filters.search || filters.department || filters.nationality || filters.projectId || filters.status) && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="font-cairo">
              مسح التصفية
            </Button>
          )}
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isError ? (
          <div className="p-8 text-center">
            <p className="text-red-500 font-cairo">Error: {String(error)}</p>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2 font-cairo">جاري التحميل...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-700 font-cairo mb-2">لا يوجد موظفين</p>
            <p className="text-sm text-gray-500 font-cairo mb-4">ابدأ بإضافة موظفين جدد</p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)} className="font-cairo">
              <Plus className="w-4 h-4 ml-2" />
              إضافة موظف
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الموظف</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الجنسية</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المسمى الوظيفي</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">القسم</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المشروع</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الإقامة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الحالة</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((employee) => {
                  const residencyStatus = getResidencyStatus(employee.residencyExpiryDate)
                  const residencyConfig = getResidencyStatusConfig(residencyStatus)
                  const statusConfig = employeeStatusLabels[employee.status]

                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 font-cairo">{employee.nameAr}</p>
                        <p className="text-xs text-gray-500 font-sans">{employee.name}</p>
                        <p className="text-xs text-gray-400 font-sans">{employee.employeeNumber}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-lg" title={employee.nationality}>
                          {nationalityOptions.find(n => n.code === employee.nationalityCode)?.flag || '🏳'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 font-cairo">{employee.jobTitleAr}</p>
                        <p className="text-xs text-gray-500 font-sans">{employee.jobTitle}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-cairo">
                        {employee.departmentAr}
                      </td>
                      <td className="px-4 py-3">
                        {employee.projectNameAr ? (
                          <div>
                            <p className="text-sm text-gray-900 font-cairo">{employee.projectNameAr}</p>
                            <p className="text-xs text-gray-500 font-sans">{employee.projectName}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 font-cairo">غير محدد</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {employee.residencyExpiryDate ? (
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${residencyConfig.color}`}>
                              {residencyConfig.icon} {residencyConfig.label}
                            </span>
                            <p className="text-xs text-gray-500 font-sans">
                              {new Date(employee.residencyExpiryDate).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 font-cairo">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full font-cairo ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"
                            onClick={() => navigate(`/hr/employees/${employee.id}`)}
                            title="عرض الملف الشخصي"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg"
                            onClick={() => {
                              setEditEmployee(employee)
                              setIsModalOpen(true)
                            }}
                            title="تعديل"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                            onClick={() => handleDelete(employee.id)}
                            title="حذف"
                            disabled={deleteEmployee.isPending}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditEmployee(undefined)
        }}
        editEmployee={editEmployee}
      />
    </AppLayout>
  )
}
