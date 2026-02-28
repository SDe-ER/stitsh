import { Request, Response } from 'express'
import { financeService } from '@/services/finance.service.js'
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceQuerySchema,
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
  financeOverviewSchema,
} from '@/validators/finance.validator.js'

// ============================================================================
// FINANCE CONTROLLER
// ============================================================================

export class FinanceController {
  /**
   * GET /api/finance/overview
   * Get finance overview
   */
  async getOverview(req: Request, res: Response) {
    try {
      const query = financeOverviewSchema.parse(req.query)
      const overview = await financeService.getOverview(query)

      res.json({
        success: true,
        data: overview,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'خطأ في التحقق من البيانات - Validation error',
            details: error.errors,
            code: 'VALIDATION_ERROR',
          },
        })
      }

      console.error('Finance overview error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  // ============================================================================
  // INVOICE METHODS
  // ============================================================================

  /**
   * GET /api/finance/invoices
   * Get all invoices
   */
  async getAllInvoices(req: Request, res: Response) {
    try {
      const query = invoiceQuerySchema.parse(req.query)
      const result = await financeService.getAllInvoices(query)

      res.json({
        success: true,
        ...result,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'خطأ في التحقق من البيانات - Validation error',
            details: error.errors,
            code: 'VALIDATION_ERROR',
          },
        })
      }

      console.error('Get all invoices error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * GET /api/finance/invoices/:id
   * Get invoice by ID
   */
  async getInvoiceById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const invoice = await financeService.getInvoiceById(id)

      res.json({
        success: true,
        data: invoice,
      })
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        })
      }

      console.error('Get invoice by ID error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * POST /api/finance/invoices
   * Create new invoice
   */
  async createInvoice(req: Request, res: Response) {
    try {
      const body = createInvoiceSchema.parse(req.body)
      const invoice = await financeService.createInvoice(body)

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الفاتورة بنجاح - Invoice created successfully',
        data: invoice,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'خطأ في التحقق من البيانات - Validation error',
            details: error.errors,
            code: 'VALIDATION_ERROR',
          },
        })
      }

      if (error.name === 'ConflictError' || error.name === 'NotFoundError') {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.name.replace('Error', '').toUpperCase(),
          },
        })
      }

      console.error('Create invoice error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * PUT /api/finance/invoices/:id
   * Update invoice
   */
  async updateInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params
      const body = updateInvoiceSchema.parse({ ...req.body, id })
      const invoice = await financeService.updateInvoice(body)

      res.json({
        success: true,
        message: 'تم تحديث الفاتورة بنجاح - Invoice updated successfully',
        data: invoice,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'خطأ في التحقق من البيانات - Validation error',
            details: error.errors,
            code: 'VALIDATION_ERROR',
          },
        })
      }

      if (error.name === 'ConflictError' || error.name === 'NotFoundError') {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.name.replace('Error', '').toUpperCase(),
          },
        })
      }

      console.error('Update invoice error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * DELETE /api/finance/invoices/:id
   * Delete invoice
   */
  async deleteInvoice(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await financeService.deleteInvoice(id)

      res.json({
        success: true,
        ...result,
      })
    } catch (error: any) {
      if (error.name === 'NotFoundError' || error.name === 'ConflictError') {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.name.replace('Error', '').toUpperCase(),
          },
        })
      }

      console.error('Delete invoice error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  // ============================================================================
  // EXPENSE METHODS
  // ============================================================================

  /**
   * GET /api/finance/expenses
   * Get all expenses
   */
  async getAllExpenses(req: Request, res: Response) {
    try {
      const query = expenseQuerySchema.parse(req.query)
      const result = await financeService.getAllExpenses(query)

      res.json({
        success: true,
        ...result,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'خطأ في التحقق من البيانات - Validation error',
            details: error.errors,
            code: 'VALIDATION_ERROR',
          },
        })
      }

      console.error('Get all expenses error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * GET /api/finance/expenses/:id
   * Get expense by ID
   */
  async getExpenseById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const expense = await financeService.getExpenseById(id)

      res.json({
        success: true,
        data: expense,
      })
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        })
      }

      console.error('Get expense by ID error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * POST /api/finance/expenses
   * Create new expense
   */
  async createExpense(req: Request, res: Response) {
    try {
      const body = createExpenseSchema.parse(req.body)
      const expense = await financeService.createExpense(body)

      res.status(201).json({
        success: true,
        message: 'تم إضافة المصروف بنجاح - Expense created successfully',
        data: expense,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'خطأ في التحقق من البيانات - Validation error',
            details: error.errors,
            code: 'VALIDATION_ERROR',
          },
        })
      }

      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        })
      }

      console.error('Create expense error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * PUT /api/finance/expenses/:id
   * Update expense
   */
  async updateExpense(req: Request, res: Response) {
    try {
      const { id } = req.params
      const body = updateExpenseSchema.parse({ ...req.body, id })
      const expense = await financeService.updateExpense(body)

      res.json({
        success: true,
        message: 'تم تحديث المصروف بنجاح - Expense updated successfully',
        data: expense,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'خطأ في التحقق من البيانات - Validation error',
            details: error.errors,
            code: 'VALIDATION_ERROR',
          },
        })
      }

      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        })
      }

      console.error('Update expense error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * PATCH /api/finance/expenses/:id/approve
   * Approve or reject expense
   */
  async approveExpense(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { isApproved } = req.body
      const approvedBy = req.user!.userId

      const expense = await financeService.approveExpense(id, approvedBy, isApproved)

      res.json({
        success: true,
        message: isApproved
          ? 'تم اعتماد المصروف بنجاح - Expense approved successfully'
          : 'تم رفض المصروف - Expense rejected',
        data: expense,
      })
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        })
      }

      console.error('Approve expense error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * DELETE /api/finance/expenses/:id
   * Delete expense
   */
  async deleteExpense(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await financeService.deleteExpense(id)

      res.json({
        success: true,
        ...result,
      })
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        })
      }

      console.error('Delete expense error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================
export const financeController = new FinanceController()
