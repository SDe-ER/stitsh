import { Router } from 'express'
import { dashboardController } from '@/controllers/dashboard.controller.js'
import { authMiddleware } from '@/middleware/auth.js'

export const dashboardRouter = Router()

// All dashboard routes require authentication
dashboardRouter.use(authMiddleware)

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
dashboardRouter.get('/stats', dashboardController.getStats.bind(dashboardController))

/**
 * @route   GET /api/dashboard/alerts
 * @desc    Get alerts
 * @access  Private
 */
dashboardRouter.get('/alerts', dashboardController.getAlerts.bind(dashboardController))

/**
 * @route   GET /api/dashboard/charts
 * @desc    Get charts data
 * @access  Private
 */
dashboardRouter.get('/charts', dashboardController.getCharts.bind(dashboardController))
