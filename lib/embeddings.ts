import { Mistral } from '@mistralai/mistralai';
import { createId } from '@paralleldrive/cuid2';
import { prisma } from './prisma';
import { Document, Prisma } from '@prisma/client';

// Cliente Mistral para embeddings
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || '',
});

// Constantes
/**
 * Modelo de embedding utilizado pela API Mistral
 * @constant {string}
 */
export const EMBEDDING_MODEL = 'mistral-embed';

/**
 * Dimensão dos vetores de embedding gerados
 * @constant {number}
 */
export const EMBEDDING_DIMENSIONS = 1536;

/**
 * Gera embedding vetorial de um texto usando Mistral AI
 *
 * @description Converte texto em um vetor numérico de alta dimensionalidade (1536 dimensões)
 * que representa semanticamente o conteúdo do texto. Utilizado no sistema RAG para
 * busca semântica de documentos.
 *
 * @param text - Texto a ser convertido em embedding
 * @returns Promise<number[]> - Array de 1536 números representando o vetor de embedding
 * @throws {Error} Se MISTRAL_API_KEY não estiver configurada
 * @throws {Error} Se a API retornar resposta vazia ou dimensão incorreta
 *
 * @example
 * ```typescript
 * const embedding = await generateEmbedding('Sistemas ERP para gestão empresarial');
 * console.log(embedding.length); // 1536
 * console.log(embedding[0]); // 0.023456...
 * ```
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY não configurada');
  }

  try {
    const response = await mistral.embeddings.create({
      model: EMBEDDING_MODEL,
      inputs: [text],
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Nenhum embedding retornado pela API');
    }

    const embedding = response.data[0].embedding;

    if (!embedding) {
      throw new Error('Embedding retornado está vazio');
    }

    // Validar dimensões
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Dimensão do embedding incorreta: ${embedding.length} (esperado: ${EMBEDDING_DIMENSIONS})`
      );
    }

    return embedding;
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    throw new Error(
      `Falha ao gerar embedding: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

/**
 * Armazena um documento com seu embedding no banco de dados
 *
 * @description Gera o embedding do conteúdo e armazena no PostgreSQL usando
 * a extensão pgvector para vetores de alta dimensionalidade.
 *
 * @param content - Conteúdo textual do documento
 * @param metadata - Metadados adicionais (título, fonte, tipo, etc.)
 * @returns Promise<Document> - Documento criado com ID gerado
 * @throws {Error} Se falhar ao criar o documento
 *
 * @example
 * ```typescript
 * const doc = await storeDocument(
 *   'Conteúdo sobre ERP...',
 *   { title: 'Guia ERP', source: 'docs', category: 'tutorial' }
 * );
 * console.log(doc.id); // 'cuid-gerado-automaticamente'
 * ```
 */
export async function storeDocument(
  content: string,
  metadata: Record<string, unknown>
): Promise<Document> {
  // Gerar embedding do conteúdo
  const embedding = await generateEmbedding(content);

  // Gerar ID usando cuid2 (consistente com @default(cuid()) no Prisma)
  const id = createId();

  // Salvar no banco usando raw query para inserir vetor
  const result = await prisma.$queryRaw<Document[]>`
    INSERT INTO documents (id, content, metadata, embedding, "createdAt", "updatedAt")
    VALUES (
      ${id},
      ${content},
      ${JSON.stringify(metadata)}::jsonb,
      ${JSON.stringify(embedding)}::vector(1536),
      NOW(),
      NOW()
    )
    RETURNING *
  `;

  if (!result || result.length === 0) {
    throw new Error('Falha ao criar documento');
  }

  return result[0];
}

/**
 * Busca documentos semanticamente similares a uma query
 *
 * @description Utiliza busca por similaridade de cosseno em vetores pgvector
 * para encontrar documentos semanticamente relacionados à query.
 *
 * @param query - Texto de busca
 * @param limit - Número máximo de resultados (padrão: 5)
 * @returns Promise<Document[]> - Array de documentos ordenados por relevância
 *
 * @example
 * ```typescript
 * const docs = await searchSimilarDocuments('como integrar ERP com e-commerce', 3);
 * // Retorna os 3 documentos mais relevantes
 * docs.forEach(doc => console.log(doc.content.substring(0, 100)));
 * ```
 */
export async function searchSimilarDocuments(
  query: string,
  limit: number = 5
): Promise<Document[]> {
  // Gerar embedding da query
  const queryEmbedding = await generateEmbedding(query);

  // Buscar documentos usando distância de cosseno
  // Operador <-> calcula distância L2; usamos 1 - cosine_similarity
  const documents = await prisma.$queryRaw<Document[]>`
    SELECT 
      id,
      content,
      metadata,
      embedding::text as embedding,
      "createdAt",
      "updatedAt",
      1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector(1536)) as similarity
    FROM documents
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector(1536)
    LIMIT ${limit}
  `;

  return documents;
}

/**
 * Busca documentos com scores de similaridade
 *
 * @description Similar a searchSimilarDocuments, mas permite filtrar por
 * score mínimo de similaridade (0-1) e retorna os scores junto com os documentos.
 *
 * @param query - Texto de busca
 * @param limit - Número máximo de resultados
 * @param minSimilarity - Score mínimo de similaridade (0-1)
 * @returns Promise<Array<Document & { similarity: number }>> - Documentos com scores
 *
 * @example
 * ```typescript
 * const docs = await searchSimilarDocumentsWithScores('ERP básico', 5, 0.7);
 * // Retorna apenas documentos com similaridade >= 70%
 * docs.forEach(doc => console.log(`${doc.similarity}: ${doc.content}`));
 * ```
 */
export async function searchSimilarDocumentsWithScores(
  query: string,
  limit: number = 5,
  minSimilarity: number = 0.5
): Promise<Array<Document & { similarity: number }>> {
  const queryEmbedding = await generateEmbedding(query);

  const documents = await prisma.$queryRaw<Array<Document & { similarity: number }>>`
    SELECT 
      id,
      content,
      metadata,
      embedding::text as embedding,
      "createdAt",
      "updatedAt",
      1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector(1536)) as similarity
    FROM documents
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector(1536)
    LIMIT ${limit}
  `;

  // Filtrar por score mínimo
  return documents.filter((doc) => doc.similarity >= minSimilarity);
}

/**
 * Deleta um documento pelo ID
 *
 * @description Remove permanentemente um documento e seu embedding do banco.
 *
 * @param id - ID do documento a ser deletado
 * @returns Promise<void>
 * @throws {Error} Se o documento não existir
 *
 * @example
 * ```typescript
 * await deleteDocument('doc-123');
 * console.log('Documento removido');
 * ```
 */
export async function deleteDocument(id: string): Promise<void> {
  await prisma.document.delete({
    where: { id },
  });
}

/**
 * Lista todos os documentos
 *
 * @description Retorna todos os documentos ordenados por data de criação (mais recentes primeiro).
 *
 * @returns Promise<Document[]> - Array de documentos
 *
 * @example
 * ```typescript
 * const docs = await getAllDocuments();
 * console.log(`Total de documentos: ${docs.length}`);
 * ```
 */
export async function getAllDocuments(): Promise<Document[]> {
  return prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Conta o número total de documentos
 *
 * @description Retorna a contagem total de documentos na base de conhecimento.
 *
 * @returns Promise<number> - Número de documentos
 *
 * @example
 * ```typescript
 * const count = await countDocuments();
 * console.log(`Documentos na base: ${count}`);
 * ```
 */
export async function countDocuments(): Promise<number> {
  return prisma.document.count();
}

/**
 * Atualiza um documento existente
 *
 * @description Atualiza conteúdo e/ou metadados de um documento existente.
 * Se o conteúdo for alterado, o embedding é regenerado automaticamente.
 *
 * @param id - ID do documento
 * @param content - Novo conteúdo (opcional, regenera embedding se fornecido)
 * @param metadata - Novos metadados (opcional, faz merge com existente)
 * @returns Promise<Document> - Documento atualizado
 * @throws {Error} Se o documento não existir
 *
 * @example
 * ```typescript
 * // Atualizar apenas metadados
 * await updateDocument('doc-123', undefined, { category: 'atualizado' });
 *
 * // Atualizar conteúdo (regenera embedding)
 * await updateDocument('doc-123', 'Novo conteúdo...');
 * ```
 */
export async function updateDocument(
  id: string,
  content?: string,
  metadata?: Record<string, unknown>
): Promise<Document> {
  const existingDoc = await prisma.document.findUnique({
    where: { id },
  });

  if (!existingDoc) {
    throw new Error('Documento não encontrado');
  }

  const updateData: {
    content?: string;
    metadata?: Prisma.InputJsonValue;
    embedding?: number[];
  } = {};

  if (content !== undefined) {
    updateData.content = content;
    // Regenerar embedding se conteúdo mudou
    updateData.embedding = await generateEmbedding(content);
  }

  if (metadata !== undefined) {
    // Merge com metadados existentes
    updateData.metadata = {
      ...((existingDoc.metadata as Record<string, unknown>) || {}),
      ...metadata,
    } as Prisma.InputJsonValue;
  }

  // Atualizar via raw query para embedding vetorial
  if (updateData.embedding) {
    const result = await prisma.$queryRaw<Document[]>`
      UPDATE documents
      SET 
        content = COALESCE(${updateData.content}, content),
        metadata = COALESCE(${JSON.stringify(updateData.metadata)}, metadata),
        embedding = COALESCE(${JSON.stringify(updateData.embedding)}::vector(1536), embedding),
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }

  // Atualizar sem embedding
  const data: Prisma.DocumentUpdateInput = {};
  if (updateData.content) data.content = updateData.content;
  if (updateData.metadata) data.metadata = updateData.metadata as Prisma.InputJsonValue;

  return prisma.document.update({
    where: { id },
    data,
  });
}
