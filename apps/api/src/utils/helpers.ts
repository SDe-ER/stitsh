import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserRoleType } from './constants.js'

// ============================================================================
// JWT INTERFACE
// ============================================================================
export interface JWTPayload {
  userId: string
  email: string
  role: UserRoleType
}

// ============================================================================
// PASSWORD HELPERS
// ============================================================================
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

// ============================================================================
// JWT HELPERS
// ============================================================================
const JWT_SECRET = process.env.JWT_SECRET || 'heavyops_super_secret_jwt_key_2024'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload
  } catch {
    return null
  }
}

// ============================================================================
// TOKEN REFRESH HELPER
// ============================================================================
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d', // 30 days for refresh token
  })
}

// ============================================================================
// STRING HELPERS
// ============================================================================
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// ============================================================================
// NUMBER HELPERS
// ============================================================================
export const formatCurrency = (
  amount: number,
  currency: string = 'SAR'
): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ar-SA').format(num)
}

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// ============================================================================
// DATE HELPERS
// ============================================================================
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export const isDateExpired = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d < new Date()
}

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay))
}

// ============================================================================
// PHONE NUMBER HELPERS (SAUDI ARABIA)
// ============================================================================
export const formatSaudiPhone = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Check if number starts with country code
  if (cleaned.startsWith('966')) {
    return `+966 ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`
  }

  // Check if number starts with 0
  if (cleaned.startsWith('0')) {
    return `+966 ${cleaned.substring(1, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`
  }

  // Assume 5xxx format
  return `+966 5 ${cleaned.substring(1, 4)} ${cleaned.substring(4)}`
}

export const normalizeSaudiPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('966')) {
    return cleaned
  }

  if (cleaned.startsWith('0')) {
    return '966' + cleaned.substring(1)
  }

  return '966' + cleaned
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidSaudiPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  return /^9665\d{8}$/.test(cleaned)
}

export const isValidSaudiId = (id: string): boolean => {
  // Saudi ID is 10 digits
  return /^\d{10}$/.test(id)
}

// ============================================================================
// ARRAY HELPERS
// ============================================================================
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array))
}

// ============================================================================
// OBJECT HELPERS
// ============================================================================
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================
export const successResponse = <T>(data: T, message?: string) => ({
  success: true,
  data,
  ...(message && { message }),
})

export const errorResponse = (message: string, code?: string) => ({
  success: false,
  error: {
    message,
    ...(code && { code }),
  },
})

export const paginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => ({
  success: true,
  data,
  meta: {
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  },
})
