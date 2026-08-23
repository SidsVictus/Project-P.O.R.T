# MIMO Project - Comprehensive Security Audit Report

**Date:** 2025-01-15  
**Auditor:** GitHub Copilot Security Analysis  
**Scope:** Full stack (Backend: Express/TypeScript/Supabase, Frontend: React/Vite/TypeScript)

---

## Executive Summary

| Severity | Count | Issues |
|----------|-------|--------|
| **CRITICAL** | 3 | Command Injection (6 providers), Path Traversal, Missing Webhook HMAC |
| **HIGH** | 4 | Wildcard CORS, Disabled CSP, No Rate Limiting, Secrets in CLI |
| **MEDIUM** | 3 | File Upload DoS, Missing Security Headers, Socket.io CORS |
| **LOW** | 2 | Frontend XSS (TerminalViewer), localStorage avatar |

**Overall Risk Rating: CRITICAL** - Multiple remotely exploitable vulnerabilities allowing RCE, data theft, and unauthorized deployments.

---

## CRITICAL Vulnerabilities

### 1. Command Injection in All 6 Deployment Providers (CVSS 9.8)

**Location:** `backend/src/modules/deploy/providers/*.ts` (all 6 files)

**Vulnerability:** All providers use `execAsync()` with unsanitized user input directly interpolated into shell commands.

**Affected Providers:**
- `vercel.ts` - `token`, `uploadDir`, `siteName`
- `netlify.ts` - `token`, `uploadDir`, `siteName`
- `cloudflare.ts` - `token`, `uploadDir`, `siteName`
- `firebase.ts` - `token`, `uploadDir`, `siteName`
- `github.ts` - `token`, `uploadDir`, `siteName`
- `surge.ts` - `token`, `uploadDir`, `siteName`

**Example (vercel.ts):**
```typescript
const { stdout } = await execAsync(
  `npx vercel --prod --yes --token ${token} ${uploadDir}`,
  { cwd: uploadDir, env: { ...process.env, VERCEL_TOKEN: token } }
)
```

**Impact:** Remote Code Execution (RCE) as the backend user. Attacker controls `siteName`, `uploadDir`, and provider tokens.

**Proof of Concept:**
```bash
# User sets siteName to: "mysite; cat /etc/passwd; #"
# Results in: npx vercel --prod --yes --token xxx mysite; cat /etc/passwd; #
```

**Fix:** Replace `execAsync` with `spawn`/`execFile` (no shell), validate all inputs with strict allowlists, pass secrets via environment variables.

---

### 2. Path Traversal in File Upload (CVSS 7.5)

**Location:** `backend/src/modules/upload/service.ts` - `saveFile()` function

**Vulnerability:** User-controlled `file.originalname` used directly in `path.join()` without validation.

**Code:**
```typescript
const filePath = path.join(uploadDir, relativePath)  // relativePath = file.originalname
await fs.mkdir(path.dirname(filePath), { recursive: true })
await fs.writeFile(filePath, file.buffer)
```

**Impact:** Arbitrary file write anywhere the backend process has write access (`../../etc/passwd`, `../../app/.env`, SSH keys, etc.)

**Proof of Concept:**
```bash
# Upload file named: "../../../etc/cron.d/evil"
# Creates: /etc/cron.d/evil with attacker-controlled content
```

**Fix:** Sanitize paths with `path.resolve()` + `startsWith(uploadDir)` check, reject paths with `..` or absolute paths.

---

### 3. Missing GitHub Webhook HMAC Verification (CVSS 7.5)

**Location:** `backend/src/modules/webhooks/routes.ts` - `/github-event` endpoint

**Vulnerability:** No verification of `X-Hub-Signature-256` header. Anyone can forge webhook payloads.

**Code:**
```typescript
router.post('/github-event', async (req, res) => {
  // NO SIGNATURE VERIFICATION
  const payload = req.body
  // ... processes deployment
})
```

**Impact:** Attackers can trigger arbitrary deployments, delete sites, or execute deployment commands without authentication.

**Fix:** Store GitHub webhook secret per site/user, verify HMAC-SHA256 signature on every request.

---

## HIGH Vulnerabilities

### 4. Wildcard CORS Configuration (CVSS 5.3)

**Location:** `backend/src/index.ts` line 31

**Code:**
```typescript
app.use(cors({ origin: '*' }))
```

**Impact:** Any website can make authenticated requests to the API (with credentials), enabling CSRF and data theft.

**Fix:** Restrict to specific frontend origin(s) from environment variable.

---

### 5. Content Security Policy Disabled (CVSS 5.3)

**Location:** `backend/src/index.ts` line 34

**Code:**
```typescript
app.use(helmet({ contentSecurityPolicy: false }))
```

**Impact:** No protection against XSS, injection attacks, or unauthorized script execution.

**Fix:** Enable CSP with nonce-based script/style policies for Vite/React compatibility.

---

### 6. No Rate Limiting (CVSS 7.5)

**Location:** Entire backend - no rate limiting middleware

**Impact:** Brute force on auth, DoS on deploy/upload endpoints, credential stuffing, API abuse.

**Fix:** Add `express-rate-limit` with tiered limits (strict on auth, moderate on API, generous on static).

---

### 7. Secrets Exposed in Process List (CVSS 6.5)

**Location:** All 6 deploy providers - tokens passed as CLI arguments

**Code:**
```typescript
// vercel.ts
`npx vercel --prod --yes --token ${token} ${uploadDir}`

// netlify.ts  
`npx netlify deploy --prod --dir=${uploadDir} --auth=${token} --site=${siteName}`
```

**Impact:** Tokens visible in `ps aux`, `/proc/*/cmdline`, Docker logs, CI/CD logs, monitoring tools.

**Fix:** Pass all secrets via environment variables to child processes, never as CLI arguments.

---

## MEDIUM Vulnerabilities

### 8. File Upload DoS & Missing Validation (CVSS 5.3)

**Location:** `backend/src/modules/upload/routes.ts` and `service.ts`

**Issues:**
- 100MB file size limit (too high)
- 500 files per request (too high)
- No file type validation
- No malware scanning
- No filename sanitization

**Impact:** Disk exhaustion, memory exhaustion, malicious file upload.

**Fix:** Reduce limits, add MIME type validation, implement filename sanitization, add virus scanning.

---

### 9. Missing Security Headers (CVSS 4.3)

**Location:** `backend/src/index.ts` - only basic Helmet

**Missing Headers:**
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`

**Fix:** Add comprehensive security headers middleware.

---

### 10. Socket.io Wildcard CORS (CVSS 4.3)

**Location:** `backend/src/modules/deploy/stream.ts` line 13

**Code:**
```typescript
cors: { origin: '*', methods: ['GET', 'POST'] }
```

**Impact:** Any origin can connect to WebSocket and receive deployment logs.

**Fix:** Restrict to frontend origin, validate JWT in handshake (already done).

---

## LOW Vulnerabilities

### 11. Frontend XSS in TerminalViewer (CVSS 3.1)

**Location:** `frontend/src/components/deploy/TerminalViewer.tsx`

**Code:**
```typescript
deployLogs.forEach((log) => termRef.current!.writeln(log))
```

**Impact:** If deployment logs contain ANSI escape sequences or malicious content, could affect terminal rendering. Low risk as logs are server-generated.

**Fix:** Sanitize log output, strip ANSI sequences if not intended.

---

### 12. Custom Avatar in localStorage (CVSS 2.1)

**Location:** `frontend/src/stores/authStore.ts` line 14

**Code:**
```typescript
customAvatar: localStorage.getItem('customAvatar'),
```

**Impact:** Minor - avatar URL persisted in localStorage. Not sensitive data.

**Fix:** Consider sessionStorage or remove persistence.

---

## Secure Architecture Strengths (Not Vulnerabilities)

✅ **Row Level Security (RLS)** - All 9 tables have RLS enabled with `auth.uid() = user_id` policies  
✅ **JWT Authentication** - Proper Bearer token validation via Supabase  
✅ **AES-256-GCM Encryption** - Credentials encrypted with scrypt key derivation (64-byte salt, 16-byte IV, 16-byte tag)  
✅ **Zod Validation** - All API inputs validated with strict schemas  
✅ **Parameterized Queries** - Supabase client prevents SQL injection  
✅ **HTTPS in Production** - Docker/environment configured for TLS  
✅ **Supabase Auth** - OAuth (Google) with PKCE, secure session handling  

---

## Remediation Priority Order

| Priority | Issue | Effort | Risk Reduction |
|----------|-------|--------|----------------|
| 1 | Command Injection (6 providers) | High | Eliminates RCE |
| 2 | Path Traversal (upload) | Medium | Prevents arbitrary file write |
| 3 | Webhook HMAC Verification | Low | Prevents forged deployments |
| 4 | CORS + CSP + Rate Limiting | Medium | Defense in depth |
| 5 | Secrets in CLI args | Medium | Prevents token leakage |
| 6 | Upload validation/limits | Low | Prevents DoS |
| 7 | Security headers | Low | Defense in depth |
| 8 | Socket.io CORS | Low | Prevents log leakage |
| 9 | TerminalViewer XSS | Low | Defense in depth |

---

## Files Requiring Changes

### Backend (Critical/High)
1. `backend/src/index.ts` - CORS, CSP, rate limiting, security headers
2. `backend/src/modules/deploy/providers/vercel.ts` - Command injection fix
3. `backend/src/modules/deploy/providers/netlify.ts` - Command injection fix
4. `backend/src/modules/deploy/providers/cloudflare.ts` - Command injection fix
5. `backend/src/modules/deploy/providers/firebase.ts` - Command injection fix
6. `backend/src/modules/deploy/providers/github.ts` - Command injection fix
7. `backend/src/modules/deploy/providers/surge.ts` - Command injection fix
8. `backend/src/modules/upload/service.ts` - Path traversal fix
9. `backend/src/modules/webhooks/routes.ts` - HMAC verification
10. `backend/src/modules/deploy/stream.ts` - Socket.io CORS
11. `backend/package.json` - Add `express-rate-limit`, `helmet` config

### Frontend (Low)
1. `frontend/src/components/deploy/TerminalViewer.tsx` - Log sanitization
2. `frontend/src/stores/authStore.ts` - localStorage → sessionStorage

### Infrastructure
1. `docker/docker-compose.yml` - Security hardening
2. `docker/Dockerfile.backend` - Non-root user, read-only filesystem

---

## Testing Recommendations

1. **Penetration Testing** - Test command injection with payloads: `; cat /etc/passwd`, `$(id)`, `` `id` ``
2. **Path Traversal Testing** - Upload files named `../../../etc/passwd`, `..\..\windows\system32\drivers\etc\hosts`
3. **Webhook Testing** - Send forged payloads without signature, verify rejection
4. **Rate Limit Testing** - Burst requests to auth/deploy endpoints
5. **CORS Testing** - Request from different origins, verify blocking
6. **Dependency Scanning** - Run `npm audit` and `snyk test` regularly