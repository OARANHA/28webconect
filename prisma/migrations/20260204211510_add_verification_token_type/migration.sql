/*
  Warnings:

  - Added the required column `type` to the `verification_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationTokenType" AS ENUM ('VERIFICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "verification_tokens" ADD COLUMN     "type" "VerificationTokenType" NOT NULL;

-- CreateIndex
CREATE INDEX "verification_tokens_type_idx" ON "verification_tokens"("type");
