<div align="center">
  <img src="frontend/public/banner.png" alt="Vortex-Gen Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;">

  # 🌀 Vortex-Gen
  ### The Next-Generation Aerodynamic Simulation Platform
  
  [![Vercel Deployment](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://vortex-gen.vercel.app)
  [![Hugging Face Backend](https://img.shields.io/badge/AI_Engine-Hugging_Face-yellow?style=for-the-badge&logo=huggingface)](https://youssev-vortex-gen-backend.hf.space/api/status)
  [![React 19](https://img.shields.io/badge/Frontend-React_19-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![PyTorch ML](https://img.shields.io/badge/Backend-PyTorch-ee4c2c?style=for-the-badge&logo=pytorch)](https://pytorch.org/)

  <p align="center">
    <strong>Vortex-Gen</strong> brings enterprise-grade Computational Fluid Dynamics (CFD) right into your browser. Combining breathtaking <strong>WebGL visualizations</strong> with a millisecond-latency <strong>PyTorch Neural Network</strong>, we've built the ultimate sandbox for aerospace students, researchers, and hobbyists.
  </p>
</div>

---

## 🔥 Why Vortex-Gen?

Traditional CFD is incredibly computationally expensive and mathematically dense. **Vortex-Gen democratization aerodynamics.** By swapping heavy Navier-Stokes solvers for a trained Neural Surrogate Model (**NeuralFoil**), you get instant feedback. 

- **⚡ Instant Telemetry:** Real-time $C_L$, $C_D$, and Drag Polars.
- **💨 Analytical CFD Smoke:** Mathematically accurate Von Kármán vortex streets and streaklines natively rendered in your browser.
- **👥 Collaborative Workspaces:** Secure, isolated team environments for sharing custom geometries.

---

## 🏗️ Production Architecture

Vortex-Gen operates on a highly distributed, hybrid architecture built for maximum availability and performance.

| Domain | Service | Technology / Role |
| :--- | :--- | :--- |
| **🌐 Frontend** | [Vercel](https://vortex-gen.vercel.app) | React 19, Tailwind v4, Three.js, Zustand |
| **🧠 ML Backend** | [Hugging Face](https://youssev-vortex-gen-backend.hf.space/api/status) | Node.js (Express) + Python Daemon (IPC) |
| **🔐 Auth & DB** | Supabase | JWT Sessions, PostgreSQL, Row-Level Security |
| **💳 Payments** | Stripe | Hosted Checkout, Webhooks for auto-tier upgrades |
| **✉️ Emails** | Resend | Dynamic HTML Welcome and Subscription alerts |

> **💡 Architecture Note:** The Node.js API acts as a gateway, validating Supabase JWTs before piping requests to a **Persistent Python Daemon** via IPC (`stdin/stdout`), completely eliminating cold-starts for AI inferences.

---

## ✨ Core Features

### 🌪️ The Wind Tunnel Lab
- **Real-Time 3D CFD Visualization:** Interactive particle flow engine mapping pressure differentials and velocity heatmaps.
- **Live Interactive Charts:** Track Lift, Drag, and Stall Zones over shifting Angles of Attack dynamically.
- **Dual Compare Mode:** Rigorously test two airfoils (e.g., NACA 0012 vs custom `.dat`) side-by-side with overlaid analytics.

### 🤖 AI-Powered Autotune
- **Fast Tune:** Rapid automated sweep to identify the highest-$C_L$ geometry across hundreds of NACA parameters.
- **Deep Tune:** Exhaustive optimization for enterprise-grade precision (Pro Max exclusively).
- **Golden Lift Mode:** Visually targets and glows at the absolute best Lift-to-Drag ratio.

### 🛠️ Export Artifacts
- **3D STL Generator:** Convert any optimized 2D airfoil into a physical 3D-printable solid (Drone span, Plane Section).
- **Multi-Page Analytical PDFs:** Professional, branded PDF reports stitched client-side with `jsPDF` outlining your exact telemetry.

### 🏢 Team Workspaces
- **Hierarchical Access:** All users operate within workspaces. Owners can invite colleagues.
- **Tier Inheritance:** Team members inherit the premium processing power (NeuralFoil limits) of the workspace owner.

---

## 🛠️ Local Development Guide

Want to run the full stack locally? Vortex-Gen uses a **Dev Bypass** protocol locally, meaning you don't even need Supabase configured to start hacking.

### Prerequisites
- Node.js v18+
- Python 3.9+ (with PyTorch and NeuralFoil installed)

### 1. Launch the ML Backend
```bash
cd backend
npm install

# Setup Python Virtual Environment
python -m venv venv
# Windows: venv\Scripts\activate | Unix: source venv/bin/activate
pip install neuralfoil numpy torch

cp .env.example .env
node server.js
```

### 2. Launch the React UI
```bash
cd frontend
npm install
npm run dev
```

🚀 Open `http://localhost:5173`. You are **automatically logged in** as a `pro_max` dev user!

*(Windows Users: Simply double click `start_servers.bat` from the root folder to boot both instantly!)*

---

## 📚 Project Resources
For a deeper dive into the system's design and our business model, check out the generated artifacts in the root directory:
- 📄 **`Vortex-Gen — Full Project Architecture.pdf`**
- 📄 **`vortex_gen_pitch.pdf`**

---

<div align="center">
  <p>Built with ❤️ for the future of Aerospace Engineering.</p>
</div>
