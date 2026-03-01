-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('PROJECT_PROFITABILITY', 'EQUIPMENT_OPERATION', 'SUPPLIER_STATEMENT', 'LABOR_COSTS', 'FUEL_CONSUMPTION', 'ACCIDENT_LOG', 'VAT_SUMMARY', 'PAYROLL_SUMMARY', 'EQUIPMENT_UTILIZATION', 'DOCUMENT_EXPIRY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('PDF', 'EXCEL', 'CSV');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "report_definitions" (
    "id" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "description" TEXT,
    "description_ar" TEXT,
    "category" TEXT NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'manual',
    "icon" TEXT NOT NULL DEFAULT 'assessment',
    "color" TEXT NOT NULL DEFAULT 'blue',
    "filters_schema" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_runs" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "parameters" JSONB NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "result_data" JSONB,
    "error" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_exports" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "status" "ExportStatus" NOT NULL DEFAULT 'PENDING',
    "file_url" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "report_exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_definitions_type_key" ON "report_definitions"("type");

-- CreateIndex
CREATE INDEX "report_definitions_category_idx" ON "report_definitions"("category");

-- CreateIndex
CREATE INDEX "report_definitions_is_active_idx" ON "report_definitions"("is_active");

-- CreateIndex
CREATE INDEX "report_definitions_display_order_idx" ON "report_definitions"("display_order");

-- CreateIndex
CREATE INDEX "report_runs_report_id_idx" ON "report_runs"("report_id");

-- CreateIndex
CREATE INDEX "report_runs_user_id_idx" ON "report_runs"("user_id");

-- CreateIndex
CREATE INDEX "report_runs_status_idx" ON "report_runs"("status");

-- CreateIndex
CREATE INDEX "report_runs_created_at_idx" ON "report_runs"("created_at");

-- CreateIndex
CREATE INDEX "report_exports_run_id_idx" ON "report_exports"("run_id");

-- CreateIndex
CREATE INDEX "report_exports_status_idx" ON "report_exports"("status");

-- CreateIndex
CREATE INDEX "report_exports_created_at_idx" ON "report_exports"("created_at");

-- AddForeignKey
ALTER TABLE "report_runs" ADD CONSTRAINT "report_runs_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "report_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_runs" ADD CONSTRAINT "report_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_exports" ADD CONSTRAINT "report_exports_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "report_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
