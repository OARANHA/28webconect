# Guia de Testes do Chat

## Visão Geral

Este documento descreve os cenários de teste para o sistema de chat com IA da 28Web Connect.

## Cenários de Teste

### 1. Envio de Mensagem como Visitante Anônimo

**Passos:**

1. Abrir o site sem fazer login
2. Clicar no botão flutuante de chat
3. Digitar uma mensagem (ex: "Quais serviços vocês oferecem?")
4. Pressionar Enter ou clicar no botão de enviar

**Resultado Esperado:**

- Mensagem aparece na lista com avatar de usuário
- Indicador de digitação aparece
- Resposta é recebida em streaming (palavra por palavra)
- Histórico é salvo no localStorage

### 2. Envio de Mensagem como Usuário Logado

**Passos:**

1. Fazer login na plataforma
2. Abrir o chat
3. Enviar mensagem
4. Fechar o chat
5. Reabrir o chat

**Resultado Esperado:**

- Mensagem é enviada e recebida normalmente
- Sessão é salva no banco de dados (tabela `chat_sessions`)
- Histórico persiste entre sessões

### 3. Recuperação de Histórico de Sessão

**Passos:**

1. Fazer login
2. Enviar várias mensagens
3. Fazer logout
4. Fazer login novamente (mesmo usuário)
5. Abrir chat

**Resultado Esperado:**

- Histórico anterior é carregado do banco de dados
- Mensagens anteriores são exibidas

### 4. Comportamento com RAG

#### 4.1 Documentos Encontrados

**Passos:**

1. Executar `npm run seed:knowledge` para indexar documentos
2. Enviar pergunta sobre serviços (ex: "O que é ERP?")

**Resultado Esperado:**

- Documentos similares são recuperados
- Resposta contém informações do contexto RAG
- Logs mostram documentos recuperados

#### 4.2 Documentos Não Encontrados

**Passos:**

1. Enviar pergunta sem relação com documentos indexados

**Resultado Esperado:**

- Chat responde educadamente que não encontrou informações
- Sugere falar com um consultor humano

### 5. Tratamento de Erros

#### 5.1 Erro de API

**Simulação:**

```bash
# Desconfigurar API key
unset MISTRAL_API_KEY
unset GROQ_API_KEY
```

**Passos:**

1. Enviar mensagem

**Resultado Esperado:**

- Mensagem de erro é exibida
- Botão "Tentar Novamente" aparece
- Analytics registra erro

#### 5.2 Limite de Caracteres

**Passos:**

1. Digitar mensagem com mais de 1000 caracteres

**Resultado Esperado:**

- Contador mostra vermelho quando passa de 900 caracteres
- Botão de envio é desabilitado

### 6. Responsividade

#### 6.1 Desktop (>768px)

**Verificações:**

- Modal tem largura fixa de 384px (w-96)
- Altura máxima de 600px
- Botão flutuante no canto inferior direito

#### 6.2 Mobile (<768px)

**Verificações:**

- Modal ocupa tela inteira
- Botão flutuante não obstrui conteúdo importante
- Touch funciona corretamente

### 7. Acessibilidade

**Verificações:**

- Navegação por teclado (Tab, Shift+Tab)
- Labels ARIA nos botões
- Contraste de cores adequado
- Foco visível em elementos interativos

### 8. Performance

#### 8.1 Tempo de Resposta

**Métricas Esperadas:**

- Geração de embedding: <500ms
- Busca vetorial: <50ms (com índice HNSW)
- Primeiro token: <1s
- Resposta completa: <3s

#### 8.2 Streaming

**Verificações:**

- Tokens aparecem gradualmente
- Não há travamentos na UI
- Scroll automático funciona

## Testes Automatizados

### Teste de Embeddings

```bash
npm run test:embeddings
```

**Validações:**

- Embedding é gerado corretamente (1536 dimensões)
- Documentos são armazenados no banco
- Busca semântica retorna resultados

### Teste de Seed

```bash
npm run seed:knowledge
npm run seed:knowledge --force
```

**Validações:**

- Documentos são indexados sem erros
- Reindexação funciona com `--force`
- Embeddings são gerados para todos os documentos

## Troubleshooting

### Erro: "MISTRAL_API_KEY não configurada"

**Solução:**

```bash
echo 'MISTRAL_API_KEY="sua-chave"' >> .env.local
echo 'GROQ_API_KEY="sua-chave"' >> .env.local
```

### Erro: "Embedding não pode ser nulo"

**Causa:** Extensão pgvector não habilitada

**Solução:**

```bash
npx prisma migrate reset
# Ou manualmente no PostgreSQL:
CREATE EXTENSION IF NOT EXISTS vector;
```

### Chat não responde

**Verificações:**

1. Verificar logs do servidor (`npm run dev`)
2. Verificar Network tab no DevTools
3. Verificar se `/api/chat` retorna 200
4. Verificar se documentos foram indexados

## Métricas de Sucesso

| Métrica                     | Objetivo     |
| --------------------------- | ------------ |
| Tempo de resposta médio     | <2s          |
| Taxa de erros               | <5%          |
| Documentos recuperados      | ≥2 por query |
| Score de similaridade médio | >0.6         |
| Satisfação do usuário       | >80%         |

## Checklist de Lançamento

- [ ] Todos os cenários de teste passam
- [ ] Seed da base de conhecimento executado
- [ ] Variáveis de ambiente configuradas em produção
- [ ] Índice HNSW criado no banco
- [ ] Analytics configurado
- [ ] Documentação atualizada
- [ ] Testes de carga realizados (100+ usuários simultâneos)
