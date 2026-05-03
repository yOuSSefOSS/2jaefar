<p align="center">
  <img src="frontend/public/banner.png" alt="Vortex-Gen Banner" width="100%">
</p>

# 🌀 Vortex-Gen — Aerodynamic Simulation Platform

> **Live:** [vortex-gen.vercel.app](https://vortex-gen.vercel.app) · **API:** [2jaefar-production.up.railway.app](https://2jaefar-production.up.railway.app/api/status)

**Vortex-Gen** is a full-stack, production-grade aerodynamic simulation platform for engineering students, researchers, and aerospace enthusiasts. Users can select or import airfoil geometries, run fluid-dynamics simulations powered by a Python NeuralFoil AI engine, visualize interactive charts, compare airfoils side-by-side, export 3D STL files, and generate multi-page PDF analysis reports — all from a premium glassmorphism dashboard.

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
- **React 19 + Vite** — UI framework and build tool
- **Tailwind CSS v4** — Utility-first glassmorphism design system
- **Framer Motion** — Spring-physics micro-animations and page transitions
- **Recharts** — SVG charts for Cl vs AoA, Cd vs AoA, and drag polar
- **Three.js / React-Three-Fiber** — WebGL particle flow engine and airfoil simulation view
- **jsPDF + html2canvas** — Client-side multi-page PDF report generation
- **Supabase JS SDK** — Client-side authentication

### Backend (`backend/`)
- **Node.js + Express** — REST API gateway and auth middleware
- **Python 3 + NeuralFoil (PyTorch)** — Deep-learning surrogate model for aerodynamic coefficient prediction
- **Supabase Admin SDK** — Server-side user & subscription management
- **Stripe SDK** — Checkout session creation and webhook verification
- **Resend API** — Welcome email delivery

---

## ✨ Features

### Simulation Engine
- 🚀 **Real-Time 3D CFD Visualization** — Interactive WebGL particle flow engine with dynamic pressure heatmaps
- 🧠 **NeuralFoil AI Backend** — Predicts Cl/Cd coefficients in milliseconds using a trained ML surrogate
- 📊 **Interactive Charts** — Live Lift Coefficient (Cl vs AoA), Drag Coefficient (Cd vs AoA), and Drag Polar with stall zone markers
- ⚡ **Local Fallback Model** — Accurate NACA 4-digit analytical model for free-tier users

### Airfoil Tools
- 📥 **Custom Airfoil Import** — Upload standard Selig `.dat` coordinate files
- 📦 **3D STL Export** — Export any airfoil as a 3D-printable STL with configurable span/chord presets (Drone, Plane Section, Custom)
- 📄 **Multi-Page PDF Reports** — Branded analytical PDF including airfoil geometry, environment parameters, and Cl/Cd charts

### Compare Mode
- ⚖️ **Side-by-Side Comparison** — Toggle compare mode to select a second airfoil
- 📊 **Dual Chart Sets** — Each airfoil gets its own dedicated Cl, Cd, and polar chart section
- 🔀 **Overlay Comparison Charts** — Superimposed dual-line charts with labeled legends
- 📄 **Comparison PDF Export** — In compare mode the PDF expands to 3 pages: Primary, Compare, and Comparison Overview

### Autotune
- ⚡ **Fast Tune** — Sweeps NACA 4-digit candidates to find the highest-Cl airfoil for a target AoA range (Pro)
- 🔬 **Deep Tune** — Exhaustive large-model sweep for maximum precision (Pro Max)
- 🏆 **Golden Lift Mode** — Highlights the optimal lift angle with a visual golden glow

### Subscription & Auth
- 🔐 **Supabase Authentication** — Email/password login with JWT-based sessions
- 💳 **Stripe Subscriptions** — Tiered billing (Free / Pro / Pro Max) with hosted Stripe checkout
- 📧 **Welcome Emails** — Branded HTML emails sent automatically on upgrade via Resend
- 🛡️ **Backend Auth Middleware** — All API routes validate Supabase JWTs server-side

### UX & Design
- 🎬 **Cinematic Loading Screen** — Full-screen branded intro with sweep animation
- 🎛️ **AeroFacts Panel** — Context-aware physics education panel
- 🔊 **Stall Audio Alarm** — Configurable audio alert when pitch crosses stall threshold
- 📐 **Settings Modal** — Air density controls, altitude presets, graph bounds, sound settings, and unit toggle (SI/Imperial)

---

## 🔄 Data Flow

```
User visits Vercel → React app loads
         ↓
Supabase Auth → JWT issued → AppContext loads user tier
         ↓
User selects airfoil & runs simulation
         ↓
[Pro/Pro Max] POST /api/analyze → Railway validates JWT via Supabase
         ↓
Node.js forwards to Python NeuralFoil daemon via stdin
         ↓
Python daemon returns {aoa, cl, cd} array via stdout
         ↓
Recharts renders live charts on frontend
         ↓
User clicks Upgrade → POST /api/create-checkout-session → Stripe URL
         ↓
Stripe processes payment → POST /api/webhooks/stripe → Supabase tier updated
         ↓
Railway calls Resend → welcome email sent
```

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/status` | None | Health check |
| `POST` | `/api/analyze` | Yes (Pro+) | NeuralFoil aerodynamic simulation |
| `POST` | `/api/increment-import` | Yes | Track import count, enforce tier limits |
| `POST` | `/api/create-checkout-session` | Yes | Create Stripe checkout session |
| `POST` | `/api/webhooks/stripe` | Stripe signature | Handle payment confirmation |
| `POST` | `/api/log` | None | Browser error log relay |

---

## 💎 Subscription Tiers

| Feature | Free | Pro | Pro Max |
|---|---|---|---|
| Basic simulation (local model) | ✅ | ✅ | ✅ |
| NeuralFoil AI solver | ❌ | ✅ | ✅ |
| Airfoil imports | 1 | 10 | Unlimited |
| Particle flow (full quality) | ❌ | ❌ | ✅ |
| Fast Tune | ❌ | ✅ | ✅ |
| Deep Tune | ❌ | ❌ | ✅ |
| Compare Mode | ✅ | ✅ | ✅ |
| PDF Export | ✅ | ✅ | ✅ |
| 3D STL Export | ✅ | ✅ | ✅ |

---

## 📁 Folder Structure

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

### 1. Clone
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

# Copy and fill in env vars
cp .env.example .env

# Start server (Python daemon launches automatically)
node server.js
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` — you are **automatically logged in** as a `pro_max` dev user. No Supabase credentials required locally.

### Dev Auth Bypass
When running in development mode:
- `AppContext.jsx` injects a mock user (`dev-mock-user`, `pro_max` tier) — no Supabase login needed
- `AuthGuard.jsx` skips the redirect to `/login`
- `server.js` auth middleware skips JWT validation

This bypass is **strictly guarded** by `MODE === 'development'` / `NODE_ENV !== 'production'` and is **never active on Vercel or Railway**.

### Windows Shortcut
```bash
start_servers.bat   # Launches both servers from project root
```

---

## 🌍 Production Deployment

### Frontend → Vercel
Set in **Vercel Dashboard → Settings → Environment Variables:**

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VITE_API_URL` | `https://2jaefar-production.up.railway.app` |

### Backend → Railway
Set in **Railway Dashboard → Variables:**

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key |

### Stripe Webhook
Register in Stripe dashboard → Webhooks:
```
https://2jaefar-production.up.railway.app/api/webhooks/stripe
```

---

## 🧪 Testing

```bash
# Frontend lint
cd frontend && npm run lint

# Backend health check
curl https://2jaefar-production.up.railway.app/api/status
```

Manual checklist:
1. Backend starts → console shows `[Python]: Loading Neuralfoil model...`
2. Move Pitch Angle slider → charts update in real time
3. Enable Compare Mode → select two airfoils → three chart groups appear
4. Click Export PDF → multi-page PDF downloads correctly
5. Click Extract as 3D → STL file downloads

---

## 🔮 Roadmap

- [ ] Volumetric smoke trails and turbulence wake visualization
- [ ] Vitest + React Testing Library frontend test suite
- [ ] pytest for Python physics engine
- [ ] Multi-wing assembly (simulate full wing configurations)
- [ ] Web Workers for heavy ML data formatting
- [ ] MATLAB/CSV export of full polar sweep data
