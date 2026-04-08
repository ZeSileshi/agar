'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MessageCircle, User } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/discover', label: 'Discover', icon: Heart },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function AppNav() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchUnreadCount() {
      try {
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        // Get all matches for the current user
        const { data: matches } = await supabase
          .from('matches')
          .select('id')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .eq('status', 'matched');

        if (!matches || matches.length === 0 || cancelled) return;

        const matchIds = matches.map((m: { id: string }) => m.id);

        // Count unread messages not sent by the current user
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('match_id', matchIds)
          .neq('sender_id', user.id)
          .is('read_at', null);

        if (!cancelled) {
          setUnreadCount(count ?? 0);
        }
      } catch {
        // Silently fail - badge just won't show
      }
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold-400/10 bg-navy-950/95 backdrop-blur-xl md:hidden"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'text-gold-400'
                    : 'text-gold-200/40 hover:text-gold-200/60'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.href === '/messages' && unreadCount > 0 && (
                  <span className="absolute -top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-navy-950">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside
        className="fixed left-0 top-0 z-40 hidden h-full w-20 flex-col items-center border-r border-gold-400/10 bg-navy-950/95 backdrop-blur-xl pt-6 pb-6 md:flex lg:w-56"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center gap-2 px-4">
          <img src="/logo.png" alt="Agar" className="h-10 w-10 logo-blend" />
          <span className="hidden font-display text-lg font-bold text-gold-100 lg:block">
            Agar <span className="text-gold-400/60 text-xs ml-0.5">አጋር</span>
          </span>
        </Link>

        <div className="flex flex-1 flex-col gap-2 w-full px-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                  active
                    ? 'bg-gold-400/10 text-gold-400'
                    : 'text-gold-200/40 hover:bg-white/[0.03] hover:text-gold-200/60'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden lg:block">{item.label}</span>
                {item.href === '/messages' && unreadCount > 0 && (
                  <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-navy-950 lg:static lg:ml-auto">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
