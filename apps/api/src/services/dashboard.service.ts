import { prisma } from '@/lib/prisma.js'
import { DashboardStatsQuery, DashboardAlertsQuery, DashboardChartsQuery } from '@/validators/dashboard.validator.js'

// ============================================================================
// DASHBOARD SERVICE
// ============================================================================

export interface DashboardStats {
  overview: {
    totalProjects: number
    activeProjects: number
    totalEmployees: number
    activeEmployees: number
    totalEquipment: number
    activeEquipment: number
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    profitMargin: number
  }
  projectsByStatus: Array<{ status: string; count: number }>
  employeesByDepartment: Array<{ department: string; count: number }>
  equipmentByStatus: Array<{ status: string; count: number }>
  recentActivity: Array<{
    id: string
    type: string
    message: string
    createdAt: Date
  }>
}

export interface DashboardAlert {
  id: string
  type: string
  severity: string
  title: string
  titleAr: string | null
  message: string
  messageAr: string | null
  entityType: string | null
  entityId: string | null
  isResolved: boolean
  resolvedAt: Date | null
  createdAt: Date
}

export interface DashboardCharts {
  revenue: Array<{ month: string; amount: number }>
  expenses: Array<{ category: string; amount: number }>
  profit: Array<{ month: string; amount: number }>
  equipmentUsage: Array<{ name: string; usageHours: number }>
  projectProgress: Array<{ name: string; progress: number; status: string }>
  employeeAttendance: Array<{ month: string; presentDays: number; absentDays: number }>
}

export class DashboardService {
  // ============================================================================
  // GET DASHBOARD STATS
  // ============================================================================
  async getStats(query: DashboardStatsQuery): Promise<DashboardStats> {
    const now = new Date()
    let startDate = new Date(0)

    // Set date range based on period
    switch (query.period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      case 'all':
      default:
        startDate = new Date(0)
        break
    }

    // Get counts
    const [
      totalProjects,
      activeProjects,
      totalEmployees,
      activeEmployees,
      totalEquipment,
      activeEquipment,
      financialData,
      projectsByStatus,
      employeesByDepartment,
      equipmentByStatus,
      recentInvoices,
      recentExpenses,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.equipment.count(),
      prisma.equipment.count({ where: { status: 'ACTIVE' } }),
      this._getFinancialStats(startDate, now),
      prisma.project.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.employee.groupBy({
        by: ['department'],
        where: { status: 'ACTIVE' },
        _count: { department: true },
      }),
      prisma.equipment.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.invoice.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.expense.findMany({
        where: { date: { gte: startDate } },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          id: true,
          amount: true,
          category: true,
          description: true,
          date: true,
        },
      }),
    ])

    const totalRevenue = financialData.totalRevenue
    const totalExpenses = financialData.totalExpenses
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Build recent activity
    const recentActivity = [
      ...recentInvoices.map((inv) => ({
        id: inv.id,
        type: 'invoice',
        message: `Invoice ${inv.invoiceNumber} created - ${inv.amount} SAR`,
        createdAt: inv.createdAt,
      })),
      ...recentExpenses.map((exp) => ({
        id: exp.id,
        type: 'expense',
        message: `Expense ${exp.category} - ${exp.amount} SAR`,
        createdAt: exp.date,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10)

    return {
      overview: {
        totalProjects,
        activeProjects,
        totalEmployees,
        activeEmployees,
        totalEquipment,
        activeEquipment,
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin: Math.round(profitMargin * 100) / 100,
      },
      projectsByStatus: projectsByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      employeesByDepartment: employeesByDepartment.map((item) => ({
        department: item.department,
        count: item._count.department,
      })),
      equipmentByStatus: equipmentByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      recentActivity,
    }
  }

  // ============================================================================
  // GET ALERTS
  // ============================================================================
  async getAlerts(query: DashboardAlertsQuery): Promise<{ data: DashboardAlert[]; meta: any }> {
    const where: any = {}

    if (query.severity) {
      where.severity = query.severity
    }

    if (query.type) {
      where.type = query.type
    }

    if (query.isResolved !== undefined) {
      where.isResolved = query.isResolved
    }

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        orderBy: [{ isResolved: 'asc' }, { severity: 'desc' }, { createdAt: 'desc' }],
        take: query.limit,
        select: {
          id: true,
          type: true,
          severity: true,
          title: true,
          titleAr: true,
          message: true,
          messageAr: true,
          entityType: true,
          entityId: true,
          isResolved: true,
          resolvedAt: true,
          createdAt: true,
        },
      }),
      prisma.alert.count({ where }),
    ])

    return {
      data: alerts,
      meta: {
        total,
        limit: query.limit,
      },
    }
  }

  // ============================================================================
  // GET CHARTS DATA
  // ============================================================================
  async getCharts(query: DashboardChartsQuery): Promise<DashboardCharts> {
    const now = new Date()
    let startDate = new Date()

    // Set date range based on period
    switch (query.period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      case 'month':
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
    }

    const [revenueData, expenseData, projects, equipment] = await Promise.all([
      this._getRevenueByMonth(startDate, now),
      this._getExpensesByCategory(startDate, now),
      prisma.project.findMany({
        where: query.projectId ? { id: query.projectId } : undefined,
        select: {
          id: true,
          name: true,
          progressPercent: true,
          status: true,
        },
      }),
      prisma.equipment.findMany({
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          name: true,
          hourlyCost: true,
        },
      }),
    ])

    // Calculate profit from revenue and expenses
    const profitData = revenueData.map((rev, index) => {
      const expense = expenseData.reduce((sum, exp) => sum + exp.amount, 0) / (revenueData.length || 1)
      return {
        month: rev.month,
        amount: rev.amount - expense,
      }
    })

    // Equipment usage (simplified - would need actual usage tracking)
    const equipmentUsage = equipment.map((eq) => ({
      name: eq.name,
      usageHours: Math.floor(Math.random() * 200) + 50, // Placeholder
    }))

    // Project progress
    const projectProgress = projects.map((proj) => ({
      name: proj.name,
      progress: proj.progressPercent,
      status: proj.status,
    }))

    // Employee attendance (placeholder)
    const employeeAttendance = await this._getAttendanceByMonth(startDate, now)

    return {
      revenue: revenueData,
      expenses: expenseData,
      profit: profitData,
      equipmentUsage,
      projectProgress,
      employeeAttendance,
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================
  private async _getFinancialStats(startDate: Date, endDate: Date) {
    const [invoices, expenses] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          issueDate: { gte: startDate, lte: endDate },
          status: { in: ['PAID', 'SENT'] },
        },
        _sum: { total: true },
      }),
      prisma.expense.aggregate({
        where: {
          date: { gte: startDate, lte: endDate },
          isApproved: true,
        },
        _sum: { amount: true },
      }),
    ])

    return {
      totalRevenue: invoices._sum.total || 0,
      totalExpenses: expenses._sum.amount || 0,
    }
  }

  private async _getRevenueByMonth(startDate: Date, endDate: Date) {
    const invoices = await prisma.invoice.findMany({
      where: {
        issueDate: { gte: startDate, lte: endDate },
        status: { in: ['PAID', 'SENT'] },
      },
      select: {
        issueDate: true,
        total: true,
      },
    })

    // Group by month
    const monthlyRevenue: Record<string, number> = {}
    invoices.forEach((inv) => {
      const month = inv.issueDate.toISOString().slice(0, 7) // YYYY-MM
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + inv.total
    })

    return Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount }))
  }

  private async _getExpensesByCategory(startDate: Date, endDate: Date) {
    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        isApproved: true,
      },
      select: {
        category: true,
        amount: true,
      },
    })

    // Group by category
    const categoryExpenses: Record<string, number> = {}
    expenses.forEach((exp) => {
      categoryExpenses[exp.category] = (categoryExpenses[exp.category] || 0) + exp.amount
    })

    return Object.entries(categoryExpenses).map(([category, amount]) => ({
      category,
      amount,
    }))
  }

  private async _getAttendanceByMonth(startDate: Date, endDate: Date) {
    const attendance = await prisma.attendance.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      select: {
        date: true,
        status: true,
      },
    })

    // Group by month
    const monthlyAttendance: Record<string, { present: number; absent: number }> = {}
    attendance.forEach((att) => {
      const month = att.date.toISOString().slice(0, 7)
      if (!monthlyAttendance[month]) {
        monthlyAttendance[month] = { present: 0, absent: 0 }
      }
      if (att.status === 'PRESENT') {
        monthlyAttendance[month].present++
      } else {
        monthlyAttendance[month].absent++
      }
    })

    return Object.entries(monthlyAttendance).map(([month, data]) => ({
      month,
      presentDays: data.present,
      absentDays: data.absent,
    }))
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================
export const dashboardService = new DashboardService()
