'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import AppNav from '@/components/AppNav';

interface UserData {
  email: string;
  fullName: string;
  pointsBalance: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user: authUser } } = await getSupabase().auth.getUser();
        if (!authUser) {
          router.push('/auth/login');
          return;
        }
        // Fetch points balance
        let pts = 0;
        try {
          const { data: userData } = await getSupabase().from('users').select('points_balance').eq('id', authUser.id).single();
          pts = userData?.points_balance ?? 0;
        } catch { /* ignore */ }

        setUser({
          email: authUser.email ?? '',
          fullName: authUser.user_metadata?.full_name ?? 'User',
          pointsBalance: pts,
        });
      } catch {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  async function handleSignOut() {
    await getSupabase().auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-gold-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-gold-100">
      <AppNav />

      {/* Top bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-gold-400/10 bg-navy-950/80 backdrop-blur-xl md:ml-20 lg:ml-56 md:w-[calc(100%-5rem)] lg:w-[calc(100%-14rem)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2.5 md:hidden">
            <Image src="/logo.png" alt="Agar" width={44} height={44} className="logo-blend" />
            <span className="font-display text-xl font-bold tracking-tight text-gold-100">
              Agar
            </span>
          </Link>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <Link href="/shop" className="flex items-center gap-1.5 rounded-full bg-gold-400/10 border border-gold-400/15 px-3 py-1.5 transition-colors hover:bg-gold-400/15">
              <svg className="h-3.5 w-3.5 text-gold-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M6 12h12" /></svg>
              <span className="text-xs font-bold text-gold-300">{user?.pointsBalance ?? 0} pts</span>
            </Link>
            <span className="text-sm text-gold-200/50">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="rounded-full border border-gold-400/20 bg-gold-400/5 px-5 py-2 text-sm font-medium text-gold-200 transition-all hover:bg-gold-400/10 hover:border-gold-400/30"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="pt-24 pb-24 md:pb-16 px-6 md:ml-20 lg:ml-56">
        <div className="mx-auto max-w-4xl">
          {/* Welcome */}
          <div className="mb-10">
            <h1 className="font-display text-3xl font-bold tracking-tight text-gold-50 sm:text-4xl">
              Welcome, {user?.fullName}
            </h1>
            <p className="mt-2 text-gold-200/40">
              Your matchmaking journey starts here.
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/profile" className="rounded-2xl border border-gold-400/15 bg-white/[0.03] backdrop-blur-xl p-7 hover:border-gold-400/25 hover:bg-white/[0.05] transition-all">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-gold-400 bg-gold-400/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-gold-50 mb-2">Complete Profile</h3>
              <p className="text-gold-200/40 text-sm leading-relaxed">Add your birth details, photos, and preferences to get matched.</p>
            </Link>

            <Link href="/discover" className="rounded-2xl border border-gold-400/15 bg-white/[0.03] backdrop-blur-xl p-7 hover:border-gold-400/25 hover:bg-white/[0.05] transition-all group">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-rose-400 bg-rose-400/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-gold-50 mb-2 group-hover:text-gold-300 transition-colors">Discover Matches</h3>
              <p className="text-gold-200/40 text-sm leading-relaxed">10 curated matches every day based on your compatibility.</p>
            </Link>

            <Link href="/messages" className="rounded-2xl border border-gold-400/15 bg-white/[0.03] backdrop-blur-xl p-7 hover:border-gold-400/25 hover:bg-white/[0.05] transition-all">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-emerald-400 bg-emerald-400/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-gold-50 mb-2">Messages</h3>
              <p className="text-gold-200/40 text-sm leading-relaxed">Chat with your matches once you both connect.</p>
            </Link>

            <Link href="/shop" className="rounded-2xl border border-gold-400/15 bg-white/[0.03] backdrop-blur-xl p-7 hover:border-gold-400/25 hover:bg-white/[0.05] transition-all group">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-gold-400 bg-gold-400/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-gold-50 mb-2 group-hover:text-gold-300 transition-colors">Points Shop</h3>
              <p className="text-gold-200/40 text-sm leading-relaxed">Buy points, send gifts, and unlock extra profiles.</p>
            </Link>
          </div>

          {/* Coming soon note */}
          <div className="mt-10 rounded-2xl border border-gold-400/10 bg-gold-400/5 p-6 text-center">
            <p className="text-gold-200/50 text-sm">
              Profile setup, matching, and chat features are coming soon. Stay tuned!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
