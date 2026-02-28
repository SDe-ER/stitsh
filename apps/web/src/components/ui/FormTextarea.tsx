import { TextareaHTMLAttributes, forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  labelAr?: string
  error?: string
  errorAr?: string
  helperText?: string
  helperTextAr?: string
  showCharCount?: boolean
  maxLength?: number
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      labelAr,
      error,
      errorAr,
      helperText,
      helperTextAr,
      showCharCount = false,
      maxLength,
      className = '',
      id,
      required,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error
    const currentLength = String(value || '').length

    return (
      <div className="w-full" dir="rtl">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 font-cairo mb-1.5"
          >
            {labelAr || label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            maxLength={maxLength}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-cairo text-gray-900 placeholder-gray-400 resize-y ${
              hasError
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            } ${className}`}
            dir="rtl"
            value={value}
            {...props}
          />

          {showCharCount && maxLength && (
            <div className="absolute left-3 bottom-3 text-xs text-gray-400 font-cairo bg-white/80 px-1">
              {currentLength} / {maxLength}
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

FormTextarea.displayName = 'FormTextarea'
