import { create } from 'zustand';
import type { User, AuthTokens } from '@agar/shared';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  language: 'en' | 'am' | 'es';
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLanguage: (lang: 'en' | 'am' | 'es') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  language: 'en',
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setTokens: (tokens) => set({ tokens }),
  setLanguage: (language) => set({ language }),
  logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
}));
