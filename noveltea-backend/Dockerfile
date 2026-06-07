# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Copy dependency manifests first (better layer caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy source
COPY . .

# Create uploads directory (persisted via volume in compose)
RUN mkdir -p uploads

# ── Runtime ───────────────────────────────────────────────────────────────────
EXPOSE 5000

# Run as non-root for security
USER node

CMD ["node", "index.js"]
