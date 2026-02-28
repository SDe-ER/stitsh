import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export type DeductionType = 'ABSENCE' | 'PARTIAL_ABSENCE' | 'ADVANCE' | 'MANUAL'
export type DeductionStatus = 'PENDING' | 'APPROVED' | 'APPLIED'

export interface Deduction {
  id: string
  employeeId: string
  payrollId: string | null
  projectId: string
  type: DeductionType
  status: DeductionStatus
  amount: string
  hours: number
  minutes: number
  date: string
  month: number
  year: number
  reason: string | null
  notes: string | null
  appliedAt: string | null
  createdAt: string
  updatedAt: string
  employee: {
    id: string
    name: string
    nameAr: string
    employeeId: string
  }
  project: {
    id: string
    name: string
    nameAr: string
    code: string
  }
  payroll?: {
    id: string
    month: number
    year: number
  }
  costEntry?: {
    id: string
    amount: string
  }
}

export interface DeductionStats {
  total: number
  totalAmount: string
  byType: {
    absence: { count: number; amount: string }
    partial_absence: { count: number; amount: string }
    advance: { count: number; amount: string }
    manual: { count: number; amount: string }
  }
  byStatus: {
    pending: number
    approved: number
    applied: number
  }
}

export interface DeductionFilters {
  employeeId?: string
  projectId?: string
  type?: DeductionType
  status?: DeductionStatus
  month?: number
  year?: number
  fromDate?: string
  toDate?: string
}

// ============================================================================
// DEDUCTION TYPES LABELS
// ============================================================================

export const deductionTypeLabels: Record<DeductionType, { labelAr: string; labelEn: string; icon: string; color: string }> = {
  ABSENCE: {
    labelAr: 'غياب كامل',
    labelEn: 'Full Day Absence',
    icon: 'event_busy',
    color: 'bg-red-100 text-red-700',
  },
  PARTIAL_ABSENCE: {
    labelAr: 'غياب جزئي / تأخير',
    labelEn: 'Partial Absence / Lateness',
    icon: 'schedule',
    color: 'bg-amber-100 text-amber-700',
  },
  ADVANCE: {
    labelAr: 'سلفة',
    labelEn: 'Advance/Loan',
    icon: 'payments',
    color: 'bg-purple-100 text-purple-700',
  },
  MANUAL: {
    labelAr: 'خصم يدوي',
    labelEn: 'Manual Deduction',
    icon: 'edit_note',
    color: 'bg-gray-100 text-gray-700',
  },
}

export const deductionStatusLabels: Record<DeductionStatus, { labelAr: string; labelEn: string; color: string }> = {
  PENDING: {
    labelAr: 'قيد الانتظار',
    labelEn: 'Pending',
    color: 'bg-amber-100 text-amber-700',
  },
  APPROVED: {
    labelAr: 'موافق عليه',
    labelEn: 'Approved',
    color: 'bg-blue-100 text-blue-700',
  },
  APPLIED: {
    labelAr: 'تم التطبيق',
    labelEn: 'Applied',
    color: 'bg-green-100 text-green-700',
  },
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all deductions with optional filtering
 */
export function useDeductions(filters?: DeductionFilters) {
  const params = new URLSearchParams()
  if (filters?.employeeId) params.append('employeeId', filters.employeeId)
  if (filters?.projectId) params.append('projectId', filters.projectId)
  if (filters?.type) params.append('type', filters.type)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.month) params.append('month', filters.month.toString())
  if (filters?.year) params.append('year', filters.year.toString())
  if (filters?.fromDate) params.append('fromDate', filters.fromDate)
  if (filters?.toDate) params.append('toDate', filters.toDate)

  return useQuery<Deduction[]>({
    queryKey: ['deductions', filters],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/deductions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch deductions')
      return response.json()
    },
  })
}

/**
 * Get a single deduction by ID
 */
export function useDeduction(id: string) {
  return useQuery<Deduction>({
    queryKey: ['deduction', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/deductions/${id}`)
      if (!response.ok) throw new Error('Failed to fetch deduction')
      return response.json()
    },
    enabled: !!id,
  })
}

/**
 * Get employee deduction statistics
 */
export function useEmployeeDeductionStats(employeeId: string, month: number, year: number) {
  return useQuery<DeductionStats>({
    queryKey: ['deductionStats', employeeId, month, year],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/api/deductions/stats/employee/${employeeId}?month=${month}&year=${year}`
      )
      if (!response.ok) throw new Error('Failed to fetch deduction stats')
      return response.json()
    },
    enabled: !!employeeId && !!month && !!year,
  })
}

/**
 * Create a new deduction
 */
export function useCreateDeduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      employeeId: string
      projectId: string
      type: DeductionType
      amount?: number
      date: string
      month: number
      year: number
      hours?: number
      minutes?: number
      reason?: string
      notes?: string
    }) => {
      const response = await fetch(`${API_BASE}/api/deductions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create deduction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] })
      queryClient.invalidateQueries({ queryKey: ['deductionStats'] })
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['salary'] })
    },
  })
}

/**
 * Update a deduction
 */
export function useUpdateDeduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Deduction> }) => {
      const response = await fetch(`${API_BASE}/api/deductions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update deduction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] })
      queryClient.invalidateQueries({ queryKey: ['deductionStats'] })
    },
  })
}

/**
 * Delete a deduction
 */
export function useDeleteDeduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/api/deductions/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete deduction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] })
      queryClient.invalidateQueries({ queryKey: ['deductionStats'] })
    },
  })
}

/**
 * Apply deduction to payroll
 */
export function useApplyDeductionToPayroll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/api/deductions/${id}/apply`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to apply deduction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deductions'] })
      queryClient.invalidateQueries({ queryKey: ['deductionStats'] })
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
    },
  })
}

/**
 * Recalculate payroll
 */
export function useRecalculatePayroll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payrollId: string) => {
      const response = await fetch(`${API_BASE}/api/deductions/payroll/${payrollId}/recalculate`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to recalculate payroll')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
      queryClient.invalidateQueries({ queryKey: ['salary'] })
    },
  })
}

/**
 * Helper function to get deduction status from expiry date or similar logic
 * This can be used to auto-calculate deduction amounts
 */
export function calculateDeductionAmount(
  type: DeductionType,
  dailySalary: number,
  hours?: number,
  minutes?: number
): number {
  const HOURLY_RATE = dailySalary / 8 // 8-hour workday

  switch (type) {
    case 'ABSENCE':
      return Math.round(dailySalary * 100) / 100
    case 'PARTIAL_ABSENCE':
      if (hours) {
        return Math.round(hours * HOURLY_RATE * 100) / 100
      }
      if (minutes) {
        return Math.round((minutes / 60) * HOURLY_RATE * 100) / 100
      }
      return 0
    case 'ADVANCE':
    case 'MANUAL':
      // These require manual amount input
      return 0
    default:
      return 0
  }
}
