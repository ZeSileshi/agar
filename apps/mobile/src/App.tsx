import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, View, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { initI18n } from '@agar/i18n';
import { colors } from './theme/colors';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import PhoneEntryScreen from './screens/auth/PhoneEntryScreen';
import OTPScreen from './screens/auth/OTPScreen';
import UserTypeScreen from './screens/auth/UserTypeScreen';
import BasicInfoScreen from './screens/onboarding/BasicInfoScreen';
import PhotoUploadScreen from './screens/onboarding/PhotoUploadScreen';
import PalmScanScreen from './screens/onboarding/PalmScanScreen';
import DiscoveryScreen from './screens/DiscoveryScreen';

// Initialize i18n
initI18n('en');

// Keep splash visible while loading fonts
SplashScreen.preventAutoHideAsync().catch(() => {});

type Screen =
  | 'welcome'
  | 'phone'
  | 'otp'
  | 'userType'
  | 'basicInfo'
  | 'photoUpload'
  | 'palmScan'
  | 'discovery';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    NotoSansEthiopic: require('./assets/fonts/NotoSansEthiopic.ttf'),
  });

  // Proceed when fonts are loaded OR if they error (use system fonts as fallback)
  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

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
            onContinue={(_reading) => setScreen('discovery')}
            onBack={() => setScreen('photoUpload')}
          />
        );

      case 'discovery':
        return <DiscoveryScreen />;
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
