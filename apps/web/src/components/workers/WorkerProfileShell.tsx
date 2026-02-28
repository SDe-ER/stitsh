'use client'

import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface WorkerProfileShellProps {
  children: ReactNode
  employeeNameAr: string
  employeeId: string
  jobTitleAr: string
}

export function WorkerProfileShell({ children, employeeNameAr, employeeId, jobTitleAr }: WorkerProfileShellProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a2b4a] text-white flex flex-col flex-shrink-0 h-screen transition-all duration-300 relative z-20">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2563eb] flex items-center justify-center shadow-lg shadow-blue-900/50">
              <span className="material-symbols-outlined text-white text-2xl">construction</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-wide">HeavyOps</h1>
              <span className="text-xs text-slate-400 font-light">نظام إدارة الإنشاءات</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <a className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors group" href="/dashboard">
            <span className="material-symbols-outlined group-hover:text-[#2563eb] transition-colors">dashboard</span>
            <span className="text-sm font-medium">لوحة التحكم</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors group" href="/projects">
            <span className="material-symbols-outlined group-hover:text-[#2563eb] transition-colors">domain</span>
            <span className="text-sm font-medium">المشاريع</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors group" href="/equipment">
            <span className="material-symbols-outlined group-hover:text-[#2563eb] transition-colors">engineering</span>
            <span className="text-sm font-medium">المعدات</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-[#2563eb] text-white rounded-xl shadow-lg shadow-blue-900/20 transition-colors" href="/hr/employees">
            <span className="material-symbols-outlined fill-1">groups</span>
            <span className="text-sm font-bold">الموظفين</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors group" href="/finance">
            <span className="material-symbols-outlined group-hover:text-[#2563eb] transition-colors">account_balance_wallet</span>
            <span className="text-sm font-medium">المالية</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors group" href="/analytics">
            <span className="material-symbols-outlined group-hover:text-[#2563eb] transition-colors">description</span>
            <span className="text-sm font-medium">التقارير</span>
          </a>
        </nav>

        {/* User Profile at bottom */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <img
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-white/10"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI2ZFsKLzIrKe31KwivQuXkE_PgTOy__2_0zemEa3tWYItRxr05XwPQhITVNmPMqk0ql1PJYig3mWRtbIVHVdSDUklFA2KH8eTwvbCkhU482RymNztDYYEBNY-cs3bhaLCFpkFre8gqPxrwciHpYs3pWrekKKroRwr0VoXwmOEzpmFAVl3bXY-dR2jLWQm0Bx3G2Rk0FxqExql3HnmEH-p4z37QIOSZ34VgZjTe_xM3xwuJPMp-Y-JnUXFQAtImljyNOk5qzEyONZW"
            />
            <div className="flex flex-col">
              <p className="text-sm font-medium text-white">عبدالله العتيبي</p>
              <p className="text-xs text-slate-400">مدير الأسطول</p>
            </div>
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-xs font-medium py-2 rounded-lg hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8fafc]">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-8 shadow-sm flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/hr/employees')}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-800">{employeeNameAr}</h2>
              <span className="text-xs text-slate-500">ID: {employeeId} • {jobTitleAr}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white border-2 border-[#1a2b4a] text-[#1a2b4a] hover:bg-slate-50 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95">
              <span className="material-symbols-outlined text-[20px]">print</span>
              طباعة بطاقة الموظف
            </button>
            <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              تحديث الوثائق
            </button>
            <button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
              <span className="material-symbols-outlined text-[20px]">edit</span>
              تعديل الملف
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
