import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

interface SidebarProps {
  isOpen?: boolean
  isMobile?: boolean
  onClose?: () => void
}

interface MenuItem {
  id: string
  label: string
  labelAr: string
  icon: string
  path: string
  badge?: number
  alert?: boolean
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'لوحة القيادة', labelAr: 'لوحة القيادة', icon: '📊', path: '/dashboard' },
  { id: 'projects', label: 'المشاريع', labelAr: 'المشاريع', icon: '🏗️', path: '/projects' },
  { id: 'equipment', label: 'الأسطول والمعدات', labelAr: 'الأسطول', icon: '🚛', path: '/equipment', alert: true },
  { id: 'equipment-ops', label: 'تشغيل المعدات', labelAr: 'تشغيل المعدات', icon: '⚙️', path: '/equipment/operations' },
  { id: 'hr', label: 'الموارد البشرية', labelAr: 'الموظفين', icon: '👷', path: '/hr', badge: 3 },
  { id: 'finance', label: 'المالية', labelAr: 'المالية', icon: '💰', path: '/finance' },
  { id: 'suppliers', label: 'الموردون والعملاء', labelAr: 'الموردون', icon: '🤝', path: '/suppliers' },
  { id: 'analytics', label: 'التحليلات المتقدمة', labelAr: 'التحليلات', icon: '🤖', path: '/analytics' },
  { id: 'settings', label: 'الإعدادات', labelAr: 'الإعدادات', icon: '⚙️', path: '/settings' },
]

export function Sidebar({ isOpen = true, isMobile = false, onClose }: SidebarProps) {
  const location = useLocation()
  const [user] = useState({
    name: 'أحمد الرشيد',
    nameEn: 'Ahmed Al-Rashid',
    role: 'مدير مشاريع',
    roleEn: 'Project Manager',
    avatar: 'https://ui-avatars.com/api/?name=Ahmed+Al-Rashid&background=2563eb&color=fff',
  })

  const activeItem = menuItems.find((item) => {
    // Exact match for most paths
    if (location.pathname === item.path) return true
    // Special case for equipment-ops - should not match when on main equipment page
    if (item.id === 'equipment-ops' && location.pathname === '/equipment/operations') return true
    // Equipment path should not match equipment operations
    if (item.id === 'equipment' && location.pathname.startsWith('/equipment') && !location.pathname.startsWith('/equipment/operations')) return true
    // HR routes
    if (item.id === 'hr' && location.pathname.startsWith('/hr')) return true
    // Default startsWith behavior for others
    if (item.id !== 'equipment' && item.id !== 'equipment-ops' && item.id !== 'hr' && location.pathname.startsWith(item.path)) return true
    return false
  })

  return (
    <aside
      className={`fixed top-0 right-0 h-full w-[280px] bg-[#1a2b4a] text-white z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${isMobile ? 'translate-x-0' : ''}`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 bg-[#2563eb] rounded-lg flex items-center justify-center text-xl">
            🏗️
          </div>
          <div>
            <h1 className="text-xl font-bold">HeavyOps</h1>
            <p className="text-xs text-gray-400">نظام إدارة المشاريع</p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full border-2 border-[#2563eb]"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-sm text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = activeItem?.id === item.id
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (isMobile && onClose) onClose()
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#2563eb] text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <span className="flex-1 font-medium">{item.label}</span>

                    {/* Badge for alerts/notifications */}
                    {item.alert && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="min-w-[20px] h-5 bg-[#dc2626] text-white text-xs font-medium rounded-full flex items-center justify-center px-2">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-gray-400 text-center">
            <p>الإصدار 1.0.0</p>
            <p className="mt-1">© 2024 HeavyOps ERP</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
