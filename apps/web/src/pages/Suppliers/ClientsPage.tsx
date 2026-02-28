import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { ClientModal } from '@/components/modals/ClientModal'
import {
  useClients,
  useDeleteClient,
  useClientStats,
} from '@/hooks/useSuppliers'
import { formatNumber } from '@/utils/format'
import {
  Plus,
  Trash2,
  Edit,
  Building2,
  FileText,
  Phone,
  User,
  Search,
} from 'lucide-react'

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: clients = [], isLoading } = useClients()
  const { data: stats } = useClientStats()
  const deleteMutation = useDeleteClient()

  const handleEdit = (client: any) => {
    setSelectedClient(client)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteMutation.mutate(id)
    }
  }

  const handleAddNew = () => {
    setSelectedClient(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClient(null)
  }

  // Filter clients based on search
  const filteredClients = clients.filter((client) =>
    client.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.commercialRegistration.includes(searchTerm) ||
    client.contactPersonAr.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AppLayout titleAr="العملاء">
      <PageHeader
        title="Clients"
        titleAr="العملاء"
        subtitle="Manage your clients and their contracts"
        subtitleAr="إدارة العملاء والعقود"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'Suppliers & Clients', labelAr: 'الموردون والعملاء', path: '/suppliers' },
          { label: 'Clients', labelAr: 'العملاء' },
        ]}
        actions={[
          {
            label: 'New Client',
            labelAr: 'عميل جديد',
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
              <p className="text-sm text-blue-600 font-cairo">إجمالي العملاء</p>
              <p className="text-2xl font-bold text-blue-700 font-sans">{stats?.totalClients || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-cairo">المشاريع النشطة</p>
              <p className="text-2xl font-bold text-green-700 font-sans">{stats?.totalActiveProjects || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-cairo">إجمالي العقود</p>
              <p className="text-2xl font-bold text-amber-700 font-sans">
                {formatNumber(stats?.totalContracts || 0)} ريال
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، رقم السجل التجاري، أو المسؤول..."
            className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2 font-cairo">جاري التحميل...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-700 font-cairo mb-2">لا يوجد عملاء</p>
            <p className="text-sm text-gray-500 font-cairo">ابدأ بإضافة أول عميل</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">العميل</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">رقم السجل</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">رقم الضريبة</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">المسؤول</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">الهاتف</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">المشاريع</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 font-cairo">إجمالي العقود</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 font-cairo">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 font-cairo">{client.nameAr}</p>
                        <p className="text-xs text-gray-500 font-sans">{client.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 font-sans font-mono">
                        {client.commercialRegistration}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 font-sans font-mono">
                        {client.vatNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900 font-cairo">{client.contactPersonAr}</p>
                          <p className="text-xs text-gray-500 font-sans">{client.contactPerson}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 font-sans">{client.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 font-cairo">
                        {client.activeProjects} نشط
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-green-600 font-sans">
                        {formatNumber(client.totalContracts)} ريال
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"
                          onClick={() => handleEdit(client)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                          onClick={() => handleDelete(client.id)}
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
      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        client={selectedClient}
      />
    </AppLayout>
  )
}
