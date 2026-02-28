import { Router } from 'express'
import * as deductionController from '../controllers/deduction.controller'
import * as deductionValidator from '../validators/deduction.validator'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

/**
 * @route   GET /api/deductions
 * @desc    Get all deductions with optional filtering
 * @access  Private
 */
router.get(
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
router.get(
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
router.post(
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
router.get(
  '/:id',
  deductionController.getDeductionById
)

/**
 * @route   PATCH /api/deductions/:id
 * @desc    Update a deduction
 * @access  Private
 */
router.patch(
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
router.delete(
  '/:id',
  deductionController.deleteDeduction
)

/**
 * @route   POST /api/deductions/:id/apply
 * @desc    Apply deduction to payroll
 * @access  Private
 */
router.post(
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
router.post(
  '/payroll/:id/recalculate',
  deductionValidator.recalculatePayrollValidator,
  validate,
  deductionController.recalculatePayroll
)

export default router
