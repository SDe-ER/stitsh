import { Router, type Request, type Response } from 'express'
import { prisma } from '@/lib/prisma.js'
import { authMiddleware, requireRole } from '@/middleware/auth.js'

export const projectsDocumentsRouter = Router()

// ============================================================================
// PROJECT DOCUMENTS
// ============================================================================

// GET /api/projects/:id/documents - Get project documents
projectsDocumentsRouter.get('/:id/documents', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { type, tag } = req.query

    const where: any = { projectId: id }
    if (type) where.type = type as string
    if (tag) where.tags = { has: tag as string }

    const documents = await prisma.projectDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
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
      data: documents,
    })
  } catch (error) {
    console.error('Get documents error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// POST /api/projects/:id/documents - Upload document
projectsDocumentsRouter.post(
  '/:id/documents',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = req.user?.userId || 'unknown'

      // Handle file upload
      const { name, nameAr, type, description, tags, fileUrl, fileName, fileSize, mimeType } = req.body

      const document = await prisma.projectDocument.create({
        data: {
          projectId: id,
          name,
          nameAr,
          type,
          description,
          tags: tags || [],
          fileUrl,
          fileName,
          fileSize: fileSize ? parseInt(fileSize) : null,
          mimeType,
          uploadedBy: userId,
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              email: true,
            },
          },
        },
      })

      res.status(201).json({
        message: 'Document uploaded successfully',
        data: document,
      })
    } catch (error) {
      console.error('Upload document error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// DELETE /api/projects/:id/documents/:documentId - Delete document
projectsDocumentsRouter.delete(
  '/:id/documents/:documentId',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER'),
  async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params

      await prisma.projectDocument.delete({
        where: { id: documentId },
      })

      res.json({
        message: 'Document deleted successfully',
      })
    } catch (error) {
      console.error('Delete document error:', error)
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
// PROJECT DAILY LOGS
// ============================================================================

// GET /api/projects/:id/daily-logs - Get daily logs
projectsDocumentsRouter.get('/:id/daily-logs', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { startDate, endDate, shift } = req.query

    const where: any = { projectId: id }
    if (startDate || endDate) {
      where.logDate = {}
      if (startDate) where.logDate.gte = new Date(startDate as string)
      if (endDate) where.logDate.lte = new Date(endDate as string)
    }
    if (shift) where.shift = shift as string

    const logs = await prisma.projectDailyLog.findMany({
      where,
      orderBy: { logDate: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            nameAr: true,
          },
        },
        activities: true,
        equipment: true,
      },
    })

    res.json({
      data: logs,
    })
  } catch (error) {
    console.error('Get daily logs error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// POST /api/projects/:id/daily-logs - Create daily log
projectsDocumentsRouter.post(
  '/:id/daily-logs',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const userId = req.user?.userId || 'unknown'

      const { logDate, shift, weather, temperature, notes } = req.body

      const log = await prisma.projectDailyLog.create({
        data: {
          projectId: id,
          logDate: logDate ? new Date(logDate) : new Date(),
          shift,
          weather,
          temperature,
          notes,
          createdBy: userId,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              nameAr: true,
            },
          },
        },
      })

      res.status(201).json({
        message: 'Daily log created successfully',
        data: log,
      })
    } catch (error) {
      console.error('Create daily log error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// GET /api/projects/:id/daily-logs/:logId - Get single daily log
projectsDocumentsRouter.get('/:id/daily-logs/:logId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { logId } = req.params

    const log = await prisma.projectDailyLog.findUnique({
      where: { id: logId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            nameAr: true,
          },
        },
        activities: true,
        equipment: true,
      },
    })

    if (!log) {
      return res.status(404).json({
        error: {
          message: 'Daily log not found',
          status: 404,
        },
      })
    }

    res.json({
      data: log,
    })
  } catch (error) {
    console.error('Get daily log error:', error)
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
      },
    })
  }
})

// PUT /api/projects/:id/daily-logs/:logId - Update daily log
projectsDocumentsRouter.put(
  '/:id/daily-logs/:logId',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const { logId } = req.params
      const { logDate, shift, weather, temperature, notes } = req.body

      const log = await prisma.projectDailyLog.update({
        where: { id: logId },
        data: {
          ...(logDate !== undefined && { logDate: new Date(logDate) }),
          ...(shift !== undefined && { shift }),
          ...(weather !== undefined && { weather }),
          ...(temperature !== undefined && { temperature }),
          ...(notes !== undefined && { notes }),
        },
      })

      res.json({
        message: 'Daily log updated successfully',
        data: log,
      })
    } catch (error) {
      console.error('Update daily log error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// DELETE /api/projects/:id/daily-logs/:logId - Delete daily log
projectsDocumentsRouter.delete(
  '/:id/daily-logs/:logId',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER'),
  async (req: Request, res: Response) => {
    try {
      const { logId } = req.params

      await prisma.projectDailyLog.delete({
        where: { id: logId },
      })

      res.json({
        message: 'Daily log deleted successfully',
      })
    } catch (error) {
      console.error('Delete daily log error:', error)
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
// DAILY LOG ACTIVITIES
// ============================================================================

// POST /api/projects/:id/daily-logs/:logId/activities - Add activity
projectsDocumentsRouter.post(
  '/:id/daily-logs/:logId/activities',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const { logId } = req.params
      const { activityType, description, location, status, workerCount, hours } = req.body

      const activity = await prisma.projectDailyActivity.create({
        data: {
          logId,
          activityType,
          description,
          location,
          status,
          workerCount,
          hours,
        },
      })

      res.status(201).json({
        message: 'Activity added successfully',
        data: activity,
      })
    } catch (error) {
      console.error('Create activity error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// PUT /api/projects/:id/daily-logs/:logId/activities/:activityId - Update activity
projectsDocumentsRouter.put(
  '/:id/daily-logs/:logId/activities/:activityId',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const { activityId } = req.params
      const { activityType, description, location, status, workerCount, hours } = req.body

      const activity = await prisma.projectDailyActivity.update({
        where: { id: activityId },
        data: {
          ...(activityType !== undefined && { activityType }),
          ...(description !== undefined && { description }),
          ...(location !== undefined && { location }),
          ...(status !== undefined && { status }),
          ...(workerCount !== undefined && { workerCount }),
          ...(hours !== undefined && { hours }),
        },
      })

      res.json({
        message: 'Activity updated successfully',
        data: activity,
      })
    } catch (error) {
      console.error('Update activity error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// DELETE /api/projects/:id/daily-logs/:logId/activities/:activityId - Delete activity
projectsDocumentsRouter.delete(
  '/:id/daily-logs/:logId/activities/:activityId',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER'),
  async (req: Request, res: Response) => {
    try {
      const { activityId } = req.params

      await prisma.projectDailyActivity.delete({
        where: { id: activityId },
      })

      res.json({
        message: 'Activity deleted successfully',
      })
    } catch (error) {
      console.error('Delete activity error:', error)
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
// DAILY LOG EQUIPMENT
// ============================================================================

// POST /api/projects/:id/daily-logs/:logId/equipment - Add equipment
projectsDocumentsRouter.post(
  '/:id/daily-logs/:logId/equipment',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const { logId } = req.params
      const { equipmentId, operatorId, task, hours, status, fuelUsed } = req.body

      const equipment = await prisma.projectDailyEquipment.create({
        data: {
          logId,
          equipmentId,
          operatorId,
          task,
          hours,
          status,
          fuelUsed,
        },
      })

      res.status(201).json({
        message: 'Equipment added successfully',
        data: equipment,
      })
    } catch (error) {
      console.error('Add equipment error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// PUT /api/projects/:id/daily-logs/:logId/equipment/:eqId - Update equipment
projectsDocumentsRouter.put(
  '/:id/daily-logs/:logId/equipment/:eqId',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER', 'ENGINEER'),
  async (req: Request, res: Response) => {
    try {
      const { eqId } = req.params
      const { operatorId, task, hours, status, fuelUsed } = req.body

      const equipment = await prisma.projectDailyEquipment.update({
        where: { id: eqId },
        data: {
          ...(operatorId !== undefined && { operatorId }),
          ...(task !== undefined && { task }),
          ...(hours !== undefined && { hours }),
          ...(status !== undefined && { status }),
          ...(fuelUsed !== undefined && { fuelUsed }),
        },
      })

      res.json({
        message: 'Equipment updated successfully',
        data: equipment,
      })
    } catch (error) {
      console.error('Update equipment error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)

// DELETE /api/projects/:id/daily-logs/:logId/equipment/:eqId - Remove equipment
projectsDocumentsRouter.delete(
  '/:id/daily-logs/:logId/equipment/:eqId',
  authMiddleware,
  requireRole('ADMIN', 'MANAGER'),
  async (req: Request, res: Response) => {
    try {
      const { eqId } = req.params

      await prisma.projectDailyEquipment.delete({
        where: { id: eqId },
      })

      res.json({
        message: 'Equipment removed successfully',
      })
    } catch (error) {
      console.error('Remove equipment error:', error)
      res.status(500).json({
        error: {
          message: 'Internal server error',
          status: 500,
        },
      })
    }
  }
)
