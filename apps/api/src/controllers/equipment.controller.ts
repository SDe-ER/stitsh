import { Request, Response } from 'express'
import { equipmentService } from '@/services/equipment.service.js'
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  equipmentQuerySchema,
  createMaintenanceRecordSchema,
  updateMaintenanceRecordSchema,
} from '@/validators/equipment.validator.js'

// ============================================================================
// EQUIPMENT CONTROLLER
// ============================================================================

export class EquipmentController {
  /**
   * GET /api/equipment
   * Get all equipment
   */
  async getAllEquipment(req: Request, res: Response) {
    try {
      const query = equipmentQuerySchema.parse(req.query)
      const result = await equipmentService.getAllEquipment(query)

      res.json({
        success: true,
        ...result,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'خطأ في التحقق من البيانات - Validation error',
            details: error.errors,
            code: 'VALIDATION_ERROR',
          },
        })
      }

      console.error('Get all equipment error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * GET /api/equipment/:id
   * Get equipment by ID
   */
  async getEquipmentById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const equipment = await equipmentService.getEquipmentById(id)

      res.json({
        success: true,
        data: equipment,
      })
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        })
      }

      console.error('Get equipment by ID error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * POST /api/equipment
   * Create new equipment
   */
  async createEquipment(req: Request, res: Response) {
    try {
      const body = createEquipmentSchema.parse(req.body)
      const equipment = await equipmentService.createEquipment(body)

      res.status(201).json({
        success: true,
        message: 'تم إضافة المعدة بنجاح - Equipment created successfully',
        data: equipment,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'خطأ في التحقق من البيانات - Validation error',
            details: error.errors,
            code: 'VALIDATION_ERROR',
          },
        })
      }

      if (error.name === 'ConflictError' || error.name === 'NotFoundError') {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.name.replace('Error', '').toUpperCase(),
          },
        })
      }

      console.error('Create equipment error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * PUT /api/equipment/:id
   * Update equipment
   */
  async updateEquipment(req: Request, res: Response) {
    try {
      const { id } = req.params
      const body = updateEquipmentSchema.parse({ ...req.body, id })
      const equipment = await equipmentService.updateEquipment(body)

      res.json({
        success: true,
        message: 'تم تحديث المعدة بنجاح - Equipment updated successfully',
        data: equipment,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'خطأ في التحقق من البيانات - Validation error',
            details: error.errors,
            code: 'VALIDATION_ERROR',
          },
        })
      }

      if (error.name === 'ConflictError' || error.name === 'NotFoundError') {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.name.replace('Error', '').toUpperCase(),
          },
        })
      }

      console.error('Update equipment error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * DELETE /api/equipment/:id
   * Delete equipment
   */
  async deleteEquipment(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await equipmentService.deleteEquipment(id)

      res.json({
        success: true,
        ...result,
      })
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        })
      }

      console.error('Delete equipment error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * GET /api/equipment/maintenance-due
   * Get equipment due for maintenance
   */
  async getMaintenanceDue(req: Request, res: Response) {
    try {
      const withinDays = parseInt(req.query.days as string) || 7
      const equipment = await equipmentService.getMaintenanceDue(withinDays)

      res.json({
        success: true,
        data: equipment,
      })
    } catch (error: any) {
      console.error('Get maintenance due error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * POST /api/equipment/:equipmentId/maintenance
   * Create maintenance record
   */
  async createMaintenanceRecord(req: Request, res: Response) {
    try {
      const { equipmentId } = req.params
      const body = createMaintenanceRecordSchema.parse({ ...req.body, equipmentId })
      const record = await equipmentService.createMaintenanceRecord(body)

      res.status(201).json({
        success: true,
        message: 'تم إضافة سجل الصيانة بنجاح - Maintenance record created successfully',
        data: record,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'خطأ في التحقق من البيانات - Validation error',
            details: error.errors,
            code: 'VALIDATION_ERROR',
          },
        })
      }

      if (error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
            code: 'NOT_FOUND',
          },
        })
      }

      console.error('Create maintenance record error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  /**
   * GET /api/equipment/:equipmentId/maintenance
   * Get maintenance records
   */
  async getMaintenanceRecords(req: Request, res: Response) {
    try {
      const { equipmentId } = req.params
      const records = await equipmentService.getMaintenanceRecords(equipmentId)

      res.json({
        success: true,
        data: records,
      })
    } catch (error: any) {
      console.error('Get maintenance records error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================
export const equipmentController = new EquipmentController()
