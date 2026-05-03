# File Tree: 2jaefar

**Generated:** 5/3/2026, 11:28:18 AM
**Root Path:** `c:\Users\PC\OneDrive\Desktop\jaefar\jaefar main\2jaefar`

```
├── backend
│   ├── .env.example
│   ├── Dockerfile
│   ├── package-lock.json
│   ├── package.json
│   ├── requirements.txt
│   ├── run_nf.py
│   └── server.js
├── frontend
│   ├── public
│   │   ├── banner.png
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── vortex-gen-logo.png
│   ├── src
│   │   ├── assets
│   │   │   ├── images
│   │   │   │   ├── loading
│   │   │   │   │   └── loading-base.png
│   │   │   │   ├── aircraft-topview.png
│   │   │   │   ├── hero.png
│   │   │   │   └── logo.png
│   │   │   ├── aircraft-topview.png
│   │   │   ├── hero.png
│   │   │   ├── logo.png
│   │   │   ├── react.svg
│   │   │   ├── vite.svg
│   │   │   ├── vortex_gen_loading_screen_base.png
│   │   │   └── vortex_gen_loading_screen_start.png
│   │   ├── components
│   │   │   ├── layout
│   │   │   │   ├── LoadingScreen.css
│   │   │   │   └── LoadingScreen.tsx
│   │   │   ├── ui
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── ControlSlider.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Slider.tsx
│   │   │   │   └── Spinner.tsx
│   │   │   ├── AeroFactsPanel.jsx
│   │   │   ├── AuthGuard.jsx
│   │   │   ├── ControlSlider.jsx
│   │   │   ├── DataChart.jsx
│   │   │   ├── Export3DModal.jsx
│   │   │   ├── LoadingScreen.css
│   │   │   ├── LoadingScreen.jsx
│   │   │   ├── PdfReportTemplate.jsx
│   │   │   ├── PolarChart.jsx
│   │   │   ├── ShapeCard.jsx
│   │   │   └── SimulationView.jsx
│   │   ├── config
│   │   │   └── constants.ts
│   │   ├── context
│   │   │   └── AppContext.jsx
│   │   ├── features
│   │   │   ├── academy
│   │   │   │   ├── components
│   │   │   │   │   └── AeroFactsPanel.tsx
│   │   │   │   ├── layout
│   │   │   │   │   └── AcademyLayout.tsx
│   │   │   │   ├── pages
│   │   │   │   │   ├── AirfoilPage.tsx
│   │   │   │   │   ├── ExplorerPage.tsx
│   │   │   │   │   ├── FuselagePage.tsx
│   │   │   │   │   └── WingsPage.tsx
│   │   │   │   └── index.ts
│   │   │   ├── auth
│   │   │   │   ├── components
│   │   │   │   │   └── AuthGuard.tsx
│   │   │   │   ├── pages
│   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   └── SignupPage.tsx
│   │   │   │   └── index.ts
│   │   │   ├── lab
│   │   │   │   ├── components
│   │   │   │   │   ├── charts
│   │   │   │   │   │   ├── DataChart.tsx
│   │   │   │   │   │   └── PolarChart.tsx
│   │   │   │   │   ├── export
│   │   │   │   │   │   ├── Export3DModal.tsx
│   │   │   │   │   │   └── PdfReportTemplate.tsx
│   │   │   │   │   └── simulation
│   │   │   │   │       ├── ShapeCard.tsx
│   │   │   │   │       └── SimulationView.tsx
│   │   │   │   ├── data
│   │   │   │   │   ├── envPresets.ts
│   │   │   │   │   └── shapes.ts
│   │   │   │   ├── hooks
│   │   │   │   │   ├── useAerodynamics.ts
│   │   │   │   │   └── useSimulation.ts
│   │   │   │   ├── layout
│   │   │   │   │   └── LabLayout.tsx
│   │   │   │   ├── pages
│   │   │   │   │   └── DashboardPage.tsx
│   │   │   │   └── index.ts
│   │   │   ├── landing
│   │   │   │   ├── components
│   │   │   │   └── pages
│   │   │   │       └── LandingPage.tsx
│   │   │   ├── pricing
│   │   │   │   └── pages
│   │   │   │       └── PricingPage.tsx
│   │   │   ├── profile
│   │   │   │   └── pages
│   │   │   │       └── ProfilePage.tsx
│   │   │   └── settings
│   │   │       ├── components
│   │   │       └── pages
│   │   │           └── SettingsPage.tsx
│   │   ├── hooks
│   │   │   ├── useAppInit.ts
│   │   │   ├── useBackendStatus.ts
│   │   │   └── useTheme.ts
│   │   ├── i18n
│   │   │   ├── locales
│   │   │   │   ├── ar
│   │   │   │   │   ├── academy.json
│   │   │   │   │   ├── common.json
│   │   │   │   │   └── lab.json
│   │   │   │   └── en
│   │   │   │       ├── academy.json
│   │   │   │       ├── common.json
│   │   │   │       └── lab.json
│   │   │   └── index.ts
│   │   ├── layouts
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── ExplorerLayout.jsx
│   │   ├── lib
│   │   │   ├── apiClient.ts
│   │   │   ├── supabaseClient.ts
│   │   │   └── utils.ts
│   │   ├── pages
│   │   │   ├── explore
│   │   │   │   ├── AirfoilSection.jsx
│   │   │   │   ├── FuselageSection.jsx
│   │   │   │   ├── TailSection.jsx
│   │   │   │   └── WingsSection.jsx
│   │   │   ├── lab
│   │   │   │   ├── FuselageLab.jsx
│   │   │   │   ├── LabHub.jsx
│   │   │   │   ├── TailLab.jsx
│   │   │   │   └── WingsLab.jsx
│   │   │   ├── Explorer.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Pricing.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Signup.jsx
│   │   ├── services
│   │   │   ├── apiService.js
│   │   │   └── supabaseClient.js
│   │   ├── store
│   │   │   ├── appContextShim.ts
│   │   │   ├── authStore.ts
│   │   │   ├── index.ts
│   │   │   ├── settingsStore.ts
│   │   │   └── simulationStore.ts
│   │   ├── styles
│   │   │   ├── themes
│   │   │   │   ├── dark.css
│   │   │   │   └── light.css
│   │   │   ├── animations.css
│   │   │   └── index.css
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── .gitignore
│   ├── MIGRATION_COMPLETE.md
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
├── scratch
│   └── verify_symmetry.py
├── .gitignore
├── README.md
├── Vortex-Gen — Full Project Architecture.pdf
├── logo.png
├── nextStep.md
├── nextt.md
├── package-lock.json
├── package.json
├── start_servers.bat
├── test_pts.json
├── vercel.json
├── vercel_deployment_guide.md
├── vortex-gen-logo.png
├── vortex_gen_pitch.md
└── vortex_gen_pitch.pdf
```

---
*Generated by FileTree Pro Extension*