import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'auto'
export type Language = 'ar' | 'en'
export type Timezone = 'Asia/Riyadh' | 'Asia/Dubai' | 'Asia/Qatar' | 'Asia/Kuwait' | 'Asia/Bahrain' | 'Asia/Muscat'
export type Currency = 'SAR' | 'AED' | 'QAR' | 'KWD' | 'BHD' | 'OMR'
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'

export interface CompanySettings {
  name: string
  nameAr: string
  logo?: string
  commercialRegistration: string
  vatNumber: string
  address: string
  addressAr: string
  phone: string
  email: string
  website?: string
}

export interface UserPreferences {
  theme: ThemeMode
  language: Language
  timezone: Timezone
  currency: Currency
  dateFormat: DateFormat
  notificationsEnabled: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  autoSave: boolean
  autoSaveInterval: number
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  projectUpdates: boolean
  equipmentAlerts: boolean
  financeAlerts: boolean
  hrUpdates: boolean
  weeklyReport: boolean
  monthlyReport: boolean
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  passwordExpiry: number
  requireStrongPassword: boolean
  loginAlerts: boolean
}

export interface SystemSettings {
  maintenanceMode: boolean
  debugMode: boolean
  apiRateLimit: number
  maxFileSize: number
  backupEnabled: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  lastBackup?: string
}

export interface SettingsData {
  company: CompanySettings
  preferences: UserPreferences
  notifications: NotificationSettings
  security: SecuritySettings
  system: SystemSettings
}

// ============================================================================
// LABELS
// ============================================================================

export const timezoneLabels: Record<Timezone, { label: string; labelAr: string; offset: string }> = {
  'Asia/Riyadh': { label: 'Riyadh', labelAr: 'الرياض', offset: 'GMT+3' },
  'Asia/Dubai': { label: 'Dubai', labelAr: 'دبي', offset: 'GMT+4' },
  'Asia/Qatar': { label: 'Qatar', labelAr: 'قطر', offset: 'GMT+3' },
  'Asia/Kuwait': { label: 'Kuwait', labelAr: 'الكويت', offset: 'GMT+3' },
  'Asia/Bahrain': { label: 'Bahrain', labelAr: 'البحرين', offset: 'GMT+3' },
  'Asia/Muscat': { label: 'Muscat', labelAr: 'مسقط', offset: 'GMT+4' },
}

export const currencyLabels: Record<Currency, { label: string; labelAr: string; symbol: string; name: string }> = {
  SAR: { label: 'SAR', labelAr: 'ريال سعودي', symbol: 'ر.س', name: 'Saudi Riyal' },
  AED: { label: 'AED', labelAr: 'درهم إماراتي', symbol: 'د.إ', name: 'UAE Dirham' },
  QAR: { label: 'QAR', labelAr: 'ريال قطري', symbol: 'ر.ق', name: 'Qatari Riyal' },
  KWD: { label: 'KWD', labelAr: 'دينار كويتي', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  BHD: { label: 'BHD', labelAr: 'دينار بحريني', symbol: 'د.ب', name: 'Bahraini Dinar' },
  OMR: { label: 'OMR', labelAr: 'ريال عماني', symbol: 'ر.ع', name: 'Omani Rial' },
}

export const dateFormatLabels: Record<DateFormat, { label: string; labelAr: string; example: string }> = {
  'DD/MM/YYYY': { label: 'DD/MM/YYYY', labelAr: 'يوم/شهر/سنة', example: '31/12/2024' },
  'MM/DD/YYYY': { label: 'MM/DD/YYYY', labelAr: 'شهر/يوم/سنة', example: '12/31/2024' },
  'YYYY-MM-DD': { label: 'YYYY-MM-DD', labelAr: 'سنة-شهر-يوم', example: '2024-12-31' },
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const defaultCompanySettings: CompanySettings = {
  name: 'HeavyOps ERP',
  nameAr: 'هيفي أوبس لإدارة المشاريع',
  logo: '',
  commercialRegistration: '1010000000',
  vatNumber: '300000000000003',
  address: 'Riyadh, Saudi Arabia',
  addressAr: 'الرياض، المملكة العربية السعودية',
  phone: '+966-11-1234567',
  email: 'info@heavyops.com',
  website: 'https://heavyops.com',
}

const defaultUserPreferences: UserPreferences = {
  theme: 'light',
  language: 'ar',
  timezone: 'Asia/Riyadh',
  currency: 'SAR',
  dateFormat: 'DD/MM/YYYY',
  notificationsEnabled: true,
  emailNotifications: true,
  pushNotifications: true,
  autoSave: true,
  autoSaveInterval: 30,
}

const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  projectUpdates: true,
  equipmentAlerts: true,
  financeAlerts: true,
  hrUpdates: false,
  weeklyReport: true,
  monthlyReport: true,
}

const defaultSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: 60,
  passwordExpiry: 90,
  requireStrongPassword: true,
  loginAlerts: true,
}

const defaultSystemSettings: SystemSettings = {
  maintenanceMode: false,
  debugMode: false,
  apiRateLimit: 1000,
  maxFileSize: 10,
  backupEnabled: true,
  backupFrequency: 'daily',
  lastBackup: new Date().toISOString(),
}

const defaultSettings: SettingsData = {
  company: defaultCompanySettings,
  preferences: defaultUserPreferences,
  notifications: defaultNotificationSettings,
  security: defaultSecuritySettings,
  system: defaultSystemSettings,
}

// ============================================================================
// LOCAL STORAGE HELPERS
// ============================================================================

const SETTINGS_STORAGE_KEY = 'heavyops_settings'

function getSettingsFromStorage(): SettingsData {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        company: { ...defaultCompanySettings, ...parsed.company },
        preferences: { ...defaultUserPreferences, ...parsed.preferences },
        notifications: { ...defaultNotificationSettings, ...parsed.notifications },
        security: { ...defaultSecuritySettings, ...parsed.security },
        system: { ...defaultSystemSettings, ...parsed.system },
      }
    }
    return defaultSettings
  } catch {
    return defaultSettings
  }
}

function saveSettingsToStorage(settings: SettingsData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

// ============================================================================
// SETTINGS HOOKS
// ============================================================================

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => getSettingsFromStorage(),
    retry: false,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Partial<SettingsData>) => {
      const currentSettings = getSettingsFromStorage()
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        company: { ...currentSettings.company, ...settings.company },
        preferences: { ...currentSettings.preferences, ...settings.preferences },
        notifications: { ...currentSettings.notifications, ...settings.notifications },
        security: { ...currentSettings.security, ...settings.security },
        system: { ...currentSettings.system, ...settings.system },
      }
      saveSettingsToStorage(updatedSettings)
      return Promise.resolve(updatedSettings)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('تم حفظ الإعدادات بنجاح', { description: 'Settings saved successfully' })
    },
  })
}

export function useResetSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      saveSettingsToStorage(defaultSettings)
      return Promise.resolve(defaultSettings)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('تم إعادة تعيين الإعدادات', { description: 'Settings reset to default' })
    },
  })
}
