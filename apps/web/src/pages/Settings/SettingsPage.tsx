import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { useSettings, useUpdateSettings, useResetSettings } from '@/hooks/useSettings'
import {
  Settings as SettingsIcon,
  Building2,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Clock,
  DollarSign,
  Calendar,
  Save,
  RotateCcw,
  Check,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

type SettingsTab = 'general' | 'preferences' | 'notifications' | 'security' | 'system'

interface TabConfig {
  id: SettingsTab
  label: string
  labelAr: string
  icon: React.ReactNode
}

// ============================================================================
// TABS CONFIGURATION
// ============================================================================

const tabs: TabConfig[] = [
  { id: 'general', label: 'General', labelAr: 'عام', icon: <Building2 className="w-5 h-5" /> },
  { id: 'preferences', label: 'Preferences', labelAr: 'التفضيلات', icon: <User className="w-5 h-5" /> },
  { id: 'notifications', label: 'Notifications', labelAr: 'الإشعارات', icon: <Bell className="w-5 h-5" /> },
  { id: 'security', label: 'Security', labelAr: 'الأمان', icon: <Shield className="w-5 h-5" /> },
  { id: 'system', label: 'System', labelAr: 'النظام', icon: <Database className="w-5 h-5" /> },
]

// ============================================================================
// SECTION COMPONENT
// ============================================================================

function SettingsSection({
  title,
  titleAr,
  icon,
  children,
}: {
  title: string
  titleAr: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#2563eb]/10 rounded-lg text-[#2563eb]">{icon}</div>
        <h3 className="text-lg font-bold text-gray-900 font-cairo">{titleAr}</h3>
      </div>
      {children}
    </div>
  )
}

// ============================================================================
// FORM INPUT COMPONENT
// ============================================================================

function FormField({
  label,
  labelAr,
  required = false,
  error,
  children,
}: {
  label: string
  labelAr: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 font-cairo">
        {labelAr}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600 font-cairo">{error}</p>}
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const { data: settings } = useSettings()
  const updateMutation = useUpdateSettings()
  const resetMutation = useResetSettings()

  const [formData, setFormData] = useState({
    company: {} as any,
    preferences: {} as any,
    notifications: {} as any,
    security: {} as any,
    system: {} as any,
  })

  // Initialize form data when settings load
  useEffect(() => {
    if (settings && !initialized) {
      setFormData({
        company: { ...settings.company },
        preferences: { ...settings.preferences },
        notifications: { ...settings.notifications },
        security: { ...settings.security },
        system: { ...settings.system },
      })
      setInitialized(true)
    }
  }, [settings, initialized])

  // Update form data after successful save
  useEffect(() => {
    if (updateMutation.isSuccess && settings) {
      setFormData({
        company: { ...settings.company },
        preferences: { ...settings.preferences },
        notifications: { ...settings.notifications },
        security: { ...settings.security },
        system: { ...settings.system },
      })
    }
  }, [updateMutation.isSuccess, settings])

  const handleChange = (section: keyof typeof formData, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    updateMutation.mutate(formData)
    setHasChanges(false)
  }

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟')) {
      resetMutation.mutate()
      setHasChanges(false)
    }
  }

  // Show loading state if settings not loaded yet
  if (!settings || !initialized) {
    return (
      <AppLayout titleAr="الإعدادات">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#2563eb] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2 font-cairo">جاري التحميل...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const updateCompanyField = (field: keyof typeof formData.company, value: string) =>
    handleChange('company', field, value)

  const updatePreferencesField = (field: keyof typeof formData.preferences, value: any) =>
    handleChange('preferences', field, value)

  const updateNotificationsField = (field: keyof typeof formData.notifications, value: boolean) =>
    handleChange('notifications', field, value)

  const updateSecurityField = (field: keyof typeof formData.security, value: any) =>
    handleChange('security', field, value)

  const updateSystemField = (field: keyof typeof formData.system, value: any) =>
    handleChange('system', field, value)

  // ============================================================================
  // RENDER CONTENT BASED ON ACTIVE TAB
  // ============================================================================

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <>
            <SettingsSection title="Company Information" titleAr="معلومات الشركة" icon={<Building2 className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Company Name" labelAr="اسم الشركة">
                  <input
                    type="text"
                    value={formData.company.name}
                    onChange={(e) => updateCompanyField('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                </FormField>

                <FormField label="الاسم بالعربي" labelAr="الاسم بالعربي">
                  <input
                    type="text"
                    value={formData.company.nameAr}
                    onChange={(e) => updateCompanyField('nameAr', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                  />
                </FormField>

                <FormField label="Commercial Registration" labelAr="رقم السجل التجاري">
                  <input
                    type="text"
                    value={formData.company.commercialRegistration}
                    onChange={(e) => updateCompanyField('commercialRegistration', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                </FormField>

                <FormField label="VAT Number" labelAr="رقم الضريبة">
                  <input
                    type="text"
                    value={formData.company.vatNumber}
                    onChange={(e) => updateCompanyField('vatNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                </FormField>

                <FormField label="Phone" labelAr="الهاتف">
                  <input
                    type="tel"
                    value={formData.company.phone}
                    onChange={(e) => updateCompanyField('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                </FormField>

                <FormField label="Email" labelAr="البريد الإلكتروني">
                  <input
                    type="email"
                    value={formData.company.email}
                    onChange={(e) => updateCompanyField('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                </FormField>

                <FormField label="Website" labelAr="الموقع الإلكتروني">
                  <input
                    type="url"
                    value={formData.company.website || ''}
                    onChange={(e) => updateCompanyField('website', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                </FormField>

                <FormField label="Address" labelAr="العنوان">
                  <input
                    type="text"
                    value={formData.company.address}
                    onChange={(e) => updateCompanyField('address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="العنوان بالعربي" labelAr="العنوان بالعربي">
                    <input
                      type="text"
                      value={formData.company.addressAr}
                      onChange={(e) => updateCompanyField('addressAr', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                    />
                  </FormField>
                </div>
              </div>
            </SettingsSection>
          </>
        )

      case 'preferences':
        return (
          <>
            <SettingsSection title="Appearance" titleAr="المظهر" icon={<Palette className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Theme" labelAr="السمة">
                  <select
                    value={formData.preferences.theme}
                    onChange={(e) => updatePreferencesField('theme', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                  >
                    <option value="light">فاتح</option>
                    <option value="dark">داكن</option>
                    <option value="auto">تلقائي</option>
                  </select>
                </FormField>

                <FormField label="Language" labelAr="اللغة">
                  <select
                    value={formData.preferences.language}
                    onChange={(e) => updatePreferencesField('language', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </FormField>
              </div>
            </SettingsSection>

            <SettingsSection title="Regional Settings" titleAr="الإعدادات الإقليمية" icon={<Globe className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Timezone" labelAr="المنطقة الزمنية">
                  <select
                    value={formData.preferences.timezone}
                    onChange={(e) => updatePreferencesField('timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                  >
                    <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                    <option value="Asia/Dubai">دبي (GMT+4)</option>
                    <option value="Asia/Qatar">قطر (GMT+3)</option>
                    <option value="Asia/Kuwait">الكويت (GMT+3)</option>
                    <option value="Asia/Bahrain">البحرين (GMT+3)</option>
                    <option value="Asia/Muscat">مسقط (GMT+4)</option>
                  </select>
                </FormField>

                <FormField label="Currency" labelAr="العملة">
                  <select
                    value={formData.preferences.currency}
                    onChange={(e) => updatePreferencesField('currency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                  >
                    <option value="SAR">ريال سعودي (ر.س)</option>
                    <option value="AED">درهم إماراتي (د.إ)</option>
                    <option value="QAR">ريال قطري (ر.ق)</option>
                    <option value="KWD">دينار كويتي (د.ك)</option>
                    <option value="BHD">دينار بحريني (د.ب)</option>
                    <option value="OMR">ريال عماني (ر.ع)</option>
                  </select>
                </FormField>

                <FormField label="Date Format" labelAr="تنسيق التاريخ">
                  <select
                    value={formData.preferences.dateFormat}
                    onChange={(e) => updatePreferencesField('dateFormat', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                  >
                    <option value="DD/MM/YYYY">31/12/2024</option>
                    <option value="MM/DD/YYYY">12/31/2024</option>
                    <option value="YYYY-MM-DD">2024-12-31</option>
                  </select>
                </FormField>
              </div>
            </SettingsSection>

            <SettingsSection title="Auto Save" titleAr="الحفظ التلقائي" icon={<Save className="w-5 h-5" />}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 font-cairo">الحفظ التلقائي</p>
                  <p className="text-sm text-gray-500 font-cairo">حفظ البيانات تلقائياً أثناء العمل</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preferences.autoSave}
                    onChange={(e) => updatePreferencesField('autoSave', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                </label>
              </div>

              {formData.preferences.autoSave && (
                <div className="mt-4">
                  <FormField label="Save Interval (seconds)" labelAr="فترة الحفظ (ثواني)">
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={formData.preferences.autoSaveInterval}
                      onChange={(e) => updatePreferencesField('autoSaveInterval', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                    />
                  </FormField>
                </div>
              )}
            </SettingsSection>
          </>
        )

      case 'notifications':
        return (
          <>
            <SettingsSection title="Notification Channels" titleAr="قنوات الإشعارات" icon={<Bell className="w-5 h-5" />}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">البريد الإلكتروني</p>
                    <p className="text-sm text-gray-500 font-cairo">استلام الإشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.emailNotifications}
                      onChange={(e) => updateNotificationsField('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">الإشعاراتPush</p>
                    <p className="text-sm text-gray-500 font-cairo">استلام الإشعارات المباشرة</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.pushNotifications}
                      onChange={(e) => updateNotificationsField('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">الرسائل النصية SMS</p>
                    <p className="text-sm text-gray-500 font-cairo">استلام الإشعارات عبر الرسائل النصية</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.smsNotifications}
                      onChange={(e) => updateNotificationsField('smsNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection title="Notification Types" titleAr="أنواع الإشعارات" icon={<Bell className="w-5 h-5" />}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">تحديثات المشاريع</p>
                    <p className="text-sm text-gray-500 font-cairo">إشعارات حول تحديثات المشاريع</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.projectUpdates}
                      onChange={(e) => updateNotificationsField('projectUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">تنبيهات المعدات</p>
                    <p className="text-sm text-gray-500 font-cairo">إشعارات صيانة المعدات والتشغيل</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.equipmentAlerts}
                      onChange={(e) => updateNotificationsField('equipmentAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">تنبيهات المالية</p>
                    <p className="text-sm text-gray-500 font-cairo">إشعارات الفواتير والمدفوعات</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.financeAlerts}
                      onChange={(e) => updateNotificationsField('financeAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">تحديثات الموارد البشرية</p>
                    <p className="text-sm text-gray-500 font-cairo">إشعارات الرواتب والموظفين</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.hrUpdates}
                      onChange={(e) => updateNotificationsField('hrUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection title="Reports" titleAr="التقارير" icon={<Bell className="w-5 h-5" />}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">التقرير الأسبوعي</p>
                    <p className="text-sm text-gray-500 font-cairo">تلخيص أسبوعي للأنشطة</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.weeklyReport}
                      onChange={(e) => updateNotificationsField('weeklyReport', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">التقرير الشهري</p>
                    <p className="text-sm text-gray-500 font-cairo">تحليل شامل شهري</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.monthlyReport}
                      onChange={(e) => updateNotificationsField('monthlyReport', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>
              </div>
            </SettingsSection>
          </>
        )

      case 'security':
        return (
          <>
            <SettingsSection title="Authentication" titleAr="المصادقة" icon={<Shield className="w-5 h-5" />}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">المصادقة الثنائية (2FA)</p>
                    <p className="text-sm text-gray-500 font-cairo">حماية إضافية لحسابك</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.security.twoFactorEnabled}
                      onChange={(e) => updateSecurityField('twoFactorEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">تنبيهات تسجيل الدخول</p>
                    <p className="text-sm text-gray-500 font-cairo">إشعار عند تسجيل الدخول من جهاز جديد</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.security.loginAlerts}
                      onChange={(e) => updateSecurityField('loginAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">كلمة مرور قوية إلزامية</p>
                    <p className="text-sm text-gray-500 font-cairo">تطلب كلمات مرور معقدة</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.security.requireStrongPassword}
                      onChange={(e) => updateSecurityField('requireStrongPassword', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection title="Session & Password" titleAr="الجلسة وكلمة المرور" icon={<Clock className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Session Timeout (minutes)" labelAr="مهلة الجلسة (دقائق)">
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={formData.security.sessionTimeout}
                    onChange={(e) => updateSecurityField('sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                </FormField>

                <FormField label="Password Expiry (days)" labelAr="انتهاء كلمة المرور (أيام)">
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={formData.security.passwordExpiry}
                    onChange={(e) => updateSecurityField('passwordExpiry', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                </FormField>
              </div>
            </SettingsSection>
          </>
        )

      case 'system':
        return (
          <>
            <SettingsSection title="System Status" titleAr="حالة النظام" icon={<Database className="w-5 h-5" />}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">وضع الصيانة</p>
                    <p className="text-sm text-gray-500 font-cairo">جعل النظام غير متاح للمستخدمين</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.system.maintenanceMode}
                      onChange={(e) => updateSystemField('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">وضع التصحيح</p>
                    <p className="text-sm text-gray-500 font-cairo">تفعيل سجلات التصحيح التفصيلية</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.system.debugMode}
                      onChange={(e) => updateSystemField('debugMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection title="API Limits" titleAr="حدود API" icon={<Database className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Rate Limit (requests/hour)" labelAr="حد المعدل (طلبات/ساعة)">
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    value={formData.system.apiRateLimit}
                    onChange={(e) => updateSystemField('apiRateLimit', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                </FormField>

                <FormField label="Max File Size (MB)" labelAr="حجم الملف الأقصى (ميجابايت)">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.system.maxFileSize}
                    onChange={(e) => updateSystemField('maxFileSize', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-sans"
                  />
                </FormField>
              </div>
            </SettingsSection>

            <SettingsSection title="Backup Settings" titleAr="إعدادات النسخ الاحتياطي" icon={<Database className="w-5 h-5" />}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 font-cairo">النسخ الاحتياطي التلقائي</p>
                    <p className="text-sm text-gray-500 font-cairo">إنشاء نسخ احتياطية تلقائية</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.system.backupEnabled}
                      onChange={(e) => updateSystemField('backupEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2563eb]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563eb]"></div>
                  </label>
                </div>

                {formData.system.backupEnabled && (
                  <FormField label="Backup Frequency" labelAr="تكرار النسخ الاحتياطي">
                    <select
                      value={formData.system.backupFrequency}
                      onChange={(e) => updateSystemField('backupFrequency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563eb] focus:border-transparent font-cairo"
                    >
                      <option value="daily">يومي</option>
                      <option value="weekly">أسبوعي</option>
                      <option value="monthly">شهري</option>
                    </select>
                  </FormField>
                )}

                {formData.system.lastBackup && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 font-cairo">
                      آخر نسخة احتياطية:{' '}
                      {new Date(formData.system.lastBackup).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
              </div>
            </SettingsSection>
          </>
        )
    }
  }

  return (
    <AppLayout titleAr="الإعدادات">
      <PageHeader
        title="Settings"
        titleAr="الإعدادات"
        subtitle="Manage your account and system settings"
        subtitleAr="إدارة حسابك وإعدادات النظام"
        breadcrumbs={[
          { label: 'Home', labelAr: 'الرئيسية', path: '/' },
          { label: 'Settings', labelAr: 'الإعدادات' },
        ]}
        actions={[
          {
            label: 'Reset to Default',
            labelAr: 'إعادة تعيين',
            icon: <RotateCcw className="w-4 h-4" />,
            variant: 'outline' as const,
            onClick: handleReset,
          },
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-cairo ${
                    activeTab === tab.id
                      ? 'bg-[#2563eb] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.labelAr}</span>
                  {activeTab === tab.id && (
                    <Check className="w-4 h-4 mr-auto" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {hasChanges && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-amber-800 font-cairo">لديك تغييرات غير محفوظة</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="font-cairo"
              >
                {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </AppLayout>
  )
}
