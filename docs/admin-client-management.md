# Documentação: Gestão de Clientes (Admin)

## Visão Geral

O módulo de Gestão de Clientes permite que administradores visualizem, analisem e gerenciem todos os clientes cadastrados na plataforma 28Web Connect.

## Estrutura de Dados

### Tipos Principais

```typescript
// Cliente na listagem (com estatísticas agregadas)
interface AdminClientListItem {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  lastLoginAt: Date | null;
  emailVerified: Date | null; // null = cliente inativo
  _count: {
    briefings: number;
    projects: number;
  };
}

// Cliente completo (com histórico)
interface AdminClientWithHistory {
  // ...dados do cliente
  briefings: Briefing[];
  projects: Project[];
  projectComments: Comment[];
  projectFiles: File[];
}
```

## Métricas Calculadas

### Leads do Mês

- **Definição**: Usuários com role `CLIENTE` criados no mês atual
- **Fonte**: `User` table, filtrado por `createdAt` e `role`

### Taxa de Conversão

- **Fórmula**: `(briefings aprovados / total de briefings) * 100`
- **Briefings aprovados**: Status `APROVADO` com `reviewedAt` no período

### Projetos Ativos

- **Definição**: Projetos com status `ATIVO` ou `AGUARDANDO_APROVACAO`

### Receita Estimada

- **Baseada em**: Valores fixos por tipo de serviço
  - ERP Básico: R$ 5.000
  - ERP E-commerce: R$ 8.000
  - ERP Premium: R$ 15.000
  - Landing IA: R$ 3.000
  - Landing IA + WhatsApp: R$ 4.500

## Filtros Disponíveis

| Filtro       | Tipo                     | Descrição                      |
| ------------ | ------------------------ | ------------------------------ |
| `status`     | `'active' \| 'inactive'` | Filtra por status do cliente   |
| `searchTerm` | `string`                 | Busca em nome, email e empresa |
| `dateFrom`   | `Date`                   | Data inicial de cadastro       |
| `dateTo`     | `Date`                   | Data final de cadastro         |

## Processo de Desativação

### Regras

1. **Pré-condição**: Cliente não pode ter projetos ativos
2. **Mecanismo**: Remove `emailVerified` (bloqueia login)
3. **Notificação**: Cliente recebe notificação IN_APP e EMAIL

### Fluxo

```
1. Admin clica "Desativar Cliente"
2. Sistema verifica projetos ativos
3. Se houver projetos ativos → Erro
4. Se não houver → Atualiza user.emailVerified = null
5. Cria notificação para o cliente
6. Retorna sucesso
```

## Permissões

| Ação                 | Permissão          |
| -------------------- | ------------------ |
| Visualizar Dashboard | ADMIN, SUPER_ADMIN |
| Listar Clientes      | ADMIN, SUPER_ADMIN |
| Ver Histórico        | ADMIN, SUPER_ADMIN |
| Desativar Cliente    | ADMIN, SUPER_ADMIN |
| Exportar CSV         | ADMIN, SUPER_ADMIN |

## Exportação CSV

### Colunas Exportadas

- Nome
- Email
- Empresa
- Telefone
- Data de Cadastro
- Último Login
- Total de Briefings
- Projetos Ativos

### Formato

- Separador: `;` (ponto-e-vírgula)
- Encoding: UTF-8 com BOM
- Datas: Formato pt-BR (DD/MM/YYYY)

## Gráficos

### 1. Leads por Mês (LineChart)

- **Eixo X**: Mês/Ano (ex: "Jan/24")
- **Eixo Y**: Quantidade de leads
- **Cor da linha**: `#ff6b35` (accent-primary)
- **Período**: Últimos 6 meses

### 2. Conversão por Serviço (BarChart)

- **Barras**: Total de Briefings (azul) vs Aprovados (verde)
- **Tooltip**: Mostra taxa de conversão em %

### 3. Projetos por Status (PieChart)

- **Cores por status**:
  - ATIVO: Verde (#10b981)
  - CONCLUIDO: Azul (#3b82f6)
  - PAUSADO: Amarelo (#f59e0b)
  - CANCELADO: Vermelho (#ef4444)
  - ARQUIVADO: Cinza (#6b7280)
  - AGUARDANDO_APROVACAO: Roxo (#8b5cf6)

## Rotas

| Rota                   | Componente           | Descrição              |
| ---------------------- | -------------------- | ---------------------- |
| `/admin`               | AdminDashboardClient | Dashboard com métricas |
| `/admin/clientes`      | ClientsListClient    | Lista de clientes      |
| `/admin/clientes/[id]` | ClientHistoryClient  | Histórico detalhado    |

## Server Actions

### `getMetrics()`

Retorna métricas agregadas para o dashboard.

### `getClients(filters?)`

Retorna lista de clientes com estatísticas.

### `getClientById(clientId)`

Retorna cliente completo com histórico.

### `deactivateClient(clientId)`

Desativa cliente (se não tiver projetos ativos).

### `exportClientsCSV(filters?)`

Retorna dados formatados para exportação CSV.

## Validações Zod

```typescript
// Filtros
adminClientFiltersSchema: {
  status?: 'active' | 'inactive',
  searchTerm?: string (max 100),
  dateFrom?: Date,
  dateTo?: Date
}

// ID do cliente
clientIdSchema: string.cuid()
```

## Performance

### Otimizações Implementadas

- Paginação: 10 itens por página na tabela
- Limite de histórico: 50 registros por tipo
- `select` no Prisma para buscar apenas campos necessários
- Agregações paralelas com `Promise.all`

### Cache (Futuro)

- Recomenda-se cache de métricas com revalidação a cada 5 minutos
- Usar `unstable_cache` do Next.js

## Segurança

### Validações

- Todas as rotas protegidas com `requireRole([ADMIN, SUPER_ADMIN])`
- Inputs validados com Zod antes de queries
- Sanitização de dados CSV para prevenir CSV injection

### Auditoria

- Logs de erro no console para debugging
- Notificações enviadas para cliente em ações críticas

## Componentes

### Reutilizáveis

- `ClientTable`: Tabela com filtros e paginação
- `ClientHistory`: Tabs de histórico do cliente
- `AdminCharts`: Gráficos do dashboard
- `MetricsCard`: Cards de métricas (já existente)

### Específicos

- `AdminDashboardClient`: Dashboard com gráficos
- `ClientsListClient`: Lista com estatísticas
- `ClientHistoryClient`: Página de histórico com ações

## Dependências

```json
{
  "recharts": "^2.x",
  "lucide-react": "^0.x"
}
```

## Considerações Futuras

1. **Cache**: Implementar cache de métricas
2. **Relatórios PDF**: Adicionar exportação em PDF
3. **Filtros Avançados**: Mais opções de filtro na tabela
4. **Bulk Actions**: Ações em massa (exportar selecionados, etc.)
5. **Logs de Auditoria**: Tabela de logs para ações administrativas
