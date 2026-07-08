# ============================================================
# Moataz AI Gateway Backend — Multi-stage Dockerfile
# ============================================================

# ---------- Stage 1: Base ----------
FROM node:20-slim AS base
ENV NODE_ENV=production
WORKDIR /app

# Install bun for faster installs
RUN npm install -g bun@latest

# ---------- Stage 2: Dependencies ----------
FROM base AS deps
COPY package.json bun.lock* ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile || bun install
RUN bunx prisma generate

# ---------- Stage 3: Builder ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bunx nest build
# Re-generate prisma client for the runtime stage (in case of platform diff)
RUN bunx prisma generate

# ---------- Stage 4: Runtime ----------
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Install openssl (required by Prisma) and curl (for healthcheck)
RUN apt-get update -y && \
    apt-get install -y openssl curl && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r moataz && useradd -r -g moataz -s /bin/bash moataz

# Copy built artifacts
COPY --from=builder --chown=moataz:moataz /app/dist ./dist
COPY --from=builder --chown=moataz:moataz /app/node_modules ./node_modules
COPY --from=builder --chown=moataz:moataz /app/prisma ./prisma
COPY --from=builder --chown=moataz:moataz /app/package.json ./

# Create logs directory
RUN mkdir -p /app/logs && chown -R moataz:moataz /app/logs

USER moataz

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/health/live || exit 1

CMD ["node", "dist/main.js"]
