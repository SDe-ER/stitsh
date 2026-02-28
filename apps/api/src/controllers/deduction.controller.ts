import { Request, Response, NextFunction } from 'express'
import * as deductionService from '../services/deduction.service'
import { DeductionType } from '@prisma/client'

// ============================================================================
// CONTROLLERS
// ============================================================================

/**
 * Get all deductions with filtering
 */
export async function getDeductions(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = {
      employeeId: req.query.employeeId as string,
      projectId: req.query.projectId as string,
      type: req.query.type as DeductionType,
      status: req.query.status as 'PENDING' | 'APPROVED' | 'APPLIED',
      month: req.query.month ? parseInt(req.query.month as string) : undefined,
      year: req.query.year ? parseInt(req.query.year as string) : undefined,
      fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
      toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
    }

    const deductions = await deductionService.getDeductions(filters)
    res.json(deductions)
  } catch (error) {
    next(error)
  }
}

/**
 * Get a single deduction by ID
 */
export async function getDeductionById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const deduction = await deductionService.getDeductionById(id)

    if (!deduction) {
      return res.status(404).json({ error: 'Deduction not found' })
    }

    res.json(deduction)
  } catch (error) {
    next(error)
  }
}

/**
 * Create a new deduction
 */
export async function createDeduction(req: Request, res: Response, next: NextFunction) {
  try {
    const input = {
      employeeId: req.body.employeeId,
      projectId: req.body.projectId,
      type: req.body.type as DeductionType,
      amount: req.body.amount,
      date: req.body.date,
      month: parseInt(req.body.month),
      year: parseInt(req.body.year),
      hours: req.body.hours ? parseFloat(req.body.hours) : undefined,
      minutes: req.body.minutes ? parseFloat(req.body.minutes) : undefined,
      reason: req.body.reason,
      notes: req.body.notes,
    }

    const deduction = await deductionService.createDeduction(input)
    res.status(201).json(deduction)
  } catch (error) {
    next(error)
  }
}

/**
 * Update a deduction
 */
export async function updateDeduction(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const input = {
      status: req.body.status,
      amount: req.body.amount,
      notes: req.body.notes,
    }

    const deduction = await deductionService.updateDeduction(id, input)
    res.json(deduction)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a deduction
 */
export async function deleteDeduction(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const result = await deductionService.deleteDeduction(id)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * Apply deduction to payroll
 */
export async function applyDeductionToPayroll(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const deduction = await deductionService.applyDeductionToPayroll(id)
    res.json(deduction)
  } catch (error) {
    next(error)
  }
}

/**
 * Get employee deduction statistics
 */
export async function getEmployeeDeductionStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { employeeId } = req.params
    const month = parseInt(req.query.month as string)
    const year = parseInt(req.query.year as string)

    const stats = await deductionService.getEmployeeDeductionStats(employeeId, month, year)
    res.json(stats)
  } catch (error) {
    next(error)
  }
}

/**
 * Recalculate payroll with all deductions
 */
export async function recalculatePayroll(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const payroll = await deductionService.recalculatePayroll(id)
    res.json(payroll)
  } catch (error) {
    next(error)
  }
}

export default {
  getDeductions,
  getDeductionById,
  createDeduction,
  updateDeduction,
  deleteDeduction,
  applyDeductionToPayroll,
  getEmployeeDeductionStats,
  recalculatePayroll,
}
