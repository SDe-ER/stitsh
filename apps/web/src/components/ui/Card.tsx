import { type HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated'
}

const variants = {
  default: 'bg-white',
  bordered: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-md',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'elevated', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-lg ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
