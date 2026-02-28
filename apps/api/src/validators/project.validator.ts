import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  nameAr: z.string().optional(),
  code: z.string().min(1, 'Code is required'),
  clientId: z.string().cuid('Invalid client ID'),
  managerId: z.string().cuid('Invalid manager ID').optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  budget: z.number().positive('Budget must be positive').optional(),
  contractValue: z.number().positive('Contract value must be positive').optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  location: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
  retention: z.number().min(0).max(1).optional(),
})

export const updateProjectSchema = projectSchema.partial()

export const projectMilestoneSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  progress: z.number().min(0).max(100).optional(),
})

export const updateMilestoneSchema = z.object({
  name: z.string().min(2).optional(),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  isCompleted: z.boolean().optional(),
  progress: z.number().min(0).max(100).optional(),
})

export const projectQuerySchema = z.object({
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  clientId: z.string().cuid().optional(),
  managerId: z.string().cuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  sortBy: z.enum(['name', 'code', 'startDate', 'endDate', 'budget', 'progressPercent']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type CreateProjectInput = z.infer<typeof projectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type CreateMilestoneInput = z.infer<typeof projectMilestoneSchema>
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>
