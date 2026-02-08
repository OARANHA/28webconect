-- Adicionar índice HNSW para busca vetorial eficiente
CREATE INDEX IF NOT EXISTS idx_documents_embedding_hnsw ON documents 
USING hnsw (embedding vector_cosine_ops);
