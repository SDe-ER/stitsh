import { Request, Response } from 'express'
import { reportsService } from '@/services/reports.service.js'
import {
  runReportSchema,
  exportReportSchema,
  reportQuerySchema,
  reportRunQuerySchema,
} from '@/validators/reports.validator.js'

// ============================================================================
// REPORTS CONTROLLER
// ============================================================================

export class ReportsController {
  /**
   * GET /api/reports
   * Get all report definitions
   */
  async getReportDefinitions(req: Request, res: Response) {
    try {
      const query = reportQuerySchema.parse(req.query)
      const result = await reportsService.getReportDefinitions(query)

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

      console.error('Get report definitions error:', error)
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
   * GET /api/reports/types/:type
   * Get report definition by type
   */
  async getReportDefinitionByType(req: Request, res: Response) {
    try {
      const { type } = req.params
      const report = await reportsService.getReportDefinitionByType(type)

      res.json({
        success: true,
        data: report,
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

      console.error('Get report definition error:', error)
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
   * POST /api/reports/run
   * Run a report
   */
  async runReport(req: Request, res: Response) {
    try {
      const body = runReportSchema.parse(req.body)
      const userId = req.user?.id || 'unknown'

      const run = await reportsService.runReport(userId, body)

      res.status(201).json({
        success: true,
        message: 'جاري تشغيل التقرير - Report is being generated',
        data: run,
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

      console.error('Run report error:', error)
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
   * GET /api/reports/runs
   * Get report runs
   */
  async getReportRuns(req: Request, res: Response) {
    try {
      const query = reportRunQuerySchema.parse(req.query)
      const result = await reportsService.getReportRuns(query)

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

      console.error('Get report runs error:', error)
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
   * GET /api/reports/runs/:id
   * Get report run by ID
   */
  async getReportRunById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const run = await reportsService.getReportRunById(id)

      res.json({
        success: true,
        data: run,
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

      console.error('Get report run error:', error)
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
   * POST /api/reports/:runId/export
   * Export a report
   */
  async exportReport(req: Request, res: Response) {
    try {
      const { runId } = req.params
      const body = exportReportSchema.parse({ ...req.body, runId })
      const userId = req.user?.id || 'unknown'

      const exportRecord = await reportsService.exportReport(userId, body)

      res.status(201).json({
        success: true,
        message: 'تم إنشاء التصدير بنجاح - Export created successfully',
        data: exportRecord,
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

      console.error('Export report error:', error)
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
   * GET /api/reports/exports/:id
   * Get export by ID
   */
  async getExportById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const exportRecord = await reportsService.getExportById(id)

      res.json({
        success: true,
        data: exportRecord,
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

      console.error('Get export error:', error)
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
   * GET /api/reports/vat-summary
   * Get VAT summary (quick access)
   */
  async getVATSummary(req: Request, res: Response) {
    try {
      const data = await reportsService.fetchReportData('VAT_SUMMARY', {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Current month start
        endDate: new Date(),
      })

      res.json({
        success: true,
        data,
      })
    } catch (error: any) {
      console.error('Get VAT summary error:', error)
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

export const reportsController = new ReportsController()
