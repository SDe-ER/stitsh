import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

export type KpiColor = 'blue' | 'green' | 'amber' | 'red'
export type ChangeType = 'up' | 'down' | 'neutral'

interface KpiCardProps {
  title: string
  titleAr: string
  value: string | number
  unit?: string
  change?: number
  changeType?: ChangeType
  icon: string
  color?: KpiColor
  loading?: boolean
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-r-blue-500',
    icon: 'bg-blue-500',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-r-green-500',
    icon: 'bg-green-500',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-r-amber-500',
    icon: 'bg-amber-500',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-r-red-500',
    icon: 'bg-red-500',
  },
}

export function KpiCard({
  title,
  titleAr,
  value,
  unit = '',
  change = 0,
  changeType = 'neutral',
  icon,
  color = 'blue',
  loading = false,
}: KpiCardProps) {
  const colors = colorClasses[color]

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    )
  }

  const getChangeIcon = () => {
    if (changeType === 'up') return <ArrowUp className="w-4 h-4" />
    if (changeType === 'down') return <ArrowDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getChangeColor = () => {
    if (changeType === 'up') return 'text-green-600 bg-green-50'
    if (changeType === 'down') return 'text-red-600 bg-red-50'
    return 'text-gray-600 bg-gray-100'
  }

  const displayValue = typeof value === 'number' ? value.toLocaleString('ar-SA') : value

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 border-r-4 ${colors.border} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1 font-cairo">{titleAr}</p>
          <p className="text-sm text-gray-400 mb-3 font-cairo">{title}</p>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 font-sans">
              {displayValue}
            </span>
            {unit && (
              <span className="text-sm text-gray-500 font-cairo">{unit}</span>
            )}
          </div>

          {change !== 0 && (
            <div className={`flex items-center gap-1 mt-3 px-2 py-1 rounded-md w-fit ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="text-sm font-medium font-sans">
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>

        <div className={`${colors.icon} w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
