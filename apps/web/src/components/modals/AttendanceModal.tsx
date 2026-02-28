'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Save, Trash2 } from 'lucide-react'
import { AttendanceRecord, AttendanceStatus, attendanceStatusLabels } from '@/hooks/useAttendance'

interface AttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => void
  onDelete?: (id: string) => void
  editRecord?: AttendanceRecord
  employeeId: string
  employeeNameAr: string
}

export function AttendanceModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editRecord,
  employeeId,
  employeeNameAr,
}: AttendanceModalProps) {
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [checkIn, setCheckIn] = useState('07:55')
  const [checkOut, setCheckOut] = useState('17:05')
  const [status, setStatus] = useState<AttendanceStatus>('present')
  const [notes, setNotes] = useState('')
  const [notesAr, setNotesAr] = useState('')

  useEffect(() => {
    if (editRecord) {
      setDate(editRecord.date)
      setCheckIn(editRecord.checkIn || '07:55')
      setCheckOut(editRecord.checkOut || '17:05')
      setStatus(editRecord.status)
      setNotes(editRecord.notes || '')
      setNotesAr(editRecord.notesAr || '')
    } else {
      const today = new Date()
      setDate(today.toISOString().split('T')[0])
      setCheckIn('07:55')
      setCheckOut('17:05')
      setStatus('present')
      setNotes('')
      setNotesAr('')
    }
  }, [editRecord, isOpen])

  if (!isOpen) return null

  // Calculate work hours
  const calculateWorkHours = () => {
    if (status === 'absent' || status === 'leave') return 0
    if (!checkIn || !checkOut) return 0

    const [inHour, inMin] = checkIn.split(':').map(Number)
    const [outHour, outMin] = checkOut.split(':').map(Number)

    const inMinutes = inHour * 60 + inMin
    const outMinutes = outHour * 60 + outMin

    const diffMinutes = outMinutes - inMinutes
    return Math.max(0, diffMinutes / 60)
  }

  const workHours = calculateWorkHours()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      employeeId,
      date,
      checkIn: status === 'absent' || status === 'leave' ? '' : checkIn,
      checkOut: status === 'absent' || status === 'leave' ? undefined : checkOut,
      status,
      workHours,
      notes: notes || undefined,
      notesAr: notesAr || undefined,
    }

    onSave(data)
    onClose()
  }

  const handleDelete = () => {
    if (editRecord && onDelete) {
      if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
        onDelete(editRecord.id)
        onClose()
      }
    }
  }

  const isAbsentOrLeave = status === 'absent' || status === 'leave'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-cairo">
              {editRecord ? 'تعديل سجل الحضور' : 'تسجيل حضور جديد'}
            </h2>
            <p className="text-sm text-gray-500 font-cairo mt-1">{employeeNameAr}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 font-cairo">
              <Calendar className="w-4 h-4" />
              التاريخ
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-cairo"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-cairo">الحالة</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(attendanceStatusLabels).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatus(key as AttendanceStatus)}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    status === key
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{value.icon}</span>
                  <span className="text-sm font-medium font-cairo">{value.labelAr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Check In/Out - only show if not absent/leave */}
          {!isAbsentOrLeave && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 font-cairo">
                  <Clock className="w-4 h-4" />
                  وقت الحضور
                </label>
                <input
                  type="time"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 font-cairo">
                  <Clock className="w-4 h-4" />
                  وقت الانصراف
                </label>
                <input
                  type="time"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
                />
              </div>
            </div>
          )}

          {/* Work Hours Preview */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-cairo">ساعات العمل:</span>
              <span className="text-lg font-bold text-gray-900 font-sans">
                {isAbsentOrLeave ? '0' : workHours.toFixed(2)} ساعة
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 font-cairo">ملاحظات (عربي)</label>
            <textarea
              value={notesAr}
              onChange={(e) => setNotesAr(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 font-cairo resize-none"
              placeholder="أضف ملاحظات..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {editRecord && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-cairo font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                حذف
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-cairo font-medium hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#2563eb] text-white rounded-xl font-cairo font-medium hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editRecord ? 'حفظ التعديلات' : 'تسجيل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
