import { ReactNode, useEffect } from 'react'
import { X, Info, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react'

export type AlertType = 'info' | 'success' | 'warning' | 'error'

interface AlertBannerProps {
  type: AlertType
  message: string
  messageAr?: string
  onClose?: () => void
  showCloseButton?: boolean
  icon?: ReactNode
  autoClose?: boolean
  autoCloseDelay?: number
  className?: string
}

const alertConfig = {
  info: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-500',
  },
  success: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  warning: {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
  },
  error: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    icon: AlertOctagon,
    iconColor: 'text-red-500',
  },
}

export function AlertBanner({
  type,
  message,
  messageAr,
  onClose,
  showCloseButton = true,
  icon: customIcon,
  autoClose = false,
  autoCloseDelay = 5000,
  className = '',
}: AlertBannerProps) {
  const config = alertConfig[type]
  const Icon = customIcon ? null : config.icon

  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseDelay, onClose])

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
      dir="rtl"
      role="alert"
    >
      {customIcon ? (
        <span className={`flex-shrink-0 ${config.iconColor}`}>
          {customIcon}
        </span>
      ) : Icon ? (
        <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
      ) : null}

      <div className="flex-1">
        <p className={`text-sm font-medium font-cairo ${config.textColor}`}>
          {messageAr || message}
        </p>
      </div>

      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors ${config.textColor}`}
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
