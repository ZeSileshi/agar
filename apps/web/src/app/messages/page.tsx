'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getSupabase } from '@/lib/supabase';
import AppNav from '@/components/AppNav';

interface Conversation {
  matchId: string;
  partnerId: string;
  partnerName: string;
  partnerPhoto: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  compatibilityScore: number | null;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchConversations = useCallback(async (currentUserId: string) => {
    try {
      const supabase = getSupabase();

      // Get all matched conversations
      const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, compatibility_score, last_message_at, matched_at')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .eq('status', 'matched')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (matchError || !matches) {
        setConversations([]);
        return;
      }

      // Get partner IDs
      const partnerIds = matches.map((m) =>
        m.user1_id === currentUserId ? m.user2_id : m.user1_id
      );

      if (partnerIds.length === 0) {
        setConversations([]);
        return;
      }

      // Fetch profiles for all partners
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, first_name')
        .in('user_id', partnerIds);

      // Fetch primary photos for all partners
      const { data: photos } = await supabase
        .from('photos')
        .select('user_id, thumbnail_url, url')
        .in('user_id', partnerIds)
        .eq('is_primary', true);

      // For each match, get latest message and unread count
      const matchIds = matches.map((m) => m.id);

      const { data: latestMessages } = await supabase
        .from('messages')
        .select('match_id, content, created_at, sender_id, read_at')
        .in('match_id', matchIds)
        .order('created_at', { ascending: false });

      // Build conversation list
      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p])
      );
      const photoMap = new Map(
        (photos ?? []).map((p) => [p.user_id, p])
      );

      // Group messages by match_id, take first (latest) for each
      const latestByMatch = new Map<string, { content: string; created_at: string; sender_id: string }>();
      const unreadByMatch = new Map<string, number>();

      for (const msg of latestMessages ?? []) {
        if (!latestByMatch.has(msg.match_id)) {
          latestByMatch.set(msg.match_id, msg);
        }
        // Count unread: messages not from current user with no read_at
        if (msg.sender_id !== currentUserId && !msg.read_at) {
          unreadByMatch.set(msg.match_id, (unreadByMatch.get(msg.match_id) ?? 0) + 1);
        }
      }

      const convos: Conversation[] = matches.map((match) => {
        const partnerId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;
        const profile = profileMap.get(partnerId);
        const photo = photoMap.get(partnerId);
        const lastMsg = latestByMatch.get(match.id);

        return {
          matchId: match.id,
          partnerId,
          partnerName: profile?.display_name ?? profile?.first_name ?? 'Unknown',
          partnerPhoto: photo?.thumbnail_url ?? photo?.url ?? null,
          lastMessage: lastMsg?.content ?? null,
          lastMessageAt: lastMsg?.created_at ?? match.last_message_at ?? match.matched_at,
          unreadCount: unreadByMatch.get(match.id) ?? 0,
          compatibilityScore: match.compatibility_score,
        };
      });

      // Sort by most recent message
      convos.sort((a, b) => {
        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return dateB - dateA;
      });

      setConversations(convos);
    } catch {
      // Silently handle errors
    }
  }, []);

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
        await fetchConversations(user.id);
      } catch {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router, fetchConversations]);

  // Poll for updates
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => fetchConversations(userId), 10000);
    return () => clearInterval(interval);
  }, [userId, fetchConversations]);

  const filteredConversations = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Main content area - offset for desktop sidebar */}
      <div className="md:ml-20 lg:ml-56">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-gold-400/10 bg-navy-950/90 backdrop-blur-xl">
          <div className="mx-auto max-w-2xl px-4 py-4">
            <h1 className="font-display text-2xl font-bold tracking-tight text-gold-50">
              Messages
            </h1>
            {/* Search */}
            {conversations.length > 0 && (
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-200/30" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gold-400/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-gold-100 placeholder:text-gold-200/30 outline-none focus:border-gold-400/30 focus:ring-1 focus:ring-gold-400/20 transition-colors"
                  aria-label="Search conversations"
                />
              </div>
            )}
          </div>
        </header>

        {/* Conversation list */}
        <main className="mx-auto max-w-2xl pb-24 md:pb-8">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gold-400/10">
                <MessageCircle className="h-10 w-10 text-gold-400/60" />
              </div>
              {conversations.length === 0 ? (
                <>
                  <h2 className="font-display text-xl font-bold text-gold-50 mb-2">
                    No matches yet
                  </h2>
                  <p className="text-gold-200/40 text-sm max-w-xs leading-relaxed">
                    Start discovering to find your match! Once you connect with someone, your conversations will appear here.
                  </p>
                  <Link
                    href="/discover"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-400/10 border border-gold-400/20 px-6 py-2.5 text-sm font-medium text-gold-300 transition-all hover:bg-gold-400/20"
                  >
                    <Heart className="h-4 w-4" />
                    Start Discovering
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="font-display text-xl font-bold text-gold-50 mb-2">
                    No results
                  </h2>
                  <p className="text-gold-200/40 text-sm">
                    No conversations match &quot;{searchQuery}&quot;
                  </p>
                </>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gold-400/5" role="list" aria-label="Conversations">
              {filteredConversations.map((convo) => (
                <li key={convo.matchId}>
                  <Link
                    href={`/messages/${convo.matchId}`}
                    className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-white/[0.02] active:bg-white/[0.04]"
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {convo.partnerPhoto ? (
                        <img
                          src={convo.partnerPhoto}
                          alt={convo.partnerName}
                          className="h-14 w-14 rounded-full object-cover border-2 border-gold-400/15"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-400/10 border-2 border-gold-400/15">
                          <span className="font-display text-lg font-bold text-gold-400">
                            {convo.partnerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Unread indicator */}
                      {convo.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold text-navy-950">
                          {convo.unreadCount > 99 ? '99+' : convo.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`truncate text-sm font-semibold ${
                            convo.unreadCount > 0 ? 'text-gold-50' : 'text-gold-100/80'
                          }`}
                        >
                          {convo.partnerName}
                        </h3>
                        {convo.lastMessageAt && (
                          <time
                            className="shrink-0 text-xs text-gold-200/30"
                            dateTime={convo.lastMessageAt}
                          >
                            {formatDistanceToNow(new Date(convo.lastMessageAt), {
                              addSuffix: false,
                            })}
                          </time>
                        )}
                      </div>
                      <p
                        className={`mt-0.5 truncate text-sm ${
                          convo.unreadCount > 0
                            ? 'text-gold-200/60 font-medium'
                            : 'text-gold-200/30'
                        }`}
                      >
                        {convo.lastMessage ?? 'Say hello to your new match!'}
                      </p>
                    </div>

                    {/* Compatibility badge */}
                    {convo.compatibilityScore != null && (
                      <div className="shrink-0 flex flex-col items-center">
                        <span className="text-[10px] text-gold-200/25 uppercase tracking-wider">
                          Match
                        </span>
                        <span className="text-xs font-bold text-gold-400">
                          {Math.round(convo.compatibilityScore * 100)}%
                        </span>
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}

