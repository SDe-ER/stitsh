import { z } from 'zod'

export const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  nameAr: z.string().optional(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  department: z.string().min(1, 'Department is required'),
  salary: z.number().positive('Salary must be positive'),
  iqamaNumber: z.string().optional(),
  iqamaExpiry: z.coerce.date().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.coerce.date().optional(),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email').optional(),
  projectId: z.string().cuid('Invalid project ID').optional(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED']).optional(),
  dateOfBirth: z.coerce.date().optional(),
  joinDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  iban: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  photo: z.string().url().optional(),
})

export const updateEmployeeSchema = employeeSchema.partial()

export const attendanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  date: z.coerce.date(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']).optional(),
  notes: z.string().optional(),
})

export const updateAttendanceSchema = attendanceSchema.partial()

export const payrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  basicSalary: z.number().positive('Basic salary must be positive'),
  housing: z.number().optional(),
  transportation: z.number().optional(),
  overtime: z.number().optional(),
  deductions: z.number().optional(),
  bonuses: z.number().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
})

export const employeeQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED']).optional(),
  projectId: z.string().cuid().optional(),
  department: z.string().optional(),
  nationality: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  sortBy: z.enum(['name', 'employeeId', 'joinDate', 'salary', 'department']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type CreateEmployeeInput = z.infer<typeof employeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
export type CreateAttendanceInput = z.infer<typeof attendanceSchema>
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>
export type CreatePayrollInput = z.infer<typeof payrollSchema>
export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>
