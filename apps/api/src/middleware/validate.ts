import { Request, Response, NextFunction } from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { ValidationError } from './errorHandler.js'

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)))

    // Check for errors
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((error) => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined,
      }))

      throw new ValidationError(
        formattedErrors.map((e) => `${e.field}: ${e.message}`).join(', ')
      )
    }

    next()
  }
}

// ============================================================================
// COMMON VALIDATION RULES
// ============================================================================
import { body, param, query } from 'express-validator'

export const commonValidations = {
  // Email validation
  email: body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  // Password validation
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  // Name validation
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  // ID parameter validation
  idParam: param('id')
    .isString()
    .withMessage('ID must be a string')
    .notEmpty()
    .withMessage('ID is required'),

  // Pagination
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  // Status validation
  status: (allowedStatuses: string[]) =>
    body('status')
      .optional()
      .isIn(allowedStatuses)
      .withMessage(`Status must be one of: ${allowedStatuses.join(', ')}`),

  // Phone validation (Saudi format)
  phone: body('phone')
    .optional()
    .matches(/^(\+966|0)?5\d{8}$/)
    .withMessage('Must be a valid Saudi phone number'),

  // Date validation
  date: (field: string) =>
    body(field)
      .optional()
      .isISO8601()
      .withMessage(`${field} must be a valid date`),

  // Amount validation
  amount: (field: string) =>
    body(field)
      .optional()
      .isFloat({ min: 0 })
      .withMessage(`${field} must be a positive number`),
}

export const commonRules = {
  // Pagination rules
  pagination: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sortBy').optional(),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],

  // Search rule
  search: query('search').optional().isString().trim(),
}
