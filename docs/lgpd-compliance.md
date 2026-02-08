# LGPD Compliance - 28Web Connect

Este documento descreve as implementações de conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) na plataforma 28Web Connect.

## Índice

1. [Visão Geral](#visão-geral)
2. [Direitos do Titular Implementados](#direitos-do-titular-implementados)
3. [Fluxo de Solicitações](#fluxo-de-solicitações)
4. [Prazos de Resposta](#prazos-de-resposta)
5. [Políticas de Retenção](#políticas-de-retenção)
6. [Contato do DPO](#contato-do-dpo)
7. [Instruções para Usuários](#instruções-para-usuários)
8. [Segurança dos Dados](#segurança-dos-dados)
9. [Cookies e Rastreamento](#cookies-e-rastreamento)
10. [Alterações neste Documento](#alterações-neste-documento)

---

## Visão Geral

A 28Web Connect está comprometida com a proteção de dados pessoais de seus usuários, em conformidade com a LGPD. Implementamos mecanismos técnicos e organizacionais para garantir:

- **Transparência**: Informações claras sobre como os dados são coletados e usados
- **Controle**: Ferramentas para que usuários gerenciem seus dados
- **Segurança**: Proteção contra acesso não autorizado e vazamentos
- **Direitos**: Canais para exercer os direitos previstos na LGPD

---

## Direitos do Titular Implementados

### 1. Acesso (Art. 18, II)

Os usuários podem acessar todos os seus dados pessoais armazenados na plataforma.

**Como exercer:**

- Acesse: Configurações → Privacidade → Solicitações LGPD
- Selecione: "Acesso aos Dados"
- Descreva sua solicitação
- Envie para o DPO

**Resposta:** Em até 15 dias úteis

### 2. Portabilidade (Art. 18, V)

Os usuários podem baixar seus dados em formato JSON estruturado.

**Como exercer:**

- Acesse: Configurações → Privacidade → Download de Dados
- Clique: "Baixar Meus Dados (JSON)"
- O arquivo inclui: perfil, briefings, projetos, arquivos, comentários, notificações

**Formato:** JSON estruturado, legível por máquina

### 3. Retificação (Art. 18, III)

Os usuários podem corrigir dados incorretos ou desatualizados.

**Como exercer:**

- Acesse: Configurações → Perfil
- Edite: nome, email, telefone, empresa
- Salve as alterações

**Ou via DPO:**

- Acesse: Configurações → Privacidade → Solicitações LGPD
- Selecione: "Retificação de Dados"
- Descreva as correções necessárias

### 4. Eliminação/Exclusão (Art. 18, VI)

Os usuários podem solicitar a exclusão permanente de sua conta e dados.

**Como exercer:**

- Acesse: Configurações → Privacidade → Exclusão de Conta
- Leia as informações sobre perda de dados
- Digite: "EXCLUIR CONTA" para confirmar
- Informe sua senha atual
- Confirme a exclusão

**Consequências:**

- Todos os dados são permanentemente removidos
- Briefings, projetos e arquivos são excluídos
- Ação não pode ser desfeita

### 5. Oposição (Art. 18, IX)

Os usuários podem se opor ao tratamento de seus dados para fins específicos.

**Como exercer:**

- Acesse: Configurações → Privacidade → Solicitações LGPD
- Selecione: "Oposição ao Tratamento"
- Descreva os dados e finalidades que se opõe

**Ou para marketing:**

- Acesse: Configurações → Privacidade → Consentimento de Marketing
- Clique: "Revogar" para parar de receber comunicações promocionais

### 6. Revogação de Consentimento

Os usuários podem revogar consentimentos dados anteriormente.

**Marketing:**

- Acesse: Configurações → Privacidade → Consentimento de Marketing
- Clique: "Revogar Consentimento"
- Você continuará recebendo emails transacionais (sobre sua conta)

---

## Fluxo de Solicitações

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Usuário   │────▶│   Sistema    │────▶│     DPO     │
│  Solicita   │     │   Valida     │     │  Analisa    │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                      │
                           ▼                      ▼
                    ┌──────────────┐     ┌─────────────┐
                   │   Cria       │     │  Responde   │
                    │Notificação   │     │  em 15 dias │
                    └──────────────┘     └─────────────┘
```

1. **Solicitação**: Usuário preenche formulário em Configurações → Privacidade
2. **Validação**: Sistema valida dados e cria notificação in-app
3. **Envio**: Email enviado ao DPO com todas as informações
4. **Confirmação**: Usuário recebe notificação de recebimento
5. **Análise**: DPO analisa e responde em até 15 dias úteis

---

## Prazos de Resposta

Conforme Art. 19, §1º da LGPD:

| Tipo de Solicitação        | Prazo         | Formato               |
| -------------------------- | ------------- | --------------------- |
| Acesso                     | 15 dias úteis | Resposta escrita      |
| Portabilidade              | Imediato      | Download JSON         |
| Retificação                | 15 dias úteis | Confirmação por email |
| Exclusão                   | Imediato      | Confirmação + logout  |
| Oposição                   | 15 dias úteis | Resposta escrita      |
| Revogação de Consentimento | Imediato      | Confirmação por email |

**Nota:** O prazo de 15 dias pode ser prorrogado por mais 15 dias em casos complexos, com comunicação prévia ao titular.

---

## Políticas de Retenção

### Dados Ativos

| Tipo de Dado   | Período de Retenção | Justificativa           |
| -------------- | ------------------- | ----------------------- |
| Dados de conta | Enquanto ativa      | Execução do contrato    |
| Briefings      | 5 anos após término | Obrigação legal (Civil) |
| Projetos       | 5 anos após término | Obrigação legal (Civil) |
| Arquivos       | 5 anos após término | Obrigação legal (Civil) |
| Logs de acesso | 12 meses            | Segurança e auditoria   |
| Notificações   | 24 meses            | Histórico do usuário    |

### Dados Excluídos

- Quando o usuário solicita exclusão da conta
- Quando o contrato é rescindido e o prazo legal expira
- Quando não há mais base legal para retenção

### Backup

- Backups são mantidos por 30 dias
- Dados excluídos são removidos dos backups após o ciclo de retenção

### Retenção Automatizada

A plataforma implementa políticas automatizadas de retenção de dados:

#### Usuários Inativos

**11 meses sem login:**

- Sistema envia email de aviso automático
- Usuário tem ~30 dias para fazer login e evitar exclusão
- Email inclui link direto para login

**12 meses sem login:**

- Conta e todos os dados são permanentemente excluídos
- Exclusão registrada em log de auditoria
- Processo irreversível

**Exceções:**

- Usuários marcados com `doNotDelete = true` (decisão administrativa)
- Dados contratuais/financeiros (mantidos por 5 anos)

#### Briefings Não Convertidos

**2 anos após criação:**

- Briefings sem projeto associado são anonimizados
- Dados pessoais removidos: nome da empresa, objetivos, features
- Dados estatísticos preservados: tipo de serviço, status, data

#### Execução

- **Frequência**: Diária às 03:00 AM
- **Método**: Cron job automatizado
- **Logs**: Todas as ações são registradas
- **Monitoramento**: Alertas em caso de falhas

#### Como Evitar Exclusão Automática

1. Faça login regularmente (pelo menos uma vez por ano)
2. Mantenha seu email atualizado para receber avisos
3. Responda ao email de aviso de inatividade
4. Contate o DPO se precisar de exceção especial

Para mais detalhes técnicos, consulte: `docs/cron-jobs.md`

---

## Contato do DPO

**Data Protection Officer (DPO)**

- **Email:** dpo@28webconnect.com
- **Empresa:** 28Web Connect
- **CNPJ:** [Inserir CNPJ]
- **Endereço:** [Inserir endereço]

### Quando Contatar o DPO

- Para exercer direitos LGPD
- Para questões sobre proteção de dados
- Para reportar incidentes de segurança
- Para solicitar esclarecimentos sobre políticas

---

## Instruções para Usuários

### Primeiro Acesso

1. Verifique seus dados em Configurações → Perfil
2. Configure suas preferências em Configurações → Notificações
3. Revise políticas de privacidade

### Manutenção Regular

1. **Mensal:** Verifique preferências de notificações
2. **Semestral:** Atualize dados de contato
3. **Anual:** Baixe seus dados (backup pessoal)

### Em Caso de Problemas

1. Tente resolver em Configurações → Privacidade
2. Se não resolver, contate: dpo@28webconnect.com
3. Se insatisfeito, contate a ANPD: https://www.gov.br/anpd

---

## Segurança dos Dados

### Medidas Técnicas

- **Criptografia:** TLS 1.3 para transmissão
- **Hashing:** bcrypt para senhas
- **Validação:** Zod para todos os inputs
- **Autenticação:** NextAuth.js v5 com verificação de email

### Medidas Organizacionais

- Acesso limitado a funcionários autorizados
- Treinamento em proteção de dados
- Políticas de segurança da informação
- Logs de auditoria

### Incidentes

Em caso de incidente de segurança:

1. Notificação à ANPD em até 72 horas (quando aplicável)
2. Comunicação aos usuários afetados
3. Medidas corretivas imediatas

---

## Cookies e Rastreamento

### Cookies Necessários

| Cookie                  | Finalidade         | Duração |
| ----------------------- | ------------------ | ------- |
| session                 | Autenticação       | Sessão  |
| next-auth.session-token | Sessão autenticada | 30 dias |
| next-auth.csrf-token    | Segurança          | Sessão  |

### Cookies de Preferências

| Cookie        | Finalidade                   | Duração |
| ------------- | ---------------------------- | ------- |
| theme         | Tema escuro/claro            | 1 ano   |
| notifications | Preferências de notificações | 1 ano   |

### Cookies de Terceiros

- **Analytics:** Umami (self-hosted, privacy-friendly)
- **Não usamos:** Google Analytics, Facebook Pixel, etc.

---

## Alterações neste Documento

Última atualização: 04 de Fevereiro de 2026

### Histórico de Alterações

| Data       | Alteração         | Versão |
| ---------- | ----------------- | ------ |
| 2026-02-04 | Documento inicial | 1.0.0  |

### Notificação de Alterações

- Alterações serão comunicadas por email
- Notificação in-app 30 dias antes
- Aceitação tácita após o período de notificação

---

## Referências Legais

- **LGPD:** Lei nº 13.709, de 14 de agosto de 2018
- **Decreto:** Decreto nº 7.724, de 16 de maio de 2012
- **ANPD:** Autoridade Nacional de Proteção de Dados
- **GDPR:** Regulamento (UE) 2016/679 (referência)

## Links Úteis

- [ANPD](https://www.gov.br/anpd)
- [LGPD Completa](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Configurações da Conta](https://28webconnect.com/configuracoes)
- [Política de Privacidade](https://28webconnect.com/politica-privacidade)
- [Termos de Uso](https://28webconnect.com/termos-uso)

---

**28Web Connect** - Protegendo seus dados, impulsionando seu negócio.
