# Guia de Testes

Guia completo para execução e desenvolvimento de testes na plataforma 28Web Connect.

## Sumário

- [Visão Geral](#visão-geral)
- [Executando Testes](#executando-testes)
- [Estrutura de Testes](#estrutura-de-testes)
- [Escrevendo Testes](#escrevendo-testes)
- [Mocks e Fixtures](#mocks-e-fixtures)
- [Debugging](#debugging)
- [Cobertura de Código](#cobertura-de-código)
- [Boas Práticas](#boas-práticas)

## Visão Geral

A plataforma utiliza **Vitest** como framework de testes, configurado com:

- Ambiente `jsdom` para testes de frontend
- Suporte a TypeScript nativo
- Mocking automático de dependências
- Cobertura de código integrada

### Dependências de Teste

```bash
# Instalar dependências (já incluídas no package.json)
npm install

# Dependências principais:
# - vitest: Framework de testes
# - @vitejs/plugin-react: Plugin React para Vitest
# - jsdom: Ambiente DOM para testes
```

## Executando Testes

### Comandos Disponíveis

```bash
# Executar todos os testes
npm test

# Executar em modo watch (re-executa ao salvar arquivos)
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage

# Executar testes específicos
npx vitest run app/actions/__tests__/auth.test.ts

# Executar com filtro de nome
npx vitest run -t "should register user"

# Modo debug (executa uma vez e mostra logs)
npx vitest run --reporter=verbose
```

### Opções de Linha de Comando

```bash
# Executar apenas testes que falharam na última execução
npx vitest run --changed

# Executar com padrão específico
npx vitest run app/actions

# Executar em modo sequencial (sem paralelismo)
npx vitest run --pool=forks

# Mostrar logs de console
npx vitest run --reporter=verbose --no-color
```

## Estrutura de Testes

### Organização de Arquivos

```
app/
├── actions/
│   ├── auth.ts
│   └── __tests__/
│       ├── auth.test.ts              # Testes unitários
│       └── auth.integration.test.ts  # Testes de integração
├── api/
│   └── __tests__/
│       └── upload.test.ts
lib/
├── __tests__/
│   ├── embeddings.test.ts
│   ├── notifications.test.ts
│   └── file-upload.test.ts
├── validations/
│   └── __tests__/
│       └── file-upload.test.ts
components/
└── __tests__/
    └── button.test.tsx
```

### Convenções de Nomenclatura

- **Arquivos de teste**: `*.test.ts` ou `*.test.tsx`
- **Arquivos de integração**: `*.integration.test.ts`
- **Fixtures**: `test-fixtures.ts`
- **Utils**: `test-utils.ts`

## Escrevendo Testes

### Estrutura Básica

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { myFunction } from './my-module';

describe('MyModule', () => {
  // Limpar mocks antes de cada teste
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('myFunction', () => {
    it('should return correct result for valid input', async () => {
      // Arrange
      const input = { name: 'Test' };

      // Act
      const result = await myFunction(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: '123', name: 'Test' });
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const input = null;

      // Act
      const result = await myFunction(input);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
```

### Testes de Server Actions

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, loginUser } from '../auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createMockUser, createMockSession } from '@/lib/test-utils';

describe('Auth Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'SenhaSegura123!',
        company: 'Empresa Teste',
        phone: '(11) 99999-9999',
        marketingConsent: true,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(
        createMockUser({
          email: userData.email,
          name: userData.name,
        })
      );

      // Act
      const result = await registerUser(userData);

      // Assert
      expect(result.success).toBe(true);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: userData.email,
            name: userData.name,
          }),
        })
      );
    });

    it('should return error for duplicate email', async () => {
      // Arrange
      const existingUser = createMockUser({ email: 'joao@example.com' });
      vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

      // Act
      const result = await registerUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'SenhaSegura123!',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('já está cadastrado');
    });
  });
});
```

### Testes de Integração

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, loginUser, sendPasswordReset, resetPassword } from '../auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

describe('Auth Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full registration → login flow', async () => {
    // 1. Register
    const registerResult = await registerUser({
      name: 'João Silva',
      email: 'joao@example.com',
      password: 'SenhaSegura123!',
    });
    expect(registerResult.success).toBe(true);

    // 2. Verify email was sent
    expect(sendEmail).toHaveBeenCalled();

    // 3. Login
    const loginResult = await loginUser({
      email: 'joao@example.com',
      password: 'SenhaSegura123!',
    });
    expect(loginResult.success).toBe(true);
  });
});
```

## Mocks e Fixtures

### Usando Fixtures

```typescript
import { describe, it, expect } from 'vitest';
import { createMockUser, createMockBriefing } from '@/lib/test-utils';
import { clientUserFixture, erpBasicoBriefingFixture } from '@/lib/test-fixtures';

describe('With Fixtures', () => {
  it('should use fixture data', () => {
    const user = createMockUser(clientUserFixture);
    const briefing = createMockBriefing(erpBasicoBriefingFixture);

    expect(user.role).toBe('CLIENTE');
    expect(briefing.serviceType).toBe('ERP_BASICO');
  });
});
```

### Criando Mocks Manuais

```typescript
import { describe, it, expect, vi } from 'vitest';

// Mock de função
const mockFn = vi.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue({ success: true }); // Para funções async

// Mock de módulo
vi.mock('@/lib/external-service', () => ({
  externalFunction: vi.fn(() => Promise.resolve({ data: [] })),
}));

// Mock com implementação dinâmica
vi.mocked(prisma.user.findUnique).mockImplementation((args) => {
  if (args.where.email === 'test@example.com') {
    return Promise.resolve(createMockUser());
  }
  return Promise.resolve(null);
});
```

## Debugging

### Usando console.log

```typescript
it('should debug test', async () => {
  const result = await myFunction();

  console.log('Result:', JSON.stringify(result, null, 2));

  expect(result.success).toBe(true);
});
```

### Usando o Modo Debug do Vitest

```bash
# Executar com Node debugger
node --inspect-brk node_modules/vitest/vitest.mjs --run

# Ou usar o VS Code launch configuration
```

### Configuração do VS Code

Crie `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test File",
      "autoAttachChildProcesses": true,
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "${relativeFile}"],
      "smartStep": true,
      "console": "integratedTerminal"
    }
  ]
}
```

### Inspecionando Mocks

```typescript
it('should verify mock calls', async () => {
  await myFunction('arg1', 'arg2');

  // Verificar se foi chamado
  expect(mockFn).toHaveBeenCalled();

  // Verificar número de chamadas
  expect(mockFn).toHaveBeenCalledTimes(1);

  // Verificar argumentos
  expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

  // Verificar chamada específica
  expect(mockFn).toHaveBeenNthCalledWith(1, 'arg1', 'arg2');

  // Inspecionar todas as chamadas
  console.log(mockFn.mock.calls);
  console.log(mockFn.mock.results);
});
```

## Cobertura de Código

### Gerando Relatórios

```bash
# Gerar relatório HTML
npm run test:coverage

# Abrir relatório
open coverage/index.html
```

### Interpretando Resultados

O relatório de cobertura mostra:

- **Statements**: Linhas de código executadas
- **Branches**: Caminhos condicionais cobertos
- **Functions**: Funções chamadas
- **Lines**: Linhas de código cobertas

### Metas de Cobertura

- **Lógica de Negócio**: >80%
- **Server Actions**: >80%
- **Utilitários**: >70%
- **Componentes**: >60%

## Boas Práticas

### 1. Arrange-Act-Assert

```typescript
it('should follow AAA pattern', async () => {
  // Arrange
  const input = { value: 10 };
  const expected = { result: 20 };

  // Act
  const actual = await doubleValue(input);

  // Assert
  expect(actual).toEqual(expected);
});
```

### 2. Um Conceito por Teste

```typescript
// ❌ Ruim: múltiplos conceitos
it('should handle all cases', async () => {
  // Testa sucesso, erro, validação...
});

// ✅ Bom: conceitos separados
it('should succeed with valid input', async () => {});
it('should fail with invalid input', async () => {});
it('should handle edge cases', async () => {});
```

### 3. Nomes Descritivos

```typescript
// ❌ Ruim
it('works', () => {});

// ✅ Bom
it('should send notification email when briefing is approved', () => {});
```

### 4. Evite Dependências entre Testes

```typescript
// ❌ Ruim
let sharedValue: string;

beforeEach(() => {
  sharedValue = 'initial';
});

it('modifies shared value', () => {
  sharedValue = 'modified';
});

it('depends on previous test', () => {
  // Falha se o teste anterior não rodar
  expect(sharedValue).toBe('modified');
});

// ✅ Bom
describe('Feature A', () => {
  it('should do X', () => {
    const value = setupForX();
    // test X
  });
});

describe('Feature B', () => {
  it('should do Y', () => {
    const value = setupForY();
    // test Y
  });
});
```

### 5. Use beforeEach para Setup

```typescript
describe('Database Operations', () => {
  beforeEach(async () => {
    // Reset database state
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create user', async () => {
    // Test with clean state
  });
});
```

### 6. Teste Comportamentos, Não Implementações

```typescript
// ❌ Ruim: testa implementação interna
it('should call prisma.user.create with correct args', () => {
  registerUser(data);
  expect(prisma.user.create).toHaveBeenCalledWith({ ... });
});

// ✅ Bom: testa comportamento visível
it('should create new user account', async () => {
  const result = await registerUser(data);
  expect(result.success).toBe(true);
  expect(result.message).toContain('criada');
});
```

### 7. Tratamento de Erros

```typescript
it('should handle network errors', async () => {
  vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

  const result = await fetchData();

  expect(result.success).toBe(false);
  expect(result.error).toContain('Network error');
});

it('should handle timeout', async () => {
  vi.useFakeTimers();

  const promise = fetchData();
  vi.advanceTimersByTime(5000);

  const result = await promise;
  expect(result.error).toContain('timeout');

  vi.useRealTimers();
});
```

## Troubleshooting

### Problemas Comuns

#### "Cannot find module"

```bash
# Limpar cache do Vitest
npx vitest run --clearCache

# Verificar tsconfig.json paths
```

#### Mocks não funcionando

```typescript
// Certifique-se de usar vi.mock no topo do arquivo
vi.mock('@/lib/module', () => ({ ... }));

// Use vi.mocked para type safety
vi.mocked(prisma.user.findUnique).mockResolvedValue(...);
```

#### Testes flaky (intermitentes)

```typescript
// Use beforeEach para resetar estado
beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

// Evite timers reais
vi.useFakeTimers();

// Reset após testes
afterEach(() => {
  vi.useRealTimers();
});
```

#### Timeout em testes async

```typescript
// Aumentar timeout para teste específico
it('slow test', async () => {
  // ...
}, 10000); // 10 segundos

// Ou configurar globalmente no vitest.config.ts
```

## Recursos Adicionais

- [Documentação Vitest](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Testing Library](https://testing-library.com/)
- [Jest Matchers](https://jestjs.io/docs/expect) (compatíveis com Vitest)
