# Dashboard Layout - Documentação

## Visão Geral

O dashboard utiliza uma arquitetura híbrida com Server Components para dados e autenticação, e Client Components para interatividade.

## Estrutura

```
app/(dashboard)/
├── layout.tsx          # Server Component - Layout principal
├── loading.tsx         # Loading state
├── error.tsx           # Error boundary
└── dashboard/
    └── page.tsx        # Página inicial do dashboard

components/dashboard/
├── Sidebar.tsx         # Navegação lateral
├── Topbar.tsx          # Header com usuário e notificações
├── DashboardCard.tsx   # Cards de estatísticas
├── EmptyState.tsx      # Estado vazio reutilizável
└── MobileMenuToggle.tsx # Botão de menu mobile
```

## Arquitetura

### Server Components

- **`layout.tsx`**: Obtém sessão via `requireEmailVerified()`, renderiza estrutura base
- **`page.tsx`**: Busca dados (placeholder), renderiza conteúdo específico

### Client Components

- **`Sidebar.tsx`**: Estado mobile, navegação, signOut
- **`Topbar.tsx`**: Dropdown, click outside, breadcrumb
- **`DashboardCard.tsx`**: Animações hover
- **`EmptyState.tsx`**: Estados vazios
- **`MobileMenuToggle.tsx`**: Toggle com animação

## Responsividade

### Mobile (< 768px)

- Sidebar oculta por padrão
- Overlay com backdrop blur quando aberta
- Topbar com botão hamburger
- Animação slide-in da sidebar

### Tablet (768px - 1024px)

- Sidebar fixa, largura 256px
- Topbar compacto
- Conteúdo com padding reduzido

### Desktop (> 1024px)

- Sidebar sempre visível
- Topbar completo com info do usuário
- Conteúdo com padding generoso

## Navegação

### Itens do Menu

| Label         | Ícone           | Rota           | Visibilidade       |
| ------------- | --------------- | -------------- | ------------------ |
| Dashboard     | LayoutDashboard | /dashboard     | Todos              |
| Projetos      | FolderKanban    | /projetos      | Todos              |
| Briefing      | FileText        | /briefing      | Todos              |
| Configurações | Settings        | /configuracoes | Todos              |
| Admin         | Shield          | /admin         | ADMIN, SUPER_ADMIN |

### Ações

- **Sair**: Chama `signOut({ callbackUrl: '/login' })` do NextAuth

## Componentes Reutilizáveis

### DashboardCard

```tsx
<DashboardCard
  title="Projetos Ativos"
  value={5}
  icon={<FolderKanban className="w-6 h-6" />}
  variant="accent" // ou "default"
/>
```

### EmptyState

```tsx
<EmptyState
  icon={<Rocket className="w-full h-full" />}
  title="Nenhum projeto"
  description="Comece criando seu primeiro projeto"
  actionLabel="Criar Projeto"
  actionHref="/projetos/novo"
/>
```

## Segurança

1. **Autenticação**: `requireEmailVerified()` garante usuário logado e email verificado
2. **Autorização**: Sidebar verifica `userRole` para mostrar itens admin
3. **Middleware**: Rotas `/dashboard/*` protegidas em `middleware.ts`

## Performance

- **Code Splitting**: Componentes client-side carregados com `dynamic()`
- **Suspense**: Skeletons exibidos durante carregamento
- **Prefetch**: Links de navegação com `prefetch={false}` (exceto Dashboard)
- **Lazy Load**: Dropdown carregado sob demanda

## Temas

O dashboard usa o design system existente:

- **Background**: `bg-dark-bg` (principal), `bg-dark-bg-secondary` (cards)
- **Texto**: `text-neutral-white` (títulos), `text-neutral-gray` (corpo)
- **Acento**: `bg-accent-primary` (botões), `text-accent-primary` (links)
- **Bordas**: `border-neutral-gray/10` (subtle), `border-accent-primary/30` (destaque)

## Estados

### Loading

- Skeleton da sidebar (retângulos)
- Skeleton do topbar (retângulo + círculo)
- Skeleton dos cards (3 cards)

### Error

- Ícone de alerta
- Mensagem amigável
- Botão "Tentar novamente" (chama `reset()`)

### Empty

- Ícone grande (64px)
- Título e descrição
- Botão de ação opcional
