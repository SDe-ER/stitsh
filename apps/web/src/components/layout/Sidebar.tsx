import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/utils/constants'

export function Sidebar() {
  return (
    <aside className="w-64 bg-secondary min-h-screen fixed right-0 top-0 shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">HeavyOps</h1>
        <p className="text-gray-400 text-sm mt-1">نظام إدارة المقاولات</p>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {/* Simple SVG icons for now */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            م
          </div>
          <div>
            <p className="text-white font-medium">مدير النظام</p>
            <p className="text-gray-400 text-sm">admin@heavyops.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
