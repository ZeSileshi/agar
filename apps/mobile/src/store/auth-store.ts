import { create } from 'zustand';

export type UserType = 'direct' | 'referrer';

interface AuthState {
  // Registration flow
  phone: string;
  otp: string;
  userType: UserType | null;

  // Auth tokens
  accessToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Profile data (collected during onboarding)
  language: 'en' | 'am' | 'es';

  // Actions
  setPhone: (phone: string) => void;
  setOtp: (otp: string) => void;
  setUserType: (userType: UserType) => void;
  login: (accessToken: string, userId: string) => void;
  logout: () => void;
  setLanguage: (lang: 'en' | 'am' | 'es') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  phone: '',
  otp: '',
  userType: null,
  accessToken: null,
  userId: null,
  isAuthenticated: false,
  isLoading: false,
  language: 'en',

  setPhone: (phone) => set({ phone }),
  setOtp: (otp) => set({ otp }),
  setUserType: (userType) => set({ userType }),

  login: (accessToken, userId) =>
    set({
      accessToken,
      userId,
      isAuthenticated: true,
      isLoading: false,
    }),

  logout: () =>
    set({
      phone: '',
      otp: '',
      userType: null,
      accessToken: null,
      userId: null,
      isAuthenticated: false,
    }),

  setLanguage: (language) => set({ language }),
}));
