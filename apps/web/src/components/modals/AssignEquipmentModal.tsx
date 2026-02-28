import { useState } from 'react'
import { X, Plus, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAssignEquipmentToProject, useUnassignEquipmentFromProject } from '@/hooks/useProjects'
import { useEquipment } from '@/hooks/useEquipment'
import { equipmentTypeLabels } from '@/hooks/useEquipment'
import type { Project } from '@/hooks/useProjects'

interface AssignEquipmentModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
}

export function AssignEquipmentModal({ isOpen, onClose, project }: AssignEquipmentModalProps) {
  const assignMutation = useAssignEquipmentToProject()
  const unassignMutation = useUnassignEquipmentFromProject()
  const { data: equipment = [] } = useEquipment({ status: 'active' })

  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(project.assignedEquipmentIds || [])

  // Reset selection when modal opens
  useState(() => {
    if (isOpen) {
      setSelectedEquipmentIds(project.assignedEquipmentIds || [])
    }
  })

  if (!isOpen) return null

  const availableEquipment = equipment.filter(eq => eq.status === 'active')
  const assignedEquipment = availableEquipment.filter(eq => selectedEquipmentIds.includes(eq.id))
  const unassignedEquipment = availableEquipment.filter(eq => !selectedEquipmentIds.includes(eq.id))

  const handleAssign = (equipmentId: string) => {
    setSelectedEquipmentIds([...selectedEquipmentIds, equipmentId])
    assignMutation.mutate({ projectId: project.id, equipmentId })
  }

  const handleUnassign = (equipmentId: string) => {
    setSelectedEquipmentIds(selectedEquipmentIds.filter(id => id !== equipmentId))
    unassignMutation.mutate({ projectId: project.id, equipmentId })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-cairo">المعدات المضافة للمشروع</h2>
            <p className="text-sm text-gray-500 font-cairo">{project.nameAr}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Assigned Equipment */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              المعدات المضافة ({assignedEquipment.length})
            </h3>

            {assignedEquipment.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-500 font-cairo">لم يتم إضافة أي معدات بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assignedEquipment.map((eq) => (
                  <div
                    key={eq.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 font-cairo">{eq.nameAr}</p>
                      <p className="text-xs text-gray-500 font-sans">{eq.code} - {equipmentTypeLabels[eq.type].label}</p>
                    </div>
                    <button
                      onClick={() => handleUnassign(eq.id)}
                      className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      title="إزالة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Equipment */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-cairo mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              المعدات المتاحة ({unassignedEquipment.length})
            </h3>

            {unassignedEquipment.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 font-cairo">جميع المعدات مضافة للمشروع</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unassignedEquipment.map((eq) => (
                  <div
                    key={eq.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 font-cairo">{eq.nameAr}</p>
                      <p className="text-xs text-gray-500 font-sans">{eq.code} - {equipmentTypeLabels[eq.type].label}</p>
                    </div>
                    <button
                      onClick={() => handleAssign(eq.id)}
                      className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                      title="إضافة"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 font-cairo"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  )
}
