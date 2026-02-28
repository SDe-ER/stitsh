import { Request, Response } from 'express'
import { suppliersService } from '@/services/suppliers.service.js'
import {
  createClientSchema,
  updateClientSchema,
  clientQuerySchema,
  createSupplierSchema,
  updateSupplierSchema,
  supplierQuerySchema,
} from '@/validators/supplier.validator.js'

// ============================================================================
// SUPPLIERS & CLIENTS CONTROLLER
// ============================================================================

export class SuppliersController {
  // ============================================================================
  // CLIENT METHODS
  // ============================================================================

  /**
   * GET /api/suppliers/clients
   * Get all clients
   */
  async getAllClients(req: Request, res: Response) {
    try {
      const query = clientQuerySchema.parse(req.query)
      const result = await suppliersService.getAllClients(query)

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

      console.error('Get all clients error:', error)
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
   * GET /api/suppliers/clients/:id
   * Get client by ID
   */
  async getClientById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const client = await suppliersService.getClientById(id)

      res.json({
        success: true,
        data: client,
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

      console.error('Get client by ID error:', error)
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
   * POST /api/suppliers/clients
   * Create new client
   */
  async createClient(req: Request, res: Response) {
    try {
      const body = createClientSchema.parse(req.body)
      const client = await suppliersService.createClient(body)

      res.status(201).json({
        success: true,
        message: 'تم إضافة العميل بنجاح - Client created successfully',
        data: client,
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

      console.error('Create client error:', error)
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
   * PUT /api/suppliers/clients/:id
   * Update client
   */
  async updateClient(req: Request, res: Response) {
    try {
      const { id } = req.params
      const body = updateClientSchema.parse({ ...req.body, id })
      const client = await suppliersService.updateClient(body)

      res.json({
        success: true,
        message: 'تم تحديث العميل بنجاح - Client updated successfully',
        data: client,
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

      console.error('Update client error:', error)
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
   * DELETE /api/suppliers/clients/:id
   * Delete client
   */
  async deleteClient(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await suppliersService.deleteClient(id)

      res.json({
        success: true,
        ...result,
      })
    } catch (error: any) {
      if (error.name === 'NotFoundError' || error.name === 'ConflictError') {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.name.replace('Error', '').toUpperCase(),
          },
        })
      }

      console.error('Delete client error:', error)
      res.status(500).json({
        success: false,
        error: {
          message: 'خطأ في الخادم - Internal server error',
          code: 'INTERNAL_ERROR',
        },
      })
    }
  }

  // ============================================================================
  // SUPPLIER METHODS
  // ============================================================================

  /**
   * GET /api/suppliers/suppliers
   * Get all suppliers
   */
  async getAllSuppliers(req: Request, res: Response) {
    try {
      const query = supplierQuerySchema.parse(req.query)
      const result = await suppliersService.getAllSuppliers(query)

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

      console.error('Get all suppliers error:', error)
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
   * GET /api/suppliers/suppliers/:id
   * Get supplier by ID
   */
  async getSupplierById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const supplier = await suppliersService.getSupplierById(id)

      res.json({
        success: true,
        data: supplier,
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

      console.error('Get supplier by ID error:', error)
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
   * POST /api/suppliers/suppliers
   * Create new supplier
   */
  async createSupplier(req: Request, res: Response) {
    try {
      const body = createSupplierSchema.parse(req.body)
      const supplier = await suppliersService.createSupplier(body)

      res.status(201).json({
        success: true,
        message: 'تم إضافة المورد بنجاح - Supplier created successfully',
        data: supplier,
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

      console.error('Create supplier error:', error)
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
   * PUT /api/suppliers/suppliers/:id
   * Update supplier
   */
  async updateSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params
      const body = updateSupplierSchema.parse({ ...req.body, id })
      const supplier = await suppliersService.updateSupplier(body)

      res.json({
        success: true,
        message: 'تم تحديث المورد بنجاح - Supplier updated successfully',
        data: supplier,
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

      console.error('Update supplier error:', error)
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
   * DELETE /api/suppliers/suppliers/:id
   * Delete supplier
   */
  async deleteSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params
      const result = await suppliersService.deleteSupplier(id)

      res.json({
        success: true,
        ...result,
      })
    } catch (error: any) {
      if (error.name === 'NotFoundError' || error.name === 'ConflictError') {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.name.replace('Error', '').toUpperCase(),
          },
        })
      }

      console.error('Delete supplier error:', error)
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
   * GET /api/suppliers/stats
   * Get supplier statistics
   */
  async getSupplierStats(req: Request, res: Response) {
    try {
      const stats = await suppliersService.getSupplierStats()

      res.json({
        success: true,
        data: stats,
      })
    } catch (error: any) {
      console.error('Get supplier stats error:', error)
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
export const suppliersController = new SuppliersController()
