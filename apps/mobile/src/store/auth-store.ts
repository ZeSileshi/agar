import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type UserType = 'direct' | 'referrer';

const ONBOARDING_KEY = 'agar_onboarding_complete';
const BIOMETRIC_KEY = 'agar_biometric_enabled';
const SESSION_KEY = 'agar_demo_session';

interface AuthState {
  // Registration flow
  phone: string;
  otp: string;
  userType: UserType | null;

  // Auth
  userId: string | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  biometricEnabled: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Profile
  language: 'en' | 'es';

  // Actions
  setPhone: (phone: string) => void;
  setOtp: (otp: string) => void;
  setUserType: (userType: UserType) => void;

  sendOtp: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, code: string) => Promise<{ error: string | null }>;
  completeOnboarding: () => void;
  enableBiometric: () => void;
  logout: () => Promise<void>;

  setLanguage: (lang: 'en' | 'es') => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  phone: '',
  otp: '',
  userType: null,
  userId: null,
  isAuthenticated: false,
  onboardingComplete: false,
  biometricEnabled: false,
  isLoading: false,
  isHydrated: false,
  language: 'en',

  setPhone: (phone) => set({ phone }),
  setOtp: (otp) => set({ otp }),
  setUserType: (userType) => set({ userType }),

  sendOtp: async (phone) => {
    if (!isSupabaseConfigured) {
      // Demo mode: simulate OTP send
      await new Promise((r) => setTimeout(r, 800));
      return { error: null };
    }

    set({ isLoading: true });
    const { error } = await supabase.auth.signInWithOtp({ phone });
    set({ isLoading: false });
    return { error: error?.message ?? null };
  },

  verifyOtp: async (phone, code) => {
    if (!isSupabaseConfigured) {
      // Demo mode: accept any 6-digit code
      await new Promise((r) => setTimeout(r, 1000));
      const demoUserId = 'demo_user_' + Date.now();
      set({ userId: demoUserId, isAuthenticated: true });
      await SecureStore.setItemAsync(SESSION_KEY, demoUserId);
      return { error: null };
    }

    set({ isLoading: true });
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    });
    set({ isLoading: false });

    if (error) {
      return { error: error.message };
    }

    if (data.session) {
      set({
        userId: data.session.user.id,
        isAuthenticated: true,
      });
    }

    return { error: null };
  },

  completeOnboarding: async () => {
    set({ onboardingComplete: true });
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
  },

  enableBiometric: async () => {
    set({ biometricEnabled: true });
    await SecureStore.setItemAsync(BIOMETRIC_KEY, 'true');
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    await SecureStore.deleteItemAsync(ONBOARDING_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
    await SecureStore.deleteItemAsync(SESSION_KEY);
    set({
      phone: '',
      otp: '',
      userType: null,
      userId: null,
      isAuthenticated: false,
      onboardingComplete: false,
      biometricEnabled: false,
    });
  },

  setLanguage: (language) => set({ language }),

  hydrate: async () => {
    const onboardingDone = await SecureStore.getItemAsync(ONBOARDING_KEY);
    const biometricOn = await SecureStore.getItemAsync(BIOMETRIC_KEY);

    if (isSupabaseConfigured) {
      // Real mode: check Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        set({
          userId: session.user.id,
          isAuthenticated: true,
          onboardingComplete: onboardingDone === 'true',
          biometricEnabled: biometricOn === 'true',
          isHydrated: true,
        });
        return;
      }
    } else {
      // Demo mode: check local session
      const demoSession = await SecureStore.getItemAsync(SESSION_KEY);
      if (demoSession) {
        set({
          userId: demoSession,
          isAuthenticated: true,
          onboardingComplete: onboardingDone === 'true',
          biometricEnabled: biometricOn === 'true',
          isHydrated: true,
        });
        return;
      }
    }

    set({ isHydrated: true });
  },
}));
