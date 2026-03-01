-- AlterTable
ALTER TABLE "report_exports" ADD COLUMN     "export_options" JSONB,
ADD COLUMN     "recipient_email" TEXT;
