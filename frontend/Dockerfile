# Frontend Dockerfile - Next.js 16
# Multi-stage build for production

# Stage 1: Dependencies
# Using Node.js 22 LTS (latest) for Next.js 16
FROM node:22-alpine AS deps
WORKDIR /app

# Update npm to latest version (11.6.2+) for better compatibility
RUN npm install -g npm@latest

# Copy package files and scripts (needed for postinstall hook)
COPY package.json package-lock.json ./
COPY scripts ./scripts

# Ensure devDependencies are installed (TypeScript, @types/*, etc.) regardless of
# NODE_ENV that Render or the base image may set. Next.js build requires them.
ENV NODE_ENV=development
# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Stage 1b: Development image (no production build)
# This stage is used by docker-compose for local development so that
# we do NOT run `npm run build` during image build (which can fail or be slow).
FROM deps AS dev
WORKDIR /app

# Copy source code and configs needed for dev server
COPY tsconfig.json next.config.js tailwind.config.js postcss.config.mjs ./
COPY src ./src
COPY public ./public
COPY scripts ./scripts

# Copy entrypoint for development (kept outside /app so volume mounts don't override it)
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

EXPOSE 3000

# Entrypoint clears stale .next/dev/lock; then run dev server (Turbopack on port 3000; compose maps 4300:3000)
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

# Stage 2: Builder
# Using Node.js 22 LTS (latest) for better compatibility with Next.js 16
FROM node:22-alpine AS builder
WORKDIR /app

# Update npm to latest version (11.6.2+) for better compatibility
RUN npm install -g npm@latest

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (excluding .next, node_modules via .dockerignore)
# This ensures we don't copy local build artifacts - everything is built inside Docker
COPY package.json package-lock.json ./
COPY tsconfig.json next.config.js tailwind.config.js postcss.config.mjs ./
COPY src ./src
COPY public ./public
COPY scripts ./scripts

# Ensure .next directory doesn't exist (will be created during build)
RUN rm -rf .next || true

# Copy and set permissions for docker-entrypoint.sh (needed for development)
# Copy to /usr/local/bin so it's not overridden by volume mounts
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application
RUN npm run build

# Stage 3: Runner
# Using Node.js 22 LTS (latest) for better compatibility with Next.js 16
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Ensure npm matches engines requirement (>=11) to avoid EBADENGINE warnings
RUN npm install -g npm@latest

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy entrypoint for development mode (when using docker-compose)
# Copy to /usr/local/bin so it's not overridden by volume mounts
COPY --from=builder /usr/local/bin/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]


