# syntax=docker/dockerfile:1.7

# Frontend image: Vite build -> static assets served by nginx.
# Nginx also reverse-proxies /api, /admin, /static, /media to the backend service.

# ───── Build stage ─────
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first so changes to source don't bust the layer cache.
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --no-audit --no-fund

# Vite bakes VITE_* env vars at build time; pass them as build args.
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# ───── Runtime stage ─────
FROM nginx:1.27-alpine AS runtime

# Remove the default site and drop ours in.
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Default nginx CMD is fine.
