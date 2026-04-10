import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import DiscoveryScreen from './DiscoveryScreen';

type Tab = 'discover' | 'messages' | 'profile';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'discover', label: 'Discover', icon: '✦' },
  { key: 'messages', label: 'Messages', icon: '💬' },
  { key: 'profile', label: 'Profile', icon: '⚙' },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('discover');

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <DiscoveryScreen />;
      case 'messages':
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>💬</Text>
            <Text style={styles.placeholderTitle}>Messages</Text>
            <Text style={styles.placeholderText}>
              When you match with someone, your conversations will appear here.
            </Text>
          </View>
        );
      case 'profile':
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>⚙</Text>
            <Text style={styles.placeholderTitle}>Your Profile</Text>
            <Text style={styles.placeholderText}>
              Edit your photos, bio, and preferences. Coming soon.
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.tabDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(232,221,208,0.08)',
    backgroundColor: colors.background,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.4,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontFamily: fontFamily.body,
    fontSize: 11,
    color: 'rgba(232,221,208,0.35)',
  },
  tabLabelActive: {
    fontFamily: fontFamily.bodySemibold,
    color: colors.gold,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginTop: 2,
  },

  // Placeholder tabs
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 24,
    color: '#faf5eb',
  },
  placeholderText: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: 'rgba(232,221,208,0.4)',
    textAlign: 'center',
    lineHeight: 22,
  },
});
