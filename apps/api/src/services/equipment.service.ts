import { prisma } from '@/lib/prisma.js'
import {
  CreateEquipmentInput,
  UpdateEquipmentInput,
  EquipmentQuery,
  CreateMaintenanceRecordInput,
  UpdateMaintenanceRecordInput,
} from '@/validators/equipment.validator.js'
import { NotFoundError, ConflictError } from '@/middleware/errorHandler.js'

// ============================================================================
// EQUIPMENT SERVICE
// ============================================================================

export interface EquipmentWithRelations {
  id: string
  name: string
  nameAr: string | null
  code: string
  type: string
  brand: string | null
  model: string | null
  serialNumber: string | null
  status: string
  currentProjectId: string | null
  purchaseDate: Date | null
  purchaseCost: number | null
  lastMaintenanceDate: Date | null
  nextMaintenanceDate: Date | null
  hourlyCost: number | null
  dailyCost: number | null
  location: string | null
  operator: string | null
  fuelConsumption: number | null
  description: string | null
  createdAt: Date
  updatedAt: Date
  project: { id: string; name: string; code: string } | null
  _count: { maintenanceRecords: number }
}

export interface PaginatedEquipment {
  data: EquipmentWithRelations[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export class EquipmentService {
  // ============================================================================
  // GET ALL EQUIPMENT
  // ============================================================================
  async getAllEquipment(query: EquipmentQuery): Promise<PaginatedEquipment> {
    const where: any = {}

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.type) {
      where.type = query.type
    }

    if (query.projectId) {
      where.currentProjectId = query.projectId
    }

    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          project: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { maintenanceRecords: true },
          },
        },
      }),
      prisma.equipment.count({ where }),
    ])

    const totalPages = Math.ceil(total / query.limit)

    return {
      data: equipment,
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

  // ============================================================================
  // GET EQUIPMENT BY ID
  // ============================================================================
  async getEquipmentById(id: string): Promise<EquipmentWithRelations & { maintenanceRecords: any[] }> {
    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        maintenanceRecords: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        _count: {
          select: { maintenanceRecords: true },
        },
      },
    })

    if (!equipment) {
      throw new NotFoundError('المعدة غير موجودة - Equipment not found')
    }

    return equipment as any
  }

  // ============================================================================
  // CREATE EQUIPMENT
  // ============================================================================
  async createEquipment(data: CreateEquipmentInput) {
    // Check if code already exists
    const existing = await prisma.equipment.findUnique({
      where: { code: data.code },
    })

    if (existing) {
      throw new ConflictError('الكود مستخدم بالفعل - Equipment code already exists')
    }

    // Check if project exists
    if (data.currentProjectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.currentProjectId },
      })

      if (!project) {
        throw new NotFoundError('المشروع غير موجود - Project not found')
      }
    }

    const equipment = await prisma.equipment.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        code: data.code,
        type: data.type,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        status: data.status,
        currentProjectId: data.currentProjectId,
        purchaseDate: data.purchaseDate,
        purchaseCost: data.purchaseCost,
        lastMaintenanceDate: data.lastMaintenanceDate,
        nextMaintenanceDate: data.nextMaintenanceDate,
        hourlyCost: data.hourlyCost,
        dailyCost: data.dailyCost,
        location: data.location,
        operator: data.operator,
        fuelConsumption: data.fuelConsumption,
        description: data.description,
      },
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { maintenanceRecords: true },
        },
      },
    })

    return equipment
  }

  // ============================================================================
  // UPDATE EQUIPMENT
  // ============================================================================
  async updateEquipment(data: UpdateEquipmentInput) {
    // Check if equipment exists
    const existing = await prisma.equipment.findUnique({
      where: { id: data.id },
    })

    if (!existing) {
      throw new NotFoundError('المعدة غير موجودة - Equipment not found')
    }

    // Check if code is being changed and if it conflicts
    if (data.code && data.code !== existing.code) {
      const codeExists = await prisma.equipment.findUnique({
        where: { code: data.code },
      })

      if (codeExists) {
        throw new ConflictError('الكود مستخدم بالفعل - Equipment code already exists')
      }
    }

    // Check if project exists
    if (data.currentProjectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.currentProjectId },
      })

      if (!project) {
        throw new NotFoundError('المشروع غير موجود - Project not found')
      }
    }

    const { id, ...updateData } = data

    const equipment = await prisma.equipment.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { maintenanceRecords: true },
        },
      },
    })

    return equipment
  }

  // ============================================================================
  // DELETE EQUIPMENT
  // ============================================================================
  async deleteEquipment(id: string) {
    // Check if equipment exists
    const existing = await prisma.equipment.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('المعدة غير موجودة - Equipment not found')
    }

    await prisma.equipment.delete({
      where: { id },
    })

    return { message: 'تم حذف المعدة بنجاح - Equipment deleted successfully' }
  }

  // ============================================================================
  // GET MAINTENANCE DUE EQUIPMENT
  // ============================================================================
  async getMaintenanceDue(withinDays: number = 7) {
    const currentDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + withinDays)

    const equipment = await prisma.equipment.findMany({
      where: {
        nextMaintenanceDate: {
          lte: dueDate,
        },
        status: {
          not: 'RETIRED',
        },
      },
      include: {
        project: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { maintenanceRecords: true },
        },
      },
      orderBy: {
        nextMaintenanceDate: 'asc',
      },
    })

    return equipment
  }

  // ============================================================================
  // CREATE MAINTENANCE RECORD
  // ============================================================================
  async createMaintenanceRecord(data: CreateMaintenanceRecordInput) {
    // Check if equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id: data.equipmentId },
    })

    if (!equipment) {
      throw new NotFoundError('المعدة غير موجودة - Equipment not found')
    }

    // Create maintenance record
    const record = await prisma.maintenanceRecord.create({
      data: {
        equipmentId: data.equipmentId,
        type: data.type,
        title: data.title,
        description: data.description,
        cost: data.cost,
        date: data.date,
        technician: data.technician,
        nextDueDate: data.nextDueDate,
        notes: data.notes,
      },
    })

    // Update equipment last maintenance date
    await prisma.equipment.update({
      where: { id: data.equipmentId },
      data: {
        lastMaintenanceDate: data.date,
        nextMaintenanceDate: data.nextDueDate,
        status: data.nextDueDate && data.nextDueDate < new Date() ? 'MAINTENANCE' : equipment.status,
      },
    })

    return record
  }

  // ============================================================================
  // UPDATE MAINTENANCE RECORD
  // ============================================================================
  async updateMaintenanceRecord(data: UpdateMaintenanceRecordInput) {
    const { id, ...updateData } = data

    // Check if record exists
    const existing = await prisma.maintenanceRecord.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('سجل الصيانة غير موجود - Maintenance record not found')
    }

    const record = await prisma.maintenanceRecord.update({
      where: { id },
      data: updateData,
    })

    // Update equipment if nextDueDate changed
    if (updateData.nextDueDate || updateData.date) {
      const equipment = await prisma.equipment.findUnique({
        where: { id: existing.equipmentId },
      })

      if (equipment) {
        await prisma.equipment.update({
          where: { id: existing.equipmentId },
          data: {
            lastMaintenanceDate: updateData.date || existing.date,
            nextMaintenanceDate: updateData.nextDueDate || existing.nextDueDate,
          },
        })
      }
    }

    return record
  }

  // ============================================================================
  // GET MAINTENANCE RECORDS
  // ============================================================================
  async getMaintenanceRecords(equipmentId: string) {
    const records = await prisma.maintenanceRecord.findMany({
      where: { equipmentId },
      orderBy: { date: 'desc' },
    })

    return records
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================
export const equipmentService = new EquipmentService()
