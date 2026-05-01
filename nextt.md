# Project Directive: Academic Aviation Explorer & Wind Tunnel Lab

## 1. Project Pivot & Vision
**Current State:** A technical wind tunnel SaaS dashboard (https://vortex-gen.vercel.app/dashboard).
**New Vision:** An academic EdTech platform for schools and universities. 
**Core Goal:** Transform the project from a niche engineering tool into a simple, interactive, and highly visual learning environment for Avionics and Aviation Theory.

## 2. The Interaction Model (The "Explorer")
The site must feel clean, minimalist, and intuitive. The entry point is a top-down, interactive model of an airplane.

*   **Interactive Schematic:** Users can click specific components of the aircraft.
*   **Deep-Dive Sections:** 
    *   **Fuselage:** Explain structure, what it holds based on aircraft type (cargo vs. passenger), etc.
    *   **Wings:** Explain functionality (flaps, slats), uses (fuel storage), and lift theory.
    *   **Airfoil:** When the user dives into the airfoil/wing theory, it bridges to the simulation.
*   **The Wind Tunnel Integration:** 
    *   The existing wind tunnel (90% of current functionality) is the "Lab."
    *   Access it via a "Run Simulation" button after learning the theory, or through direct navigation.
    *   Update the UI to match the new clean, academic aesthetic.

## 3. AI Instructions & Constraints

**A. Full Technical Autonomy**
*   **Do not be limited** by the current languages, frameworks, or libraries (React, Next.js, etc.). 
*   If you find a better way to render 3D models or handle interactive SVG/Canvas elements for the airplane schematic, **use it.**
*   Feel free to "fuck around" to find the most performant and visually impressive way to teach these concepts.

**B. Creative Expansion**
*   The details provided are a starting point. Do not limit yourself to just what is written. 
*   Suggest better ways to visualize aviation physics or organize the curriculum to make it "sticky" for students (primary school to college).

**C. Strict Execution Protocol**
1.  **Phase 1 (The Plan):** Analyze this prompt and propose a comprehensive development plan. This must include your chosen tech stack, UI/UX approach for the "Explorer," and how you will integrate the existing Wind Tunnel code.
2.  **Phase 2 (The Pause):** Stop and wait for my confirmation.
3.  **Phase 3 (Implementation):** Begin coding only after the plan is approved.

---

## 4. Current Raw Context (Original Notes)
> "Instead of SaaS, going the academic route for schools/colleges. Core focus: Avionics and Aviation Theory. Site needs to be simple and interactive. Top view airplane model where you press fuselage, wings, etc. Mentioning wings act as fuel storage. When pressing airfoil, it moves to the wind tunnel simulation (the current project). The wind tunnel exists as it is but is now a feature within the larger educational site."