# Changelog

All notable changes to the 28Web Connect platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Integration tests for authentication, briefing, and project workflows
- Comprehensive API documentation
- Architecture documentation with Mermaid diagrams
- Security documentation and guidelines
- Deployment guides for Vercel and VPS

## [0.1.0] - 2024-XX-XX

### Added

#### Fase 1: Fundação e Captação (MVP)

- **Site Institucional**
  - Homepage com apresentação da empresa
  - Páginas institucionais (Sobre, Serviços, Contato)
  - Design responsivo com Tailwind CSS
  - Otimização SEO com metadados dinâmicos

- **Sistema de Autenticação**
  - Registro de usuários com validação
  - Login com NextAuth.js v5
  - Verificação de email
  - Recuperação de senha
  - Controle de sessão

- **Chat IA**
  - Integração com Mistral AI
  - Sistema RAG (Retrieval-Augmented Generation)
  - Base de conhecimento com embeddings
  - Busca semântica em documentos
  - Interface de chat em tempo real

- **Analytics e SEO**
  - Integração Umami Analytics
  - Metadados dinâmicos para páginas
  - Structured data (JSON-LD)
  - Sitemap e robots.txt
  - Otimização Core Web Vitals

#### Fase 2: Qualificação e Conversão

- **Sistema de Briefing**
  - Formulário multi-etapas
  - Salvamento automático de rascunho
  - Suporte a diferentes tipos de serviço (ERP_BASICO, ERP_ECOMMERCE)
  - Validação com Zod
  - Expiração de rascunho após 30 dias

- **Tabela de Preços**
  - Planos dinâmicos configuráveis
  - Comparação de recursos
  - Cálculo automático de limites
  - Gestão de planos no admin

- **Sistema de Notificações**
  - Notificações in-app
  - Emails transacionais (Mailgun)
  - Notificações push (Web Push)
  - Preferências de notificação por usuário

- **Payload CMS**
  - Blog com posts categorizados
  - Portfólio de projetos
  - Gestão de mídia
  - Campos SEO para conteúdo

#### Fase 3: Gestão e Acompanhamento

- **Dashboard do Cliente**
  - Visão geral de projetos
  - Acompanhamento de briefing
  - Gerenciamento de perfil

- **Sistema de Projetos**
  - Criação de projetos a partir de briefings
  - Gestão de milestones (4 fases padrão)
  - Cálculo automático de progresso
  - Status tracking

- **Upload de Arquivos**
  - Upload direto e chunked
  - Validação de tipo e tamanho
  - Limite de storage por plano
  - Associação a milestones

- **Sistema de Comentários**
  - Comentários por projeto e milestone
  - Notificações em tempo real
  - Paginação de comentários
  - Moderação por admins

- **Área Administrativa**
  - Dashboard com métricas
  - Gestão de briefings
  - Gestão de projetos
  - Gestão de clientes
  - Upload para base de conhecimento

- **Conformidade LGPD**
  - Política de retenção de dados
  - Anonimização automática após 2 anos
  - Exclusão de dados inativos (12 meses)
  - Preservação de dados contratuais (5 anos)
  - Exportação de dados do usuário

### Security

- Hash de senhas com bcrypt (12 rounds)
- Proteção CSRF
- Validação de inputs com Zod
- Autorização baseada em roles
- Headers de segurança

---

## Versioning Guidelines

- **MAJOR** (X.0.0): Breaking changes requiring migration
- **MINOR** (0.X.0): New features, backwards compatible
- **PATCH** (0.0.X): Bug fixes and minor improvements

## Migration Notes

### From 0.0.x to 0.1.0

- Run database migrations: `npx prisma migrate deploy`
- Update environment variables (see .env.example)
- Seed pricing plans: `npx prisma db seed`

---

[Unreleased]: https://github.com/your-org/28web-connect/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-org/28web-connect/releases/tag/v0.1.0
