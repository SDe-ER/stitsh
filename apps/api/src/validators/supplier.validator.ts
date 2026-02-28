import { z } from 'zod'

// ============================================================================
// SUPPLIER & CLIENT VALIDATORS
// ============================================================================

export const createClientSchema = z.object({
  name: z.string().min(2).max(200),
  nameAr: z.string().max(200).optional(),
  contactPerson: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().max(100).optional().default('Saudi Arabia'),
  crNumber: z.string().max(50).optional(),
  vatNumber: z.string().max(50).optional(),
})

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string(),
})

export const clientQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  city: z.string().optional(),
  sortBy: z.enum(['name', 'city', 'createdAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

export const createSupplierSchema = z.object({
  name: z.string().min(2).max(200),
  nameAr: z.string().max(200).optional(),
  contactPerson: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  taxNumber: z.string().max(50).optional(),
  crNumber: z.string().max(50).optional(),
  isActive: z.boolean().optional().default(true),
})

export const updateSupplierSchema = createSupplierSchema.partial().extend({
  id: z.string(),
})

export const supplierQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  sortBy: z.enum(['name', 'category', 'rating', 'createdAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ClientQuery = z.infer<typeof clientQuerySchema>
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>
export type SupplierQuery = z.infer<typeof supplierQuerySchema>
