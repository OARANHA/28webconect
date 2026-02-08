# Security Documentation

Security practices and policies for the 28Web Connect platform.

## Table of Contents

- [Authentication Security](#authentication-security)
- [Authorization](#authorization)
- [Data Protection](#data-protection)
- [File Upload Security](#file-upload-security)
- [API Security](#api-security)
- [LGPD Compliance](#lgpd-compliance)
- [Vulnerability Reporting](#vulnerability-reporting)
- [Security Checklist](#security-checklist)
- [Incident Response](#incident-response)

---

## Authentication Security

### Password Hashing

- **Algorithm:** bcryptjs
- **Rounds:** 12 (configurable in `lib/auth-utils.ts`)
- **Minimum Length:** 8 characters

```typescript
// Implementation
const saltRounds = 12;
return bcrypt.hash(password, saltRounds);
```

### Email Verification

Required before dashboard access:

- Token expires after 24 hours
- Single-use tokens
- Secure random generation with `crypto.randomUUID()`

### Session Management

- **Library:** NextAuth.js v5
- **Storage:** Database sessions (Prisma Adapter)
- **CSRF Protection:** Enabled by default
- **Secure Cookies:** HttpOnly, Secure, SameSite

### Session Configuration

```typescript
// Secure session settings
session: {
  strategy: 'database',
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 24 hours
}
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true
    }
  }
}
```

---

## Authorization

### Role-Based Access Control (RBAC)

| Role          | Permissions                             |
| ------------- | --------------------------------------- |
| `CLIENTE`     | Own projects, briefings, files          |
| `ADMIN`       | Manage all projects, briefings, clients |
| `SUPER_ADMIN` | Full system access including CMS        |

### Middleware Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await auth();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAdmin(session)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
}
```

### Server-Side Checks

Always verify permissions in Server Actions:

```typescript
export async function sensitiveAction() {
  const session = await requireAuth();

  if (session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  // Proceed with action
}
```

---

## Data Protection

### HTTPS Only

Production requirements:

- TLS 1.3 enforced
- HSTS headers
- Automatic redirect HTTP → HTTPS

### Environment Variables

**Never commit secrets:**

```bash
# .env.example (safe to commit)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-here"

# .env.local (gitignored)
DATABASE_URL="postgresql://real-credentials"
NEXTAUTH_SECRET="real-secret"
```

### Input Validation

All inputs validated with Zod:

```typescript
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### SQL Injection Prevention

Prisma ORM provides parameterized queries automatically.

**Safe:**

```typescript
await prisma.user.findUnique({
  where: { email: userInput }, // Parameterized
});
```

**Never do:**

```typescript
await prisma.$queryRaw(`SELECT * FROM users WHERE email = '${userInput}'`);
```

### XSS Prevention

- React auto-escapes content
- CSP headers configured
- Sanitize user-generated HTML (if applicable)

---

## File Upload Security

### Validation Layers

1. **Client-side:** File type, size preview
2. **Server-side:** MIME type, magic bytes
3. **Storage:** Outside public directory

### Security Measures

```typescript
// 1. Validate MIME type
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

// 2. Check file size
const maxSize = 100 * 1024 * 1024; // 100MB

// 3. Sanitize filename
const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

// 4. Store outside public directory
const uploadDir = process.cwd() + '/uploads'; // Not in /public
```

### Filename Sanitization

```typescript
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  return filename
    .replace(/\.{2,}/g, '.') // Remove ..
    .replace(/[\/\\]/g, '_') // Remove path separators
    .replace(/[^\w.-]/g, '_'); // Keep only safe chars
}
```

---

## API Security

### Rate Limiting

Recommended implementation (future):

```typescript
// Using Redis or similar
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function apiHandler(req) {
  try {
    await limiter.check(10, req.ip); // 10 requests per minute
  } catch {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
}
```

### CORS Configuration

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  res.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL);
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return res;
}
```

### Cron Job Authentication

```typescript
// API route protection
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Proceed with cron job
}
```

---

## LGPD Compliance

See detailed documentation: [docs/lgpd-compliance.md](./lgpd-compliance.md)

### Key Points

- Data retention policies implemented
- User right to deletion (with 12-month grace period)
- Data portability (export functionality)
- Anonymization of old data
- Consent tracking

---

## Vulnerability Reporting

### Responsible Disclosure

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. Email: security@28webconnect.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

| Phase              | Timeline           |
| ------------------ | ------------------ |
| Acknowledgment     | Within 48 hours    |
| Initial assessment | Within 1 week      |
| Fix deployment     | Within 30 days     |
| Public disclosure  | After fix deployed |

### Rewards

We may offer recognition or rewards for responsible disclosures.

---

## Security Checklist

### Pre-Deployment Review

- [ ] All secrets in environment variables (not code)
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Authorization checks on sensitive actions
- [ ] File upload restrictions configured
- [ ] Database migrations tested
- [ ] Error messages don't leak sensitive info
- [ ] Logging configured (no sensitive data)

### Regular Reviews

- [ ] Dependency updates (npm audit)
- [ ] Access log review
- [ ] Failed login attempt monitoring
- [ ] Backup verification
- [ ] SSL certificate expiration

---

## Incident Response

### Security Breach Procedure

1. **Immediate (0-1 hour)**
   - Isolate affected systems
   - Preserve evidence/logs
   - Notify security team

2. **Assessment (1-24 hours)**
   - Determine scope of breach
   - Identify affected data/users
   - Document timeline

3. **Containment (1-48 hours)**
   - Patch vulnerability
   - Reset compromised credentials
   - Block malicious access

4. **Recovery (48+ hours)**
   - Restore from clean backups
   - Verify system integrity
   - Notify affected users (if required by law)

5. **Post-Incident**
   - Document lessons learned
   - Update security measures
   - Team debrief

### Emergency Contacts

| Role           | Contact                   |
| -------------- | ------------------------- |
| Security Lead  | security@28webconnect.com |
| Technical Lead | tech@28webconnect.com     |
| Legal          | legal@28webconnect.com    |

---

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/architecture/security)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#security)
- [Web Security Checklist](https://websecuritychecklist.com/)

---

Last updated: 2024-XX-XX
