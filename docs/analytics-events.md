# Documentação de Analytics - 28Web Connect

## Introdução

A 28Web Connect utiliza **Umami Analytics**, uma solução de analytics self-hosted e privacy-friendly. O Umami coleta dados de forma anônima, sem usar cookies de terceiros ou rastreamento cross-site.

### Conformidade LGPD

- ✅ **Consentimento explícito**: Script só carrega após consentimento do usuário
- ✅ **Revogação**: Usuário pode alterar preferências a qualquer momento via Cookie Settings
- ✅ **Dados próprios**: Servidor Umami é de nossa propriedade (não compartilhamos com terceiros)
- ✅ **Anonimização**: IPs são truncados, não coletamos dados pessoais identificáveis

### Dashboard

Acesse o dashboard do Umami em: `NEXT_PUBLIC_UMAMI_URL`

---

## Configuração

### Variáveis de Ambiente

```env
# Umami Analytics - Analytics privacy-friendly self-hosted
# NEXT_PUBLIC_UMAMI_WEBSITE_ID: ID do website no dashboard Umami (Settings → Websites)
NEXT_PUBLIC_UMAMI_WEBSITE_ID="your-umami-website-id"
# NEXT_PUBLIC_UMAMI_URL: URL da instância Umami (ex: https://analytics.28webconnect.com)
NEXT_PUBLIC_UMAMI_URL="https://analytics.yourdomain.com"
```

### Como Obter Website ID

1. Acesse seu dashboard Umami
2. Vá em **Settings → Websites**
3. Clique em **Add Website**
4. Insira o nome e domínio do site
5. Copie o **Website ID** gerado

---

## Eventos Automáticos

O Umami rastreia automaticamente:

| Métrica       | Descrição                                    |
| ------------- | -------------------------------------------- |
| **Pageviews** | Cada página visitada                         |
| **Sessões**   | Visitas únicas (calculadas automaticamente)  |
| **Referrers** | Origem do tráfego                            |
| **Browsers**  | Navegadores mais usados                      |
| **Devices**   | Dispositivos (desktop, mobile, tablet)       |
| **OS**        | Sistemas operacionais                        |
| **Countries** | Países de origem (baseado em IP anonimizado) |

---

## Eventos Customizados

### Tabela de Eventos

| Evento                  | Descrição                            | Localização                               | Metadata                              | Quando Dispara         |
| ----------------------- | ------------------------------------ | ----------------------------------------- | ------------------------------------- | ---------------------- |
| `cadastro_iniciado`     | Usuário abriu formulário de cadastro | `app/(auth)/cadastro/page.tsx`            | Nenhuma                               | Ao montar componente   |
| `cadastro_completado`   | Cadastro finalizado com sucesso      | `app/actions/auth.ts`                     | Nenhuma                               | Após criação de conta  |
| `login_sucesso`         | Login realizado com sucesso          | `app/actions/auth.ts`                     | `{ method: 'credentials' }`           | Após autenticação      |
| `logout`                | Usuário fez logout                   | `components/layout/UserMenu.tsx`          | Nenhuma                               | Ao clicar em Sair      |
| `servico_visualizado`   | Usuário clicou em card de serviço    | `app/(site)/servicos/page.tsx`            | `{ servico: string }`                 | Ao clicar no card      |
| `pagina_contato_aberta` | Página de contato acessada           | `app/(site)/contato/page.tsx`             | Nenhuma                               | Ao montar componente   |
| `faq_acessada`          | Página de FAQ acessada               | `app/(site)/faq/page.tsx`                 | Nenhuma                               | Ao montar componente   |
| `chat_aberto`           | Chat IA foi aberto                   | `components/chat/ChatWidget.tsx` (futuro) | `{ origem: 'widget' \| 'dashboard' }` | Ao abrir modal do chat |
| `chat_mensagem_enviada` | Mensagem enviada no chat             | `components/chat/ChatWidget.tsx` (futuro) | `{ tem_anexo: boolean }`              | Ao enviar mensagem     |
| `briefing_enviado`      | Briefing submetido                   | `app/actions/briefing.ts` (futuro)        | `{ service_type: string }`            | Após submissão         |
| `arquivo_upload`        | Arquivo enviado com sucesso          | `app/api/upload/route.ts` (futuro)        | `{ file_type: string, size: number }` | Após upload            |
| `projeto_criado`        | Novo projeto iniciado                | `app/actions/project.ts` (futuro)         | `{ project_type: string }`            | Após criação           |

---

## Como Usar

### Rastrear Evento Simples

```typescript
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';

// Em um componente ou função
const handleClick = () => {
  trackEvent(AnalyticsEvents.SERVICO_VISUALIZADO, {
    servico: 'ERP Cloud',
  });
};
```

### Rastrear Pageview Manual

```typescript
import { trackPageView } from '@/lib/analytics';

// Útil em navegações SPA sem reload
const navigateToPage = (url: string) => {
  router.push(url);
  trackPageView(url);
};
```

### Verificar Status (Debugging)

```typescript
import { getAnalyticsStatus } from '@/lib/analytics';

// No console do navegador
console.log(getAnalyticsStatus());
// Retorna: { consentimento: true, umamiCarregado: true, websiteId: '...', umamiUrl: '...' }
```

---

## Boas Práticas

### 1. Nomes de Eventos

- Use `snake_case` (ex: `cadastro_iniciado`)
- Seja descritivo mas conciso
- Evite caracteres especiais
- Use verbos no passado para ações completadas

### 2. Metadata

- **Nunca envie dados pessoais** (PII): email, nome, CPF, etc.
- Use apenas dados agregados ou identificadores genéricos
- Mantenha objetos pequenos (máximo 5-7 propriedades)
- Use tipos primitivos: string, number, boolean

### 3. Consentimento

Sempre verifique se o usuário consentiu antes de usar analytics:

```typescript
import { shouldLoadAnalytics } from '@/lib/cookies';

if (shouldLoadAnalytics()) {
  trackEvent('meu_evento');
}
```

> **Nota**: As funções `trackEvent` e `trackPageView` já fazem essa verificação internamente.

---

## Debugging

### Verificar se Umami está Carregado

```javascript
// No console do navegador
console.log(window.umami);
// Deve retornar: { track: ƒ, trackView: ƒ }
```

### Verificar Requisições

1. Abra DevTools (F12)
2. Vá na aba **Network**
3. Filtre por `umami` ou `api/send`
4. Verifique se requisições estão sendo enviadas (status 200)

### Verificar Consentimento

```javascript
// No console do navegador
const consent = JSON.parse(localStorage.getItem('cookie-consent'));
console.log(consent.preferences.analytics);
// Deve retornar: true (se analytics ativado)
```

### Logs no Console

O sistema de analytics loga avisos úteis:

```
Analytics: Umami não está carregado  // Script ainda não carregou
Analytics: Nome do evento inválido   // Evento vazio ou não-string
Analytics: Erro ao rastrear evento   // Erro de rede ou API
```

---

## Performance

### Carregamento do Script

- **Tamanho**: ~2KB gzipped
- **Carregamento**: Assíncrono (`async` + `defer`)
- **Impacto**: Mínimo em Core Web Vitals
- **Cache**: Script é cacheável por 24h

### Optimalizações

- Script só carrega se usuário consentir
- Uso de `defer` para não bloquear parse HTML
- Cleanup automático de event listeners

---

## Segurança e Privacidade

### Dados Coletados

✅ **Coletamos**:

- URL da página
- Timestamp
- User-agent (navegador, SO)
- Referrer (origem)
- País (baseado em IP anonimizado)
- Eventos customizados (sem PII)

❌ **NÃO coletamos**:

- Endereço IP completo (truncado)
- Cookies de terceiros
- Fingerprints
- Dados pessoais identificáveis
- Comportamento cross-site

### Retenção de Dados

- **Padrão**: 12 meses
- **Configuração**: Dashboard Umami → Settings → Data Retention
- **Backup**: Mantido por 24 meses (criptografado)

### Acesso aos Dados

Apenas usuários autorizados têm acesso ao dashboard:

- Administradores da 28Web Connect
- Equipe de Marketing (view-only)
- DPO (para auditorias de privacidade)

---

## Troubleshooting

### Script não carrega

1. Verifique se `NEXT_PUBLIC_UMAMI_WEBSITE_ID` está configurado
2. Verifique se `NEXT_PUBLIC_UMAMI_URL` está acessível
3. Verifique se usuário consentiu analytics (Cookie Settings)
4. Verifique console por erros de CORS

### Eventos não aparecem no dashboard

1. Aguarde 1-2 minutos (pode haver delay)
2. Verifique se `window.umami` está definido no console
3. Verifique aba Network se requisições retornam 200
4. Verifique se evento está sendo chamado (adicione `console.log`)

### Dados inconsistentes

1. Verifique timezone do servidor Umami
2. Verifique configuração de bloqueio de bots
3. Verifique se há filtros ativos no dashboard

---

## Contato

Para dúvidas sobre analytics ou solicitação de relatórios:

- **Email**: dpo@28webconnect.com
- **Assunto**: [Analytics] - sua dúvida

---

_Última atualização: 2024-02-05_
