import { Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from '@/pages/Dashboard/Dashboard'
import DashboardPage from '@/pages/DashboardPage/DashboardPage'
import { Projects } from '@/pages/Projects/Projects'
import ProjectsListPage from '@/pages/ProjectsList/ProjectsListPage'
import ProjectDetailPage from '@/pages/ProjectDetail/ProjectDetailPage'
import { ComponentTest } from '@/pages/ComponentTest/ComponentTest'
import EquipmentListPage from '@/pages/EquipmentList/EquipmentListPage'
import EquipmentDetailPage from '@/pages/EquipmentDetail/EquipmentDetailPage'
import MaintenancePage from '@/pages/Maintenance/MaintenancePage'
import { EquipmentOperationsPage } from '@/pages/EquipmentOperations'
import { EmployeesListPage } from '@/pages/EmployeesList'
import { EmployeeProfilePage } from '@/pages/EmployeeProfile'
import { AddEmployeePage } from '@/pages/AddEmployee'
import { WorkerProfilePage } from '@/pages/WorkerProfile'
import { PayrollPage } from '@/pages/Payroll'
import {
  FinanceOverviewPage,
  InvoicesPage,
  ExpensesPage,
  AuditReportPage,
} from '@/pages/Finance'
import { ClientsPage, SuppliersPage } from '@/pages/Suppliers'
import { ProjectFinancialReportPage } from '@/pages/ProjectFinancialReport'
import { AnalyticsPage } from '@/pages/Analytics'
import { SettingsPage } from '@/pages/Settings'
import ReportsPage from '@/pages/Reports/ReportsPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard-old" element={<Dashboard />} />
      {/* Projects Routes */}
      <Route path="/projects" element={<ProjectsListPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/projects-old" element={<Projects />} />
      {/* Equipment Routes */}
      <Route path="/equipment" element={<EquipmentListPage />} />
      <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
      <Route path="/equipment/maintenance" element={<MaintenancePage />} />
      <Route path="/equipment/operations" element={<EquipmentOperationsPage />} />
      {/* HR Routes */}
      <Route path="/hr" element={<Navigate to="/hr/employees" replace />} />
      <Route path="/hr/employees" element={<EmployeesListPage />} />
      <Route path="/hr/employees/new" element={<AddEmployeePage />} />
      <Route path="/hr/employees/:id" element={<EmployeeProfilePage />} />
      <Route path="/hr/workers/:id" element={<WorkerProfilePage />} />
      <Route path="/hr/payroll" element={<PayrollPage />} />
      {/* Finance Routes */}
      <Route path="/finance" element={<FinanceOverviewPage />} />
      <Route path="/finance/invoices" element={<InvoicesPage />} />
      <Route path="/finance/expenses" element={<ExpensesPage />} />
      <Route path="/finance/audit" element={<AuditReportPage />} />
      {/* Financial Report Route */}
      <Route path="/financial-report/:id" element={<ProjectFinancialReportPage />} />
      {/* Suppliers & Clients Routes */}
      <Route path="/suppliers" element={<Navigate to="/suppliers/vendors" replace />} />
      <Route path="/suppliers/vendors" element={<SuppliersPage />} />
      <Route path="/suppliers/clients" element={<ClientsPage />} />
      {/* Analytics Route */}
      <Route path="/analytics" element={<AnalyticsPage />} />
      {/* Settings Route */}
      <Route path="/settings" element={<SettingsPage />} />
      {/* Reports Routes */}
      <Route path="/reports" element={<ReportsPage />} />
      {/* Component Test */}
      <Route path="/components" element={<ComponentTest />} />
      {/* Add more routes here as we create more pages */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
