import { Router } from 'express'
import { suppliersController } from '@/controllers/suppliers.controller.js'
import { authMiddleware, requireRole } from '@/middleware/auth.js'

export const suppliersRouter = Router()

// All suppliers routes require authentication
suppliersRouter.use(authMiddleware)

// ============================================================================
// CLIENT ROUTES
// ============================================================================

/**
 * @route   GET /api/suppliers/clients
 * @desc    Get all clients
 * @access  Private
 */
suppliersRouter.get('/clients', suppliersController.getAllClients.bind(suppliersController))

/**
 * @route   GET /api/suppliers/clients/:id
 * @desc    Get client by ID
 * @access  Private
 */
suppliersRouter.get('/clients/:id', suppliersController.getClientById.bind(suppliersController))

/**
 * @route   POST /api/suppliers/clients
 * @desc    Create new client
 * @access  Private (Admin, Manager)
 */
suppliersRouter.post(
  '/clients',
  requireRole('ADMIN', 'MANAGER'),
  suppliersController.createClient.bind(suppliersController)
)

/**
 * @route   PUT /api/suppliers/clients/:id
 * @desc    Update client
 * @access  Private (Admin, Manager)
 */
suppliersRouter.put(
  '/clients/:id',
  requireRole('ADMIN', 'MANAGER'),
  suppliersController.updateClient.bind(suppliersController)
)

/**
 * @route   DELETE /api/suppliers/clients/:id
 * @desc    Delete client
 * @access  Private (Admin)
 */
suppliersRouter.delete(
  '/clients/:id',
  requireRole('ADMIN'),
  suppliersController.deleteClient.bind(suppliersController)
)

// ============================================================================
// SUPPLIER ROUTES
// ============================================================================

/**
 * @route   GET /api/suppliers/suppliers
 * @desc    Get all suppliers
 * @access  Private
 */
suppliersRouter.get(
  '/suppliers',
  suppliersController.getAllSuppliers.bind(suppliersController)
)

/**
 * @route   GET /api/suppliers/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Private
 */
suppliersRouter.get(
  '/suppliers/:id',
  suppliersController.getSupplierById.bind(suppliersController)
)

/**
 * @route   POST /api/suppliers/suppliers
 * @desc    Create new supplier
 * @access  Private (Admin, Manager)
 */
suppliersRouter.post(
  '/suppliers',
  requireRole('ADMIN', 'MANAGER'),
  suppliersController.createSupplier.bind(suppliersController)
)

/**
 * @route   PUT /api/suppliers/suppliers/:id
 * @desc    Update supplier
 * @access  Private (Admin, Manager)
 */
suppliersRouter.put(
  '/suppliers/:id',
  requireRole('ADMIN', 'MANAGER'),
  suppliersController.updateSupplier.bind(suppliersController)
)

/**
 * @route   DELETE /api/suppliers/suppliers/:id
 * @desc    Delete supplier
 * @access  Private (Admin)
 */
suppliersRouter.delete(
  '/suppliers/:id',
  requireRole('ADMIN'),
  suppliersController.deleteSupplier.bind(suppliersController)
)

/**
 * @route   GET /api/suppliers/stats
 * @desc    Get supplier statistics
 * @access  Private
 */
suppliersRouter.get('/stats', suppliersController.getSupplierStats.bind(suppliersController))
