import { Router } from 'express'
import { reportsController } from '@/controllers/reports.controller.js'
import { authMiddleware } from '@/middleware/auth.js'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// ============================================================================
// REPORT DEFINITIONS
// ============================================================================

/**
 * @route   GET /api/reports
 * @desc    Get all report definitions
 * @access  Private
 */
router.get('/', reportsController.getReportDefinitions.bind(reportsController))

/**
 * @route   GET /api/reports/types/:type
 * @desc    Get report definition by type
 * @access  Private
 */
router.get('/types/:type', reportsController.getReportDefinitionByType.bind(reportsController))

/**
 * @route   GET /api/reports/vat-summary
 * @desc    Get VAT summary (quick access for dashboard)
 * @access  Private
 */
router.get('/vat-summary', reportsController.getVATSummary.bind(reportsController))

// ============================================================================
// REPORT RUNS
// ============================================================================

/**
 * @route   POST /api/reports/run
 * @desc    Run a report
 * @access  Private
 */
router.post('/run', reportsController.runReport.bind(reportsController))

/**
 * @route   GET /api/reports/runs
 * @desc    Get report runs
 * @access  Private
 */
router.get('/runs', reportsController.getReportRuns.bind(reportsController))

/**
 * @route   GET /api/reports/runs/:id
 * @desc    Get report run by ID
 * @access  Private
 */
router.get('/runs/:id', reportsController.getReportRunById.bind(reportsController))

/**
 * @route   GET /api/reports/runs/:runId/preview
 * @desc    Get preview data for a report run
 * @access  Private
 */
router.get('/runs/:runId/preview', reportsController.getReportPreview.bind(reportsController))

/**
 * @route   GET /api/reports/runs/:runId/exports
 * @desc    List all exports for a report run
 * @access  Private
 */
router.get('/runs/:runId/exports', reportsController.getReportExports.bind(reportsController))

// ============================================================================
// REPORT EXPORTS
// ============================================================================

/**
 * @route   POST /api/reports/:runId/export
 * @desc    Export a report
 * @access  Private
 */
router.post('/:runId/export', reportsController.exportReport.bind(reportsController))

/**
 * @route   GET /api/reports/exports/:id
 * @desc    Get export by ID
 * @access  Private
 */
router.get('/exports/:id', reportsController.getExportById.bind(reportsController))

/**
 * @route   GET /api/reports/exports/:exportId/download
 * @desc    Download or preview an exported file
 * @access  Private
 */
router.get('/exports/:exportId/download', reportsController.downloadExport.bind(reportsController))

export const reportsRouter = router
