import { prisma } from '@/lib/prisma.js'
import {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceQuery,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseQuery,
  FinanceOverviewQuery,
} from '@/validators/finance.validator.js'
import { NotFoundError, ConflictError } from '@/middleware/errorHandler.js'

// ============================================================================
// FINANCE SERVICE
// ============================================================================

export interface InvoiceWithRelations {
  id: string
  invoiceNumber: string
  projectId: string
  clientId: string
  amount: number
  tax: number
  taxRate: number | null
  total: number
  status: string
  issueDate: Date
  dueDate: Date
  paidDate: Date | null
  paymentMethod: string | null
  notes: string | null
  terms: string | null
  createdAt: Date
  updatedAt: Date
  project: { id: string; name: string; code: string }
  client: { id: string; name: string; nameAr: string | null }
}

export interface ExpenseWithRelations {
  id: string
  projectId: string | null
  category: string
  amount: number
  description: string | null
  date: Date
  approvedBy: string | null
  isApproved: boolean
  receiptUrl: string | null
  vendor: string | null
  invoiceNumber: string | null
  paymentMethod: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  project: { id: string; name: string; code: string } | null
  approver: { id: string; name: string; email: string } | null
}

export interface FinanceOverview {
  revenue: {
    total: number
    collected: number
    pending: number
    overdue: number
  }
  expenses: {
    total: number
    approved: number
    pending: number
    byCategory: Array<{ category: string; amount: number; percentage: number }>
  }
  profit: {
    gross: number
    net: number
    margin: number
  }
  invoices: {
    total: number
    paid: number
    pending: number
    overdue: number
  }
}

export class FinanceService {
  // ============================================================================
  // GET FINANCE OVERVIEW
  // ============================================================================
  async getOverview(query: FinanceOverviewQuery): Promise<FinanceOverview> {
    const now = new Date()
    let startDate = new Date(0)

    // Set date range based on period
    switch (query.period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - (now.getMonth() % 3), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'all':
      default:
        startDate = new Date(0)
        break
    }

    const where = query.projectId
      ? { projectId: query.projectId, issueDate: { gte: startDate } }
      : { issueDate: { gte: startDate } }

    const [
      invoiceStats,
      expenseStats,
      overdueInvoices,
      expensesByCategory,
    ] = await Promise.all([
      prisma.invoice.groupBy({
        by: ['status'],
        where,
        _sum: { total: true },
        _count: true,
      }),
      prisma.expense.groupBy({
        by: ['isApproved'],
        where: {
          date: { gte: startDate },
          ...(query.projectId ? { projectId: query.projectId } : {}),
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: {
          status: 'OVERDUE',
          dueDate: { lt: now },
          ...(query.projectId ? { projectId: query.projectId } : {}),
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.expense.groupBy({
        by: ['category'],
        where: {
          isApproved: true,
          date: { gte: startDate },
          ...(query.projectId ? { projectId: query.projectId } : {}),
        },
        _sum: { amount: true },
      }),
    ])

    // Calculate revenue stats
    const revenue = {
      total: invoiceStats.reduce((sum, stat) => sum + (stat._sum.total || 0), 0),
      collected: invoiceStats.find((s) => s.status === 'PAID')?._sum.total || 0,
      pending: invoiceStats.find((s) => s.status === 'SENT')?._sum.total || 0,
      overdue: overdueInvoices._sum.total || 0,
    }

    // Calculate expense stats
    const expensesTotal = expenseStats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0)
    const expenses = {
      total: expensesTotal,
      approved: expenseStats.find((s) => s.isApproved)?._sum.amount || 0,
      pending: expenseStats.find((s) => !s.isApproved)?._sum.amount || 0,
      byCategory: expensesByCategory.map((cat) => ({
        category: cat.category,
        amount: cat._sum.amount || 0,
        percentage: expensesTotal > 0 ? ((cat._sum.amount || 0) / expensesTotal) * 100 : 0,
      })),
    }

    // Calculate profit
    const gross = revenue.total
    const net = gross - expenses.approved
    const margin = gross > 0 ? (net / gross) * 100 : 0

    // Invoice counts
    const invoices = {
      total: invoiceStats.reduce((sum, stat) => sum + stat._count, 0),
      paid: invoiceStats.find((s) => s.status === 'PAID')?._count || 0,
      pending: invoiceStats.find((s) => s.status === 'SENT')?._count || 0,
      overdue: overdueInvoices._count,
    }

    return {
      revenue,
      expenses,
      profit: {
        gross,
        net,
        margin: Math.round(margin * 100) / 100,
      },
      invoices,
    }
  }

  // ============================================================================
  // GET ALL INVOICES
  // ============================================================================
  async getAllInvoices(query: InvoiceQuery) {
    const where: any = {}

    if (query.search) {
      where.OR = [
        { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.projectId) {
      where.projectId = query.projectId
    }

    if (query.clientId) {
      where.clientId = query.clientId
    }

    if (query.startDate) {
      where.issueDate = { ...where.issueDate, gte: query.startDate }
    }

    if (query.endDate) {
      where.issueDate = { ...where.issueDate, lte: query.endDate }
    }

    if (query.isOverdue) {
      where.status = { in: ['SENT', 'OVERDUE'] }
      where.dueDate = { lt: new Date() }
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          project: {
            select: { id: true, name: true, code: true },
          },
          client: {
            select: { id: true, name: true, nameAr: true },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ])

    const totalPages = Math.ceil(total / query.limit)

    return {
      data: invoices,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    }
  }

  // ============================================================================
  // GET INVOICE BY ID
  // ============================================================================
  async getInvoiceById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        client: {
          select: { id: true, name: true, nameAr: true },
        },
      },
    })

    if (!invoice) {
      throw new NotFoundError('الفاتورة غير موجودة - Invoice not found')
    }

    return invoice
  }

  // ============================================================================
  // CREATE INVOICE
  // ============================================================================
  async createInvoice(data: CreateInvoiceInput) {
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    })

    if (!project) {
      throw new NotFoundError('المشروع غير موجود - Project not found')
    }

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    })

    if (!client) {
      throw new NotFoundError('العميل غير موجود - Client not found')
    }

    // Check if invoice number already exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber: data.invoiceNumber },
    })

    if (existingInvoice) {
      throw new ConflictError('رقم الفاتورة مستخدم بالفعل - Invoice number already exists')
    }

    // Calculate total
    const taxAmount = data.amount * (data.taxRate || 0)
    const total = data.amount + taxAmount

    const invoice = await prisma.invoice.create({
      data: {
        projectId: data.projectId,
        clientId: data.clientId,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        tax: taxAmount,
        taxRate: data.taxRate,
        total,
        status: data.status,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        paidDate: data.paidDate,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        terms: data.terms,
      },
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        client: {
          select: { id: true, name: true, nameAr: true },
        },
      },
    })

    return invoice
  }

  // ============================================================================
  // UPDATE INVOICE
  // ============================================================================
  async updateInvoice(data: UpdateInvoiceInput) {
    const { id, ...updateData } = data

    // Check if invoice exists
    const existing = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('الفاتورة غير موجودة - Invoice not found')
    }

    // Check if invoice number is being changed and if it conflicts
    if (updateData.invoiceNumber && updateData.invoiceNumber !== existing.invoiceNumber) {
      const invoiceNumberExists = await prisma.invoice.findUnique({
        where: { invoiceNumber: updateData.invoiceNumber },
      })

      if (invoiceNumberExists) {
        throw new ConflictError('رقم الفاتورة مستخدم بالفعل - Invoice number already exists')
      }
    }

    // Recalculate total if amount or taxRate changed
    let finalUpdateData = { ...updateData }
    if (updateData.amount !== undefined || updateData.taxRate !== undefined) {
      const amount = updateData.amount ?? existing.amount
      const taxRate = updateData.taxRate ?? existing.taxRate ?? 0
      const tax = amount * taxRate
      finalUpdateData = {
        ...finalUpdateData,
        tax,
        total: amount + tax,
      }
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: finalUpdateData,
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        client: {
          select: { id: true, name: true, nameAr: true },
        },
      },
    })

    return invoice
  }

  // ============================================================================
  // DELETE INVOICE
  // ============================================================================
  async deleteInvoice(id: string) {
    // Check if invoice exists
    const existing = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('الفاتورة غير موجودة - Invoice not found')
    }

    if (existing.status === 'PAID') {
      throw new ConflictError('لا يمكن حذف فاتورة مدفوعة - Cannot delete paid invoice')
    }

    await prisma.invoice.delete({
      where: { id },
    })

    return { message: 'تم حذف الفاتورة بنجاح - Invoice deleted successfully' }
  }

  // ============================================================================
  // GET ALL EXPENSES
  // ============================================================================
  async getAllExpenses(query: ExpenseQuery) {
    const where: any = {}

    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { vendor: { contains: query.search, mode: 'insensitive' } },
        { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query.category) {
      where.category = query.category
    }

    if (query.projectId) {
      where.projectId = query.projectId
    }

    if (query.isApproved !== undefined) {
      where.isApproved = query.isApproved
    }

    if (query.startDate) {
      where.date = { ...where.date, gte: query.startDate }
    }

    if (query.endDate) {
      where.date = { ...where.date, lte: query.endDate }
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          project: {
            select: { id: true, name: true, code: true },
          },
          approver: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.expense.count({ where }),
    ])

    const totalPages = Math.ceil(total / query.limit)

    return {
      data: expenses,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    }
  }

  // ============================================================================
  // GET EXPENSE BY ID
  // ============================================================================
  async getExpenseById(id: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    if (!expense) {
      throw new NotFoundError('المصروف غير موجود - Expense not found')
    }

    return expense
  }

  // ============================================================================
  // CREATE EXPENSE
  // ============================================================================
  async createExpense(data: CreateExpenseInput) {
    // Check if project exists (if provided)
    if (data.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
      })

      if (!project) {
        throw new NotFoundError('المشروع غير موجود - Project not found')
      }
    }

    const expense = await prisma.expense.create({
      data: {
        projectId: data.projectId,
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: data.date,
        receiptUrl: data.receiptUrl,
        vendor: data.vendor,
        invoiceNumber: data.invoiceNumber,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      },
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return expense
  }

  // ============================================================================
  // UPDATE EXPENSE
  // ============================================================================
  async updateExpense(data: UpdateExpenseInput) {
    const { id, ...updateData } = data

    // Check if expense exists
    const existing = await prisma.expense.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('المصروف غير موجود - Expense not found')
    }

    // Check if project exists (if being updated)
    if (updateData.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: updateData.projectId },
      })

      if (!project) {
        throw new NotFoundError('المشروع غير موجود - Project not found')
      }
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return expense
  }

  // ============================================================================
  // APPROVE EXPENSE
  // ============================================================================
  async approveExpense(id: string, approvedBy: string, isApproved: boolean) {
    // Check if expense exists
    const existing = await prisma.expense.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('المصروف غير موجود - Expense not found')
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        isApproved,
        approvedBy: isApproved ? approvedBy : null,
      },
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return expense
  }

  // ============================================================================
  // DELETE EXPENSE
  // ============================================================================
  async deleteExpense(id: string) {
    // Check if expense exists
    const existing = await prisma.expense.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('المصروف غير موجود - Expense not found')
    }

    await prisma.expense.delete({
      where: { id },
    })

    return { message: 'تم حذف المصروف بنجاح - Expense deleted successfully' }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================
export const financeService = new FinanceService()
