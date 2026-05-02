/**
 * Store barrel — all app-wide state imports go through here.
 *
 * Phase 1 (current): shim delegates to original AppContext.
 * Phase 2 (after `npm install zustand react-i18next i18next clsx tailwind-merge`):
 *   swap shim to the Zustand stores in authStore / settingsStore / simulationStore.
 */
export { useAppContext, FLOW_VISUAL_OPTIONS } from '../context/AppContext';
