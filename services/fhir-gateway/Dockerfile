# Future Health - HL7 FHIR R4 Interoperability Gateway
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@11.6.0 --activate

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY services/fhir-gateway ./services/fhir-gateway
COPY packages/domain ./packages/domain
COPY packages/fhir ./packages/fhir
COPY tsconfig.base.json ./

RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @future-health/fhir-gateway build

# Runtime Stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fhiruser

COPY --from=builder /app/services/fhir-gateway/dist ./dist
COPY --from=builder /app/services/fhir-gateway/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

USER fhiruser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:8080/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]

