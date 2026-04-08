'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Heart, Star, MapPin, User, Compass } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import {
  getAstrologyProfile,
  sunSignCompatibility,
  chineseZodiacCompatibility,
  computeOverallCompatibility,
} from '@/lib/astrology';
import AppNav from '@/components/AppNav';

/* ---------- types ---------- */

interface ProfileCard {
  id: string;
  user_id: string;
  first_name: string;
  display_name: string;
  date_of_birth: string;
  gender: string;
  bio: string | null;
  interests: string[];
  location_city: string | null;
  photo_url: string | null;
  compatibility_score: number | null;
}

/* ---------- helpers ---------- */

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ---------- Match modal ---------- */

function MatchModal({
  matchedName,
  matchedPhoto,
  onMessage,
  onContinue,
}: {
  matchedName: string;
  matchedPhoto: string | null;
  onMessage: () => void;
  onContinue: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/80 backdrop-blur-md px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-sm rounded-3xl border border-gold-400/20 bg-navy-900 p-8 text-center shadow-2xl"
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {/* Decorative heart */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
          >
            <Heart className="h-12 w-12 text-rose-400 fill-rose-400" />
          </motion.div>
        </div>

        <h2 className="mt-4 font-display text-2xl font-bold text-gold-gradient">
          It&apos;s a Match!
        </h2>
        <p className="mt-2 text-gold-200/50 text-sm">
          You and {matchedName} liked each other
        </p>

        {/* Avatar */}
        <div className="mx-auto mt-6 mb-6 h-24 w-24 overflow-hidden rounded-full border-2 border-gold-400/30">
          {matchedPhoto ? (
            <img src={matchedPhoto} alt={matchedName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-navy-800">
              <User className="h-10 w-10 text-gold-400/40" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onMessage}
            className="w-full rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Send a Message
          </button>
          <button
            onClick={onContinue}
            className="w-full rounded-xl border border-gold-400/20 bg-gold-400/5 px-6 py-3 text-sm font-medium text-gold-200 transition-colors hover:bg-gold-400/10"
          >
            Keep Swiping
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Profile card ---------- */

function ProfileCardView({
  profile,
  direction,
  myDateOfBirth,
}: {
  profile: ProfileCard;
  direction: 'left' | 'right' | 'up' | null;
  myDateOfBirth?: string | null;
}) {
  const age = calculateAge(profile.date_of_birth);
  const variants = {
    enter: { opacity: 0, scale: 0.95 },
    center: { opacity: 1, scale: 1, x: 0, y: 0 },
    exit: (d: string | null) => {
      if (d === 'left') return { x: -400, opacity: 0, rotate: -15 };
      if (d === 'right') return { x: 400, opacity: 0, rotate: 15 };
      if (d === 'up') return { y: -400, opacity: 0, scale: 0.9 };
      return { opacity: 0 };
    },
  };

  return (
    <motion.div
      key={profile.id}
      className="absolute inset-0"
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl border border-gold-400/15 bg-navy-900 shadow-xl">
        {/* Photo area */}
        <div className="relative h-[55%] w-full bg-navy-800">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.display_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-800 to-navy-900">
              <User className="h-24 w-24 text-gold-400/20" />
            </div>
          )}
          {/* Gradient overlay at bottom of photo */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-navy-900 to-transparent" />

          {/* Compatibility badge */}
          {profile.compatibility_score != null && (
            <div className="absolute top-4 right-4 rounded-full bg-navy-950/70 backdrop-blur-md border border-gold-400/20 px-3 py-1.5 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-gold-400" />
              <span className="text-xs font-semibold text-gold-300">
                {Math.round(profile.compatibility_score)}% match
              </span>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="relative flex h-[45%] flex-col justify-between p-6 pt-4">
          <div className="space-y-3">
            {/* Name & age */}
            <div>
              <h2 className="font-display text-2xl font-bold text-gold-50">
                {profile.first_name}, {age}
              </h2>
              {profile.location_city && (
                <div className="mt-1 flex items-center gap-1 text-gold-200/40">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-xs">{profile.location_city}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm leading-relaxed text-gold-200/50 line-clamp-3">
                {profile.bio}
              </p>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gold-400/10 border border-gold-400/10 px-2.5 py-0.5 text-[11px] font-medium text-gold-300"
                  >
                    {tag}
                  </span>
                ))}
                {profile.interests.length > 6 && (
                  <span className="rounded-full bg-gold-400/5 px-2.5 py-0.5 text-[11px] text-gold-400/40">
                    +{profile.interests.length - 6}
                  </span>
                )}
              </div>
            )}

            {/* Astrology compatibility breakdown */}
            {(() => {
              const myAstro = myDateOfBirth ? getAstrologyProfile(myDateOfBirth) : null;
              const theirAstro = profile.date_of_birth ? getAstrologyProfile(profile.date_of_birth) : null;
              if (!myAstro || !theirAstro) return null;
              const sunCompat = sunSignCompatibility(myAstro.sunSign, theirAstro.sunSign);
              const chineseCompat = chineseZodiacCompatibility(myAstro.chineseAnimal, theirAstro.chineseAnimal);
              return (
                <div className="space-y-1 pt-1">
                  <p className="text-[11px] text-gold-200/30 font-medium uppercase tracking-wider">Astrology</p>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-gold-200/50">
                      {myAstro.sunSignSymbol} {myAstro.sunSign} &harr; {theirAstro.sunSignSymbol} {theirAstro.sunSign} &mdash; {sunCompat}%
                    </span>
                    <span className="text-[11px] text-gold-200/50">
                      {myAstro.chineseAnimalEmoji} {myAstro.chineseAnimal} &harr; {theirAstro.chineseAnimalEmoji} {theirAstro.chineseAnimal} &mdash; {chineseCompat}%
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Empty state ---------- */

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-8">
      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gold-400/10 border border-gold-400/10">
        <Compass className="h-10 w-10 text-gold-400/50" />
      </div>
      <h2 className="font-display text-xl font-bold text-gold-50">
        No more profiles today!
      </h2>
      <p className="mt-2 max-w-xs text-sm text-gold-200/40 leading-relaxed">
        Come back tomorrow for new matches. Great connections are worth the wait.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-xl bg-gold-400/10 border border-gold-400/15 px-6 py-2.5 text-sm font-medium text-gold-300 transition-colors hover:bg-gold-400/15"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

/* ---------- Daily limit reached ---------- */

function DailyLimitReached() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-8">
      <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-400/10 border border-rose-400/10">
        <Heart className="h-10 w-10 text-rose-400/50" />
      </div>
      <h2 className="font-display text-xl font-bold text-gold-50">
        Daily limit reached
      </h2>
      <p className="mt-2 max-w-xs text-sm text-gold-200/40 leading-relaxed">
        You&apos;ve viewed 10 profiles today. Quality over quantity -- come back tomorrow!
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-xl bg-gold-400/10 border border-gold-400/15 px-6 py-2.5 text-sm font-medium text-gold-300 transition-colors hover:bg-gold-400/15"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

/* ---------- Spinner ---------- */

function Spinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <svg className="animate-spin h-8 w-8 text-gold-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

/* ========== Main page component ========== */

const DAILY_LIMIT = 10;

export default function DiscoverPage() {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof getSupabase> | null>(null);
  if (typeof window !== 'undefined' && !supabaseRef.current) {
    supabaseRef.current = getSupabase();
  }
  const supabase = supabaseRef.current!;

  const [userId, setUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [userType, setUserType] = useState<'direct' | 'referrer'>('direct');
  const [myDateOfBirth, setMyDateOfBirth] = useState<string | null>(null);

  // Match modal state
  const [matchModal, setMatchModal] = useState<{
    name: string;
    photo: string | null;
  } | null>(null);

  /* --- Auth check --- */
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }
        setUserId(user.id);
        // Get user type from metadata or users table
        const uType = user.user_metadata?.user_type as 'direct' | 'referrer' | undefined;
        if (uType) {
          setUserType(uType);
        } else {
          const { data: userData } = await supabase.from('users').select('user_type').eq('id', user.id).single();
          if (userData?.user_type) setUserType(userData.user_type);
        }

        // Load user's date_of_birth for astrology compatibility
        const { data: myProfile } = await supabase.from('profiles').select('date_of_birth').eq('user_id', user.id).single();
        if (myProfile?.date_of_birth) {
          setMyDateOfBirth(myProfile.date_of_birth);
        }
      } catch {
        router.push('/auth/login');
      }
    }
    checkAuth();
  }, [router, supabase]);

  /* --- Load profiles once we have userId --- */
  useEffect(() => {
    if (!userId) return;
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadProfiles = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const today = todayISO();

      // 1. Check daily view count
      const { data: dailyData } = await supabase
        .from('daily_views')
        .select('view_count')
        .eq('user_id', userId)
        .eq('viewed_date', today)
        .single();

      const currentCount = dailyData?.view_count ?? 0;
      setDailyCount(currentCount);

      if (currentCount >= DAILY_LIMIT) {
        setLimitReached(true);
        setLoading(false);
        return;
      }

      // 2. Get IDs the user has already swiped on
      const { data: swipedData } = await supabase
        .from('swipes')
        .select('target_id')
        .eq('swiper_id', userId);

      const swipedIds = (swipedData ?? []).map((s: { target_id: string }) => s.target_id);
      swipedIds.push(userId); // exclude self

      // 3. Get current user's profile for gender preference + scoring data
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('gender, gender_preference, date_of_birth, interests')
        .eq('user_id', userId)
        .single();

      // 4. Build query based on user type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let candidateProfiles: any[] | null = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let error: any = null;

      if (userType === 'referrer') {
        // Referrer users see referral_profiles from other referrers
        const { data, error: err } = await supabase
          .from('referral_profiles')
          .select('id, created_by_user_id, first_name, age, gender, bio, interests, location_city')
          .not('created_by_user_id', 'in', `(${swipedIds.join(',')})`)
          .eq('is_active', true)
          .limit(DAILY_LIMIT - currentCount);
        // Map to same shape as profiles
        candidateProfiles = (data ?? []).map((rp: any) => ({
          ...rp,
          user_id: rp.created_by_user_id,
          display_name: rp.first_name,
          date_of_birth: rp.age ? new Date(Date.now() - (rp.age as number) * 365.25 * 24 * 60 * 60 * 1000).toISOString() : null,
        }));
        error = err;
      } else {
        // Direct users see other direct user profiles
        let query = supabase
          .from('profiles')
          .select('id, user_id, first_name, display_name, date_of_birth, gender, bio, interests, location_city')
          .not('user_id', 'in', `(${swipedIds.join(',')})`)
          .limit(DAILY_LIMIT - currentCount);

        // Apply gender preference filter
        if (myProfile?.gender_preference && myProfile.gender_preference !== 'everyone') {
          query = query.eq('gender', myProfile.gender_preference);
        }

        const { data, error: err } = await query;
        candidateProfiles = data;
        error = err;
      }

      if (error) {
        console.error('Error loading profiles:', error);
        setLoading(false);
        return;
      }

      if (!candidateProfiles || candidateProfiles.length === 0) {
        setProfiles([]);
        setLoading(false);
        return;
      }

      // 5. Get primary photos for candidates
      const candidateUserIds = candidateProfiles.map((p) => p.user_id as string);
      const { data: photosData } = await supabase
        .from('photos')
        .select('user_id, url')
        .in('user_id', candidateUserIds)
        .eq('is_primary', true);

      const photoMap = new Map<string, string>();
      (photosData ?? []).forEach((p: { user_id: string; url: string }) => {
        photoMap.set(p.user_id, p.url);
      });

      // 6. Compute compatibility scores on the fly
      const myDob = myProfile?.date_of_birth ?? myDateOfBirth ?? '';
      const myInterests: string[] = (myProfile as any)?.interests ?? [];

      // Check if current user has a palm scan
      let myHasPalm = false;
      try {
        const { data: palmFiles } = await supabase.storage.from('palms').list(userId, { limit: 1 });
        myHasPalm = (palmFiles ?? []).length > 0;
      } catch { /* ignore */ }

      const scoreMap = new Map<string, number>();
      const scoresToStore: Array<{ user1_id: string; user2_id: string; overall_score: number; western_score: number; chinese_score: number; profile_score: number; palmistry_score: number; confidence: number }> = [];

      for (const p of (candidateProfiles ?? [])) {
        const theirDob = p.date_of_birth ?? '';
        const theirInterests: string[] = p.interests ?? [];
        const result = computeOverallCompatibility(myDob, theirDob, myInterests, theirInterests, myHasPalm, false);
        scoreMap.set(p.user_id as string, result.overall);

        const sorted = [userId, p.user_id as string].sort();
        const u1 = sorted[0]!;
        const u2 = sorted[1]!;
        scoresToStore.push({
          user1_id: u1,
          user2_id: u2,
          overall_score: result.overall,
          western_score: result.western,
          chinese_score: result.chinese,
          profile_score: result.profile,
          palmistry_score: result.palmistry,
          confidence: myDob && theirDob ? 0.7 : 0.3,
        });
      }

      // Store scores in background (don't await / block UI)
      if (scoresToStore.length > 0) {
        supabase.from('compatibility_scores').upsert(scoresToStore, { onConflict: 'user1_id,user2_id', ignoreDuplicates: false }).then(() => {});
      }

      // 7. Assemble profile cards, sorted by compatibility score desc
      const cards: ProfileCard[] = (candidateProfiles ?? []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        first_name: p.first_name,
        display_name: p.display_name,
        date_of_birth: p.date_of_birth,
        gender: p.gender,
        bio: p.bio,
        interests: p.interests ?? [],
        location_city: p.location_city,
        photo_url: photoMap.get(p.user_id as string) ?? null,
        compatibility_score: scoreMap.get(p.user_id as string) ?? null,
      }));

      cards.sort((a, b) => {
        const sa = a.compatibility_score ?? 0;
        const sb = b.compatibility_score ?? 0;
        return sb - sa;
      });

      setProfiles(cards);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Failed to load discover profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  /* --- Swipe action --- */
  const handleSwipe = useCallback(async (action: 'skip' | 'like' | 'love') => {
    if (!userId || swiping || currentIndex >= profiles.length) return;
    setSwiping(true);

    const profile = profiles[currentIndex];
    if (!profile) {
      setSwiping(false);
      return;
    }

    // Set exit animation direction
    if (action === 'skip') setExitDirection('left');
    else if (action === 'like') setExitDirection('right');
    else setExitDirection('up');

    // Wait for animation to start
    await new Promise((r) => setTimeout(r, 50));

    try {
      const swipeAction = action === 'love' ? 'love' : action === 'like' ? 'like' : 'skip';

      // 1. Insert swipe
      await supabase.from('swipes').insert({
        swiper_id: userId,
        target_id: profile.user_id,
        action: swipeAction,
      });

      // 2. Update daily view count
      const today = todayISO();
      const newCount = dailyCount + 1;

      await supabase.from('daily_views').upsert(
        {
          user_id: userId,
          viewed_date: today,
          view_count: newCount,
          last_reset_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,viewed_date' }
      );

      setDailyCount(newCount);

      // 3. If liked/loved, check for mutual match
      if (action === 'like' || action === 'love') {
        const { data: mutualSwipe } = await supabase
          .from('swipes')
          .select('id')
          .eq('swiper_id', profile.user_id)
          .eq('target_id', userId)
          .in('action', ['like', 'love'])
          .single();

        if (mutualSwipe) {
          // Create match — always store the smaller UUID as user1 for uniqueness
          const [id1, id2] = [userId, profile.user_id].sort();
          await supabase.from('matches').upsert(
            {
              user1_id: id1,
              user2_id: id2,
              status: 'matched',
              mode: 'self',
              compatibility_score: profile.compatibility_score,
              matched_at: new Date().toISOString(),
            },
            { onConflict: 'user1_id,user2_id' }
          );

          // Show match modal after animation completes
          setTimeout(() => {
            setMatchModal({
              name: profile.first_name,
              photo: profile.photo_url,
            });
          }, 350);
        }
      }

      // 4. Advance to next profile
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setExitDirection(null);

        if (newCount >= DAILY_LIMIT) {
          setLimitReached(true);
        }
      }, 300);
    } catch (err) {
      console.error('Swipe error:', err);
      setExitDirection(null);
    } finally {
      setTimeout(() => setSwiping(false), 350);
    }
  }, [userId, swiping, currentIndex, profiles, dailyCount, supabase]);

  /* --- Keyboard shortcuts --- */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (matchModal) return;
      if (e.key === 'ArrowLeft') handleSwipe('skip');
      else if (e.key === 'ArrowRight') handleSwipe('like');
      else if (e.key === 'ArrowUp') handleSwipe('love');
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, matchModal]);

  /* --- Render --- */
  const currentProfile = profiles[currentIndex];
  const hasMore = currentIndex < profiles.length;

  return (
    <div className="min-h-screen bg-navy-950 text-gold-100">
      <AppNav />

      {/* Top bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-gold-400/10 bg-navy-950/80 backdrop-blur-xl md:ml-20 lg:ml-56 md:w-[calc(100%-5rem)] lg:w-[calc(100%-14rem)]">
        <div className="mx-auto flex max-w-lg items-center justify-between px-6 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 md:hidden">
            <Image src="/logo.png" alt="Agar" width={36} height={36} className="logo-blend" />
            <span className="font-display text-lg font-bold tracking-tight text-gold-100">
              Discover
            </span>
          </Link>
          <span className="hidden md:block font-display text-lg font-bold text-gold-100">Discover</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gold-200/30 font-medium">
              {DAILY_LIMIT - dailyCount} left today
            </span>
            <div className="h-4 w-px bg-gold-400/10" />
            <div className="flex gap-0.5">
              {Array.from({ length: DAILY_LIMIT }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i < dailyCount ? 'bg-gold-400' : 'bg-gold-400/15'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center pt-16 pb-24 md:pb-8 px-4 md:ml-20 lg:ml-56">
        <div className="relative w-full max-w-sm flex-1" style={{ minHeight: '520px', maxHeight: '640px' }}>
          {loading ? (
            <Spinner />
          ) : limitReached ? (
            <DailyLimitReached />
          ) : !hasMore ? (
            <EmptyState />
          ) : (
            <AnimatePresence custom={exitDirection} mode="popLayout">
              {currentProfile && (
                <ProfileCardView
                  key={currentProfile.id}
                  profile={currentProfile}
                  direction={exitDirection}
                  myDateOfBirth={myDateOfBirth}
                />
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Action buttons */}
        {!loading && !limitReached && hasMore && (
          <div className="mt-4 flex items-center justify-center gap-5">
            {/* Skip */}
            <button
              onClick={() => handleSwipe('skip')}
              disabled={swiping}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-gold-200/10 bg-white/[0.04] text-gold-200/50 transition-all hover:bg-white/[0.08] hover:text-gold-200/80 hover:scale-105 active:scale-95 disabled:opacity-40"
              aria-label="Skip profile"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Super Like */}
            <button
              onClick={() => handleSwipe('love')}
              disabled={swiping}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10 text-rose-400 transition-all hover:bg-rose-400/20 hover:scale-110 active:scale-95 disabled:opacity-40"
              aria-label="Super like profile"
            >
              <Star className="h-5 w-5" />
            </button>

            {/* Like */}
            <button
              onClick={() => handleSwipe('like')}
              disabled={swiping}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-500 text-navy-950 shadow-lg shadow-gold-400/20 transition-all hover:shadow-gold-400/40 hover:scale-105 active:scale-95 disabled:opacity-40"
              aria-label="Like profile"
            >
              <Heart className="h-7 w-7" />
            </button>
          </div>
        )}
      </main>

      {/* Match modal */}
      <AnimatePresence>
        {matchModal && (
          <MatchModal
            matchedName={matchModal.name}
            matchedPhoto={matchModal.photo}
            onMessage={() => {
              setMatchModal(null);
              router.push('/messages');
            }}
            onContinue={() => setMatchModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
