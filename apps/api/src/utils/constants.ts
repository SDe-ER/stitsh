// ============================================================================
// USER ROLES
// ============================================================================
export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  ENGINEER: 'ENGINEER',
  ACCOUNTANT: 'ACCOUNTANT',
  HR: 'HR',
  VIEWER: 'VIEWER',
} as const

export type UserRoleType = typeof UserRole[keyof typeof UserRole]

// ============================================================================
// PROJECT STATUS
// ============================================================================
export const ProjectStatus = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type ProjectStatusType = typeof ProjectStatus[keyof typeof ProjectStatus]

// ============================================================================
// EMPLOYEE STATUS
// ============================================================================
export const EmployeeStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  TERMINATED: 'TERMINATED',
} as const

export type EmployeeStatusType = typeof EmployeeStatus[keyof typeof EmployeeStatus]

// ============================================================================
// EQUIPMENT STATUS
// ============================================================================
export const EquipmentStatus = {
  ACTIVE: 'ACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  INACTIVE: 'INACTIVE',
  RETIRED: 'RETIRED',
} as const

export type EquipmentStatusType = typeof EquipmentStatus[keyof typeof EquipmentStatus]

// ============================================================================
// EQUIPMENT TYPE
// ============================================================================
export const EquipmentType = {
  EXCAVATOR: 'EXCAVATOR',
  BULLDOZER: 'BULLDOZER',
  CRANE: 'CRANE',
  TRUCK: 'TRUCK',
  LOADER: 'LOADER',
  COMPACTOR: 'COMPACTOR',
  CONCRETE_MIXER: 'CONCRETE_MIXER',
  FORKLIFT: 'FORKLIFT',
  GENERATOR: 'GENERATOR',
  OTHER: 'OTHER',
} as const

export type EquipmentTypeType = typeof EquipmentType[keyof typeof EquipmentType]

// ============================================================================
// INVOICE STATUS
// ============================================================================
export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const

export type InvoiceStatusType = typeof InvoiceStatus[keyof typeof InvoiceStatus]

// ============================================================================
// EXPENSE CATEGORY
// ============================================================================
export const ExpenseCategory = {
  LABOR: 'LABOR',
  MATERIALS: 'MATERIALS',
  EQUIPMENT: 'EQUIPMENT',
  FUEL: 'FUEL',
  RENT: 'RENT',
  UTILITIES: 'UTILITIES',
  TRANSPORT: 'TRANSPORT',
  INSURANCE: 'INSURANCE',
  TAXES: 'TAXES',
  OTHER: 'OTHER',
} as const

export type ExpenseCategoryType = typeof ExpenseCategory[keyof typeof ExpenseCategory]

// ============================================================================
// PAYMENT STATUS
// ============================================================================
export const PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus]

// ============================================================================
// HTTP STATUS CODES
// ============================================================================
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// ============================================================================
// DATE FORMATS
// ============================================================================
export const DateFormat = {
  ISO: 'YYYY-MM-DD',
  SAUDI: 'DD/MM/YYYY',
  DISPLAY: 'DD MMM YYYY',
  DISPLAY_TIME: 'DD MMM YYYY HH:mm',
} as const

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================
export const PaginationDefaults = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// ============================================================================
// FILE UPLOAD LIMITS
// ============================================================================
export const FileUploadLimits = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const

// ============================================================================
// SAUDI ARABIA SPECIFIC CONSTANTS
// ============================================================================
export const SaudiConstants = {
  COUNTRY_CODE: '+966',
  CURRENCY: 'SAR',
  VAT_RATE: 0.15, // 15%
  VAT_CODE: '300123456700003',
  LABOR_MINISTRY_URL: 'https://www.mhrsd.gov.sa',
  ZAKAT_HOUSING_URL: 'https://www.zatca.gov.sa',
} as const

// ============================================================================
// ERROR CODES
// ============================================================================
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
} as const

// ============================================================================
// RESPONSE MESSAGES
// ============================================================================
export const ResponseMessage = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
} as const
