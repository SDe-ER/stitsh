import api from './api'

// ============================================================================
// TYPES
// ============================================================================

export type ReportType =
  | 'PROJECT_PROFITABILITY'
  | 'EQUIPMENT_OPERATION'
  | 'SUPPLIER_STATEMENT'
  | 'LABOR_COSTS'
  | 'FUEL_CONSUMPTION'
  | 'ACCIDENT_LOG'
  | 'VAT_SUMMARY'
  | 'PAYROLL_SUMMARY'
  | 'EQUIPMENT_UTILIZATION'
  | 'DOCUMENT_EXPIRY'

export type ReportStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV'

export interface ReportDefinition {
  id: string
  type: ReportType
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  category: string
  frequency: string
  icon: string
  color: string
  isActive: boolean
  displayOrder: number
  _count?: {
    runs: number
  }
}

export interface ReportRun {
  id: string
  reportId: string
  userId: string
  status: ReportStatus
  parameters: any
  startDate: string | null
  endDate: string | null
  resultData: any
  error: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  report?: {
    id: string
    type: ReportType
    name: string
    nameAr: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface ReportExport {
  id: string
  runId: string
  format: ExportFormat
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  error: string | null
  createdAt: string
  completedAt: string | null
}

export interface RunReportParams {
  reportType: ReportType
  startDate?: string
  endDate?: string
  projectId?: string
  equipmentId?: string
  employeeId?: string
  supplierId?: string
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
}

export interface VATSummary {
  totalRevenue: number
  totalRevenueTax: number
  totalPurchases: number
  totalPurchasesTax: number
  netTaxDue: number
  vatRate: number
}

// ============================================================================
// REPORTS SERVICE
// ============================================================================

export const reportsService = {
  async getAll(filters?: { type?: ReportType; category?: string; status?: ReportStatus }) {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.category) params.append('category', filters.category)
    params.append('page', '1')
    params.append('limit', '100')

    const response = await api.get(`/reports?${params}`)
    return response.data.data as ReportDefinition[]
  },

  async getByType(type: ReportType) {
    const response = await api.get<{ success: boolean; data: ReportDefinition }>(`/reports/types/${type}`)
    return response.data.data
  },

  async run(params: RunReportParams) {
    const response = await api.post<{ success: boolean; data: ReportRun }>('/reports/run', params)
    return response.data.data
  },

  async getRuns(filters?: { reportId?: string; status?: ReportStatus }) {
    const params = new URLSearchParams()
    if (filters?.reportId) params.append('reportId', filters.reportId)
    if (filters?.status) params.append('status', filters.status)
    params.append('page', '1')
    params.append('limit', '50')

    const response = await api.get(`/reports/runs?${params}`)
    return response.data.data as ReportRun[]
  },

  async getRunById(id: string) {
    const response = await api.get<{ success: boolean; data: ReportRun }>(`/reports/runs/${id}`)
    return response.data.data
  },

  async exportRun(runId: string, format: ExportFormat) {
    const response = await api.post<{ success: boolean; data: ReportExport }>(`/reports/${runId}/export`, { runId, format })
    return response.data.data
  },

  async getVATSummary(): Promise<VATSummary> {
    const response = await api.get<{ success: boolean; data: VATSummary }>('/reports/vat-summary')
    return response.data.data
  },
}
