# Build stage
FROM node:25-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Lint and build
RUN npm run lint && npm run build

# Production stage with Caddy
FROM caddy:2-alpine

# Copy built files
COPY --from=builder /app/dist /srv

# Copy Caddyfile
COPY Caddyfile.frontend /etc/caddy/Caddyfile

# Expose port 80
EXPOSE 80

# Caddy runs automatically
