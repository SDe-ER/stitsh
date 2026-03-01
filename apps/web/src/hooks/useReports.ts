import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reportsService } from '@/services/reports'
import type { ReportDefinition, ReportRun, ReportExport, RunReportParams, ReportType, VATSummary } from '@/services/reports'

// ============================================================================
// HOOKS
// ============================================================================

export function useReports(filters?: { type?: ReportType; category?: string }) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportsService.getAll(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useReportByType(type: ReportType) {
  return useQuery({
    queryKey: ['reports', 'type', type],
    queryFn: () => reportsService.getByType(type),
    enabled: !!type,
    staleTime: 10 * 60 * 1000,
  })
}

export function useReportRuns(filters?: { reportId?: string }) {
  return useQuery({
    queryKey: ['reportRuns', filters],
    queryFn: () => reportsService.getRuns(filters),
    staleTime: 1 * 60 * 1000,
    refetchInterval: (data) => {
      // Poll for running reports
      const hasRunning = data?.some((run: ReportRun) => run.status === 'RUNNING' || run.status === 'PENDING')
      return hasRunning ? 3000 : false
    },
  })
}

export function useReportRun(id: string) {
  return useQuery({
    queryKey: ['reportRun', id],
    queryFn: () => reportsService.getRunById(id),
    enabled: !!id,
    refetchInterval: (data) => {
      // Poll for running reports
      return data?.status === 'RUNNING' || data?.status === 'PENDING' ? 2000 : false
    },
  })
}

export function useRunReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: RunReportParams) => reportsService.run(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportRuns'] })
      toast.success('جاري تشغيل التقرير', { description: 'Report is being generated' })
    },
    onError: (error: any) => {
      toast.error('فشل تشغيل التقرير', { description: error.message || 'Failed to run report' })
    },
  })
}

export function useExportReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ runId, format }: { runId: string; format: 'PDF' | 'EXCEL' | 'CSV' }) =>
      reportsService.exportRun(runId, format),
    onSuccess: (data: ReportExport) => {
      queryClient.invalidateQueries({ queryKey: ['reportRun', data.runId] })
      toast.success('تم إنشاء التصدير بنجاح', { description: 'Export created successfully' })
    },
    onError: (error: any) => {
      toast.error('فشل التصدير', { description: error.message || 'Failed to export report' })
    },
  })
}

export function useVATSummary() {
  return useQuery({
    queryKey: ['vatSummary'],
    queryFn: () => reportsService.getVATSummary(),
    staleTime: 5 * 60 * 1000,
  })
}
