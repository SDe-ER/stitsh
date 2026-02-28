'use client'

import { AttendanceStats } from '@/hooks/useAttendance'

interface WorkerAttendanceProps {
  attendanceStats?: AttendanceStats
}

export function WorkerAttendance({ attendanceStats }: WorkerAttendanceProps) {
  const workHours = attendanceStats?.totalWorkHours || 182
  const overtimeHours = attendanceStats?.lateDays || 12
  const attendanceRate = attendanceStats?.attendanceRate || 98

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#2563eb]">schedule</span>
        الحضور والانصراف
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <p className="text-2xl font-bold text-[#2563eb]">{workHours}</p>
          <p className="text-xs text-slate-500">ساعات العمل</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <p className="text-2xl font-bold text-green-600">+{overtimeHours}</p>
          <p className="text-xs text-slate-500">ساعات إضافية</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">نسبة الحضور</span>
          <span className="font-bold text-slate-800">{attendanceRate.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-left">
          آخر غياب: {attendanceStats?.absentDays === 0 ? 'لا يوجد في آخر 3 أشهر' : `${attendanceStats.absentDays} أيام`}
        </p>
      </div>
    </div>
  )
}
