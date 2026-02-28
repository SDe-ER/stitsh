import { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-sm hover:shadow',
  secondary: 'bg-[#1a2b4a] text-white hover:bg-[#2a3b5a] shadow-sm hover:shadow',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-300',
  outline: 'bg-transparent text-[#2563eb] border border-[#2563eb] hover:bg-[#2563eb] hover:text-white',
  danger: 'bg-[#dc2626] text-white hover:bg-[#b91c1c] shadow-sm hover:shadow',
  success: 'bg-[#16a34a] text-white hover:bg-[#15803d] shadow-sm hover:shadow',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
}

const loadingSpinner = (size: ButtonSize) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <svg
      className={`animate-spin ${sizeClass}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium font-cairo transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`

  const isDisabled = disabled || loading

  return (
    <button
      className={classes}
      disabled={isDisabled}
      dir="rtl"
      {...props}
    >
      {loading && loadingSpinner(size)}
      {!loading && icon && iconPosition === 'right' && (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'left' && (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
    </button>
  )
}
