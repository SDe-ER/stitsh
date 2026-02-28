'use client'

interface WorkHistoryItem {
  id: string
  projectName: string
  description: string
  startDate?: string
  supervisor?: string
  period?: string
  isCurrent?: boolean
}

const mockWorkHistory: WorkHistoryItem[] = [
  {
    id: '1',
    projectName: 'مشروع نيوم - ذا لاين (Site B)',
    description: 'تشغيل بلدوزر D9T لأعمال التسوية والحفر في القطاع الشمالي.',
    startDate: '10 فبراير 2023',
    supervisor: 'م. خالد السالم',
    isCurrent: true,
  },
  {
    id: '2',
    projectName: 'مترو الرياض - الخط الأزرق',
    description: 'مشغل معدات ثقيلة (حفار وبلدوزر) في محطة العليا.',
    period: '2020 - 2023',
  },
  {
    id: '3',
    projectName: 'مشروع القدية الترفيهي',
    description: 'أعمال تمهيد الطرق الرئيسية.',
    period: '2019 - 2020',
  },
]

export function WorkerTimeline() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#2563eb]">work_history</span>
        سجل العمل والمشاريع
      </h3>
      <div className="relative pl-4 border-r border-slate-200 mr-2 space-y-8">
        {mockWorkHistory.map((item, index) => (
          <div key={item.id} className={`relative pr-6 ${item.isCurrent ? 'group' : 'opacity-75 hover:opacity-100 transition-opacity'}`}>
            <span className={`absolute -right-[29px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${item.isCurrent ? 'bg-[#2563eb] shadow-sm ring-2 ring-blue-100' : 'bg-slate-300'}`}></span>
            {item.isCurrent ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800">{item.projectName}</h4>
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">مشروع حالي</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                    منذ: {item.startDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    المشرف: {item.supervisor}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-slate-700">{item.projectName}</h4>
                  <span className="text-xs text-slate-400">{item.period}</span>
                </div>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
