<p align="center">
  <img src="frontend/public/banner.png" alt="Vortex-Gen Banner" width="100%">
</p>

# 🌪️ Vortex-Gen: Interactive 3D Wind Tunnel

## 📖 Project Overview
**Vortex-Gen** is a professional, high-fidelity real-time aerodynamics simulation engine designed for education, engineering intuition, and competitive hackathons. It seamlessly blends advanced 3D rendering with a neural-network-backed physics core. Users can interactively test airfoil shapes in a virtual wind tunnel, instantly visualizing complex aerodynamic phenomena like pressure distribution, lift generation, and stall dynamics without the agonizing wait times of traditional Computational Fluid Dynamics (CFD).

---

## 💻 Tech Stack
The project uses a modern, high-performance web architecture separated into a frontend UI and a dedicated physics backend:

**Frontend (UI & 3D Rendering):**
- **React 19 & Vite:** Lightning-fast UI framework and build tool.
- **Three.js & React-Three-Fiber (Drei):** WebGL-accelerated 3D rendering for flow particles and geometries.
- **Tailwind CSS v4:** Utility-first framework for crafting a premium Glassmorphism design system.
- **Framer Motion:** Spring-physics-based micro-animations and smooth layout transitions.
- **Recharts:** Dynamic SVG charts for real-time Drag Polar and Lift Coefficient data.

**Backend (API & Machine Learning Physics Core):**
- **Node.js & Express:** Lightweight, asynchronous REST API.
- **Python 3 & Numpy:** Data processing and numerical calculations.
- **NeuralFoil (PyTorch):** Deep-learning surrogate model that predicts airfoil aerodynamic properties (Cl, Cd) in milliseconds.

---

## 🏗️ Architecture
Vortex-Gen relies on a **Daemon-based Architecture** to achieve real-time interactivity:

1. **Frontend Client:** Captures user inputs (Angle of Attack, Velocity, Shape modifiers) and sends JSON payloads to the Express server.
2. **Node.js Gateway (`server.js`):** Acts as a bridge. Instead of spinning up a new Python script per request, it maintains a permanent `child_process`.
3. **Python Daemon (`run_nf.py`):** The NeuralFoil ML model is mathematically heavy, and initializing it takes time. By running Python in `--daemon` mode, the model is loaded into memory exactly once. It listens to `stdin` for JSON configurations, executes the aerodynamics prediction instantly, and writes the results to `stdout`.
4. **Data Return:** Node parses the stream and returns standard HTTP responses to the frontend, which interpolates the data into 3D particle updates and Recharts graphs.

---

## ✨ Features
- 🚀 **Real-Time 3D CFD Visualization:** Interactive 3D particle flow engine and dynamic surface pressure heatmaps.
- 🧠 **"Aero-Facts" Learn Mode:** A contextual, physics-aware educational engine that surfaces real-time concept summaries (e.g., Boundary Layer Separation, Bernoulli's Principle) based on current Angle of Attack and wind speed.
- ⚡ **Instantaneous Physics:** Predicts real-world aerodynamic coefficients (Cl, Cd) in milliseconds using an ML surrogate, replacing hours of traditional meshing.
- 💎 **Premium Glassmorphism UI:** Features multi-layered blur shadows, smooth micro-animations, glowing sliders, and dynamic charts.
- 🏎️ **Optimized Render Loop:** Uses Three.js constant-hoisting and React.memo caching to guarantee a smooth 60fps experience under heavy interaction.

---

## 🧪 Testing
Currently, the codebase relies on static analysis and manual integration testing. 

**Linting:**
To check the frontend codebase for errors and enforce code style, use ESLint:
```bash
cd frontend
npm run lint
```

**Manual Verification:**
1. Start both servers.
2. Ensure the backend console displays `[Python]: Loading Neuralfoil model into memory...` and does not crash.
3. Open the frontend and manipulate the "Angle of Attack" slider. The Data Charts and 3D Canvas should update synchronously without stuttering. 

---

## 📁 Folder Structure
```text
├── backend/                  # Node.js and Python Physics Engine
│   ├── run_nf.py             # Python daemon utilizing NeuralFoil
│   ├── server.js             # Express.js REST API gateway
│   └── package.json          # Backend dependencies
├── frontend/                 # React SPA & 3D Engine
│   ├── public/               # Static assets (Banner, Icons)
│   ├── src/                  
│   │   ├── components/       # Reusable UI & 3D Components (SimulationView, DataChart, etc.)
│   │   ├── context/          # Global React Context for state management
│   │   ├── layouts/          # Main application wrappers
│   │   ├── pages/            # View routes (Home, Profile, Settings)
│   │   ├── services/         # Axios API interceptors
│   │   ├── App.jsx           # Root component
│   │   └── index.css         # Tailwind v4 configuration and global styles
│   ├── index.html            # Entry point
│   ├── vite.config.js        # Vite build configuration
│   └── package.json          # Frontend dependencies
├── start_servers.bat         # Windows batch script to launch both environments
├── oldREADME.md              # Previous documentation version
└── README.md                 # Project Documentation
```

---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js** (v18+)
- **Python 3.9+** (with pip)

### 1. Root Directory Setup
Clone the repository, then initialize dependencies.

### 2. Backend Setup
The ML engine needs a Python environment and Node server.
```bash
cd backend
npm install

# Install Python dependencies (using a virtual environment is recommended)
python -m pip install neuralfoil numpy

# Start the Node.js API and Python Daemon
node server.js
```
*Wait until the console says "Firing up persistent Python Neuralfoil Daemon..."*

### 3. Frontend Setup
Open a **new** terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Navigate to `http://localhost:5173` in a hardware-accelerated browser (such as Chrome or Edge).*

---

## 🔮 Future Improvements
- **Custom Airfoil Importer:** Allow users to upload `.dat` coordinate files to test custom geometries and shapes.
- **3D Volumetric Smoke:** Upgrade the particle system to simulate volumetric smoke trails and realistic turbulence wakes.
- **Automated Test Suite:** Implement `Vitest` and `React Testing Library` for the frontend UI, and `pytest` for the Python physics core.
- **Export & Reporting:** Generate downloadable PDF reports of the tested aerodynamic performance (Lift/Drag ratios over time).
- **Multi-threaded Web Workers:** Offload the formatting of heavy ML data arrays to Web Workers to ensure the main UI thread never blocks during massive computations.
