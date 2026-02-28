# HeavyOps ERP - API

Express.js + TypeScript API for HeavyOps ERP construction management system.

## التقنيات المستخدمة

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM for PostgreSQL
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Zod** - Validation

## التثبيت والتشغيل

```bash
# تثبيت الحزم
pnpm install

# توليد Prisma Client
npx prisma generate

# إنشاء قاعدة البيانات
npx prisma db push

# ملء قاعدة البيانات ببيانات تجريبية
npx tsx prisma/seed.ts

# تشغيل خادم التطوير (المنفذ 3001)
pnpm dev
```

## أوامر Prisma المفيدة

```bash
# فتح Prisma Studio (واجهة بصرية للبيانات)
npx prisma studio

# إنشاء migration جديد
npx prisma migrate dev --name init

# إعادة تعيين قاعدة البيانات
npx prisma migrate reset

# سحب التغييرات من قاعدة البيانات
npx prisma db pull
```

## هيكل المشروع

```
src/
├── index.ts          # Entry point
├── routes/           # API routes
│   ├── auth.ts       # Authentication routes
│   ├── projects.ts   # Project routes
│   ├── employees.ts  # Employee routes
│   ├── equipment.ts  # Equipment routes
│   └── financial.ts  # Financial routes
├── controllers/      # Route controllers (TODO)
├── middleware/       # Express middleware (TODO)
└── lib/             # Utility libraries (TODO)

prisma/
├── schema.prisma    # Prisma schema
└── seed.ts          # Database seeder
```

## قاعدة البيانات

- **مزود الخدمة**: PostgreSQL
- **اسم قاعدة البيانات**: heavyops_db
- **المنفذ**: 5432
- **اسم المستخدم**: postgres
- **كلمة المرور**: 123456 (تطوير فقط)

## المستخدمون الافتراضيون

| البريد الإلكتروني | كلمة المرور | الدور |
|------------------|-------------|-------|
| admin@heavyops.sa | admin123 | ADMIN |
| manager@heavyops.sa | admin123 | MANAGER |

## APIs المتاحة

- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/projects` - قائمة المشاريع
- `GET /api/employees` - قائمة الموظفين
- `GET /api/equipment` - قائمة المعدات
- `GET /api/financial/invoices` - قائمة الفواتير
- `GET /api/financial/expenses` - قائمة المصروفات

## البيانات التجريبية

يتم تضمين بيانات تجريبية عند تشغيل seed:
- 2 مستخدم (Admin, Manager)
- 1 عميل (وزارة الشؤون البلدية)
- 1 مشروع (امتداد مترو الرياض)
- 4 معدات
- 3 موظفين
- 2 موردون
- فواتير ومصروفات
- تنبيهات (Iqama expiry, Maintenance due)
