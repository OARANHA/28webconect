# Testing Strategy

Comprehensive testing approach for the 28Web Connect platform.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Test Structure](#test-structure)
- [Mocking Strategy](#mocking-strategy)
- [Test Data](#test-data)
- [Coverage Goals](#coverage-goals)
- [Running Tests](#running-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

---

## Testing Philosophy

> "Test critical business logic, integration points, and user flows; avoid testing framework internals."

Our testing approach focuses on:

- **Business value**: Tests that verify features deliver value to users
- **Maintainability**: Tests that are easy to understand and update
- **Confidence**: Tests that give confidence to deploy frequently
- **Speed**: Fast feedback loops for developers

What we don't test:

- Framework internals (Next.js, React)
- Third-party libraries (assumed tested)
- Trivial code (getters/setters)

---

## Test Types

### Unit Tests

Test individual functions in isolation.

**Location:** `**/__tests__/*.test.ts`

**Characteristics:**

- Fast execution (< 100ms per test)
- No external dependencies (all mocked)
- Single concept per test
- Descriptive test names

**Example:**

```typescript
describe('validatePassword', () => {
  it('should reject passwords shorter than 8 characters', () => {
    const result = validatePassword('12345');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('8 caracteres');
  });
});
```

### Integration Tests

Test multi-step workflows with database interactions.

**Location:** `**/__tests__/*.integration.test.ts`

**Characteristics:**

- Test complete user flows
- Real database operations (mocked Prisma)
- Multiple actions per test
- Verify side effects (notifications, emails)

**Example:**

```typescript
describe('Registration Flow', () => {
  it('should complete full registration → verification → login', async () => {
    // 1. Register
    const registerResult = await registerUser(userData);
    expect(registerResult.success).toBe(true);

    // 2. Verify email
    const verifyResult = await verifyEmail(token);
    expect(verifyResult.success).toBe(true);

    // 3. Login
    const loginResult = await loginUser(credentials);
    expect(loginResult.success).toBe(true);
  });
});
```

### E2E Tests (Future)

Full user journeys with Playwright.

**Planned:**

- User registration flow
- Briefing submission
- Project management
- Admin workflows

---

## Test Structure

### Arrange-Act-Assert Pattern

```typescript
it('should update project status', async () => {
  // Arrange
  const projectId = 'proj-123';
  const newStatus = ProjectStatus.EM_ANDAMENTO;
  vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject);

  // Act
  const result = await updateProjectStatus(projectId, newStatus);

  // Assert
  expect(result.success).toBe(true);
  expect(prisma.project.update).toHaveBeenCalledWith(
    expect.objectContaining({ data: { status: newStatus } })
  );
});
```

### Test Organization

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
  });

  describe('functionName', () => {
    it('should succeed with valid input', async () => {});
    it('should fail with invalid input', async () => {});
    it('should handle edge case X', async () => {});
  });
});
```

---

## Mocking Strategy

### External Services

Always mock external services:

```typescript
// Email service
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(() => Promise.resolve({ success: true })),
}));

// AI services
vi.mock('@mistralai/mistralai', () => ({
  Mistral: vi.fn(() => ({
    embeddings: { create: vi.fn(() => Promise.resolve({ data: [...] })) },
  })),
}));

// File system
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}));
```

### Database

Mock Prisma for unit tests:

```typescript
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    project: { findMany: vi.fn(), update: vi.fn() },
  },
}));
```

---

## Test Data

### Fixtures

Use fixtures for consistent test data:

```typescript
import { createMockUser, createMockProject } from '@/lib/test-utils';
import { clientUserFixture } from '@/lib/test-fixtures';

const user = createMockUser(clientUserFixture);
const project = createMockProject({ status: ProjectStatus.EM_ANDAMENTO });
```

### Fixture Files

- `lib/test-utils.ts` - Mock object creators
- `lib/test-fixtures.ts` - Reusable test data

---

## Coverage Goals

| Category                      | Target | Priority |
| ----------------------------- | ------ | -------- |
| Business Logic (app/actions)  | >80%   | High     |
| Utilities (lib/)              | >70%   | High     |
| Validations (lib/validations) | >90%   | High     |
| Components                    | >60%   | Medium   |
| API Routes                    | >70%   | Medium   |

### Critical Paths (100% Coverage)

- Authentication flows
- Payment processing (if added)
- Data retention policies
- File upload security

---

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific file
npx vitest run app/actions/__tests__/auth.test.ts

# Run with pattern
npx vitest run -t "should register"
```

### Coverage Report

```bash
npm run test:coverage
# Opens coverage/index.html
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

### Pre-commit Hooks

Tests run automatically on commit via Husky:

```bash
# .husky/pre-commit
npm run lint
npm run test:run
```

---

## Best Practices

### Do

- ✅ Write tests before fixing bugs
- ✅ Use descriptive test names
- ✅ Test edge cases and errors
- ✅ Keep tests fast and isolated
- ✅ Use fixtures for test data
- ✅ Clean up after tests

### Don't

- ❌ Test implementation details
- ❌ Write tests that depend on order
- ❌ Ignore failing tests
- ❌ Write tests without assertions
- ❌ Share state between tests
- ❌ Mock what you don't own (without care)

### Anti-Patterns

```typescript
// ❌ Brittle test - tests implementation
test('should call prisma.user.create with correct args', () => {
  registerUser(data);
  expect(prisma.user.create).toHaveBeenCalledWith({...});
});

// ✅ Better - tests behavior
test('should create new user account', async () => {
  const result = await registerUser(data);
  expect(result.success).toBe(true);
  expect(result.message).toContain('criada');
});
```

---

## Current Coverage Summary

| Module          | Statements | Branches | Functions | Lines   |
| --------------- | ---------- | -------- | --------- | ------- |
| app/actions     | 75%        | 68%      | 82%       | 74%     |
| lib/utils       | 82%        | 71%      | 85%       | 80%     |
| lib/validations | 91%        | 88%      | 95%       | 90%     |
| **Total**       | **78%**    | **72%**  | **84%**   | **77%** |

_Last updated: 2024-XX-XX_

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
