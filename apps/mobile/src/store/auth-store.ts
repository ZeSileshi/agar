import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type UserType = 'direct' | 'referrer';

const STORAGE_KEY = 'agar_auth_session';

interface SessionData {
  accessToken: string;
  userId: string;
  onboardingComplete: boolean;
}

interface AuthState {
  // Registration flow
  phone: string;
  otp: string;
  userType: UserType | null;

  // Auth tokens
  accessToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Profile data
  language: 'en' | 'am' | 'es';

  // Actions
  setPhone: (phone: string) => void;
  setOtp: (otp: string) => void;
  setUserType: (userType: UserType) => void;
  login: (accessToken: string, userId: string) => void;
  completeOnboarding: () => void;
  logout: () => void;
  setLanguage: (lang: 'en' | 'am' | 'es') => void;
  hydrate: () => Promise<void>;
}

async function saveSession(data: SessionData) {
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(data));
}

async function clearSession() {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

async function loadSession(): Promise<SessionData | null> {
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  phone: '',
  otp: '',
  userType: null,
  accessToken: null,
  userId: null,
  isAuthenticated: false,
  onboardingComplete: false,
  isLoading: false,
  isHydrated: false,
  language: 'en',

  setPhone: (phone) => set({ phone }),
  setOtp: (otp) => set({ otp }),
  setUserType: (userType) => set({ userType }),

  login: (accessToken, userId) => {
    set({
      accessToken,
      userId,
      isAuthenticated: true,
      isLoading: false,
    });
    saveSession({ accessToken, userId, onboardingComplete: get().onboardingComplete });
  },

  completeOnboarding: () => {
    set({ onboardingComplete: true });
    const { accessToken, userId } = get();
    if (accessToken && userId) {
      saveSession({ accessToken, userId, onboardingComplete: true });
    }
  },

  logout: () => {
    set({
      phone: '',
      otp: '',
      userType: null,
      accessToken: null,
      userId: null,
      isAuthenticated: false,
      onboardingComplete: false,
    });
    clearSession();
  },

  setLanguage: (language) => set({ language }),

  hydrate: async () => {
    const session = await loadSession();
    if (session) {
      set({
        accessToken: session.accessToken,
        userId: session.userId,
        isAuthenticated: true,
        onboardingComplete: session.onboardingComplete,
        isHydrated: true,
      });
    } else {
      set({ isHydrated: true });
    }
  },
}));
