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

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import PhoneEntryScreen from './screens/auth/PhoneEntryScreen';
import OTPScreen from './screens/auth/OTPScreen';
import UserTypeScreen from './screens/auth/UserTypeScreen';
import BasicInfoScreen from './screens/onboarding/BasicInfoScreen';
import PhotoUploadScreen from './screens/onboarding/PhotoUploadScreen';
import PalmScanScreen from './screens/onboarding/PalmScanScreen';
import HomeScreen from './screens/HomeScreen';

// Initialize i18n
initI18n('en');

// Keep splash visible while loading fonts + session
SplashScreen.preventAutoHideAsync().catch(() => {});

type Screen =
  | 'welcome'
  | 'phone'
  | 'otp'
  | 'userType'
  | 'basicInfo'
  | 'photoUpload'
  | 'palmScan'
  | 'home';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [appReady, setAppReady] = useState(false);

  const { isAuthenticated, onboardingComplete, isHydrated, hydrate, completeOnboarding } =
    useAuthStore();

  const [fontsLoaded, fontError] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    NotoSansEthiopic: require('./assets/fonts/NotoSansEthiopic.ttf'),
  });

  // Hydrate session from secure storage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Once fonts + session are ready, decide initial screen
  useEffect(() => {
    if ((fontsLoaded || fontError) && isHydrated) {
      // Returning user with completed onboarding → straight to discovery
      if (isAuthenticated && onboardingComplete) {
        setScreen('home');
      }
      setAppReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, isHydrated, isAuthenticated, onboardingComplete]);

  if (!appReady) {
    return null; // Splash screen is still visible
  }

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

      case 'userType':
        return <UserTypeScreen onContinue={() => setScreen('basicInfo')} />;

      case 'basicInfo':
        return (
          <BasicInfoScreen
            onContinue={(_data) => setScreen('photoUpload')}
            onBack={() => setScreen('userType')}
          />
        );

      case 'photoUpload':
        return (
          <PhotoUploadScreen
            onContinue={(_photos) => setScreen('palmScan')}
            onBack={() => setScreen('basicInfo')}
          />
        );

      case 'palmScan':
        return (
          <PalmScanScreen
            onContinue={(_reading) => {
              completeOnboarding();
              setScreen('home');
            }}
            onBack={() => setScreen('photoUpload')}
          />
        );

      case 'home':
        return <HomeScreen />;
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
