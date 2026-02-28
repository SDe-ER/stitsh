import { Request, Response } from 'express'
import { dashboardService } from '@/services/dashboard.service.js'
import { dashboardStatsSchema, dashboardAlertsSchema, dashboardChartsSchema } from '@/validators/dashboard.validator.js'

// ============================================================================
// DASHBOARD CONTROLLER
// ============================================================================

export class DashboardController {
  /**
   * GET /api/dashboard/stats
   * Get dashboard statistics
   */
  async getStats(req: Request, res: Response) {
    try {
      const query = dashboardStatsSchema.parse(req.query)
      const stats = await dashboardService.getStats(query)

      res.json({
        success: true,
        data: stats,
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

      console.error('Dashboard stats error:', error)
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
   * GET /api/dashboard/alerts
   * Get alerts
   */
  async getAlerts(req: Request, res: Response) {
    try {
      const query = dashboardAlertsSchema.parse(req.query)
      const result = await dashboardService.getAlerts(query)

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

      console.error('Dashboard alerts error:', error)
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
   * GET /api/dashboard/charts
   * Get charts data
   */
  async getCharts(req: Request, res: Response) {
    try {
      const query = dashboardChartsSchema.parse(req.query)
      const charts = await dashboardService.getCharts(query)

      res.json({
        success: true,
        data: charts,
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

      console.error('Dashboard charts error:', error)
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
export const dashboardController = new DashboardController()
