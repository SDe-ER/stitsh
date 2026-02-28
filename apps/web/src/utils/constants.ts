export const PROJECT_STATUSES = {
  planning: { label: 'التخطيط', color: 'bg-gray-100 text-gray-800' },
  active: { label: 'نشط', color: 'bg-green-100 text-green-800' },
  'on-hold': { label: 'معلق', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'مكتمل', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800' },
} as const

export const USER_ROLES = {
  admin: { label: 'مدير النظام', color: 'bg-purple-100 text-purple-800' },
  manager: { label: 'مدير مشروع', color: 'bg-blue-100 text-blue-800' },
  employee: { label: 'موظف', color: 'bg-gray-100 text-gray-800' },
} as const

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
  { href: '/projects', label: 'المشاريع', icon: 'Building' },
  { href: '/employees', label: 'الموظفين', icon: 'Users' },
  { href: '/inventory', label: 'المخزون', icon: 'Package' },
  { href: '/equipment', label: 'المعدات', icon: 'Wrench' },
  { href: '/financial', label: 'المالية', icon: 'DollarSign' },
] as const
