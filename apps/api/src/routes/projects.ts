import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import { prisma } from '@/lib/prisma.js'
import { authMiddleware, requireRole } from '@/middleware/auth.js'
import {
  projectSchema,
  updateProjectSchema,
  projectMilestoneSchema,
  updateMilestoneSchema,
  projectQuerySchema,
} from '@/validators/project.validator.js'

export const projectsRouter = Router()

// ============================================================================
// GET /api/projects - List all projects with filters
// ============================================================================
projectsRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const query = projectQuerySchema.parse(req.query)
    const {
      status,
      clientId,
      managerId,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query

    const skip = (page - 1) * limit

    const where: any = {}

    if (status) where.status = status
    if (clientId) where.clientId = clientId
    if (managerId) where.managerId = managerId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search } },
        { code: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              contactPerson: true,
              phone: true,
            },
          },
          manager: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              email: true,
              phone: true,
            },
          },
          financial: {
            select: {
              revenue: true,
              expenses: true,
              profit: true,
              profitMargin: true,
              pendingPayments: true,
            },
          },
          _count: {
            select: {
              milestones: true,
              employees: true,
              equipment: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ])

    res.json({
      data: projects,
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

    console.error('List projects error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// ============================================================================
// GET /api/projects/stats - Get projects statistics
// ============================================================================
projectsRouter.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalBudget,
      totalRevenue,
      totalExpenses,
      totalProfit,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.project.count({ where: { status: 'ON_HOLD' } }),
      prisma.project.aggregate({ _sum: { budget: true } }),
      prisma.projectFinancial.aggregate({ _sum: { revenue: true } }),
      prisma.projectFinancial.aggregate({ _sum: { expenses: true } }),
      prisma.projectFinancial.aggregate({ _sum: { profit: true } }),
    ])

    // Recent projects
    const recentProjects = await prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, nameAr: true } },
      },
    })

    // Projects by status
    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    res.json({
      data: {
        overview: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          onHold: onHoldProjects,
          planning: totalProjects - activeProjects - completedProjects - onHoldProjects,
        },
        financial: {
          totalBudget: totalBudget._sum.budget || 0,
          totalRevenue: totalRevenue._sum.revenue || 0,
          totalExpenses: totalExpenses._sum.expenses || 0,
          totalProfit: totalProfit._sum.profit || 0,
        },
        byStatus: projectsByStatus.map((s) => ({
          status: s.status,
          count: s._count.status,
        })),
        recentProjects,
      },
    })
  } catch (error) {
    console.error('Get projects stats error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// ============================================================================
// GET /api/projects/:id - Get project by ID
// ============================================================================
projectsRouter.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        manager: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            email: true,
            phone: true,
          },
        },
        financial: true,
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        employees: {
          include: {
            _count: {
              select: {
                attendance: true,
                payroll: true,
              },
            },
          },
        },
        equipment: {
          include: {
            _count: {
              select: {
                maintenanceRecords: true,
              },
            },
          },
        },
        invoices: {
          orderBy: { issueDate: 'desc' },
          take: 10,
        },
        expenses: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    })

    if (!project) {
      return res.status(404).json({
        error: {
          message: 'Project not found',
          status: 404,
        },
      })
    }

    // Calculate milestones progress
    const completedMilestones = project.milestones.filter((m) => m.isCompleted).length
    const milestoneProgress = project.milestones.length > 0
      ? Math.round((completedMilestones / project.milestones.length) * 100)
      : 0

    res.json({
      data: {
        ...project,
        milestoneProgress,
        completedMilestones,
        totalMilestones: project.milestones.length,
      },
    })
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// ============================================================================
// POST /api/projects - Create new project
// ============================================================================
projectsRouter.post(
  '/',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER'),
  async (req: Request, res: Response) => {
    try {
      const body = projectSchema.parse(req.body)

      // Check if code is unique
      const existing = await prisma.project.findUnique({
        where: { code: body.code },
      })

      if (existing) {
        return res.status(409).json({
          error: {
            message: 'Project code already exists',
            status: 409,
          },
        })
      }

      // Verify client exists
      const client = await prisma.client.findUnique({
        where: { id: body.clientId },
      })

      if (!client) {
        return res.status(404).json({
          error: {
            message: 'Client not found',
            status: 404,
          },
        })
      }

      // If managerId provided, verify user exists and has appropriate role
      if (body.managerId) {
        const manager = await prisma.user.findUnique({
          where: { id: body.managerId },
        })

        if (!manager) {
          return res.status(404).json({
            error: {
              message: 'Manager not found',
              status: 404,
            },
          })
        }
      }

      const project = await prisma.project.create({
        data: {
          ...body,
          progressPercent: body.progressPercent ?? 0,
          retention: body.retention ?? 0.05,
        },
        include: {
          client: true,
          manager: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              email: true,
            },
          },
        },
      })

      // Create initial financial record
      await prisma.projectFinancial.create({
        data: {
          projectId: project.id,
          revenue: 0,
          expenses: 0,
          profit: 0,
          pendingPayments: 0,
          collectedAmount: 0,
        },
      })

      res.status(201).json({
        message: 'Project created successfully',
        data: project,
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

      console.error('Create project error:', error)
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
// PUT /api/projects/:id - Update project
// ============================================================================
projectsRouter.put(
  '/:id',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const body = updateProjectSchema.parse(req.body)

      // Check if project exists
      const existing = await prisma.project.findUnique({
        where: { id },
      })

      if (!existing) {
        return res.status(404).json({
          error: {
            message: 'Project not found',
            status: 404,
          },
        })
      }

      // If code is being changed, check uniqueness
      if (body.code && body.code !== existing.code) {
        const codeExists = await prisma.project.findUnique({
          where: { code: body.code },
        })

        if (codeExists) {
          return res.status(409).json({
            error: {
              message: 'Project code already exists',
              status: 409,
            },
          })
        }
      }

      // Verify client if changing
      if (body.clientId && body.clientId !== existing.clientId) {
        const client = await prisma.client.findUnique({
          where: { id: body.clientId },
        })

        if (!client) {
          return res.status(404).json({
            error: {
              message: 'Client not found',
              status: 404,
            },
          })
        }
      }

      const project = await prisma.project.update({
        where: { id },
        data: body,
        include: {
          client: true,
          manager: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              email: true,
            },
          },
        },
      })

      res.json({
        message: 'Project updated successfully',
        data: project,
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

      console.error('Update project error:', error)
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
// DELETE /api/projects/:id - Delete project
// ============================================================================
projectsRouter.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const project = await prisma.project.findUnique({
        where: { id },
      })

      if (!project) {
        return res.status(404).json({
          error: {
            message: 'Project not found',
            status: 404,
          },
        })
      }

      // Check if project has active invoices or expenses
      const [invoicesCount, expensesCount] = await Promise.all([
        prisma.invoice.count({ where: { projectId: id, status: { not: 'PAID' } } }),
        prisma.expense.count({ where: { projectId: id } }),
      ])

      if (invoicesCount > 0) {
        return res.status(409).json({
          error: {
            message: 'Cannot delete project with unpaid invoices',
            status: 409,
          },
        })
      }

      await prisma.project.delete({
        where: { id },
      })

      res.json({
        message: 'Project deleted successfully',
      })
    } catch (error) {
      console.error('Delete project error:', error)
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
// MILESTONES
// ============================================================================

// GET /api/projects/:id/milestones - Get project milestones
projectsRouter.get('/:id/milestones', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const milestones = await prisma.projectMilestone.findMany({
      where: { projectId: id },
      orderBy: { dueDate: 'asc' },
    })

    res.json({
      data: milestones,
    })
  } catch (error) {
    console.error('Get milestones error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// POST /api/projects/:id/milestones - Create milestone
projectsRouter.post(
  '/:id/milestones',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const body = projectMilestoneSchema.parse(req.body)

      // Verify project exists
      const project = await prisma.project.findUnique({
        where: { id },
      })

      if (!project) {
        return res.status(404).json({
          error: {
            message: 'Project not found',
            status: 404,
          },
        })
      }

      const milestone = await prisma.projectMilestone.create({
        data: {
          ...body,
          projectId: id,
          isCompleted: false,
          progress: body.progress ?? 0,
        },
      })

      res.status(201).json({
        message: 'Milestone created successfully',
        data: milestone,
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

      console.error('Create milestone error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// PUT /api/projects/:id/milestones/:milestoneId - Update milestone
projectsRouter.put(
  '/:id/milestones/:milestoneId',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const { milestoneId } = req.params
      const body = updateMilestoneSchema.parse(req.body)

      const milestone = await prisma.projectMilestone.update({
        where: { id: milestoneId },
        data: {
          ...body,
          completedAt: body.isCompleted && body.isCompleted === true ? new Date() : null,
        },
      })

      // Update project progress if milestone completed
      if (body.isCompleted === true) {
        const allMilestones = await prisma.projectMilestone.findMany({
          where: { projectId: milestone.projectId },
        })

        const completed = allMilestones.filter((m) => m.isCompleted).length
        const progress = Math.round((completed / allMilestones.length) * 100)

        await prisma.project.update({
          where: { id: milestone.projectId },
          data: { progressPercent: progress },
        })
      }

      res.json({
        message: 'Milestone updated successfully',
        data: milestone,
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

      console.error('Update milestone error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// DELETE /api/projects/:id/milestones/:milestoneId - Delete milestone
projectsRouter.delete(
  '/:id/milestones/:milestoneId',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER'),
  async (req: Request, res: Response) => {
    try {
      const { milestoneId } = req.params

      await prisma.projectMilestone.delete({
        where: { id: milestoneId },
      })

      res.json({
        message: 'Milestone deleted successfully',
      })
    } catch (error) {
      console.error('Delete milestone error:', error)
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
// FINANCIALS
// ============================================================================

// GET /api/projects/:id/financial - Get project financial details
projectsRouter.get('/:id/financial', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    let financial = await prisma.projectFinancial.findUnique({
      where: { projectId: id },
    })

    if (!financial) {
      // Create financial record if it doesn't exist
      financial = await prisma.projectFinancial.create({
        data: {
          projectId: id,
          revenue: 0,
          expenses: 0,
          profit: 0,
          pendingPayments: 0,
          collectedAmount: 0,
        },
      })
    }

    res.json({
      data: financial,
    })
  } catch (error) {
    console.error('Get financial error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// PUT /api/projects/:id/financial - Update project financial
projectsRouter.put(
  '/:id/financial',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ACCOUNTANT'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { revenue, expenses, pendingPayments, collectedAmount } = req.body

      const profit = (revenue || 0) - (expenses || 0)
      const project = await prisma.project.findUnique({
        where: { id },
        select: { budget: true },
      })

      const profitMargin = project?.budget && project.budget > 0
        ? (profit / project.budget) * 100
        : 0

      const financial = await prisma.projectFinancial.upsert({
        where: { projectId: id },
        update: {
          ...(revenue !== undefined && { revenue }),
          ...(expenses !== undefined && { expenses }),
          profit,
          profitMargin,
          ...(pendingPayments !== undefined && { pendingPayments }),
          ...(collectedAmount !== undefined && { collectedAmount }),
        },
        create: {
          projectId: id,
          revenue: revenue || 0,
          expenses: expenses || 0,
          profit,
          profitMargin,
          pendingPayments: pendingPayments || 0,
          collectedAmount: collectedAmount || 0,
        },
      })

      res.json({
        message: 'Financial updated successfully',
        data: financial,
      })
    } catch (error) {
      console.error('Update financial error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)
