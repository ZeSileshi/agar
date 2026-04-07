import React from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initI18n } from '@agar/i18n';

// Initialize i18n
initI18n('en');

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0f0f23" />
        <View style={styles.container}>
          <Text style={styles.logo}>A</Text>
          <Text style={styles.title}>Agar</Text>
          <Text style={styles.titleAmharic}>አጋር</Text>
          <Text style={styles.subtitle}>Where stars align & hearts connect</Text>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 64,
    fontWeight: '800',
    color: '#6c5ce7',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  titleAmharic: {
    fontSize: 24,
    color: '#a78bfa',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#71717a',
    textAlign: 'center',
  },
});
