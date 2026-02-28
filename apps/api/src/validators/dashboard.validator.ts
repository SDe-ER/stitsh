import { z } from 'zod'

// ============================================================================
// DASHBOARD VALIDATORS
// ============================================================================

export const dashboardStatsSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year', 'all']).optional().default('month'),
})

export const dashboardAlertsSchema = z.object({
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  type: z.enum([
    'IQAMA_EXPIRY',
    'PASSPORT_EXPIRY',
    'MAINTENANCE_DUE',
    'BUDGET_OVERRUN',
    'DOCUMENT_MISSING',
    'SAFETY_ISSUE',
    'OTHER'
  ]).optional(),
  isResolved: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
})

export const dashboardChartsSchema = z.object({
  chart: z.enum([
    'revenue',
    'expenses',
    'profit',
    'equipment-usage',
    'project-progress',
    'employee-attendance',
    'all'
  ]).optional().default('all'),
  period: z.enum(['week', 'month', 'quarter', 'year']).optional().default('month'),
  projectId: z.string().optional(),
})

export type DashboardStatsQuery = z.infer<typeof dashboardStatsSchema>
export type DashboardAlertsQuery = z.infer<typeof dashboardAlertsSchema>
export type DashboardChartsQuery = z.infer<typeof dashboardChartsSchema>
