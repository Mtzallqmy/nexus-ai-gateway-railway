# ============================================================
# LiteLLM Standalone Service — Dockerfile
# ============================================================
# Uses the official LiteLLM Docker image.
# We do NOT modify LiteLLM source code.
# ============================================================

FROM ghcr.io/berriai/litellm:main-stable

WORKDIR /app

# Copy our proxy configuration
COPY proxy_config.yaml /app/proxy_config.yaml

# Expose LiteLLM proxy port (default 4000)
EXPOSE 4000

# Healthcheck against LiteLLM's built-in /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:4000/health/liveness || exit 1

# Run the LiteLLM proxy with our config
CMD ["--config", "/app/proxy_config.yaml", "--port", "4000", "--num_workers", "4"]
