# Sistema RAG - 28Web Connect

## Visão Geral

O sistema RAG (Retrieval-Augmented Generation) da 28Web Connect utiliza:

- **Mistral AI** para geração de embeddings (1536 dimensões)
- **PostgreSQL + pgvector** para armazenamento e busca vetorial
- **Vercel AI SDK** com providers Mistral e Groq para geração de respostas
- **Busca semântica** para recuperar contexto relevante

## Arquitetura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Usuário   │────▶│    Query     │────▶│   Embedding     │
└─────────────┘     └──────────────┘     │  (Mistral AI)   │
                                          └─────────────────┘
                                                    │
                                                    ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Resposta   │◀────│     LLM      │◀────│  Busca Vetorial │
│   (Stream)  │     │ (Mistral/    │     │   (pgvector)    │
└─────────────┘     │    Groq)     │     └─────────────────┘
                    └──────────────┘              │
                                                  │
                                          ┌───────┴───────┐
                                          │   Documentos  │
                                          │   Relevantes  │
                                          └───────────────┘
```

## Fluxo de Funcionamento

1. **Usuário envia mensagem** → Sistema recebe query
2. **Gerar embedding** → Query convertida em vetor (1536d) via Mistral AI
3. **Busca semântica** → Operador `<->` (distância L2) no PostgreSQL
4. **Recuperar contexto** → Top 5 documentos mais relevantes
5. **Construir prompt** → Query + contexto dos documentos
6. **Gerar resposta** → Streaming via Vercel AI SDK (Groq/Mistral)
7. **Retornar ao usuário** → Resposta contextualizada em tempo real

## Instalação

### 1. Dependências

```bash
npm install ai @ai-sdk/mistral @mistralai/mistralai @ai-sdk/groq
```

### 2. Variáveis de Ambiente

```env
# Mistral AI - Embeddings e chat
MISTRAL_API_KEY="sua-chave-mistral"

# Groq - Chat rápido e barato
GROQ_API_KEY="sua-chave-groq"
```

**Obtendo chaves:**

- Mistral: https://console.mistral.ai/api-keys/
- Groq: https://console.groq.com/keys

### 3. Configuração do Banco

O PostgreSQL deve ter a extensão `pgvector` habilitada:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Execute as migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Indexação Inicial

```bash
# Indexar base de conhecimento
npm run seed:knowledge

# Forçar reindexação (limpa tudo primeiro)
npm run seed:knowledge --force
```

## Uso das Funções

### Geração de Embeddings

```typescript
import { generateEmbedding } from '@/lib/embeddings';

const embedding = await generateEmbedding('Texto para converter em vetor');
// Retorna: number[] (1536 dimensões)
```

### Armazenar Documento

```typescript
import { storeDocument } from '@/lib/embeddings';

const doc = await storeDocument('Conteúdo do documento...', {
  type: 'faq',
  category: 'Serviços',
  title: 'O que é ERP?',
});
```

### Busca Semântica

```typescript
import { searchSimilarDocuments, searchSimilarDocumentsWithScores } from '@/lib/embeddings';

// Busca simples
const docs = await searchSimilarDocuments('como funciona o ERP?', 5);

// Busca com scores de similaridade
const results = await searchSimilarDocumentsWithScores('ERP preço', 5, 0.5);
// Retorna: [{ ..., similarity: 0.85 }, ...]
```

### Seleção de Modelo de Chat

```typescript
import { selectChatModel, withChatFallback } from '@/lib/mistral';

// Usar Groq (padrão - mais rápido)
const model = selectChatModel('groq');

// Usar Mistral
const mistralModel = selectChatModel('mistral');

// Com fallback automático
const response = await withChatFallback(async (model) => {
  return await generateText({ model, prompt: 'Olá!' });
});
```

## Estrutura de Dados

### Modelo Document (Prisma)

```prisma
model Document {
  id        String   @id @default(cuid())
  content   String   // Conteúdo textual
  metadata  Json     // { type, title, category, ... }
  embedding Unsupported("vector(1536)")? // Embedding Mistral
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Tipos TypeScript

```typescript
// types/chat.ts
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

interface RAGContext {
  documents: Document[];
  query: string;
  relevanceScores?: number[];
  combinedContext?: string;
}
```

## Manutenção da Base de Conhecimento

### Adicionar Novo Documento

1. Edite `scripts/seed-knowledge-base.ts`
2. Adicione objeto ao array `KNOWLEDGE_DOCUMENTS`:

```typescript
{
  content: 'Conteúdo completo aqui...',
  metadata: {
    type: 'service',  // 'page' | 'faq' | 'service' | 'pricing'
    name: 'Novo Serviço',
    category: 'Web'
  }
}
```

3. Execute: `npm run seed:knowledge`

### Atualizar Documento

```typescript
import { updateDocument } from '@/lib/embeddings';

await updateDocument('doc-id', 'Novo conteúdo...', {
  title: 'Novo Título',
});
// Embedding é regenerado automaticamente se conteúdo mudar
```

### Deletar Documento

```typescript
import { deleteDocument } from '@/lib/embeddings';

await deleteDocument('doc-id');
```

### Listar Todos

```typescript
import { getAllDocuments, countDocuments } from '@/lib/embeddings';

const total = await countDocuments();
const docs = await getAllDocuments();
```

## Limitações

| Limite       | Valor | Descrição                                 |
| ------------ | ----- | ----------------------------------------- |
| Documentos   | 1.000 | Máximo recomendado para performance       |
| Tamanho      | 500MB | Tamanho total da base (inclui embeddings) |
| Dimensões    | 1.536 | Vetores de embedding (Mistral)            |
| Busca        | Top 5 | Documentos retornados por padrão          |
| Similaridade | 0.5   | Score mínimo recomendado                  |

## Troubleshooting

### Erro: "MISTRAL_API_KEY não configurada"

**Solução:**

```bash
# Verificar se .env.local existe
cat .env.local | grep MISTRAL_API_KEY

# Adicionar se não existir
echo 'MISTRAL_API_KEY="sua-chave"' >> .env.local
```

### Erro: "embedding não é um vetor válido"

**Causa:** Extensão pgvector não habilitada

**Solução:**

```bash
npx prisma migrate dev
# Ou manualmente no PostgreSQL:
CREATE EXTENSION IF NOT EXISTS vector;
```

### Erro: "Rate limit exceeded"

**Causa:** Muitas requisições à API Mistral

**Solução:** O script de seed já processa em lotes de 5 com delay de 1s entre lotes. Para operações manuais, adicione delays similares.

### Busca retorna resultados irrelevantes

**Verificações:**

1. Documentos estão indexados? `await countDocuments()`
2. Embeddings estão gerados? Verifique campo `embedding` não é null
3. Índice HNSW criado? Verifique no PostgreSQL:
   ```sql
   \di documents.*
   ```

### Erro: "Groq indisponível"

**Comportamento:** O sistema faz fallback automático para Mistral

**Verificação manual:**

```typescript
import { checkApiStatus } from '@/lib/mistral';

const status = checkApiStatus();
console.log(status);
// { mistral: true, groq: false, ... }
```

## Performance

### Otimizações Implementadas

- **Índice HNSW**: Busca vetorial em ~5ms (vs ~500ms sem índice)
- **Batch processing**: Seed processa 5 documentos por vez
- **Streaming**: Respostas são streamadas em tempo real
- **Fallback**: Groq → Mistral para alta disponibilidade

### Métricas Esperadas

| Operação                   | Tempo     |
| -------------------------- | --------- |
| Geração de embedding       | 200-500ms |
| Busca semântica (HNSW)     | 5-20ms    |
| Geração de resposta (Groq) | 500ms-2s  |
| Total (RAG completo)       | 1-3s      |

## Segurança

- **Dados sensíveis**: Nunca armazene PII (CPF, emails) nos documentos
- **API Keys**: Use `.env.local` (não commitado)
- **Rate Limiting**: Implementado nos Server Actions
- **Validação**: Inputs sanitizados antes de queries

## Documentação Relacionada

- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Mistral AI Docs](https://docs.mistral.ai/)
- [Groq Docs](https://console.groq.com/docs)
- [pgvector](https://github.com/pgvector/pgvector)

---

_Última atualização: 2024-02-05_
