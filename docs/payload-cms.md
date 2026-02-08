# Payload CMS - Documentação

## Visão Geral

O Payload CMS foi integrado ao projeto 28Web Connect como sistema de gerenciamento de conteúdo separado, utilizando SQLite como banco de dados. Esta abordagem mantém o isolamento entre o conteúdo editorial (blog e portfólio) e os dados operacionais do sistema principal (PostgreSQL).

## Arquitetura

```
Next.js App
├── PostgreSQL (Dados operacionais)
│   ├── Users (NextAuth)
│   ├── Briefings
│   ├── Notifications
│   └── Chat Sessions
└── SQLite (Payload CMS)
    ├── Posts (Blog)
    ├── Portfolio (Projetos)
    └── Media (Uploads)
```

## Acesso ao Admin

O painel administrativo do Payload está disponível em:

```
https://28web.com.br/cms
```

> **Nota**: O acesso é restrito a usuários com role `ADMIN` ou `SUPER_ADMIN` no sistema NextAuth.

## Collections

### Posts (Blog)

Campos principais:

- **title**: Título do post (obrigatório)
- **slug**: URL amigável (auto-gerado do título)
- **content**: Conteúdo rich text (Slate editor)
- **excerpt**: Resumo para listagens
- **author**: Relacionamento com usuário
- **publishedAt**: Data de publicação
- **status**: draft | published | archived
- **featuredImage**: Imagem destacada
- **category**: Categoria do post
- **tags**: Array de tags

Grupo SEO:

- **metaTitle**: Título para SEO
- **metaDescription**: Descrição para SEO
- **ogImage**: Imagem para redes sociais

### Portfolio (Projetos)

Campos principais:

- **title**: Nome do projeto
- **slug**: URL amigável
- **description**: Descrição detalhada (rich text)
- **shortDescription**: Resumo curto para cards
- **client**: Nome do cliente
- **category**: Tipo de projeto
- **technologies**: Array de tecnologias
- **images**: Galeria de imagens
- **projectUrl**: URL do projeto ao vivo
- **completedAt**: Data de conclusão
- **featured**: Destacar na home

Grupo SEO:

- **metaTitle**: Título para SEO
- **metaDescription**: Descrição para SEO
- **ogImage**: Imagem para redes sociais

### Media (Uploads)

Suporta imagens com tamanhos otimizados:

- **thumbnail**: 400x300px
- **card**: 768x1024px
- **tablet**: 1024px largura

Tamanho máximo: 5MB

## Boas Práticas para Imagens

### Blog (Featured Image)

- **Dimensão recomendada**: 1200x630px (16:9)
- **Formato**: JPG ou WebP
- **Tamanho máximo**: 2MB
- **Uso**: Open Graph, cards de listagem

### Portfolio (Galeria)

- **Dimensão recomendada**: 1920x1080px (16:9)
- **Formato**: JPG ou WebP
- **Tamanho máximo**: 5MB por imagem
- **Máximo de imagens**: 10 por projeto

### Open Graph

- **Dimensão**: 1200x630px
- **Formato**: JPG ou PNG
- **Tamanho máximo**: 2MB

## Processo de Publicação

### 1. Criar Post/Projeto

1. Acesse `/cms`
2. Navegue até a collection desejada (Posts ou Portfolio)
3. Clique em "Create New"
4. Preencha todos os campos obrigatórios

### 2. Salvar como Rascunho

- O status padrão é "draft"
- O slug é gerado automaticamente do título
- Salve para continuar editando depois

### 3. Revisar e Publicar

1. Altere o status para "published"
2. Defina a data de publicação (opcional)
3. Verifique os campos SEO
4. Clique em "Save"

### 4. Verificar Publicação

- Posts aparecem em `/blog`
- Projetos aparecem em `/portfolio`
- URLs seguem o padrão: `/blog/[slug]` e `/portfolio/[slug]`

## Campos SEO

### Meta Title

- Máximo: 60 caracteres
- Fallback: Título do post/projeto
- Deve ser único e descritivo

### Meta Description

- Máximo: 160 caracteres
- Deve conter palavras-chave relevantes
- Chamada para ação quando apropriado

### Open Graph Image

- Usada no compartilhamento social
- Dimensão: 1200x630px
- Fallback para featuredImage (blog) ou primeira imagem (portfolio)

## Rich Text Editor

O editor Slate oferece:

### Formatação Básica

- **Negrito** (Ctrl+B)
- _Itálico_ (Ctrl+I)
- <u>Sublinhado</u> (Ctrl+U)
- ~~Tachado~~

### Elementos

- Títulos (H1, H2, H3, H4)
- Listas ordenadas e não ordenadas
- Links (com auto-detect de URLs)
- Blocos de código
- Citações
- Upload de imagens inline

### Atalhos

- `Ctrl+K`: Inserir link
- `Ctrl+B`: Negrito
- `Ctrl+I`: Itálico
- `Ctrl+U`: Sublinhado

## Autenticação

O Payload utiliza a autenticação existente do NextAuth:

1. Faça login no sistema principal (`/login`)
2. Acesse `/cms` automaticamente autenticado
3. Apenas ADMIN e SUPER_ADMIN têm acesso
4. CLIENTE é redirecionado para o dashboard

## Backup

### Banco de Dados SQLite

O arquivo `payload.db` contém todo o conteúdo editorial:

```bash
# Backup manual
cp payload.db backup/payload-$(date +%Y%m%d).db

# Restaurar
cp backup/payload-20240101.db payload.db
```

### Pasta Media

Os uploads ficam na pasta `/media`:

```bash
# Backup com compressão
tar -czf backup/media-$(date +%Y%m%d).tar.gz media/
```

## Variáveis de Ambiente

```env
# Payload CMS
PAYLOAD_SECRET="sua-chave-secreta-aqui"
PAYLOAD_DATABASE_URI="file:./payload.db"
```

### Gerar Secret

```bash
openssl rand -base64 32
```

## Troubleshooting

### Erro de permissão no admin

- Verifique se está logado com usuário ADMIN ou SUPER_ADMIN
- Verifique a variável PAYLOAD_SECRET

### Imagens não carregam

- Verifique se a pasta `/media` existe e tem permissões de escrita
- Verifique o tamanho do arquivo (máx. 5MB)

### Slug duplicado

- O slug deve ser único por collection
- Adicione um número ou data se necessário

### Conteúdo não aparece no site

- Verifique se o status é "published"
- Verifique a data de publicação
- Limpe o cache do Next.js

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Seed de conteúdo inicial
npx tsx scripts/seed-payload.ts

# Gerar tipos TypeScript
npm run payload generate:types

# Migrações (se necessário)
npm run payload migrate
```

## Suporte

Para dúvidas ou problemas:

1. Verifique os logs do servidor
2. Consulte a documentação oficial: https://payloadcms.com/docs
3. Abra uma issue no repositório

---

**28Web Connect** - Documentação interna
