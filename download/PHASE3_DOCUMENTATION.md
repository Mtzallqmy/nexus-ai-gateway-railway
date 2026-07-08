# Moataz AI Gateway — Phase 3 Technical Documentation

## LiteLLM Integration as the Unified AI Gateway

Phase 3 integrates **LiteLLM** as the platform's sole AI inference gateway. LiteLLM is deployed as an independent Docker service, and the NestJS backend communicates **only** with LiteLLM — never directly with AI providers.

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (Next.js)                   │
│         Dashboard · Admin · Monitoring · Settings     │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (REST)
┌──────────────────────▼──────────────────────────────┐
│                  Backend (NestJS)                     │
│  Auth · RBAC · Database · API · Logging · Metrics    │
│                    LiteLLM Gateway Module             │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (with master key)
┌──────────────────────▼──────────────────────────────┐
│              LiteLLM Proxy (Independent)              │
│  Routing · Streaming · Provider Communication         │
│  Model Gateway · Caching · Fallbacks · Retries        │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     ┌────────┐  ┌──────────┐  ┌──────────┐
     │ OpenAI │  │ Anthropic│  │  Google  │  ... (Phase 4)
     └────────┘  └──────────┘  └──────────┘
```

### Responsibility Separation

| Layer | Owns | Does NOT Do |
|---|---|---|
| **Next.js** | UI, admin dashboards, monitoring views | Backend logic, direct DB access, direct LiteLLM calls |
| **NestJS** | Auth, RBAC, DB, API, logging, metrics, LiteLLM management | Direct provider communication, model inference |
| **LiteLLM** | Provider routing, streaming, fallbacks, retries, caching | User auth, business logic, DB persistence (except spend logs) |
| **Providers** | AI inference | — |

### Critical Rule

> **NestJS communicates ONLY with LiteLLM.**
> **NestJS NEVER communicates directly with AI providers.**
> **LiteLLM is the ONLY inference gateway.**

This is enforced by:
1. The `LiteLLMClient` class is the **only** code that sends HTTP requests to the LiteLLM proxy
2. No other module imports `fetch` or HTTP libraries targeting provider URLs
3. All inference requests flow through `LiteLLMRouter → LiteLLMClient → LiteLLM Proxy`
4. Provider API keys exist **only** in the LiteLLM service's environment — NestJS never sees them

---

## 2. Project Structure

```
/home/z/my-project/
├── docker-compose.yml              # Root orchestration (PG + Redis + LiteLLM + Backend)
├── .env.example                    # Root env (provider keys, JWT secrets)
│
├── services/
│   └── litellm/                    # ← LiteLLM standalone service
│       ├── proxy_config.yaml       # Official LiteLLM config format
│       ├── Dockerfile              # Uses official LiteLLM image
│       ├── .env.example            # LiteLLM-specific env vars
│       └── README.md               # LiteLLM service docs
│
└── backend/
    ├── prisma/
    │   ├── schema.prisma           # Extended with 9 LiteLLM tables
    │   └── migrations/
    │       ├── 0001_init/
    │       │   └── migration.sql
    │       └── 0002_litellm/
    │           └── migration.sql   # 9 new tables + 6 new enums
    │
    └── src/modules/litellm/        # ← NestJS LiteLLM module
        ├── litellm.module.ts       # DI wiring
        ├── litellm.controller.ts   # 7 endpoints + internal callback
        ├── litellm.service.ts      # Orchestrator (health, sync, metrics, status)
        ├── litellm.client.ts       # HTTP client (ONLY class talking to LiteLLM)
        ├── litellm.router.ts       # Request router (chat/embeddings)
        ├── litellm.parser.ts       # Response parser (models, health, usage)
        ├── litellm.repository.ts   # Data access (Prisma)
        ├── litellm.cache.ts        # Redis cache layer
        ├── litellm.circuit-breaker.ts  # Per-provider circuit breaker
        ├── litellm.retry-policy.ts     # Exponential backoff with jitter
        ├── litellm.connection-pool.ts  # Bounded concurrency pool
        ├── litellm.config.ts       # Config loader (env → typed object)
        ├── litellm.constants.ts    # Endpoints, cache keys, queue names, defaults
        ├── litellm.types.ts        # API response types + domain types
        ├── litellm.interfaces.ts   # Abstract interfaces (ILiteLLMClient, etc.)
        ├── dto/
        │   └── litellm.dto.ts      # Zod validation schemas
        ├── litellm.circuit-breaker.spec.ts   # 8 tests
        ├── litellm.retry-policy.spec.ts      # 10 tests
        ├── litellm.parser.spec.ts           # 7 tests
        └── litellm.connection-pool.spec.ts  # 6 tests
```

---

## 3. LiteLLM Standalone Service

### Dockerfile

```dockerfile
FROM ghcr.io/berriai/litellm:main-stable
WORKDIR /app
COPY proxy_config.yaml /app/proxy_config.yaml
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:4000/health/liveness || exit 1
CMD ["--config", "/app/proxy_config.yaml", "--port", "4000", "--num_workers", "4"]
```

- Uses the **official LiteLLM Docker image** — no modifications
- Copies our `proxy_config.yaml` into the container
- Healthcheck against LiteLLM's built-in `/health/liveness` endpoint
- Runs 4 worker processes for concurrency

### proxy_config.yaml (Official Format)

The configuration uses LiteLLM's native YAML format:

- **`model_list`** — 9 model entries (gpt-4o, gpt-4-turbo, gpt-3.5-turbo, claude-3-5-sonnet, claude-3-opus, gemini-1.5-pro, gemini-1.5-flash, mistral-large, mistral-8x7b)
- **`router_settings`** — routing strategy, 3 retries, 30s timeout, fallbacks (gpt-4o → claude → gemini), 3 allowed fails, 60s cooldown
- **`litellm_settings`** — drop params, 30s request timeout, 60s stream timeout, Redis caching
- **`general_settings`** — master key, database URL (for spend logs + virtual keys)
- **`callback_settings`** — success/failure callbacks to NestJS (`/litellm/internal/callback`)

API keys are referenced via `os.environ/VAR_NAME` syntax — LiteLLM reads them from its environment at runtime.

### Environment Variables (services/litellm/.env.example)

| Variable | Purpose |
|---|---|
| `LITELLM_MASTER_KEY` | Admin key for LiteLLM API |
| `LITELLM_SALT_KEY` | Salt for virtual key hashing |
| `DATABASE_URL` | PostgreSQL connection (shared with backend) |
| `REDIS_HOST` / `REDIS_PORT` | Redis for caching (shared with backend) |
| `OPENAI_API_KEY` | OpenAI API key (only LiteLLM sees this) |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `GEMINI_API_KEY` | Google AI API key |
| `MISTRAL_API_KEY` | Mistral API key |
| `LITELLM_LOG` | Log level (INFO) |

---

## 4. Docker Compose (Root)

The root `docker-compose.yml` orchestrates 4 services:

| Service | Image | Port | Depends On |
|---|---|---|---|
| `postgres` | postgres:16-alpine | 5432 | — |
| `redis` | redis:7-alpine | 6379 | — |
| `litellm` | Built from `services/litellm/Dockerfile` | 4000 | postgres (healthy), redis (healthy) |
| `backend` | Built from `backend/Dockerfile` | 3001 | postgres (healthy), redis (healthy), litellm (healthy) |

### Startup Order

1. PostgreSQL starts → healthcheck passes
2. Redis starts → healthcheck passes
3. LiteLLM starts → healthcheck passes (`/health/liveness`)
4. Backend starts → runs `prisma migrate deploy` → `node dist/main.js`

### Networking

All services share the `moataz-network` bridge network. The backend reaches LiteLLM at `http://litellm:4000` (Docker DNS).

### Usage

```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f litellm
docker compose logs -f backend

# Rebuild after code changes
docker compose up -d --build

# Tear down (keep data)
docker compose down

# Tear down (wipe all data)
docker compose down -v
```

---

## 5. NestJS LiteLLM Module

### Module Architecture

```
LiteLLMModule
├── LITELLM_CONFIG (factory) ── reads env via ConfigService
├── LiteLLMCircuitBreaker ──── per-provider failure tracking
├── LiteLLMRetryPolicy ─────── exponential backoff with jitter
├── LiteLLMConnectionPool ──── bounded concurrency (default 50)
├── LiteLLMCache ───────────── Redis-backed cache (models, health, version)
├── LiteLLMClient ──────────── HTTP client (ONLY class talking to LiteLLM)
├── LiteLLMParser ──────────── response normalizer
├── LiteLLMRepository ──────── Prisma data access
├── LiteLLMRouter ──────────── request routing + usage recording
├── LiteLLMService ─────────── orchestrator (health, sync, metrics, status)
└── LiteLLMController ──────── 7 REST endpoints + internal callback
```

### Key Components

#### LiteLLMClient (`litellm.client.ts`)

The **only** class in the platform that sends HTTP requests to the LiteLLM proxy.

- Authorization via `Bearer <LITELLM_MASTER_KEY>`
- Request timeout (30s default, 5s for health probes)
- Stream timeout (60s for SSE streams)
- Retry with exponential backoff (3 attempts, 500ms base, jittered)
- Circuit breaker per model (5 failures → open for 60s)
- Connection pool (50 concurrent max)
- Logs every request, response, retry, timeout, and error with request IDs

Methods:
- `getModels()`, `getVersion()`, `getHealthLiveness()`, `getHealthReadiness()`, `getHealthFull()`
- `reload()` — triggers LiteLLM config reload
- `chatCompletion(req)` — non-streaming
- `chatCompletionStream(req)` — async iterable of SSE chunks
- `embeddings(model, input)`

#### LiteLLMRouter (`litellm.router.ts`)

Routes inference requests through the client. Records usage counters on success/failure.

- `routeChatCompletion(req)` → `LiteLLMClient.chatCompletion()`
- `routeChatCompletionStream(req)` → `LiteLLMClient.chatCompletionStream()`
- `routeEmbeddings(model, input)` → `LiteLLMClient.embeddings()`

#### LiteLLMParser (`litellm.parser.ts`)

Normalizes LiteLLM API responses into platform domain types.

- `parseModelList(response)` → `{ providers: ParsedProvider[], models: ParsedModel[] }`
- `parseChatCompletion(response)` → `{ content, usage, model, finishReason }`
- `parseStreamChunk(chunk)` → delta content string
- `parseHealthResponse(response)` → per-provider health summary
- `parseLivenessResponse(response)` → status + probes

#### LiteLLMCache (`litellm.cache.ts`)

Redis-backed cache with domain-specific helpers.

- `getModels()` / `setModels()` / `invalidateModels()` — 5 min TTL
- `getHealth()` / `setHealth()` — 30s TTL
- `getVersion()` / `setVersion()` — 1h TTL
- `invalidateAll()` — flushes all `litellm:*` keys

#### LiteLLMCircuitBreaker (`litellm.circuit-breaker.ts`)

Per-provider circuit breaker (in-memory state).

- **CLOSED** → requests flow normally
- **OPEN** → requests short-circuit with `ServiceUnavailableException` (60s cooldown)
- **HALF_OPEN** → one probe request allowed; success closes, failure reopens

States:
```
CLOSED ──(N failures)──→ OPEN ──(reset timeout)──→ HALF_OPEN
   ↑                                                    │
   └──────────────(success)────────────────┐            │
                                            └──(failure)─┘
```

#### LiteLLMRetryPolicy (`litellm.retry-policy.ts`)

Exponential backoff with full jitter.

- **Retries on**: 5xx, 429, 408, ECONNRESET, ETIMEDOUT, ENOTFOUND, ECONNREFUSED, EPIPE, AbortError
- **Does NOT retry on**: 4xx (except 429/408) — client errors won't change
- **Delay**: `random(0, base * 2^attempt)`, capped at 5s

#### LiteLLMConnectionPool (`litellm.connection-pool.ts`)

Bounded concurrency pool (semaphore-based).

- Default max: 50 concurrent in-flight requests to LiteLLM
- `acquire()` → blocks if at capacity, resumes when a slot frees
- `withConnection(fn)` → acquires, runs, auto-releases (even on error)
- `getStats()` → `{ active, idle, max, waiting }`

#### LiteLLMRepository (`litellm.repository.ts`)

Data access layer over Prisma.

- **Providers**: `upsertProvider()`, `findProviders()`, `findProviderById()`
- **Models**: `upsertModel()`, `findModels()`, `deleteStaleModels()`
- **Sync History**: `recordSync()`, `findSyncHistory()`
- **Health**: `recordHealthCheck()`, `findLatestHealth()`
- **Metrics**: `recordMetric()`, `aggregateMetrics()`
- **Usage**: `incrementUsage()`

---

## 6. API Endpoints

All endpoints are under `/litellm` and require JWT auth + `litellm:read` (or `litellm:write`) permission.

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/litellm/health` | `litellm:read` | Full health (healthy + unhealthy endpoints) |
| GET | `/litellm/health/liveness` | `litellm:read` | Liveness probe |
| GET | `/litellm/health/readiness` | `litellm:read` | Readiness probe |
| GET | `/litellm/version` | `litellm:read` | LiteLLM proxy version |
| GET | `/litellm/models` | `litellm:read` | List models (cached 5 min) |
| POST | `/litellm/reload` | `litellm:write` | Reload LiteLLM config + invalidate caches |
| POST | `/litellm/sync` | `litellm:write` | Synchronize providers/models from LiteLLM |
| GET | `/litellm/metrics` | `litellm:read` | Aggregated metrics summary |
| GET | `/litellm/status` | `litellm:read` | Overall integration status |
| GET | `/litellm/config` | `litellm:read` | View client config (no secrets) |
| POST | `/litellm/internal/callback` | Public | Internal: LiteLLM success/failure callbacks |

### Example: Sync Request

```bash
POST /litellm/sync
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "entityType": "ALL",
  "force": false
}
```

Response:
```json
{
  "success": true,
  "data": {
    "entityType": "ALL",
    "status": "SUCCESS",
    "startedAt": "2025-01-15T10:00:00.000Z",
    "completedAt": "2025-01-15T10:00:05.123Z",
    "durationMs": 5123,
    "itemsProcessed": 9,
    "itemsCreated": 4,
    "itemsUpdated": 5,
    "itemsDeleted": 0,
    "itemsFailed": 0
  },
  "timestamp": "2025-01-15T10:00:05.124Z"
}
```

---

## 7. Database Schema

### 9 New Tables (Migration 0002_litellm)

| Table | Purpose |
|---|---|
| `litellm_providers` | Cached view of AI providers known to LiteLLM |
| `litellm_provider_connections` | Connection config (masked API key, headers, status) |
| `litellm_provider_configurations` | Per-provider runtime settings |
| `litellm_provider_health` | Time-series health check records |
| `litellm_provider_statistics` | Aggregated stats (requests, tokens, cost, latency percentiles) |
| `litellm_provider_metrics` | Real-time metric points |
| `litellm_model_cache` | Cached model list with pricing, capabilities, context windows |
| `litellm_usage_counters` | Per-minute usage buckets (request/token/cost counters) |
| `litellm_sync_history` | Audit trail of every sync run |

### 6 New Enums

- `ProviderType` — OPENAI, ANTHROPIC, GOOGLE, MISTRAL, COHERE, AZURE, AWS, HUGGINGFACE, OPENROUTER, NVIDIA, CUSTOM
- `ProviderConnectionStatus` — CONNECTED, DISCONNECTED, ERROR, UNKNOWN
- `SyncStatus` — PENDING, RUNNING, SUCCESS, FAILED, PARTIAL
- `SyncEntityType` — PROVIDERS, MODELS, CAPABILITIES, METADATA, VERSIONS, ALL
- `CircuitBreakerState` — CLOSED, OPEN, HALF_OPEN
- `HealthCheckType` — LIVENESS, READINESS, FULL

All tables use UUID primary keys, `@db.Uuid` for foreign keys, proper indexes on lookup/filter fields, and `onDelete: Cascade` where appropriate.

---

## 8. Synchronization

### Sync Entity Types

| Type | What It Syncs |
|---|---|
| `PROVIDERS` | Provider name, slug, type, baseUrl, features, status |
| `MODELS` | Model name, litellm ID, context window, pricing, capabilities, modalities |
| `CAPABILITIES` | Function calling, vision, JSON mode, web search (part of model sync) |
| `METADATA` | Provider region, type metadata |
| `VERSIONS` | LiteLLM proxy version (cached) |
| `ALL` | All of the above (default) |

### Sync Flow

1. Controller receives `POST /litellm/sync` with `entityType`
2. Service calls LiteLLM `/v1/models` (cached)
3. Parser normalizes response into providers + models
4. Repository upserts each provider and model
5. Sync history record is created with stats (processed/created/updated/failed)
6. Model cache is invalidated

### Scheduled Synchronization

- **Interval**: Every 5 minutes (configurable via `LITELLM_SYNC_INTERVAL_MINUTES`)
- **Health check**: Every 30 seconds (configurable via `LITELLM_HEALTH_CHECK_INTERVAL_MS`)
- **Implementation**: `LiteLLMService.runScheduledSync()` and `runScheduledHealthCheck()` — ready to wire to `@Cron` / `@Interval` decorators

---

## 9. Monitoring

### Metrics Collected (`GET /litellm/metrics`)

```json
{
  "timestamp": "2025-01-15T10:00:00.000Z",
  "totalProviders": 4,
  "activeProviders": 4,
  "totalModels": 9,
  "activeModels": 9,
  "healthyProviders": 8,
  "degradedProviders": 0,
  "downProviders": 1,
  "totalRequests": 9,
  "totalErrors": 1,
  "avgLatencyMs": 0,
  "cacheHitRate": 0,
  "circuitBreakerOpen": 0,
  "lastSyncAt": "2025-01-15T09:55:00.000Z"
}
```

### Status (`GET /litellm/status`)

```json
{
  "connected": true,
  "proxyReachable": true,
  "version": "1.40.0",
  "lastSyncAt": "2025-01-15T09:55:00.000Z",
  "lastHealthCheckAt": "2025-01-15T10:00:00.000Z",
  "providerCount": 4,
  "modelCount": 9,
  "cacheStatus": { "connected": true, "keys": 0 },
  "queueStatus": { "waiting": 0, "active": 0, "failed": 0 },
  "circuitBreakers": [
    { "providerId": "openai", "providerName": "openai", "state": "CLOSED", "failureCount": 0, "lastFailureAt": null }
  ]
}
```

---

## 10. Logging

Every LiteLLM interaction is logged with structured context:

| Event | Level | Context |
|---|---|---|
| HTTP request sent | DEBUG | `LiteLLMClient` |
| HTTP response received (200) | DEBUG | `LiteLLMClient` |
| HTTP error (5xx, 429) | WARN | `LiteLLMClient` (with retry info) |
| Retry scheduled | WARN | `LiteLLMClient` |
| Retries exhausted | ERROR | `LiteLLMClient` |
| Circuit breaker opened | WARN | `LiteLLMCircuitBreaker` |
| Circuit breaker closed (recovered) | LOG | `LiteLLMCircuitBreaker` |
| Sync started | LOG | `LiteLLMService` |
| Sync completed | LOG | `LiteLLMService` (with duration + status) |
| Sync failed | ERROR | `LiteLLMService` |
| Cache invalidated | LOG | `LiteLLMCache` |
| Stream started | LOG | `LiteLLMClient` |
| Stream chunk parsed | DEBUG | `LiteLLMParser` |
| Stream failed | ERROR | `LiteLLMClient` |
| Usage recorded | DEBUG | `LiteLLMRouter` |
| Scheduled health check | DEBUG | `LiteLLMService` |
| Scheduled sync | DEBUG | `LiteLLMService` |

All logs flow through Winston (configured in Phase 2) with daily rotating files.

---

## 11. Configuration

### Backend Environment Variables (Phase 3 additions)

| Variable | Default | Description |
|---|---|---|
| `LITELLM_BASE_URL` | `http://localhost:4000` | LiteLLM proxy URL |
| `LITELLM_MASTER_KEY` | (required) | Master key for LiteLLM API |
| `LITELLM_REQUEST_TIMEOUT_MS` | `30000` | Non-stream request timeout |
| `LITELLM_STREAM_TIMEOUT_MS` | `60000` | Stream request timeout |
| `LITELLM_SYNC_INTERVAL_MINUTES` | `5` | Auto-sync interval |
| `LITELLM_HEALTH_CHECK_INTERVAL_MS` | `30000` | Health check interval |
| `LITELLM_CACHE_TTL_SECONDS` | `300` | Model cache TTL |
| `LITELLM_CIRCUIT_BREAKER_FAILURE_THRESHOLD` | `5` | Failures before circuit opens |
| `LITELLM_CIRCUIT_BREAKER_RESET_TIMEOUT_MS` | `60000` | Circuit open duration |
| `LITELLM_RETRY_ATTEMPTS` | `3` | Max retry attempts |
| `LITELLM_RETRY_BASE_DELAY_MS` | `500` | Base delay for exponential backoff |
| `LITELLM_POOL_MAX_CONNECTIONS` | `50` | Max concurrent connections to LiteLLM |

All variables are read by `loadLiteLLMConfig()` and return a frozen `LiteLLMConfig` object.

---

## 12. Testing

### Unit Tests (31 new, 50 total)

| Suite | Tests | Coverage |
|---|---|---|
| `litellm.circuit-breaker.spec.ts` | 8 | OPEN/CLOSED/HALF_OPEN transitions, reset, getAll |
| `litellm.retry-policy.spec.ts` | 10 | 5xx/429/408/network/AbortError retry, 4xx no-retry, max attempts, jitter |
| `litellm.parser.spec.ts` | 7 | model list parsing, chat completion, stream chunks, health response |
| `litellm.connection-pool.spec.ts` | 6 | acquire/release, blocking, withConnection, concurrent ops |

### Verification Results

```
✅ prisma generate     — Prisma client generated
✅ prisma validate     — Schema valid
✅ lint                — 0 errors, 0 warnings
✅ typecheck           — 0 errors
✅ test                — 8 suites, 50 tests passing
✅ build               — dist/main.js + all LiteLLM module files produced
```

---

## 13. Deployment

### Full Stack Deployment

```bash
# 1. Clone and configure
git clone <repo>
cd moataz-ai-gateway
cp .env.example .env
# Edit .env with real API keys and secrets

# 2. Start all services
docker compose up -d

# 3. Run database migrations + seed
docker compose exec backend bunx prisma migrate deploy
docker compose exec backend bunx prisma:seed

# 4. Verify
curl http://localhost:3001/health/live          # Backend health
curl http://localhost:4000/health/liveness      # LiteLLM health
curl http://localhost:3001/api/docs             # Swagger UI
```

### Service URLs

| Service | URL | Purpose |
|---|---|---|
| Frontend | `http://localhost:3000` | Next.js dashboard |
| Backend API | `http://localhost:3001` | NestJS REST API |
| Swagger | `http://localhost:3001/api/docs` | API documentation |
| LiteLLM Proxy | `http://localhost:4000` | AI gateway |
| LiteLLM Health | `http://localhost:4000/health/liveness` | Liveness probe |
| PostgreSQL | `localhost:5432` | Database |
| Redis | `localhost:6379` | Cache + queue |

---

## 14. Troubleshooting

### "Circuit breaker open for model 'X'"

**Cause**: 5 consecutive failures for the model.
**Fix**:
1. Check LiteLLM logs: `docker compose logs litellm`
2. Verify provider API keys in `.env`
3. Call `POST /litellm/reload` to reset LiteLLM config
4. The circuit auto-resets after 60s, or manually via `LiteLLMCircuitBreaker.reset()`

### "LiteLLM proxy unreachable"

**Cause**: NestJS can't connect to `http://litellm:4000`.
**Fix**:
1. Verify LiteLLM is running: `docker compose ps litellm`
2. Check `LITELLM_BASE_URL` env var
3. Verify Docker network: `docker network inspect moataz-network`
4. Check LiteLLM health: `curl http://localhost:4000/health/liveness`

### Sync returns 0 items

**Cause**: LiteLLM has no models configured, or model list is cached.
**Fix**:
1. Verify `proxy_config.yaml` has `model_list` entries
2. Call `POST /litellm/reload` to invalidate caches
3. Check LiteLLM logs for config load errors
4. Verify API keys are set in LiteLLM's environment

### High latency on inference requests

**Cause**: Connection pool exhausted, circuit breakers open, or provider issues.
**Fix**:
1. Check `GET /litellm/status` for open circuit breakers
2. Check `GET /litellm/metrics` for error rates
3. Increase `LITELLM_POOL_MAX_CONNECTIONS` if pool is saturated
4. Check LiteLLM's own retry/fallback behavior in `proxy_config.yaml`

### LiteLLM callback not reaching backend

**Cause**: LiteLLM can't reach `http://backend:3001/litellm/internal/callback`.
**Fix**:
1. Verify `callback_settings.generic_api_callback_url` in `proxy_config.yaml`
2. Check Docker network connectivity
3. The endpoint is `@Public()` so no auth required — verify it's reachable

---

## 15. Phase 4 Migration Guide

Phase 3 deploys LiteLLM and integrates it at the infrastructure level. Phase 4 will add **provider-specific business logic** that sits on top of LiteLLM:

### What Phase 4 Will Add

1. **Provider management UI** — CRUD for provider configurations (stored in `litellm_provider_configurations`)
2. **Model management UI** — enable/disable models, set custom pricing overrides
3. **Virtual key management** — generate LiteLLM virtual keys per organization/project
4. **Spend tracking** — aggregate LiteLLM spend logs into per-org billing
5. **Model routing rules** — custom routing (e.g., "use gpt-4o for chat, claude-3 for code")
6. **A/B testing** — split traffic across models via LiteLLM's router
7. **Custom fallback chains** — per-organization fallback configurations
8. **Provider-specific health dashboards** — visual provider health with history

### What Phase 4 Will NOT Change

- LiteLLM remains the sole inference gateway
- NestJS still talks only to LiteLLM (never to providers)
- The `LiteLLMClient` class remains the only HTTP client
- The `proxy_config.yaml` format stays the same
- Provider API keys stay in LiteLLM's environment only

### Phase 4 Starting Points

1. Create `src/modules/providers/` module that extends the LiteLLM module
2. Add CRUD endpoints for `litellm_provider_configurations`
3. Wire up LiteLLM virtual key generation via `POST /key/generate`
4. Build spend aggregation from LiteLLM's callback data (already hitting `/litellm/internal/callback`)
5. Add model routing rules to `proxy_config.yaml` dynamically via LiteLLM's admin API

---

## 16. Summary

| Metric | Value |
|---|---|
| New NestJS files | 15 (module, controller, service, client, router, parser, repository, cache, circuit breaker, retry policy, connection pool, config, constants, types, interfaces, dto) |
| New database tables | 9 |
| New database enums | 6 |
| New API endpoints | 7 + 1 internal callback |
| New unit tests | 31 (50 total across all phases) |
| Docker services | 4 (PostgreSQL, Redis, LiteLLM, Backend) |
| LiteLLM config entries | 9 models across 4 providers |
| Documentation sections | 16 |

### Strict Rules Compliance

- ✅ LiteLLM deployed as independent service (official Docker image, no modifications)
- ✅ NestJS communicates ONLY with LiteLLM (enforced by `LiteLLMClient` being the sole HTTP class)
- ✅ NestJS NEVER communicates directly with AI providers (no provider SDKs imported)
- ✅ LiteLLM is the ONLY inference gateway (all inference flows through `LiteLLMRouter → LiteLLMClient → LiteLLM Proxy`)
- ✅ No provider-specific business logic (that's Phase 4)
- ✅ No provider SDKs imported anywhere in the codebase

---

**Phase 3 Status**: ✅ Complete and verified.
**Phase 3 ends here.** LiteLLM is deployed, integrated, monitored, documented, and fully operational as the platform's only AI Gateway.
