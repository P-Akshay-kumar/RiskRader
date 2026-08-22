# RiskRadar — Predictive Industrial Safety Intelligence

RiskRadar is a B2B SaaS platform that predicts industrial safety risks (equipment failures, unsafe thermal/vibration conditions) before accidents happen, using a hybrid rule-based + machine learning risk engine and a retrieval-augmented (RAG) explanation layer grounded in real safety procedures (SOPs, OSHA 1910).

![RiskRadar Landing Page](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.11-violet?style=flat-square&logo=framer)
![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)

---

## Key Features

1. **Dual-Layer Risk Engine**:
   - **Layer 1**: Deterministic rule guardrails combined with XGBoost ensemble ML anomaly detection for 0% hallucination on physical safety thresholds.
   - **Layer 2**: RAG explanation layer citing exact clauses from internal plant SOPs, OEM manuals, and OSHA compliance standards.
2. **Interactive Risk Engine Sandbox**:
   - Live interactive slider interface allowing visitors and judges to adjust vibration, temperature, and maintenance lag to see real-time recalculation of risk scores and RAG SOP citations.
3. **5-Step Automated Workflow**:
   - Continuous Data Ingestion &rarr; Dual Engine Risk Scoring &rarr; RAG SOP Retrieval &rarr; Actionable Root Cause Recommendation &rarr; Priority Asset Queue.
4. **Industrial-Tech Design Aesthetic**:
   - High-contrast dark industrial background (`#090D16`), vibrant Safety Signal Amber (`#FF6B00` / `#F59E0B`), and Google Fonts **Space Grotesk** + **Inter**.
5. **Interactive Component Architecture**:
   - Sticky blur navigation, animated telemetry SVG dashboards, expandable architecture tabs, comparison matrix, and demo access modal.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Typography**: Google Fonts (`next/font/google`) — Space Grotesk & Inter

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Production Check
```bash
npm run build
npm run start
```

---

## Deployment to Vercel

This repository is pre-configured for zero-config deployment on Vercel.

### Option A: Using Vercel CLI
```bash
npm i -g vercel
vercel deploy
```

### Option B: GitHub Integration
1. Push this repository to GitHub.
2. Import the project into your Vercel Dashboard.
3. Vercel will automatically detect Next.js 14 and deploy with no environment variable requirements.

---

## Project Structure

```
.
├── app/
│   ├── globals.css         # Custom industrial glow & typography tokens
│   ├── layout.tsx          # Font imports, SEO metadata, HTML root
│   └── page.tsx            # Main page assembly (9 required sections)
├── components/
│   ├── Navbar.tsx          # Sticky navigation bar with mobile drawer
│   ├── Hero.tsx            # Headline, subhead, CTAs, value badges
│   ├── HeroDashboardMockup.tsx # Animated SVG telemetry risk dashboard
│   ├── ProblemSection.tsx  # Stat-driven industry pain point layout
│   ├── SolutionSection.tsx # Dual-layer architecture with interactive tabs
│   ├── WorkflowSection.tsx # 5-step visual pipeline flow
│   ├── FeaturesSection.tsx # 6 hover-elevated enterprise feature cards
│   ├── WhyDifferentSection.tsx # Comparative evaluation matrix
│   ├── InteractiveSimulator.tsx # Live sandbox telemetry simulator
│   ├── CtaBanner.tsx       # High-contrast CTA & demo email form
│   ├── Footer.tsx          # Compliance badges, links, copyright
│   └── DemoModal.tsx       # Interactive sandbox access modal
├── lib/
│   └── utils.ts            # ClassName merge helper (clsx + tailwind-merge)
├── tailwind.config.ts      # Industrial color system & custom keyframes
└── package.json
```
