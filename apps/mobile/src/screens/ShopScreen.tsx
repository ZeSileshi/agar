import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import { usePointsStore } from '../store/points-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GiftCategory = 'All' | 'Romantic' | 'Fun' | 'Premium';

interface Gift {
  emoji: string;
  name: string;
  cost: number;
  category: Exclude<GiftCategory, 'All'>;
}

interface PointsPackage {
  id: string;
  points: number;
  price: string;
  badge?: string;
}

interface Transaction {
  id: string;
  label: string;
  amount: number;
  date: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PACKAGES: PointsPackage[] = [
  { id: 'small', points: 20, price: '$5.00' },
  { id: 'medium', points: 50, price: '$10.00', badge: 'Popular' },
  { id: 'large', points: 120, price: '$20.00', badge: 'Best Value' },
];

const GIFTS: Gift[] = [
  // Romantic
  { emoji: '\u{1F339}', name: 'Rose', cost: 10, category: 'Romantic' },
  { emoji: '\u{1F48B}', name: 'Kiss', cost: 40, category: 'Romantic' },
  { emoji: '\u{1F490}', name: 'Bouquet', cost: 50, category: 'Romantic' },
  { emoji: '\u{1F48C}', name: 'Love Letter', cost: 30, category: 'Romantic' },
  { emoji: '\u{1F36B}', name: 'Heart Chocolates', cost: 35, category: 'Romantic' },
  // Fun
  { emoji: '\u{2615}', name: 'Coffee Date', cost: 15, category: 'Fun' },
  { emoji: '\u{1F320}', name: 'Shooting Star', cost: 20, category: 'Fun' },
  { emoji: '\u{1F355}', name: 'Pizza', cost: 10, category: 'Fun' },
  { emoji: '\u{1F3B5}', name: 'Mixtape', cost: 25, category: 'Fun' },
  // Premium
  { emoji: '\u{1F48E}', name: 'Diamond', cost: 100, category: 'Premium' },
  { emoji: '\u{1F451}', name: 'Crown', cost: 75, category: 'Premium' },
  { emoji: '\u{1F48D}', name: 'Promise Ring', cost: 150, category: 'Premium' },
  { emoji: '\u{2708}\u{FE0F}', name: 'Dream Trip', cost: 80, category: 'Premium' },
];

const CATEGORIES: GiftCategory[] = ['All', 'Romantic', 'Fun', 'Premium'];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', label: 'Sent Rose to Liya', amount: -10, date: 'Apr 7' },
  { id: '2', label: 'Purchased 50 pts', amount: 50, date: 'Apr 5' },
  { id: '3', label: 'Sent Coffee Date to Abebe', amount: -15, date: 'Apr 3' },
  { id: '4', label: 'Welcome bonus', amount: 20, date: 'Apr 1' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ShopScreen() {
  const { balance: points, addPoints, spendPoints } = usePointsStore();
  const [activeCategory, setActiveCategory] = useState<GiftCategory>('All');
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [buyingPackage, setBuyingPackage] = useState<string | null>(null);

  // Filter gifts
  const filteredGifts =
    activeCategory === 'All'
      ? GIFTS
      : GIFTS.filter((g) => g.category === activeCategory);

  // Payment handler — creates Stripe payment intent via API, then credits points
  const handleBuy = useCallback(
    async (pkg: PointsPackage) => {
      setBuyingPackage(pkg.id);

      try {
        // Confirm purchase with user
        await new Promise<void>((resolve, reject) => {
          Alert.alert(
            'Purchase Points',
            `Buy ${pkg.points} points for ${pkg.price}?`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => reject(new Error('cancelled')) },
              { text: `Pay ${pkg.price}`, onPress: () => resolve() },
            ],
          );
        });

        // Create Stripe PaymentIntent via API
        const response = await fetch(`${API_URL}/api/v1/payments/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: pkg.id }),
        });

        if (!response.ok) throw new Error('Payment failed');

        // Payment intent created — credit points
        // In production with native builds, the Stripe payment sheet would
        // collect card details here. For now, the intent creation is the charge.
        addPoints(pkg.points);
        Alert.alert('Purchase Complete!', `${pkg.points} points added to your account.`);
      } catch (err: any) {
        if (err?.message !== 'cancelled') {
          Alert.alert('Error', err?.message ?? 'Something went wrong. Make sure the API server is running.');
        }
      } finally {
        setBuyingPackage(null);
      }
    },
    [addPoints],
  );

  const handleSendGift = useCallback(
    (gift: Gift) => {
      const spent = spendPoints(gift.cost);
      if (!spent) return;
      Alert.alert('Gift Sent!', `You sent a ${gift.name} ${gift.emoji}`, [
        { text: 'OK' },
      ]);
    },
    [spendPoints],
  );

  // --------------------------------------------------
  // Render helpers
  // --------------------------------------------------

  const renderBalanceCard = () => (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceLabel}>Your Balance</Text>
      <View style={styles.balanceRow}>
        <Text style={styles.balanceAmount}>{points}</Text>
        <Text style={styles.balanceCurrency}> pts</Text>
      </View>
      <View style={styles.balanceShine} />
    </View>
  );

  const renderPackages = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Get Points</Text>
      <View style={styles.packagesRow}>
        {PACKAGES.map((pkg) => (
          <View key={pkg.points} style={styles.packageCard}>
            {pkg.badge ? (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{pkg.badge}</Text>
              </View>
            ) : null}
            <Text style={styles.packagePoints}>{pkg.points}</Text>
            <Text style={styles.packagePtsLabel}>points</Text>
            <Text style={styles.packagePrice}>{pkg.price}</Text>
            <TouchableOpacity
              style={[styles.buyButton, buyingPackage === pkg.id && styles.buyButtonLoading]}
              activeOpacity={0.8}
              onPress={() => handleBuy(pkg)}
              disabled={buyingPackage !== null}
            >
              {buyingPackage === pkg.id ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={styles.buyButtonText}>Buy</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsContainer}
    >
      {CATEGORIES.map((cat) => {
        const isActive = cat === activeCategory;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.7}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderGiftGrid = () => (
    <View style={styles.giftGrid}>
      {filteredGifts.map((gift) => {
        const disabled = gift.cost > points;
        return (
          <TouchableOpacity
            key={gift.name}
            style={[styles.giftCard, disabled && styles.giftCardDisabled]}
            activeOpacity={disabled ? 1 : 0.7}
            onPress={() => handleSendGift(gift)}
            disabled={disabled}
          >
            <Text style={styles.giftEmoji}>{gift.emoji}</Text>
            <Text
              style={[styles.giftName, disabled && styles.giftTextDisabled]}
              numberOfLines={1}
            >
              {gift.name}
            </Text>
            <View style={styles.giftCostRow}>
              <Text
                style={[
                  styles.giftCost,
                  disabled && styles.giftTextDisabled,
                ]}
              >
                {gift.cost} pts
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderHistory = () => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.historyHeader}
        activeOpacity={0.7}
        onPress={() => setHistoryExpanded((prev) => !prev)}
      >
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <Text style={styles.chevron}>{historyExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {historyExpanded && (
        <View style={styles.historyList}>
          {MOCK_TRANSACTIONS.map((tx) => (
            <View key={tx.id} style={styles.historyRow}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyLabel}>{tx.label}</Text>
                <Text style={styles.historyDate}>{tx.date}</Text>
              </View>
              <Text
                style={[
                  styles.historyAmount,
                  tx.amount > 0
                    ? styles.historyPositive
                    : styles.historyNegative,
                ]}
              >
                {tx.amount > 0 ? '+' : ''}
                {tx.amount} pts
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // --------------------------------------------------
  // Main render
  // --------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.screenTitle}>Shop</Text>

        {/* Balance */}
        {renderBalanceCard()}

        {/* Packages */}
        {renderPackages()}

        {/* Gifts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send a Gift</Text>
          {renderCategoryTabs()}
          {renderGiftGrid()}
        </View>

        {/* History */}
        {renderHistory()}

        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const CARD_GAP = 12;
const GIFT_COLUMNS = 3;
const GIFT_CARD_WIDTH =
  (SCREEN_WIDTH - 32 - CARD_GAP * (GIFT_COLUMNS - 1)) / GIFT_COLUMNS;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Header
  screenTitle: {
    fontFamily: fontFamily.displayExtrabold,
    fontSize: 28,
    color: colors.gold,
    marginBottom: 20,
    letterSpacing: -0.5,
  },

  // Balance card
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.25)',
    overflow: 'hidden',
    alignItems: 'center',
  },
  balanceLabel: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  balanceAmount: {
    fontFamily: fontFamily.displayExtrabold,
    fontSize: 56,
    color: colors.gold,
    letterSpacing: -2,
  },
  balanceCurrency: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 20,
    color: colors.goldLight,
  },
  balanceShine: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212,165,74,0.06)',
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 20,
    color: colors.text,
    marginBottom: 14,
    letterSpacing: -0.3,
  },

  // Packages
  packagesRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  packageCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.08)',
  },
  badgeContainer: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  badgeText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 10,
    color: colors.background,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  packagePoints: {
    fontFamily: fontFamily.displayExtrabold,
    fontSize: 32,
    color: colors.goldLight,
    letterSpacing: -1,
  },
  packagePtsLabel: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  packagePrice: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  buyButton: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 24,
    minWidth: 64,
    alignItems: 'center',
  },
  buyButtonLoading: {
    opacity: 0.7,
  },
  buyButtonText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 14,
    color: colors.background,
    letterSpacing: 0.2,
  },

  // Category tabs
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.08)',
  },
  tabActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  tabText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 14,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.background,
  },

  // Gift grid
  giftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  giftCard: {
    width: GIFT_CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.08)',
  },
  giftCardDisabled: {
    opacity: 0.35,
  },
  giftEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  giftName: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  giftCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftCost: {
    fontFamily: fontFamily.accentBold,
    fontSize: 13,
    color: colors.goldLight,
  },
  giftTextDisabled: {
    color: colors.textMuted,
  },

  // History
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 14,
    color: colors.textMuted,
  },
  historyList: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,221,208,0.06)',
  },
  historyLeft: {
    flex: 1,
    marginRight: 12,
  },
  historyLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  historyDate: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  historyAmount: {
    fontFamily: fontFamily.accentBold,
    fontSize: 15,
  },
  historyPositive: {
    color: colors.success,
  },
  historyNegative: {
    color: colors.accent[400],
  },
});
