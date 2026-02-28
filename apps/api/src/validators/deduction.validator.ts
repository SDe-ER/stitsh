import { body, param, query } from 'express-validator'
import { DeductionType } from '@prisma/client'

export const createDeductionValidator = [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(Object.values(DeductionType))
    .withMessage('Invalid deduction type'),
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be positive'),
  body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Invalid date format'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020, max: 2100 }).withMessage('Invalid year'),
  body('hours').optional().isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24'),
  body('minutes')
    .optional()
    .isFloat({ min: 0, max: 59 })
    .withMessage('Minutes must be between 0 and 59'),
  body('reason').optional().isString().trim(),
  body('notes').optional().isString().trim(),
]

export const updateDeductionValidator = [
  param('id').notEmpty().withMessage('Deduction ID is required'),
  body('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'APPLIED'])
    .withMessage('Invalid status'),
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be positive'),
  body('notes').optional().isString().trim(),
]

export const getDeductionsValidator = [
  query('employeeId').optional().isString(),
  query('projectId').optional().isString(),
  query('type')
    .optional()
    .isIn(Object.values(DeductionType))
    .withMessage('Invalid deduction type'),
  query('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'APPLIED'])
    .withMessage('Invalid status'),
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2020, max: 2100 }),
  query('fromDate').optional().isISO8601(),
  query('toDate').optional().isISO8601(),
]

export const applyDeductionValidator = [
  param('id').notEmpty().withMessage('Deduction ID is required'),
]

export const recalculatePayrollValidator = [
  param('id').notEmpty().withMessage('Payroll ID is required'),
]

export const getEmployeeDeductionStatsValidator = [
  param('employeeId').notEmpty().withMessage('Employee ID is required'),
  query('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year').isInt({ min: 2020, max: 2100 }).withMessage('Invalid year'),
]
