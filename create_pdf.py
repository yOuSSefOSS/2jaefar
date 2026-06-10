import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors
import textwrap

def draw_dark_header(c, title, width, height, is_pitch=False):
    # Dark modern background for header
    c.setFillColor(colors.HexColor('#020817'))
    c.rect(0, height - 1.2*inch, width, 1.2*inch, fill=1, stroke=0)
    
    # Accent line
    c.setFillColor(colors.HexColor('#38bdf8'))
    c.rect(0, height - 1.25*inch, width, 0.05*inch, fill=1, stroke=0)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 22)
    if is_pitch:
        c.drawString(0.5*inch, height - 0.6*inch, "VORTEX-GEN PITCH DECK")
    else:
        c.drawString(0.5*inch, height - 0.6*inch, "VORTEX-GEN ARCHITECTURE")
        
    c.setFont("Helvetica", 12)
    c.setFillColor(colors.HexColor('#94a3b8'))
    c.drawString(0.5*inch, height - 0.9*inch, title)
    c.setFillColor(colors.black)

def draw_bullet(c, text, x, y, wrap_width=90):
    c.setFillColor(colors.HexColor('#38bdf8'))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x, y, "•")
    c.setFillColor(colors.HexColor('#334155'))
    c.setFont("Helvetica", 11)
    
    lines = textwrap.wrap(text, width=wrap_width)
    for line in lines:
        c.drawString(x + 0.2*inch, y, line)
        y -= 0.2*inch
    return y

def draw_h2(c, text, x, y):
    c.setFillColor(colors.HexColor('#0f172a'))
    c.setFont("Helvetica-Bold", 16)
    c.drawString(x, y, text)
    # Underline
    c.setFillColor(colors.HexColor('#e2e8f0'))
    c.rect(x, y - 0.1*inch, 7.5*inch, 0.02*inch, fill=1, stroke=0)
    return y - 0.4*inch

def draw_h3(c, text, x, y):
    c.setFillColor(colors.HexColor('#1e40af'))
    c.setFont("Helvetica-Bold", 13)
    c.drawString(x, y, text)
    return y - 0.3*inch

def draw_paragraph(c, text, x, y, width=95):
    c.setFillColor(colors.HexColor('#475569'))
    c.setFont("Helvetica", 11)
    lines = textwrap.wrap(text, width=width)
    for line in lines:
        c.drawString(x, y, line)
        y -= 0.22*inch
    return y - 0.1*inch

def create_architecture_pdf(filename):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # PAGE 1
    draw_dark_header(c, "1. Executive Summary & Infrastructure", width, height)
    y = height - 1.8*inch
    
    y = draw_h2(c, "System Overview", 0.5*inch, y)
    y = draw_paragraph(c, "Vortex-Gen is a full-stack, distributed application designed for aerospace engineering. It is composed of a modern React 19 Frontend and a hybrid Node.js/Python Backend. The architecture is explicitly designed for high-performance computing, minimizing the latency between the browser-based 3D simulation and the intensive PyTorch neural network inferences using a persistent IPC Daemon.", 0.5*inch, y)
    
    y -= 0.2*inch
    y = draw_h2(c, "Infrastructure & Hosting", 0.5*inch, y)
    y = draw_bullet(c, "Frontend UI: React 19, Vite, Tailwind v4, Zustand. Hosted on Vercel.", 0.5*inch, y)
    y = draw_bullet(c, "Backend API: Node.js (Express) acting as a gateway and Auth perimeter. Hosted on Hugging Face.", 0.5*inch, y)
    y = draw_bullet(c, "ML Engine: Python 3, PyTorch (NeuralFoil daemon) for millisecond CFD inferences.", 0.5*inch, y)
    y = draw_bullet(c, "Database & Auth: Supabase (PostgreSQL, Row-Level Security, JWT Auth).", 0.5*inch, y)
    y = draw_bullet(c, "Payments & Email: Stripe for auto-tier upgrades via Webhooks, Resend for dynamic HTML emails.", 0.5*inch, y)
    
    c.showPage()
    
    # PAGE 2
    draw_dark_header(c, "2. Core Features & Data Flow", width, height)
    y = height - 1.8*inch
    
    y = draw_h2(c, "Feature-Based Frontend Architecture", 0.5*inch, y)
    y = draw_paragraph(c, "The frontend leverages a domain-driven structure mapping UI, logic, and state into distinct feature folders:", 0.5*inch, y)
    y = draw_bullet(c, "Academy & Lab: Educational walkthroughs and the core 3D simulation engine.", 0.5*inch, y)
    y = draw_bullet(c, "Compare Mode: Simultaneous dual-geometry rendering with overlaid Cl/Cd analytics.", 0.5*inch, y)
    y = draw_bullet(c, "Artifact Generation: Client-side extraction of 3D-printable STLs and multi-page analytical PDFs using jsPDF.", 0.5*inch, y)

    y -= 0.3*inch
    y = draw_h2(c, "Data Flow & Security", 0.5*inch, y)
    flow = [
        "1. Client triggers simulation with shape geometry (points) and environment config.",
        "2. React sends POST /api/analyze to Express backend with Supabase JWT.",
        "3. Express middleware validates JWT against Supabase. Checks subscription tier.",
        "4. Express converts request to JSON and writes to Python NeuralFoil daemon's stdin.",
        "5. Python process decodes JSON, runs PyTorch NeuralFoil surrogate.",
        "6. Python writes results array back to stdout as JSON.",
        "7. Express parses stdout, streams response back to React frontend.",
        "8. Recharts & Three.js consume data for Cl/Cd charts and 3D particle visualization."
    ]
    for step in flow:
        y = draw_bullet(c, step, 0.5*inch, y)

    c.showPage()
    
    # PAGE 3
    draw_dark_header(c, "3. Directory Structure", width, height)
    y = height - 1.8*inch
    
    c.setFont('Courier', 10)
    c.setFillColor(colors.HexColor('#334155'))
    tree_content = r'''backend/
|-- run_nf.py               # Python NeuralFoil daemon (stdin/stdout protocol)
|-- server.js               # Express API, Stripe Webhooks & JWT Auth
|-- requirements.txt        # Python dependencies
+-- package.json            # Node dependencies

frontend/
|-- public/                 # Static assets
+-- src/
    |-- assets/             # SVGs and UI graphics
    |-- components/         # Shared global UI components
    |-- features/           # Feature-Sliced Architecture Domains
    |   |-- academy/        # Educational learning modules
    |   |-- lab/            # Aerodynamic engine, Three.js canvas, Telemetry
    |   |-- pricing/        # Stripe subscription models
    |   |-- profile/        # User workspaces and settings
    |-- lib/                # Supabase SDK clients
    |-- pages/              # Routing definitions
    |-- store/              # Zustand global state
    |-- App.jsx / App.tsx   # Root React entry
    +-- index.css           # Tailwind v4 directives'''
    
    for line in tree_content.split('\n'):
        c.drawString(0.5*inch, y, line)
        y -= 14
        
    c.save()

def create_pitch_pdf(filename):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # PAGE 1
    draw_dark_header(c, "1. The Next-Gen Aerodynamic Platform", width, height, is_pitch=True)
    y = height - 1.8*inch
    
    y = draw_h2(c, "The Problem", 0.5*inch, y)
    y = draw_bullet(c, "Overly Complex: Traditional CFD software requires hours of setup and complex meshing.", 0.5*inch, y)
    y = draw_bullet(c, "Computationally Expensive: Needs dedicated hardware to run a single simulation.", 0.5*inch, y)
    y = draw_bullet(c, "Inaccessible: Extremely unfriendly to beginners with massive licensing fees.", 0.5*inch, y)
    
    y -= 0.3*inch
    y = draw_h2(c, "The Solution: Vortex-Gen", 0.5*inch, y)
    y = draw_paragraph(c, "Vortex-Gen democratizes aerodynamic analysis. We've built a full-stack, production-grade simulation platform that combines interactive WebGL visualizations with a powerful PyTorch Neural Network backend to deliver real-time fluid dynamics predictions.", 0.5*inch, y)
    
    y -= 0.1*inch
    y = draw_bullet(c, "Instant Feedback: Millisecond-level Cl/Cd predictions using our NeuralFoil AI.", 0.5*inch, y)
    y = draw_bullet(c, "Interactive WebGL Engine: Beautiful, real-time particle flows and CFD smoke.", 0.5*inch, y)
    y = draw_bullet(c, "Collaborative Workspaces: Secure team environments for rigorous A/B comparisons.", 0.5*inch, y)

    c.showPage()
    
    # PAGE 2
    draw_dark_header(c, "2. Business Model & Features", width, height, is_pitch=True)
    y = height - 1.8*inch
    
    y = draw_h2(c, "Core Capabilities", 0.5*inch, y)
    y = draw_bullet(c, "The Wind Tunnel Lab: Drop in any airfoil and instantly visualize mathematically accurate Von Kármán vortex streets and live telemetry.", 0.5*inch, y)
    y = draw_bullet(c, "AI-Powered Autotune: Stop guessing. Let our Deep Tune AI exhaustively sweep thousands of NACA coordinates to find the absolute maximum Lift-to-Drag ratio.", 0.5*inch, y)
    y = draw_bullet(c, "Professional Export Artifacts: Instantly extract optimized geometries as 3D-printable STLs or multi-page branded analytical PDF reports.", 0.5*inch, y)
    
    y -= 0.3*inch
    y = draw_h2(c, "SaaS Business Model", 0.5*inch, y)
    y = draw_paragraph(c, "Vortex-Gen operates on a tiered SaaS subscription model seamlessly integrated with Stripe:", 0.5*inch, y)
    
    y -= 0.1*inch
    y = draw_bullet(c, "Free Tier: Basic simulation, local analytic model, and 1 custom import per month.", 0.5*inch, y)
    y = draw_bullet(c, "Pro Tier: Unlocks the PyTorch solver, Fast Tune Optimizer, and 10 imports/month.", 0.5*inch, y)
    y = draw_bullet(c, "Pro Max Tier: Unlimited imports, Deep Tune Optimizer, and Team Workspaces.", 0.5*inch, y)
    
    c.showPage()
    c.save()

if __name__ == "__main__":
    create_architecture_pdf("Vortex-Gen — Full Project Architecture.pdf")
    create_pitch_pdf("vortex_gen_pitch.pdf")
    print("PDFs generated successfully!")
