import { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  titleAr?: string
}

export function AppLayout({ children, title, titleAr }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]" dir="rtl">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        onClose={toggleSidebar}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:mr-[280px]' : 'mr-0'
        }`}
      >
        {/* Header */}
        <Header
          title={title}
          titleAr={titleAr}
          onMenuClick={toggleSidebar}
          showMenuButton={isMobile || !sidebarOpen}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  )
}
