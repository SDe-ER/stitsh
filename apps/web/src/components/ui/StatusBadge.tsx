import { ReactNode } from 'react'

export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'on-hold'
  | 'delayed'
  | 'maintenance'
  | 'idle'
  | 'running'
  | 'stopped'
  | 'error'
  | 'warning'
  | 'success'
  | 'info'

interface StatusBadgeProps {
  status: StatusType | string
  customLabel?: string
  customLabelAr?: string
  icon?: ReactNode
  size?: 'sm' | 'md'
  className?: string
}

// Predefined status configurations
const statusConfig: Record<
  StatusType,
  { label: string; labelAr: string; color: string; bgColor: string; borderColor: string }
> = {
  active: { label: 'Active', labelAr: 'نشط', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-200' },
  inactive: { label: 'Inactive', labelAr: 'غير نشط', color: 'text-gray-700', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
  pending: { label: 'Pending', labelAr: 'معلق', color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
  completed: { label: 'Completed', labelAr: 'مكتمل', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
  cancelled: { label: 'Cancelled', labelAr: 'ملغي', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
  'on-hold': { label: 'On Hold', labelAr: 'مؤجل', color: 'text-purple-700', bgColor: 'bg-purple-100', borderColor: 'border-purple-200' },
  delayed: { label: 'Delayed', labelAr: 'متأخر', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
  maintenance: { label: 'Maintenance', labelAr: 'صيانة', color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
  idle: { label: 'Idle', labelAr: 'خامل', color: 'text-gray-700', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
  running: { label: 'Running', labelAr: 'يعمل', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-200' },
  stopped: { label: 'Stopped', labelAr: 'متوقف', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
  error: { label: 'Error', labelAr: 'خطأ', color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
  warning: { label: 'Warning', labelAr: 'تحذير', color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
  success: { label: 'Success', labelAr: 'نجح', color: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-200' },
  info: { label: 'Info', labelAr: 'معلومات', color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
}

// Default styling for unknown statuses
const defaultConfig = {
  label: 'Unknown',
  labelAr: 'غير معروف',
  color: 'text-gray-700',
  bgColor: 'bg-gray-100',
  borderColor: 'border-gray-200',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export function StatusBadge({
  status,
  customLabel,
  customLabelAr,
  icon,
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] || defaultConfig
  const displayLabel = customLabelAr || customLabel || config.labelAr

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium font-cairo ${config.color} ${config.bgColor} ${config.borderColor} ${sizeClasses[size]} ${className}`}
      dir="rtl"
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {displayLabel}
    </span>
  )
}
