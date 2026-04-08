'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import AppNav from '@/components/AppNav';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProfileData {
  first_name: string;
  last_name: string;
  display_name: string;
  bio: string;
  date_of_birth: string;
  gender: string;
  location_city: string;
  location_country: string;
  gender_preference: string;
  age_range_min: number;
  age_range_max: number;
  max_distance: number;
}

interface BirthDetails {
  time_of_birth: string;
  birth_city: string;
  birth_country: string;
}

interface PhotoSlot {
  id: string | null;
  url: string | null;
  is_primary: boolean;
  order: number;
  file?: File;
  uploading?: boolean;
}

const STEPS = ['Basic Info', 'Birth Details', 'Photos', 'Preferences'] as const;
const TOTAL_STEPS = STEPS.length;

const DEFAULT_PROFILE: ProfileData = {
  first_name: '',
  last_name: '',
  display_name: '',
  bio: '',
  date_of_birth: '',
  gender: '',
  location_city: '',
  location_country: '',
  gender_preference: 'everyone',
  age_range_min: 18,
  age_range_max: 50,
  max_distance: 50,
};

const DEFAULT_BIRTH: BirthDetails = {
  time_of_birth: '',
  birth_city: '',
  birth_country: '',
};

function emptySlots(): PhotoSlot[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: null,
    url: null,
    is_primary: i === 0,
    order: i,
  }));
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function completionPercent(
  profile: ProfileData,
  birth: BirthDetails,
  photos: PhotoSlot[],
): number {
  let filled = 0;
  let total = 0;

  // Basic info fields (weight: 40%)
  const basicFields: (keyof ProfileData)[] = [
    'first_name',
    'display_name',
    'date_of_birth',
    'gender',
    'bio',
    'location_city',
  ];
  basicFields.forEach((k) => {
    total += 1;
    if (profile[k] && String(profile[k]).trim()) filled += 1;
  });

  // Birth (weight: 20%) - 3 fields
  const birthFields: (keyof BirthDetails)[] = [
    'time_of_birth',
    'birth_city',
    'birth_country',
  ];
  birthFields.forEach((k) => {
    total += 1;
    if (birth[k] && String(birth[k]).trim()) filled += 1;
  });

  // Photos (weight: 20%) - at least 1
  total += 1;
  if (photos.some((p) => p.url)) filled += 1;

  // Preferences (weight: 20%) - always filled via defaults
  total += 1;
  if (profile.gender_preference) filled += 1;

  return Math.round((filled / total) * 100);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [step, setStep] = useState(0);

  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [birth, setBirth] = useState<BirthDetails>(DEFAULT_BIRTH);
  const [photos, setPhotos] = useState<PhotoSlot[]>(emptySlots());

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ---- Auth + Load ---- */
  useEffect(() => {
    async function init() {
      try {
        const sb = getSupabase();
        const {
          data: { user },
        } = await sb.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }
        setUserId(user.id);

        // Pre-fill from auth metadata
        const meta = user.user_metadata ?? {};
        const fullName: string = meta.full_name ?? '';
        const [first = '', ...rest] = fullName.split(' ');
        const last = rest.join(' ');

        // Load existing profile
        const { data: pRow } = await sb
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (pRow) {
          setProfile({
            first_name: pRow.first_name ?? first,
            last_name: pRow.last_name ?? last,
            display_name: pRow.display_name ?? fullName,
            bio: pRow.bio ?? '',
            date_of_birth: pRow.date_of_birth
              ? pRow.date_of_birth.slice(0, 10)
              : '',
            gender: pRow.gender ?? '',
            location_city: pRow.location_city ?? '',
            location_country: pRow.location_country ?? '',
            gender_preference: pRow.gender_preference ?? 'everyone',
            age_range_min: pRow.age_range_min ?? 18,
            age_range_max: pRow.age_range_max ?? 50,
            max_distance: pRow.max_distance ?? 50,
          });
        } else {
          setProfile((p) => ({
            ...p,
            first_name: first,
            last_name: last,
            display_name: fullName,
          }));
        }

        // Load birth data
        const { data: bRow } = await sb
          .from('birth_data')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (bRow) {
          setBirth({
            time_of_birth: bRow.time_of_birth ?? '',
            birth_city: bRow.birth_city ?? '',
            birth_country: bRow.birth_country ?? '',
          });
        }

        // Load photos
        const { data: photoRows } = await sb
          .from('photos')
          .select('*')
          .eq('user_id', user.id)
          .order('order', { ascending: true });

        if (photoRows && photoRows.length > 0) {
          const slots = emptySlots();
          photoRows.forEach((ph: any, i: number) => {
            if (i < 6) {
              slots[i] = {
                id: ph.id,
                url: ph.url,
                is_primary: ph.is_primary,
                order: ph.order,
              };
            }
          });
          setPhotos(slots);
        }
      } catch {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  /* ---- Save ---- */
  const handleSave = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const sb = getSupabase();

      // Upsert profile
      const profilePayload = {
        user_id: userId,
        first_name: profile.first_name,
        last_name: profile.last_name || null,
        display_name: profile.display_name || profile.first_name,
        bio: profile.bio || null,
        date_of_birth: profile.date_of_birth
          ? new Date(profile.date_of_birth).toISOString()
          : new Date('2000-01-01').toISOString(),
        gender: profile.gender || 'other',
        location_city: profile.location_city || null,
        location_country: profile.location_country || null,
        gender_preference: profile.gender_preference || 'everyone',
        age_range_min: profile.age_range_min,
        age_range_max: profile.age_range_max,
        max_distance: profile.max_distance,
        updated_at: new Date().toISOString(),
      };

      const { error: pErr } = await sb
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'user_id' });
      if (pErr) throw pErr;

      // Upsert birth data
      const birthPayload = {
        user_id: userId,
        date_of_birth: profile.date_of_birth
          ? new Date(profile.date_of_birth).toISOString()
          : new Date('2000-01-01').toISOString(),
        time_of_birth: birth.time_of_birth || null,
        birth_city: birth.birth_city || null,
        birth_country: birth.birth_country || null,
        updated_at: new Date().toISOString(),
      };

      const { error: bErr } = await sb
        .from('birth_data')
        .upsert(birthPayload, { onConflict: 'user_id' });
      if (bErr) throw bErr;

      setSaveMsg('Profile saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setSaveMsg(`Error: ${err.message ?? 'Failed to save'}`);
    } finally {
      setSaving(false);
    }
  }, [userId, profile, birth]);

  /* ---- Photo upload ---- */
  const handlePhotoSelect = useCallback(
    async (index: number, file: File) => {
      if (!userId) return;
      const sb = getSupabase();

      // Mark uploading
      setPhotos((prev) => {
        const next = [...prev];
        const current = next[index] as PhotoSlot | undefined;
        next[index] = { id: current?.id ?? null, url: current?.url ?? null, is_primary: current?.is_primary ?? false, order: current?.order ?? index, uploading: true };
        return next;
      });

      try {
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${userId}/${Date.now()}_${index}.${ext}`;

        const { error: upErr } = await sb.storage
          .from('photos')
          .upload(path, file, { cacheControl: '3600', upsert: true });
        if (upErr) throw upErr;

        const {
          data: { publicUrl },
        } = sb.storage.from('photos').getPublicUrl(path);

        const isPrimary = index === 0 || !photos.some((p) => p.url);

        // Upsert to photos table
        const photoPayload = {
          user_id: userId,
          url: publicUrl,
          thumbnail_url: publicUrl,
          is_primary: isPrimary,
          order: index,
        };

        const { data: inserted, error: dbErr } = await sb
          .from('photos')
          .insert(photoPayload)
          .select()
          .single();
        if (dbErr) throw dbErr;

        setPhotos((prev) => {
          const next = [...prev];
          next[index] = {
            id: inserted.id,
            url: publicUrl,
            is_primary: isPrimary,
            order: index,
            uploading: false,
          };
          return next;
        });
      } catch (err: any) {
        console.error('Upload error:', err);
        setPhotos((prev) => {
          const next = [...prev];
          const current = next[index] as PhotoSlot | undefined;
          next[index] = { id: current?.id ?? null, url: current?.url ?? null, is_primary: current?.is_primary ?? false, order: current?.order ?? index, uploading: false };
          return next;
        });
        setSaveMsg(`Upload error: ${err.message ?? 'Failed'}`);
        setTimeout(() => setSaveMsg(''), 3000);
      }
    },
    [userId, photos],
  );

  const handleDeletePhoto = useCallback(
    async (index: number) => {
      const slot = photos[index];
      if (!slot?.id || !userId) return;
      try {
        const sb = getSupabase();
        await sb.from('photos').delete().eq('id', slot.id);
        setPhotos((prev) => {
          const next = [...prev];
          next[index] = {
            id: null,
            url: null,
            is_primary: index === 0,
            order: index,
          };
          return next;
        });
      } catch (err: any) {
        console.error('Delete photo error:', err);
      }
    },
    [photos, userId],
  );

  const handleSetPrimary = useCallback(
    async (index: number) => {
      if (!userId) return;
      const sb = getSupabase();
      // Unset all primary, set this one
      await sb.from('photos').update({ is_primary: false }).eq('user_id', userId);
      const slot = photos[index] as PhotoSlot | undefined;
      if (slot?.id) {
        await sb.from('photos').update({ is_primary: true }).eq('id', slot.id);
      }
      setPhotos((prev) =>
        prev.map((p, i) => ({ ...p, is_primary: i === index })),
      );
    },
    [userId, photos],
  );

  /* ---- Render helpers ---- */
  const pct = completionPercent(profile, birth, photos);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-gold-400"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
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
          <Link href="/dashboard" className="flex items-center gap-2.5 md:hidden">
            <Image src="/logo.png" alt="Agar" width={44} height={44} />
            <span className="font-display text-xl font-bold tracking-tight text-gold-100">
              Agar{' '}
              <span className="text-gold-400/60 font-normal text-sm ml-0.5">
                አጋር
              </span>
            </span>
          </Link>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gold-200/50 hover:text-gold-200 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="pt-24 pb-24 md:pb-16 px-4 sm:px-6 md:ml-20 lg:ml-56">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-gold-50 sm:text-4xl">
              Profile Setup
            </h1>
            <p className="mt-2 text-gold-200/40">
              Complete your profile to start getting matched.
            </p>

            {/* Completion bar */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gold-400 tabular-nums">
                {pct}%
              </span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-8" role="tablist" aria-label="Profile steps">
            {STEPS.map((label, i) => (
              <button
                key={label}
                role="tab"
                aria-selected={step === i}
                aria-controls={`step-panel-${i}`}
                onClick={() => setStep(i)}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-medium text-center rounded-lg transition-all ${
                  step === i
                    ? 'bg-gold-400/15 text-gold-300 border border-gold-400/25'
                    : 'text-gold-200/30 hover:text-gold-200/50 border border-transparent'
                }`}
              >
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">
                  {i + 1}. {label.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Step panels */}
          <div
            className="rounded-2xl border border-gold-400/15 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8"
            role="tabpanel"
            id={`step-panel-${step}`}
          >
            {/* Step 1: Basic Info */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-gold-50 mb-1">
                  Basic Information
                </h2>
                <p className="text-sm text-gold-200/40 mb-4">
                  Tell us about yourself.
                </p>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldGroup label="First Name" required>
                    <input
                      type="text"
                      value={profile.first_name}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          first_name: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="Your first name"
                    />
                  </FieldGroup>

                  <FieldGroup label="Last Name">
                    <input
                      type="text"
                      value={profile.last_name}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          last_name: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="Your last name"
                    />
                  </FieldGroup>
                </div>

                <FieldGroup label="Display Name" required>
                  <input
                    type="text"
                    value={profile.display_name}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        display_name: e.target.value,
                      }))
                    }
                    className="input-field"
                    placeholder="How others will see you"
                  />
                </FieldGroup>

                <FieldGroup label="Bio / About Me">
                  <textarea
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        bio: e.target.value.slice(0, 500),
                      }))
                    }
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Write a short bio..."
                  />
                  <p className="text-xs text-gold-200/30 mt-1 text-right">
                    {profile.bio.length}/500
                  </p>
                </FieldGroup>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldGroup label="Date of Birth" required>
                    <input
                      type="date"
                      value={profile.date_of_birth}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          date_of_birth: e.target.value,
                        }))
                      }
                      className="input-field"
                      max={
                        new Date(
                          Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000,
                        )
                          .toISOString()
                          .slice(0, 10)
                      }
                    />
                  </FieldGroup>

                  <FieldGroup label="Gender" required>
                    <select
                      value={profile.gender}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          gender: e.target.value,
                        }))
                      }
                      className="input-field"
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non_binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </FieldGroup>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldGroup label="City">
                    <input
                      type="text"
                      value={profile.location_city}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          location_city: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="e.g. Addis Ababa"
                    />
                  </FieldGroup>

                  <FieldGroup label="Country">
                    <input
                      type="text"
                      value={profile.location_country}
                      onChange={(e) =>
                        setProfile((p) => ({
                          ...p,
                          location_country: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="e.g. Ethiopia"
                    />
                  </FieldGroup>
                </div>
              </div>
            )}

            {/* Step 2: Birth Details */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-gold-50 mb-1">
                  Birth Details
                </h2>
                <div className="rounded-xl bg-gold-400/5 border border-gold-400/10 p-4 mb-2">
                  <p className="text-sm text-gold-200/60 leading-relaxed">
                    <span className="text-gold-400 font-medium">Why?</span> Your
                    birth details help us calculate astrological compatibility
                    across Western, Vedic, and Chinese systems. The more accurate
                    your birth time, the better your matches.
                  </p>
                </div>

                <FieldGroup label="Time of Birth (optional)">
                  <input
                    type="time"
                    value={birth.time_of_birth}
                    onChange={(e) =>
                      setBirth((b) => ({
                        ...b,
                        time_of_birth: e.target.value,
                      }))
                    }
                    className="input-field"
                  />
                  <p className="text-xs text-gold-200/30 mt-1">
                    Check your birth certificate for the most accurate time.
                  </p>
                </FieldGroup>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldGroup label="Birth City">
                    <input
                      type="text"
                      value={birth.birth_city}
                      onChange={(e) =>
                        setBirth((b) => ({
                          ...b,
                          birth_city: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="City where you were born"
                    />
                  </FieldGroup>

                  <FieldGroup label="Birth Country">
                    <input
                      type="text"
                      value={birth.birth_country}
                      onChange={(e) =>
                        setBirth((b) => ({
                          ...b,
                          birth_country: e.target.value,
                        }))
                      }
                      className="input-field"
                      placeholder="Country where you were born"
                    />
                  </FieldGroup>
                </div>
              </div>
            )}

            {/* Step 3: Photos */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-gold-50 mb-1">
                  Photos
                </h2>
                <p className="text-sm text-gold-200/40 mb-4">
                  Upload up to 6 photos. Your first photo will be your primary
                  profile picture.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((slot, i) => (
                    <div
                      key={i}
                      className="relative aspect-[3/4] rounded-xl border border-gold-400/15 bg-white/[0.02] overflow-hidden group"
                    >
                      {slot.url ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={slot.url}
                            alt={`Photo ${i + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          {/* Overlay controls */}
                          <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            {!slot.is_primary && (
                              <button
                                onClick={() => handleSetPrimary(i)}
                                className="text-xs bg-gold-400/20 hover:bg-gold-400/30 text-gold-200 rounded-lg px-3 py-1.5 transition-colors"
                              >
                                Set as primary
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePhoto(i)}
                              className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg px-3 py-1.5 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          {/* Primary badge */}
                          {slot.is_primary && (
                            <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-gold-400/90 text-navy-950 rounded-md px-2 py-0.5">
                              Primary
                            </span>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => fileInputRefs.current[i]?.click()}
                          className="absolute inset-0 flex flex-col items-center justify-center text-gold-200/30 hover:text-gold-200/50 hover:bg-white/[0.02] transition-colors"
                          aria-label={`Upload photo ${i + 1}`}
                        >
                          {slot.uploading ? (
                            <svg
                              className="animate-spin h-6 w-6"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="3"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                          ) : (
                            <>
                              <svg
                                className="w-8 h-8 mb-1"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 4.5v15m7.5-7.5h-15"
                                />
                              </svg>
                              <span className="text-xs">
                                {i === 0 ? 'Main photo' : `Photo ${i + 1}`}
                              </span>
                            </>
                          )}
                        </button>
                      )}
                      <input
                        ref={(el) => {
                          fileInputRefs.current[i] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handlePhotoSelect(i, f);
                          e.target.value = '';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-gold-50 mb-1">
                  Matching Preferences
                </h2>
                <p className="text-sm text-gold-200/40 mb-4">
                  Who are you looking for?
                </p>

                <FieldGroup label="Looking For">
                  <div className="flex gap-2">
                    {(['male', 'female', 'everyone'] as const).map((val) => (
                      <button
                        key={val}
                        onClick={() =>
                          setProfile((p) => ({
                            ...p,
                            gender_preference: val,
                          }))
                        }
                        className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                          profile.gender_preference === val
                            ? 'bg-gold-400/15 border-gold-400/30 text-gold-300'
                            : 'border-gold-400/10 text-gold-200/40 hover:border-gold-400/20 hover:text-gold-200/60'
                        }`}
                      >
                        {val === 'male'
                          ? 'Men'
                          : val === 'female'
                            ? 'Women'
                            : 'Everyone'}
                      </button>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup
                  label={`Age Range: ${profile.age_range_min} - ${profile.age_range_max}`}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gold-200/30 mb-1 block">
                        Minimum
                      </label>
                      <input
                        type="range"
                        min={18}
                        max={65}
                        value={profile.age_range_min}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            age_range_min: Math.min(
                              Number(e.target.value),
                              p.age_range_max - 1,
                            ),
                          }))
                        }
                        className="w-full accent-gold-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gold-200/30 mb-1 block">
                        Maximum
                      </label>
                      <input
                        type="range"
                        min={18}
                        max={65}
                        value={profile.age_range_max}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            age_range_max: Math.max(
                              Number(e.target.value),
                              p.age_range_min + 1,
                            ),
                          }))
                        }
                        className="w-full accent-gold-400"
                      />
                    </div>
                  </div>
                </FieldGroup>

                <FieldGroup label={`Max Distance: ${profile.max_distance} km`}>
                  <input
                    type="range"
                    min={5}
                    max={500}
                    step={5}
                    value={profile.max_distance}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        max_distance: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-gold-400"
                  />
                  <div className="flex justify-between text-xs text-gold-200/30 mt-1">
                    <span>5 km</span>
                    <span>500 km</span>
                  </div>
                </FieldGroup>
              </div>
            )}
          </div>

          {/* Navigation + Save */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-xl border border-gold-400/15 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-gold-200/60 hover:text-gold-200 hover:border-gold-400/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-3">
              {saveMsg && (
                <span
                  className={`text-sm ${
                    saveMsg.startsWith('Error')
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {saveMsg}
                </span>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-2.5 text-sm font-bold text-navy-950 hover:from-gold-400 hover:to-gold-300 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>

              {step < TOTAL_STEPS - 1 && (
                <button
                  onClick={() => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1))}
                  className="rounded-xl border border-gold-400/25 bg-gold-400/10 px-5 py-2.5 text-sm font-medium text-gold-200 hover:bg-gold-400/15 transition-all"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Global input styles injected via style tag for this page */}
      <style>{`
        .input-field {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(212, 165, 74, 0.15);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #fdf0d5;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field:focus {
          border-color: rgba(212, 165, 74, 0.4);
          box-shadow: 0 0 0 3px rgba(212, 165, 74, 0.08);
        }
        .input-field::placeholder {
          color: rgba(212, 165, 74, 0.25);
        }
        .input-field option {
          background: #0C2948;
          color: #fdf0d5;
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function FieldGroup({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gold-200/70 mb-1.5">
        {label}
        {required && <span className="text-gold-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
