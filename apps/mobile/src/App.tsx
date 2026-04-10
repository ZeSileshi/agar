import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  Urbanist_800ExtraBold,
} from '@expo-google-fonts/urbanist';
import { initI18n } from '@agar/i18n';
import { colors } from './theme/colors';
import { useAuthStore } from './store/auth-store';
import { useProfileStore } from './store/profile-store';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import PhoneEntryScreen from './screens/auth/PhoneEntryScreen';
import OTPScreen from './screens/auth/OTPScreen';
import LockScreen from './screens/auth/LockScreen';
import UserTypeScreen from './screens/auth/UserTypeScreen';
import BasicInfoScreen from './screens/onboarding/BasicInfoScreen';
import PhotoUploadScreen from './screens/onboarding/PhotoUploadScreen';
import PalmScanScreen from './screens/onboarding/PalmScanScreen';
import HomeScreen from './screens/HomeScreen';

// Initialize i18n
initI18n('en');

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync().catch(() => {});

type Screen =
  | 'welcome'
  | 'phone'
  | 'otp'
  | 'lock'
  | 'userType'
  | 'basicInfo'
  | 'photoUpload'
  | 'palmScan'
  | 'home';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [appReady, setAppReady] = useState(false);

  const {
    isAuthenticated,
    onboardingComplete,
    isHydrated,
    hydrate,
    completeOnboarding,
    enableBiometric,
    logout,
  } = useAuthStore();

  const [fontsLoaded, fontError] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,

  });

  // Hydrate session on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Decide initial screen once ready
  useEffect(() => {
    if ((fontsLoaded || fontError) && isHydrated) {
      if (isAuthenticated && onboardingComplete) {
        // Returning user — show lock screen for biometric/PIN
        setScreen('lock');
      } else if (isAuthenticated && !onboardingComplete) {
        // Authenticated but hasn't finished onboarding
        setScreen('userType');
      }
      // else: not authenticated → stays on 'welcome'

      setAppReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, isHydrated, isAuthenticated, onboardingComplete]);

  if (!appReady) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setScreen('welcome');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen onGetStarted={() => setScreen('phone')} />;

      case 'phone':
        return <PhoneEntryScreen onContinue={() => setScreen('otp')} />;

      case 'otp':
        return (
          <OTPScreen
            onVerified={() => setScreen('userType')}
            onBack={() => setScreen('phone')}
          />
        );

      case 'lock':
        return (
          <LockScreen
            onUnlocked={() => setScreen('home')}
            onLogout={handleLogout}
          />
        );

      case 'userType':
        return <UserTypeScreen onContinue={() => setScreen('basicInfo')} />;

      case 'basicInfo': {
        const isReferrer = useAuthStore.getState().userType === 'referrer';
        return (
          <BasicInfoScreen
            onContinue={(data) => {
              useProfileStore.getState().setFirstName(data.firstName);
              setScreen('photoUpload');
            }}
            onBack={() => setScreen('userType')}
          />
        );
      }

      case 'photoUpload': {
        const isReferrer = useAuthStore.getState().userType === 'referrer';
        return (
          <PhotoUploadScreen
            onContinue={(photos) => {
              useProfileStore.getState().setPhotos(photos);
              // Referrers skip palm scan — go straight to home
              if (isReferrer) {
                completeOnboarding();
                enableBiometric();
                setScreen('home');
              } else {
                setScreen('palmScan');
              }
            }}
            onBack={() => setScreen('basicInfo')}
            optional={isReferrer}
          />
        );
      }

      case 'palmScan':
        return (
          <PalmScanScreen
            onContinue={(_reading) => {
              completeOnboarding();
              enableBiometric();
              setScreen('home');
            }}
            onBack={() => setScreen('photoUpload')}
          />
        );

      case 'home':
        return <HomeScreen onLogout={handleLogout} />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        {renderScreen()}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
