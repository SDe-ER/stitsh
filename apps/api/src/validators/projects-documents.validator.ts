import { z } from 'zod'

// ============================================================================
// PROJECT DOCUMENTS
// ============================================================================

export const projectDocumentSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1, 'Document name is required'),
  nameAr: z.string().optional(),
  type: z.enum(['CONTRACT', 'DRAWING', 'PERMIT', 'INVOICE', 'PHOTO', 'REPORT', 'OTHER']),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
})

export const updateProjectDocumentSchema = z.object({
  name: z.string().min(1).optional(),
  nameAr: z.string().optional(),
  type: z.enum(['CONTRACT', 'DRAWING', 'PERMIT', 'INVOICE', 'PHOTO', 'REPORT', 'OTHER']).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const projectDocumentQuerySchema = z.object({
  type: z.enum(['CONTRACT', 'DRAWING', 'PERMIT', 'INVOICE', 'PHOTO', 'REPORT', 'OTHER']).optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
})

// ============================================================================
// PROJECT DAILY LOGS
// ============================================================================

export const projectDailyLogSchema = z.object({
  projectId: z.string(),
  logDate: z.coerce.date().optional(),
  shift: z.enum(['MORNING', 'AFTERNOON', 'NIGHT']),
  weather: z.string().optional(),
  temperature: z.number().optional(),
  notes: z.string().optional(),
})

export const updateProjectDailyLogSchema = z.object({
  logDate: z.coerce.date().optional(),
  shift: z.enum(['MORNING', 'AFTERNOON', 'NIGHT']).optional(),
  weather: z.string().optional(),
  temperature: z.number().optional(),
  notes: z.string().optional(),
})

export const projectDailyLogQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  shift: z.enum(['MORNING', 'AFTERNOON', 'NIGHT']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(50),
})

// ============================================================================
// PROJECT DAILY ACTIVITIES
// ============================================================================

export const projectDailyActivitySchema = z.object({
  logId: z.string(),
  activityType: z.enum(['EXCAVATION', 'CONCRETING', 'ELECTRICAL', 'PLUMBING', 'OTHER']),
  description: z.string().min(1, 'Description is required'),
  location: z.string().optional(),
  status: z.enum(['COMPLETED', 'IN_PROGRESS', 'DELAYED']),
  workerCount: z.number().int().nonnegative().optional(),
  hours: z.number().nonnegative().optional(),
})

export const updateProjectDailyActivitySchema = z.object({
  activityType: z.enum(['EXCAVATION', 'CONCRETING', 'ELECTRICAL', 'PLUMBING', 'OTHER']).optional(),
  description: z.string().min(1).optional(),
  location: z.string().optional(),
  status: z.enum(['COMPLETED', 'IN_PROGRESS', 'DELAYED']).optional(),
  workerCount: z.number().int().nonnegative().optional(),
  hours: z.number().nonnegative().optional(),
})

// ============================================================================
// PROJECT DAILY EQUIPMENT
// ============================================================================

export const projectDailyEquipmentSchema = z.object({
  logId: z.string(),
  equipmentId: z.string(),
  operatorId: z.string().optional(),
  task: z.string().optional(),
  hours: z.number().positive('Hours must be positive'),
  status: z.enum(['ACTIVE', 'IDLE', 'MAINTENANCE']),
  fuelUsed: z.number().nonnegative().optional(),
})

export const updateProjectDailyEquipmentSchema = z.object({
  operatorId: z.string().optional(),
  task: z.string().optional(),
  hours: z.number().positive().optional(),
  status: z.enum(['ACTIVE', 'IDLE', 'MAINTENANCE']).optional(),
  fuelUsed: z.number().nonnegative().optional(),
})
