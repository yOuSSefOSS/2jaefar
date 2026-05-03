import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors

def draw_header(c, title, width, height):
    c.setFillColor(colors.HexColor('#0f172a'))
    c.rect(0, height - 1*inch, width, 1*inch, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(0.5*inch, height - 0.6*inch, "VORTEX-GEN — FULL PROJECT ARCHITECTURE")
    c.setFont("Helvetica", 10)
    c.drawString(0.5*inch, height - 0.8*inch, title)
    c.setFillColor(colors.black)

def create_architecture_pdf(filename):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # PAGE 1: Overview and Tech Stack
    draw_header(c, "1. Executive Summary & Tech Stack", width, height)
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(0.5*inch, height - 1.5*inch, "Project Overview")
    
    c.setFont("Helvetica", 10)
    text = (
        "Vortex-Gen is a full-stack aerodynamic simulation platform designed for aerospace engineering "
        "students, researchers, and hobbyists. It combines interactive WebGL-based visualization "
        "with a Python neural-network backend (NeuralFoil) to deliver real-time fluid dynamics predictions. "
        "The recent upgrade introduces a feature-based architecture, an interactive pedagogical Lab Manual, "
        "and side-by-side comparative analysis of airfoil geometries."
    )
    # simple wrap
    import textwrap
    lines = textwrap.wrap(text, width=90)
    y = height - 1.8*inch
    for line in lines:
        c.drawString(0.5*inch, y, line)
        y -= 0.2*inch
        
    y -= 0.3*inch
    c.setFont("Helvetica-Bold", 14)
    c.drawString(0.5*inch, y, "Technology Stack")
    y -= 0.3*inch
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(0.5*inch, y, "Frontend (Vite + React 19 + TypeScript/JSX)")
    y -= 0.2*inch
    c.setFont("Helvetica", 10)
    c.drawString(0.7*inch, y, "- Framework: React with Vite bundler.")
    y -= 0.2*inch
    c.drawString(0.7*inch, y, "- Styling: Tailwind CSS v4 (Glassmorphism, dark-mode native).")
    y -= 0.2*inch
    c.drawString(0.7*inch, y, "- Animations: Framer Motion (Page transitions, Interactive Lab Manual).")
    y -= 0.2*inch
    c.drawString(0.7*inch, y, "- Data Viz: Recharts (Cl/Cd/Polar charts) & Three.js/React-Three-Fiber (3D particles).")
    y -= 0.2*inch
    c.drawString(0.7*inch, y, "- State: AppContext & Zustand (planned migration).")
    y -= 0.2*inch
    c.drawString(0.7*inch, y, "- Exports: jsPDF & html2canvas for multi-page reports.")
    y -= 0.4*inch
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(0.5*inch, y, "Backend (Node.js + Python Daemon)")
    y -= 0.2*inch
    c.setFont("Helvetica", 10)
    c.drawString(0.7*inch, y, "- Gateway: Express.js (Node.js) handling REST requests & Auth.")
    y -= 0.2*inch
    c.drawString(0.7*inch, y, "- Engine: Python 3 daemon using PyTorch and NeuralFoil.")
    y -= 0.2*inch
    c.drawString(0.7*inch, y, "- IPC Protocol: JSON over stdin/stdout for high-performance process communication.")
    y -= 0.4*inch

    c.setFont("Helvetica-Bold", 11)
    c.drawString(0.5*inch, y, "Infrastructure & Integrations")
    y -= 0.2*inch
    c.setFont("Helvetica", 10)
    c.drawString(0.7*inch, y, "- Database/Auth: Supabase (PostgreSQL + JWT Auth).")
    y -= 0.2*inch
    c.drawString(0.7*inch, y, "- Payments: Stripe (Tiered Subscriptions).")
    y -= 0.2*inch
    c.drawString(0.7*inch, y, "- Hosting: Vercel (Frontend) & Railway (Backend).")
    y -= 0.2*inch
    c.drawString(0.7*inch, y, "- Emails: Resend API.")
    
    c.showPage()
    
    # PAGE 2: Features & Architecture
    draw_header(c, "2. Core Features & Architecture Transition", width, height)
    
    y = height - 1.5*inch
    c.setFont("Helvetica-Bold", 14)
    c.drawString(0.5*inch, y, "Key Features")
    y -= 0.3*inch
    c.setFont("Helvetica", 10)
    features = [
        "1. Academy & Explorer: Interactive learning modules for Fuselage, Wings, and Airfoils.",
        "2. Advanced Wind Tunnel Lab: Real-time simulation dashboard with environmental controls.",
        "3. Interactive Lab Manual: Step-by-step pedagogical walkthroughs using Framer Motion.",
        "4. Side-by-Side Compare Mode: Simultaneous visualization of two airfoils (Metrics & Charts).",
        "5. Intelligent Analytics: Golden Lift optimization, Stall alarms, and Drag Polar analysis.",
        "6. Artifact Generation: 3D STL exports for CAD/printing and multi-page PDF generation."
    ]
    for f in features:
        c.drawString(0.5*inch, y, f)
        y -= 0.25*inch
        
    y -= 0.3*inch
    c.setFont("Helvetica-Bold", 14)
    c.drawString(0.5*inch, y, "Architecture Transition (Legacy JSX -> Modular TSX)")
    y -= 0.3*inch
    
    text2 = (
        "The project is currently undergoing a structural migration to a feature-sliced architecture. "
        "Historically, the frontend resided in a flat 'pages' and 'components' directory. "
        "The new architecture is scoped into distinct bounded contexts within 'src/features/'. "
        "This enhances maintainability, testability, and type safety as the application scales."
    )
    lines2 = textwrap.wrap(text2, width=90)
    for line in lines2:
        c.drawString(0.5*inch, y, line)
        y -= 0.2*inch
        
    c.showPage()

    # PAGE 3: File Tree
    draw_header(c, "3. Directory Structure (File Tree)", width, height)
    
    tree_content = r'''backend/
|-- run_nf.py               # Python NeuralFoil daemon (stdin/stdout protocol)
|-- server.js               # Express API, auth middleware, Stripe & Resend logic
|-- Dockerfile              # Docker config for Railway deployment
|-- requirements.txt        # Python dependencies
|-- .env.example            # Backend env variable reference
+-- package.json
frontend/
|-- public/                 # Static assets (banner, icons, favicon)
+-- src/
    |-- assets/             # Images, SVGs, and branding assets
    |-- components/         # Shared UI components and global modals
    |-- config/             # Constants and configuration
    |-- context/            # AppContext (global state for Auth/Tier)
    |-- features/           # New Feature-Based Architecture (Next-Gen TS)
    |   |-- academy/        # Educational modules (Airfoil, Fuselage, Wings)
    |   |-- auth/           # Authentication flows
    |   |-- lab/            # Aerodynamic simulation lab core
    |   |-- landing/        # Landing page module
    |   |-- pricing/        # Subscription plans
    |   |-- profile/        # User profile and hangar
    |   +-- settings/       # App settings
    |-- hooks/              # Custom React hooks
    |-- i18n/               # Internationalization (en, ar)
    |-- layouts/            # Page wrappers (DashboardLayout, ExplorerLayout)
    |-- lib/                # Utility functions, API and Supabase clients
    |-- pages/              # Legacy JSX pages (Home, Login, Signup, Explorer)
    |-- services/           # API Services
    |-- store/              # State management stores
    |-- styles/             # CSS Modules, Themes, Animations
    |-- App.jsx / App.tsx
    |-- main.jsx / main.tsx
    +-- index.css
vercel.json                 # Vercel deployment config
start_servers.bat           # Windows: starts frontend + backend together
README.md                   # Project documentation'''

    c.setFont('Courier', 9)
    y = height - 1.5 * inch
    margin = 0.5 * inch

    for line in tree_content.split('\n'):
        if y < 0.75 * inch:
            c.showPage()
            draw_header(c, "3. Directory Structure (Cont.)", width, height)
            c.setFont('Courier', 9)
            y = height - 1.5 * inch
            
        c.drawString(margin, y, line)
        y -= 12

    c.showPage()
    
    # PAGE 4: API Endpoints
    draw_header(c, "4. API Architecture & Data Flow", width, height)
    y = height - 1.5*inch
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(0.5*inch, y, "REST API Endpoints (Node.js Gateway)")
    y -= 0.3*inch
    c.setFont("Helvetica", 10)
    
    apis = [
        "GET  /api/status                 - Service health check & NeuralFoil daemon status.",
        "POST /api/analyze                - Proxies aerodynamics reqs to Python daemon. Validates JWT.",
        "POST /api/increment-import       - Tracks user imports, enforces free/pro/promax tier limits.",
        "POST /api/create-checkout-session- Initializes Stripe Hosted Checkout for upgrades.",
        "POST /api/webhooks/stripe        - Handles Stripe events (checkout.session.completed).",
        "POST /api/log                    - Browser error relay for remote debugging."
    ]
    for api in apis:
        c.drawString(0.5*inch, y, api)
        y -= 0.2*inch
        
    y -= 0.3*inch
    c.setFont("Helvetica-Bold", 14)
    c.drawString(0.5*inch, y, "Data Flow (Simulation Request)")
    y -= 0.3*inch
    
    flow = [
        "1. Client triggers simulation with shape geometry (points) and environment config.",
        "2. React sends POST /api/analyze to Express backend with Supabase JWT in Authorization header.",
        "3. Express middleware validates JWT against Supabase. Checks subscription tier.",
        "4. Express converts request to JSON string and writes to Python NeuralFoil daemon's stdin.",
        "5. Python process decodes JSON, runs PyTorch NeuralFoil surrogate or NACA analytic solver.",
        "6. Python writes results array back to stdout as JSON.",
        "7. Express parses stdout, streams response back to React frontend.",
        "8. Recharts & Three.js consume data for Cl/Cd charts and 3D particle visualization."
    ]
    for step in flow:
        lines = textwrap.wrap(step, width=90)
        for line in lines:
            c.drawString(0.5*inch, y, line)
            y -= 0.2*inch
            
    c.showPage()

    # PAGE 5: Database Schema
    draw_header(c, "5. Database Schema (Supabase PostgreSQL)", width, height)
    y = height - 1.5*inch
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(0.5*inch, y, "Supabase Architecture Overview")
    y -= 0.3*inch
    c.setFont("Helvetica", 10)
    
    schema = [
        "The application utilizes Supabase for Authentication and Data Storage.",
        "Authentication is handled via Email/Password and Google OAuth.",
        "",
        "Table: profiles",
        "----------------------------------------------------------------------",
        "id (UUID)           | Primary Key, References auth.users",
        "display_name (TEXT) | User's full name",
        "tier (TEXT)         | Subscription status ('free', 'pro', 'pro_max')",
        "imports_count (INT) | Tracking custom airfoil imports per month",
        "stripe_customer   | Stripe Customer ID reference",
        "created_at (TS)     | Account creation timestamp",
        "",
        "Security:",
        "- Row Level Security (RLS) is enabled on all tables.",
        "- Users can only SELECT and UPDATE their own profile records.",
        "- Backend API relies on the Service Role Key to bypass RLS for webhook updates."
    ]
    
    c.setFont('Courier', 10)
    for line in schema:
        c.drawString(0.5*inch, y, line)
        y -= 0.2*inch

    c.save()

if __name__ == "__main__":
    create_architecture_pdf("Vortex-Gen — Full Project Architecture.pdf")
