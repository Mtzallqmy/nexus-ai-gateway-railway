-- ============================================================
-- Migration 0002: LiteLLM Integration Tables (Phase 3)
-- ============================================================
-- Adds 9 new tables for LiteLLM proxy integration:
--   litellm_providers
--   litellm_provider_connections
--   litellm_provider_configurations
--   litellm_provider_health
--   litellm_provider_statistics
--   litellm_provider_metrics
--   litellm_model_cache
--   litellm_usage_counters
--   litellm_sync_history
-- ============================================================

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('OPENAI', 'ANTHROPIC', 'GOOGLE', 'MISTRAL', 'COHERE', 'AZURE', 'AWS', 'HUGGINGFACE', 'OPENROUTER', 'NVIDIA', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ProviderConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'ERROR', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "SyncEntityType" AS ENUM ('PROVIDERS', 'MODELS', 'CAPABILITIES', 'METADATA', 'VERSIONS', 'ALL');

-- CreateEnum
CREATE TYPE "CircuitBreakerState" AS ENUM ('CLOSED', 'OPEN', 'HALF_OPEN');

-- CreateEnum
CREATE TYPE "HealthCheckType" AS ENUM ('LIVENESS', 'READINESS', 'FULL');

-- CreateTable
CREATE TABLE "litellm_providers" (
    "id" UUID NOT NULL,
    "litellmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ProviderType" NOT NULL DEFAULT 'CUSTOM',
    "description" TEXT,
    "baseUrl" TEXT,
    "status" "ProviderConnectionStatus" NOT NULL DEFAULT 'UNKNOWN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "supportedFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "region" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "litellm_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "litellm_provider_connections" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "alias" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "apiKeyMasked" TEXT NOT NULL,
    "apiKeyHash" TEXT NOT NULL,
    "headers" JSONB NOT NULL DEFAULT '{}',
    "status" "ProviderConnectionStatus" NOT NULL DEFAULT 'UNKNOWN',
    "lastConnectedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "latencyMs" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "litellm_provider_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "litellm_provider_configurations" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "configKey" TEXT NOT NULL,
    "configValue" JSONB NOT NULL,
    "configType" "ConfigType" NOT NULL DEFAULT 'STRING',
    "description" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "isReadonly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "litellm_provider_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "litellm_provider_health" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "status" "HealthStatus" NOT NULL DEFAULT 'HEALTHY',
    "checkType" "HealthCheckType" NOT NULL DEFAULT 'FULL',
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "circuitState" "CircuitBreakerState" NOT NULL DEFAULT 'CLOSED',
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "litellm_provider_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "litellm_provider_statistics" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "requestCount" BIGINT NOT NULL DEFAULT 0,
    "successCount" BIGINT NOT NULL DEFAULT 0,
    "errorCount" BIGINT NOT NULL DEFAULT 0,
    "tokenCount" BIGINT NOT NULL DEFAULT 0,
    "inputTokens" BIGINT NOT NULL DEFAULT 0,
    "outputTokens" BIGINT NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "avgLatencyMs" INTEGER NOT NULL DEFAULT 0,
    "p50LatencyMs" INTEGER NOT NULL DEFAULT 0,
    "p95LatencyMs" INTEGER NOT NULL DEFAULT 0,
    "p99LatencyMs" INTEGER NOT NULL DEFAULT 0,
    "cacheHitRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "litellm_provider_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "litellm_provider_metrics" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "metricUnit" TEXT,
    "labels" JSONB NOT NULL DEFAULT '{}',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "litellm_provider_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "litellm_model_cache" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "modelName" TEXT NOT NULL,
    "litellmModelId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "contextWindow" INTEGER,
    "maxOutput" INTEGER,
    "inputPricePer1k" DECIMAL(10,6),
    "outputPricePer1k" DECIMAL(10,6),
    "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modalities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "litellm_model_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "litellm_usage_counters" (
    "id" UUID NOT NULL,
    "providerId" UUID,
    "modelName" TEXT NOT NULL,
    "userId" UUID,
    "apiKeyId" UUID,
    "organizationId" UUID,
    "requestCount" BIGINT NOT NULL DEFAULT 0,
    "tokenCount" BIGINT NOT NULL DEFAULT 0,
    "inputTokens" BIGINT NOT NULL DEFAULT 0,
    "outputTokens" BIGINT NOT NULL DEFAULT 0,
    "cacheHits" BIGINT NOT NULL DEFAULT 0,
    "cacheMisses" BIGINT NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "errorCount" BIGINT NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "litellm_usage_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "litellm_sync_history" (
    "id" UUID NOT NULL,
    "entityType" "SyncEntityType" NOT NULL,
    "status" "SyncStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "itemsProcessed" INTEGER NOT NULL DEFAULT 0,
    "itemsCreated" INTEGER NOT NULL DEFAULT 0,
    "itemsUpdated" INTEGER NOT NULL DEFAULT 0,
    "itemsDeleted" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "triggeredBy" TEXT NOT NULL DEFAULT 'system',
    "errorMessage" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "litellm_sync_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "litellm_providers_litellmId_key" ON "litellm_providers"("litellmId");
CREATE UNIQUE INDEX "litellm_providers_slug_key" ON "litellm_providers"("slug");
CREATE INDEX "litellm_providers_type_idx" ON "litellm_providers"("type");
CREATE INDEX "litellm_providers_status_idx" ON "litellm_providers"("status");
CREATE INDEX "litellm_providers_isActive_idx" ON "litellm_providers"("isActive");

CREATE UNIQUE INDEX "litellm_provider_connections_apiKeyHash_key" ON "litellm_provider_connections"("apiKeyHash");
CREATE INDEX "litellm_provider_connections_providerId_idx" ON "litellm_provider_connections"("providerId");
CREATE INDEX "litellm_provider_connections_status_idx" ON "litellm_provider_connections"("status");

CREATE UNIQUE INDEX "litellm_provider_configurations_providerId_configKey_key" ON "litellm_provider_configurations"("providerId", "configKey");
CREATE INDEX "litellm_provider_configurations_providerId_idx" ON "litellm_provider_configurations"("providerId");

CREATE INDEX "litellm_provider_health_providerId_checkedAt_idx" ON "litellm_provider_health"("providerId", "checkedAt");
CREATE INDEX "litellm_provider_health_status_idx" ON "litellm_provider_health"("status");

CREATE UNIQUE INDEX "litellm_provider_statistics_providerId_periodStart_periodEnd_key" ON "litellm_provider_statistics"("providerId", "periodStart", "periodEnd");
CREATE INDEX "litellm_provider_statistics_providerId_idx" ON "litellm_provider_statistics"("providerId");
CREATE INDEX "litellm_provider_statistics_periodStart_idx" ON "litellm_provider_statistics"("periodStart");

CREATE INDEX "litellm_provider_metrics_providerId_metricName_recordedAt_idx" ON "litellm_provider_metrics"("providerId", "metricName", "recordedAt");
CREATE INDEX "litellm_provider_metrics_metricName_idx" ON "litellm_provider_metrics"("metricName");

CREATE UNIQUE INDEX "litellm_model_cache_providerId_modelName_key" ON "litellm_model_cache"("providerId", "modelName");
CREATE INDEX "litellm_model_cache_providerId_idx" ON "litellm_model_cache"("providerId");
CREATE INDEX "litellm_model_cache_modelName_idx" ON "litellm_model_cache"("modelName");
CREATE INDEX "litellm_model_cache_isActive_idx" ON "litellm_model_cache"("isActive");

CREATE INDEX "litellm_usage_counters_providerId_periodStart_idx" ON "litellm_usage_counters"("providerId", "periodStart");
CREATE INDEX "litellm_usage_counters_modelName_idx" ON "litellm_usage_counters"("modelName");
CREATE INDEX "litellm_usage_counters_userId_idx" ON "litellm_usage_counters"("userId");
CREATE INDEX "litellm_usage_counters_organizationId_idx" ON "litellm_usage_counters"("organizationId");

CREATE INDEX "litellm_sync_history_entityType_status_idx" ON "litellm_sync_history"("entityType", "status");
CREATE INDEX "litellm_sync_history_startedAt_idx" ON "litellm_sync_history"("startedAt");
CREATE INDEX "litellm_sync_history_status_idx" ON "litellm_sync_history"("status");

-- AddForeignKey
ALTER TABLE "litellm_provider_connections" ADD CONSTRAINT "litellm_provider_connections_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "litellm_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "litellm_provider_configurations" ADD CONSTRAINT "litellm_provider_configurations_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "litellm_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "litellm_provider_health" ADD CONSTRAINT "litellm_provider_health_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "litellm_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "litellm_provider_statistics" ADD CONSTRAINT "litellm_provider_statistics_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "litellm_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "litellm_provider_metrics" ADD CONSTRAINT "litellm_provider_metrics_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "litellm_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "litellm_model_cache" ADD CONSTRAINT "litellm_model_cache_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "litellm_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
