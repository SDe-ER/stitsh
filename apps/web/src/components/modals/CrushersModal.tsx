import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit2, Check, X as XIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  useCrushers,
  useCreateCrusher,
  useUpdateCrusher,
  useDeleteCrusher,
  crusherTypeLabels,
  type Crusher,
  type CrusherType
} from '@/hooks/useProduction'

interface CrushersModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

const crusherTypeOptions = [
  { value: 'primary' as CrusherType, ...crusherTypeLabels.primary },
  { value: 'secondary' as CrusherType, ...crusherTypeLabels.secondary },
  { value: 'tertiary' as CrusherType, ...crusherTypeLabels.tertiary },
  { value: 'screening' as CrusherType, ...crusherTypeLabels.screening },
]

export function CrushersModal({ isOpen, onClose, projectId }: CrushersModalProps) {
  const { data: crushers = [], refetch } = useCrushers(projectId)
  const createMutation = useCreateCrusher()
  const updateMutation = useUpdateCrusher()
  const deleteMutation = useDeleteCrusher()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Crusher>>({})
  const [newForm, setNewForm] = useState({
    name: '',
    nameAr: '',
    type: 'primary' as CrusherType,
    location: '',
    locationAr: '',
    capacity: '',
  })

  useEffect(() => {
    if (isOpen) {
      refetch()
    }
  }, [isOpen, refetch])

  if (!isOpen) return null

  const handleEdit = (crusher: Crusher) => {
    setEditingId(crusher.id)
    setEditForm({
      name: crusher.name,
      nameAr: crusher.nameAr,
      type: crusher.type,
      location: crusher.location || '',
      locationAr: crusher.locationAr || '',
      capacity: crusher.capacity?.toString() || '',
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSaveEdit = (id: string) => {
    if (editForm.name && editForm.nameAr && editForm.type) {
      updateMutation.mutate(
        { id, data: editForm },
        {
          onSuccess: () => {
            setEditingId(null)
            setEditForm({})
          },
        }
      )
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الكسارة؟')) {
      deleteMutation.mutate(id)
    }
  }

  const handleAddNew = () => {
    if (newForm.name && newForm.nameAr && newForm.type) {
      createMutation.mutate({
        projectId,
        name: newForm.name,
        nameAr: newForm.nameAr,
        type: newForm.type,
        typeAr: crusherTypeOptions.find(t => t.value === newForm.type)?.label || newForm.type,
        location: newForm.location || undefined,
        locationAr: newForm.locationAr || undefined,
        capacity: newForm.capacity ? parseFloat(newForm.capacity) : undefined,
      })
      setNewForm({
        name: '',
        nameAr: '',
        type: 'primary',
        location: '',
        locationAr: '',
        capacity: '',
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-cairo">إدارة الكسارات</h2>
            <p className="text-sm text-gray-500 font-cairo">Crushers Management</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Add New Crusher */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 font-cairo">إضافة كسارة جديدة</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <input
                type="text"
                placeholder="الاسم (عربي)"
                value={newForm.nameAr}
                onChange={(e) => setNewForm({ ...newForm, nameAr: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo text-sm"
              />
              <input
                type="text"
                placeholder="Name (English)"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent text-sm"
              />
              <select
                value={newForm.type}
                onChange={(e) => setNewForm({ ...newForm, type: e.target.value as CrusherType })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo text-sm"
              >
                {crusherTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="الموقع (عربي)"
                value={newForm.locationAr}
                onChange={(e) => setNewForm({ ...newForm, locationAr: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo text-sm"
              />
              <input
                type="text"
                placeholder="Location (English)"
                value={newForm.location}
                onChange={(e) => setNewForm({ ...newForm, location: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent text-sm"
              />
              <input
                type="number"
                placeholder="السعة (طن/ساعة)"
                value={newForm.capacity}
                onChange={(e) => setNewForm({ ...newForm, capacity: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans text-sm"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddNew}
              disabled={!newForm.nameAr || !newForm.name || !newForm.type || createMutation.isPending}
              className="mt-3 font-cairo"
            >
              <Plus className="w-4 h-4 ml-1" />
              إضافة كسارة
            </Button>
          </div>

          {/* Crushers List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 font-cairo">الكسارات الحالية</h3>
            {crushers.length === 0 ? (
              <p className="text-center text-gray-500 py-8 font-cairo">لا توجد كسارات</p>
            ) : (
              <div className="space-y-2">
                {crushers.map((crusher) => (
                  <div
                    key={crusher.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                      crusher.isActive
                        ? 'bg-white border-gray-200 hover:border-gray-300'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    {editingId === crusher.id ? (
                      <>
                        <input
                          type="text"
                          value={editForm.nameAr || ''}
                          onChange={(e) => setEditForm({ ...editForm, nameAr: e.target.value })}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg font-cairo text-sm"
                          placeholder="الاسم (عربي)"
                        />
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                          placeholder="Name (English)"
                        />
                        <select
                          value={editForm.type || crusher.type}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value as CrusherType })}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg font-cairo text-sm"
                        >
                          {crusherTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editForm.locationAr || ''}
                          onChange={(e) => setEditForm({ ...editForm, locationAr: e.target.value })}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg font-cairo text-sm"
                          placeholder="الموقع"
                        />
                        <input
                          type="number"
                          value={editForm.capacity || ''}
                          onChange={(e) => setEditForm({ ...editForm, capacity: parseFloat(e.target.value) })}
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg font-sans text-sm"
                          placeholder="السعة"
                        />
                        <button
                          onClick={() => handleSaveEdit(crusher.id)}
                          className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg"
                          disabled={updateMutation.isPending}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 font-cairo">{crusher.nameAr}</p>
                          <p className="text-sm text-gray-500">{crusher.name}</p>
                          {crusher.locationAr && (
                            <p className="text-xs text-gray-400 font-cairo mt-0.5">
                              📍 {crusher.locationAr}
                            </p>
                          )}
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg font-cairo text-sm font-medium ${
                          crusher.type === 'primary'
                            ? 'bg-red-50 text-red-700'
                            : crusher.type === 'secondary'
                            ? 'bg-orange-50 text-orange-700'
                            : crusher.type === 'tertiary'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {crusher.typeAr}
                        </div>
                        {crusher.capacity && (
                          <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-sans text-sm font-medium">
                            {crusher.capacity} طن/س
                          </div>
                        )}
                        <button
                          onClick={() => handleEdit(crusher)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(crusher.id)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                          title="حذف"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <Button variant="outline" onClick={onClose} className="font-cairo">
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  )
}
