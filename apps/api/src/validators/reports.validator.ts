import { z } from 'zod'

// ============================================================================
// REPORTS ENUMS
// ============================================================================

export const ReportTypeEnum = z.enum([
  'PROJECT_PROFITABILITY',
  'EQUIPMENT_OPERATION',
  'SUPPLIER_STATEMENT',
  'LABOR_COSTS',
  'FUEL_CONSUMPTION',
  'ACCIDENT_LOG',
  'VAT_SUMMARY',
  'PAYROLL_SUMMARY',
  'EQUIPMENT_UTILIZATION',
  'DOCUMENT_EXPIRY',
])

export const ReportStatusEnum = z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'])

export const ExportFormatEnum = z.enum(['PDF', 'EXCEL', 'CSV'])

export const ExportStatusEnum = z.enum(['PENDING', 'COMPLETED', 'FAILED'])

// ============================================================================
// REPORT RUN SCHEMAS
// ============================================================================

export const runReportSchema = z.object({
  reportType: ReportTypeEnum,
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  projectId: z.string().cuid().optional(),
  equipmentId: z.string().cuid().optional(),
  employeeId: z.string().cuid().optional(),
  supplierId: z.string().cuid().optional(),
  period: z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']).optional(),
})

export type RunReportInput = z.infer<typeof runReportSchema>

// ============================================================================
// REPORT EXPORT SCHEMAS
// ============================================================================

export const exportReportSchema = z.object({
  runId: z.string().cuid(),
  format: ExportFormatEnum,
})

export type ExportReportInput = z.infer<typeof exportReportSchema>

// ============================================================================
// REPORT QUERY SCHEMAS
// ============================================================================

export const reportQuerySchema = z.object({
  type: ReportTypeEnum.optional(),
  category: z.string().optional(),
  status: ReportStatusEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'name', 'category']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type ReportQuery = z.infer<typeof reportQuerySchema>

export const reportRunQuerySchema = z.object({
  reportId: z.string().cuid().optional(),
  status: ReportStatusEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'startedAt', 'completedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type ReportRunQuery = z.infer<typeof reportRunQuerySchema>
