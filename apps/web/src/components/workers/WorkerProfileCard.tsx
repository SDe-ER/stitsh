'use client'

import type { Employee } from '@/hooks/useEmployees'

interface WorkerProfileCardProps {
  employee: Employee
}

const DEFAULT_PHOTO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWD8DrVW2zKEEp36bqEWnStYtEopalfxD184RkIrIjt77GXO4FeXOALMMHfYgvcST99DHI-jpnyZKKDhDfyUYrLDULTpUjPtRGptJPwD1xOhg7jXzv_Mujxyq2lrkKdEdCbtrBWugo9BYuCCOX4wr9jN06qq-T7wpZpovcaeuPJIxvWEVD7u7UyVqV9485e0_9MwKxyVq-KpkxF1ILsSy6rp7a61JONmSr1uDL7x3Jc_eUSj2O0QnwiTQ2JbmL92lwSY4NVUFH4rNz'

export function WorkerProfileCard({ employee }: WorkerProfileCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#1a2b4a] to-[#2c436d] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-10 -translate-y-10 blur-2xl"></div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="font-bold text-lg">بطاقة العمل</h3>
          <p className="text-xs text-blue-200">HeavyOps Employee ID</p>
        </div>
        <span className="material-symbols-outlined text-white/30 text-4xl">badge</span>
      </div>
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <img
          className="w-16 h-16 rounded-lg border-2 border-white/20 object-cover"
          src={employee.photoUrl || DEFAULT_PHOTO_URL}
          alt=""
        />
        <div>
          <p className="font-bold text-lg">{employee.nameAr}</p>
          <p className="text-sm text-blue-200">{employee.jobTitleAr}</p>
        </div>
      </div>
      <div className="pt-4 border-t border-white/10 relative z-10">
        <div className="flex justify-between text-xs text-blue-200 mb-1">
          <span>ID No.</span>
          <span className="text-white font-mono">{employee.employeeNumber}</span>
        </div>
        <div className="flex justify-between text-xs text-blue-200">
          <span>Expiry</span>
          <span className="text-white font-mono">12/2025</span>
        </div>
      </div>
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm">
        <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">print</span>
          طباعة البطاقة
        </button>
      </div>
    </div>
  )
}
