# 28Web Connect - Plataforma Completa

[![Tests](https://github.com/your-org/28web-connect/actions/workflows/test.yml/badge.svg)](https://github.com/your-org/28web-connect/actions)
[![Coverage](https://codecov.io/gh/your-org/28web-connect/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/28web-connect)

Plataforma completa para captação, conversão e gestão de clientes da 28Web Connect.

## 🎯 Visão Geral

A 28Web Connect é uma plataforma integrada que combina:

- **Site institucional** com blog e portfólio
- **Chat IA** com base de conhecimento RAG
- **Sistema de briefing** qualificado
- **Gestão de projetos** completa
- **Área administrativa** poderosa

## ✨ Funcionalidades

### Fase 1: Fundação e Captação (MVP) ✅

- [x] Site institucional responsivo
- [x] Sistema de autenticação completo
- [x] Chat IA com RAG (Mistral AI)
- [x] Blog e Portfólio (Payload CMS)
- [x] Analytics e SEO otimizado

### Fase 2: Qualificação e Conversão ✅

- [x] Sistema de briefing multi-etapas
- [x] Tabela de preços dinâmica
- [x] Notificações multi-canal
- [x] Salvamento automático de rascunhos

### Fase 3: Gestão e Acompanhamento ✅

- [x] Dashboard do cliente
- [x] Gestão de projetos com milestones
- [x] Upload de arquivos com chunks
- [x] Sistema de comentários
- [x] Área administrativa completa
- [x] Conformidade LGPD

## 🚀 Tecnologias

- **Framework:** Next.js 14+ (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Banco de Dados:** PostgreSQL + pgvector
- **ORM:** Prisma
- **Autenticação:** NextAuth.js v5
- **IA:** Mistral AI + Vercel AI SDK
- **CMS:** Payload CMS v2

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn
- Conta Mailgun (email)
- Chave API Mistral AI

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/your-org/28web-connect.git
cd 28web-connect
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas configurações:

- `DATABASE_URL`: URL do PostgreSQL
- `NEXTAUTH_SECRET`: Chave secreta (gerar com `openssl rand -base64 32`)
- `MISTRAL_API_KEY`: Chave da API Mistral
- `MAILGUN_API_KEY`: Chave do Mailgun

### 4. Configure o banco de dados

```bash
# Crie o banco de dados no PostgreSQL
# Habilite a extensão pgvector

# Execute as migrations
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate

# (Opcional) Popule com dados iniciais
npx prisma db seed
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Modo watch (re-executa ao salvar)
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage

# Executar testes específicos
npx vitest run app/actions/__tests__/auth.test.ts
```

## 📚 Documentação

- [API Documentation](./docs/api.md)
- [Architecture Guide](./docs/architecture.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Deployment Guide](./docs/deployment.md)
- [Security Guidelines](./docs/security.md)

Veja a [Documentação Completa](./docs/README.md)

## 🚢 Deploy

### Vercel (Recomendado)

```bash
npm i -g vercel
vercel
```

### VPS (Contabo)

Veja o [guia completo de deployment](./docs/deployment.md#vps-deployment-contabo).

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia o [CONTRIBUTING.md](./CONTRIBUTING.md) antes de começar.

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Propriedade da 28Web Connect. Todos os direitos reservados.

## 📞 Suporte

- Email: contato@28webconnect.com
- Website: https://28webconnect.com

---

<p align="center">Desenvolvido com ❤️ por 28Web Connect</p>
