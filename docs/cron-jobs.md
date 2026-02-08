# Cron Jobs - Documentação Conceitual

Este documento descreve os cron jobs conceituais recomendados para manutenção da aplicação 28Web Connect.

---

## Limpeza de Rascunhos Expirados

### Descrição

Remove rascunhos de briefing (`BriefingDraft`) que expiraram após 30 dias, liberando espaço no banco de dados e mantendo a performance.

### Frequência

**Diária** - Recomendado executar às 03:00 da manhã (horário de menor uso)

### Query Prisma

```typescript
await prisma.briefingDraft.deleteMany({
  where: {
    expiresAt: {
      lt: new Date(), // Menor que a data atual (já expirou)
    },
  },
});
```

### Implementações Sugeridas

#### Opção 1: Vercel Cron Jobs

Se hospedado na Vercel, utilizar a funcionalidade nativa de Cron Jobs:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-drafts",
      "schedule": "0 3 * * *"
    }
  ]
}
```

```typescript
// app/api/cron/cleanup-drafts/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // Verificar token de autorização
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await prisma.briefingDraft.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    console.log(`[Cron] ${result.count} rascunhos expirados removidos`);

    return NextResponse.json({
      success: true,
      deleted: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Erro na limpeza:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup drafts' },
      { status: 500 }
    );
  }
}
```

#### Opção 2: Node-cron em Servidor VPS (Contabo)

Para hospedagem em VPS próprio:

```typescript
// scripts/cleanup-drafts.ts
import { prisma } from '../lib/prisma';

async function cleanupExpiredDrafts() {
  try {
    const result = await prisma.briefingDraft.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    console.log(`[${new Date().toISOString()}] ${result.count} rascunhos removidos`);
  } catch (error) {
    console.error('Erro na limpeza:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupExpiredDrafts();
```

```javascript
// cron-job.js (executado com node-cron)
const cron = require('node-cron');
const { exec } = require('child_process');

cron.schedule('0 3 * * *', () => {
  console.log('[Cron] Iniciando limpeza de rascunhos...');
  exec('npx tsx scripts/cleanup-drafts.ts', (error, stdout, stderr) => {
    if (error) {
      console.error(`[Cron] Erro: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`[Cron] Stderr: ${stderr}`);
      return;
    }
    console.log(`[Cron] ${stdout}`);
  });
});
```

#### Opção 3: API Route Protegida + Serviço Externo

Expôr uma API route e chamar de um serviço externo (EasyCron, cron-job.org):

```typescript
// app/api/cron/cleanup-drafts/route.ts
// Similar à Opção 1, mas chamada por serviço externo
```

### Logging

- Registrar quantidade de drafts deletados
- Timestamp da execução
- Duração da operação
- Erros (se houver)

### Monitoramento

- Alertar se o cron job falhar por 3 dias consecutivos
- Métricas: quantidade de drafts removidos por dia/semana/mês
- Alertas via email/Slack/Discord em caso de falha

### Variáveis de Ambiente

```env
# Para proteção da API de cron
CRON_SECRET=seu-token-seguro-aqui

# Para configuração de alertas (opcional)
ALERT_WEBHOOK_URL=https://hooks.slack.com/...
```

---

## Políticas de Retenção de Dados (LGPD)

### Descrição

Implementa políticas de retenção de dados conforme LGPD:

1. **11 meses de inatividade**: Envia email de aviso ao usuário (range 11-12 meses com flag para evitar duplicidade)
2. **12 meses de inatividade**: Exclui conta e dados não contratuais; preserva dados contratuais/financeiros por 5 anos
3. **2 anos**: Anonimiza briefings não convertidos em projetos (remove vínculo com usuário)

### Frequência

**Diária** - Recomendado executar às 03:00 da manhã (horário de menor uso)

### Funcionalidades

#### 1. Verificação de Usuários Inativos (11-12 meses)

Identifica usuários que não fazem login há entre 11 e 12 meses e envia email de aviso.

```typescript
await checkInactiveUsers();
```

**Critérios:**

- `role = CLIENTE`
- `doNotDelete = false`
- `warningSentAt = null` (ainda não recebeu aviso)
- `lastLoginAt` entre 11 e 12 meses atrás OU `createdAt` entre 11 e 12 meses atrás (se nunca fez login)
- `emailVerified != null`

**Ação:**

- Envia email com template `inactivity-warning.ts`
- Marca `warningSentAt` com a data atual para evitar duplicidade
- Informa que conta será excluída em ~30 dias
- Fornece link direto para login

**Vantagem da abordagem por range:**

- Garante que o aviso seja enviado mesmo se o cron falhar em dias específicos
- Usa flag `warningSentAt` para evitar envios duplicados
- Execução diária processa todos os usuários no range que ainda não foram avisados

#### 2. Exclusão de Dados Inativos (12 meses)

Remove contas e dados não contratuais de usuários inativos há 12+ meses. Preserva dados contratuais/financeiros por 5 anos conforme obrigação legal.

```typescript
await deleteInactiveData();
```

**Critérios:**

- `role = CLIENTE`
- `doNotDelete = false`
- `lastLoginAt <= 12 meses atrás` OU `createdAt <= 12 meses atrás`

**Dados Excluídos:**

- User (conta principal)
- Account, Session (autenticação)
- BriefingDraft
- Briefing NÃO contratuais (`isContractual = false`)
- Project NÃO contratuais (`isContractual = false`)
- ProjectMilestone, ProjectFile, ProjectComment (apenas de projetos não contratuais)
- Notification, NotificationPreference, PushSubscription
- ChatSession

**Dados Preservados (5 anos - obrigação legal):**

- Briefings marcados como `isContractual = true`
- Projetos marcados como `isContractual = true`
- Milestones, arquivos e comentários de projetos contratuais
- **Nota:** Os registros preservados têm `userId` definido como `null` para remover o vínculo PII, mantendo apenas os dados necessários para obrigações fiscais

**Log de Auditoria:**

- Registra em `DataDeletionLog` antes da exclusão
- Preserva: `userId`, `userEmail`, `reason`, `deletedAt`, `dataTypes`
- Inclui flag `contractual_data_preserved_5_years` quando aplicável

**Bases Legais:**

- Código Civil Art. 205: Prescrição de obrigações fiscais (5 anos)
- LGPD Art. 16: Eliminação após término da finalidade (com exceção de cumprimento de obrigação legal)

#### 3. Anonimização de Briefings (2 anos)

Anonimiza briefings não convertidos em projetos após 2 anos, removendo completamente o vínculo com o usuário.

```typescript
await anonymizeBriefings();
```

**Critérios:**

- `createdAt <= 2 anos atrás`
- `project = null` (não convertido)

**Campos Anonimizados:**

- `companyName` → `"[ANONIMIZADO]"`
- `objectives` → `"[Dados removidos por política de retenção LGPD]"`
- `features`, `references`, `integrations`, `additionalInfo` → `null`

**Vínculo Removido:**

- `userId` → `null` (rompe a relação com o usuário)
- Isso garante que não seja possível acessar email/telefone do usuário a partir do briefing

**Preservado:**

- `serviceType`, `status`, `createdAt` (para estatísticas)

### Implementação

#### Opção 1: Vercel Cron Jobs

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/data-retention",
      "schedule": "0 3 * * *"
    }
  ]
}
```

#### Opção 2: Node-cron em VPS (Contabo)

```javascript
// cron-job.js
const cron = require('node-cron');
const { exec } = require('child_process');

cron.schedule('0 3 * * *', () => {
  console.log('[Cron] Iniciando políticas de retenção de dados...');
  exec(
    'curl -X GET https://28webconnect.com/api/cron/data-retention -H "Authorization: Bearer ${CRON_SECRET}"',
    (error, stdout, stderr) => {
      if (error) {
        console.error(`[Cron] Erro: ${error.message}`);
        return;
      }
      console.log(`[Cron] ${stdout}`);
    }
  );
});
```

#### Opção 3: Execução Manual (Admin)

Para testes ou execuções emergenciais, SUPER_ADMIN pode executar manualmente:

```typescript
// Em uma página admin
import { runDataRetentionManual } from '@/app/actions/admin-data-retention';

const result = await runDataRetentionManual();
```

### Exceções e Overrides

#### Campo `doNotDelete`

Administradores podem marcar usuários específicos para preservação permanente:

```typescript
await prisma.user.update({
  where: { id: userId },
  data: { doNotDelete: true },
});
```

**Casos de uso:**

- Clientes VIP com contratos especiais
- Contas de teste/demonstração
- Usuários com processos legais em andamento

#### Dados Contratuais/Financeiros

Projetos e briefings marcados com `isContractual = true` são mantidos por **5 anos** conforme obrigações fiscais (Código Civil Art. 205), independente da inatividade do usuário.

**Implementação:**

- Campo `isContractual: boolean` em `Project` e `Briefing`
- A lógica de exclusão em `deleteUserData()` preserva automaticamente esses registros
- Os registros preservados têm `userId` definido como `null` para remover o vínculo PII
- Após 5 anos, uma rotina separada (não implementada) pode excluir definitivamente esses registros

**Casos de uso para `isContractual = true`:**

- Projetos com contrato assinado
- Briefings que resultaram em faturamento
- Qualquer registro com obrigação fiscal ou legal de retenção

### Logging e Monitoramento

#### Logs Gerados

```typescript
{
  success: true,
  summary: {
    warningsSent: 5,
    usersDeleted: 2,
    briefingsAnonymized: 12
  },
  errors: [],
  duration: "1234ms",
  timestamp: "2026-02-06T03:00:00.000Z"
}
```

#### Métricas Recomendadas

- Total de avisos enviados (diário/mensal)
- Total de usuários excluídos (diário/mensal)
- Total de briefings anonimizados (diário/mensal)
- Taxa de reativação após aviso (usuários que fizeram login após receber aviso)
- Erros e falhas

#### Alertas

Configurar alertas para:

- Falha no cron job por 3 dias consecutivos
- Mais de 10 erros em uma única execução
- Exclusão de mais de 50 usuários em um dia (possível bug)

### Variáveis de Ambiente

```env
# Proteção da API de cron
CRON_SECRET=seu-token-seguro-aqui

# Configuração de alertas (opcional)
ALERT_WEBHOOK_URL=https://hooks.slack.com/...
ALERT_EMAIL=admin@28webconnect.com
```

### Conformidade LGPD

Esta implementação atende aos seguintes artigos da LGPD:

- **Art. 15**: Término do tratamento de dados
- **Art. 16**: Eliminação de dados após término da finalidade
- **Art. 18, VI**: Direito à eliminação de dados
- **Art. 48**: Comunicação de incidentes de segurança

### Testes

#### Teste de Aviso de Inatividade

```typescript
// Criar usuário de teste com lastLoginAt = 11 meses atrás
const testUser = await prisma.user.create({
  data: {
    email: 'teste-inatividade@example.com',
    name: 'Teste Inatividade',
    password: await bcrypt.hash('senha123', 10),
    emailVerified: new Date(),
    role: 'CLIENTE',
    lastLoginAt: new Date(Date.now() - 11 * 30 * 24 * 60 * 60 * 1000),
  },
});

// Executar verificação
const result = await checkInactiveUsers();
console.log(result); // Deve enviar 1 aviso
```

#### Teste de Exclusão

```typescript
// Criar usuário de teste com lastLoginAt = 12 meses atrás
const testUser = await prisma.user.create({
  data: {
    email: 'teste-exclusao@example.com',
    name: 'Teste Exclusão',
    password: await bcrypt.hash('senha123', 10),
    emailVerified: new Date(),
    role: 'CLIENTE',
    lastLoginAt: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
  },
});

// Executar exclusão
const result = await deleteInactiveData();
console.log(result); // Deve excluir 1 usuário

// Verificar log
const log = await prisma.dataDeletionLog.findFirst({
  where: { userEmail: 'teste-exclusao@example.com' },
});
console.log(log); // Deve existir
```

### Notas Importantes

1. **Backup**: Considerar backup antes de exclusões em massa
2. **Reversibilidade**: Exclusões são permanentes e irreversíveis
3. **Comunicação**: Usuários são avisados 30 dias antes da exclusão
4. **Auditoria**: Todos os logs são preservados indefinidamente para compliance
5. **Performance**: Executar em horário de baixo uso (03:00 AM)

---

## Outros Cron Jobs Futuros

### Limpeza de Sessões de Chat Expiradas

Remove sessões de chat antigas de usuários anônimos.

```typescript
await prisma.chatSession.deleteMany({
  where: {
    userId: null, // Apenas anônimos
    updatedAt: {
      lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias
    },
  },
});
```

### Rotatividade de Logs

Limpar logs de auditoria antigos (se implementados).

### Relatórios Diários

Gerar relatórios de uso e enviar para administradores.

---

## Notas de Implementação

1. **Backup**: Considerar backup antes de deleções em massa
2. **Soft Delete**: Avaliar necessidade de soft delete em vez de hard delete
3. **Rate Limiting**: Proteger endpoints de cron contra chamadas excessivas
4. **Idempotência**: Garantir que múltiplas execuções não causem problemas
