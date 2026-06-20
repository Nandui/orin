'use client';

// Phase 1 stub. Real Supabase auth (email + Google OAuth) and Pro-tier state
// land in Phase 2; for now nobody is signed in and nobody is Pro, which is all
// AdSlot and the vote buttons need to render.
export interface AuthState {
  user: null;
  isPro: boolean;
  loading: boolean;
}

export function useAuth(): AuthState {
  return { user: null, isPro: false, loading: false };
}
