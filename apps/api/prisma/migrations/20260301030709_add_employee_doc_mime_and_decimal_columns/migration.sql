-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'ENGINEER', 'ACCOUNTANT', 'HR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('ACTIVE', 'IDLE', 'MAINTENANCE', 'RETIRED');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('EXCAVATOR', 'LOADER', 'CRUSHER', 'TRUCK', 'CRANE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('MATERIALS', 'LABOR', 'EQUIPMENT', 'FUEL', 'RENT', 'UTILITIES', 'INSURANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY');

-- CreateEnum
CREATE TYPE "DeductionType" AS ENUM ('ABSENCE', 'PARTIAL_ABSENCE', 'ADVANCE', 'MANUAL');

-- CreateEnum
CREATE TYPE "DeductionStatus" AS ENUM ('PENDING', 'APPROVED', 'APPLIED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_CARD', 'PASSPORT', 'DRIVING_LICENSE', 'MEDICAL_INSURANCE', 'IQAMA', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('VALID', 'EXPIRING', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'PROJECT_UPDATE', 'INVOICE_DUE', 'MAINTENANCE_DUE', 'DOCUMENT_EXPIRY');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('IQAMA_EXPIRY', 'PASSPORT_EXPIRY', 'MAINTENANCE_DUE', 'BUDGET_OVERRUN', 'DOCUMENT_MISSING', 'SAFETY_ISSUE', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "avatar" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "contact_person" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'Saudi Arabia',
    "cr_number" TEXT,
    "vat_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "contact_person" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "category" TEXT,
    "rating" INTEGER,
    "tax_number" TEXT,
    "cr_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "project_id" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "total" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grand_total" DOUBLE PRECISION NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "ordered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "code" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "budget" DOUBLE PRECISION,
    "actual_cost" DOUBLE PRECISION DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "actual_end_date" TIMESTAMP(3),
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "manager_id" TEXT,
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "contract_value" DOUBLE PRECISION,
    "retention" DOUBLE PRECISION DEFAULT 0.05,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_financials" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profit_margin" DOUBLE PRECISION,
    "pending_payments" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "collected_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_financials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_milestones" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "description" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "employee_id" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "salary_decimal" DECIMAL(12,2),
    "iqama_number" TEXT,
    "iqama_expiry" TIMESTAMP(3),
    "passport_number" TEXT,
    "passport_expiry" TIMESTAMP(3),
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "project_id" TEXT,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "date_of_birth" TIMESTAMP(3),
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "bank_name" TEXT,
    "bank_account" TEXT,
    "iban" TEXT,
    "address" TEXT,
    "emergency_contact" TEXT,
    "emergency_phone" TEXT,
    "photo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'VALID',
    "expiry_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "work_hours" DOUBLE PRECISION,
    "overtime_hours" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "basic_salary" DOUBLE PRECISION NOT NULL,
    "basic_salary_decimal" DECIMAL(12,2),
    "housing" DOUBLE PRECISION DEFAULT 0,
    "housing_decimal" DECIMAL(12,2),
    "transportation" DOUBLE PRECISION DEFAULT 0,
    "transportation_decimal" DECIMAL(12,2),
    "overtime" DOUBLE PRECISION DEFAULT 0,
    "overtime_decimal" DECIMAL(12,2),
    "deductions_amount" DOUBLE PRECISION DEFAULT 0,
    "deductions_amount_decimal" DECIMAL(12,2),
    "bonuses" DOUBLE PRECISION DEFAULT 0,
    "bonuses_decimal" DECIMAL(12,2),
    "net_salary" DOUBLE PRECISION NOT NULL,
    "net_salary_decimal" DECIMAL(12,2),
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_at" TIMESTAMP(3),
    "payment_method" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deductions" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "payroll_id" TEXT,
    "project_id" TEXT NOT NULL,
    "type" "DeductionType" NOT NULL,
    "status" "DeductionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "amount_decimal" DECIMAL(12,2),
    "hours" DOUBLE PRECISION DEFAULT 0,
    "minutes" DOUBLE PRECISION DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "applied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_cost_entries" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "deduction_id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'LABOR',
    "amount" DOUBLE PRECISION NOT NULL,
    "amount_decimal" DECIMAL(12,2),
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_cost_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "code" TEXT NOT NULL,
    "type" "EquipmentType" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'IDLE',
    "current_project_id" TEXT,
    "purchase_date" TIMESTAMP(3),
    "purchase_cost" DOUBLE PRECISION,
    "last_maintenance_date" TIMESTAMP(3),
    "next_maintenance_date" TIMESTAMP(3),
    "hourly_cost" DOUBLE PRECISION,
    "daily_cost" DOUBLE PRECISION,
    "location" TEXT,
    "operator" TEXT,
    "fuel_consumption" DOUBLE PRECISION,
    "description" TEXT,
    "plate_number" TEXT,
    "manufacturing_year" INTEGER,
    "total_work_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "next_maintenance_hours" DOUBLE PRECISION,
    "hourly_rate" DOUBLE PRECISION,
    "total_operating_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "operator_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cost" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technician" TEXT,
    "next_due_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_documents" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "document_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "mime_type" TEXT,
    "file_size" INTEGER,
    "expiry_date" TIMESTAMP(3),
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_parts" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT DEFAULT 'قطعة',
    "last_changed_date" TIMESTAMP(3),
    "life_span_hours" INTEGER,
    "remaining_percentage" INTEGER DEFAULT 100,
    "remaining_hours" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax_rate" DOUBLE PRECISION DEFAULT 0.15,
    "total" DOUBLE PRECISION NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_date" TIMESTAMP(3),
    "payment_method" TEXT,
    "notes" TEXT,
    "terms" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "project_id" TEXT,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "receipt_url" TEXT,
    "vendor" TEXT,
    "invoice_number" TEXT,
    "payment_method" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "message" TEXT NOT NULL,
    "message_ar" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "message" TEXT NOT NULL,
    "message_ar" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "clients_name_idx" ON "clients"("name");

-- CreateIndex
CREATE INDEX "clients_cr_number_idx" ON "clients"("cr_number");

-- CreateIndex
CREATE INDEX "suppliers_name_idx" ON "suppliers"("name");

-- CreateIndex
CREATE INDEX "suppliers_category_idx" ON "suppliers"("category");

-- CreateIndex
CREATE INDEX "suppliers_is_active_idx" ON "suppliers"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_order_number_key" ON "purchase_orders"("order_number");

-- CreateIndex
CREATE INDEX "purchase_orders_supplier_id_idx" ON "purchase_orders"("supplier_id");

-- CreateIndex
CREATE INDEX "purchase_orders_project_id_idx" ON "purchase_orders"("project_id");

-- CreateIndex
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");

-- CreateIndex
CREATE INDEX "purchase_orders_order_number_idx" ON "purchase_orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code");

-- CreateIndex
CREATE INDEX "projects_code_idx" ON "projects"("code");

-- CreateIndex
CREATE INDEX "projects_client_id_idx" ON "projects"("client_id");

-- CreateIndex
CREATE INDEX "projects_manager_id_idx" ON "projects"("manager_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_start_date_idx" ON "projects"("start_date");

-- CreateIndex
CREATE UNIQUE INDEX "project_financials_project_id_key" ON "project_financials"("project_id");

-- CreateIndex
CREATE INDEX "project_financials_project_id_idx" ON "project_financials"("project_id");

-- CreateIndex
CREATE INDEX "project_milestones_project_id_idx" ON "project_milestones"("project_id");

-- CreateIndex
CREATE INDEX "project_milestones_due_date_idx" ON "project_milestones"("due_date");

-- CreateIndex
CREATE INDEX "project_milestones_is_completed_idx" ON "project_milestones"("is_completed");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_id_key" ON "employees"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_iqama_number_key" ON "employees"("iqama_number");

-- CreateIndex
CREATE UNIQUE INDEX "employees_passport_number_key" ON "employees"("passport_number");

-- CreateIndex
CREATE INDEX "employees_employee_id_idx" ON "employees"("employee_id");

-- CreateIndex
CREATE INDEX "employees_project_id_idx" ON "employees"("project_id");

-- CreateIndex
CREATE INDEX "employees_iqama_number_idx" ON "employees"("iqama_number");

-- CreateIndex
CREATE INDEX "employees_passport_number_idx" ON "employees"("passport_number");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "employees_department_idx" ON "employees"("department");

-- CreateIndex
CREATE INDEX "employee_documents_employee_id_idx" ON "employee_documents"("employee_id");

-- CreateIndex
CREATE INDEX "employee_documents_type_idx" ON "employee_documents"("type");

-- CreateIndex
CREATE INDEX "employee_documents_status_idx" ON "employee_documents"("status");

-- CreateIndex
CREATE INDEX "employee_documents_expiry_date_idx" ON "employee_documents"("expiry_date");

-- CreateIndex
CREATE INDEX "attendance_employee_id_idx" ON "attendance"("employee_id");

-- CreateIndex
CREATE INDEX "attendance_date_idx" ON "attendance"("date");

-- CreateIndex
CREATE INDEX "attendance_status_idx" ON "attendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_employee_id_date_key" ON "attendance"("employee_id", "date");

-- CreateIndex
CREATE INDEX "payroll_employee_id_idx" ON "payroll"("employee_id");

-- CreateIndex
CREATE INDEX "payroll_month_year_idx" ON "payroll"("month", "year");

-- CreateIndex
CREATE INDEX "payroll_is_paid_idx" ON "payroll"("is_paid");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_employee_id_month_year_key" ON "payroll"("employee_id", "month", "year");

-- CreateIndex
CREATE INDEX "deductions_employee_id_idx" ON "deductions"("employee_id");

-- CreateIndex
CREATE INDEX "deductions_payroll_id_idx" ON "deductions"("payroll_id");

-- CreateIndex
CREATE INDEX "deductions_project_id_idx" ON "deductions"("project_id");

-- CreateIndex
CREATE INDEX "deductions_type_idx" ON "deductions"("type");

-- CreateIndex
CREATE INDEX "deductions_status_idx" ON "deductions"("status");

-- CreateIndex
CREATE INDEX "deductions_date_idx" ON "deductions"("date");

-- CreateIndex
CREATE INDEX "deductions_month_year_idx" ON "deductions"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "project_cost_entries_deduction_id_key" ON "project_cost_entries"("deduction_id");

-- CreateIndex
CREATE INDEX "project_cost_entries_project_id_idx" ON "project_cost_entries"("project_id");

-- CreateIndex
CREATE INDEX "project_cost_entries_deduction_id_idx" ON "project_cost_entries"("deduction_id");

-- CreateIndex
CREATE INDEX "project_cost_entries_category_idx" ON "project_cost_entries"("category");

-- CreateIndex
CREATE INDEX "project_cost_entries_date_idx" ON "project_cost_entries"("date");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_code_key" ON "equipment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_serial_number_key" ON "equipment"("serial_number");

-- CreateIndex
CREATE INDEX "equipment_code_idx" ON "equipment"("code");

-- CreateIndex
CREATE INDEX "equipment_type_idx" ON "equipment"("type");

-- CreateIndex
CREATE INDEX "equipment_status_idx" ON "equipment"("status");

-- CreateIndex
CREATE INDEX "equipment_current_project_id_idx" ON "equipment"("current_project_id");

-- CreateIndex
CREATE INDEX "equipment_next_maintenance_date_idx" ON "equipment"("next_maintenance_date");

-- CreateIndex
CREATE INDEX "equipment_plate_number_idx" ON "equipment"("plate_number");

-- CreateIndex
CREATE INDEX "equipment_operator_id_idx" ON "equipment"("operator_id");

-- CreateIndex
CREATE INDEX "maintenance_records_equipment_id_idx" ON "maintenance_records"("equipment_id");

-- CreateIndex
CREATE INDEX "maintenance_records_date_idx" ON "maintenance_records"("date");

-- CreateIndex
CREATE INDEX "maintenance_records_type_idx" ON "maintenance_records"("type");

-- CreateIndex
CREATE INDEX "maintenance_records_next_due_date_idx" ON "maintenance_records"("next_due_date");

-- CreateIndex
CREATE INDEX "equipment_documents_equipment_id_idx" ON "equipment_documents"("equipment_id");

-- CreateIndex
CREATE INDEX "equipment_documents_document_type_idx" ON "equipment_documents"("document_type");

-- CreateIndex
CREATE INDEX "equipment_documents_expiry_date_idx" ON "equipment_documents"("expiry_date");

-- CreateIndex
CREATE INDEX "equipment_parts_equipment_id_idx" ON "equipment_parts"("equipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_project_id_idx" ON "invoices"("project_id");

-- CreateIndex
CREATE INDEX "invoices_client_id_idx" ON "invoices"("client_id");

-- CreateIndex
CREATE INDEX "invoices_invoice_number_idx" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_due_date_idx" ON "invoices"("due_date");

-- CreateIndex
CREATE INDEX "expenses_project_id_idx" ON "expenses"("project_id");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "expenses_date_idx" ON "expenses"("date");

-- CreateIndex
CREATE INDEX "expenses_is_approved_idx" ON "expenses"("is_approved");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_severity_idx" ON "alerts"("severity");

-- CreateIndex
CREATE INDEX "alerts_is_resolved_idx" ON "alerts"("is_resolved");

-- CreateIndex
CREATE INDEX "alerts_entity_type_entity_id_idx" ON "alerts"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "alerts_created_at_idx" ON "alerts"("created_at");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_financials" ADD CONSTRAINT "project_financials_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deductions" ADD CONSTRAINT "deductions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deductions" ADD CONSTRAINT "deductions_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "payroll"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deductions" ADD CONSTRAINT "deductions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_cost_entries" ADD CONSTRAINT "project_cost_entries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_cost_entries" ADD CONSTRAINT "project_cost_entries_deduction_id_fkey" FOREIGN KEY ("deduction_id") REFERENCES "deductions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_current_project_id_fkey" FOREIGN KEY ("current_project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_documents" ADD CONSTRAINT "equipment_documents_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_parts" ADD CONSTRAINT "equipment_parts_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
