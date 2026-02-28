import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit2, Check, X as XIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTipperTypes, useCreateTipperType, useUpdateTipperType, useDeleteTipperType, type TipperType } from '@/hooks/useProduction'

interface TipperTypesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TipperTypesModal({ isOpen, onClose }: TipperTypesModalProps) {
  const { data: tipperTypes = [], refetch } = useTipperTypes()
  const createMutation = useCreateTipperType()
  const updateMutation = useUpdateTipperType()
  const deleteMutation = useDeleteTipperType()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<TipperType>>({})
  const [newForm, setNewForm] = useState({ name: '', nameAr: '', volume: '', capacity: '' })

  useEffect(() => {
    if (isOpen) {
      refetch()
    }
  }, [isOpen, refetch])

  if (!isOpen) return null

  const handleEdit = (tipper: TipperType) => {
    setEditingId(tipper.id)
    setEditForm({
      name: tipper.name,
      nameAr: tipper.nameAr,
      volume: tipper.volume,
      capacity: tipper.capacity,
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSaveEdit = (id: string) => {
    if (editForm.name && editForm.nameAr && editForm.volume && editForm.capacity) {
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
    if (window.confirm('هل أنت متأكد من حذف هذا النوع؟')) {
      deleteMutation.mutate(id)
    }
  }

  const handleAddNew = () => {
    if (newForm.name && newForm.nameAr && newForm.volume && newForm.capacity) {
      createMutation.mutate({
        name: newForm.name,
        nameAr: newForm.nameAr,
        volume: parseFloat(newForm.volume),
        capacity: parseFloat(newForm.capacity),
      })
      setNewForm({ name: '', nameAr: '', volume: '', capacity: '' })
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-cairo">إدارة أنواع القلابات</h2>
            <p className="text-sm text-gray-500 font-cairo">Tipper Types Management</p>
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
          {/* Add New Tipper Type */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 font-cairo">إضافة نوع جديد</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              <input
                type="number"
                placeholder="الحجم (م³)"
                value={newForm.volume}
                onChange={(e) => setNewForm({ ...newForm, volume: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans text-sm"
              />
              <input
                type="number"
                placeholder="السعة (طن)"
                value={newForm.capacity}
                onChange={(e) => setNewForm({ ...newForm, capacity: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans text-sm"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddNew}
              disabled={!newForm.nameAr || !newForm.name || !newForm.volume || !newForm.capacity || createMutation.isPending}
              className="mt-3 font-cairo"
            >
              <Plus className="w-4 h-4 ml-1" />
              إضافة
            </Button>
          </div>

          {/* Tipper Types List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 font-cairo">الأنواع الحالية</h3>
            {tipperTypes.length === 0 ? (
              <p className="text-center text-gray-500 py-8 font-cairo">لا توجد أنواع قلابات</p>
            ) : (
              <div className="space-y-2">
                {tipperTypes.map((tipper) => (
                  <div
                    key={tipper.id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    {editingId === tipper.id ? (
                      <>
                        <input
                          type="text"
                          value={editForm.nameAr || ''}
                          onChange={(e) => setEditForm({ ...editForm, nameAr: e.target.value })}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg font-cairo text-sm"
                        />
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          value={editForm.volume || ''}
                          onChange={(e) => setEditForm({ ...editForm, volume: parseFloat(e.target.value) })}
                          className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg font-sans text-sm"
                        />
                        <input
                          type="number"
                          value={editForm.capacity || ''}
                          onChange={(e) => setEditForm({ ...editForm, capacity: parseFloat(e.target.value) })}
                          className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg font-sans text-sm"
                        />
                        <button
                          onClick={() => handleSaveEdit(tipper.id)}
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
                          <p className="font-medium text-gray-900 font-cairo">{tipper.nameAr}</p>
                          <p className="text-sm text-gray-500">{tipper.name}</p>
                        </div>
                        <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-sans text-sm font-medium">
                          {tipper.volume} م³
                        </div>
                        <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg font-sans text-sm font-medium">
                          {tipper.capacity} طن
                        </div>
                        <button
                          onClick={() => handleEdit(tipper)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tipper.id)}
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
