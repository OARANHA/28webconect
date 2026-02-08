# Gestão da Base de Conhecimento IA

## Visão Geral

O sistema de Base de Conhecimento IA permite gerenciar documentos para o assistente virtual RAG (Retrieval-Augmented Generation). Documentos são automaticamente processados: texto extraído, embeddings gerados via Mistral AI, e conteúdo indexado para respostas contextuais.

## Funcionalidades

- **Upload de Documentos**: PDF, DOCX, TXT, MD
- **Indexação Automática**: Extração de texto + geração de embeddings
- **Reindexação**: Atualizar embeddings de documentos existentes
- **Scraping Automático**: Indexar páginas públicas do site
- **Estatísticas**: Monitorar uso e limites

## Tipos de Arquivo Suportados

| Extensão | MIME Type                                                                 | Descrição                       |
| -------- | ------------------------------------------------------------------------- | ------------------------------- |
| `.pdf`   | `application/pdf`                                                         | Documentos PDF                  |
| `.doc`   | `application/msword`                                                      | Microsoft Word (formato antigo) |
| `.docx`  | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | Microsoft Word (formato novo)   |
| `.txt`   | `text/plain`                                                              | Texto simples                   |
| `.md`    | `text/markdown`                                                           | Markdown                        |

## Limites do Sistema

| Limite              | Valor             | Descrição                   |
| ------------------- | ----------------- | --------------------------- |
| Máx. documentos     | 1000              | Total de documentos na base |
| Tamanho total       | 500MB             | Soma de todos os arquivos   |
| Tamanho por arquivo | 10MB              | Limite individual           |
| Texto extraído      | 50.000 caracteres | Truncamento automático      |

## Como Fazer Upload

### Via Interface Web

1. Acesse **Admin > Base de Conhecimento**
2. Arraste arquivo para a zona de drop ou clique para selecionar
3. (Opcional) Adicione título, categoria e tags
4. Clique em "Indexar Documento"
5. Aguarde o processamento (extração + embedding)

### Via API

```bash
curl -X POST /api/admin/knowledge/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@documento.pdf" \
  -F "title=Manual do Sistema" \
  -F "category=documentacao" \
  -F "tags=[\"erp\",\"manual\"]"
```

## Fluxo de Indexação

```
┌─────────────┐    ┌──────────────┐    ┌───────────────┐    ┌─────────────┐
│   Upload    │ -> │ Extrair Texto│ -> │ Gerar Embedding│ -> │ Salvar no   │
│   Arquivo   │    │  (PDF/DOCX)  │    │  (Mistral AI) │    │  PostgreSQL │
└─────────────┘    └──────────────┘    └───────────────┘    └─────────────┘
```

## Estrutura de Metadados

```typescript
{
  title: string,           // Título do documento
  filename: string,        // Nome original do arquivo
  type: 'upload' | 'page' | 'faq' | 'manual',
  category: string,        // Categoria de conteúdo
  source: 'upload' | 'scraping' | 'manual',
  tags: string[],          // Tags para busca
  filesize: number,        // Tamanho em bytes
  mimetype: string,        // Tipo MIME
  filepath: string,        // Caminho no disco
  uploadedBy?: string,     // ID do usuário
  uploadedAt?: string,     // ISO 8601
}
```

## Reindexação

### Reindexar Documento Único

1. Na lista de documentos, clique no ícone de refresh
2. Confirme a operação
3. Aguarde o processamento

### Reindexar Todos

1. Clique no botão "Reindexar Todos"
2. Confirme (pode demorar para muitos documentos)
3. Processo executa em lotes de 5 documentos

**Quando reindexar:**

- Atualização do modelo de embeddings
- Problemas na busca semântica
- Alteração de conteúdo do arquivo físico

## Scraping Automático

O sistema pode indexar automaticamente páginas públicas do site:

- `/` - Home
- `/servicos` - Página de serviços
- `/sobre` - Sobre a empresa
- `/faq` - Perguntas frequentes
- `/contato` - Informações de contato

### Para Executar

1. Clique em "Atualizar do Site"
2. Sistema faz fetch de cada página
3. Extrai texto relevante (remove nav/footer)
4. Gera embeddings e salva

**Nota:** Páginas já indexadas são atualizadas, não duplicadas.

## Boas Práticas

### Organização de Documentos

1. **Use categorias consistentes**
   - `documentacao` - Manuais e guias
   - `institucional` - Sobre a empresa
   - `faq` - Perguntas frequentes
   - `tutorial` - Tutoriais passo a passo

2. **Adicione tags relevantes**
   - Use termos de busca comuns
   - Máximo 20 tags por documento
   - Evite tags muito genéricas

3. **Títulos descritivos**
   - Evite nomes de arquivo como título
   - Use "Manual de Integração ERP" em vez de "manual.pdf"

### Performance

- Documentos grandes (>100KB) demoram mais para processar
- Reindexação em massa consome cota da API Mistral
- Prefira vários documentos pequenos a um único grande

### Segurança

- Apenas ADMIN e SUPER_ADMIN podem gerenciar
- ### Preview de Documentos

Antes de indexar, o sistema mostra um preview do conteúdo:

- **TXT/MD**: Primeiros 2.000 caracteres do texto
- **PDF**: Visualização embutida em iframe
- **DOC/DOCX**: Link para abrir o documento

Isso permite verificar se o arquivo correto foi selecionado antes do upload.

### Segurança

- Apenas ADMIN e SUPER_ADMIN podem gerenciar
- Arquivos são validados antes do processamento
- Sanitização de nomes de arquivo
- Validação de tipos MIME

## Troubleshooting

### "Falha ao extrair texto"

**Causas comuns:**

- Arquivo corrompido
- PDF com apenas imagens (scan)
- DOCX protegido por senha

**Solução:**

- Verifique se o arquivo abre corretamente
- Para PDFs scanneados, use OCR primeiro

### "Limite de documentos atingido"

**Solução:**

1. Exclua documentos antigos
2. Considere consolidar conteúdo similar
3. Contate administrador para aumentar limite

### "Falha ao gerar embedding"

**Causas comuns:**

- Cota da API Mistral excedida
- Texto muito longo truncado
- Erro de rede temporário

**Solução:**

- Aguarde alguns minutos e tente novamente
- Verifique logs do servidor
- Verifique configuração da API key

### Documento não aparece nas buscas

**Verifique:**

1. Status da indexação (deve estar "complete")
2. Se o texto foi extraído corretamente
3. Se o embedding foi gerado (campo `embedding` no DB)

## Configuração

### Variáveis de Ambiente

```env
# Base de Conhecimento
MAX_KNOWLEDGE_DOCUMENTS=1000
MAX_KNOWLEDGE_SIZE_MB=500
KNOWLEDGE_UPLOAD_DIR=uploads/knowledge

# Mistral AI (necessário para embeddings)
MISTRAL_API_KEY=your-api-key
```

### Ajustar Limites

Edite `lib/validations/admin-knowledge.ts`:

```typescript
export const MAX_DOCUMENTS = 1000; // Aumentar/diminuir
export const MAX_TOTAL_SIZE_MB = 500; // Aumentar/diminuir
export const MAX_DOCUMENT_SIZE_MB = 10; // Aumentar/diminuir
```

**Atenção:** Limites muito altos podem impactar performance e custos.

## Monitoramento

### Logs

- Uploads: `[UPLOAD] Arquivo X processado com sucesso`
- Erros: `[ERROR] Falha ao extrair texto: ...`
- Reindexação: `[REINDEX] N documentos processados`
- Scraping: `[SCRAPE] Limite atingido ao processar URL: ...`

### Métricas Importantes

- Total de documentos vs limite
- Uso de armazenamento vs limite
- Taxa de sucesso de extração
- Tempo médio de indexação

## API Reference

### Endpoints

| Método | Endpoint                      | Descrição          |
| ------ | ----------------------------- | ------------------ |
| POST   | `/api/admin/knowledge/upload` | Upload e indexação |

### Server Actions

```typescript
// Estatísticas
getKnowledgeStats(): Promise<{ success: boolean; stats: KnowledgeStats }>

// Listar documentos
getDocuments(): Promise<{ success: boolean; documents: DocumentListItem[] }>

// Upload
uploadDocument(formData: FormData): Promise<DocumentUploadResult>

// Deletar
deleteDocument(id: string): Promise<{ success: boolean; error?: string }>

// Reindexar
reindexDocument(id: string): Promise<ReindexResult>
reindexAll(): Promise<ReindexResult>

// Scraping
scrapeWebsite(): Promise<ScrapeResult>
```

## Limites no Scraping

O scraping automático respeita os mesmos limites do upload manual:

- Verifica contagem atual de documentos antes de adicionar
- Estima tamanho do conteúdo da página
- Para processamento se limites seriam excedidos
- Retorna erro indicando qual limite foi atingido

## Contribuição

Para adicionar suporte a novos tipos de arquivo:

1. Adicione MIME type em `lib/validations/admin-knowledge.ts`
2. Implemente extrator em `lib/text-extraction.ts`
3. Adicione ícone em `DocumentList.tsx` e `DocumentUpload.tsx`
4. Atualize testes
5. Atualize documentação
