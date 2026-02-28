'use client'

import { Employee } from '@/hooks/useEmployees'

interface WorkerProfileHeaderProps {
  employee: Employee
}

const SAUDI_FLAG_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOWNjEsEHHqrAuv7cd4prZ-GDk8PWz4-st4vsPi6AygKiMPhuExDgy7TWjMKdP4F3rRWYZ3brKIM0HZGyRdO7GD9jkqV7jJ97Bw_GF3HyTjft_NFKGAFCxPGk6r1nL4a_trzxGVfgVQq4dPx3TYYikjPx4bytg5Z0Q6Dy-orCMyujoMo-lc4dCGcsMGuVV9a2lQoEDXnKB8GtPAUWeLNDygSaIbu0b500gMjDQ9REFAgR7dI5DXd-dTjvUxqjhjVlgAewvZtoJA988'
const DEFAULT_PHOTO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWD8DrVW2zKEEp36bqEWnStYtEopalfxD184RkIrIjt77GXO4FeXOALMMHfYgvcST99DHI-jpnyZKKDhDfyUYrLDULTpUjPtRGptJPwD1xOhg7jXzv_Mujxyq2lrkKdEdCbtrBWugo9BYuCCOX4wr9jN06qq-T7wpZpovcaeuPJIxvWEVD7u7UyVqV9485e0_9MwKxyVq-KpkxF1ILsSy6rp7a61JONmSr1uDL7x3Jc_eUSj2O0QnwiTQ2JbmL92lwSY4NVUFH4rNz'

export function WorkerProfileHeader({ employee }: WorkerProfileHeaderProps) {
  // Calculate age from birth year (from reference: 1988)
  const birthYear = 1988
  const currentYear = new Date().getFullYear()
  const age = currentYear - birthYear

  // Format date in Arabic
  const formatDateAr = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-start gap-6">
      <div className="relative">
        <img
          alt="Employee Profile"
          className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-md"
          src={employee.photoUrl || DEFAULT_PHOTO_URL}
        />
        <span className="absolute -bottom-3 -right-3 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[16px]">check</span>
        </span>
      </div>
      <div className="flex-1 pt-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">{employee.nameAr}</h1>
            <div className="flex items-center gap-3 text-slate-500 text-sm mb-4">
              <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-slate-600">
                <span className="material-symbols-outlined text-[16px]">engineering</span>
                {employee.departmentAr}
              </span>
              <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-[#2563eb]">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {employee.projectNameAr || 'المقر الرئيسي'}
              </span>
            </div>
          </div>
          <div className="text-left">
            <p className="text-xs text-slate-400 mb-1">تاريخ الانضمام</p>
            <p className="font-bold text-slate-700">{formatDateAr(employee.joiningDate)}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 mt-2">
          <div>
            <p className="text-xs text-slate-400 mb-1">رقم الهوية / الإقامة</p>
            <p className="font-bold text-slate-800">{employee.residencyNumber || employee.employeeNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">الجنسية</p>
            <p className="font-bold text-slate-800 flex items-center gap-2">
              <img alt="Saudi Arabia" className="w-5 rounded-sm shadow-sm" src={SAUDI_FLAG_URL} />
              {employee.nationality}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">تاريخ الميلاد</p>
            <p className="font-bold text-slate-800">12/05/{birthYear} ({age} سنة)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
