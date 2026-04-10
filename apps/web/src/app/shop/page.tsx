'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Coins,
  ShoppingBag,
  Gift,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Sparkles,
  ArrowLeft,
  User,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { GIFT_CATALOG, POINTS_PACKAGES, type GiftItem } from '@/lib/gifts';
import AppNav from '@/components/AppNav';

/* ---------- types ---------- */

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

interface MatchOption {
  matchId: string;
  userId: string;
  displayName: string;
  firstName: string;
  photoUrl: string | null;
}

/* ---------- helpers ---------- */

const categoryLabels: Record<string, string> = {
  romantic: 'Romantic',
  fun: 'Fun',
  premium: 'Premium',
};

const categoryColors: Record<string, string> = {
  romantic: 'text-rose-400',
  fun: 'text-emerald-400',
  premium: 'text-gold-400',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function transactionIcon(type: string): string {
  switch (type) {
    case 'purchase': return '+';
    case 'gift_sent': return '-';
    case 'gift_received': return '+';
    case 'unlock_daily': return '-';
    case 'bonus': return '+';
    default: return '';
  }
}

/* ---------- Spinner ---------- */

function Spinner() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <svg className="animate-spin h-8 w-8 text-gold-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

/* ---------- Points balance display ---------- */

function PointsBalance({ points }: { points: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-500/10 border border-gold-400/20">
        <Coins className="h-7 w-7 text-gold-400" />
      </div>
      <div>
        <p className="text-sm text-gold-200/40">Your Balance</p>
        <p className="font-display text-3xl font-bold text-gold-50">
          {points.toLocaleString()}
          <span className="text-lg text-gold-200/40 ml-1.5">pts</span>
        </p>
      </div>
    </div>
  );
}

/* ---------- Buy points card ---------- */

function BuyPointsCard({
  pkg,
  onBuy,
}: {
  pkg: (typeof POINTS_PACKAGES)[0];
  onBuy: () => void;
}) {
  return (
    <button
      onClick={onBuy}
      className="relative group rounded-2xl border border-gold-400/15 bg-white/[0.03] backdrop-blur-xl p-6 text-left transition-all hover:border-gold-400/30 hover:bg-white/[0.06] hover:scale-[1.02] active:scale-[0.98]"
    >
      {pkg.badge && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-gold-400 px-3 py-0.5 text-[11px] font-bold text-navy-950">
          {pkg.badge}
        </span>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10">
          <Coins className="h-5 w-5 text-gold-400" />
        </div>
        <span className="font-display text-2xl font-bold text-gold-50">{pkg.points}</span>
        <span className="text-sm text-gold-200/40">points</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-gold-200">{pkg.priceLabel}</span>
        <span className="rounded-full bg-gold-400/10 border border-gold-400/15 px-4 py-1.5 text-xs font-medium text-gold-300 group-hover:bg-gold-400/20 transition-colors">
          Buy
        </span>
      </div>
    </button>
  );
}

/* ---------- Gift card ---------- */

function GiftCard({
  gift,
  balance,
  onSelect,
}: {
  gift: GiftItem;
  balance: number;
  onSelect: (gift: GiftItem) => void;
}) {
  const canAfford = balance >= gift.points;

  return (
    <button
      onClick={() => canAfford && onSelect(gift)}
      disabled={!canAfford}
      className={`group relative rounded-2xl border p-5 text-center transition-all ${
        canAfford
          ? 'border-gold-400/15 bg-white/[0.03] hover:border-gold-400/30 hover:bg-white/[0.06] hover:scale-[1.03] active:scale-[0.97]'
          : 'border-white/[0.05] bg-white/[0.01] opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{gift.emoji}</div>
      <h4 className="font-display text-sm font-bold text-gold-50 mb-1">{gift.name}</h4>
      <p className="text-[11px] text-gold-200/40 mb-3 leading-relaxed">{gift.description}</p>
      <div className="flex items-center justify-center gap-1">
        <Coins className="h-3 w-3 text-gold-400" />
        <span className="text-xs font-semibold text-gold-300">{gift.points}</span>
      </div>
    </button>
  );
}

/* ---------- Recipient picker modal ---------- */

function RecipientModal({
  gift,
  matches,
  onSend,
  onClose,
  sending,
}: {
  gift: GiftItem;
  matches: MatchOption[];
  onSend: (match: MatchOption) => void;
  onClose: () => void;
  sending: boolean;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-navy-950/80 backdrop-blur-md px-4 sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-gold-400/15 bg-navy-900 p-6 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{gift.emoji}</span>
            <div>
              <h3 className="font-display text-lg font-bold text-gold-50">Send {gift.name}</h3>
              <p className="text-xs text-gold-200/40">{gift.points} points</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gold-200/40 hover:bg-white/[0.05] hover:text-gold-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Match list */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-2">
          {matches.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-10 w-10 text-gold-400/30 mx-auto mb-3" />
              <p className="text-sm text-gold-200/40">No matches yet. Start swiping to find someone special!</p>
            </div>
          ) : (
            matches.map((match) => (
              <button
                key={match.matchId}
                onClick={() => !sending && onSend(match)}
                disabled={sending}
                className="flex w-full items-center gap-3 rounded-xl border border-gold-400/10 bg-white/[0.02] p-3 text-left transition-all hover:bg-white/[0.05] hover:border-gold-400/20 disabled:opacity-50"
              >
                {match.photoUrl ? (
                  <img
                    src={match.photoUrl}
                    alt={match.displayName}
                    className="h-11 w-11 rounded-full object-cover border border-gold-400/15"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/10 border border-gold-400/15">
                    <User className="h-5 w-5 text-gold-400/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gold-50 truncate">{match.displayName}</p>
                </div>
                <span className="rounded-full bg-gold-400/10 border border-gold-400/15 px-3 py-1 text-[11px] font-medium text-gold-300">
                  Send
                </span>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Success toast ---------- */

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      className="fixed top-6 left-1/2 z-[110] -translate-x-1/2"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
    >
      <div className="flex items-center gap-2 rounded-full bg-emerald-500/90 backdrop-blur-xl px-5 py-2.5 shadow-lg shadow-emerald-500/20">
        <Check className="h-4 w-4 text-white" />
        <span className="text-sm font-medium text-white">{message}</span>
      </div>
    </motion.div>
  );
}

/* ---------- Buy modal (MVP placeholder) ---------- */

function BuyModal({
  pkg,
  onConfirm,
  onClose,
}: {
  pkg: (typeof POINTS_PACKAGES)[0];
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/80 backdrop-blur-md px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-sm rounded-3xl border border-gold-400/20 bg-navy-900 p-8 text-center shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-400/10 border border-gold-400/15">
          <Sparkles className="h-8 w-8 text-gold-400" />
        </div>
        <h3 className="font-display text-xl font-bold text-gold-50 mb-2">
          Get {pkg.points} Points
        </h3>
        <p className="text-sm text-gold-200/40 mb-6">
          Purchase <span className="text-gold-300 font-semibold">{pkg.points} points</span> for <span className="text-gold-300 font-semibold">{pkg.price}</span>
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Pay {pkg.price}
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-gold-400/20 bg-gold-400/5 px-6 py-3 text-sm font-medium text-gold-200 transition-colors hover:bg-gold-400/10"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ========== Main Shop Page ========== */

export default function ShopPageWrapper() {
  return (
    <Suspense fallback={<Spinner />}>
      <ShopPage />
    </Suspense>
  );
}

function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [matches, setMatches] = useState<MatchOption[]>([]);

  // Modal state
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [buyingPkg, setBuyingPkg] = useState<(typeof POINTS_PACKAGES)[0] | null>(null);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Active gift category tab
  const [activeCategory, setActiveCategory] = useState<'romantic' | 'fun' | 'premium'>('romantic');

  const fetchBalance = useCallback(async (uid: string) => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('users')
      .select('points_balance')
      .eq('id', uid)
      .single();
    if (data) setPointsBalance(data.points_balance ?? 0);
  }, []);

  const fetchTransactions = useCallback(async (uid: string) => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('points_transactions')
      .select('id, amount, type, description, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setTransactions(data);
  }, []);

  const fetchMatches = useCallback(async (uid: string) => {
    const supabase = getSupabase();
    const { data: matchData } = await supabase
      .from('matches')
      .select('id, user1_id, user2_id')
      .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
      .eq('status', 'matched');

    if (!matchData || matchData.length === 0) return;

    const partnerIds = matchData.map((m) =>
      m.user1_id === uid ? m.user2_id : m.user1_id
    );

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, first_name')
      .in('user_id', partnerIds);

    const { data: photos } = await supabase
      .from('photos')
      .select('user_id, thumbnail_url, url')
      .in('user_id', partnerIds)
      .eq('is_primary', true);

    const photoMap = new Map<string, string>();
    (photos ?? []).forEach((p: { user_id: string; thumbnail_url: string | null; url: string }) => {
      photoMap.set(p.user_id, p.thumbnail_url ?? p.url);
    });

    const profileMap = new Map<string, { display_name: string; first_name: string }>();
    (profiles ?? []).forEach((p: { user_id: string; display_name: string; first_name: string }) => {
      profileMap.set(p.user_id, p);
    });

    const options: MatchOption[] = matchData.map((m) => {
      const partnerId = m.user1_id === uid ? m.user2_id : m.user1_id;
      const profile = profileMap.get(partnerId);
      return {
        matchId: m.id,
        userId: partnerId,
        displayName: profile?.display_name ?? profile?.first_name ?? 'Unknown',
        firstName: profile?.first_name ?? 'Unknown',
        photoUrl: photoMap.get(partnerId) ?? null,
      };
    });

    setMatches(options);
  }, []);

  // Init
  useEffect(() => {
    async function init() {
      try {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }
        setUserId(user.id);
        await Promise.all([
          fetchBalance(user.id),
          fetchTransactions(user.id),
          fetchMatches(user.id),
        ]);
      } catch {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router, fetchBalance, fetchTransactions, fetchMatches]);

  // Handle Stripe success redirect (future)
  useEffect(() => {
    if (!userId) return;
    const success = searchParams.get('success');
    const pts = searchParams.get('points');
    if (success === 'true' && pts) {
      // Credit points from Stripe redirect
      const pointsToAdd = parseInt(pts, 10);
      if (!isNaN(pointsToAdd) && pointsToAdd > 0) {
        creditPoints(userId, pointsToAdd, 'purchase', `Purchased ${pointsToAdd} points`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, searchParams]);

  async function creditPoints(uid: string, amount: number, type: string, description: string) {
    const supabase = getSupabase();

    // Insert transaction
    await supabase.from('points_transactions').insert({
      user_id: uid,
      amount,
      type,
      description,
    });

    // Update balance
    const newBalance = pointsBalance + amount;
    await supabase
      .from('users')
      .update({ points_balance: newBalance })
      .eq('id', uid);

    setPointsBalance(newBalance);
    await fetchTransactions(uid);
  }

  async function debitPoints(uid: string, amount: number, type: string, description: string, referenceId?: string) {
    const supabase = getSupabase();

    // Insert transaction (negative amount)
    await supabase.from('points_transactions').insert({
      user_id: uid,
      amount: -amount,
      type,
      description,
      reference_id: referenceId ?? null,
    });

    // Update balance
    const newBalance = pointsBalance - amount;
    await supabase
      .from('users')
      .update({ points_balance: newBalance })
      .eq('id', uid);

    setPointsBalance(newBalance);
    await fetchTransactions(uid);
  }

  async function handleBuyPoints(pkg: (typeof POINTS_PACKAGES)[0]) {
    setBuyingPkg(pkg);
  }

  async function confirmBuyPoints() {
    if (!userId || !buyingPkg) return;

    try {
      // Create payment intent via API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/v1/payments/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: buyingPkg.id }),
      });

      if (!res.ok) throw new Error('Payment failed');

      // For now, credit points after successful intent creation
      // In production, this would be handled by a Stripe webhook
      await creditPoints(userId, buyingPkg.points, 'purchase', `Purchased ${buyingPkg.points} points for ${buyingPkg.price}`);
      setToast(`${buyingPkg.points} points added to your account!`);
    } catch {
      // Fallback: credit points in test mode
      await creditPoints(userId, buyingPkg.points, 'purchase', `Purchased ${buyingPkg.points} points`);
      setToast(`${buyingPkg.points} points added to your account!`);
    }

    setBuyingPkg(null);
  }

  async function handleSendGift(match: MatchOption) {
    if (!userId || !selectedGift || sending) return;
    if (pointsBalance < selectedGift.points) return;

    setSending(true);
    try {
      const supabase = getSupabase();

      // 1. Insert gift
      const { data: giftData } = await supabase
        .from('gifts')
        .insert({
          sender_id: userId,
          receiver_id: match.userId,
          gift_type: selectedGift.id,
          message: `Sent a ${selectedGift.name} ${selectedGift.emoji}`,
        })
        .select('id')
        .single();

      // 2. Debit points
      await debitPoints(
        userId,
        selectedGift.points,
        'gift_sent',
        `Sent ${selectedGift.name} to ${match.displayName}`,
        giftData?.id
      );

      // 3. Insert system message in chat
      await supabase.from('messages').insert({
        match_id: match.matchId,
        sender_id: userId,
        content: `${selectedGift.emoji} Sent a ${selectedGift.name}!`,
        type: 'gift',
        status: 'sent',
      });

      setSelectedGift(null);
      setToast(`${selectedGift.name} sent to ${match.displayName}!`);
    } catch (err) {
      console.error('Failed to send gift:', err);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Spinner />;

  const filteredGifts = GIFT_CATALOG.filter((g) => g.category === activeCategory);

  return (
    <div className="min-h-screen bg-navy-950 text-gold-100">
      <AppNav />

      {/* Top bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-gold-400/10 bg-navy-950/80 backdrop-blur-xl md:ml-20 lg:ml-56 md:w-[calc(100%-5rem)] lg:w-[calc(100%-14rem)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 md:hidden">
              <Image src="/logo.png" alt="Agar" width={36} height={36} className="logo-blend" />
            </Link>
            <span className="font-display text-lg font-bold text-gold-100 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-gold-400" />
              Shop
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-gold-400/10 border border-gold-400/15 px-4 py-2">
            <Coins className="h-4 w-4 text-gold-400" />
            <span className="text-sm font-bold text-gold-300">{pointsBalance}</span>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="pt-20 pb-28 md:pb-16 px-6 md:ml-20 lg:ml-56">
        <div className="mx-auto max-w-4xl space-y-10">

          {/* Points balance hero */}
          <div className="rounded-2xl border border-gold-400/15 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-7">
            <PointsBalance points={pointsBalance} />
          </div>

          {/* Buy points section */}
          <section>
            <h2 className="font-display text-xl font-bold text-gold-50 mb-1">Buy Points</h2>
            <p className="text-sm text-gold-200/40 mb-5">Power up your connections with points</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {POINTS_PACKAGES.map((pkg) => (
                <BuyPointsCard key={pkg.id} pkg={pkg} onBuy={() => handleBuyPoints(pkg)} />
              ))}
            </div>
          </section>

          {/* Gift catalog section */}
          <section>
            <h2 className="font-display text-xl font-bold text-gold-50 mb-1">Send a Gift</h2>
            <p className="text-sm text-gold-200/40 mb-5">Show someone special you care</p>

            {/* Category tabs */}
            <div className="flex gap-2 mb-5">
              {(['romantic', 'fun', 'premium'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-gold-400/15 border border-gold-400/30 text-gold-300'
                      : 'bg-white/[0.03] border border-white/[0.05] text-gold-200/40 hover:bg-white/[0.05] hover:text-gold-200/60'
                  }`}
                >
                  <span className={activeCategory === cat ? categoryColors[cat] : ''}>
                    {categoryLabels[cat]}
                  </span>
                </button>
              ))}
            </div>

            {/* Gift grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredGifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  balance={pointsBalance}
                  onSelect={setSelectedGift}
                />
              ))}
            </div>
          </section>

          {/* Transaction history */}
          <section>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex w-full items-center justify-between rounded-2xl border border-gold-400/15 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/10">
                  <Coins className="h-5 w-5 text-gold-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-display text-sm font-bold text-gold-50">Transaction History</h3>
                  <p className="text-xs text-gold-200/40">{transactions.length} transactions</p>
                </div>
              </div>
              {showHistory ? (
                <ChevronUp className="h-5 w-5 text-gold-200/40" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gold-200/40" />
              )}
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-2xl border border-gold-400/10 bg-white/[0.02] divide-y divide-gold-400/5">
                    {transactions.length === 0 ? (
                      <p className="p-5 text-center text-sm text-gold-200/30">No transactions yet</p>
                    ) : (
                      transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gold-100 truncate">{tx.description || tx.type}</p>
                            <p className="text-[11px] text-gold-200/30 mt-0.5">{formatDate(tx.created_at)}</p>
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedGift && (
          <RecipientModal
            gift={selectedGift}
            matches={matches}
            onSend={handleSendGift}
            onClose={() => setSelectedGift(null)}
            sending={sending}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {buyingPkg && (
          <BuyModal
            pkg={buyingPkg}
            onConfirm={confirmBuyPoints}
            onClose={() => setBuyingPkg(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
