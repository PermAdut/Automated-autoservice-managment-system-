# ==============================================================================
# AutoService Frontend — Multi-stage Dockerfile
# ==============================================================================

# ── Stage 1: Builder ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time env vars (baked into the JS bundle at build time)
ARG VITE_API_URL=http://localhost:3000
ARG VITE_APP_NAME=АвтоСервис

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Production (Nginx) ────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Copy built SPA
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing config (try_files fallback to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
