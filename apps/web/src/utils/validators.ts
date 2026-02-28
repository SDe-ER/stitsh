import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

export type LoginForm = z.infer<typeof loginSchema>

export const projectSchema = z.object({
  name: z.string().min(3, 'اسم المشروع يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  startDate: z.string().min(1, 'تاريخ البدء مطلوب'),
  endDate: z.string().optional(),
  budget: z.number().positive('الميزانية يجب أن تكون رقماً موجباً'),
  location: z.string().optional(),
  clientId: z.string().optional(),
})

export type ProjectForm = z.infer<typeof projectSchema>
