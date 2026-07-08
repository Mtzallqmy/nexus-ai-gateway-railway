# LiteLLM Standalone Service

This directory contains the **standalone LiteLLM proxy service** for the Moataz AI Gateway platform.

## Important

- LiteLLM is an **independent open-source project** (https://github.com/BerriAI/litellm)
- We use the **official Docker image** — we do NOT fork or modify LiteLLM source code
- LiteLLM is deployed as a **separate service** in Docker Compose
- The NestJS backend communicates **only** with LiteLLM, never directly with AI providers
- All inference traffic flows through LiteLLM

## Files

| File | Purpose |
|---|---|
| `proxy_config.yaml` | Official LiteLLM proxy configuration (model_list, router_settings, litellm_settings) |
| `Dockerfile` | Builds the LiteLLM container from the official image |
| `.env.example` | Environment variables consumed by LiteLLM (provider API keys, DB URL, master key) |

## Architecture

```
Frontend (Next.js)
    ↓
Backend (NestJS)  ←→  Database (PostgreSQL) + Cache (Redis)
    ↓
LiteLLM Proxy (THIS SERVICE)
    ↓
AI Providers (OpenAI, Anthropic, Google, Mistral, ...)
```

## Local Development

LiteLLM is started automatically by the root `docker-compose.yml`:

```bash
cd /home/z/my-project
docker compose up -d
```

Or run LiteLLM standalone:

```bash
cd services/litellm
cp .env.example .env
# Fill in real API keys
docker build -t moataz-litellm .
docker run -p 4000:4000 --env-file .env moataz-litellm
```

## Endpoints (LiteLLM native)

Once running, LiteLLM exposes:

- `GET http://localhost:4000/health/liveness` — liveness probe
- `GET http://localhost:4000/health/readiness` — readiness probe
- `GET http://localhost:4000/v1/models` — list configured models
- `POST http://localhost:4000/v1/chat/completions` — chat completions
- `POST http://localhost:4000/v1/embeddings` — embeddings
- `POST http://localhost:4000/key/generate` — generate virtual keys (admin)

All requests require `Authorization: Bearer <LITELLM_MASTER_KEY>`.

## Configuration Reference

See the official LiteLLM documentation:
- Config file format: https://docs.litellm.ai/docs/proxy/configs
- Router settings: https://docs.litellm.ai/docs/routing
- Virtual keys: https://docs.litellm.ai/docs/proxy/virtual_keys
- Caching: https://docs.litellm.ai/docs/proxy/caching
