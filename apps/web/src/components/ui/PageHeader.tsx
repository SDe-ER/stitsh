import { Plus, Filter, Download, RefreshCw, MoreVertical } from 'lucide-react'

interface ActionButton {
  label: string
  labelAr: string
  icon?: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  disabled?: boolean
}

interface PageHeaderProps {
  title: string
  titleAr: string
  subtitle?: string
  subtitleAr?: string
  actions?: ActionButton[]
  breadcrumbs?: Array<{ label: string; labelAr?: string; path?: string }>
}

export function PageHeader({
  title,
  titleAr,
  subtitle,
  subtitleAr,
  actions = [],
  breadcrumbs = [],
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-gray-400">/</span>
                )}
                {crumb.path ? (
                  <a
                    href={crumb.path}
                    className="text-gray-500 hover:text-[#2563eb] transition-colors font-cairo"
                  >
                    {crumb.labelAr || crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-900 font-medium font-cairo">
                    {crumb.labelAr || crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-cairo">
            {titleAr}
          </h1>
          {title && (
            <h2 className="text-lg text-gray-500 font-cairo mt-1">{title}</h2>
          )}
          {(subtitle || subtitleAr) && (
            <p className="text-gray-600 mt-2 font-cairo">{subtitleAr || subtitle}</p>
          )}
        </div>

        {/* Action Buttons */}
        {actions.length > 0 && (
          <div className="flex items-center gap-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                  font-cairo text-sm whitespace-nowrap
                  ${action.disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : action.variant === 'primary'
                      ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-sm hover:shadow'
                      : action.variant === 'outline'
                      ? 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      : action.variant === 'ghost'
                      ? 'hover:bg-gray-100 text-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {action.icon}
                <span>{action.labelAr}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
