import { SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
  labelAr?: string
  disabled?: boolean
}

export interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  labelAr?: string
  error?: string
  errorAr?: string
  helperText?: string
  helperTextAr?: string
  options: SelectOption[]
  placeholder?: string
  placeholderAr?: string
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      labelAr,
      error,
      errorAr,
      helperText,
      helperTextAr,
      options,
      placeholder = 'Select...',
      placeholderAr = 'اختر...',
      className = '',
      id,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error

    return (
      <div className="w-full" dir="rtl">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 font-cairo mb-1.5"
          >
            {labelAr || label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-cairo text-gray-900 appearance-none cursor-pointer ${
              hasError
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
            } ${className}`}
            dir="rtl"
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholderAr}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.labelAr || option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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

FormSelect.displayName = 'FormSelect'
