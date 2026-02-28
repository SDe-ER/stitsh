import { PrismaClient, UserRole, ProjectStatus, EquipmentStatus, EquipmentType, MaintenanceType, EmployeeStatus, InvoiceStatus, ExpenseCategory, NotificationType, AlertSeverity, AlertType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting HeavyOps ERP database seed...')

  // ========================================================================
  // 1. USERS
  // ========================================================================
  console.log('📝 Creating users...')

  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const managerPassword = await bcrypt.hash('Manager123!', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@heavyops.sa' },
    update: {},
    create: {
      email: 'admin@heavyops.sa',
      name: 'System Administrator',
      nameAr: 'مدير النظام',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
      phone: '+966501234567',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  const manager = await prisma.user.upsert({
    where: { email: 'khalid@heavyops.sa' },
    update: {},
    create: {
      email: 'khalid@heavyops.sa',
      name: 'Khalid Al-Otaibi',
      nameAr: 'خالد العتيبي',
      passwordHash: managerPassword,
      role: UserRole.MANAGER,
      isActive: true,
      phone: '+966502345678',
    },
  })
  console.log('✅ Manager user created:', manager.email)

  // ========================================================================
  // 2. CLIENTS
  // ========================================================================
  console.log('📝 Creating clients...')

  const client1 = await prisma.client.create({
    data: {
      name: 'Saudi Ministry of Municipalities and Housing',
      nameAr: 'وزارة الشؤون البلدية والقروية والإسكان',
      contactPerson: 'Ahmed Al-Saud',
      phone: '+966114567890',
      email: 'contracts@momra.gov.sa',
      address: 'Riyadh, Olaya Street',
      city: 'Riyadh',
      crNumber: '1010123456',
      vatNumber: '300123456700003',
    },
  })

  const client2 = await prisma.client.create({
    data: {
      name: 'Al Rajhi Investment Company',
      nameAr: 'شركة الراجحي للاستثمار',
      contactPerson: 'Mohammed Al-Rajhi',
      phone: '+966114567891',
      email: 'projects@alrajhi-invest.sa',
      address: 'Riyadh, King Fahd Road',
      city: 'Riyadh',
      crNumber: '1010123457',
      vatNumber: '300123456700004',
    },
  })

  const client3 = await prisma.client.create({
    data: {
      name: 'Al-Khozama Hotel Company',
      nameAr: 'شركة فنادق الخزامى',
      contactPerson: 'Abdullah Al-Khozam',
      phone: '+966114567892',
      email: 'development@alkhozama.com',
      address: 'Jeddah, Corniche Road',
      city: 'Jeddah',
      crNumber: '1010123458',
      vatNumber: '300123456700005',
    },
  })
  console.log('✅ 3 clients created')

  // ========================================================================
  // 3. PROJECTS
  // ========================================================================
  console.log('📝 Creating projects...')

  const project1 = await prisma.project.create({
    data: {
      name: 'Riyadh Metro Extension - Phase 2',
      nameAr: 'امتداد مترو الرياض - المرحلة الثانية',
      code: 'RM-2024-001',
      clientId: client1.id,
      managerId: manager.id,
      status: ProjectStatus.ACTIVE,
      budget: 85000000,
      contractValue: 95000000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-12-31'),
      location: 'Riyadh, Saudi Arabia',
      latitude: 24.7136,
      longitude: 46.6753,
      progressPercent: 35,
      description: 'Construction of metro extension from King Abdullah Financial District to King Khalid International Airport',
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Al Rajhi Business Tower',
      nameAr: 'برج الراجحي للأعمال',
      code: 'AR-2024-002',
      clientId: client2.id,
      managerId: manager.id,
      status: ProjectStatus.ACTIVE,
      budget: 120000000,
      contractValue: 135000000,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2027-06-30'),
      location: 'Riyadh, King Fahd Road',
      latitude: 24.7254,
      longitude: 46.6587,
      progressPercent: 20,
      description: '50-story commercial tower with 5 floors of parking',
    },
  })

  const project3 = await prisma.project.create({
    data: {
      name: 'Al-Khozama Residential Complex',
      nameAr: 'مجمع الخزامى السكني',
      code: 'KH-2024-003',
      clientId: client3.id,
      managerId: manager.id,
      status: ProjectStatus.ACTIVE,
      budget: 45000000,
      contractValue: 52000000,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2026-08-31'),
      location: 'Jeddah, Al-Hamra District',
      latitude: 21.5433,
      longitude: 39.1728,
      progressPercent: 15,
      description: 'Gated community with 120 villas and amenities',
    },
  })
  console.log('✅ 3 projects created')

  // ========================================================================
  // 4. PROJECT FINANCIALS
  // ========================================================================
  console.log('📝 Creating project financials...')

  await prisma.projectFinancial.create({
    data: {
      projectId: project1.id,
      revenue: 33250000,
      expenses: 21250000,
      profit: 12000000,
      profitMargin: 12.63,
      pendingPayments: 8500000,
      collectedAmount: 24750000,
    },
  })

  await prisma.projectFinancial.create({
    data: {
      projectId: project2.id,
      revenue: 27000000,
      expenses: 19800000,
      profit: 7200000,
      profitMargin: 5.33,
      pendingPayments: 12000000,
      collectedAmount: 15000000,
    },
  })

  await prisma.projectFinancial.create({
    data: {
      projectId: project3.id,
      revenue: 7800000,
      expenses: 5850000,
      profit: 1950000,
      profitMargin: 3.75,
      pendingPayments: 3900000,
      collectedAmount: 3900000,
    },
  })
  console.log('✅ Project financials created')

  // ========================================================================
  // 5. PROJECT MILESTONES
  // ========================================================================
  console.log('📝 Creating milestones...')

  await prisma.projectMilestone.createMany({
    data: [
      // Project 1 Milestones
      {
        projectId: project1.id,
        name: 'Site Preparation & Excavation',
        nameAr: 'تحضير الموقع والحفر',
        dueDate: new Date('2024-06-30'),
        isCompleted: true,
        completedAt: new Date('2024-06-20'),
        progress: 100,
      },
      {
        projectId: project1.id,
        name: 'Foundation Work',
        nameAr: 'أعمال الأساسات',
        dueDate: new Date('2024-12-31'),
        isCompleted: true,
        completedAt: new Date('2024-12-15'),
        progress: 100,
      },
      {
        projectId: project1.id,
        name: 'Station Construction - Phase 1',
        nameAr: 'بناء المحطات - المرحلة الأولى',
        dueDate: new Date('2025-06-30'),
        isCompleted: false,
        progress: 60,
      },
      {
        projectId: project1.id,
        name: 'Track Installation',
        nameAr: 'تركيب القضبان',
        dueDate: new Date('2026-03-31'),
        isCompleted: false,
        progress: 20,
      },
      // Project 2 Milestones
      {
        projectId: project2.id,
        name: 'Foundation & Piling',
        nameAr: 'الأساسات والركائز',
        dueDate: new Date('2024-12-31'),
        isCompleted: true,
        completedAt: new Date('2024-12-10'),
        progress: 100,
      },
      {
        projectId: project2.id,
        name: 'Structural Steel - Phase 1',
        nameAr: 'الهيكل الفولاذي - المرحلة الأولى',
        dueDate: new Date('2025-08-31'),
        isCompleted: false,
        progress: 40,
      },
      // Project 3 Milestones
      {
        projectId: project3.id,
        name: 'Land Development',
        nameAr: 'تطوير الأرض',
        dueDate: new Date('2024-12-31'),
        isCompleted: true,
        completedAt: new Date('2024-12-05'),
        progress: 100,
      },
      {
        projectId: project3.id,
        name: 'Infrastructure Works',
        nameAr: 'أعمال البنية التحتية',
        dueDate: new Date('2025-06-30'),
        isCompleted: false,
        progress: 30,
      },
    ],
  })
  console.log('✅ 8 milestones created')

  // ========================================================================
  // 6. SUPPLIERS
  // ========================================================================
  console.log('📝 Creating suppliers...')

  await prisma.supplier.createMany({
    data: [
      {
        name: 'Saudi Building Materials Company',
        nameAr: 'شركة مواد البناء السعودية',
        contactPerson: 'Rashid Al-Ghamdi',
        phone: '+966503456789',
        email: 'sales@saudi-build.sa',
        address: 'Riyadh, Industrial City',
        category: 'Construction Materials',
        rating: 5,
        taxNumber: '300987654321001',
        crNumber: '1010222333',
        isActive: true,
      },
      {
        name: 'Al-Fahad Heavy Equipment Rental',
        nameAr: 'معدات الفهد الثقيلة',
        contactPerson: 'Fahad Al-Otaibi',
        phone: '+966504567890',
        email: 'rentals@alfahad-equip.sa',
        address: 'Riyadh, Exit 25',
        category: 'Equipment Rental',
        rating: 4,
        taxNumber: '300987654321002',
        crNumber: '1010222334',
        isActive: true,
      },
      {
        name: 'Gulf Cement Factory',
        nameAr: 'مصنع اسمنت الخليج',
        contactPerson: 'Khaled Al-Harbi',
        phone: '+966505678901',
        email: 'orders@gulfcement.com',
        address: 'Eastern Province',
        category: 'Cement & Concrete',
        rating: 5,
        taxNumber: '300987654321003',
        crNumber: '1010222335',
        isActive: true,
      },
      {
        name: 'Al-Yamama Steel Corporation',
        nameAr: 'مؤسسة اليمامة للحديد',
        contactPerson: 'Abdulrahman Al-Qahtani',
        phone: '+966506789012',
        email: 'sales@alyamama-steel.sa',
        address: 'Riyadh, Second Industrial City',
        category: 'Steel & Metal',
        rating: 4,
        taxNumber: '300987654321004',
        crNumber: '1010222336',
        isActive: true,
      },
    ],
  })
  console.log('✅ 4 suppliers created')

  // ========================================================================
  // 7. EQUIPMENT
  // ========================================================================
  console.log('📝 Creating equipment...')

  const equipment1 = await prisma.equipment.create({
    data: {
      name: 'Caterpillar 320 GC Excavator',
      nameAr: 'حفار كاتربيلر 320',
      code: 'EQ-001',
      type: EquipmentType.EXCAVATOR,
      brand: 'Caterpillar',
      model: '320 GC',
      serialNumber: 'CAT320GC2024001',
      status: EquipmentStatus.ACTIVE,
      currentProjectId: project1.id,
      purchaseDate: new Date('2023-02-15'),
      purchaseCost: 920000,
      hourlyCost: 380,
      lastMaintenanceDate: new Date('2024-02-10'),
      nextMaintenanceDate: new Date('2024-08-10'),
    },
  })

  const equipment2 = await prisma.equipment.create({
    data: {
      name: 'JCB 3CX Backhoe Loader',
      nameAr: 'لودر JCB 3CX',
      code: 'EQ-002',
      type: EquipmentType.LOADER,
      brand: 'JCB',
      model: '3CX',
      serialNumber: 'JCB3CX2024002',
      status: EquipmentStatus.ACTIVE,
      currentProjectId: project2.id,
      purchaseDate: new Date('2023-05-20'),
      purchaseCost: 485000,
      hourlyCost: 220,
      lastMaintenanceDate: new Date('2024-03-01'),
      nextMaintenanceDate: new Date('2024-09-01'),
    },
  })

  const equipment3 = await prisma.equipment.create({
    data: {
      name: 'Metso Lokotrack LT1213 Mobile Crusher',
      nameAr: 'كسارة متنقلة Metso',
      code: 'EQ-003',
      type: EquipmentType.CRUSHER,
      brand: 'Metso',
      model: 'Lokotrack LT1213',
      serialNumber: 'METSO12132024003',
      status: EquipmentStatus.MAINTENANCE,
      currentProjectId: project3.id,
      purchaseDate: new Date('2022-09-10'),
      purchaseCost: 2850000,
      hourlyCost: 550,
      lastMaintenanceDate: new Date('2024-01-20'),
      nextMaintenanceDate: new Date('2024-05-20'),
    },
  })

  const equipment4 = await prisma.equipment.create({
    data: {
      name: 'Volvo FMX 500 Dump Truck',
      nameAr: 'شاحنة نقل Volvo FMX',
      code: 'EQ-004',
      type: EquipmentType.TRUCK,
      brand: 'Volvo',
      model: 'FMX 500',
      serialNumber: 'VOLVOFMX5002024004',
      status: EquipmentStatus.ACTIVE,
      currentProjectId: project1.id,
      purchaseDate: new Date('2023-08-15'),
      purchaseCost: 680000,
      hourlyCost: 180,
      lastMaintenanceDate: new Date('2024-02-15'),
      nextMaintenanceDate: new Date('2024-08-15'),
    },
  })

  const equipment5 = await prisma.equipment.create({
    data: {
      name: 'Liebherr LTM 1120-4.1 Mobile Crane',
      nameAr: 'رافعة متنقلة Liebherr',
      code: 'EQ-005',
      type: EquipmentType.CRANE,
      brand: 'Liebherr',
      model: 'LTM 1120-4.1',
      serialNumber: 'LIEBHERR11202024005',
      status: EquipmentStatus.ACTIVE,
      currentProjectId: project2.id,
      purchaseDate: new Date('2022-04-20'),
      purchaseCost: 4200000,
      hourlyCost: 950,
      lastMaintenanceDate: new Date('2024-01-25'),
      nextMaintenanceDate: new Date('2024-07-25'),
    },
  })
  console.log('✅ 5 equipment created')

  // ========================================================================
  // 8. MAINTENANCE RECORDS
  // ========================================================================
  console.log('📝 Creating maintenance records...')

  await prisma.maintenanceRecord.createMany({
    data: [
      {
        equipmentId: equipment1.id,
        type: MaintenanceType.PREVENTIVE,
        title: 'Regular 500-Hour Service',
        description: 'Engine oil change, filter replacement, hydraulic system check',
        cost: 12500,
        date: new Date('2024-02-10'),
        technician: 'Ahmed Mechanic',
        nextDueDate: new Date('2024-08-10'),
      },
      {
        equipmentId: equipment3.id,
        type: MaintenanceType.CORRECTIVE,
        title: 'Jaw Replacement',
        description: 'Replace worn crusher jaw and liners',
        cost: 45000,
        date: new Date('2024-01-20'),
        technician: 'Mohammed Specialist',
        nextDueDate: new Date('2024-05-20'),
      },
      {
        equipmentId: equipment5.id,
        type: MaintenanceType.PREVENTIVE,
        title: 'Annual Inspection',
        description: 'Complete crane inspection including cable and safety systems',
        cost: 28000,
        date: new Date('2024-01-25'),
        technician: 'Liebherr Service Team',
        nextDueDate: new Date('2024-07-25'),
      },
    ],
  })
  console.log('✅ Maintenance records created')

  // ========================================================================
  // 9. EMPLOYEES
  // ========================================================================
  console.log('📝 Creating employees...')

  await prisma.employee.createMany({
    data: [
      {
        name: 'Fahad Mohammed Al-Otaibi',
        nameAr: 'فهد محمد العتيبي',
        employeeId: 'EMP-001',
        nationality: 'Saudi',
        jobTitle: 'Site Engineer',
        department: 'Engineering',
        salary: 18000,
        phone: '+966507890123',
        email: 'fahad.alotaibi@heavyops.sa',
        projectId: project1.id,
        status: EmployeeStatus.ACTIVE,
        joinDate: new Date('2023-01-15'),
        bankName: 'Al Rajhi Bank',
        bankAccount: 'SA1234567890123456789012',
        iban: 'SA3510000000123456789012',
      },
      {
        name: 'Mohammed Ali Hassan',
        nameAr: 'محمد علي حسن',
        employeeId: 'EMP-002',
        nationality: 'Egyptian',
        jobTitle: 'Foreman',
        department: 'Construction',
        salary: 5500,
        iqamaNumber: '2451234567',
        iqamaExpiry: new Date('2024-05-15'), // EXPIRING SOON - will trigger alert
        passportNumber: 'A98765432',
        passportExpiry: new Date('2025-08-20'),
        phone: '+966508901234',
        projectId: project1.id,
        status: EmployeeStatus.ACTIVE,
        joinDate: new Date('2023-03-10'),
        bankName: 'Al Rajhi Bank',
        bankAccount: 'SA9876543210987654321098',
        iban: 'SA5610000000987654321098',
      },
      {
        name: 'Rajendra Kumar Sharma',
        nameAr: 'راجندرا كومار شارما',
        employeeId: 'EMP-003',
        nationality: 'Indian',
        jobTitle: 'Heavy Equipment Operator',
        department: 'Construction',
        salary: 3800,
        iqamaNumber: '2461234568',
        iqamaExpiry: new Date('2025-12-31'),
        passportNumber: 'X87654321',
        passportExpiry: new Date('2026-03-15'),
        phone: '+966509012345',
        projectId: project2.id,
        status: EmployeeStatus.ACTIVE,
        joinDate: new Date('2023-06-01'),
        bankName: 'Alinma Bank',
        bankAccount: 'SA5678901234567890123456',
        iban: 'SA7210000000567890123456',
      },
      {
        name: 'Abdul Rehman Khan',
        nameAr: 'عبد الرحمن خان',
        employeeId: 'EMP-004',
        nationality: 'Pakistani',
        jobTitle: 'Electrician',
        department: 'Electrical',
        salary: 4200,
        iqamaNumber: '2471234569',
        iqamaExpiry: new Date('2025-08-10'),
        passportNumber: 'P76543210',
        passportExpiry: new Date('2026-01-20'),
        phone: '+966510123456',
        projectId: project2.id,
        status: EmployeeStatus.ACTIVE,
        joinDate: new Date('2023-04-20'),
        bankName: 'Saudi National Bank',
        bankAccount: 'SA3456789012345678901234',
        iban: 'SA8810000000345678901234',
      },
      {
        name: 'Kumara Bandara',
        nameAr: 'كومارا باندرا',
        employeeId: 'EMP-005',
        nationality: 'Sri Lankan',
        jobTitle: 'Construction Worker',
        department: 'Construction',
        salary: 2800,
        iqamaNumber: '2481234570',
        iqamaExpiry: new Date('2025-06-30'),
        passportNumber: 'S65432109',
        passportExpiry: new Date('2025-11-15'),
        phone: '+966511234567',
        projectId: project3.id,
        status: EmployeeStatus.ACTIVE,
        joinDate: new Date('2023-09-15'),
        bankName: 'Al Rajhi Bank',
        bankAccount: 'SA7890123456789012345678',
        iban: 'SA9210000000789012345678',
      },
      {
        name: 'Abdukarim Musa',
        nameAr: 'عبدالكريم موسى',
        employeeId: 'EMP-006',
        nationality: 'Sudanese',
        jobTitle: 'Welder',
        department: 'Construction',
        salary: 3500,
        iqamaNumber: '2491234571',
        iqamaExpiry: new Date('2026-02-28'),
        passportNumber: 'SD54321098',
        passportExpiry: new Date('2026-07-10'),
        phone: '+966512345678',
        projectId: project1.id,
        status: EmployeeStatus.ACTIVE,
        joinDate: new Date('2023-07-01'),
        bankName: 'Alinma Bank',
        bankAccount: 'SA8901234567890123456789',
        iban: 'SA5910000000890123456789',
      },
      {
        name: 'Khalid Ahmed Al-Qahtani',
        nameAr: 'خالد أحمد القحطاني',
        employeeId: 'EMP-007',
        nationality: 'Saudi',
        jobTitle: 'Safety Officer',
        department: 'Safety',
        salary: 14000,
        phone: '+966513456789',
        email: 'khalid.qahtani@heavyops.sa',
        projectId: project2.id,
        status: EmployeeStatus.ACTIVE,
        joinDate: new Date('2023-02-01'),
        bankName: 'Al Rajhi Bank',
        bankAccount: 'SA2345678901234567890123',
        iban: 'SA1410000000234567890123',
      },
      {
        name: 'Suresh Kumar',
        nameAr: 'سوريش كومار',
        employeeId: 'EMP-008',
        nationality: 'Indian',
        jobTitle: 'Crane Operator',
        department: 'Construction',
        salary: 5500,
        iqamaNumber: '2501234572',
        iqamaExpiry: new Date('2025-10-15'),
        passportNumber: 'X43210987',
        passportExpiry: new Date('2026-04-20'),
        phone: '+966514567890',
        projectId: project2.id,
        status: EmployeeStatus.ACTIVE,
        joinDate: new Date('2023-05-15'),
        bankName: 'Saudi National Bank',
        bankAccount: 'SA4567890123456789012345',
        iban: 'SA2510000000456789012345',
      },
      {
        name: 'Musa Ibrahim',
        nameAr: 'موسى إبراهيم',
        employeeId: 'EMP-009',
        nationality: 'Nigerian',
        jobTitle: 'Security Guard',
        department: 'Security',
        salary: 3000,
        iqamaNumber: '2511234573',
        iqamaExpiry: new Date('2024-04-30'), // EXPIRED - will trigger alert
        passportNumber: 'N32109876',
        passportExpiry: new Date('2025-09-25'),
        phone: '+966515678901',
        projectId: project3.id,
        status: EmployeeStatus.ACTIVE,
        joinDate: new Date('2023-11-01'),
        bankName: 'Al Rajhi Bank',
        bankAccount: 'SA5678901234567890123456',
        iban: 'SA3610000000567890123456',
      },
      {
        name: 'Saad Abdullah Al-Dossari',
        nameAr: 'سعد عبدالله الدوسري',
        employeeId: 'EMP-010',
        nationality: 'Saudi',
        jobTitle: 'Project Accountant',
        department: 'Finance',
        salary: 16000,
        phone: '+966516789012',
        email: 'saad.aldossari@heavyops.sa',
        projectId: project3.id,
        status: EmployeeStatus.ACTIVE,
        joinDate: new Date('2023-01-10'),
        bankName: 'Alinma Bank',
        bankAccount: 'SA6789012345678901234567',
        iban: 'SA7010000000678901234567',
      },
    ],
  })
  console.log('✅ 10 employees created')

  // ========================================================================
  // 10. INVOICES
  // ========================================================================
  console.log('📝 Creating invoices...')

  await prisma.invoice.createMany({
    data: [
      {
        projectId: project1.id,
        clientId: client1.id,
        invoiceNumber: 'INV-2024-001',
        amount: 8500000,
        taxRate: 0.15,
        tax: 1275000,
        total: 9775000,
        status: InvoiceStatus.PAID,
        issueDate: new Date('2024-02-01'),
        dueDate: new Date('2024-03-01'),
        paidDate: new Date('2024-02-25'),
        paymentMethod: 'Bank Transfer',
        notes: 'Progress billing - Phase 1 completion',
      },
      {
        projectId: project1.id,
        clientId: client1.id,
        invoiceNumber: 'INV-2024-004',
        amount: 12000000,
        taxRate: 0.15,
        tax: 1800000,
        total: 13800000,
        status: InvoiceStatus.SENT,
        issueDate: new Date('2024-06-15'),
        dueDate: new Date('2024-07-15'),
        notes: 'Progress billing - Phase 2 milestone',
      },
      {
        projectId: project2.id,
        clientId: client2.id,
        invoiceNumber: 'INV-2024-007',
        amount: 15000000,
        taxRate: 0.15,
        tax: 2250000,
        total: 17250000,
        status: InvoiceStatus.PAID,
        issueDate: new Date('2024-05-01'),
        dueDate: new Date('2024-06-01'),
        paidDate: new Date('2024-05-28'),
        paymentMethod: 'Bank Transfer',
      },
      {
        projectId: project3.id,
        clientId: client3.id,
        invoiceNumber: 'INV-2024-010',
        amount: 3900000,
        taxRate: 0.15,
        tax: 585000,
        total: 4485000,
        status: InvoiceStatus.OVERDUE,
        issueDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        notes: 'Land development completion',
      },
    ],
  })
  console.log('✅ Invoices created')

  // ========================================================================
  // 11. EXPENSES
  // ========================================================================
  console.log('📝 Creating expenses...')

  await prisma.expense.createMany({
    data: [
      {
        projectId: project1.id,
        category: ExpenseCategory.MATERIALS,
        amount: 6500000,
        description: 'Cement, steel reinforcement, and structural materials',
        date: new Date('2024-02-15'),
        isApproved: true,
        approvedBy: admin.id,
        vendor: 'Saudi Building Materials Company',
        invoiceNumber: 'SBM-2024-0256',
      },
      {
        projectId: project1.id,
        category: ExpenseCategory.LABOR,
        amount: 4200000,
        description: 'Monthly wages for construction crew - February',
        date: new Date('2024-02-28'),
        isApproved: true,
        approvedBy: admin.id,
      },
      {
        projectId: project1.id,
        category: ExpenseCategory.FUEL,
        amount: 850000,
        description: 'Diesel for heavy equipment - February',
        date: new Date('2024-02-28'),
        isApproved: true,
        approvedBy: admin.id,
        vendor: 'Aramco Fuel Station',
      },
      {
        projectId: project1.id,
        category: ExpenseCategory.EQUIPMENT,
        amount: 1850000,
        description: 'Equipment rental and maintenance costs - February',
        date: new Date('2024-02-28'),
        isApproved: true,
        approvedBy: manager.id,
      },
      {
        projectId: project2.id,
        category: ExpenseCategory.MATERIALS,
        amount: 8900000,
        description: 'Structural steel and concrete for foundation',
        date: new Date('2024-05-20'),
        isApproved: true,
        approvedBy: manager.id,
        vendor: 'Al-Yamama Steel Corporation',
        invoiceNumber: 'YAM-2024-0189',
      },
      {
        projectId: project2.id,
        category: ExpenseCategory.LABOR,
        amount: 5400000,
        description: 'Monthly wages - May',
        date: new Date('2024-05-31'),
        isApproved: true,
        approvedBy: manager.id,
      },
      {
        projectId: project3.id,
        category: ExpenseCategory.MATERIALS,
        amount: 2100000,
        description: 'Building materials for infrastructure works',
        date: new Date('2024-06-15'),
        isApproved: true,
        approvedBy: manager.id,
        vendor: 'Gulf Cement Factory',
        invoiceNumber: 'GCF-2024-0145',
      },
      {
        projectId: project3.id,
        category: ExpenseCategory.LABOR,
        amount: 1800000,
        description: 'Monthly wages - June',
        date: new Date('2024-06-30'),
        isApproved: true,
        approvedBy: admin.id,
      },
    ],
  })
  console.log('✅ Expenses created')

  // ========================================================================
  // 12. ALERTS
  // ========================================================================
  console.log('📝 Creating alerts...')

  await prisma.alert.createMany({
    data: [
      {
        type: AlertType.IQAMA_EXPIRY,
        severity: AlertSeverity.HIGH,
        title: 'Iqama Expiry Warning - Mohammed Ali Hassan',
        titleAr: 'تحذير انتهاء الإقامة - محمد علي حسن',
        message: 'Employee EMP-002 (Mohammed Ali Hassan) iqama expires on 2024-05-15. Renewal required.',
        messageAr: 'إقامة الموظف EMP-002 (محمد علي حسن) تنتهي في 2024-05-15. مطلوب التجديد.',
        entityType: 'EMPLOYEE',
        entityId: 'EMP-002',
        isResolved: false,
        createdBy: admin.id,
      },
      {
        type: AlertType.IQAMA_EXPIRY,
        severity: AlertSeverity.CRITICAL,
        title: 'Iqama Expired - Musa Ibrahim',
        titleAr: 'انتهاء صلاحية الإقامة - موسى إبراهيم',
        message: 'Employee EMP-009 (Musa Ibrahim) iqama has expired on 2024-04-30. Immediate action required!',
        messageAr: 'إقامة الموظف EMP-009 (موسى إبراهيم) منتهية منذ 2024-04-30. مطلوب إجراء فوري!',
        entityType: 'EMPLOYEE',
        entityId: 'EMP-009',
        isResolved: false,
        createdBy: admin.id,
      },
      {
        type: AlertType.MAINTENANCE_DUE,
        severity: AlertSeverity.HIGH,
        title: 'Equipment Maintenance Overdue - Metso Mobile Crusher',
        titleAr: 'صيانة المعدات متأخرة - كسارة Metso المتنقلة',
        message: 'Equipment EQ-003 (Metso Lokotrack LT1213) maintenance was due on 2024-05-20. Currently in maintenance status.',
        messageAr: 'المعدة EQ-003 (كسارة Metso) كانت صيانتها مستحقة في 2024-05-20. حالياً قيد الصيانة.',
        entityType: 'EQUIPMENT',
        entityId: 'EQ-003',
        isResolved: false,
        createdBy: manager.id,
      },
      {
        type: AlertType.MAINTENANCE_DUE,
        severity: AlertSeverity.MEDIUM,
        title: 'Upcoming Maintenance - Caterpillar Excavator',
        titleAr: 'صيانة قادمة - حفار كاتربيلر',
        message: 'Equipment EQ-001 (Caterpillar 320 GC) scheduled maintenance due on 2024-08-10.',
        messageAr: 'المعدة EQ-001 (حفار كاتربيلر 320) صيانتها المجدولة في 2024-08-10.',
        entityType: 'EQUIPMENT',
        entityId: 'EQ-001',
        isResolved: false,
        createdBy: admin.id,
      },
      {
        type: AlertType.BUDGET_OVERRUN,
        severity: AlertSeverity.MEDIUM,
        title: 'Budget Alert - Al-Khozama Residential Complex',
        titleAr: 'تنبيه الميزانية - مجمع الخزامى السكني',
        message: 'Project KH-2024-003 has spent 13% of budget with only 15% progress. Monitor closely.',
        messageAr: 'المشروع KH-2024-003 أنفق 13% من الميزانية مع إنجاز 15% فقط. راقب عن كثب.',
        entityType: 'PROJECT',
        entityId: 'KH-2024-003',
        isResolved: false,
        createdBy: manager.id,
      },
    ],
  })
  console.log('✅ 5 alerts created')

  // ========================================================================
  // 13. NOTIFICATIONS
  // ========================================================================
  console.log('📝 Creating notifications...')

  await prisma.notification.createMany({
    data: [
      {
        userId: manager.id,
        type: NotificationType.WARNING,
        title: 'Critical: Employee Iqama Expired',
        titleAr: 'خطأ: إقامة موظف منتهية',
        message: 'Musa Ibrahim\'s iqama has expired. Immediate action required.',
        messageAr: 'إقامة موسى إبراهيم منتهية. مطلوب إجراء فوري.',
        link: '/employees/EMP-009',
        isRead: false,
      },
      {
        userId: manager.id,
        type: NotificationType.INFO,
        title: 'New Invoice Payment Received',
        titleAr: 'تم استلام دفعة فاتورة جديدة',
        message: 'Payment of SR 9,775,000 received for INV-2024-001',
        messageAr: 'تم استلام دفعة بقيمة 9,775,000 ريال للفاتورة INV-2024-001',
        link: '/financial/invoices/INV-2024-001',
        isRead: true,
      },
      {
        userId: admin.id,
        type: NotificationType.MAINTENANCE_DUE,
        title: 'Equipment Maintenance Required',
        titleAr: 'صيانة المعدات مطلوبة',
        message: 'Metso Crusher (EQ-003) maintenance is overdue',
        messageAr: 'صيانة كسارة Metso (EQ-003) متأخرة',
        link: '/equipment/EQ-003',
        isRead: false,
      },
    ],
  })
  console.log('✅ Notifications created')

  console.log('🎉 HeavyOps ERP database seeded successfully!')
  console.log('')
  console.log('📋 Summary:')
  console.log('  ├─ Users: 2 (Admin, Manager)')
  console.log('  ├─ Clients: 3')
  console.log('  ├─ Projects: 3 (Metro, Tower, Residential)')
  console.log('  ├─ Equipment: 5')
  console.log('  ├─ Employees: 10')
  console.log('  ├─ Suppliers: 4')
  console.log('  ├─ Invoices: 4')
  console.log('  ├─ Expenses: 8')
  console.log('  ├─ Alerts: 5')
  console.log('  └─ Notifications: 3')
  console.log('')
  console.log('🔐 Login Credentials:')
  console.log('  Admin:  admin@heavyops.sa / Admin123!')
  console.log('  Manager: khalid@heavyops.sa / Manager123!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
