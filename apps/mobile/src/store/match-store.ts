import { create } from 'zustand';
import type { MatchCandidate, Match, CompatibilityReport } from '@agar/shared';

interface MatchState {
  // Discovery feed
  candidates: MatchCandidate[];
  currentIndex: number;
  isLoading: boolean;

  // Matches
  matches: Match[];

  // Active compatibility view
  activeReport: CompatibilityReport | null;

  // Mode
  mode: 'self' | 'referral';

  // Actions
  setCandidates: (candidates: MatchCandidate[]) => void;
  nextCandidate: () => void;
  setMatches: (matches: Match[]) => void;
  setActiveReport: (report: CompatibilityReport | null) => void;
  setMode: (mode: 'self' | 'referral') => void;
  setLoading: (loading: boolean) => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  candidates: [],
  currentIndex: 0,
  isLoading: false,
  matches: [],
  activeReport: null,
  mode: 'self',

  setCandidates: (candidates) => set({ candidates, currentIndex: 0 }),
  nextCandidate: () => set((state) => ({
    currentIndex: Math.min(state.currentIndex + 1, state.candidates.length - 1),
  })),
  setMatches: (matches) => set({ matches }),
  setActiveReport: (activeReport) => set({ activeReport }),
  setMode: (mode) => set({ mode }),
  setLoading: (isLoading) => set({ isLoading }),
}));
