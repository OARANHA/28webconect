-- DropIndex
DROP INDEX "briefing_drafts_userId_key";

-- CreateIndex
CREATE INDEX "briefing_drafts_userId_idx" ON "briefing_drafts"("userId");

-- Recreate HNSW index for vector search on documents
CREATE INDEX "documents_embedding_hnsw_idx" ON "documents" USING hnsw ("embedding" vector_cosine_ops);
