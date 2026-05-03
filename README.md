<p align="center">
  <img src="frontend/public/banner.png" alt="Vortex-Gen Banner" width="100%">
</p>

# 🌀 Vortex-Gen — Aerodynamic Simulation Platform

> **Live:** [vortex-gen.vercel.app](https://vortex-gen.vercel.app) · **API:** [2jaefar-production.up.railway.app](https://2jaefar-production.up.railway.app/api/status)

**Vortex-Gen** is a full-stack, production-grade aerodynamic simulation platform designed for aerospace engineering students, researchers, and hobbyists. It combines an interactive WebGL-based visualization with a powerful Python neural-network backend (**NeuralFoil**) to deliver real-time fluid dynamics predictions. 

With the latest transition into a **Feature-Based Architecture**, Vortex-Gen now offers dedicated pedagogical modules (Academy), interactive Lab Manuals, dual-geometry Compare modes, and robust 3D STL & multi-page PDF generation features.

---

## 🏗️ Infrastructure Overview

| Service | URL | Role |
|---|---|---|
| **GitHub** | `github.com/yOuSSefOSS/2jaefar` | Source of truth & CI/CD trigger |
| **Vercel** | `vortex-gen.vercel.app` | Frontend hosting (React SPA) |
| **Railway** | `2jaefar-production.up.railway.app` | Backend (Node.js + Python daemon) |
| **Supabase** | `dashboard.supabase.com` | Authentication + PostgreSQL database |
| **Stripe** | `dashboard.stripe.com` | Payments & subscription webhooks |
| **Resend** | `resend.com` | Transactional email on upgrade |

Every push to `main` auto-deploys to both Vercel and Railway. No manual deploy steps required.

---

## 💻 Tech Stack

### Frontend (`frontend/`)
- **React 19 + Vite + TypeScript/JSX** — UI framework and lightning-fast build tool.
- **Tailwind CSS v4** — Utility-first, heavily customized glassmorphism design system.
- **Framer Motion** — Spring-physics micro-animations, layout transitions, and interactive Modals.
- **Recharts** — SVG charts for Lift (Cl vs AoA), Drag (Cd vs AoA), and Drag Polars.
- **Three.js / React-Three-Fiber** — WebGL particle flow engine for 3D aerodynamic visualization.
- **jsPDF + html2canvas** — Client-side multi-page PDF analytical report generation.
- **Supabase JS SDK** — Client-side JWT-based authentication.

### Backend (`backend/`)
- **Node.js + Express** — REST API gateway and authorization middleware.
- **Python 3 + NeuralFoil (PyTorch)** — Deep-learning surrogate model for millisecond aerodynamic coefficient prediction.
- **IPC Protocol** — High-performance JSON communication over `stdin`/`stdout` between Node.js and the Python Daemon.
- **Supabase Admin SDK** — Server-side profile & subscription management.
- **Stripe SDK** — Hosted checkout session creation and webhook signature verification.
- **Resend API** — Dynamic Welcome/Upgrade email delivery.

---

## ✨ Features

### 🏫 Academy & Explorer
- **Interactive Aircraft Map** — Clickable 3D-styled aircraft mapping to Fuselage, Wings, and Airfoil subsystems.
- **Pedagogical Walkthroughs** — Dedicated learning sections detailing engineering specifications (e.g., Hoop stress for Fuselage, Sweep angles for Wings).

### 🌬️ Wind Tunnel Lab & Simulation Engine
- 🚀 **Real-Time 3D CFD Visualization** — Interactive WebGL particle flow engine highlighting dynamic pressure heatmaps.
- 🧠 **NeuralFoil AI Backend** — Accurately predicts Cl/Cd coefficients in milliseconds using a PyTorch surrogate model.
- 📊 **Interactive Charts** — Live Lift Coefficient, Drag Coefficient, and Drag Polar with integrated stall zone markers.
- 📖 **Interactive Lab Manual** — Step-by-step animated walkthrough guiding users through Geometry Selection, Flight Controls, and Environment Setup.

### ⚖️ Compare Mode & Analytics
- **Side-by-Side Comparison** — Load a second geometry (Airfoil B) alongside the primary shape.
- **Dual Chart Sets** — Distinct Cl, Cd, and force metrics for both geometries plotted simultaneously.
- **Overlay Comparison Charts** — Superimposed dual-line charts with labeled legends for rigorous A/B testing.

### 🛠️ Airfoil Tools & Artifacts
- 📥 **Custom Airfoil Import** — Upload standard Selig `.dat` or `.csv` coordinate files directly into the Wind Tunnel.
- 📦 **3D STL Export** — Extract any airfoil as a 3D-printable STL with dynamic span/chord presets (Drone, Plane Section, Custom).
- 📄 **Multi-Page PDF Reports** — High-fidelity branded analytical PDFs including airfoil geometry, environment parameters, and Cl/Cd charts. (Expands to 3 pages during Compare Mode).

### 🤖 Autotune & Intelligence
- ⚡ **Fast Tune** — Sweeps NACA 4-digit candidates to find the highest-Cl airfoil for a target AoA range (Pro).
- 🔬 **Deep Tune** — Exhaustive large-model sweep for maximum precision (Pro Max).
- 🏆 **Golden Lift Mode** — Highlights the optimal lift-to-drag angle with a visual golden glow.
- 🔊 **Stall Audio Alarm** — Configurable audio alert when pitch crosses the stall threshold.

### 🔐 Subscription & Auth
- 🔐 **Supabase Authentication** — Email/password login and one-click Google OAuth.
- 💳 **Stripe Subscriptions** — Tiered billing (Free / Pro / Pro Max) seamlessly synced to user profiles.
- 🛡️ **Backend Auth Middleware** — All API routes validate Supabase JWTs server-side via RLS and Gateway checks.

---

## 🔄 Data Flow Architecture

```text
User visits Vercel → React App (Vite) loads
         ↓
Supabase Auth → JWT issued → AppContext loads user tier
         ↓
User selects Airfoil & configures Wind Speed / Density
         ↓
POST /api/analyze → Railway (Express) validates JWT
         ↓
Node.js converts req to JSON → pipes to Python NeuralFoil Daemon (stdin)
         ↓
Python calculates pyTorch inferences → writes result array to stdout
         ↓
Recharts & Three.js consume data for Live UI updates
```

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/status` | None | Service health check & Python Daemon status |
| `POST` | `/api/analyze` | Yes (Pro+) | Proxies requests to NeuralFoil engine |
| `POST` | `/api/increment-import` | Yes | Tracks user imports, enforces tier limits |
| `POST` | `/api/create-checkout-session` | Yes | Initializes Stripe Hosted Checkout |
| `POST` | `/api/webhooks/stripe` | Stripe Sig | Handles Stripe events (checkout completed) |
| `POST` | `/api/log` | None | Browser error relay for remote debugging |

---

## 💎 Subscription Tiers

| Feature | Free | Pro | Pro Max |
|---|---|---|---|
| Basic simulation (local analytic model) | ✅ | ✅ | ✅ |
| NeuralFoil PyTorch solver | ❌ | ✅ | ✅ |
| Custom Airfoil `.dat` Imports | 1 / month | 10 / month | Unlimited |
| Particle flow (High Fidelity WebGL) | ❌ | ❌ | ✅ |
| Fast Tune Optimizer | ❌ | ✅ | ✅ |
| Deep Tune Optimizer | ❌ | ❌ | ✅ |
| Side-by-Side Compare Mode | ✅ | ✅ | ✅ |
| PDF Report & 3D STL Export | ✅ | ✅ | ✅ |

---

## 📁 Folder Structure (Feature-Based Architecture)

The application has transitioned to a highly scalable, domain-driven structure mapping UI, logic, and state into distinct feature folders (`src/features/*`).

```
├── backend/
│   ├── run_nf.py              # Python NeuralFoil daemon (stdin/stdout protocol)
│   ├── server.js              # Express API, auth middleware, Stripe & Resend logic
│   ├── Dockerfile             # Docker config for Railway deployment
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Backend env variable reference
│   └── package.json
│
├── frontend/
│   ├── public/                # Static assets (banner, icons, favicon)
│   └── src/
│       ├── assets/            # Images, SVGs, and branding assets
│       ├── components/        # Shared UI components and global modals
│       ├── config/            # Constants and configuration
│       ├── context/           # AppContext (global state for Auth/Tier)
│       ├── features/          # New Feature-Based Architecture (Next-Gen TS)
│       │   ├── academy/       # Educational modules (Airfoil, Fuselage, Wings)
│       │   ├── auth/          # Authentication flows
│       │   ├── lab/           # Aerodynamic simulation lab core
│       │   ├── landing/       # Landing page module
│       │   ├── pricing/       # Subscription plans
│       │   ├── profile/       # User profile and hangar
│       │   └── settings/      # App settings
│       ├── hooks/             # Custom React hooks
│       ├── i18n/              # Internationalization (en, ar)
│       ├── layouts/           # Page wrappers (DashboardLayout, ExplorerLayout)
│       ├── lib/               # Utility functions, API and Supabase clients
│       ├── pages/             # Legacy JSX pages (Home, Login, Signup, Explorer)
│       ├── services/          # API Services
│       ├── store/             # State management stores
│       ├── styles/            # CSS Modules, Themes, Animations
│       ├── App.jsx / App.tsx
│       ├── main.jsx / main.tsx
│       └── index.css
│
├── vercel.json                # Vercel deployment config
├── start_servers.bat          # Windows: starts frontend + backend together
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- Python 3.9+

### 1. Clone & Install
```bash
git clone https://github.com/yOuSSefOSS/2jaefar.git
cd 2jaefar
```

### 2. Backend
```bash
cd backend
npm install

# Python virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install neuralfoil numpy

cp .env.example .env
node server.js
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` — you are **automatically logged in** as a `pro_max` dev user. No Supabase credentials required locally.

### Windows Shortcut
```bash
start_servers.bat   # Launches both servers from project root
```

---

## 🔮 Roadmap

- [ ] **Multiple Choice Questionnaires (MCQs):** Integration of 6 interactive MCQ sets per lab module for enhanced pedagogical assessment.
- [ ] **Volumetric Smoke Trails:** Implementation of turbulence wake visualization in Three.js.
- [ ] **Multi-Wing Assembly:** Simulating full wing configurations beyond standard 2D airfoils.
- [ ] **Testing Suite:** Vitest + React Testing Library coverage.
