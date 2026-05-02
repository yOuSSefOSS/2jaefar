# VortexGen Frontend Refactor — Complete

## What Changed

### New Structure
```
src/
├── assets/images/          ← all static assets (logo, hero, loading screens)
├── components/
│   ├── layout/
│   │   └── LoadingScreen.tsx   ← restored from original with @/ imports
│   └── ui/
│       ├── Button.tsx          ← new shared component
│       ├── Slider.tsx          ← new shared component
│       ├── Modal.tsx           ← new shared component
│       ├── Spinner.tsx         ← new shared component
│       └── ControlSlider.tsx   ← original preserved
├── config/
│   └── constants.ts            ← FLOW_VISUAL_OPTIONS, API_URL, etc.
├── features/
│   ├── auth/
│   │   ├── components/AuthGuard.tsx
│   │   └── pages/ LoginPage.tsx, SignupPage.tsx
│   ├── academy/
│   │   ├── layout/AcademyLayout.tsx   ← from ExplorerLayout
│   │   ├── components/AeroFactsPanel.tsx
│   │   └── pages/ ExplorerPage, FuselagePage, WingsPage, AirfoilPage
│   ├── lab/
│   │   ├── layout/LabLayout.tsx       ← from DashboardLayout
│   │   ├── components/
│   │   │   ├── simulation/ SimulationView.tsx, ShapeCard.tsx
│   │   │   ├── charts/     DataChart.tsx, PolarChart.tsx
│   │   │   └── export/     Export3DModal.tsx, PdfReportTemplate.tsx
│   │   ├── data/   shapes.ts, envPresets.ts
│   │   ├── hooks/  useAerodynamics.ts, useSimulation.ts
│   │   └── pages/  DashboardPage.tsx   ← from Home.jsx
│   ├── landing/pages/LandingPage.tsx
│   ├── profile/pages/ProfilePage.tsx
│   ├── settings/pages/SettingsPage.tsx
│   └── pricing/pages/PricingPage.tsx
├── hooks/
│   ├── useTheme.ts
│   ├── useBackendStatus.ts
│   └── useAppInit.ts
├── i18n/
│   ├── index.ts
│   └── locales/en/ common.json, academy.json, lab.json
├── lib/
│   ├── supabaseClient.ts   ← from services/supabaseClient.js
│   ├── apiClient.ts        ← from services/apiService.js + axios
│   └── utils.ts            ← cn(), formatNumber()
├── store/
│   ├── index.ts            ← barrel (Phase 1: re-exports AppContext)
│   └── appContextShim.ts   ← bridges @/store → context/AppContext
├── styles/
│   ├── themes/dark.css     ← new CSS variables
│   ├── themes/light.css    ← new CSS variables (light mode ready)
│   └── animations.css
├── App.tsx                 ← new (App.jsx preserved as backup)
└── main.tsx                ← new (main.jsx preserved as backup)
```

## What's Preserved 100%
- All UI, functions, props, and behaviour are identical to the original
- AppContext is still the single source of truth (shim pattern)
- All routing is identical to original App.jsx

## To Install New Packages
```bash
npm install zustand react-i18next i18next i18next-browser-languagedetector clsx tailwind-merge
```

## Phase 2 (optional — full Zustand migration)
Replace `src/store/index.ts` to export from the Zustand stores:
- `authStore.ts` — user, subscriptionTier, importsCount
- `settingsStore.ts` — all persisted settings (with zustand/middleware persist)
- `simulationStore.ts` — ephemeral simulation state

Then remove `src/context/AppContext.jsx` and update `App.tsx` to remove `<AppProvider>`.
