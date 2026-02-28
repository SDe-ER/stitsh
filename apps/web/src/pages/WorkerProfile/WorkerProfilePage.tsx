'use client'

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEmployeeById } from '@/hooks/useEmployees'
import { useAttendanceStats } from '@/hooks/useAttendance'
import {
  WorkerProfileShell,
  WorkerProfileHeader,
  WorkerProfileCard,
  WorkerTimeline,
  WorkerCompliance,
  WorkerAttendance,
  WorkerFinancial,
} from '@/components/workers'

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Get current month for attendance stats
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })

  const { data: employee, isLoading } = useEmployeeById(id || '')
  const { data: attendanceStats } = useAttendanceStats(id || '', selectedMonth)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-cairo">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-700 font-cairo mb-4">فشل تحميل بيانات الموظف</p>
          <button
            onClick={() => navigate('/hr/employees')}
            className="px-6 py-3 bg-[#2563eb] text-white rounded-xl font-cairo hover:bg-[#1d4ed8] transition-colors"
          >
            العودة للموظفين
          </button>
        </div>
      </div>
    )
  }

  return (
    <WorkerProfileShell
      employeeNameAr={employee.nameAr}
      employeeId={employee.employeeNumber}
      jobTitleAr={employee.jobTitleAr}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Summary Card */}
          <WorkerProfileHeader employee={employee} />

          {/* Work History Section */}
          <WorkerTimeline />

          {/* Financial Section */}
          <WorkerFinancial employee={employee} />
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Employee ID Card Widget */}
          <WorkerProfileCard employee={employee} />

          {/* Compliance Documents Section */}
          <WorkerCompliance />

          {/* Attendance Summary Section */}
          <WorkerAttendance attendanceStats={attendanceStats} />
        </div>
      </div>
    </WorkerProfileShell>
  )
}
