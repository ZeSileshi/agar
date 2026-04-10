import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';

export type UserType = 'direct' | 'referrer';

const ONBOARDING_KEY = 'agar_onboarding_complete';
const BIOMETRIC_KEY = 'agar_biometric_enabled';

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
  language: 'en' | 'am' | 'es';

  // Actions
  setPhone: (phone: string) => void;
  setOtp: (otp: string) => void;
  setUserType: (userType: UserType) => void;

  // Supabase auth actions
  sendOtp: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, code: string) => Promise<{ error: string | null }>;
  completeOnboarding: () => void;
  enableBiometric: () => void;
  logout: () => Promise<void>;

  setLanguage: (lang: 'en' | 'am' | 'es') => void;
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
    set({ isLoading: true });
    const { error } = await supabase.auth.signInWithOtp({ phone });
    set({ isLoading: false });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  },

  verifyOtp: async (phone, code) => {
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
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync(ONBOARDING_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
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
    // Check Supabase session
    const { data: { session } } = await supabase.auth.getSession();

    // Check onboarding/biometric flags
    const onboardingDone = await SecureStore.getItemAsync(ONBOARDING_KEY);
    const biometricOn = await SecureStore.getItemAsync(BIOMETRIC_KEY);

    if (session) {
      set({
        userId: session.user.id,
        isAuthenticated: true,
        onboardingComplete: onboardingDone === 'true',
        biometricEnabled: biometricOn === 'true',
        isHydrated: true,
      });
    } else {
      set({ isHydrated: true });
    }
  },
}));
