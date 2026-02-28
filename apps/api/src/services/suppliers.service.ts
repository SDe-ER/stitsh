import { prisma } from '@/lib/prisma.js'
import {
  CreateClientInput,
  UpdateClientInput,
  ClientQuery,
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierQuery,
} from '@/validators/supplier.validator.js'
import { NotFoundError, ConflictError } from '@/middleware/errorHandler.js'

// ============================================================================
// SUPPLIERS & CLIENTS SERVICE
// ============================================================================

export interface ClientWithRelations {
  id: string
  name: string
  nameAr: string | null
  contactPerson: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  country: string
  crNumber: string | null
  vatNumber: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    projects: number
    invoices: number
  }
}

export interface SupplierWithRelations {
  id: string
  name: string
  nameAr: string | null
  contactPerson: string | null
  phone: string | null
  email: string | null
  address: string | null
  category: string | null
  rating: number | null
  taxNumber: string | null
  crNumber: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    purchaseOrders: number
  }
}

export class SuppliersService {
  // ============================================================================
  // CLIENT METHODS
  // ============================================================================

  /**
   * Get all clients with pagination
   */
  async getAllClients(query: ClientQuery) {
    const where: any = {}

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { nameAr: { contains: query.search, mode: 'insensitive' } },
        { contactPerson: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' }
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          _count: {
            select: {
              projects: true,
              invoices: true,
            },
          },
        },
      }),
      prisma.client.count({ where }),
    ])

    const totalPages = Math.ceil(total / query.limit)

    return {
      data: clients,
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

  /**
   * Get client by ID
   */
  async getClientById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          },
          take: 5,
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            status: true,
            issueDate: true,
          },
          take: 5,
          orderBy: { issueDate: 'desc' },
        },
      },
    })

    if (!client) {
      throw new NotFoundError('العميل غير موجود - Client not found')
    }

    return client
  }

  /**
   * Create new client
   */
  async createClient(data: CreateClientInput) {
    // Check if email already exists
    if (data.email) {
      const existingEmail = await prisma.client.findFirst({
        where: { email: data.email },
      })

      if (existingEmail) {
        throw new ConflictError('البريد الإلكتروني مستخدم بالفعل - Email already exists')
      }
    }

    // Check if CR number already exists
    if (data.crNumber) {
      const existingCR = await prisma.client.findFirst({
        where: { crNumber: data.crNumber },
      })

      if (existingCR) {
        throw new ConflictError('رقم السجل التجاري مستخدم بالفعل - CR number already exists')
      }
    }

    const client = await prisma.client.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        country: data.country || 'Saudi Arabia',
        crNumber: data.crNumber,
        vatNumber: data.vatNumber,
      },
      include: {
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
    })

    return client
  }

  /**
   * Update client
   */
  async updateClient(data: UpdateClientInput) {
    const { id, ...updateData } = data

    // Check if client exists
    const existing = await prisma.client.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('العميل غير موجود - Client not found')
    }

    // Check if email is being changed and if it conflicts
    if (updateData.email && updateData.email !== existing.email) {
      const emailExists = await prisma.client.findFirst({
        where: {
          email: updateData.email,
          id: { not: id },
        },
      })

      if (emailExists) {
        throw new ConflictError('البريد الإلكتروني مستخدم بالفعل - Email already exists')
      }
    }

    // Check if CR number is being changed and if it conflicts
    if (updateData.crNumber && updateData.crNumber !== existing.crNumber) {
      const crExists = await prisma.client.findFirst({
        where: {
          crNumber: updateData.crNumber,
          id: { not: id },
        },
      })

      if (crExists) {
        throw new ConflictError('رقم السجل التجاري مستخدم بالفعل - CR number already exists')
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
    })

    return client
  }

  /**
   * Delete client
   */
  async deleteClient(id: string) {
    // Check if client exists
    const existing = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projects: true,
            invoices: true,
          },
        },
      },
    })

    if (!existing) {
      throw new NotFoundError('العميل غير موجود - Client not found')
    }

    // Check if client has related records
    if (existing._count.projects > 0 || existing._count.invoices > 0) {
      throw new ConflictError(
        'لا يمكن حذف العميل بسبب وجود مشاريع أو فواتير مرتبطة - Cannot delete client with related projects or invoices'
      )
    }

    await prisma.client.delete({
      where: { id },
    })

    return { message: 'تم حذف العميل بنجاح - Client deleted successfully' }
  }

  // ============================================================================
  // SUPPLIER METHODS
  // ============================================================================

  /**
   * Get all suppliers with pagination
   */
  async getAllSuppliers(query: SupplierQuery) {
    const where: any = {}

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { nameAr: { contains: query.search, mode: 'insensitive' } },
        { contactPerson: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    if (query.category) {
      where.category = { contains: query.category, mode: 'insensitive' }
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          _count: {
            select: {
              purchaseOrders: true,
            },
          },
        },
      }),
      prisma.supplier.count({ where }),
    ])

    const totalPages = Math.ceil(total / query.limit)

    return {
      data: suppliers,
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

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
        purchaseOrders: {
          take: 10,
          orderBy: { orderedAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            orderedAt: true,
          },
        },
      },
    })

    if (!supplier) {
      throw new NotFoundError('المورد غير موجود - Supplier not found')
    }

    return supplier
  }

  /**
   * Create new supplier
   */
  async createSupplier(data: CreateSupplierInput) {
    // Check if email already exists
    if (data.email) {
      const existingEmail = await prisma.supplier.findFirst({
        where: { email: data.email },
      })

      if (existingEmail) {
        throw new ConflictError('البريد الإلكتروني مستخدم بالفغل - Email already exists')
      }
    }

    // Check if CR number already exists
    if (data.crNumber) {
      const existingCR = await prisma.supplier.findFirst({
        where: { crNumber: data.crNumber },
      })

      if (existingCR) {
        throw new ConflictError('رقم السجل التجاري مستخدم بالفعل - CR number already exists')
      }
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        address: data.address,
        category: data.category,
        rating: data.rating,
        taxNumber: data.taxNumber,
        crNumber: data.crNumber,
        isActive: data.isActive ?? true,
      },
      include: {
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
      },
    })

    return supplier
  }

  /**
   * Update supplier
   */
  async updateSupplier(data: UpdateSupplierInput) {
    const { id, ...updateData } = data

    // Check if supplier exists
    const existing = await prisma.supplier.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('المورد غير موجود - Supplier not found')
    }

    // Check if email is being changed and if it conflicts
    if (updateData.email && updateData.email !== existing.email) {
      const emailExists = await prisma.supplier.findFirst({
        where: {
          email: updateData.email,
          id: { not: id },
        },
      })

      if (emailExists) {
        throw new ConflictError('البريد الإلكتروني مستخدم بالفعل - Email already exists')
      }
    }

    // Check if CR number is being changed and if it conflicts
    if (updateData.crNumber && updateData.crNumber !== existing.crNumber) {
      const crExists = await prisma.supplier.findFirst({
        where: {
          crNumber: updateData.crNumber,
          id: { not: id },
        },
      })

      if (crExists) {
        throw new ConflictError('رقم السجل التجاري مستخدم بالفعل - CR number already exists')
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
      },
    })

    return supplier
  }

  /**
   * Delete supplier
   */
  async deleteSupplier(id: string) {
    // Check if supplier exists
    const existing = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
      },
    })

    if (!existing) {
      throw new NotFoundError('المورد غير موجود - Supplier not found')
    }

    // Check if supplier has related records
    if (existing._count.purchaseOrders > 0) {
      throw new ConflictError(
        'لا يمكن حذف المورد بسبب وجود طلبيات شراء مرتبطة - Cannot delete supplier with related purchase orders'
      )
    }

    await prisma.supplier.delete({
      where: { id },
    })

    return { message: 'تم حذف المورد بنجاح - Supplier deleted successfully' }
  }

  /**
   * Get supplier statistics
   */
  async getSupplierStats() {
    const [total, active, byCategory, topRated] = await Promise.all([
      prisma.supplier.count(),
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.supplier.groupBy({
        by: ['category'],
        where: { category: { not: null }, isActive: true },
        _count: { category: true },
      }),
      prisma.supplier.findMany({
        where: {
          rating: { not: null },
          isActive: true,
        },
        orderBy: { rating: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          nameAr: true,
          category: true,
          rating: true,
        },
      }),
    ])

    return {
      total,
      active,
      inactive: total - active,
      byCategory: byCategory
        .filter((cat) => cat.category !== null)
        .map((cat) => ({
          category: cat.category,
          count: cat._count.category,
        })),
      topRated,
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================
export const suppliersService = new SuppliersService()
