import { PrismaClient, Prisma, DeductionType, DeductionStatus } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateDeductionInput {
  employeeId: string
  projectId: string
  type: DeductionType
  amount: number
  date: Date | string
  month: number
  year: number
  hours?: number
  minutes?: number
  reason?: string
  notes?: string
}

export interface UpdateDeductionInput {
  status?: DeductionStatus
  amount?: number
  notes?: string
}

export interface DeductionFilters {
  employeeId?: string
  projectId?: string
  type?: DeductionType
  status?: DeductionStatus
  month?: number
  year?: number
  fromDate?: Date
  toDate?: Date
}

// ============================================================================
// DEDUCTION CRUD OPERATIONS
// ============================================================================

/**
 * Get all deductions with optional filtering
 */
export async function getDeductions(filters?: DeductionFilters) {
  const where: Prisma.DeductionWhereInput = {}

  if (filters?.employeeId) {
    where.employeeId = filters.employeeId
  }

  if (filters?.projectId) {
    where.projectId = filters.projectId
  }

  if (filters?.type) {
    where.type = filters.type
  }

  if (filters?.status) {
    where.status = filters.status
  }

  if (filters?.month && filters?.year) {
    where.month = filters.month
    where.year = filters.year
  }

  if (filters?.fromDate || filters?.toDate) {
    where.date = {}
    if (filters.fromDate) {
      where.date.gte = filters.fromDate
    }
    if (filters.toDate) {
      where.date.lte = filters.toDate
    }
  }

  const deductions = await prisma.deduction.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          nameAr: true,
          employeeId: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          nameAr: true,
          code: true,
        },
      },
      payroll: {
        select: {
          id: true,
          month: true,
          year: true,
        },
      },
      costEntry: true,
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  })

  return deductions
}

/**
 * Get a single deduction by ID
 */
export async function getDeductionById(id: string) {
  return prisma.deduction.findUnique({
    where: { id },
    include: {
      employee: true,
      project: true,
      payroll: true,
      costEntry: true,
    },
  })
}

/**
 * Create a new deduction
 * - Creates the deduction record
 * - Creates a project cost entry
 * - Optionally links to payroll
 */
export async function createDeduction(input: CreateDeductionInput) {
  const { employeeId, projectId, type, amount, date, month, year, hours, minutes, reason, notes } = input

  // Start a transaction
  return prisma.$transaction(async (tx) => {
    // 1. Calculate amount based on type if not provided
    let calculatedAmount = new Prisma.Decimal(amount.toString())

    if (type === DeductionType.ABSENCE || type === DeductionType.PARTIAL_ABSENCE) {
      // For absence/partial, calculate based on employee's daily rate
      const employee = await tx.employee.findUnique({
        where: { id: employeeId },
        select: { salary: true },
      })

      if (!employee) {
        throw new Error('Employee not found')
      }

      const dailyRate = new Prisma.Decimal(employee.salary.toString()).div(30) // Daily rate
      const hourlyRate = dailyRate.div(8) // Hourly rate (8-hour workday)

      if (type === DeductionType.ABSENCE && !amount) {
        calculatedAmount = dailyRate
      } else if (type === DeductionType.PARTIAL_ABSENCE) {
        if (hours) {
          calculatedAmount = hourlyRate.mul(hours)
        } else if (minutes) {
          calculatedAmount = hourlyRate.mul(minutes).div(60)
        }
      }
    }

    // 2. Create deduction record
    const deduction = await tx.deduction.create({
      data: {
        employeeId,
        projectId,
        type,
        amount: calculatedAmount,
        date: new Date(date),
        month,
        year,
        hours: hours || 0,
        minutes: minutes || 0,
        reason: reason || null,
        notes: notes || null,
        status: DeductionStatus.PENDING,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            employeeId: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            code: true,
          },
        },
      },
    })

    // 3. Create project cost entry
    await tx.projectCostEntry.create({
      data: {
        projectId,
        deductionId: deduction.id,
        category: 'LABOR_DEDUCTION',
        amount: calculatedAmount,
        description: `Deduction: ${type} - ${deduction.employee.nameAr || deduction.employee.name}`,
      },
    })

    // 4. Update project actual cost
    await tx.project.update({
      where: { id: projectId },
      data: {
        actualCost: {
          increment: calculatedAmount.toNumber(),
        },
      },
    })

    return deduction
  })
}

/**
 * Update a deduction
 */
export async function updateDeduction(id: string, input: UpdateDeductionInput) {
  const deduction = await prisma.deduction.findUnique({
    where: { id },
    include: { costEntry: true },
  })

  if (!deduction) {
    throw new Error('Deduction not found')
  }

  return prisma.$transaction(async (tx) => {
    // Update deduction
    const updated = await tx.deduction.update({
      where: { id },
      data: {
        ...input,
        appliedAt: input.status === DeductionStatus.APPLIED ? new Date() : null,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            employeeId: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            code: true,
          },
        },
        costEntry: true,
      },
    })

    // Update cost entry if amount changed
    if (deduction.costEntry && input.amount !== undefined) {
      await tx.projectCostEntry.update({
        where: { id: deduction.costEntry.id },
        data: { amount: new Prisma.Decimal(input.amount.toString()) },
      })

      // Update project actual cost
      const difference = new Prisma.Decimal(input.amount.toString()).sub(
        new Prisma.Decimal(deduction.amount.toString())
      )
      await tx.project.update({
        where: { id: deduction.projectId },
        data: {
          actualCost: {
            increment: difference.toNumber(),
          },
        },
      })
    }

    return updated
  })
}

/**
 * Delete a deduction
 */
export async function deleteDeduction(id: string) {
  const deduction = await prisma.deduction.findUnique({
    where: { id },
    include: { costEntry: true },
  })

  if (!deduction) {
    throw new Error('Deduction not found')
  }

  return prisma.$transaction(async (tx) => {
    // Delete cost entry
    if (deduction.costEntry) {
      await tx.projectCostEntry.delete({
        where: { id: deduction.costEntry.id },
      })
    }

    // Update project actual cost
    await tx.project.update({
      where: { id: deduction.projectId },
      data: {
        actualCost: {
          decrement: new Prisma.Decimal(deduction.amount.toString()).toNumber(),
        },
      },
    })

    // Delete deduction
    await tx.deduction.delete({
      where: { id },
    })

    return { success: true }
  })
}

/**
 * Apply deduction to payroll
 */
export async function applyDeductionToPayroll(deductionId: string) {
  const deduction = await prisma.deduction.findUnique({
    where: { id: deductionId },
  })

  if (!deduction) {
    throw new Error('Deduction not found')
  }

  // Find or create payroll for the employee/month/year
  let payroll = await prisma.payroll.findUnique({
    where: {
      employeeId_month_year: {
        employeeId: deduction.employeeId,
        month: deduction.month,
        year: deduction.year,
      },
    },
  })

  if (!payroll) {
    const employee = await prisma.employee.findUnique({
      where: { id: deduction.employeeId },
      select: { salary: true },
    })

    if (!employee) {
      throw new Error('Employee not found')
    }

    payroll = await prisma.payroll.create({
      data: {
        employeeId: deduction.employeeId,
        month: deduction.month,
        year: deduction.year,
        basicSalary: employee.salary,
        deductionsAmount: new Prisma.Decimal(deduction.amount.toString()).toNumber(),
        netSalary: new Prisma.Decimal(employee.salary.toString())
          .sub(new Prisma.Decimal(deduction.amount.toString()))
          .toNumber(),
      },
    })
  } else {
    // Recalculate payroll with this deduction
    const existingDeductions = await prisma.deduction.findMany({
      where: {
        employeeId: deduction.employeeId,
        month: deduction.month,
        year: deduction.year,
        status: DeductionStatus.APPLIED,
        id: { not: deductionId }, // Exclude current deduction
      },
    })

    const totalDeductions = existingDeductions.reduce(
      (sum, d) => sum.plus(new Prisma.Decimal(d.amount.toString())),
      new Prisma.Decimal(0)
    )
    totalDeductions = totalDeductions.plus(new Prisma.Decimal(deduction.amount.toString()))

    payroll = await prisma.payroll.update({
      where: { id: payroll.id },
      data: {
        deductionsAmount: totalDeductions.toNumber(),
        netSalary: new Prisma.Decimal(payroll.basicSalary.toString())
          .sub(totalDeductions)
          .toNumber(),
      },
    })
  }

  // Update deduction
  const updated = await prisma.deduction.update({
    where: { id: deductionId },
    data: {
      status: DeductionStatus.APPLIED,
      payrollId: payroll.id,
      appliedAt: new Date(),
    },
    include: {
      employee: true,
      project: true,
      payroll: true,
    },
  })

  return updated
}

/**
 * Get deduction statistics for an employee
 */
export async function getEmployeeDeductionStats(employeeId: string, month: number, year: number) {
  const deductions = await prisma.deduction.findMany({
    where: {
      employeeId,
      month,
      year,
    },
  })

  const stats = {
    total: deductions.length,
    totalAmount: new Prisma.Decimal(0),
    byType: {
      absence: { count: 0, amount: new Prisma.Decimal(0) },
      partial_absence: { count: 0, amount: new Prisma.Decimal(0) },
      advance: { count: 0, amount: new Prisma.Decimal(0) },
      manual: { count: 0, amount: new Prisma.Decimal(0) },
    },
    byStatus: {
      pending: 0,
      approved: 0,
      applied: 0,
    },
  }

  for (const deduction of deductions) {
    const amount = new Prisma.Decimal(deduction.amount.toString())
    stats.totalAmount = stats.totalAmount.plus(amount)

    // By type
    if (deduction.type === DeductionType.ABSENCE) {
      stats.byType.absence.count++
      stats.byType.absence.amount = stats.byType.absence.amount.plus(amount)
    } else if (deduction.type === DeductionType.PARTIAL_ABSENCE) {
      stats.byType.partial_absence.count++
      stats.byType.partial_absence.amount = stats.byType.partial_absence.amount.plus(amount)
    } else if (deduction.type === DeductionType.ADVANCE) {
      stats.byType.advance.count++
      stats.byType.advance.amount = stats.byType.advance.amount.plus(amount)
    } else if (deduction.type === DeductionType.MANUAL) {
      stats.byType.manual.count++
      stats.byType.manual.amount = stats.byType.manual.amount.plus(amount)
    }

    // By status
    stats.byStatus[deduction.status]++
  }

  return stats
}

/**
 * Recalculate payroll with all deductions
 */
export async function recalculatePayroll(payrollId: string) {
  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
    include: {
      employee: true,
      deductions: true,
    },
  })

  if (!payroll) {
    throw new Error('Payroll not found')
  }

  // Sum all applied deductions
  const totalDeductions = payroll.deductions.reduce((sum, d) => {
    return sum.plus(new Prisma.Decimal(d.amount.toString()))
  }, new Prisma.Decimal(0))

  // Update payroll
  const updated = await prisma.payroll.update({
    where: { id: payrollId },
    data: {
      deductionsAmount: totalDeductions.toNumber(),
      netSalary: new Prisma.Decimal(payroll.basicSalary.toString())
        .plus(payroll.overtime || 0)
        .plus(payroll.bonuses || 0)
        .minus(totalDeductions)
        .toNumber(),
    },
  })

  return updated
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
