# Frontend Dockerfile - Next.js 16
# Multi-stage build for production

# Stage 1: Dependencies
FROM oven/bun:1-alpine AS deps
WORKDIR /app

# Copy package files and scripts (needed for postinstall hook)
COPY package.json bun.lock ./
COPY scripts ./scripts

# Ensure devDependencies are installed (TypeScript, @types/*, etc.) regardless of
# NODE_ENV that CI/CD or the base image may set. Next.js build requires them.
ENV NODE_ENV=development
RUN bun install --frozen-lockfile

# Stage 1b: Development image (no production build)
# This stage is used by docker-compose for local development so that
# we do NOT run `bun run build` during image build (which can fail or be slow).
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
CMD ["bun", "run", "dev"]

# Stage 2: Builder
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (excluding .next, node_modules via .dockerignore)
COPY package.json bun.lock ./
COPY tsconfig.json next.config.js tailwind.config.js postcss.config.mjs ./
COPY src ./src
COPY public ./public
COPY scripts ./scripts

RUN rm -rf .next || true

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN bun run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /usr/local/bin/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
