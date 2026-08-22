# RiskRadar — Real-Time Industrial Risk Intelligence

RiskRadar is a B2B industrial safety risk-intelligence system that predicts equipment failures and unsafe conditions before accidents happen, combining a hybrid deterministic rule + XGBoost risk engine with a retrieval-augmented (RAG) explanation layer grounded in real plant safety SOPs.

---

## 🌐 Production Deployment & Live URLs

For complete step-by-step instructions on Neon Postgres provisioning, Render Web Service setup, Vercel frontend deployment, and Clerk authentication, see [DEPLOYMENT.md](DEPLOYMENT.md).

| Service Layer | Provider | Live URL |
| :--- | :--- | :--- |
| **Frontend App** | Vercel | `https://risk-rader.vercel.app` |
| **FastAPI Backend** | Render | `https://riskradar-backend.onrender.com` |
| **Health API** | Render | `https://riskradar-backend.onrender.com/api/v1/health` |
| **GitHub Repo** | GitHub | `https://github.com/P-Akshay-kumar/RiskRader.git` |

---

## ⚡ Cold-Start Mitigation Protocol (Live Demo Warm-Up)

Render's free tier spins down Web Services after 15 minutes of inactivity. **Run this warm-up script 2 minutes before a live demo or judging presentation**:

```bash
./scripts/warmup.sh https://riskradar-backend.onrender.com
```

Or manually open `https://riskradar-backend.onrender.com/api/v1/health` in your browser until it returns `200 OK`.

---

## 🛠️ Local Development & Testing

### 1. Run FastAPI Backend
```bash
source venv/bin/activate
uvicorn api.main:app --reload --port 8000
```

### 2. Run Next.js Frontend
```bash
npm run dev
```

### 3. Run Pytest Suite
```bash
venv/bin/pytest
```

---

## 📄 License & Compliance
Built for the **Industry Hack 2026** under zero-tolerance industrial safety standards. All audit logs are cryptographically bound via SHA-256 ledgers and Postgres Row-Level Security (RLS).
