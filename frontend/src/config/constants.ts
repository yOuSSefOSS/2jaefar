export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const FLOW_VISUAL_OPTIONS = [
  { id: 'neon_streams',  label: 'Neon Streams',   description: 'Bright additive particles (default).' },
  { id: 'wind_tunnel',   label: 'Wind Tunnel',     description: 'Softer, depth-aware smoke-like traces.' },
  { id: 'streaklines',   label: 'Streaklines',     description: 'Short, sparse trails — calmer than dense line fields.' },
  { id: 'clean_vectors', label: 'Clean Vectors',   description: 'Sparse minimal highlights — good for stills.' },
  { id: 'smoke',         label: 'Smoke (CFD)',     description: 'Analytical vortices with red smoke CFD colormapping.' },
] as const;

export const SUBSCRIPTION_TIERS = ['free', 'pro', 'pro_max'] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];
