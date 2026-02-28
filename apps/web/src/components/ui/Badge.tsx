import { ReactNode } from 'react'

export type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'slate'
export type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: ReactNode
  dot?: boolean
  icon?: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

const dotSizeClasses: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
}

export function Badge({
  variant = 'blue',
  size = 'sm',
  children,
  dot = false,
  icon,
  className = '',
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full border font-medium font-cairo'
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`

  return (
    <span className={classes} dir="rtl">
      {dot && <span className={`rounded-full bg-current ${dotSizeClasses[size]}`} />}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
}
