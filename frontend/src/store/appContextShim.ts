/**
 * Compatibility shim — bridges the new @/store import path to the existing
 * AppContext until all components are migrated to individual Zustand hooks.
 *
 * Once `zustand` is installed, this can be replaced with the full Zustand
 * implementation in authStore/settingsStore/simulationStore.
 */
export { useAppContext } from '../context/AppContext';
