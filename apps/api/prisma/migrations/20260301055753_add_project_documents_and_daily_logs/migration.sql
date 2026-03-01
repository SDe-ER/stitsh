-- CreateTable
CREATE TABLE "project_documents" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT,
    "type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "description" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "tags" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_daily_logs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "log_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shift" TEXT NOT NULL,
    "weather" TEXT,
    "temperature" DOUBLE PRECISION,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_daily_activities" (
    "id" TEXT NOT NULL,
    "log_id" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL,
    "worker_count" INTEGER,
    "hours" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_daily_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_daily_equipment" (
    "id" TEXT NOT NULL,
    "log_id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "operator_id" TEXT,
    "task" TEXT,
    "hours" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "fuel_used" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_daily_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_documents_project_id_idx" ON "project_documents"("project_id");

-- CreateIndex
CREATE INDEX "project_documents_type_idx" ON "project_documents"("type");

-- CreateIndex
CREATE INDEX "project_documents_uploaded_by_idx" ON "project_documents"("uploaded_by");

-- CreateIndex
CREATE INDEX "project_documents_created_at_idx" ON "project_documents"("created_at");

-- CreateIndex
CREATE INDEX "project_daily_logs_project_id_idx" ON "project_daily_logs"("project_id");

-- CreateIndex
CREATE INDEX "project_daily_logs_log_date_idx" ON "project_daily_logs"("log_date");

-- CreateIndex
CREATE INDEX "project_daily_logs_shift_idx" ON "project_daily_logs"("shift");

-- CreateIndex
CREATE INDEX "project_daily_activities_log_id_idx" ON "project_daily_activities"("log_id");

-- CreateIndex
CREATE INDEX "project_daily_activities_activity_type_idx" ON "project_daily_activities"("activity_type");

-- CreateIndex
CREATE INDEX "project_daily_equipment_log_id_idx" ON "project_daily_equipment"("log_id");

-- CreateIndex
CREATE INDEX "project_daily_equipment_equipment_id_idx" ON "project_daily_equipment"("equipment_id");

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_daily_logs" ADD CONSTRAINT "project_daily_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_daily_logs" ADD CONSTRAINT "project_daily_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_daily_activities" ADD CONSTRAINT "project_daily_activities_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "project_daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_daily_equipment" ADD CONSTRAINT "project_daily_equipment_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "project_daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
