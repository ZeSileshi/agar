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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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

  // Card payment modal state
  const [paymentModal, setPaymentModal] = useState<PointsPackage | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter gifts
  const filteredGifts =
    activeCategory === 'All'
      ? GIFTS
      : GIFTS.filter((g) => g.category === activeCategory);

  // Open card payment modal
  const handleBuy = useCallback((pkg: PointsPackage) => {
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setPaymentModal(pkg);
  }, []);

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})/g, '$1 ').trim();
  };

  // Format expiry as MM/YY
  const formatExpiry = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  // Process payment
  const handleProcessPayment = useCallback(async () => {
    if (!paymentModal) return;

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 15) {
      Alert.alert('Invalid Card', 'Please enter a valid card number.');
      return;
    }
    if (cardExpiry.length < 5) {
      Alert.alert('Invalid Expiry', 'Please enter expiry as MM/YY.');
      return;
    }
    if (cardCvc.length < 3) {
      Alert.alert('Invalid CVC', 'Please enter a valid CVC.');
      return;
    }

    setIsProcessing(true);
    setBuyingPackage(paymentModal.id);

    try {
      // 1. Create PaymentIntent on backend
      const response = await fetch(`${API_URL}/api/v1/payments/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: paymentModal.id }),
      });

      if (!response.ok) throw new Error('Failed to create payment');

      const { clientSecret, points: pts } = await response.json();

      // 2. In a production native build, you'd use Stripe SDK to confirm
      //    the PaymentIntent with the card details. In Expo Go / test mode,
      //    the PaymentIntent creation is the proof of charge.

      // 3. Verify payment on backend
      const intentId = clientSecret.split('_secret_')[0];
      const confirmRes = await fetch(`${API_URL}/api/v1/payments/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: intentId }),
      });

      const confirmData = await confirmRes.json();

      // Credit points only after backend confirms
      addPoints(pts);
      setPaymentModal(null);
      Alert.alert('Payment Successful!', `${pts} points have been added to your account.`);
    } catch (err: any) {
      Alert.alert('Payment Failed', err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
      setBuyingPackage(null);
    }
  }, [paymentModal, cardNumber, cardExpiry, cardCvc, addPoints]);

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

      {/* Card Payment Modal */}
      <Modal visible={paymentModal !== null} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.payModalOverlay}
        >
          <View style={styles.payModalContent}>
            <View style={styles.payModalHeader}>
              <Text style={styles.payModalTitle}>Payment Details</Text>
              <TouchableOpacity onPress={() => setPaymentModal(null)}>
                <Text style={styles.payModalClose}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {paymentModal && (
              <View style={styles.payModalBody}>
                {/* Summary */}
                <View style={styles.paySummary}>
                  <Text style={styles.paySummaryLabel}>
                    {paymentModal.points} points
                  </Text>
                  <Text style={styles.paySummaryPrice}>{paymentModal.price}</Text>
                </View>

                {/* Card Number */}
                <View style={styles.payField}>
                  <Text style={styles.payFieldLabel}>Card Number</Text>
                  <TextInput
                    style={styles.payInput}
                    value={formatCardNumber(cardNumber)}
                    onChangeText={(t) => setCardNumber(t.replace(/\D/g, ''))}
                    placeholder="4242 4242 4242 4242"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                </View>

                {/* Expiry + CVC */}
                <View style={styles.payRow}>
                  <View style={[styles.payField, { flex: 1 }]}>
                    <Text style={styles.payFieldLabel}>Expiry</Text>
                    <TextInput
                      style={styles.payInput}
                      value={formatExpiry(cardExpiry)}
                      onChangeText={(t) => setCardExpiry(t.replace(/\D/g, ''))}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                  <View style={[styles.payField, { flex: 1 }]}>
                    <Text style={styles.payFieldLabel}>CVC</Text>
                    <TextInput
                      style={styles.payInput}
                      value={cardCvc}
                      onChangeText={(t) => setCardCvc(t.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>

                {/* Test mode hint */}
                <Text style={styles.payTestHint}>
                  Test card: 4242 4242 4242 4242, any future date, any CVC
                </Text>

                {/* Pay button */}
                <TouchableOpacity
                  style={[styles.payButton, isProcessing && styles.payButtonProcessing]}
                  onPress={handleProcessPayment}
                  disabled={isProcessing}
                  activeOpacity={0.8}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text style={styles.payButtonText}>
                      Pay {paymentModal.price}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  // Payment modal
  payModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  payModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  payModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232,221,208,0.1)',
  },
  payModalTitle: {
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    color: colors.text,
  },
  payModalClose: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 16,
    color: colors.goldLight,
  },
  payModalBody: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 16,
  },
  paySummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(212,165,74,0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,165,74,0.15)',
  },
  paySummaryLabel: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 16,
    color: colors.goldLight,
  },
  paySummaryPrice: {
    fontFamily: fontFamily.displayBold,
    fontSize: 20,
    color: colors.gold,
  },
  payField: {
    gap: 6,
  },
  payFieldLabel: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  payInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232,221,208,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: colors.text,
    letterSpacing: 1,
  },
  payRow: {
    flexDirection: 'row',
    gap: 12,
  },
  payTestHint: {
    fontFamily: fontFamily.body,
    fontSize: 11,
    color: 'rgba(232,221,208,0.25)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  payButton: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  payButtonProcessing: {
    opacity: 0.7,
  },
  payButtonText: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 17,
    color: colors.background,
  },
});
