# Moataz AI Gateway — Phase 6 Documentation

## Production Monitoring, Analytics, Billing & Operations Platform

Phase 6 transforms the platform into a complete operations center with comprehensive analytics, usage tracking, cost management, billing, monitoring, alerts, reporting, administration, background jobs, and security.

---

## 1. Overview

Phase 6 adds **10 new modules** with **70+ new API endpoints**, building a complete Operations Center on top of the existing Phase 1-5 infrastructure.

### What's Included

- ✅ **Analytics** — 11 analytics dimensions (usage, requests, providers, models, cost, latency, errors, success/failure rates, users, organizations, API keys) + Executive Dashboard
- ✅ **Usage Tracking** — Requests, responses, tokens (input/output/cached), streaming sessions, images, embeddings, speech, vision, moderation
- ✅ **Cost Tracking** — Per provider/user/org/project/model, daily/monthly, estimated vs real cost
- ✅ **Billing** — Plans, subscriptions, usage limits/quotas, credits, invoices, payments, coupons, discounts, billing history, invoice export
- ✅ **Monitoring** — System metrics (CPU/RAM/Disk/Network), service health (PostgreSQL/Redis/LiteLLM/NestJS/Next.js), external integrations (Grafana/Prometheus/Uptime Kuma)
- ✅ **Alerts** — 8 default alert types, rule engine, evaluation, acknowledge/resolve workflow
- ✅ **Reporting** — Daily/weekly/monthly reports, CSV/Excel/PDF/JSON export, scheduled reports
- ✅ **Admin** — System/provider/billing/monitoring/notification settings, system overview
- ✅ **Background Jobs** — Cleanup, statistics, aggregation, sync, health checks, cost/usage calculation
- ✅ **Security** — AES-256-GCM encrypted storage, secret management, audit trail, access control

---

## 2. New Modules

### 2.1 Analytics Module (`/analytics`)

11 endpoints covering every analytics dimension:

| Endpoint | Description |
|---|---|
| `GET /analytics/usage` | Usage analytics (requests, tokens, streaming, images, etc.) |
| `GET /analytics/requests` | Request analytics by provider, model, endpoint, method |
| `GET /analytics/providers` | Provider analytics (requests, tokens, cost, errors, latency) |
| `GET /analytics/models` | Model analytics (requests, tokens, cost, avg cost per request) |
| `GET /analytics/cost` | Cost analytics (estimated vs real, by provider, by model) |
| `GET /analytics/latency` | Latency analytics (avg, p50, p95, p99, by provider) |
| `GET /analytics/errors` | Error analytics (error rate, success rate, failure rate) |
| `GET /analytics/users` | User analytics (per-user requests, tokens, cost) |
| `GET /analytics/organizations` | Organization analytics (per-org requests, tokens, cost) |
| `GET /analytics/api-keys` | API key analytics (per-key requests, tokens, cost) |
| `GET /analytics/executive-dashboard` | Executive dashboard (24h/7d/30d summary, top providers/models, alerts, revenue) |

All analytics endpoints support:
- Date range filtering (`startDate`, `endDate`)
- Provider/model/org/user filtering
- Configurable granularity (hour/day/week/month)
- Timeline + summary aggregation

### 2.2 Usage Tracking Module (`/usage`)

| Endpoint | Description |
|---|---|
| `GET /usage/summary` | Usage summary (requests, tokens, cost, errors, all types) |
| `GET /usage/by-type` | Usage by type (streaming, images, embeddings, speech, vision, moderation) |

The `UsageService.record()` method is called by the AI service after every request to track:
- Request/response counts
- Input/output/cached tokens
- Streaming sessions
- Image/embedding/speech/vision/moderation counts
- Cost (estimated + real)
- Latency, errors, successes

### 2.3 Cost Tracking Module (`/costs`)

| Endpoint | Description |
|---|---|
| `GET /costs/by-provider` | Cost by provider (estimated vs real) |
| `GET /costs/by-user` | Cost by user |
| `GET /costs/by-organization` | Cost by organization |
| `GET /costs/by-model` | Cost by model |
| `GET /costs/daily` | Daily cost timeline (last N days) |
| `GET /costs/monthly` | Monthly cost timeline (last N months) |
| `GET /costs/total` | Total cost (estimated vs real) |

### 2.4 Billing Module (`/billing`)

**Plans** (CRUD):
- `GET /billing/plans` — List plans
- `POST /billing/plans` — Create plan
- `GET /billing/plans/:id` — Get plan
- `PATCH /billing/plans/:id` — Update plan
- `DELETE /billing/plans/:id` — Deactivate plan

**Subscriptions**:
- `GET /billing/subscriptions` — List subscriptions
- `POST /billing/subscriptions` — Create subscription (with trial support)
- `POST /billing/subscriptions/:id/cancel` — Cancel (immediate or at period end)

**Usage Limits / Quotas**:
- `GET /billing/subscriptions/:id/limits` — Get usage limits
- `POST /billing/subscriptions/:id/limits` — Set usage limit (resource, limit, period)
- `POST /billing/subscriptions/:id/check-quota` — Check quota before making a request

**Credits**:
- `GET /billing/credits` — List credits
- `POST /billing/credits` — Grant credit
- `POST /billing/credits/:id/use` — Use credit (deduct from balance)

**Invoices**:
- `GET /billing/invoices` — List invoices
- `POST /billing/invoices` — Create invoice
- `GET /billing/invoices/:id` — Get invoice
- `GET /billing/invoices/:id/export` — Export invoice
- `POST /billing/invoices/:id/pay` — Mark as paid

**Payments**:
- `GET /billing/payments` — List payments
- `POST /billing/payments` — Record payment

**Coupons**:
- `GET /billing/coupons` — List coupons
- `POST /billing/coupons` — Create coupon (percentage or fixed)
- `POST /billing/coupons/validate` — Validate coupon code

**Billing History**:
- `GET /billing/history/:organizationId` — Full billing history (invoices + payments + credits)

### 2.5 Monitoring Module (`/monitoring`)

| Endpoint | Description |
|---|---|
| `GET /monitoring/system` | System metrics (CPU cores/model/speed, memory total/used/free, disk, network interfaces, process info) |
| `GET /monitoring/services` | Service health (PostgreSQL, Redis, LiteLLM, NestJS, Next.js) with latency |
| `GET /monitoring/dashboard` | Health dashboard (system + services + recent metrics combined) |
| `GET /monitoring/integrations` | External integration status (Grafana, Prometheus, Uptime Kuma) |
| `GET /monitoring/metrics` | Recent system metrics from database |
| `POST /monitoring/metrics` | Record a custom metric |

**System Metrics Measured:**
- CPU: cores, model, speed, load average (1/5/15 min), usage %
- Memory: total, used, free, usage %
- Disk: total, used, free, usage %
- Network: interfaces, addresses
- Process: PID, memory usage, CPU usage, uptime

**Service Health:**
- PostgreSQL — ping via `SELECT 1`
- Redis — ping
- LiteLLM — health check URL
- NestJS — process uptime + memory
- Next.js — frontend URL

**External Integrations:**
- Grafana (dashboard URLs + API key)
- Prometheus (metrics URL + Pushgateway)
- Uptime Kuma (push monitoring)

### 2.6 Alerts Module (`/alerts`)

| Endpoint | Description |
|---|---|
| `GET /alerts` | List alerts (filterable by status, severity) |
| `GET /alerts/rules` | List alert rules |
| `POST /alerts/rules` | Create alert rule |
| `PATCH /alerts/rules/:id` | Update rule |
| `DELETE /alerts/rules/:id` | Delete rule |
| `POST /alerts/:id/acknowledge` | Acknowledge alert |
| `POST /alerts/:id/resolve` | Resolve alert (with reason) |
| `POST /alerts/evaluate` | Manually trigger alert evaluation |

**8 Default Alert Rules (auto-seeded):**

| Rule | Type | Metric | Condition | Severity |
|---|---|---|---|---|
| Provider Down | `provider_down` | `provider.status` | eq 0 | CRITICAL |
| Slow Provider | `slow_provider` | `provider.latency_ms` | gt 5000 | WARNING |
| High Latency | `high_latency` | `request.latency_p95` | gt 3000 | WARNING |
| Quota Exceeded | `quota_exceeded` | `usage.exceeded` | eq 1 | ERROR |
| Database Errors | `database_errors` | `db.error_count` | gt 10 | CRITICAL |
| Redis Errors | `redis_errors` | `redis.error_count` | gt 10 | CRITICAL |
| Sync Failure | `sync_failure` | `sync.failed` | eq 1 | ERROR |
| Unexpected Cost | `unexpected_cost` | `cost.daily_anomaly` | gt 100 | WARNING |

Each rule has:
- Cooldown period (avoid alert spam)
- Evaluation window (minutes)
- Actions (notify, webhook, auto-resolve)
- Trigger count + last triggered timestamp

### 2.7 Reporting Module (`/reports`)

| Endpoint | Description |
|---|---|
| `POST /reports/generate` | Generate a report (CSV, Excel, PDF, JSON) |
| `GET /reports` | List reports |
| `GET /reports/:id` | Get report details |
| `GET /reports/scheduled` | List scheduled reports |
| `POST /reports/scheduled` | Create scheduled report (cron-based) |
| `DELETE /reports/scheduled/:id` | Delete scheduled report |

**Report Types:** DAILY, WEEKLY, MONTHLY, CUSTOM
**Formats:** CSV, EXCEL, PDF, JSON
**Scheduled Reports:** Cron expression-based, with recipient email list

### 2.8 Admin Module (`/admin`)

**Owner/Admin only** — controls all platform settings.

| Endpoint | Description |
|---|---|
| `GET /admin/settings` | List settings (filterable by category, public-only flag) |
| `GET /admin/settings/:key` | Get a single setting |
| `POST /admin/settings` | Set a setting (upsert) |
| `DELETE /admin/settings/:key` | Delete a setting (blocks read-only) |
| `GET /admin/overview` | System overview (counts of users, orgs, subscriptions, alerts, reports) |

**Setting Categories:**
- `system` — Platform name, maintenance mode, signup enabled
- `provider` — Default timeout, max retries
- `billing` — Currency, trial days
- `monitoring` — Health check interval, metrics retention
- `notification` — Email/push enabled

11 default settings auto-seeded on startup.

### 2.9 Jobs Module (`/jobs`)

**Owner/Admin only** — manage background jobs.

| Endpoint | Description |
|---|---|
| `POST /jobs/execute/:type` | Execute a job manually |
| `GET /jobs/history` | Get job execution history |

**Job Types:**

| Type | Description |
|---|---|
| `CLEANUP` | Delete old sessions, logs, metrics (30-day retention) |
| `STATISTICS` | Aggregate usage into cost summaries |
| `AGGREGATION` | Run statistics + other aggregations |
| `SYNCHRONIZATION` | Trigger LiteLLM sync |
| `HEALTH_CHECK` | Run health checks on all services |
| `COST_CALCULATION` | Calculate real costs from estimated |
| `USAGE_CALCULATION` | Update subscription usage limits |

Each job execution is recorded in `job_records` with status, duration, result, and error info.

### 2.10 Security Module (`/security`)

**Owner only** — encrypted storage, secret management, audit trail, access control.

| Endpoint | Description |
|---|---|
| `GET /security/secrets` | List secrets (metadata only, no values) |
| `POST /security/secrets` | Store an encrypted secret |
| `GET /security/secrets/:key` | Get and decrypt a secret |
| `POST /security/secrets/:key/rotate` | Rotate a secret |
| `DELETE /security/secrets/:key` | Delete a secret |
| `GET /security/audit-trail` | Get audit trail (filterable) |
| `POST /security/check-access` | Check user access to resource/action |

**Encryption:** AES-256-GCM with random IV + auth tag per secret. Key derived from `SECURITY_ENCRYPTION_KEY` env var.

**Access Control:**
- Owners have full access (wildcard `*`)
- Admins have broad access except to security/billing resources
- Specific permissions checked via `user_permissions` table
- Role-based fallback via `memberships`

---

## 3. Database Schema (Phase 6 additions)

### 15 New Tables

| Table | Purpose |
|---|---|
| `billing_plans` | Subscription plans (price, interval, features, limits) |
| `subscriptions` | Organization subscriptions (status, period, trial) |
| `usage_limits` | Per-subscription resource limits (requests, tokens, cost) |
| `credits` | Prepaid credits (balance, expiry) |
| `invoices` | Invoice records (amount, tax, discount, total, status) |
| `payments` | Payment records (method, provider, status) |
| `coupons` | Discount coupons (percentage/fixed, redemption limits) |
| `usage_records` | Per-minute usage records (all dimensions) |
| `cost_summaries` | Aggregated cost summaries (daily/monthly) |
| `system_metrics` | Time-series system metrics |
| `alerts` | Alert instances (status, severity, acknowledge/resolve) |
| `alert_rules` | Alert rule definitions (metric, condition, threshold) |
| `reports` | Generated reports (format, status, file URL) |
| `scheduled_reports` | Cron-based scheduled report definitions |
| `job_records` | Background job execution history |
| `admin_settings` | Platform settings (key-value, encrypted flag) |
| `encrypted_secrets` | AES-256-GCM encrypted secrets |

### 12 New Enums

`BillingPlanInterval`, `SubscriptionStatus`, `InvoiceStatus`, `PaymentStatus`, `AlertSeverity`, `AlertStatus`, `ReportType`, `ReportFormat`, `ReportStatus`, `JobType`, `JobStatus`

---

## 4. Complete API Endpoint Count

| Module | Endpoints | Phase |
|---|---|---|
| Auth | 12 | 2 |
| Users | 5 | 2 |
| Organizations | 5 | 2 |
| Teams | 5 | 2 |
| Projects | 5 | 2 |
| Roles | 5 | 2 |
| Permissions | 7 | 2 |
| API Keys | 6 | 2 |
| Audit Logs | 1 | 2 |
| Sessions | 4 | 2 |
| Notifications | 7 | 2 |
| Settings | 4 | 2 |
| Health | 3 | 2 |
| Metrics | 1 | 2 |
| LiteLLM | 8 | 3 |
| Providers | 12 | 4 |
| AI API | 7 | 5 |
| Playground | 16 | 5 |
| **Analytics** | **11** | **6** |
| **Usage** | **2** | **6** |
| **Cost Tracking** | **7** | **6** |
| **Billing** | **20** | **6** |
| **Monitoring** | **6** | **6** |
| **Alerts** | **8** | **6** |
| **Reporting** | **6** | **6** |
| **Admin** | **5** | **6** |
| **Jobs** | **2** | **6** |
| **Security** | **7** | **6** |
| **Total** | **~187 endpoints** | |

---

## 5. Environment Variables (Phase 6 additions)

| Variable | Purpose |
|---|---|
| `SECURITY_ENCRYPTION_KEY` | AES-256-GCM encryption key (min 32 chars) |
| `GRAFANA_URL` | Grafana instance URL |
| `GRAFANA_API_KEY` | Grafana API key |
| `GRAFANA_DASHBOARD_IDS` | Comma-separated dashboard IDs |
| `PROMETHEUS_URL` | Prometheus instance URL |
| `PROMETHEUS_PUSHGATEWAY_URL` | Prometheus Pushgateway URL |
| `UPTIME_KUMA_URL` | Uptime Kuma instance URL |
| `UPTIME_KUMA_PUSH_TOKEN` | Uptime Kuma push token |

---

## 6. Testing

### Unit Tests (75 total, 8 new)

| Suite | Tests | Coverage |
|---|---|---|
| `security.service.spec.ts` | 8 | Encryption (AES-256-GCM), secret listing, access control (owner/admin/wildcard/specific/deny) |

### Verification Results

```
✅ prisma validate     — Schema valid (1,652 lines, 40+ tables, 36+ enums)
✅ prisma generate     — Prisma client generated
✅ lint                — 0 errors (15 cosmetic unused-import warnings)
✅ typecheck           — 0 errors
✅ test                — 11 suites, 75 tests passing
✅ build               — dist/main.js + all module files produced
```

---

## 7. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                           │
│  Dashboard · Playground · Provider Mgmt · Operations Center     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     Backend (NestJS)                             │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Auth    │ │ AI API   │ │ Provider │ │ Analytics        │  │
│  │  RBAC    │ │ (OpenAI) │ │ Mgmt     │ │ Usage Tracking   │  │
│  │  Users   │ │ Playgrnd │ │ LiteLLM  │ │ Cost Tracking    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│                                                                 │
│  ┌──────────────────── Phase 6 ────────────────────────────┐  │
│  │  Billing (plans, subs, invoices, payments, coupons)     │  │
│  │  Monitoring (system, services, integrations)            │  │
│  │  Alerts (rules, evaluation, acknowledge/resolve)        │  │
│  │  Reporting (CSV/Excel/PDF, scheduled)                   │  │
│  │  Admin (settings, overview)                             │  │
│  │  Jobs (cleanup, aggregation, sync, health)              │  │
│  │  Security (encryption, secrets, audit, access control)  │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                  LiteLLM Proxy (Independent)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    AI Providers (20+)
```

---

## 8. File Count Summary

| Category | Count |
|---|---|
| New modules (Phase 6) | 10 |
| New source files | 30 |
| New database tables | 17 |
| New database enums | 12 |
| New API endpoints | 74 |
| New unit tests | 8 (75 total) |
| Total schema lines | 1,652 |
| Total modules | 28 |
| Total API endpoints | ~187 |

---

**Phase 6 Status**: ✅ Complete and verified.
**The platform now has a complete Operations Center with monitoring, analytics, billing, and administration.**
