# Contributing to 28Web Connect

Thank you for your interest in contributing to 28Web Connect! This document provides guidelines and workflows for contributing.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Branch Naming](#branch-naming)
- [Issue Reporting](#issue-reporting)
- [Security](#security)

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/28web-connect.git
cd 28web-connect

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Setup database
npx prisma migrate dev
npx prisma db seed

# 5. Run development server
npm run dev
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write clean, maintainable code
- Follow existing code patterns
- Add/update tests as needed
- Update documentation

### 3. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npx vitest run app/actions/__tests__/auth.test.ts
```

### 4. Run Linter

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### 5. Type Check

```bash
npm run type-check
```

### 6. Commit

```bash
git add .
git commit -m "feat: add new feature"
```

---

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Enable strict mode
- Prefer `const` over `let`
- Use async/await over promises

### Naming Conventions

| Type               | Convention       | Example         |
| ------------------ | ---------------- | --------------- |
| Variables          | camelCase        | `userName`      |
| Constants          | UPPER_SNAKE_CASE | `API_BASE_URL`  |
| Functions          | camelCase        | `getUserById`   |
| Components         | PascalCase       | `UserProfile`   |
| Interfaces         | PascalCase       | `UserData`      |
| Types              | PascalCase       | `UserRole`      |
| Files (components) | PascalCase       | `UserCard.tsx`  |
| Files (utils)      | camelCase        | `formatDate.ts` |

### React Components

```typescript
// Good
interface UserCardProps {
  name: string;
  email: string;
}

export function UserCard({ name, email }: UserCardProps) {
  return (
    <div className="p-4">
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}

// Bad - no types, inconsistent naming
export function usercard(props) {
  return <div>{props.Name}</div>
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Group related classes
- Extract components for repeated patterns

```tsx
// Good
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Submit</button>
```

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description             |
| ---------- | ----------------------- |
| `feat`     | New feature             |
| `fix`      | Bug fix                 |
| `docs`     | Documentation changes   |
| `style`    | Code style (formatting) |
| `refactor` | Code refactoring        |
| `test`     | Adding/updating tests   |
| `chore`    | Maintenance tasks       |

### Examples

```bash
feat(auth): add password reset flow
fix(api): handle null response in user query
docs(readme): update installation instructions
style(components): format with prettier
refactor(utils): simplify date formatting
test(auth): add unit tests for login
chore(deps): update next-auth to v5
```

---

## Testing

### Requirements

- All new features must have tests
- Maintain >80% coverage on business logic
- Test critical paths thoroughly

### Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('functionName', () => {
    it('should do X when Y', async () => {
      // Arrange
      const input = { ... };

      // Act
      const result = await functionName(input);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
```

### Testing Guidelines

- Use descriptive test names
- One assertion per test (when possible)
- Mock external dependencies
- Test edge cases and error scenarios

---

## Pull Request Process

### 1. Before Creating PR

- [ ] All tests pass
- [ ] Code is linted and formatted
- [ ] Type checking passes
- [ ] Documentation updated
- [ ] JSDoc comments added

### 2. Create PR

```bash
git push origin feature/your-feature
```

Then create PR on GitHub with:

- Clear title following commit conventions
- Description of changes
- Link to related issues
- Screenshots (if UI changes)

### 3. PR Review

- Request review from maintainers
- Address feedback promptly
- Keep discussion focused

### 4. Merge

- Squash merge recommended
- Delete branch after merge

---

## Branch Naming

| Prefix      | Purpose          | Example                      |
| ----------- | ---------------- | ---------------------------- |
| `feature/`  | New features     | `feature/briefing-autosave`  |
| `fix/`      | Bug fixes        | `fix/login-redirect`         |
| `docs/`     | Documentation    | `docs/api-examples`          |
| `refactor/` | Code refactoring | `refactor/project-structure` |
| `test/`     | Test additions   | `test/auth-coverage`         |
| `hotfix/`   | Critical fixes   | `hotfix/security-patch`      |

---

## Issue Reporting

### Bug Reports

Include:

- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, version)

### Feature Requests

Include:

- Clear use case
- Proposed solution
- Alternatives considered

---

## Security

### Reporting Vulnerabilities

- Email: security@28webconnect.com
- Do NOT create public issues
- Include detailed description
- Allow time for fix before disclosure

### Security Guidelines

- Never commit secrets or credentials
- Use environment variables for sensitive data
- Validate all inputs
- Use parameterized queries (Prisma)
- Keep dependencies updated

---

## Code Review Checklist

### For Authors

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] JSDoc comments added
- [ ] No console.log statements
- [ ] No hardcoded values
- [ ] Error handling implemented

### For Reviewers

- [ ] Code follows style guide
- [ ] Tests cover new functionality
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Documentation is clear

---

## Questions?

Contact the team:

- Email: dev@28webconnect.com
- Slack: #dev-channel

Thank you for contributing! 🚀
