import { InputHTMLAttributes, forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

export interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  labelAr?: string
  error?: string
  errorAr?: string
  helperText?: string
  helperTextAr?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      labelAr,
      error,
      errorAr,
      helperText,
      helperTextAr,
      leftIcon,
      rightIcon,
      className = '',
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error

    return (
      <div className="w-full" dir="rtl">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 font-cairo mb-1.5"
          >
            {labelAr || label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-cairo text-gray-900 placeholder-gray-400 ${
              leftIcon ? 'pr-10' : ''
            } ${rightIcon ? 'pl-10' : ''} ${
              hasError
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            } ${className}`}
            dir="rtl"
            {...props}
          />

          {rightIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-red-600 font-cairo flex items-center gap-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorAr || error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500 font-cairo">
            {helperTextAr || helperText}
          </p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'
