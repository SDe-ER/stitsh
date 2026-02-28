import { useState } from 'react'
import { Bell, Search, Sun, Moon, ChevronDown, LogOut, Settings, Menu } from 'lucide-react'

interface HeaderProps {
  title?: string
  titleAr?: string
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export function Header({ title, titleAr, onMenuClick, showMenuButton = false }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const notifications = [
    { id: 1, title: 'فاتورة استحقت الدفع', titleAr: 'فاتورة استحقت الدفع', time: 'منذ 5 دقائق', read: false },
    { id: 2, title: 'صيانة المعدة EQ-001', titleAr: 'صيانة المعدة EQ-001', time: 'منذ ساعة', read: false },
    { id: 3, title: 'موعد تسليم المشروع', titleAr: 'موعد تسليم المشروع', time: 'منذ يوم', read: true },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Side - Menu Button + Title */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          {(title || titleAr) && (
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 font-cairo">{titleAr || title}</h1>
            </div>
          )}
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-xl mx-4 lg:mx-8">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث شامل في النظام..."
              className="w-full pr-10 pl-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:bg-white transition-all font-cairo"
            />
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-gray-600" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 left-1 w-5 h-5 bg-[#dc2626] text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 font-cairo">الإشعارات</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900 font-cairo">
                        {notification.titleAr}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-100">
                  <button className="text-sm text-[#2563eb] hover:underline font-cairo">
                    عرض جميع الإشعارات
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu)
                setShowNotifications(false)
              }}
              className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img
                src="https://ui-avatars.com/api/?name=Ahmed+Al-Rashid&background=2563eb&color=fff"
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 font-cairo">أحمد الرشيد</p>
                  <p className="text-xs text-gray-500 font-cairo">مدير مشاريع</p>
                </div>
                <div className="py-1">
                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors font-cairo">
                    <Settings className="w-4 h-4" />
                    الإعدادات
                  </button>
                  <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-cairo">
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
