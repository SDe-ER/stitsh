import { z } from 'zod'

// ============================================================================
// EQUIPMENT VALIDATORS
// ============================================================================

export const equipmentStatusEnum = z.enum(['ACTIVE', 'IDLE', 'MAINTENANCE', 'RETIRED'])
export const equipmentTypeEnum = z.enum(['EXCAVATOR', 'LOADER', 'CRUSHER', 'TRUCK', 'CRANE', 'OTHER'])
export const maintenanceTypeEnum = z.enum(['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'])

export const createEquipmentSchema = z.object({
  name: z.string().min(2).max(200),
  nameAr: z.string().max(200).optional(),
  code: z.string().min(1).max(50),
  type: equipmentTypeEnum,
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serialNumber: z.string().max(100).optional(),
  status: equipmentStatusEnum.optional().default('IDLE'),
  currentProjectId: z.string().optional(),
  purchaseDate: z.coerce.date().optional(),
  purchaseCost: z.number().nonnegative().optional(),
  lastMaintenanceDate: z.coerce.date().optional(),
  nextMaintenanceDate: z.coerce.date().optional(),
  hourlyCost: z.number().nonnegative().optional(),
  dailyCost: z.number().nonnegative().optional(),
  location: z.string().optional(),
  operator: z.string().optional(),
  fuelConsumption: z.number().nonnegative().optional(),
  description: z.string().optional(),
})

export const updateEquipmentSchema = createEquipmentSchema.partial().extend({
  id: z.string(),
})

export const equipmentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: equipmentStatusEnum.optional(),
  type: equipmentTypeEnum.optional(),
  projectId: z.string().optional(),
  sortBy: z.enum(['name', 'code', 'type', 'status', 'purchaseDate', 'nextMaintenanceDate']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

// Helper to convert string to boolean for query params
const stringToBoolean = (val: unknown) => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') return val === 'true'
  return undefined
}

export const createMaintenanceRecordSchema = z.object({
  equipmentId: z.string(),
  type: maintenanceTypeEnum,
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  cost: z.number().nonnegative().optional(),
  date: z.coerce.date().optional().default(() => new Date()),
  technician: z.string().optional(),
  nextDueDate: z.coerce.date().optional(),
  notes: z.string().optional(),
})

export const updateMaintenanceRecordSchema = createMaintenanceRecordSchema.partial().extend({
  id: z.string(),
})

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>
export type EquipmentQuery = z.infer<typeof equipmentQuerySchema>
export type CreateMaintenanceRecordInput = z.infer<typeof createMaintenanceRecordSchema>
export type UpdateMaintenanceRecordInput = z.infer<typeof updateMaintenanceRecordSchema>
