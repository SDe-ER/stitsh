import { prisma } from '@/lib/prisma.js'
import {
  RunReportInput,
  ReportQuery,
  ReportRunQuery,
  ExportReportInput,
  ReportTypeEnum,
  ReportStatusEnum,
  ExportStatusEnum,
  ExportFormatEnum,
} from '@/validators/reports.validator.js'
import { NotFoundError } from '@/middleware/errorHandler.js'

// ============================================================================
// TYPES
// ============================================================================

export interface ReportWithRelations {
  id: string
  type: string
  name: string
  nameAr: string | null
  description: string | null
  descriptionAr: string | null
  category: string
  frequency: string
  icon: string
  color: string
  filtersSchema: any
  isActive: boolean
  displayOrder: number
  createdAt: Date
  updatedAt: Date
  _count?: {
    runs: number
  }
}

export interface PaginatedReports {
  data: ReportWithRelations[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface ReportRunWithRelations {
  id: string
  reportId: string
  userId: string
  status: string
  parameters: any
  startDate: Date | null
  endDate: Date | null
  resultData: any
  error: string | null
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  report?: {
    id: string
    type: string
    name: string
    nameAr: string | null
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface PaginatedReportRuns {
  data: ReportRunWithRelations[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// ============================================================================
// REPORTS SERVICE
// ============================================================================

export class ReportsService {
  // ============================================================================
  // GET REPORT DEFINITIONS
  // ============================================================================

  async getReportDefinitions(query: ReportQuery): Promise<PaginatedReports> {
    const where: any = { isActive: true }

    if (query.type) {
      where.type = query.type
    }

    if (query.category) {
      where.category = query.category
    }

    const [reports, total] = await Promise.all([
      prisma.reportDefinition.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          _count: {
            select: { runs: true },
          },
        },
      }),
      prisma.reportDefinition.count({ where }),
    ])

    const totalPages = Math.ceil(total / query.limit)

    return {
      data: reports,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    }
  }

  async getReportDefinitionByType(type: string): Promise<ReportWithRelations> {
    const report = await prisma.reportDefinition.findUnique({
      where: { type },
      include: {
        _count: {
          select: { runs: true },
        },
      },
    })

    if (!report) {
      throw new NotFoundError('التقرير غير موجود - Report not found')
    }

    return report as ReportWithRelations
  }

  // ============================================================================
  // RUN REPORT
  // ============================================================================

  async runReport(userId: string, data: RunReportInput) {
    // Get the report definition
    const report = await this.getReportDefinitionByType(data.reportType)

    // Calculate date range based on period
    let startDate: Date | undefined
    let endDate: Date | undefined

    if (data.period) {
      const now = new Date()
      switch (data.period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          endDate = new Date(now.setHours(23, 59, 59, 999))
          break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7))
          endDate = new Date()
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          break
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3)
          startDate = new Date(now.getFullYear(), quarter * 3, 1)
          endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          endDate = new Date(now.getFullYear(), 11, 31)
          break
      }
    } else {
      if (data.startDate) startDate = new Date(data.startDate)
      if (data.endDate) endDate = new Date(data.endDate)
    }

    // Create the report run
    const reportRun = await prisma.reportRun.create({
      data: {
        reportId: report.id,
        userId,
        status: ReportStatusEnum.Enum.RUNNING,
        parameters: {
          ...data,
          startDate,
          endDate,
        },
        startDate,
        endDate,
        startedAt: new Date(),
      },
      include: {
        report: {
          select: {
            id: true,
            type: true,
            name: true,
            nameAr: true,
          },
        },
      },
    })

    // Generate the report data asynchronously
    this.generateReportData(reportRun.id, data.reportType, {
      startDate,
      endDate,
      projectId: data.projectId,
      equipmentId: data.equipmentId,
      employeeId: data.employeeId,
      supplierId: data.supplierId,
    }).catch(async (error) => {
      await prisma.reportRun.update({
        where: { id: reportRun.id },
        data: {
          status: ReportStatusEnum.Enum.FAILED,
          error: error.message,
          completedAt: new Date(),
        },
      })
    })

    return reportRun
  }

  // ============================================================================
  // GENERATE REPORT DATA
  // ============================================================================

  private async generateReportData(
    runId: string,
    reportType: string,
    params: {
      startDate?: Date
      endDate?: Date
      projectId?: string
      equipmentId?: string
      employeeId?: string
      supplierId?: string
    }
  ) {
    const resultData = await this.fetchReportData(reportType, params)

    await prisma.reportRun.update({
      where: { id: runId },
      data: {
        status: ReportStatusEnum.Enum.COMPLETED,
        resultData,
        completedAt: new Date(),
      },
    })
  }

  private async fetchReportData(reportType: string, params: any) {
    const { startDate, endDate, projectId, equipmentId, employeeId, supplierId } = params
    const dateFilter: any = {}
    if (startDate) dateFilter.gte = startDate
    if (endDate) dateFilter.lte = endDate

    switch (reportType) {
      case 'PROJECT_PROFITABILITY':
        return this.getProjectProfitabilityData(params)
      case 'EQUIPMENT_OPERATION':
        return this.getEquipmentOperationData(params)
      case 'SUPPLIER_STATEMENT':
        return this.getSupplierStatementData(params)
      case 'LABOR_COSTS':
        return this.getLaborCostsData(params)
      case 'FUEL_CONSUMPTION':
        return this.getFuelConsumptionData(params)
      case 'VAT_SUMMARY':
        return this.getVATSummaryData(params)
      case 'PAYROLL_SUMMARY':
        return this.getPayrollSummaryData(params)
      case 'EQUIPMENT_UTILIZATION':
        return this.getEquipmentUtilizationData(params)
      case 'DOCUMENT_EXPIRY':
        return this.getDocumentExpiryData(params)
      default:
        return {}
    }
  }

  // ============================================================================
  // REPORT DATA QUERIES
  // ============================================================================

  private async getProjectProfitabilityData(params: any) {
    const { startDate, endDate, projectId } = params

    const where: any = {}
    if (projectId) where.projectId = projectId
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    // Get revenue from invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        ...where,
        status: { in: ['PAID', 'SENT'] },
      },
      select: {
        projectId: true,
        total: true,
        tax: true,
        amount: true,
        issueDate: true,
      },
    })

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where: {
        ...where,
        isApproved: true,
      },
      select: {
        projectId: true,
        amount: true,
        category: true,
        date: true,
      },
    })

    // Get payroll costs via deductions/cost entries
    const costEntries = await prisma.projectCostEntry.findMany({
      where: {
        ...where,
        category: 'LABOR',
      },
      select: {
        projectId: true,
        amount: true,
        date: true,
      },
    })

    // Group by project
    const projectMap = new Map<string, any>()

    for (const invoice of invoices) {
      if (!projectMap.has(invoice.projectId)) {
        projectMap.set(invoice.projectId, { revenue: 0, expenses: 0, laborCost: 0 })
      }
      const data = projectMap.get(invoice.projectId)
      data.revenue += invoice.total
    }

    for (const expense of expenses) {
      if (!projectMap.has(expense.projectId)) {
        projectMap.set(expense.projectId, { revenue: 0, expenses: 0, laborCost: 0 })
      }
      const data = projectMap.get(expense.projectId)
      data.expenses += expense.amount
    }

    for (const cost of costEntries) {
      if (!projectMap.has(cost.projectId)) {
        projectMap.set(cost.projectId, { revenue: 0, expenses: 0, laborCost: 0 })
      }
      const data = projectMap.get(cost.projectId)
      data.laborCost += cost.amount
    }

    // Get project details
    const projects = await prisma.project.findMany({
      where: projectId ? { id: projectId } : {},
      select: {
        id: true,
        name: true,
        nameAr: true,
        code: true,
        contractValue: true,
      },
    })

    return {
      summary: {
        totalRevenue: Array.from(projectMap.values()).reduce((sum, d) => sum + d.revenue, 0),
        totalExpenses: Array.from(projectMap.values()).reduce((sum, d) => sum + d.expenses, 0),
        totalLaborCost: Array.from(projectMap.values()).reduce((sum, d) => sum + d.laborCost, 0),
      },
      projects: projects.map(p => {
        const data = projectMap.get(p.id) || { revenue: 0, expenses: 0, laborCost: 0 }
        const profit = data.revenue - data.expenses - data.laborCost
        return {
          ...p,
          revenue: data.revenue,
          expenses: data.expenses,
          laborCost: data.laborCost,
          profit,
          profitMargin: data.revenue > 0 ? (profit / data.revenue) * 100 : 0,
        }
      }),
    }
  }

  private async getEquipmentOperationData(params: any) {
    const { startDate, endDate, equipmentId } = params

    const where: any = {}
    if (equipmentId) where.id = equipmentId

    const equipment = await prisma.equipment.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        nameAr: true,
        type: true,
        status: true,
        totalWorkHours: true,
        totalOperatingCost: true,
        dailyCost: true,
        hourlyCost: true,
        hourlyRate: true,
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    // Get maintenance records
    const equipmentIds = equipment.map(e => e.id)
    const maintenanceRecords = await prisma.maintenanceRecord.findMany({
      where: {
        equipmentId: { in: equipmentIds },
        ...(startDate || endDate ? {
          date: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        } : {}),
      },
      select: {
        equipmentId: true,
        type: true,
        cost: true,
        date: true,
      },
    })

    // Group maintenance by equipment
    const maintenanceMap = new Map<string, any>()
    for (const record of maintenanceRecords) {
      if (!maintenanceMap.has(record.equipmentId)) {
        maintenanceMap.set(record.equipmentId, { totalCost: 0, count: 0 })
      }
      const data = maintenanceMap.get(record.equipmentId)
      data.totalCost += record.cost || 0
      data.count += 1
    }

    return {
      equipment: equipment.map(e => {
        const maintenance = maintenanceMap.get(e.id) || { totalCost: 0, count: 0 }
        return {
          ...e,
          maintenanceCost: maintenance.totalCost,
          maintenanceCount: maintenance.count,
          utilizationRate: e.totalWorkHours > 0 ? Math.min((e.totalWorkHours / 2000) * 100, 100) : 0,
        }
      }),
      summary: {
        totalEquipment: equipment.length,
        activeEquipment: equipment.filter(e => e.status === 'ACTIVE').length,
        totalOperatingCost: equipment.reduce((sum, e) => sum + e.totalOperatingCost, 0),
      },
    }
  }

  private async getSupplierStatementData(params: any) {
    const { startDate, endDate, supplierId } = params

    const suppliers = await prisma.supplier.findMany({
      where: supplierId ? { id: supplierId } : { isActive: true },
      select: {
        id: true,
        name: true,
        nameAr: true,
        category: true,
      },
    })

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        supplierId: { in: suppliers.map(s => s.id) },
        ...(startDate || endDate ? {
          orderedAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        } : {}),
      },
      select: {
        supplierId: true,
        orderNumber: true,
        total: true,
        tax: true,
        grandTotal: true,
        status: true,
        orderedAt: true,
      },
    })

    // Group by supplier
    const supplierMap = new Map<string, any>()
    for (const po of purchaseOrders) {
      if (!supplierMap.has(po.supplierId)) {
        supplierMap.set(po.supplierId, { totalOrders: 0, totalAmount: 0, pendingAmount: 0 })
      }
      const data = supplierMap.get(po.supplierId)
      data.totalOrders += 1
      data.totalAmount += po.grandTotal
      if (po.status !== 'DELIVERED') {
        data.pendingAmount += po.grandTotal
      }
    }

    return {
      suppliers: suppliers.map(s => {
        const data = supplierMap.get(s.id) || { totalOrders: 0, totalAmount: 0, pendingAmount: 0 }
        return {
          ...s,
          totalOrders: data.totalOrders,
          totalAmount: data.totalAmount,
          pendingAmount: data.pendingAmount,
        }
      }),
      summary: {
        totalSuppliers: suppliers.length,
        totalOrders: purchaseOrders.length,
        totalValue: purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0),
      },
    }
  }

  private async getLaborCostsData(params: any) {
    const { startDate, endDate, projectId, employeeId } = params

    const where: any = {}
    if (projectId) where.employeeId = { projectId }
    if (employeeId) where.employeeId = employeeId
    if (startDate || endDate) {
      where.date = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      }
    }

    const costEntries = await prisma.projectCostEntry.findMany({
      where: { ...where, category: 'LABOR' },
      select: {
        amount: true,
        date: true,
        project: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            code: true,
          },
        },
      },
    })

    const payroll = await prisma.payroll.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        } : {}),
      },
      select: {
        basicSalary: true,
        housing: true,
        transportation: true,
        bonuses: true,
        deductionsAmount: true,
        netSalary: true,
        employee: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            jobTitle: true,
            department: true,
            project: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    })

    // Group by project
    const projectMap = new Map<string, any>()
    for (const cost of costEntries) {
      const pid = cost.project.id
      if (!projectMap.has(pid)) {
        projectMap.set(pid, { totalCost: 0, employeeCount: 0 })
      }
      const data = projectMap.get(pid)
      data.totalCost += cost.amount
    }

    // Get unique employees per project
    const employeeProjectMap = new Map<string, Set<string>>()
    for (const p of payroll) {
      if (p.employee.projectId) {
        if (!employeeProjectMap.has(p.employee.projectId)) {
          employeeProjectMap.set(p.employee.projectId, new Set())
        }
        employeeProjectMap.get(p.employee.projectId)!.add(p.employee.id)
      }
    }

    return {
      summary: {
        totalPayrollCost: payroll.reduce((sum, p) => sum + p.netSalary, 0),
        totalDeductions: payroll.reduce((sum, p) => sum + (p.deductionsAmount || 0), 0),
        totalBonuses: payroll.reduce((sum, p) => sum + (p.bonuses || 0), 0),
      },
      byProject: Array.from(projectMap.entries()).map(([pid, data]) => ({
        projectId: pid,
        totalCost: data.totalCost,
      })),
      payroll: payroll.map(p => ({
        employeeId: p.employee.id,
        employeeName: p.employee.name,
        employeeNameAr: p.employee.nameAr,
        jobTitle: p.employee.jobTitle,
        department: p.employee.department,
        projectId: p.employee.project?.id,
        projectName: p.employee.project?.name,
        basicSalary: p.basicSalary,
        allowances: (p.housing || 0) + (p.transportation || 0),
        bonuses: p.bonuses || 0,
        deductions: p.deductionsAmount || 0,
        netSalary: p.netSalary,
      })),
    }
  }

  private async getFuelConsumptionData(params: any) {
    const { startDate, endDate, equipmentId } = params

    const where: any = {}
    if (equipmentId) where.id = equipmentId

    const equipment = await prisma.equipment.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        nameAr: true,
        type: true,
        fuelConsumption: true,
        totalWorkHours: true,
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    // Calculate estimated fuel consumption based on hours
    const avgFuelPerHour = 15 // liters per hour (average for construction equipment)

    return {
      equipment: equipment.map(e => ({
        ...e,
        estimatedFuelConsumption: e.totalWorkHours * avgFuelPerHour,
        fuelPerHour: avgFuelPerHour,
      })),
      summary: {
        totalEquipment: equipment.length,
        totalWorkHours: equipment.reduce((sum, e) => sum + e.totalWorkHours, 0),
        estimatedTotalFuel: equipment.reduce((sum, e) => sum + (e.totalWorkHours * avgFuelPerHour), 0),
      },
    }
  }

  private async getVATSummaryData(params: any) {
    const { startDate, endDate } = params

    const dateFilter: any = {}
    if (startDate) dateFilter.gte = startDate
    if (endDate) dateFilter.lte = endDate

    // Get taxable revenue (invoices)
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['PAID', 'SENT'] },
        ...(Object.keys(dateFilter).length > 0 ? { issueDate: dateFilter } : {}),
      },
      select: {
        total: true,
        tax: true,
      },
    })

    // Get taxable purchases (expenses with VAT)
    const expenses = await prisma.expense.findMany({
      where: {
        isApproved: true,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      select: {
        amount: true,
      },
    })

    // Calculate VAT (15%)
    const vatRate = 0.15

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalRevenueTax = invoices.reduce((sum, inv) => sum + (inv.tax || inv.total * vatRate), 0)

    const totalPurchases = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalPurchasesTax = totalPurchases * vatRate

    const netTaxDue = totalRevenueTax - totalPurchasesTax

    return {
      totalRevenue,
      totalRevenueTax,
      totalPurchases,
      totalPurchasesTax,
      netTaxDue: Math.max(0, netTaxDue),
      vatRate: 15,
    }
  }

  private async getPayrollSummaryData(params: any) {
    const { startDate, endDate, projectId } = params

    const where: any = {}
    if (projectId) {
      where.employee = { projectId }
    }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    const payroll = await prisma.payroll.findMany({
      where,
      select: {
        basicSalary: true,
        housing: true,
        transportation: true,
        overtime: true,
        bonuses: true,
        deductionsAmount: true,
        netSalary: true,
        month: true,
        year: true,
        employee: {
          select: {
            id: true,
            name: true,
            jobTitle: true,
            department: true,
          },
        },
      },
    })

    // Group by month
    const monthlyMap = new Map<string, any>()
    for (const p of payroll) {
      const key = `${p.year}-${p.month.toString().padStart(2, '0')}`
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          month: p.month,
          year: p.year,
          grossSalary: 0,
          deductions: 0,
          netSalary: 0,
          count: 0,
        })
      }
      const data = monthlyMap.get(key)
      data.grossSalary += p.basicSalary + (p.housing || 0) + (p.transportation || 0) + (p.overtime || 0) + (p.bonuses || 0)
      data.deductions += p.deductionsAmount || 0
      data.netSalary += p.netSalary
      data.count += 1
    }

    return {
      summary: {
        totalGrossSalary: payroll.reduce((sum, p) => sum + p.basicSalary + (p.housing || 0) + (p.transportation || 0) + (p.overtime || 0) + (p.bonuses || 0), 0),
        totalDeductions: payroll.reduce((sum, p) => sum + (p.deductionsAmount || 0), 0),
        totalNetSalary: payroll.reduce((sum, p) => sum + p.netSalary, 0),
        employeeCount: new Set(payroll.map(p => p.employeeId)).size,
      },
      byMonth: Array.from(monthlyMap.values()).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      }),
    }
  }

  private async getEquipmentUtilizationData(params: any) {
    const { startDate, endDate, equipmentId } = params

    const where: any = {}
    if (equipmentId) where.id = equipmentId

    const equipment = await prisma.equipment.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        nameAr: true,
        type: true,
        status: true,
        totalWorkHours: true,
        dailyCost: true,
        hourlyRate: true,
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    // Standard working hours per month (8 hours/day * 26 working days)
    const standardHoursPerMonth = 208
    const utilizationThreshold = 70 // %

    return {
      equipment: equipment.map(e => {
        const utilizationRate = Math.min((e.totalWorkHours / 2000) * 100, 100) // Assuming 2000 hours is full capacity
        const isUnderUtilized = utilizationRate < utilizationThreshold && e.status === 'ACTIVE'
        return {
          ...e,
          utilizationRate,
          isUnderUtilized,
          downtimeHours: Math.max(0, 2000 - e.totalWorkHours),
        }
      }),
      summary: {
        totalEquipment: equipment.length,
        activeEquipment: equipment.filter(e => e.status === 'ACTIVE').length,
        underUtilizedCount: equipment.filter(e => {
          const rate = Math.min((e.totalWorkHours / 2000) * 100, 100)
          return rate < utilizationThreshold && e.status === 'ACTIVE'
        }).length,
      },
    }
  }

  private async getDocumentExpiryData(params: any) {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Get expiring employee documents
    const employeeDocuments = await prisma.employeeDocument.findMany({
      where: {
        expiryDate: { lte: thirtyDaysFromNow },
      },
      select: {
        id: true,
        type: true,
        expiryDate: true,
        status: true,
        employee: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            employeeId: true,
          },
        },
      },
    })

    // Get expiring equipment documents
    const equipmentDocuments = await prisma.equipmentDocument.findMany({
      where: {
        expiryDate: { lte: thirtyDaysFromNow },
      },
      select: {
        id: true,
        documentType: true,
        expiryDate: true,
        equipment: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            code: true,
          },
        },
      },
    })

    // Categorize by expiry status
    const expired = []
    const expiringSoon = []
    const valid = []

    for (const doc of employeeDocuments) {
      if (!doc.expiryDate) continue
      const daysUntilExpiry = Math.ceil((doc.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry < 0) {
        expired.push({ ...doc, daysUntilExpiry, entityType: 'employee' })
      } else if (daysUntilExpiry <= 30) {
        expiringSoon.push({ ...doc, daysUntilExpiry, entityType: 'employee' })
      }
    }

    for (const doc of equipmentDocuments) {
      if (!doc.expiryDate) continue
      const daysUntilExpiry = Math.ceil((doc.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiry < 0) {
        expired.push({ ...doc, daysUntilExpiry, entityType: 'equipment' })
      } else if (daysUntilExpiry <= 30) {
        expiringSoon.push({ ...doc, daysUntilExpiry, entityType: 'equipment' })
      }
    }

    return {
      expired,
      expiringSoon: expiringSoon.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
      summary: {
        expiredCount: expired.length,
        expiringSoonCount: expiringSoon.length,
        totalDocuments: employeeDocuments.length + equipmentDocuments.length,
      },
    }
  }

  // ============================================================================
  // GET REPORT RUNS
  // ============================================================================

  async getReportRuns(query: ReportRunQuery): Promise<PaginatedReportRuns> {
    const where: any = {}

    if (query.reportId) {
      where.reportId = query.reportId
    }

    if (query.status) {
      where.status = query.status
    }

    const [runs, total] = await Promise.all([
      prisma.reportRun.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          report: {
            select: {
              id: true,
              type: true,
              name: true,
              nameAr: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.reportRun.count({ where }),
    ])

    const totalPages = Math.ceil(total / query.limit)

    return {
      data: runs as ReportRunWithRelations[],
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    }
  }

  async getReportRunById(id: string): Promise<ReportRunWithRelations> {
    const run = await prisma.reportRun.findUnique({
      where: { id },
      include: {
        report: {
          select: {
            id: true,
            type: true,
            name: true,
            nameAr: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exports: true,
      },
    })

    if (!run) {
      throw new NotFoundError('تشغيل التقرير غير موجود - Report run not found')
    }

    return run as ReportRunWithRelations
  }

  // ============================================================================
  // EXPORT REPORT
  // ============================================================================

  async exportReport(userId: string, data: ExportReportInput) {
    // Get the report run
    const run = await this.getReportRunById(data.runId)

    if (run.status !== ReportStatusEnum.Enum.COMPLETED) {
      throw new Error('Cannot export a report that has not completed')
    }

    // Create export record
    const exportRecord = await prisma.reportExport.create({
      data: {
        runId: data.runId,
        format: data.format,
        status: ExportStatusEnum.Enum.PENDING,
      },
    })

    // In a real implementation, you would generate the file here
    // For now, we'll mark it as completed with a placeholder URL
    await prisma.reportExport.update({
      where: { id: exportRecord.id },
      data: {
        status: ExportStatusEnum.Enum.COMPLETED,
        fileUrl: `/exports/reports/${exportRecord.id}.${data.format.toLowerCase()}`,
        fileName: `${run.report?.name || 'report'}_${exportRecord.id}.${data.format.toLowerCase()}`,
        completedAt: new Date(),
      },
    })

    return prisma.reportExport.findUnique({
      where: { id: exportRecord.id },
    })
  }

  // ============================================================================
  // GET EXPORT BY ID
  // ============================================================================

  async getExportById(id: string) {
    const exportRecord = await prisma.reportExport.findUnique({
      where: { id },
      include: {
        run: {
          include: {
            report: {
              select: {
                id: true,
                type: true,
                name: true,
                nameAr: true,
              },
            },
          },
        },
      },
    })

    if (!exportRecord) {
      throw new NotFoundError('التصدير غير موجود - Export not found')
    }

    return exportRecord
  }

  // ============================================================================
  // GET REPORT PREVIEW
  // ============================================================================

  async getReportPreview(runId: string) {
    const run = await this.getReportRunById(runId)

    if (run.status !== ReportStatusEnum.Enum.COMPLETED) {
      throw new Error('Cannot preview a report that has not completed')
    }

    // Get the report definition for display info
    const reportDefinition = await prisma.reportDefinition.findUnique({
      where: { id: run.reportId },
      select: {
        id: true,
        type: true,
        name: true,
        nameAr: true,
        category: true,
        description: true,
        descriptionAr: true,
      },
    })

    if (!reportDefinition) {
      throw new NotFoundError('تعريف التقرير غير موجود - Report definition not found')
    }

    // Extract data from resultData
    const resultData = run.resultData || {}

    // Build preview response based on report type
    const preview = {
      reportRun: {
        id: run.id,
        status: run.status,
        startDate: run.startDate,
        endDate: run.endDate,
        createdAt: run.createdAt,
        completedAt: run.completedAt,
        reference: `REP-${new Date(run.createdAt).getFullYear()}-${run.id.slice(-6)}`,
      },
      reportDefinition,
      parameters: run.parameters,
      data: resultData,
      // Formatted display data
      display: this.formatPreviewData(reportDefinition.type, resultData, run.parameters),
    }

    return preview
  }

  // ============================================================================
  // GET REPORT EXPORTS (List)
  // ============================================================================

  async getReportExports(runId: string) {
    // Verify run exists
    await this.getReportRunById(runId)

    const exports = await prisma.reportExport.findMany({
      where: { runId },
      orderBy: { createdAt: 'desc' },
    })

    return exports
  }

  // ============================================================================
  // GET EXPORT FILE FOR DOWNLOAD
  // ============================================================================

  async getExportFile(exportId: string) {
    const exportRecord = await this.getExportById(exportId)

    if (exportRecord.status !== ExportStatusEnum.Enum.COMPLETED) {
      throw new Error('Export is not ready for download')
    }

    if (!exportRecord.fileUrl) {
      throw new Error('No file available for this export')
    }

    // In a real implementation, you would read the file from storage
    // For now, we'll return a placeholder buffer
    const fileBuffer = Buffer.from('Placeholder file content')

    return {
      file: fileBuffer,
      fileName: exportRecord.fileName || `export_${exportId}`,
      mimeType: this.getMimeType(exportRecord.format),
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private formatPreviewData(reportType: string, resultData: any, parameters: any) {
    // Format data for display based on report type
    switch (reportType) {
      case 'SUPPLIER_STATEMENT':
        return this.formatSupplierStatementPreview(resultData, parameters)
      case 'PROJECT_PROFITABILITY':
        return this.formatProjectProfitabilityPreview(resultData, parameters)
      case 'LABOR_COSTS':
        return this.formatLaborCostsPreview(resultData, parameters)
      case 'EQUIPMENT_OPERATION':
        return this.formatEquipmentOperationPreview(resultData, parameters)
      default:
        return resultData
    }
  }

  private formatSupplierStatementPreview(data: any, parameters: any) {
    const { suppliers = [], summary = {} } = data

    // Build table rows from supplier data
    const rows = suppliers.flatMap((supplier: any) => {
      // Get purchase orders for this supplier
      const supplierPOs = data.purchaseOrders?.filter((po: any) => po.supplierId === supplier.id) || []

      return supplierPOs.map((po: any) => ({
        date: new Date(po.orderedAt).toLocaleDateString('en-GB'),
        reference: po.orderNumber,
        description: `${supplier.nameAr || supplier.name} - ${po.items?.[0]?.name || 'مواد'}`,
        debit: 0,
        credit: po.grandTotal,
      }))
    })

    // Calculate totals
    const totalCredit = rows.reduce((sum: number, row: any) => sum + row.credit, 0)
    const balance = totalCredit

    return {
      columns: [
        { key: 'date', label: 'التاريخ', align: 'center' },
        { key: 'reference', label: 'رقم المرجع', align: 'center' },
        { key: 'description', label: 'الوصف', align: 'right' },
        { key: 'debit', label: 'مدين (ريال)', align: 'center', format: 'currency' },
        { key: 'credit', label: 'دائن (ريال)', align: 'center', format: 'currency' },
      ],
      rows,
      totals: {
        debit: 0,
        credit: totalCredit,
        balance,
      },
      entityInfo: parameters.supplierId ? {
        name: suppliers[0]?.name,
        nameAr: suppliers[0]?.nameAr,
        address: suppliers[0]?.address || 'الرياض',
      } : null,
      period: {
        from: parameters.startDate ? new Date(parameters.startDate).toLocaleDateString('en-GB') : '01/01/2023',
        to: parameters.endDate ? new Date(parameters.endDate).toLocaleDateString('en-GB') : '31/12/2023',
      },
    }
  }

  private formatProjectProfitabilityPreview(data: any, parameters: any) {
    const { projects = [], summary = {} } = data

    const rows = projects.map((project: any) => ({
      projectCode: project.code,
      projectName: project.nameAr || project.name,
      revenue: project.revenue || 0,
      expenses: project.expenses || 0,
      laborCost: project.laborCost || 0,
      profit: project.profit || 0,
      profitMargin: project.profitMargin || 0,
    }))

    return {
      columns: [
        { key: 'projectCode', label: 'رقم المشروع', align: 'center' },
        { key: 'projectName', label: 'اسم المشروع', align: 'right' },
        { key: 'revenue', label: 'الإيرادات', align: 'center', format: 'currency' },
        { key: 'expenses', label: 'المصروفات', align: 'center', format: 'currency' },
        { key: 'laborCost', label: 'تكلفة العمالة', align: 'center', format: 'currency' },
        { key: 'profit', label: 'الربح', align: 'center', format: 'currency' },
        { key: 'profitMargin', label: 'هامش الربح %', align: 'center', format: 'percentage' },
      ],
      rows,
      totals: summary,
    }
  }

  private formatLaborCostsPreview(data: any, parameters: any) {
    // Similar implementation for labor costs
    return data
  }

  private formatEquipmentOperationPreview(data: any, parameters: any) {
    // Similar implementation for equipment operation
    return data
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'PDF':
        return 'application/pdf'
      case 'EXCEL':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      case 'CSV':
        return 'text/csv'
      default:
        return 'application/octet-stream'
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const reportsService = new ReportsService()
