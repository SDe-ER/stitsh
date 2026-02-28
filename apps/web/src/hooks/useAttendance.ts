import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ============================================================================
// TYPES
// ============================================================================

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'leave'

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string // HH:mm format
  checkOut?: string // HH:mm format
  status: AttendanceStatus
  workHours: number
  notes?: string
  notesAr?: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceFilters {
  employeeId?: string
  startDate?: string
  endDate?: string
  month?: string // YYYY-MM format
  status?: AttendanceStatus
}

export interface AttendanceStats {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  halfDays: number
  leaveDays: number
  totalWorkHours: number
  attendanceRate: number
  averageHoursPerDay: number
}

// ============================================================================
// LABELS
// ============================================================================

export const attendanceStatusLabels: Record<AttendanceStatus, { label: string; labelAr: string; icon: string; color: string }> = {
  present: { label: 'Present', labelAr: 'حاضر', icon: '✅', color: 'bg-green-100 text-green-700' },
  absent: { label: 'Absent', labelAr: 'غائب', icon: '❌', color: 'bg-red-100 text-red-700' },
  late: { label: 'Late', labelAr: 'متأخر', icon: '⏰', color: 'bg-amber-100 text-amber-700' },
  'half-day': { label: 'Half Day', labelAr: 'نصف يوم', icon: '🕐', color: 'bg-blue-100 text-blue-700' },
  leave: { label: 'Leave', labelAr: 'إجازة', icon: '🏖️', color: 'bg-purple-100 text-purple-700' },
}

// ============================================================================
// LOCAL STORAGE
// ============================================================================

const ATTENDANCE_STORAGE_KEY = 'heavyops_attendance'

function getAttendanceFromStorage(): AttendanceRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : getDefaultAttendance()
  } catch {
    return getDefaultAttendance()
  }
}

function saveAttendanceToStorage(data: AttendanceRecord[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save attendance:', error)
  }
}

// ============================================================================
// DEFAULT DATA (Mock data for demo)
// ============================================================================

function getDefaultAttendance(): AttendanceRecord[] {
  const today = new Date()
  const records: AttendanceRecord[] = []

  // Generate attendance records for the current month and 2 previous months
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  // Generate for current month and 2 previous months
  for (let monthOffset = 0; monthOffset <= 2; monthOffset++) {
    const month = currentMonth - monthOffset
    const year = month < 0 ? currentYear - 1 : currentYear
    const actualMonth = month < 0 ? month + 12 : month

    // Get days in this month
    const daysInMonth = new Date(year, actualMonth + 1, 0).getDate()
    const maxDay = monthOffset === 0 ? today.getDate() : daysInMonth

    for (let day = 1; day <= maxDay; day++) {
      const date = new Date(year, actualMonth, day)
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()

      // Skip weekends (Friday = 5, Saturday = 6 in Saudi Arabia)
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        continue
      }

      // Random status for demo (weighted towards present)
      const rand = Math.random()
      let status: AttendanceStatus
      let checkIn = '07:55'
      let checkOut = '17:05'
      let workHours = 9

      if (rand < 0.85) {
        status = 'present'
      } else if (rand < 0.90) {
        status = 'late'
        checkIn = '08:15'
        workHours = 8.75
      } else if (rand < 0.94) {
        status = 'half-day'
        checkOut = '13:00'
        workHours = 5
      } else if (rand < 0.97) {
        status = 'leave'
      } else {
        status = 'absent'
      }

      records.push({
        id: `att-${dateStr}`,
        employeeId: 'emp-1',
        date: dateStr,
        checkIn: status !== 'absent' && status !== 'leave' ? checkIn : '',
        checkOut: status !== 'absent' && status !== 'leave' ? checkOut : undefined,
        status,
        workHours: status === 'absent' || status === 'leave' ? 0 : workHours,
        notes: status === 'leave' ? 'إجازة سنوية' : undefined,
        notesAr: status === 'leave' ? 'إجازة سنوية' : undefined,
        createdAt: dateStr,
        updatedAt: dateStr,
      })
    }
  }

  return records
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

async function fetchAttendance(filters?: AttendanceFilters): Promise<AttendanceRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  let records = getAttendanceFromStorage()

  if (filters?.employeeId) {
    records = records.filter((r) => r.employeeId === filters.employeeId)
  }

  if (filters?.startDate) {
    records = records.filter((r) => r.date >= filters.startDate!)
  }

  if (filters?.endDate) {
    records = records.filter((r) => r.date <= filters.endDate!)
  }

  if (filters?.month) {
    records = records.filter((r) => r.date.startsWith(filters.month!))
  }

  if (filters?.status) {
    records = records.filter((r) => r.status === filters.status)
  }

  // Sort by date descending
  return records.sort((a, b) => b.date.localeCompare(a.date))
}

async function fetchAttendanceStats(employeeId: string, month?: string): Promise<AttendanceStats> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const records = await fetchAttendance({ employeeId, month })

  const totalDays = records.length
  const presentDays = records.filter((r) => r.status === 'present').length
  const absentDays = records.filter((r) => r.status === 'absent').length
  const lateDays = records.filter((r) => r.status === 'late').length
  const halfDays = records.filter((r) => r.status === 'half-day').length
  const leaveDays = records.filter((r) => r.status === 'leave').length

  const totalWorkHours = records.reduce((sum, r) => sum + r.workHours, 0)
  const attendanceRate = totalDays > 0 ? ((presentDays + lateDays + halfDays * 0.5) / totalDays) * 100 : 0
  const averageHoursPerDay = totalDays > 0 ? totalWorkHours / totalDays : 0

  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    halfDays,
    leaveDays,
    totalWorkHours,
    attendanceRate,
    averageHoursPerDay,
  }
}

// ============================================================================
// HOOKS
// ============================================================================

export function useAttendance(filters?: AttendanceFilters) {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => fetchAttendance(filters),
    retry: false,
  })
}

export function useAttendanceStats(employeeId: string, month?: string) {
  return useQuery({
    queryKey: ['attendance-stats', employeeId, month],
    queryFn: () => fetchAttendanceStats(employeeId, month),
    retry: false,
  })
}

export function useCreateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const records = getAttendanceFromStorage()
      const newRecord: AttendanceRecord = {
        ...data,
        id: `att-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      records.push(newRecord)
      saveAttendanceToStorage(records)

      return newRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] })
    },
  })
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AttendanceRecord> }) => {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const records = getAttendanceFromStorage()
      const index = records.findIndex((r) => r.id === id)

      if (index === -1) {
        throw new Error('Attendance record not found')
      }

      records[index] = {
        ...records[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }

      saveAttendanceToStorage(records)
      return records[index]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] })
    },
  })
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const records = getAttendanceFromStorage()
      const filtered = records.filter((r) => r.id !== id)

      saveAttendanceToStorage(filtered)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['attendance-stats'] })
    },
  })
}

