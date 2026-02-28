'use client'

import type { Employee } from '@/hooks/useEmployees'

interface WorkerFinancialProps {
  employee: Employee
}

const mockSalaryRecords = [
  { id: '1', month: 'أكتوبر 2023', paymentDate: '27/10/2023', amount: '11,000 ر.س', status: 'paid' },
  { id: '2', month: 'سبتمبر 2023', paymentDate: '26/09/2023', amount: '11,000 ر.س', status: 'paid' },
  { id: '3', month: 'أغسطس 2023', paymentDate: '28/08/2023', amount: '10,850 ر.س', status: 'paid' },
]

export function WorkerFinancial({ employee }: WorkerFinancialProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2563eb]">payments</span>
          البيانات المالية
        </h3>
        <button className="text-sm text-[#2563eb] hover:underline">عرض قسيمة الراتب</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">الراتب الأساسي</p>
          <p className="text-2xl font-bold text-slate-800">{employee.salary.toLocaleString('ar-SA')} <span className="text-sm font-normal text-slate-500">ريال</span></p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">بدل سكن ونقل</p>
          <p className="text-2xl font-bold text-slate-800">{(employee.salary * 0.3).toLocaleString('ar-SA')} <span className="text-sm font-normal text-slate-500">ريال</span></p>
        </div>
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-bold text-slate-700 mb-3">سجل الرواتب (آخر 3 أشهر)</h4>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">الشهر</th>
                <th className="px-4 py-3 font-medium">تاريخ التحويل</th>
                <th className="px-4 py-3 font-medium">المبلغ الإجمالي</th>
                <th className="px-4 py-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockSalaryRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{record.month}</td>
                  <td className="px-4 py-3 text-slate-500">{record.paymentDate}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{record.amount}</td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">تم التحويل</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
