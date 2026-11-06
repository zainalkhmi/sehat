# Future Health - Next.js 15 Web Portal
FROM node:22-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.6.0 --activate

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/domain/package.json ./packages/domain/package.json
COPY packages/fhir/package.json ./packages/fhir/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/supabase-adapter/package.json ./packages/supabase-adapter/package.json
COPY packages/device-adapters/package.json ./packages/device-adapters/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/validation/package.json ./packages/validation/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json

RUN pnpm install --frozen-lockfile || pnpm install

# 2. Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.6.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm --filter future-health-web build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]

