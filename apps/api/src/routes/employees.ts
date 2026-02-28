import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/lib/prisma.js'
import { authMiddleware, requireRole } from '@/middleware/auth.js'
import {
  employeeSchema,
  updateEmployeeSchema,
  attendanceSchema,
  updateAttendanceSchema,
  payrollSchema,
  employeeQuerySchema,
} from '@/validators/employee.validator.js'

export const employeesRouter = Router()

// ============================================================================
// GET /api/employees - List all employees with filters
// ============================================================================
employeesRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const query = employeeQuerySchema.parse(req.query)
    const {
      status,
      projectId,
      department,
      nationality,
      search,
      page = 1,
      limit = 50,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query

    const skip = (page - 1) * limit

    const where: any = {}

    if (status) where.status = status
    if (projectId) where.projectId = projectId
    if (department) where.department = department
    if (nationality) where.nationality = nationality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          nameAr: true,
          employeeId: true,
          nationality: true,
          jobTitle: true,
          department: true,
          salary: true,
          phone: true,
          email: true,
          projectId: true,
          status: true,
          joinDate: true,
          iqamaNumber: true,
          iqamaExpiry: true,
          passportExpiry: true,
          project: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              code: true,
            },
          },
          _count: {
            select: {
              attendance: true,
              payroll: true,
            },
          },
        },
      }),
      prisma.employee.count({ where }),
    ])

    res.json({
      data: employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          message: 'Validation error',
          details: error.errors,
          status: 400,
        },
      })
    }

    console.error('List employees error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// ============================================================================
// GET /api/employees/stats - Get employees statistics
// ============================================================================
employeesRouter.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      totalSalary,
      projects,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.count({ where: { status: 'ON_LEAVE' } }),
      prisma.employee.aggregate({ _sum: { salary: true } }),
      prisma.employee.findMany({
        where: { projectId: { not: null } },
        select: {
          projectId: true,
          project: { select: { name: true, nameAr: true } },
        },
        distinct: ['projectId'],
      }),
    ])

    // Employees by nationality
    const byNationality = await prisma.employee.groupBy({
      by: ['nationality'],
      _count: { nationality: true },
      where: { status: 'ACTIVE' },
    })

    // Employees by department
    const byDepartment = await prisma.employee.groupBy({
      by: ['department'],
      _count: { department: true },
      where: { status: 'ACTIVE' },
    })

    // Expiring documents (within 30 days)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today)
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const [expiringIqama, expiringPassport] = await Promise.all([
      prisma.employee.findMany({
        where: {
          status: 'ACTIVE',
          iqamaExpiry: { lte: thirtyDaysFromNow },
        },
        select: { id: true, name: true, nameAr: true, iqamaNumber: true, iqamaExpiry: true },
        take: 10,
      }),
      prisma.employee.findMany({
        where: {
          status: 'ACTIVE',
          passportExpiry: { lte: thirtyDaysFromNow },
        },
        select: { id: true, name: true, nameAr: true, passportNumber: true, passportExpiry: true },
        take: 10,
      }),
    ])

    res.json({
      data: {
        overview: {
          total: totalEmployees,
          active: activeEmployees,
          onLeave: onLeaveEmployees,
          terminated: totalEmployees - activeEmployees - onLeaveEmployees,
          totalSalary: totalSalary._sum.salary || 0,
        },
        byNationality: byNationality.map((n) => ({
          nationality: n.nationality,
          count: n._count.nationality,
        })),
        byDepartment: byDepartment.map((d) => ({
          department: d.department,
          count: d._count.department,
        })),
        projectsWithEmployees: projects.length,
        expiringDocuments: {
          iqama: expiringIqama,
          passport: expiringPassport,
        },
      },
    })
  } catch (error) {
    console.error('Get employees stats error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// ============================================================================
// GET /api/employees/:id - Get employee by ID
// ============================================================================
employeesRouter.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            code: true,
            client: { select: { name: true, nameAr: true } },
          },
        },
        attendance: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        payroll: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 12,
        },
      },
    })

    if (!employee) {
      return res.status(404).json({
        error: {
          message: 'Employee not found',
          status: 404,
        },
      })
    }

    // Calculate attendance summary
    const presentDays = employee.attendance.filter((a) => a.status === 'PRESENT').length
    const absentDays = employee.attendance.filter((a) => a.status === 'ABSENT').length
    const lateDays = employee.attendance.filter((a) => a.status === 'LATE').length

    // Check for expiring documents
    const today = new Date()
    const thirtyDaysFromNow = new Date(today)
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const iqamaExpiring = employee.iqamaExpiry && employee.iqamaExpiry <= thirtyDaysFromNow
    const passportExpiring = employee.passportExpiry && employee.passportExpiry <= thirtyDaysFromNow

    res.json({
      data: {
        ...employee,
        attendanceSummary: {
          present: presentDays,
          absent: absentDays,
          late: lateDays,
          total: employee.attendance.length,
        },
        documentsExpiring: {
          iqama: iqamaExpiring,
          passport: passportExpiring,
        },
      },
    })
  } catch (error) {
    console.error('Get employee error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// ============================================================================
// POST /api/employees - Create new employee
// ============================================================================
employeesRouter.post(
  '/',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'HR'),
  async (req: Request, res: Response) => {
    try {
      const body = employeeSchema.parse(req.body)

      // Check if employee ID is unique
      const existing = await prisma.employee.findUnique({
        where: { employeeId: body.employeeId },
      })

      if (existing) {
        return res.status(409).json({
          error: {
            message: 'Employee ID already exists',
            status: 409,
          },
        })
      }

      // Check iqama uniqueness if provided
      if (body.iqamaNumber) {
        const iqamaExists = await prisma.employee.findUnique({
          where: { iqamaNumber: body.iqamaNumber },
        })

        if (iqamaExists) {
          return res.status(409).json({
            error: {
              message: 'Iqama number already exists',
              status: 409,
            },
          })
        }
      }

      // Check passport uniqueness if provided
      if (body.passportNumber) {
        const passportExists = await prisma.employee.findUnique({
          where: { passportNumber: body.passportNumber },
        })

        if (passportExists) {
          return res.status(409).json({
            error: {
              message: 'Passport number already exists',
              status: 409,
            },
          })
        }
      }

      // Verify project exists if assigned
      if (body.projectId) {
        const project = await prisma.project.findUnique({
          where: { id: body.projectId },
        })

        if (!project) {
          return res.status(404).json({
            error: {
              message: 'Project not found',
              status: 404,
            },
          })
        }
      }

      const employee = await prisma.employee.create({
        data: {
          ...body,
          status: body.status ?? 'ACTIVE',
          joinDate: body.joinDate ?? new Date(),
        },
        include: {
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

      res.status(201).json({
        message: 'Employee created successfully',
        data: employee,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            message: 'Validation error',
            details: error.errors,
            status: 400,
          },
        })
      }

      console.error('Create employee error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// ============================================================================
// PUT /api/employees/:id - Update employee
// ============================================================================
employeesRouter.put(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'HR'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const body = updateEmployeeSchema.parse(req.body)

      const existing = await prisma.employee.findUnique({
        where: { id },
      })

      if (!existing) {
        return res.status(404).json({
          error: {
            message: 'Employee not found',
            status: 404,
          },
        })
      }

      // Check employee ID uniqueness if changing
      if (body.employeeId && body.employeeId !== existing.employeeId) {
        const idExists = await prisma.employee.findUnique({
          where: { employeeId: body.employeeId },
        })

        if (idExists) {
          return res.status(409).json({
            error: {
              message: 'Employee ID already exists',
              status: 409,
            },
          })
        }
      }

      // Check iqama uniqueness if changing
      if (body.iqamaNumber && body.iqamaNumber !== existing.iqamaNumber) {
        const iqamaExists = await prisma.employee.findUnique({
          where: { iqamaNumber: body.iqamaNumber },
        })

        if (iqamaExists) {
          return res.status(409).json({
            error: {
              message: 'Iqama number already exists',
              status: 409,
            },
          })
        }
      }

      // Check passport uniqueness if changing
      if (body.passportNumber && body.passportNumber !== existing.passportNumber) {
        const passportExists = await prisma.employee.findUnique({
          where: { passportNumber: body.passportNumber },
        })

        if (passportExists) {
          return res.status(409).json({
            error: {
              message: 'Passport number already exists',
              status: 409,
            },
          })
        }
      }

      const employee = await prisma.employee.update({
        where: { id },
        data: body,
        include: {
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

      res.json({
        message: 'Employee updated successfully',
        data: employee,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            message: 'Validation error',
            details: error.errors,
            status: 400,
          },
        })
      }

      console.error('Update employee error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// ============================================================================
// PAYROLL (Must come before /:id route)
// ============================================================================

// GET /api/employees/payroll - Get payroll records
employeesRouter.get('/payroll', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { month, year, employeeId, isPaid } = req.query

    const where: any = {}

    if (month) where.month = Number(month)
    if (year) where.year = Number(year)
    if (employeeId) {
      const employee = await prisma.employee.findFirst({
        where: { employeeId: String(employeeId) },
      })
      if (employee) where.employeeId = employee.id
    }
    if (isPaid !== undefined) where.isPaid = isPaid === 'true'

    const payroll = await prisma.payroll.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            employeeId: true,
            jobTitle: true,
            department: true,
          },
        },
      },
    })

    res.json({
      data: payroll,
    })
  } catch (error) {
    console.error('Get payroll error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// GET /api/employees/payroll/summary/:month/:year - Get payroll summary
employeesRouter.get(
  '/payroll/summary/:month/:year',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ACCOUNTANT'),
  async (req: Request, res: Response) => {
    try {
      const { month, year } = req.params
      const m = Number(month)
      const y = Number(year)

      const payrollRecords = await prisma.payroll.findMany({
        where: { month: m, year: y },
        include: {
          employee: {
            select: {
              name: true,
              nameAr: true,
              employeeId: true,
              department: true,
              project: {
                select: { name: true, nameAr: true, code: true },
              },
            },
          },
        },
      })

      const summary = {
        totalEmployees: payrollRecords.length,
        totalBasicSalary: payrollRecords.reduce((sum, p) => sum + p.basicSalary, 0),
        totalHousing: payrollRecords.reduce((sum, p) => sum + (p.housing || 0), 0),
        totalTransportation: payrollRecords.reduce((sum, p) => sum + (p.transportation || 0), 0),
        totalOvertime: payrollRecords.reduce((sum, p) => sum + (p.overtime || 0), 0),
        totalDeductions: payrollRecords.reduce((sum, p) => sum + (p.deductions || 0), 0),
        totalBonuses: payrollRecords.reduce((sum, p) => sum + (p.bonuses || 0), 0),
        totalNetSalary: payrollRecords.reduce((sum, p) => sum + p.netSalary, 0),
        paidCount: payrollRecords.filter((p) => p.isPaid).length,
        unpaidCount: payrollRecords.filter((p) => !p.isPaid).length,
      }

      res.json({
        data: {
          summary,
          details: payrollRecords,
        },
      })
    } catch (error) {
      console.error('Get payroll summary error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// POST /api/employees/payroll - Create payroll record
employeesRouter.post(
  '/payroll',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ACCOUNTANT', 'HR'),
  async (req: Request, res: Response) => {
    try {
      const body = payrollSchema.parse(req.body)

      // Verify employee exists
      const employee = await prisma.employee.findFirst({
        where: { employeeId: body.employeeId },
      })

      if (!employee) {
        return res.status(404).json({
          error: {
            message: 'Employee not found',
            status: 404,
          },
        })
      }

      // Check if payroll already exists for this month/year
      const existing = await prisma.payroll.findFirst({
        where: {
          employeeId: employee.id,
          month: body.month,
          year: body.year,
        },
      })

      if (existing) {
        return res.status(409).json({
          error: {
            message: 'Payroll already exists for this month/year',
            status: 409,
          },
        })
      }

      // Calculate net salary
      const housing = body.housing ?? 0
      const transportation = body.transportation ?? 0
      const overtime = body.overtime ?? 0
      const deductions = body.deductions ?? 0
      const bonuses = body.bonuses ?? 0

      const netSalary = body.basicSalary + housing + transportation + overtime - deductions + bonuses

      const payroll = await prisma.payroll.create({
        data: {
          employeeId: employee.id,
          month: body.month,
          year: body.year,
          basicSalary: body.basicSalary,
          housing,
          transportation,
          overtime,
          deductions,
          bonuses,
          netSalary,
          paymentMethod: body.paymentMethod,
          notes: body.notes,
          isPaid: false,
        },
        include: {
          employee: {
            select: {
              name: true,
              nameAr: true,
              employeeId: true,
            },
          },
        },
      })

      res.status(201).json({
        message: 'Payroll created successfully',
        data: payroll,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            message: 'Validation error',
            details: error.errors,
            status: 400,
          },
        })
      }

      console.error('Create payroll error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// PUT /api/employees/payroll/:id - Update payroll
employeesRouter.put(
  '/payroll/:id',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ACCOUNTANT', 'HR'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const {
        basicSalary,
        housing,
        transportation,
        overtime,
        deductions,
        bonuses,
        paymentMethod,
        notes,
        isPaid,
      } = req.body

      // Recalculate net salary
      const netSalary = (basicSalary || 0) +
        (housing ?? 0) +
        (transportation ?? 0) +
        (overtime ?? 0) -
        (deductions ?? 0) +
        (bonuses ?? 0)

      const payroll = await prisma.payroll.update({
        where: { id },
        data: {
          ...(basicSalary !== undefined && { basicSalary }),
          ...(housing !== undefined && { housing }),
          ...(transportation !== undefined && { transportation }),
          ...(overtime !== undefined && { overtime }),
          ...(deductions !== undefined && { deductions }),
          ...(bonuses !== undefined && { bonuses }),
          netSalary,
          ...(paymentMethod !== undefined && { paymentMethod }),
          ...(notes !== undefined && { notes }),
          ...(isPaid !== undefined && {
            isPaid,
            ...(isPaid === true && { paidAt: new Date() }),
          }),
        },
        include: {
          employee: {
            select: {
              name: true,
              nameAr: true,
              employeeId: true,
            },
          },
        },
      })

      res.json({
        message: 'Payroll updated successfully',
        data: payroll,
      })
    } catch (error) {
      console.error('Update payroll error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// ============================================================================
// DELETE /api/employees/:id - Delete employee
// ============================================================================
employeesRouter.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'HR'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const employee = await prisma.employee.findUnique({
        where: { id },
      })

      if (!employee) {
        return res.status(404).json({
          error: {
            message: 'Employee not found',
            status: 404,
          },
        })
      }

      await prisma.employee.delete({
        where: { id },
      })

      res.json({
        message: 'Employee deleted successfully',
      })
    } catch (error) {
      console.error('Delete employee error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// ============================================================================
// ATTENDANCE
// ============================================================================

// GET /api/employees/:id/attendance - Get employee attendance
employeesRouter.get('/:id/attendance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { month, year } = req.query

    const where: any = { employeeId: id }

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1)
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59)

      where.date = { gte: startDate, lte: endDate }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    })

    res.json({
      data: attendance,
    })
  } catch (error) {
    console.error('Get attendance error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// POST /api/attendance - Create attendance record
employeesRouter.post(
  '/attendance',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'HR'),
  async (req: Request, res: Response) => {
    try {
      const body = attendanceSchema.parse(req.body)

      // Verify employee exists
      const employee = await prisma.employee.findUnique({
        where: { employeeId: body.employeeId },
      })

      if (!employee) {
        return res.status(404).json({
          error: {
            message: 'Employee not found',
            status: 404,
          },
        })
      }

      // Check if attendance already exists for this date
      const existing = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          date: body.date,
        },
      })

      if (existing) {
        return res.status(409).json({
          error: {
            message: 'Attendance already recorded for this date',
            status: 409,
          },
        })
      }

      const attendance = await prisma.attendance.create({
        data: {
          ...body,
          employeeId: employee.id,
          status: body.status ?? 'PRESENT',
          workHours: body.checkIn && body.checkOut
            ? calculateWorkHours(body.checkIn, body.checkOut)
            : null,
        },
      })

      res.status(201).json({
        message: 'Attendance recorded successfully',
        data: attendance,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            message: 'Validation error',
            details: error.errors,
            status: 400,
          },
        })
      }

      console.error('Create attendance error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// PUT /api/attendance/:id - Update attendance
employeesRouter.put(
  '/attendance/:id',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'HR'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const body = updateAttendanceSchema.parse(req.body)

      let workHours: number | null = null
      if (body.checkIn && body.checkOut) {
        workHours = calculateWorkHours(body.checkIn, body.checkOut)
      } else if (body.checkIn || body.checkOut) {
        const attendance = await prisma.attendance.findUnique({ where: { id } })
        if (attendance) {
          const checkIn = body.checkIn ?? attendance.checkIn
          const checkOut = body.checkOut ?? attendance.checkOut
          if (checkIn && checkOut) {
            workHours = calculateWorkHours(checkIn, checkOut)
          }
        }
      }

      const attendance = await prisma.attendance.update({
        where: { id },
        data: {
          ...body,
          ...(workHours !== null && { workHours }),
        },
      })

      res.json({
        message: 'Attendance updated successfully',
        data: attendance,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            message: 'Validation error',
            details: error.errors,
            status: 400,
          },
        })
      }

      console.error('Update attendance error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// Helper function to calculate work hours
function calculateWorkHours(checkIn: string, checkOut: string): number {
  const inTime = new Date(`2000-01-01T${checkIn}`)
  const outTime = new Date(`2000-01-01T${checkOut}`)
  return (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60)
}
