import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { SupplierModal } from '@/components/modals/SupplierModal'
import {
  useSuppliers,
  useDeleteSupplier,
  useSupplierStats,
  supplierCategoryLabels,
  type SupplierCategory,
} from '@/hooks/useSuppliers'
import {
  Plus,
  Trash2,
  Edit,
  Building2,
  Phone,
  User,
  Search,
  Star,
  Calendar,
} from 'lucide-react'

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<SupplierCategory | 'all'>('all')
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: suppliers = [], isLoading } = useSuppliers(
    categoryFilter === 'all' ? undefined : categoryFilter
  )
  const { data: stats } = useSupplierStats()
  const deleteMutation = useDeleteSupplier()

  const handleEdit = (supplier: any) => {
    setSelectedSupplier(supplier)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      deleteMutation.mutate(id)
    }
  }

  const handleAddNew = () => {
    setSelectedSupplier(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSupplier(null)
  }

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPersonAr.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600 font-cairo">{rating}</span>
      </div>
    )
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ar-SA')
  }

  return (
    <AppLayout titleAr="الموردون">
      <PageHeader
        title="Suppliers"
        titleAr="الموردون"
        subtitle="Manage your suppliers and vendors"
        subtitleAr="إدارة الموردون والموردين"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'Suppliers & Clients', labelAr: 'الموردون والعملاء', path: '/suppliers' },
          { label: 'Suppliers', labelAr: 'الموردون' },
        ]}
        actions={[
          {
            label: 'New Supplier',
            labelAr: 'مورد جديد',
            icon: <Plus className="w-4 h-4" />,
            variant: 'primary' as const,
            onClick: handleAddNew,
          },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-cairo">إجمالي الموردون</p>
              <p className="text-2xl font-bold text-blue-700 font-sans">{stats?.totalSuppliers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-cairo">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-green-700 font-sans">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Star className="w-6 h-6 text-amber-600 fill-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-cairo">متوسط التقييم</p>
              <p className="text-2xl font-bold text-amber-700 font-sans">{stats?.averageRating || 0} ⭐</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم أو المسؤول..."
              className="w-full pr-12 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 font-cairo">الفئة:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as SupplierCategory | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
            >
              <option value="all">الكل</option>
              {Object.entries(supplierCategoryLabels).map(([key, { labelAr, icon }]) => (
                <option key={key} value={key}>
                  {icon} {labelAr}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || categoryFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
              }}
              className="font-cairo"
            >
              مسح التصفية
            </Button>
          )}
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2 font-cairo">جاري التحميل...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-700 font-cairo mb-2">لا يوجد موردون</p>
            <p className="text-sm text-gray-500 font-cairo">ابدأ بإضافة أول مورد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المورد</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الفئة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">التقييم</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المسؤول</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الهاتف</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">آخر طلب</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجمالي الطلبات</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 font-cairo">{supplier.nameAr}</p>
                        <p className="text-xs text-gray-500 font-sans">{supplier.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 font-cairo">
                        <span>{supplierCategoryLabels[supplier.category].icon}</span>
                        <span>{supplier.categoryAr}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {renderStars(supplier.rating)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900 font-cairo">{supplier.contactPersonAr}</p>
                          <p className="text-xs text-gray-500 font-sans">{supplier.contactPerson}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 font-sans">{supplier.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 font-cairo">
                        {formatDate(supplier.lastOrderDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 font-sans">
                        {supplier.totalOrders}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"
                          onClick={() => handleEdit(supplier)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                          onClick={() => handleDelete(supplier.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        supplier={selectedSupplier}
      />
    </AppLayout>
  )
}
