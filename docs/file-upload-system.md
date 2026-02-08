# Sistema de Upload de Arquivos

## Visão Geral

O sistema de upload de arquivos da 28Web Connect permite que clientes enviem arquivos para seus projetos com validação em múltiplas camadas, suporte a arquivos grandes via chunked upload e retry automático.

## Arquitetura

### Fluxo de Dados

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Client    │────▶│  useFileUpload  │────▶│ /api/upload  │
│  (Browser)  │     │   (React Hook)  │     │  (API Route) │
└─────────────┘     └─────────────────┘     └──────┬───────┘
                                                    │
                       ┌────────────────────────────┘
                       ▼
              ┌─────────────────┐
              │  File Service   │
              │ (lib/file-upload)
              └────────┬────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    ┌─────────┐  ┌──────────┐  ┌──────────┐
    │Storage  │  │ Database │  │ Temp     │
    │(Disk)   │  │(Prisma)  │  │(Chunks)  │
    └─────────┘  └──────────┘  └──────────┘
```

## Limites por Tipo de Arquivo

| Categoria   | Extensões                      | Limite Máximo |
| ----------- | ------------------------------ | ------------- |
| Documentos  | .pdf, .doc, .docx, .xls, .xlsx | 10 MB         |
| Imagens     | .jpg, .jpeg, .png, .svg, .gif  | 5 MB          |
| Vídeos      | .mp4, .mov, .avi               | 100 MB        |
| Compactados | .zip, .rar                     | 50 MB         |

## Chunked Upload

Arquivos maiores que **10 MB** são automaticamente divididos em chunks de **5 MB**:

1. Cliente divide arquivo em chunks
2. Upload sequencial de cada chunk
3. Servidor armazena chunks temporariamente
4. Após último chunk, arquivo é concatenado
5. Validação e salvamento final

### Benefícios

- **Resiliência**: Se um chunk falhar, apenas ele é reenviado
- **Progresso**: Feedback visual preciso do progresso
- **Memória**: Servidor não precisa carregar arquivo inteiro em memória

## Retry Automático

O sistema implementa retry com exponential backoff:

| Tentativa | Delay      |
| --------- | ---------- |
| 1         | Imediato   |
| 2         | 2 segundos |
| 3         | 4 segundos |

### Condições de Retry

- Falhas de rede temporárias
- Timeout do servidor
- Erros 5xx

### Não faz retry em:

- Erros de validação (tipo, tamanho)
- Erros de autenticação (401)
- Erros de permissão (403)
- Storage cheio (507)

## Validação

### Client-Side

- Tipo de arquivo (extensão + MIME type)
- Tamanho máximo por categoria
- Sanitização do nome do arquivo

### Server-Side

- Verificação de autenticação
- Permissão de acesso ao projeto
- Validação do plano e limite de storage
- Verificação de espaço disponível

## Storage e Planos

Cada plano possui um limite de storage:

| Plano                 | Limite de Storage |
| --------------------- | ----------------- |
| ERP Básico            | 1 GB              |
| ERP E-commerce        | 5 GB              |
| ERP Premium           | 10 GB             |
| Landing IA            | 500 MB            |
| Landing IA + WhatsApp | 500 MB            |

## API Endpoints

### POST /api/upload

Upload de arquivo ou chunk.

**Parâmetros (FormData):**

- `file` ou `chunk`: Arquivo ou parte do arquivo
- `projectId`: ID do projeto
- `uploadId` (opcional): ID único para upload chunked
- `chunkIndex` (opcional): Índice do chunk (0-based)
- `totalChunks` (opcional): Total de chunks

**Respostas:**

- `200`: Upload bem-sucedido
- `400`: Dados inválidos
- `401`: Não autenticado
- `403`: Sem permissão
- `413`: Arquivo muito grande
- `507`: Storage insuficiente

### GET /api/download/[fileId]

Download de arquivo.

**Respostas:**

- `200`: Arquivo com headers apropriados
- `401`: Não autenticado
- `403`: Sem permissão
- `404`: Arquivo não encontrado

## Componentes React

### FileUpload

Componente de upload com drag-and-drop.

```tsx
import FileUpload from '@/components/project/FileUpload';

<FileUpload projectId="clj123..." onUploadComplete={() => console.log('Upload completo!')} />;
```

**Funcionalidades:**

- Drag-and-drop
- Validação client-side
- Preview de arquivos selecionados
- Progress bar animada
- Indicador de retry
- Mensagens de erro específicas

### FileList

Listagem de arquivos do projeto.

```tsx
import FileList from '@/components/project/FileList';

<FileList projectId="clj123..." userId="user456..." canDelete={true} />;
```

**Funcionalidades:**

- Grid responsivo
- Ícones por tipo de arquivo
- Download direto
- Exclusão (com confirmação)
- Estados de loading/erro/vazio

### useFileUpload Hook

Hook para gerenciar uploads programaticamente.

```tsx
import { useFileUpload } from '@/hooks/useFileUpload';

const { uploadFile, uploading, progress, error, retryCount, cancelUpload } = useFileUpload();

// Upload de arquivo
const success = await uploadFile(file, projectId);

// Cancelar upload
if (uploading) cancelUpload();
```

## Server Actions

### uploadProjectFile

Upload via Server Action (para arquivos pequenos).

```tsx
import { uploadProjectFile } from '@/app/actions/upload';

const formData = new FormData();
formData.append('file', file);

const result = await uploadProjectFile(formData, projectId);
```

### deleteProjectFile

Exclui um arquivo.

```tsx
import { deleteProjectFile } from '@/app/actions/upload';

const result = await deleteProjectFile(fileId, userId);
```

### getProjectFiles

Lista arquivos de um projeto.

```tsx
import { getProjectFiles } from '@/app/actions/upload';

const { success, data: files } = await getProjectFiles(projectId, userId);
```

### getUserStorageInfo

Obtém informações de storage do usuário.

```tsx
import { getUserStorageInfo } from '@/app/actions/upload';

const { success, data: storageInfo } = await getUserStorageInfo(userId);
// storageInfo: { used, limit, available, percentage }
```

## Variáveis de Ambiente

```bash
# Diretório de uploads (relativo ao projeto)
UPLOAD_DIR=uploads

# Tamanho máximo de upload em MB
MAX_UPLOAD_SIZE_MB=100
```

## Mensagens de Erro

### Validação

| Erro                                   | Causa                           | Solução                         |
| -------------------------------------- | ------------------------------- | ------------------------------- |
| "Arquivo sem extensão não é permitido" | Nome sem ponto                  | Adicione extensão válida        |
| "Extensão '.xyz' não é permitida"      | Extensão não na lista           | Use formato permitido           |
| "Tipo de arquivo inconsistente"        | MIME type ≠ extensão            | Verifique arquivo               |
| "Arquivo excede o limite"              | Arquivo muito grande            | Comprima ou divida              |
| "Limite de armazenamento atingido"     | Storage cheio                   | Exclua arquivos ou faça upgrade |
| "Espaço insuficiente"                  | Não há espaço para este arquivo | Libere espaço                   |

### Upload

| Erro                       | Causa                     | Solução              |
| -------------------------- | ------------------------- | -------------------- |
| "Não autenticado"          | Sessão expirada           | Faça login novamente |
| "Projeto não encontrado"   | ID inválido ou sem acesso | Verifique o projeto  |
| "Erro ao processar upload" | Erro interno              | Tente novamente      |

## Troubleshooting

### Upload fica travado em X%

1. Verifique conexão de internet
2. Recarregue a página e tente novamente
3. Se arquivo > 10MB, o sistema usa chunked upload - pode parecer travado entre chunks

### "Erro ao enviar arquivo" sem detalhes

1. Verifique tamanho do arquivo (limite varia por tipo)
2. Verifique espaço disponível no projeto
3. Tente em outro navegador

### Arquivo aparece corrompido após download

1. Verifique se upload completou 100%
2. Tente fazer upload novamente
3. Verifique integridade do arquivo original

## Segurança

- ✅ Sanitização de nomes de arquivo
- ✅ Verificação de path traversal
- ✅ Validação de MIME type real
- ✅ Limites por categoria e plano
- ✅ Autenticação obrigatória
- ✅ Verificação de permissões
- ✅ Headers de segurança no download

## Testes

Execute os testes de validação:

```bash
npm test lib/validations/__tests__/file-upload.test.ts
```

Testes cobrem:

- Validação de tipos de arquivo
- Limites de tamanho
- Schema Zod
- Edge cases (Unicode, extensões múltiplas, etc.)
