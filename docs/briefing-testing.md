# Testes Manuais - Sistema de Briefing

Este documento descreve os cenários de teste manual para validação do sistema de briefing.

---

## Cenários de Teste

### 1. Auto-save

**Objetivo**: Verificar se o formulário salva automaticamente a cada 1 minuto

**Passos**:

1. Acesse `/briefing`
2. Preencha o campo "Nome da Empresa"
3. Aguarde 1 minuto sem interagir com a página
4. Observe o toast de notificação

**Resultado Esperado**:

- Toast aparece com mensagem "Rascunho salvo automaticamente"
- Indicador "Salvo há X minutos" é atualizado

**Critério de Aprovação**: ✅ Passou | ❌ Falhou

---

### 2. Carregamento de Rascunho

**Objetivo**: Verificar se os dados do rascunho são restaurados ao retornar

**Passos**:

1. Acesse `/briefing`
2. Preencha alguns campos (ex: Nome da Empresa, Ramo de Atividade)
3. Clique no logo para voltar ao Dashboard
4. Acesse `/briefing` novamente

**Resultado Esperado**:

- Toast "Rascunho carregado" aparece
- Campos preenchidos anteriormente estão populados

**Critério de Aprovação**: ✅ Passou | ❌ Falhou

---

### 3. Validação Progressiva

**Objetivo**: Verificar se a validação ocorre apenas no step atual

**Passos**:

1. Acesse `/briefing` (Step 1)
2. Selecione um tipo de serviço
3. Clique "Próximo" para ir ao Step 2
4. Tente clicar "Próximo" sem preencher os campos obrigatórios

**Resultado Esperado**:

- Mensagens de erro aparecem nos campos vazios
- Não avança para o próximo step

**Passos adicionais**: 5. Preencha os campos obrigatórios 6. Clique "Próximo"

**Resultado Esperado**:

- Avança para o Step 3 sem erros

**Critério de Aprovação**: ✅ Passou | ❌ Falhou

---

### 4. Campos Condicionais

**Objetivo**: Verificar se campos específicos aparecem/desaparecem conforme o tipo de serviço

#### Teste 4a: ERP Básico

**Passos**:

1. Selecione "ERP Básico" no Step 1
2. Avance até o Step 3

**Resultado Esperado**:

- Campos "Funcionalidades" e "Integrações" aparecem
- Campo "Referências" NÃO aparece

#### Teste 4b: Landing Page IA

**Passos**:

1. Selecione "Landing Page IA" no Step 1
2. Avance até o Step 3

**Resultado Esperado**:

- Campos "Referências" e "Funcionalidades" aparecem
- Campo "Integrações" NÃO aparece

#### Teste 4c: Landing IA + WhatsApp

**Passos**:

1. Selecione "Landing IA + WhatsApp" no Step 1
2. Avance até o Step 3

**Resultado Esperado**:

- Todos os campos (Referências, Funcionalidades, Integrações) aparecem

**Critério de Aprovação**: ✅ Passou | ❌ Falhou

---

### 5. Submissão Completa

**Objetivo**: Verificar se o briefing é criado corretamente no banco

**Passos**:

1. Preencha todo o formulário com dados válidos
2. Avance até o Step 4 (Revisão)
3. Verifique se o resumo está correto
4. Clique "Enviar Briefing"

**Resultado Esperado**:

- Toast "Briefing enviado com sucesso!"
- Redirecionamento para `/dashboard`
- Registro criado na tabela `briefings` do banco
- Rascunho removido da tabela `briefing_drafts`

**Verificação no Banco**:

```sql
-- Verificar briefing criado
SELECT * FROM briefings WHERE user_id = 'seu-user-id' ORDER BY created_at DESC LIMIT 1;

-- Verificar que rascunho foi removido
SELECT * FROM briefing_drafts WHERE user_id = 'seu-user-id';
```

**Critério de Aprovação**: ✅ Passou | ❌ Falhou

---

### 6. Expiração de Draft

**Objetivo**: Verificar que drafts expirados não são carregados

**Passos**:

1. Crie um rascunho (preencha e aguarde auto-save)
2. Acesse o banco de dados diretamente
3. Atualize o campo `expires_at` para uma data no passado:
   ```sql
   UPDATE briefing_drafts
   SET expires_at = NOW() - INTERVAL '1 day'
   WHERE user_id = 'seu-user-id';
   ```
4. Recarregue a página `/briefing`

**Resultado Esperado**:

- Nenhum toast de "Rascunho carregado"
- Formulário vazio (valores padrão)

**Critério de Aprovação**: ✅ Passou | ❌ Falhou

---

### 7. Múltiplos Drafts

**Objetivo**: Verificar que apenas 1 draft por usuário é mantido

**Passos**:

1. Acesse `/briefing`
2. Preencha "Nome da Empresa" com "Empresa A"
3. Aguarde auto-save
4. Altere "Nome da Empresa" para "Empresa B"
5. Aguarde auto-save novamente
6. Verifique no banco:
   ```sql
   SELECT COUNT(*) FROM briefing_drafts WHERE user_id = 'seu-user-id';
   ```

**Resultado Esperado**:

- Contagem = 1 (apenas um registro)
- Dados devem refletir "Empresa B" (último valor)

**Critério de Aprovação**: ✅ Passou | ❌ Falhou

---

### 8. Responsividade Mobile

**Objetivo**: Verificar a experiência em dispositivos móveis

**Passos**:

1. Abra o DevTools do navegador
2. Ative o modo responsivo (iPhone 12 Pro ou similar)
3. Acesse `/briefing`
4. Percorra todos os 4 steps

**Resultado Esperado**:

- Layout adapta-se à tela
- StepIndicator mostra apenas números (sem labels lado a lado)
- Cards de serviço empilham-se verticalmente
- Campos de formulário são facilmente tocáveis
- Botões de navegação são adequados para touch

**Critério de Aprovação**: ✅ Passou | ❌ Falhou

---

### 9. Validação de Campos

**Objetivo**: Verificar mensagens de erro em campos inválidos

**Passos**:

1. Step 2: Deixe "Nome da Empresa" vazio e tente avançar
2. Step 2: Digite apenas 1 caractere em "Ramo de Atividade"
3. Step 3: Digite menos de 10 caracteres em "Objetivos"

**Resultado Esperado**:

- Mensagens de erro apropriadas aparecem
- Cores de erro (vermelho) nos campos
- Não avança até correção

**Critério de Aprovação**: ✅ Passou | ❌ Falhou

---

### 10. Cancelamento e Retorno

**Objetivo**: Verificar navegação ao cancelar o formulário

**Passos**:

1. Preencha parcialmente o formulário
2. Clique em "Voltar" até retornar ao Dashboard
3. Acesse `/briefing` novamente

**Resultado Esperado**:

- Rascunho foi salvo (auto-save)
- Dados anteriores estão presentes

**Critério de Aprovação**: ✅ Passou | ❌ Falhou

---

## Checklist de Testes

| #   | Cenário                  | Status | Responsável | Data |
| --- | ------------------------ | ------ | ----------- | ---- |
| 1   | Auto-save                | ⬜     |             |      |
| 2   | Carregamento de rascunho | ⬜     |             |      |
| 3   | Validação progressiva    | ⬜     |             |      |
| 4   | Campos condicionais      | ⬜     |             |      |
| 5   | Submissão completa       | ⬜     |             |      |
| 6   | Expiração de draft       | ⬜     |             |      |
| 7   | Múltiplos drafts         | ⬜     |             |      |
| 8   | Responsividade mobile    | ⬜     |             |      |
| 9   | Validação de campos      | ⬜     |             |      |
| 10  | Cancelamento e retorno   | ⬜     |             |      |

**Legenda**: ⬜ Pendente | ✅ Aprovado | ❌ Reprovado

---

## Notas para QA

1. **Ambiente de Teste**: Usar banco de dados de staging
2. **Dados de Teste**: Utilizar emails fictícios (@example.com)
3. **Limpeza**: Após testes, limpar dados de teste do banco
4. **Navegadores**: Testar em Chrome, Firefox, Safari e Edge
5. **Dispositivos**: Testar em desktop (1920x1080) e mobile (390x844)
