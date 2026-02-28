# HeavyOps ERP - Web Application

تطبيق React + TypeScript + Vite لإدارة مقاولات البناء.

## التقنيات المستخدمة

- **React 19** - مكتبة واجهة المستخدم
- **TypeScript** - للكتابة الآمنة للأنواع
- **Vite** - أداة بناء سريعة
- **Tailwind CSS** - للتصميم
- **React Router** - للتوجيه
- **Zustand** - لإدارة الحالة
- **TanStack Query** - لطلبات البيانات
- **Axios** - للتواصل مع الـ API
- **Zod** - للتحقق من البيانات
- **React Hook Form** - لإدارة النماذج
- **Recharts** - للرسوم البيانية
- **Lucide React** - للأيقونات

## التثبيت والتشغيل

```bash
# تثبيت الحزم
pnpm install

# تشغيل خادم التطوير (المنفذ 3000)
pnpm dev

# بناء للإنتاج
pnpm build

# معاينة البناء
pnpm preview
```

## هيكل المشروع

```
src/
├── assets/           # ملفات ثابتة
├── components/       # مكونات React
│   ├── ui/          # مكونات واجهة المستخدم الأساسية
│   ├── layout/      # مكونات التخطيط (Header, Sidebar)
│   └── common/      # مكونات مشتركة
├── pages/           # صفحات التطبيق
├── hooks/           # Custom React Hooks
├── store/           # Zustand State Management
├── services/        # API Services
├── types/           # TypeScript Types
├── utils/           # دوال مساعدة
└── router/          # React Router Configuration
```

## ألوان النظام

- **Primary**: #2563eb (أزرق)
- **Secondary**: #1a2b4a (كحلي داكن)
- **Accent**: #d97706 (برتقالي)
- **Background**: #f0f4f8 (رمادي فاتح)
- **Success**: #059669 (أخضر)
- **Danger**: #dc2626 (أحمر)

## تكوين الـ API

التطبيق مهيأ للاتصال بـ API على المنفذ `3001` عبر proxy. انظر `vite.config.ts` للتكوين.

## Path Aliases

يمكنك استخدام `@/` بدلاً من المسارات النسبية:

```tsx
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
```
