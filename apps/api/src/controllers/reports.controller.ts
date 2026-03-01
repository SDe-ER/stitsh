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
      const userId = req.user?.userId || 'unknown'

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
      const userId = req.user?.userId || 'unknown'

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
   * GET /api/reports/runs/:runId/preview
   * Get preview data for a report run
   */
  async getReportPreview(req: Request, res: Response) {
    try {
      const { runId } = req.params
      const preview = await reportsService.getReportPreview(runId)

      res.json({
        success: true,
        data: preview,
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

      console.error('Get report preview error:', error)
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
   * GET /api/reports/runs/:runId/exports
   * List all exports for a report run
   */
  async getReportExports(req: Request, res: Response) {
    try {
      const { runId } = req.params
      const exports = await reportsService.getReportExports(runId)

      res.json({
        success: true,
        data: exports,
      })
    } catch (error: any) {
      console.error('Get report exports error:', error)
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
   * GET /api/reports/exports/:exportId/download
   * Download or preview an exported file
   */
  async downloadExport(req: Request, res: Response) {
    try {
      const { exportId } = req.params
      const { file, fileName, mimeType } = await reportsService.getExportFile(exportId)

      // Set appropriate headers for download or inline preview
      const isPdf = mimeType === 'application/pdf'
      const disposition = isPdf && req.query.inline === '1' ? 'inline' : 'attachment'

      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(fileName)}"`)

      // Send file (buffer or stream)
      if (Buffer.isBuffer(file)) {
        res.send(file)
      } else {
        // @ts-ignore - file might be a stream
        file.pipe(res)
      }
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

      console.error('Download export error:', error)
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
