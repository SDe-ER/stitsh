'use client'

interface ComplianceDoc {
  id: string
  title: string
  expiryDate?: string
  description?: string
  icon: string
  status: 'valid' | 'expiring' | 'expired'
}

const complianceDocs: ComplianceDoc[] = [
  {
    id: '1',
    title: 'الهوية الوطنية',
    expiryDate: '12/05/2025',
    icon: 'id_card',
    status: 'valid',
  },
  {
    id: '2',
    title: 'رخصة قيادة معدات',
    expiryDate: '20/08/2024',
    icon: 'directions_car',
    status: 'expiring',
  },
  {
    id: '3',
    title: 'التأمين الطبي',
    description: 'بوبا العربية (Class B)',
    icon: 'health_and_safety',
    status: 'valid',
  },
]

export function WorkerCompliance() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#2563eb]">verified_user</span>
        الامتثال والوثائق
      </h3>
      <div className="space-y-4">
        {complianceDocs.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-sm">
                <span className="material-symbols-outlined">{doc.icon}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{doc.title}</p>
                {doc.expiryDate && (
                  <p className="text-xs text-slate-500">تنتهي في: {doc.expiryDate}</p>
                )}
                {doc.description && (
                  <p className="text-xs text-slate-500">{doc.description}</p>
                )}
              </div>
            </div>
            {doc.status === 'valid' && (
              <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">سارية</span>
            )}
            {doc.status === 'expiring' && (
              <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold">تجديد قريباً</span>
            )}
            {doc.status === 'expired' && (
              <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">منتهية</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
