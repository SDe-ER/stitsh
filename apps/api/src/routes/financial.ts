import { Router } from 'express'
import { financeController } from '@/controllers/finance.controller.js'
import { authMiddleware, requireRole } from '@/middleware/auth.js'

export const financialRouter = Router()

// All finance routes require authentication
financialRouter.use(authMiddleware)

/**
 * @route   GET /api/finance/overview
 * @desc    Get finance overview
 * @access  Private (Admin, Accountant, Manager)
 */
financialRouter.get(
  '/overview',
  requireRole('ADMIN', 'ACCOUNTANT', 'MANAGER'),
  financeController.getOverview.bind(financeController)
)

// ============================================================================
// INVOICE ROUTES
// ============================================================================

/**
 * @route   GET /api/finance/invoices
 * @desc    Get all invoices
 * @access  Private
 */
financialRouter.get('/invoices', financeController.getAllInvoices.bind(financeController))

/**
 * @route   GET /api/finance/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
financialRouter.get('/invoices/:id', financeController.getInvoiceById.bind(financeController))

/**
 * @route   POST /api/finance/invoices
 * @desc    Create new invoice
 * @access  Private (Admin, Accountant, Manager)
 */
financialRouter.post(
  '/invoices',
  requireRole('ADMIN', 'ACCOUNTANT', 'MANAGER'),
  financeController.createInvoice.bind(financeController)
)

/**
 * @route   PUT /api/finance/invoices/:id
 * @desc    Update invoice
 * @access  Private (Admin, Accountant, Manager)
 */
financialRouter.put(
  '/invoices/:id',
  requireRole('ADMIN', 'ACCOUNTANT', 'MANAGER'),
  financeController.updateInvoice.bind(financeController)
)

/**
 * @route   DELETE /api/finance/invoices/:id
 * @desc    Delete invoice
 * @access  Private (Admin, Accountant)
 */
financialRouter.delete(
  '/invoices/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  financeController.deleteInvoice.bind(financeController)
)

// ============================================================================
// EXPENSE ROUTES
// ============================================================================

/**
 * @route   GET /api/finance/expenses
 * @desc    Get all expenses
 * @access  Private
 */
financialRouter.get('/expenses', financeController.getAllExpenses.bind(financeController))

/**
 * @route   GET /api/finance/expenses/:id
 * @desc    Get expense by ID
 * @access  Private
 */
financialRouter.get('/expenses/:id', financeController.getExpenseById.bind(financeController))

/**
 * @route   POST /api/finance/expenses
 * @desc    Create new expense
 * @access  Private
 */
financialRouter.post('/expenses', financeController.createExpense.bind(financeController))

/**
 * @route   PUT /api/finance/expenses/:id
 * @desc    Update expense
 * @access  Private
 */
financialRouter.put('/expenses/:id', financeController.updateExpense.bind(financeController))

/**
 * @route   PATCH /api/finance/expenses/:id/approve
 * @desc    Approve or reject expense
 * @access  Private (Admin, Accountant, Manager)
 */
financialRouter.patch(
  '/expenses/:id/approve',
  requireRole('ADMIN', 'ACCOUNTANT', 'MANAGER'),
  financeController.approveExpense.bind(financeController)
)

/**
 * @route   DELETE /api/finance/expenses/:id
 * @desc    Delete expense
 * @access  Private (Admin, Accountant)
 */
financialRouter.delete(
  '/expenses/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  financeController.deleteExpense.bind(financeController)
)
