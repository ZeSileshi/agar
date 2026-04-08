'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Smile } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { getSupabase } from '@/lib/supabase';

interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
  readAt: string | null;
  pending?: boolean;
}

interface PartnerInfo {
  userId: string;
  displayName: string;
  firstName: string;
  photoUrl: string | null;
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'h:mm a');
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

function shouldShowDateSeparator(current: string, previous: string | null): boolean {
  if (!previous) return true;
  const currentDate = new Date(current).toDateString();
  const previousDate = new Date(previous).toDateString();
  return currentDate !== previousDate;
}

export default function ChatClient() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Load match info and messages
  const fetchMessages = useCallback(async (currentUserId: string, mId: string) => {
    try {
      const supabase = getSupabase();

      const { data: msgs, error } = await supabase
        .from('messages')
        .select('id, match_id, sender_id, content, type, status, created_at, read_at')
        .eq('match_id', mId)
        .order('created_at', { ascending: true });

      if (error) return;

      const formatted: Message[] = (msgs ?? []).map((m) => ({
        id: m.id,
        matchId: m.match_id,
        senderId: m.sender_id,
        content: m.content,
        type: m.type,
        status: m.status,
        createdAt: m.created_at,
        readAt: m.read_at,
      }));

      setMessages((prev) => {
        // Only update if there are new messages (avoid flickering)
        const prevIds = new Set(prev.filter((p) => !p.pending).map((p) => p.id));
        const newIds = new Set(formatted.map((m) => m.id));
        const hasNew = formatted.some((m) => !prevIds.has(m.id));
        const hasRemoved = prev.some((p) => !p.pending && !newIds.has(p.id));

        if (!hasNew && !hasRemoved && prev.filter((p) => !p.pending).length === formatted.length) {
          return prev;
        }

        // Preserve pending messages
        const pending = prev.filter((p) => p.pending && !newIds.has(p.id));
        return [...formatted, ...pending];
      });

      // Mark unread messages as read
      const unreadIds = (msgs ?? [])
        .filter((m) => m.sender_id !== currentUserId && !m.read_at)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString(), status: 'read' })
          .in('id', unreadIds);
      }

      // Scroll if there are new messages
      const lastMsg = formatted[formatted.length - 1];
      if (lastMsg && lastMsg.id !== lastMessageIdRef.current) {
        lastMessageIdRef.current = lastMsg.id;
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch {
      // Silently handle
    }
  }, [scrollToBottom]);

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

        // Get match details
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .select('id, user1_id, user2_id, status')
          .eq('id', matchId)
          .single();

        if (matchError || !match || match.status !== 'matched') {
          router.push('/messages');
          return;
        }

        // Verify user is part of this match
        if (match.user1_id !== user.id && match.user2_id !== user.id) {
          router.push('/messages');
          return;
        }

        const partnerId = match.user1_id === user.id ? match.user2_id : match.user1_id;

        // Get partner profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, display_name, first_name')
          .eq('user_id', partnerId)
          .single();

        // Get partner photo
        const { data: photo } = await supabase
          .from('photos')
          .select('thumbnail_url, url')
          .eq('user_id', partnerId)
          .eq('is_primary', true)
          .single();

        setPartner({
          userId: partnerId,
          displayName: profile?.display_name ?? profile?.first_name ?? 'Unknown',
          firstName: profile?.first_name ?? 'Unknown',
          photoUrl: photo?.thumbnail_url ?? photo?.url ?? null,
        });

        await fetchMessages(user.id, matchId);
      } catch {
        router.push('/messages');
      } finally {
        setLoading(false);
        setTimeout(() => scrollToBottom('instant'), 200);
      }
    }
    init();
  }, [router, matchId, fetchMessages, scrollToBottom]);

  // Poll for new messages
  useEffect(() => {
    if (!userId || !matchId) return;
    const interval = setInterval(() => fetchMessages(userId, matchId), 5000);
    return () => clearInterval(interval);
  }, [userId, matchId, fetchMessages]);

  // Try Supabase realtime as well
  useEffect(() => {
    if (!userId || !matchId) return;

    let channel: ReturnType<ReturnType<typeof getSupabase>['channel']> | null = null;

    try {
      const supabase = getSupabase();
      channel = supabase
        .channel(`messages:${matchId}`)
        .on(
          'postgres_changes' as any,
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `match_id=eq.${matchId}`,
          },
          () => {
            fetchMessages(userId, matchId);
          }
        )
        .subscribe();
    } catch {
      // Realtime not available, polling is fallback
    }

    return () => {
      if (channel) {
        try {
          getSupabase().removeChannel(channel);
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [userId, matchId, fetchMessages]);

  async function handleSend() {
    const content = inputValue.trim();
    if (!content || !userId || !matchId || sending) return;

    setSending(true);
    setInputValue('');

    // Optimistic UI - add message immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      matchId,
      senderId: userId,
      content,
      type: 'text',
      status: 'sending',
      createdAt: new Date().toISOString(),
      readAt: null,
      pending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: userId,
          content,
          type: 'text',
          status: 'sent',
        })
        .select('id, match_id, sender_id, content, type, status, created_at, read_at')
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                id: data.id,
                matchId: data.match_id,
                senderId: data.sender_id,
                content: data.content,
                type: data.type,
                status: data.status,
                createdAt: data.created_at,
                readAt: data.read_at,
                pending: false,
              }
            : m
        )
      );

      // Update last_message_at on the match
      await supabase
        .from('matches')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', matchId);
    } catch {
      // Mark as failed
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed', pending: false } : m))
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    <div className="flex h-dvh flex-col bg-navy-950 text-gold-100">
      {/* Chat header */}
      <header className="shrink-0 border-b border-gold-400/10 bg-navy-950/90 backdrop-blur-xl z-30">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href="/messages"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gold-200/50 transition-colors hover:bg-white/[0.05] hover:text-gold-200"
            aria-label="Back to messages"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          {/* Partner info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {partner?.photoUrl ? (
              <img
                src={partner.photoUrl}
                alt={partner.displayName}
                className="h-10 w-10 rounded-full object-cover border border-gold-400/15"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-400/10 border border-gold-400/15">
                <span className="font-display text-sm font-bold text-gold-400">
                  {partner?.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-gold-50">
                {partner?.displayName}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        <div className="mx-auto max-w-2xl space-y-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/10">
                <Smile className="h-8 w-8 text-gold-400/60" />
              </div>
              <p className="text-gold-200/40 text-sm max-w-xs leading-relaxed">
                You matched! Send a message to start the conversation.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isSent = msg.senderId === userId;
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const showDate = shouldShowDateSeparator(
                msg.createdAt,
                prevMsg?.createdAt ?? null
              );
              const showAvatar =
                !isSent &&
                (idx === 0 || messages[idx - 1]?.senderId !== msg.senderId);

              return (
                <div key={msg.id}>
                  {/* Date separator */}
                  {showDate && (
                    <div className="flex items-center justify-center py-4">
                      <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-gold-200/30">
                        {formatDateSeparator(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`flex items-end gap-2 py-0.5 ${
                      isSent ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* Partner avatar for received messages */}
                    {!isSent && (
                      <div className="w-7 shrink-0">
                        {showAvatar && partner?.photoUrl ? (
                          <img
                            src={partner.photoUrl}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover"
                          />
                        ) : showAvatar ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400/10">
                            <span className="text-[10px] font-bold text-gold-400">
                              {partner?.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div
                      className={`group relative max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isSent
                          ? 'bg-gold-400 text-navy-950 rounded-br-md'
                          : 'bg-navy-800 text-gold-100 rounded-bl-md'
                      } ${msg.status === 'failed' ? 'opacity-60' : ''} ${
                        msg.pending ? 'opacity-80' : ''
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <div
                        className={`mt-1 flex items-center gap-1.5 ${
                          isSent ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <time
                          className={`text-[10px] ${
                            isSent ? 'text-navy-950/50' : 'text-gold-200/25'
                          }`}
                          dateTime={msg.createdAt}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </time>
                        {isSent && (
                          <span
                            className={`text-[10px] ${
                              msg.status === 'failed'
                                ? 'text-rose-500'
                                : msg.status === 'sending'
                                ? 'text-navy-950/30'
                                : msg.status === 'read'
                                ? 'text-navy-950/60'
                                : 'text-navy-950/40'
                            }`}
                          >
                            {msg.status === 'failed'
                              ? 'Failed'
                              : msg.status === 'sending'
                              ? 'Sending...'
                              : msg.status === 'read'
                              ? 'Read'
                              : 'Sent'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-gold-400/10 bg-navy-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-end gap-2 px-4 py-3">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none rounded-2xl border border-gold-400/10 bg-white/[0.03] px-4 py-3 text-sm text-gold-100 placeholder:text-gold-200/30 outline-none focus:border-gold-400/30 focus:ring-1 focus:ring-gold-400/20 transition-colors max-h-32"
              aria-label="Message input"
              style={{
                minHeight: '44px',
                height: 'auto',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-400 text-navy-950 transition-all hover:bg-gold-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
