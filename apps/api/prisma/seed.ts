import { PrismaClient, UserRole, ProjectStatus, EquipmentStatus, EquipmentType, MaintenanceType, EmployeeStatus, InvoiceStatus, ExpenseCategory, NotificationType, AlertSeverity, AlertType, DeductionType, DeductionStatus, ReportType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting HeavyOps ERP database seed...')

  // ========================================================================
  // 1. ADMIN USER - Ensure exists with specific credentials
  // ========================================================================
  console.log('📝 Ensuring admin user exists...')

  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@heavyops.sa' },
    update: { 
      passwordHash: adminPasswordHash,
      name: 'System Administrator',
      role: UserRole.ADMIN,
    },
    create: {
      email: 'admin@heavyops.sa',
      name: 'System Administrator',
      nameAr: 'مدير النظام',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      isActive: true,
      phone: '+966501234567',
    },
  })
  console.log('✅ Admin user ready:', admin.email)

  // ========================================================================
  // 2. DEFAULT CLIENT - Required for project
  // ========================================================================
  console.log('📝 Creating default client...')
  
  const defaultClient = await prisma.client.upsert({
    where: { id: 'default-client' },
    update: {},
    create: {
      id: 'default-client',
      name: 'Default Client',
      nameAr: 'العميل الافتراضي',
      contactPerson: 'Admin',
      phone: '+966500000000',
      email: 'admin@heavyops.sa',
      city: 'Riyadh',
      country: 'Saudi Arabia',
    },
  })
  console.log('✅ Default client ready')

  // ========================================================================
  // 3. TEST PROJECT - Ensure exists
  // ========================================================================
  console.log('📝 Creating test project...')
  
  const testProject = await prisma.project.upsert({
    where: { code: 'PRJ-1' },
    update: { status: ProjectStatus.ACTIVE },
    create: {
      name: 'Test Project',
      nameAr: 'مشروع اختبار',
      code: 'PRJ-1',
      clientId: defaultClient.id,
      managerId: admin.id,
      status: ProjectStatus.ACTIVE,
      budget: 1000000,
      startDate: new Date(),
      location: 'Riyadh',
      description: 'Test project for development',
    },
  })
  console.log('✅ Test project ready:', testProject.code)

  // ========================================================================
  // 4. EMPLOYEE - Ensure emp-1 exists
  // ========================================================================
  console.log('📝 Creating employee emp-1...')
  
  const currentDate = new Date()
  const joinDate = new Date()
  
  const employee = await prisma.employee.upsert({
    where: { employeeId: 'EMP-1' },
    update: {
      name: 'Employee 1',
      nameAr: 'موظف ١',
      nationality: 'Saudi',
      jobTitle: 'Operator',
      department: 'Operations',
      salary: 5000,
      salaryDecimal: 5000.00,
      projectId: testProject.id,
      status: EmployeeStatus.ACTIVE,
    },
    create: {
      id: 'emp-1',
      name: 'Employee 1',
      nameAr: 'موظف ١',
      employeeId: 'EMP-1',
      nationality: 'Saudi',
      jobTitle: 'Operator',
      department: 'Operations',
      salary: 5000,
      salaryDecimal: 5000.00,
      phone: '+966501111111',
      projectId: testProject.id,
      status: EmployeeStatus.ACTIVE,
      joinDate: joinDate,
      bankName: 'Al Rajhi Bank',
      bankAccount: 'SA1111111111111111111111',
      iban: 'SA1111111111111111111111',
    },
  })
  console.log('✅ Employee ready:', employee.employeeId, '-', employee.name)

  // ========================================================================
  // 5. PAYROLL - Current month payroll for emp-1
  // ========================================================================
  console.log('📝 Creating payroll record for current month...')
  
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  
  const basicSalary = 3500
  const housing = 1000
  const transportation = 500
  const deductions = 0
  const netSalary = basicSalary + housing + transportation - deductions
  
  const payroll = await prisma.payroll.upsert({
    where: {
      employeeId_month_year: {
        employeeId: employee.id,
        month: currentMonth,
        year: currentYear,
      },
    },
    update: {
      basicSalary: basicSalary,
      basicSalaryDecimal: basicSalary,
      housing: housing,
      housingDecimal: housing,
      transportation: transportation,
      transportationDecimal: transportation,
      deductionsAmount: deductions,
      deductionsAmountDecimal: deductions,
      netSalary: netSalary,
      netSalaryDecimal: netSalary,
    },
    create: {
      employeeId: employee.id,
      month: currentMonth,
      year: currentYear,
      basicSalary: basicSalary,
      basicSalaryDecimal: basicSalary,
      housing: housing,
      housingDecimal: housing,
      transportation: transportation,
      transportationDecimal: transportation,
      deductionsAmount: deductions,
      deductionsAmountDecimal: deductions,
      netSalary: netSalary,
      netSalaryDecimal: netSalary,
      isPaid: false,
    },
  })
  console.log('✅ Payroll ready:', currentMonth, '/', currentYear, '- Net:', netSalary)

  // ========================================================================
  // 6. DEDUCTION - Absence deduction for emp-1
  // ========================================================================
  console.log('📝 Creating deduction record...')
  
  const deductionAmount = 200
  
  const deduction = await prisma.deduction.create({
    data: {
      employeeId: employee.id,
      payrollId: payroll.id,
      projectId: testProject.id,
      type: DeductionType.ABSENCE,
      status: DeductionStatus.PENDING,
      amount: deductionAmount,
      amountDecimal: deductionAmount,
      hours: 1,
      minutes: 0,
      date: currentDate,
      month: currentMonth,
      year: currentYear,
      reason: 'Sample absence deduction for testing',
    },
  })
  console.log('✅ Deduction ready:', DeductionType.ABSENCE, '- Amount:', deductionAmount)

  // ========================================================================
  // 7. PROJECT COST ENTRY - Linked to deduction
  // ========================================================================
  console.log('📝 Creating project cost entry...')
  
  const costEntry = await prisma.projectCostEntry.create({
    data: {
      projectId: testProject.id,
      deductionId: deduction.id,
      category: 'LABOR',
      amount: deductionAmount,
      amountDecimal: deductionAmount,
      description: 'Labor deduction for absence',
      date: currentDate,
    },
  })
  console.log('✅ Project cost entry ready')

  // ========================================================================
  // 8. UPDATE PAYROLL WITH DEDUCTION
  // ========================================================================
  console.log('📝 Updating payroll with deduction...')
  
  const updatedNetSalary = netSalary - deductionAmount
  
  await prisma.payroll.update({
    where: { id: payroll.id },
    data: {
      deductionsAmount: deductionAmount,
      deductionsAmountDecimal: deductionAmount,
      netSalary: updatedNetSalary,
      netSalaryDecimal: updatedNetSalary,
    },
  })
  console.log('✅ Payroll updated - New net salary:', updatedNetSalary)

  // ========================================================================
  // 9. REPORT DEFINITIONS
  // ========================================================================
  console.log('📝 Creating report definitions...')

  const reportDefinitions = [
    {
      type: 'PROJECT_PROFITABILITY',
      name: 'Project Profitability Report',
      nameAr: 'تقرير ربحية المشاريع',
      description: 'Comprehensive analysis of revenues and expenses for each project with net profit margin calculation.',
      descriptionAr: 'تحليل شامل للإيرادات والمصروفات لكل مشروع مع حساب هامش الربح الصافي.',
      category: 'projects',
      frequency: 'monthly',
      icon: 'trending_up',
      color: 'blue',
      displayOrder: 1,
    },
    {
      type: 'EQUIPMENT_OPERATION',
      name: 'Equipment Operation Log',
      nameAr: 'سجل تشغيل المعدة المالي',
      description: 'Track operating and maintenance costs for each equipment compared to work hours and productivity.',
      descriptionAr: 'تتبع تكاليف التشغيل والصيانة لكل معدة مقارنة بساعات العمل والإنتاجية.',
      category: 'equipment',
      frequency: 'daily',
      icon: 'construction',
      color: 'amber',
      displayOrder: 2,
    },
    {
      type: 'SUPPLIER_STATEMENT',
      name: 'Supplier Account Statement',
      nameAr: 'كشف حساب الموردين',
      description: 'Details of outstanding balances, due payments, and transaction history with suppliers.',
      descriptionAr: 'تفاصيل المديونيات، الدفعات المستحقة، وتاريخ التعاملات مع الموردين.',
      category: 'financial',
      frequency: 'quarterly',
      icon: 'inventory_2',
      color: 'purple',
      displayOrder: 3,
    },
    {
      type: 'LABOR_COSTS',
      name: 'Labor Cost Report',
      nameAr: 'تقرير تكاليف العمالة',
      description: 'Analysis of salaries, overtime, and allowances distributed by projects and departments.',
      descriptionAr: 'تحليل رواتب، إضافي، وبدلات العمالة موزعة حسب المشاريع والأقسام.',
      category: 'payroll',
      frequency: 'monthly',
      icon: 'group',
      color: 'indigo',
      displayOrder: 4,
    },
    {
      type: 'FUEL_CONSUMPTION',
      name: 'Fuel and Fuel Consumption',
      nameAr: 'استهلاك الوقود والمحروقات',
      description: 'Monitor diesel consumption for equipment and trucks and detect violations.',
      descriptionAr: 'مراقبة دقيقة لاستهلاك الديزل للمعدات والشاحنات وكشف التجاوزات.',
      category: 'equipment',
      frequency: 'weekly',
      icon: 'gas_meter',
      color: 'teal',
      displayOrder: 5,
    },
    {
      type: 'VAT_SUMMARY',
      name: 'VAT Summary',
      nameAr: 'ملخص ضريبة القيمة المضافة',
      description: 'Summary of VAT calculations including taxable purchases, revenue, and net tax due.',
      descriptionAr: 'ملخص حسابات ضريبة القيمة المضافة بما في ذلك المشتريات والإيرادات الخاضعة للضريبة.',
      category: 'financial',
      frequency: 'quarterly',
      icon: 'receipt_long',
      color: 'green',
      displayOrder: 6,
    },
    {
      type: 'PAYROLL_SUMMARY',
      name: 'Payroll Summary',
      nameAr: 'ملخص الرواتب',
      description: 'Monthly payroll summary including gross salaries, deductions, and net payments.',
      descriptionAr: 'ملخص الرواتب الشهري بما في ذلك الرواتب الإجمالية والخصومات وصافي المدفوعات.',
      category: 'payroll',
      frequency: 'monthly',
      icon: 'payments',
      color: 'emerald',
      displayOrder: 7,
    },
    {
      type: 'EQUIPMENT_UTILIZATION',
      name: 'Equipment Utilization Report',
      nameAr: 'تقرير استغلال المعدات',
      description: 'Track equipment utilization rates, downtime hours, and maintenance requirements.',
      descriptionAr: 'تتبع معدلات استغلال المعدات وساعات التوقف ومتطلبات الصيانة.',
      category: 'equipment',
      frequency: 'monthly',
      icon: 'engineering',
      color: 'cyan',
      displayOrder: 8,
    },
    {
      type: 'DOCUMENT_EXPIRY',
      name: 'Document Expiry Report',
      nameAr: 'تقرير انتهاء المستندات',
      description: 'Track employee and equipment documents expiring soon or already expired.',
      descriptionAr: 'تتبع مستندات الموظفين والمعدات التي تنتهي صلاحيتها قريباً أو منتهية.',
      category: 'documents',
      frequency: 'daily',
      icon: 'warning',
      color: 'orange',
      displayOrder: 9,
    },
  ]

  for (const reportDef of reportDefinitions) {
    await prisma.reportDefinition.upsert({
      where: { type: reportDef.type },
      update: reportDef,
      create: reportDef,
    })
  }
  console.log('✅ Report definitions ready:', reportDefinitions.length, 'reports')

  // ========================================================================
  // SUMMARY
  // ========================================================================
  console.log('')
  console.log('🎉 Development seed completed successfully!')
  console.log('')
  console.log('📋 Created/Updated Records:')
  console.log('  ├─ Admin User: admin@heavyops.sa / admin123 (ADMIN)')
  console.log('  ├─ Employee: EMP-1 - Employee 1 (Operator, Operations)')
  console.log('  ├─ Project: PRJ-1 - Test Project (ACTIVE)')
  console.log('  ├─ Payroll:', currentMonth, '/', currentYear)
  console.log('  │   ├─ Basic Salary:', basicSalary)
  console.log('  │   ├─ Housing:', housing)
  console.log('  │   ├─ Transportation:', transportation)
  console.log('  │   ├─ Deductions:', deductionAmount, '(absence)')
  console.log('  │   └─ Net Salary:', updatedNetSalary)
  console.log('  ├─ Deduction: ABSENCE -', deductionAmount)
  console.log('  ├─ Project Cost Entry: Linked to PRJ-1')
  console.log('  └─ Report Definitions:', reportDefinitions.length, 'reports available')
  console.log('')
  console.log('🔐 Login: admin@heavyops.sa / admin123')
  console.log('📄 API Test: GET /api/employees/EMP-1')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
