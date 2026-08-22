# 🚀 MODULE 18: Full System Deployment & Cloud Operations Guide

Welcome to the official deployment and operations manual for **RiskRadar**—an industrial safety risk-intelligence platform. This guide details how to deploy, configure, warm up, and execute the full end-to-end hackathon demo using **Neon Postgres**, **Render**, **Vercel**, and **Clerk**.

---

## 🌐 1. Production Live Service URLs

| Service Layer | Cloud Provider | Production URL |
| :--- | :--- | :--- |
| **Frontend Web Application** | Vercel | `https://risk-rader.vercel.app` |
| **FastAPI Backend Services** | Render (Free Web Service) | `https://riskradar-backend.onrender.com` |
| **Health Check & DB Ping** | Render | `https://riskradar-backend.onrender.com/api/v1/health` |
| **Database Server** | Neon Postgres (Serverless) | `ep-sample-neon.eastus2.aws.neon.tech` |
| **Source Code Repository** | GitHub | `https://github.com/P-Akshay-kumar/RiskRader.git` |

---

## 🔑 2. Required Environment Variables Matrix

### A. FastAPI Backend Environment Variables (Render Dashboard)
Configure these environment variables under **Render Dashboard → Services → riskradar-backend → Environment**:

| Key | Example / Required Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql+asyncpg://user:pass@ep-sample-neon.aws.neon.tech/neondb?sslmode=require` | Async Neon Postgres connection string |
| `CLERK_SECRET_KEY` | `sk_live_...` or `sk_test_...` | Clerk backend secret key for JWT verification |
| `LLM_BACKEND` | `gemini` | Explicitly set to `gemini` for production cloud inference |
| `GOOGLE_API_KEY` | `AIzaSy...` | Gemini Pro API key for grounded RAG explanations |
| `RESEND_API_KEY` | `re_123456789` | Resend API key for lead capture notifications |
| `FRONTEND_ORIGIN` | `https://risk-rader.vercel.app` | CORS strict origin restriction |
| `WHATSAPP_NUMBER` | `+15550192837` | Lead contact WhatsApp link target |
| `ENVIRONMENT` | `production` | Enables strict authentication enforcement |

### B. Next.js Frontend Environment Variables (Vercel Dashboard)
Configure these environment variables under **Vercel Project Settings → Environment Variables**:

| Key | Example / Required Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://riskradar-backend.onrender.com` | Points Next.js frontend to Render backend API |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` | Public key for Clerk authentication widgets |

---

## 🛠️ 3. Step-by-Step Deployment Instructions

### Step 1: Provision & Migrate Neon Postgres Database
1. Log into [Neon Console](https://console.neon.tech) and create a new project named **`riskradar-prod`**.
2. Copy the Async Postgres Connection String (`postgresql+asyncpg://...`).
3. Execute the automated migration, RLS policy enforcement, and seed script locally pointing to Neon:
   ```bash
   export DATABASE_URL="postgresql+asyncpg://<USER>:<PASSWORD>@<HOST>/neondb?sslmode=require"
   python -m scripts.deploy_db
   ```
4. Verify that Row-Level Security (RLS) policies are active on `organizations`, `assets`, `risk_scores`, `alerts`, `audit_log`, and `auth_events`.

### Step 2: Deploy FastAPI Backend on Render
1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New + → Web Service** and select `https://github.com/P-Akshay-kumar/RiskRader.git`.
3. Configure service properties:
   - **Name**: `riskradar-backend`
   - **Environment**: `Python 3`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
4. Enter the environment variables listed in Section 2A.
5. Click **Create Web Service** and wait for deployment. Verify `GET /api/v1/health` returns `200 OK` with `status: "healthy"`.

### Step 3: Deploy Next.js Frontend on Vercel
1. Log into [Vercel Dashboard](https://vercel.com).
2. Import project `https://github.com/P-Akshay-kumar/RiskRader.git`.
3. Add environment variables `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
4. Click **Deploy**.

---

## ⚡ 4. Cold-Start Warm-Up Protocol (Demo Day)

Because Render free tier Web Services spin down after 15 minutes of inactivity, execute the cold-start warm-up protocol **2 minutes before your live hackathon demo**:

### Option A: Shell Script Warm-up
Run the included warm-up script from your terminal:
```bash
./scripts/warmup.sh https://riskradar-backend.onrender.com
```

### Option B: Manual Browser Warm-up
Open `https://riskradar-backend.onrender.com/api/v1/health` in your browser until it returns:
```json
{
  "status": "healthy",
  "database": "connected",
  "llm_backend": "gemini",
  "environment": "production"
}
```

---

## 🎯 5. End-to-End Live Hackathon Demo Walkthrough

Follow this exact 10-step sequence during live judging:

1. **Public Landing Page**: Navigate to `https://risk-radar-two.vercel.app`. Verify zero layout shift, spacious typography, and modern dark aesthetics.
2. **Submit Lead Form**: Scroll to **Request Facility Demo** or click CTA button, submit full name, work email, and facility details. Confirm success notification.
3. **WhatsApp Safety Specialist**: Click the floating WhatsApp button in the bottom right corner.
4. **Sign In**: Click **Sign In** in the navigation header to authenticate via Clerk.
5. **Role Identity Selection**: Click the **RBAC Role Pill** in the header and switch between **Safety Manager**, **Lead Inspector**, and **Compliance Auditor**.
6. **Upload Telemetry Dataset**: Go to Operator Dashboard, open **Upload Dataset**, select sample CSV file, and process through the pipeline.
7. **Ranked Risk Queue & RAG Explanations**: Observe updated asset risk rankings, fused Rule + XGBoost score breakdown, and grounded RAG SOP mitigation steps.
8. **Acknowledge Alert as Inspector**: Switch active role to **Lead Inspector** and click **Acknowledge Alert**. Confirm row is updated with inspector user ID.
9. **Verify Separation of Duties (403 Access Denial)**: Attempt to trigger an Admin-only pipeline run or override as Inspector. Confirm clear 403 Forbidden alert message.
10. **Export PDF & Verify Audit Ledger**: Click **Export PDF Report** to download the signed facility summary, then navigate to `/dashboard/audit` to inspect the SHA-256 tamper-evident audit ledger.
