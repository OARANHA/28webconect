# Guia de Performance - 28Web Connect

Este guia documenta as estratégias e melhores práticas de performance implementadas na aplicação.

## 🎯 Core Web Vitals Targets

| Métrica                        | Target  | Descrição                                          |
| ------------------------------ | ------- | -------------------------------------------------- |
| LCP (Largest Contentful Paint) | < 2.5s  | Tempo até o maior elemento visível ser renderizado |
| FID (First Input Delay)        | < 100ms | Tempo de resposta à primeira interação             |
| CLS (Cumulative Layout Shift)  | < 0.1   | Estabilidade visual durante carregamento           |
| FCP (First Contentful Paint)   | < 1.8s  | Tempo até primeiro conteúdo visível                |
| TTI (Time to Interactive)      | < 3.8s  | Tempo até página ser totalmente interativa         |

## 🚀 Estratégias Implementadas

### 1. Lazy Loading de Componentes

Componentes pesados são carregados dinamicamente para reduzir o bundle inicial:

```typescript
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(
  () => import('@/components/chat').then((mod) => ({ default: mod.ChatWidget })),
  { ssr: false, loading: () => null }
);
```

**Componentes com lazy loading:**

- `ChatWidget` - Chat flutuante (não crítico para LCP)
- `CookieBanner` - Banner de cookies (após interação)
- `SessionProvider` - Contexto de autenticação

### 2. Streaming com Suspense

Páginas usam Suspense boundaries para streaming de componentes:

```tsx
<Suspense fallback={<HeroSkeleton />}>
  <HeroSection />
</Suspense>
```

**Seções com Suspense:**

- Hero Section (prioritária)
- Services Section (lazy loaded)
- Benefits Section (lazy loaded)
- CTA Section (lazy loaded)
- Footer (lazy loaded)

### 3. Otimização de Imagens

Uso de `next/image` com otimizações:

```tsx
<Image
  src="/assets/28connect.jpg"
  alt="28Web Connect"
  width={40}
  height={40}
  priority // Para imagens acima da dobra
  sizes="40px" // Hint de tamanho
/>
```

**Regras de imagens:**

- Primeira imagem above-the-fold: `priority={true}`
- Demais imagens: `loading="lazy"` (padrão)
- Usar `sizes` prop para responsive images
- Formatos: AVIF (preferido), WebP, JPEG

### 4. Cache Headers

Assets estáticos têm cache de 1 ano:

```javascript
// next.config.js
{
  source: '/_next/static/:path*',
  headers: [
    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
  ]
}
```

### 5. Prefetch Strategy

Controle granular de prefetching de rotas:

| Tipo de Link        | Prefetch | Justificativa                |
| ------------------- | -------- | ---------------------------- |
| Navegação principal | `false`  | Usuário pode não clicar      |
| CTAs principais     | `true`   | Alta probabilidade de clique |
| Footer links        | `false`  | Baixa prioridade             |
| Service cards       | `false`  | Prefetch on-hover manual     |

**Prefetch on-hover:**

```tsx
<Link
  href="/servicos"
  prefetch={false}
  onMouseEnter={() => router.prefetch('/servicos')}
>
```

### 6. Fontes Otimizadas

Uso de `next/font/google` com otimizações:

```typescript
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Evita FOIT (Flash of Invisible Text)
  preload: true, // Pré-carrega fonte crítica
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true, // Ajusta métricas do fallback
});
```

### 7. Bundle Optimization

**Code splitting por rota:**

- Cada rota carrega apenas o necessário
- Webpack config para otimização de chunks

**Otimização de imports:**

```javascript
// next.config.js
experimental: {
  optimizePackageImports: ['lucide-react', 'framer-motion'],
}
```

### 8. Animações CSS vs Framer Motion

**Preferir CSS quando possível:**

- Hero section: animações CSS puras
- Card hover effects: Tailwind transitions
- Menu mobile: CSS transitions

**Usar Framer Motion apenas para:**

- Animações complexas de entrada/saída
- Gestures e interações avançadas
- AnimatePresence para mount/unmount

### 9. Skeletons e Loading States

**Variantes disponíveis:**

- `text` - Linha de texto
- `title` - Título (largura reduzida)
- `card` - Card completo
- `circle` - Avatar/imagem circular
- `rectangle` - Bloco retangular

**Uso:**

```tsx
<Skeleton variant="card" className="h-48" />
<Skeleton variant="text" count={3} />
```

### 10. Resource Hints

Preconnect para domínios externos:

```html
<link rel="preconnect" href="https://api.mistral.ai" />
<link rel="dns-prefetch" href="https://api.mailgun.net" />
```

## 🧪 Testando Performance

### Lighthouse Local

```bash
# Instalar dependências
npm install -D lighthouse chrome-launcher

# Rodar teste
npm run test:performance

# Ou com URL customizada
node scripts/lighthouse-test.js http://localhost:3000
```

### Verificações Manuais

1. **Bundle size:**

   ```bash
   npm run build
   # Verificar chunks em .next/static/chunks
   ```

2. **Network tab:**
   - Framer-motion não deve carregar na página inicial
   - ChatWidget só carrega após interação
   - Imagens usando next/image

3. **Performance tab (DevTools):**
   - LCP < 2.5s
   - CLS < 0.1
   - Nenhum layout shift durante carregamento

## 📝 Checklist para Novas Features

Antes de mergear nova feature:

- [ ] Componentes > 100KB usam dynamic import
- [ ] Imagens usam next/image com sizes apropriados
- [ ] Animações preferem CSS over JS quando possível
- [ ] Novas rotas têm loading.tsx
- [ ] Novas rotas têm error.tsx
- [ ] Links usam prefetch estrategicamente
- [ ] Teste de Lighthouse passando (score > 90)

## 📊 Monitoramento

### Métricas para acompanhar

1. **Real User Monitoring (RUM):**
   - Implementar Web Vitals reporting
   - Enviar métricas para analytics

2. **CI/CD:**
   - Integrar Lighthouse CI para PRs
   - Alerta se performance < 90

3. **Bundle Analysis:**
   ```bash
   npm install -D @next/bundle-analyzer
   ANALYZE=true npm run build
   ```

## 🐛 Troubleshooting

### Bundle muito grande

```bash
# Analisar bundle
npx @next/bundle-analyzer

# Verificar imports
# Evitar: import { motion } from 'framer-motion' (importa tudo)
# Preferir: import { motion } from 'framer-motion/client'
```

### LCP alto

- Verificar se imagem hero tem `priority`
- Usar placeholder blur para imagens
- Reduzir conteúdo above-the-fold

### CLS alto

- Definir width/height em imagens
- Usar Skeleton durante carregamento
- Evitar inserção de conteúdo dinâmico no topo

### FID alto

- Quebrar long tasks (> 50ms)
- Usar requestIdleCallback para não-críticos
- Lazy load componentes pesados

## 📚 Recursos

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Framer Motion - Reduce bundle size](https://www.framer.com/motion/guide-reduce-bundle-size/)
