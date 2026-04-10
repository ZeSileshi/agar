import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import DiscoveryScreen from './DiscoveryScreen';
import MessagesScreen from './MessagesScreen';
import ShopScreen from './ShopScreen';
import ProfileScreen from './ProfileScreen';
import ChatScreen from './ChatScreen';

type Tab = 'discover' | 'messages' | 'shop' | 'profile';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'discover', label: 'Discover', icon: '✦' },
  { key: 'messages', label: 'Messages', icon: '💬' },
  { key: 'shop', label: 'Shop', icon: '🛍' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [chatTarget, setChatTarget] = useState<{ matchId: string; name: string } | null>(null);

  // If in a chat, show chat screen over everything
  if (chatTarget) {
    return (
      <ChatScreen
        matchId={chatTarget.matchId}
        partnerName={chatTarget.name}
        onBack={() => setChatTarget(null)}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return (
          <DiscoveryScreen
            onOpenChat={(matchId, name) => {
              setChatTarget({ matchId, name });
            }}
          />
        );
      case 'messages':
        return (
          <MessagesScreen
            onOpenChat={(matchId) => {
              const names: Record<string, string> = {
                'match-001': 'Hanna', 'match-002': 'Sara', 'match-003': 'Meron',
                'match-004': 'Liya', 'match-005': 'Bethlehem',
              };
              setChatTarget({ matchId, name: names[matchId] ?? 'Match' });
            }}
          />
        );
      case 'shop':
        return <ShopScreen />;
      case 'profile':
        return <ProfileScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom tab bar */}
      <SafeAreaView edges={['bottom']} style={styles.tabBarSafe}>
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
    </View>
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
  tabBarSafe: {
    backgroundColor: colors.background,
  },
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
});
