-- CreateEnum
CREATE TYPE "BriefingStatus" AS ENUM ('RASCUNHO', 'ENVIADO', 'EM_ANALISE', 'APROVADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ERP_BASICO', 'ERP_ECOMMERCE', 'ERP_PREMIUM', 'LANDING_IA', 'LANDING_IA_WHATSAPP');

-- DropIndex
DROP INDEX "documents_embedding_hnsw_idx";

-- CreateTable
CREATE TABLE "briefings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "companyName" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "budget" TEXT,
    "deadline" TEXT,
    "features" TEXT,
    "references" TEXT,
    "integrations" TEXT,
    "additionalInfo" JSONB,
    "status" "BriefingStatus" NOT NULL DEFAULT 'ENVIADO',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "briefings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "briefing_drafts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "lastSaved" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "briefing_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "features" JSONB NOT NULL,
    "storageLimit" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "briefings_userId_idx" ON "briefings"("userId");

-- CreateIndex
CREATE INDEX "briefings_status_idx" ON "briefings"("status");

-- CreateIndex
CREATE INDEX "briefings_serviceType_idx" ON "briefings"("serviceType");

-- CreateIndex
CREATE INDEX "briefings_createdAt_idx" ON "briefings"("createdAt");

-- CreateIndex
CREATE INDEX "briefing_drafts_expiresAt_idx" ON "briefing_drafts"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "briefing_drafts_userId_key" ON "briefing_drafts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_name_key" ON "pricing_plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_plans_serviceType_key" ON "pricing_plans"("serviceType");

-- CreateIndex
CREATE INDEX "pricing_plans_isActive_idx" ON "pricing_plans"("isActive");

-- CreateIndex
CREATE INDEX "pricing_plans_order_idx" ON "pricing_plans"("order");

-- AddForeignKey
ALTER TABLE "briefings" ADD CONSTRAINT "briefings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "briefing_drafts" ADD CONSTRAINT "briefing_drafts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
