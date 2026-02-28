import { z } from 'zod'

// ============================================================================
// FINANCE VALIDATORS
// ============================================================================

export const invoiceStatusEnum = z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'])
export const expenseCategoryEnum = z.enum([
  'MATERIALS',
  'LABOR',
  'EQUIPMENT',
  'FUEL',
  'RENT',
  'UTILITIES',
  'INSURANCE',
  'OTHER'
])

export const createInvoiceSchema = z.object({
  projectId: z.string().cuid(),
  clientId: z.string().cuid(),
  invoiceNumber: z.string().min(1).max(50),
  amount: z.number().positive(),
  tax: z.number().nonnegative().optional().default(0),
  taxRate: z.number().nonnegative().optional().default(0.15),
  status: invoiceStatusEnum.optional().default('DRAFT'),
  issueDate: z.coerce.date().optional().default(() => new Date()),
  dueDate: z.coerce.date(),
  paidDate: z.coerce.date().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
})

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  id: z.string(),
})

export const invoiceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: invoiceStatusEnum.optional(),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isOverdue: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  sortBy: z.enum(['invoiceNumber', 'amount', 'status', 'issueDate', 'dueDate']).optional().default('issueDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const createExpenseSchema = z.object({
  projectId: z.string().cuid().optional(),
  category: expenseCategoryEnum,
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.coerce.date().optional().default(() => new Date()),
  receiptUrl: z.string().url().optional(),
  vendor: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
})

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.string(),
})

export const approveExpenseSchema = z.object({
  id: z.string(),
  isApproved: z.boolean(),
})

export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  category: expenseCategoryEnum.optional(),
  projectId: z.string().optional(),
  isApproved: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(['amount', 'category', 'date', 'createdAt']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export const financeOverviewSchema = z.object({
  period: z.enum(['month', 'quarter', 'year', 'all']).optional().default('month'),
  projectId: z.string().optional(),
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
export type InvoiceQuery = z.infer<typeof invoiceQuerySchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
export type ExpenseQuery = z.infer<typeof expenseQuerySchema>
export type FinanceOverviewQuery = z.infer<typeof financeOverviewSchema>
