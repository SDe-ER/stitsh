import { Router } from 'express'
import * as deductionController from '../controllers/deduction.controller'
import * as deductionValidator from '../validators/deduction.validator'
import { validate } from '../middleware/validate'
import { authMiddleware } from '../middleware/auth'

export const deductionsRouter = Router()

// All routes require authentication
deductionsRouter.use(authMiddleware)

/**
 * @route   GET /api/deductions
 * @desc    Get all deductions with optional filtering
 * @access  Private
 */
deductionsRouter.get(
  '/',
  deductionValidator.getDeductionsValidator,
  validate,
  deductionController.getDeductions
)

/**
 * @route   GET /api/deductions/stats/employee/:employeeId
 * @desc    Get deduction statistics for an employee
 * @access  Private
 */
deductionsRouter.get(
  '/stats/employee/:employeeId',
  deductionValidator.getEmployeeDeductionStatsValidator,
  validate,
  deductionController.getEmployeeDeductionStats
)

/**
 * @route   POST /api/deductions
 * @desc    Create a new deduction
 * @access  Private
 */
deductionsRouter.post(
  '/',
  deductionValidator.createDeductionValidator,
  validate,
  deductionController.createDeduction
)

/**
 * @route   GET /api/deductions/:id
 * @desc    Get a single deduction by ID
 * @access  Private
 */
deductionsRouter.get(
  '/:id',
  deductionController.getDeductionById
)

/**
 * @route   PATCH /api/deductions/:id
 * @desc    Update a deduction
 * @access  Private
 */
deductionsRouter.patch(
  '/:id',
  deductionValidator.updateDeductionValidator,
  validate,
  deductionController.updateDeduction
)

/**
 * @route   DELETE /api/deductions/:id
 * @desc    Delete a deduction
 * @access  Private
 */
deductionsRouter.delete(
  '/:id',
  deductionController.deleteDeduction
)

/**
 * @route   POST /api/deductions/:id/apply
 * @desc    Apply deduction to payroll
 * @access  Private
 */
deductionsRouter.post(
  '/:id/apply',
  deductionValidator.applyDeductionValidator,
  validate,
  deductionController.applyDeductionToPayroll
)

/**
 * @route   POST /api/payroll/:id/recalculate
 * @desc    Recalculate payroll with all deductions
 * @access  Private
 */
deductionsRouter.post(
  '/payroll/:id/recalculate',
  deductionValidator.recalculatePayrollValidator,
  validate,
  deductionController.recalculatePayroll
)
