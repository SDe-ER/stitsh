import { Router } from 'express'
import { equipmentController } from '@/controllers/equipment.controller.js'
import { authMiddleware, requireRole } from '@/middleware/auth.js'

export const equipmentRouter = Router()

// All equipment routes require authentication
equipmentRouter.use(authMiddleware)

/**
 * @route   GET /api/equipment
 * @desc    Get all equipment with filters
 * @access  Private
 */
equipmentRouter.get('/', equipmentController.getAllEquipment.bind(equipmentController))

/**
 * @route   GET /api/equipment/maintenance-due
 * @desc    Get equipment due for maintenance
 * @access  Private
 */
equipmentRouter.get(
  '/maintenance-due',
  equipmentController.getMaintenanceDue.bind(equipmentController)
)

/**
 * @route   GET /api/equipment/:id
 * @desc    Get equipment by ID
 * @access  Private
 */
equipmentRouter.get('/:id', equipmentController.getEquipmentById.bind(equipmentController))

/**
 * @route   POST /api/equipment
 * @desc    Create new equipment
 * @access  Private (Admin, Manager, Engineer)
 */
equipmentRouter.post(
  '/',
  requireRole('ADMIN', 'MANAGER', 'ENGINEER'),
  equipmentController.createEquipment.bind(equipmentController)
)

/**
 * @route   PUT /api/equipment/:id
 * @desc    Update equipment
 * @access  Private (Admin, Manager, Engineer)
 */
equipmentRouter.put(
  '/:id',
  requireRole('ADMIN', 'MANAGER', 'ENGINEER'),
  equipmentController.updateEquipment.bind(equipmentController)
)

/**
 * @route   DELETE /api/equipment/:id
 * @desc    Delete equipment
 * @access  Private (Admin, Manager)
 */
equipmentRouter.delete(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  equipmentController.deleteEquipment.bind(equipmentController)
)

/**
 * @route   GET /api/equipment/:equipmentId/maintenance
 * @desc    Get maintenance records for equipment
 * @access  Private
 */
equipmentRouter.get(
  '/:equipmentId/maintenance',
  equipmentController.getMaintenanceRecords.bind(equipmentController)
)

/**
 * @route   POST /api/equipment/:equipmentId/maintenance
 * @desc    Create maintenance record
 * @access  Private (Admin, Manager, Engineer)
 */
equipmentRouter.post(
  '/:equipmentId/maintenance',
  requireRole('ADMIN', 'MANAGER', 'ENGINEER'),
  equipmentController.createMaintenanceRecord.bind(equipmentController)
)
