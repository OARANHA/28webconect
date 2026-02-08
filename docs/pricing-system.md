# Sistema de Preços - 28Web Connect

## Visão Geral

O sistema de preços do 28Web Connect é uma solução completa para gerenciamento de planos de serviços, incluindo ERP, E-commerce e Landing Pages com IA. O sistema suporta múltiplos níveis de acesso, drag-and-drop para reordenação e validações robustas de negócio.

## Arquitetura

O sistema é dividido em três camadas:

1. **Server Actions** (`app/actions/pricing.ts`) - Lógica de negócio e acesso ao banco
2. **Páginas Protegidas** - Autenticação e autorização baseada em roles
3. **Componentes Reutilizáveis** - UI para exibição e edição de planos

## Fluxos Principais

### 1. Visualização de Preços (Cliente)

```
/precos (protegido)
├── Requer autenticação + email verificado
├── Exibe apenas planos ativos (isActive: true)
├── Ordenados por campo 'order'
└── CTA: "Enviar Briefing" → /briefing?service={serviceType}
```

### 2. Visualização Pública (Visitante)

```
/precos (público)
├── Se logado: redireciona para /precos (dashboard)
├── Se não logado: mostra página de bloqueio
├── Call-to-action: Login ou Cadastro
└── Preview de soluções (sem preços)
```

### 3. Gestão Administrativa

```
/admin/precos (admin only)
├── Requer role ADMIN ou SUPER_ADMIN
├── Lista todos os planos (ativos/inativos)
├── Drag-and-drop para reordenar
├── Modal para criar/editar planos
└── Toggle ativar/desativar com validação
```

## Estrutura de Dados

### Modelo PricingPlan (Prisma)

```prisma
model PricingPlan {
  id           String      @id @default(cuid())
  name         String      @unique
  serviceType  ServiceType @unique
  price        Decimal     @db.Decimal(10, 2)
  features     Json        // Array de strings
  storageLimit Int         // GB
  isActive     Boolean     @default(true)
  order        Int         @default(0)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}
```

### ServiceType Enum

```typescript
enum ServiceType {
  ERP_BASICO
  ERP_ECOMMERCE
  ERP_PREMIUM
  LANDING_IA
  LANDING_IA_WHATSAPP
}
```

## Server Actions

### getPricingPlans()

Busca todos os planos ativos ordenados por `order`.

```typescript
const plans = await getPricingPlans();
// Retorna: PricingPlan[] (apenas isActive: true)
```

### getAllPricingPlans()

Busca todos os planos (admin only).

```typescript
const plans = await getAllPricingPlans();
// Retorna: PricingPlan[] (todos)
```

### updatePlan(planId, data)

Atualiza um plano existente.

```typescript
const result = await updatePlan(planId, {
  name: 'Novo Nome',
  price: 1999.99,
  features: ['Feature 1', 'Feature 2'],
  storageLimit: 50,
});
// Retorna: { success: boolean, error?: string, message?: string }
```

### createPlan(data)

Cria um novo plano.

```typescript
const result = await createPlan({
  name: 'Plano Novo',
  serviceType: ServiceType.ERP_BASICO,
  price: 999.99,
  features: ['Feature 1'],
  storageLimit: 10,
});
// Retorna: { success: boolean, planId?: string, error?: string }
```

### togglePlanActive(planId)

Alterna status ativo/inativo com validação de clientes.

```typescript
const result = await togglePlanActive(planId);
// Retorna: { success: boolean, error?: string, message?: string }
// Erro se houver clientes ativos: "Não é possível desativar este plano. Existem X clientes ativos utilizando-o."
```

### reorderPlans(planIds)

Reordena planos baseado no array de IDs.

```typescript
const result = await reorderPlans(['id1', 'id2', 'id3']);
// Retorna: { success: boolean, error?: string, message?: string }
```

### hasActiveClients(serviceType)

Verifica se existem clientes usando o plano.

```typescript
const hasClients = await hasActiveClients(ServiceType.ERP_BASICO);
// Retorna: boolean
```

## Componentes

### PricingCard

Card de exibição de plano com duas variantes:

**Variante Cliente (`variant="client"`)**:

- Layout elegante com preço destacado
- Lista de features com ícones
- Badge de storage
- CTA "Enviar Briefing"

**Variante Admin (`variant="admin"`)**:

- Informações compactas
- Badge de status (Ativo/Inativo)
- Botões de Editar e Ativar/Desativar
- Mostra número da ordem

```tsx
<PricingCard
  plan={plan}
  variant="client" | "admin"
  onEdit={(plan) => {}}
  onToggleActive={(planId) => {}}
/>
```

### PricingEditor

Modal de edição/criação de planos.

```tsx
<PricingEditor
  plan={plan} // null para criação
  isOpen={boolean}
  onClose={() => {}}
/>
```

**Campos**:

- Nome do Plano (text)
- Tipo de Serviço (select, disabled em edição)
- Preço (number, moeda)
- Storage Limit (number, GB)
- Features (array dinâmico, max 15)

### PricingList

Lista de planos com drag-and-drop.

```tsx
<PricingList initialPlans={plans} />
```

**Funcionalidades**:

- Reordenação via drag-and-drop (@dnd-kit)
- Edição inline (abre modal)
- Ativar/desativar com confirmação
- Botão para criar novo plano

## Validações

### Validações de Formulário (Zod)

```typescript
// updatePlanSchema
{
  name: string (3-100 chars)
  price: number (> 0)
  features: string[] (1-15 items)
  storageLimit: number (> 0)
}

// createPlanSchema
updatePlanSchema + {
  serviceType: ServiceType (enum)
}
```

### Validações de Negócio

1. **ServiceType único**: Não é possível criar dois planos com o mesmo `serviceType`
2. **Desativação com clientes**: Não é possível desativar plano com clientes ativos (briefings APROVADO)
3. **Reordenação**: Apenas admins podem reordenar planos
4. **Edição limitada**: O `serviceType` não pode ser alterado após criação

## Proteção de Rotas

### Cliente

```typescript
await requireEmailVerified();
// Redireciona para /login se não autenticado
// Redireciona para /verificar-email se email não verificado
```

### Admin

```typescript
await requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
// Redireciona para /dashboard se role insuficiente
```

## Integração com Briefing

O link "Enviar Briefing" nos cards de preço inclui o parâmetro `service`:

```
/briefing?service=ERP_BASICO
```

O formulário de briefing captura este parâmetro e:

1. Pré-seleciona o tipo de serviço
2. Avança automaticamente para o step 2

## Estilização

O sistema segue o dark theme do projeto:

- **Background**: `dark-bg-secondary`
- **Bordas**: `neutral-gray/10` (padrão), `accent-primary/30` (destaque)
- **Cores de acento**: `#ff6b35`, `#ff8c42`
- **Cards**: Bordas tracejadas (`dashed`) para planos inativos
- **Hover**: Elevação sutil (`-translate-y-1`) e sombra

## Hooks e Dependências

```bash
# Drag-and-drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Já incluídas no projeto
react-hook-form
@hookform/resolvers
zod
@tanstack/react-query
sonner (toasts)
lucide-react (ícones)
```

## Exemplos de Uso

### Criar um novo plano

```typescript
import { createPlan } from '@/app/actions/pricing';
import { ServiceType } from '@prisma/client';

const result = await createPlan({
  name: 'ERP Empresarial',
  serviceType: ServiceType.ERP_PREMIUM,
  price: 4999.99,
  features: ['Módulos customizáveis', 'API dedicada', 'Suporte 24/7', 'Treinamento incluso'],
  storageLimit: 100,
});

if (result.success) {
  console.log('Plano criado:', result.planId);
} else {
  console.error('Erro:', result.error);
}
```

### Verificar clientes antes de desativar

```typescript
import { hasActiveClients, togglePlanActive } from '@/app/actions/pricing';
import { ServiceType } from '@prisma/client';

const plan = { id: '...', serviceType: ServiceType.ERP_BASICO };

const hasClients = await hasActiveClients(plan.serviceType);
if (hasClients) {
  console.warn('Não é possível desativar: existem clientes ativos');
} else {
  await togglePlanActive(plan.id);
}
```

## Tratamento de Erros

| Erro                  | Mensagem ao Usuário                                                            |
| --------------------- | ------------------------------------------------------------------------------ |
| Validação Zod         | Mensagem específica do campo                                                   |
| Plano não encontrado  | "Plano não encontrado"                                                         |
| ServiceType duplicado | "Já existe um plano para este tipo de serviço"                                 |
| Clientes ativos       | "Não é possível desativar este plano. Existem X clientes ativos utilizando-o." |
| Erro de conexão       | "Erro de conexão. Tente novamente."                                            |
| Permissão negada      | Redireciona para /dashboard                                                    |

## Manutenção

### Adicionar novo tipo de serviço

1. Adicionar ao enum `ServiceType` no schema.prisma
2. Atualizar `validServiceTypes` em `lib/validations/pricing.ts`
3. Adicionar labels e descrições em `components/pricing/PricingCard.tsx`
4. Adicionar opção no select de `PricingEditor.tsx`
5. Rodar `npx prisma migrate dev`

### Seed de planos iniciais

Os planos são criados via seed do Prisma. Verifique `prisma/seed.ts` para a configuração inicial.

---

**Última atualização**: Fevereiro 2026
**Responsável**: Equipe 28Web Connect
