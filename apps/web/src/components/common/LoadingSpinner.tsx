interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'accent'
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

const colors = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  accent: 'border-accent',
}

export function LoadingSpinner({ size = 'md', color = 'primary' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`border-4 border-gray-200 border-t-current rounded-full animate-spin ${sizes[size]} ${colors[color]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">جاري التحميل...</span>
      </div>
    </div>
  )
}
