# Future Health - Production Deployment & Operations Guide

## 1. System Overview & Deployment Topology

Future Health is an enterprise-grade digital health ecosystem composed of:
1. **Frontend Web Portal**: Next.js 15 (React 19, Tailwind CSS, Turborepo) deployable on Vercel or as a standalone Docker container.
2. **Mobile Application**: Stanford Spezi React Native (Expo SDK 51+) deployable to iOS TestFlight / App Store and Google Play via EAS Build.
3. **Database & Auth Backend**: Supabase (PostgreSQL 16, Row Level Security, Realtime, Storage, Auth).
4. **Clinical Decision Support (CDS) Microservice**: Python 3.11+ FastAPI service containerized with PyTorch & Scikit-Learn.
5. **HL7 FHIR R4 Interoperability Gateway**: Node.js native microservice providing CapabilityStatement, searchset bundles, and batch transactions.

```
                              ┌─────────────────────────────────────────┐
                              │            Cloudflare / CDN             │
                              └────────────────────┬────────────────────┘
                                                   │
                   ┌───────────────────────────────┼──────────────────────────────┐
                   │                               │                              │
                   ▼                               ▼                              ▼
      ┌─────────────────────────┐    ┌───────────────────────────┐  ┌─────────────────────────┐
      │     Next.js 15 Web      │    │    Spezi React Native     │  │   FHIR Gateway (8080)   │
      │   (Patients/Clinicians/ │    │      (iOS & Android)      │  │  (HL7 FHIR R4 Interop)  │
      │       Researchers)      │    │                           │  └────────────┬────────────┘
      └────────────┬────────────┘    └─────────────┬─────────────┘               │
                   │                               │                             │
                   └───────────────────────┬───────┴─────────────────────────────┘
                                           │
                                           ▼
                             ┌───────────────────────────┐
                             │    Supabase Enterprise    │
                             │  (PostgreSQL 16 + RLS)    │
                             └─────────────┬─────────────┘
                                           │
                                           ▼
                             ┌───────────────────────────┐
                             │   FastAPI AI CDS (8000)   │
                             │   (Screening & Anomaly)   │
                             └───────────────────────────┘
```

---

## 2. Environment Variables Configuration

### 2.1 Web Portal (`apps/web/.env.production`)
```bash
# Public Client Keys (Safe to expose to browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_AI_ENGINE_URL=https://ai.yourdomain.com
NEXT_PUBLIC_FHIR_GATEWAY_URL=https://fhir.yourdomain.com

# Server-Side Only Secrets (Never expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.2 Mobile Application (`apps/mobile/.env`)
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_AI_ENGINE_URL=https://ai.yourdomain.com
```

### 2.3 AI Microservice (`services/ai-engine/.env`)
```bash
ENVIRONMENT=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-chars-long
MODEL_VERSION=v1.0.0-clinical
PORT=8000
```

### 2.4 FHIR Gateway (`services/fhir-gateway/.env`)
```bash
NODE_ENV=production
PORT=8080
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. Database Deployment (Supabase & PostgreSQL 16)

### 3.1 Initial Migration
Apply the database migration located at `supabase/migrations/00001_initial_schema.sql`:

```bash
# Using Supabase CLI
supabase db reset --linked
# Or execute migrations directly in PostgreSQL:
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/migrations/00001_initial_schema.sql
```

### 3.2 Verification Checklist
Verify that:
1. All 17 tables are created (`profiles`, `observations`, `patient_consents`, `risk_assessments`, etc.).
2. The trigger `trg_profile_display_name` is active.
3. Row Level Security is `ENABLED` on all 17 tables.
4. The de-identified research view `deidentified_research_observations` exists and grants `SELECT` to role `authenticated`.

---

## 4. Web Application Deployment (Next.js 15)

### Option A: Vercel (Recommended)
1. Link repository to Vercel.
2. Set Root Directory to: `apps/web`.
3. Set Framework Preset: `Next.js`.
4. Configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
5. Deploy.

### Option B: Docker Standalone
```bash
# Build production Docker image
docker build -t future-health-web -f apps/web/Dockerfile .

# Run container
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGci..." \
  --name future-health-web future-health-web
```

---

## 5. Mobile Application Deployment (Spezi React Native)

### 5.1 iOS (Apple App Store / TestFlight)
1. Configure `apps/mobile/app.json` with Bundle ID (`com.futurehealth.patient`).
2. Run EAS Credentials configuration:
   ```bash
   cd apps/mobile
   eas credentials -p ios
   ```
3. Trigger production build:
   ```bash
   eas build --platform ios --profile production
   ```
4. Submit to TestFlight:
   ```bash
   eas submit -p ios --latest
   ```

### 5.2 Android (Google Play Store)
1. Configure package name (`com.futurehealth.patient`).
2. Generate Keystore via EAS:
   ```bash
   eas credentials -p android
   ```
3. Trigger AAB production build:
   ```bash
   eas build --platform android --profile production
   ```
4. Submit to Google Play Internal Testing:
   ```bash
   eas submit -p android --latest
   ```

---

## 6. Microservices Deployment with Docker Compose

To deploy all backend services locally or on a VPS (Linux x86_64 / arm64):

```bash
# 1. Clone repository
git clone https://github.com/your-org/future-health.git
cd future-health

# 2. Configure .env file
cp .env.example .env

# 3. Build and launch services in background
docker compose up -d --build

# 4. Check service status and health checks
docker compose ps
```

Healthcheck endpoints:
* Web Portal: `http://localhost:3000`
* AI CDS Microservice: `http://localhost:8000/health`
* FHIR Interoperability Gateway: `http://localhost:8080/health`

