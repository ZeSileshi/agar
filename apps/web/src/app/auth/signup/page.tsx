'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

type UserType = 'direct' | 'referrer';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [userType, setUserType] = useState<UserType>('direct');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard');
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || undefined,
            user_type: userType,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setSuccess(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full rounded-xl border border-gold-400/15 bg-navy-800/60 px-4 py-3 text-gold-100 placeholder-gold-200/25 outline-none focus:border-gold-400/40 focus:ring-2 focus:ring-gold-400/10 transition-all';

  return (
    <div className="min-h-screen bg-navy-950 text-gold-100 flex flex-col">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gold-400/5 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-gold-500/3 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gold-400/10 bg-navy-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Agar" width={40} height={40} className="logo-blend" />
            <span className="font-display text-lg font-bold tracking-tight text-gold-100">
              Agar
            </span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gold-400/15 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            {success ? (
              <div className="text-center py-4">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/10 border border-gold-400/20">
                  <svg className="w-8 h-8 text-gold-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-bold text-gold-50 mb-3">Check your email</h2>
                <p className="text-gold-200/40 leading-relaxed mb-6">
                  We sent a verification link to <span className="text-gold-200/70 font-medium">{email}</span>. Click it to activate your account.
                </p>
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to sign in
                </Link>
              </div>
            ) : step === 'type' ? (
              /* ---- Step 1: Choose user type ---- */
              <>
                <div className="text-center mb-6">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gold-50">
                    How will you use Agar?
                  </h1>
                  <p className="mt-2 text-sm text-gold-200/40">
                    Choose how you&apos;d like to get started
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Direct user */}
                  <button
                    onClick={() => { setUserType('direct'); setStep('form'); }}
                    className={`w-full text-left rounded-xl border p-4 transition-all active:scale-[0.98] ${
                      'border-gold-400/15 hover:border-gold-400/30 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5 h-10 w-10 rounded-xl bg-gold-400/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-gold-50 text-base">I&apos;m looking for a match</h3>
                        <p className="mt-1 text-xs text-gold-200/40 leading-relaxed">
                          Create your profile with astrology, personality, and optional palm reading to find your perfect match.
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gold-400/40 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>

                  {/* Referrer user */}
                  <button
                    onClick={() => { setUserType('referrer'); setStep('form'); }}
                    className={`w-full text-left rounded-xl border p-4 transition-all active:scale-[0.98] ${
                      'border-rose-400/15 hover:border-rose-400/30 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5 h-10 w-10 rounded-xl bg-rose-400/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-gold-50 text-base">I&apos;m referring someone I know</h3>
                        <p className="mt-1 text-xs text-gold-200/40 leading-relaxed">
                          Help a friend, family member, or someone you care about find love. You&apos;ll see other referrals to connect with.
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-rose-400/40 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>
                </div>

                {/* Sign in link */}
                <p className="mt-6 text-center text-sm text-gold-200/40">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-medium text-gold-400 hover:text-gold-300 transition-colors">
                    Sign in
                  </Link>
                </p>
              </>
            ) : (
              /* ---- Step 2: Registration form ---- */
              <>
                {/* Back + heading */}
                <div className="mb-6">
                  <button
                    onClick={() => setStep('type')}
                    className="flex items-center gap-1 text-sm text-gold-200/40 hover:text-gold-200/70 transition-colors mb-4"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back
                  </button>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ${
                      userType === 'direct'
                        ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20'
                        : 'bg-rose-400/10 text-rose-400 border border-rose-400/20'
                    }`}>
                      {userType === 'direct' ? 'Looking for a match' : 'Referring someone'}
                    </span>
                  </div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-gold-50">
                    Create your account
                  </h1>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300" role="alert">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gold-200/60 mb-1.5">
                      Full name
                    </label>
                    <input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name" autoComplete="name" className={inputClass} />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gold-200/60 mb-1.5">
                      Email address
                    </label>
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email" className={inputClass} />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gold-200/60 mb-1.5">
                      Phone number <span className="text-gold-200/25">(optional)</span>
                    </label>
                    <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 912 345 678" autoComplete="tel" className={inputClass} />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gold-200/60 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input id="password" type={showPassword ? 'text' : 'password'} required minLength={6}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters" autoComplete="new-password"
                        className={`${inputClass} pr-11`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-200/30 hover:text-gold-200/60 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          {showPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          ) : (
                            <>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gold-200/60 mb-1.5">
                      Confirm password
                    </label>
                    <input id="confirmPassword" type="password" required minLength={6}
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password" autoComplete="new-password" className={inputClass} />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-6 py-3.5 text-base font-semibold text-navy-950 shadow-lg shadow-gold-400/15 transition-all hover:from-gold-300 hover:to-gold-400 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-gold-400/10" />
                  <span className="text-xs text-gold-200/25">or</span>
                  <div className="flex-1 h-px bg-gold-400/10" />
                </div>

                <p className="mt-4 text-center text-sm text-gold-200/40">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-medium text-gold-400 hover:text-gold-300 transition-colors">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
