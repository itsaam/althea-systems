# Security Audit Report

**Date**: 2026-03-26
**Project**: althea-systems

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 7 |
| Medium   | 6 |
| Low      | 0 |
| Info     | 5 |

## Critical

- **[Dependency]** 1 critical vulnerabilities found.

## High

- **[Dependency]** 29 high vulnerabilities found.
- **[Authentication]** Mutation endpoint without auth check. (src/app/api/auth/forgot-password/route.ts)
- **[Authentication]** Mutation endpoint without auth check. (src/app/api/auth/register/route.ts)
- **[Authentication]** Mutation endpoint without auth check. (src/app/api/auth/reset-password/route.ts)
- **[Authentication]** Mutation endpoint without auth check. (src/app/api/auth/verify-email/route.ts)
- **[Authentication]** Mutation endpoint without auth check. (src/app/api/stripe/checkout/route.ts)
- **[Authentication]** Mutation endpoint without auth check. (src/app/api/stripe/webhook/route.ts)

## Medium

- **[Dependency]** 3 moderate vulnerabilities found.
- **[Headers]** X-XSS-Protection is NOT configured. Consider adding it to next.config.ts or middleware.
- **[Headers]** Strict-Transport-Security is NOT configured. Consider adding it to next.config.ts or middleware.
- **[Headers]** Content-Security-Policy is NOT configured. Consider adding it to next.config.ts or middleware.
- **[Headers]** Permissions-Policy is NOT configured. Consider adding it to next.config.ts or middleware.
- **[Rate Limiting]** Rate limiting not detected in middleware. Consider adding it for auth endpoints.

## Info

- **[Headers]** X-Content-Type-Options is configured.
- **[Headers]** X-Frame-Options is configured.
- **[Headers]** Referrer-Policy is configured.
- **[SQL Injection]** No unsafe raw queries detected. Prisma ORM provides parameterized queries by default.
- **[Hardcoded Secret]** No hardcoded secrets detected.

## Recommendations

1. Run `npm audit fix` to resolve dependency vulnerabilities.
2. Add security headers (CSP, HSTS, X-Frame-Options) in next.config.ts or middleware.
3. Never use `$queryRawUnsafe` or `$executeRawUnsafe` in production code.
4. Ensure all mutation API routes check authentication.
5. Keep dependencies up to date with regular audits.
