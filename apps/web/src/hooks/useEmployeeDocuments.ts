import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================

export type DocumentType = 'ID_CARD' | 'PASSPORT' | 'DRIVING_LICENSE' | 'MEDICAL_INSURANCE' | 'IQAMA' | 'OTHER'
export type DocumentStatus = 'VALID' | 'EXPIRING' | 'EXPIRED'

export interface EmployeeDocument {
  id: string
  employeeId: string
  type: DocumentType
  fileUrl: string
  fileName?: string
  fileSize?: number
  status: DocumentStatus
  expiryDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateDocumentData {
  type: DocumentType
  expiryDate?: string
  notes?: string
}

// ============================================================================
// DOCUMENT LABELS
// ============================================================================

export const documentTypeLabels: Record<DocumentType, { labelAr: string; labelEn: string; icon: string; color: string }> = {
  ID_CARD: {
    labelAr: 'صورة الهوية / الإقامة',
    labelEn: 'ID Card / Residence',
    icon: 'id_card',
    color: 'bg-blue-500'
  },
  PASSPORT: {
    labelAr: 'جواز السفر',
    labelEn: 'Passport',
    icon: 'passport',
    color: 'bg-indigo-500'
  },
  DRIVING_LICENSE: {
    labelAr: 'رخصة قيادة معدات',
    labelEn: 'Equipment Driving License',
    icon: 'agriculture',
    color: 'bg-orange-500'
  },
  MEDICAL_INSURANCE: {
    labelAr: 'التأمين الطبي',
    labelEn: 'Medical Insurance',
    icon: 'health_and_safety',
    color: 'bg-green-500'
  },
  IQAMA: {
    labelAr: 'الإقامة',
    labelEn: 'Iqama',
    icon: 'badge',
    color: 'bg-purple-500'
  },
  OTHER: {
    labelAr: 'وثيقة أخرى',
    labelEn: 'Other Document',
    icon: 'description',
    color: 'bg-slate-500'
  }
}

export const documentStatusLabels: Record<DocumentStatus, { labelAr: string; labelEn: string; color: string; bgColor: string }> = {
  VALID: {
    labelAr: 'ساري',
    labelEn: 'Valid',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100'
  },
  EXPIRING: {
    labelAr: 'ينتهي قريباً',
    labelEn: 'Expiring Soon',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100'
  },
  EXPIRED: {
    labelAr: 'منتهي',
    labelEn: 'Expired',
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]> {
  const response = await fetch(`/api/employees/${employeeId}/documents`)
  if (!response.ok) {
    throw new Error('Failed to fetch documents')
  }
  return response.json()
}

async function uploadEmployeeDocument(employeeId: string, data: CreateDocumentData, file: File): Promise<EmployeeDocument> {
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

async function deleteEmployeeDocument(employeeId: string, documentId: string): Promise<void> {
  const response = await fetch(`/api/employees/${employeeId}/documents/${documentId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Failed to delete document')
  }
}

async function updateEmployeeDocument(employeeId: string, documentId: string, data: Partial<CreateDocumentData>): Promise<EmployeeDocument> {
  const response = await fetch(`/api/employees/${employeeId}/documents/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('Failed to update document')
  }

  return response.json()
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

export function useEmployeeDocuments(employeeId: string) {
  return useQuery({
    queryKey: ['employeeDocuments', employeeId],
    queryFn: () => fetchEmployeeDocuments(employeeId),
    enabled: !!employeeId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useUploadEmployeeDocument(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { documentData: CreateDocumentData; file: File }) =>
      uploadEmployeeDocument(employeeId, data.documentData, data.file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments', employeeId] })
      toast.success('تم رفع الوثيقة بنجاح')
    },
    onError: (error) => {
      console.error('Upload document error:', error)
      toast.error('فشل رفع الوثيقة')
    }
  })
}

export function useDeleteEmployeeDocument(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => deleteEmployeeDocument(employeeId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments', employeeId] })
      toast.success('تم حذف الوثيقة')
    },
    onError: (error) => {
      console.error('Delete document error:', error)
      toast.error('فشل حذف الوثيقة')
    }
  })
}

export function useUpdateEmployeeDocument(employeeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { documentId: string; documentData: Partial<CreateDocumentData> }) =>
      updateEmployeeDocument(employeeId, data.documentId, data.documentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeDocuments', employeeId] })
      toast.success('تم تحديث الوثيقة')
    },
    onError: (error) => {
      console.error('Update document error:', error)
      toast.error('فشل تحديث الوثيقة')
    }
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function getDaysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) return null
  const today = new Date()
  const expiry = new Date(expiryDate)
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getExpiryWarningDays(expiryDate?: string): string | null {
  const days = getDaysUntilExpiry(expiryDate)
  if (days === null) return null
  if (days < 0) return `منتهي منذ ${Math.abs(days)} يوم`
  if (days === 0) return 'ينتهي اليوم'
  if (days === 1) return 'ينتهي غداً'
  if (days <= 7) return `ينتهي خلال ${days} أيام`
  if (days <= 30) return `ينتهي خلال ${days} يوم`
  return null
}
