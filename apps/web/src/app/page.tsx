'use client';

import { useState } from 'react';
import Link from 'next/link';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
] as const;

export default function LandingPage() {
  const [lang, setLang] = useState<'en' | 'am' | 'es'>('en');

  const content = {
    en: {
      hero: 'Where Stars Align & Hearts Connect',
      subtitle: 'AI-powered matchmaking that understands your cosmic compatibility, cultural values, and unique personality.',
      cta: 'Get Started',
      ctaSecondary: 'Learn More',
      features: [
        { title: 'Cosmic Compatibility', desc: 'Western, Vedic & Chinese astrology combined', icon: 'star' },
        { title: 'Smart Matching', desc: 'AI-powered behavioral compatibility engine', icon: 'brain' },
        { title: 'Referral Mode', desc: 'Let friends & family help find your match', icon: 'users' },
        { title: 'Cultural Intelligence', desc: 'Respects traditions while embracing modern dating', icon: 'globe' },
      ],
    },
    am: {
      hero: 'ከዋክብት የሚገናኙበት፣ ልቦች የሚተሳሰሩበት',
      subtitle: 'የኮከብ ቆጠራ ተኳኋኝነት፣ ባህላዊ እሴቶች እና ልዩ ስብዕና በAI የተደገፈ ግጥሚያ።',
      cta: 'ጀምር',
      ctaSecondary: 'ተጨማሪ ይወቁ',
      features: [
        { title: 'የኮከብ ተኳኋኝነት', desc: 'ምዕራባዊ፣ ቬዲክ እና የቻይና ኮከብ ቆጠራ', icon: 'star' },
        { title: 'ብልጥ ግጥሚያ', desc: 'በAI የተደገፈ የባህሪ ተኳኋኝነት', icon: 'brain' },
        { title: 'ሪፈራል ሁነታ', desc: 'ጓደኞች እና ቤተሰብ ግጥሚያ እንዲያገኙ ይርዱ', icon: 'users' },
        { title: 'ባህላዊ ብልህነት', desc: 'ባህልን ያከብራል ዘመናዊ ፍቅርን ያስተናግዳል', icon: 'globe' },
      ],
    },
    es: {
      hero: 'Donde las Estrellas se Alinean y los Corazones se Conectan',
      subtitle: 'Emparejamiento impulsado por IA que comprende tu compatibilidad cósmica, valores culturales y personalidad única.',
      cta: 'Comenzar',
      ctaSecondary: 'Más Información',
      features: [
        { title: 'Compatibilidad Cósmica', desc: 'Astrología occidental, védica y china combinadas', icon: 'star' },
        { title: 'Emparejamiento Inteligente', desc: 'Motor de compatibilidad conductual con IA', icon: 'brain' },
        { title: 'Modo de Referencia', desc: 'Deja que amigos y familia te ayuden', icon: 'users' },
        { title: 'Inteligencia Cultural', desc: 'Respeta tradiciones y abraza lo moderno', icon: 'globe' },
      ],
    },
  };

  const t = content[lang];
  const icons: Record<string, string> = {
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    brain: 'M12 2a9 9 0 0 0-9 9c0 3.87 2.46 7.16 5.91 8.42L12 22l3.09-2.58A9.001 9.001 0 0 0 12 2zm0 2a7 7 0 1 1 0 14 7 7 0 0 1 0-14z',
    users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    globe: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white">
      {/* Language Selector */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#a78bfa] text-lg font-bold">
            A
          </div>
          <span className="font-display text-xl font-bold">Agar</span>
          <span className="text-sm opacity-60">| አጋር</span>
        </div>
        <div className="flex items-center gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code as typeof lang)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
                lang === l.code
                  ? 'bg-white/20 font-medium'
                  : 'hover:bg-white/10 opacity-70'
              }`}
            >
              {l.flag} {l.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        <div className="animate-card-enter max-w-3xl">
          {/* Floating zodiac symbols */}
          <div className="mb-8 flex items-center justify-center gap-4 text-3xl opacity-40">
            <span>&#x2648;</span><span>&#x2649;</span><span>&#x264A;</span>
            <span>&#x264B;</span><span>&#x264C;</span><span>&#x264D;</span>
          </div>

          <h1 className="font-display mb-6 text-5xl font-extrabold leading-tight md:text-7xl">
            <span className="bg-gradient-to-r from-[#a78bfa] via-[#ff6b6b] to-[#ffd93d] bg-clip-text text-transparent">
              {t.hero}
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-white/70 md:text-xl">
            {t.subtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="rounded-2xl bg-gradient-to-r from-[#6c5ce7] to-[#a78bfa] px-8 py-4 text-lg font-semibold shadow-lg shadow-[#6c5ce7]/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#6c5ce7]/40"
            >
              {t.cta}
            </Link>
            <Link
              href="#features"
              className="rounded-2xl border border-white/20 px-8 py-4 text-lg font-medium transition-all hover:bg-white/10"
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-40">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {t.features.map((feature, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-[#6c5ce7]/50 hover:bg-white/10"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6c5ce7]/20 to-[#a78bfa]/20">
                <svg width="24" height="24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icons[feature.icon]} />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-white/60">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <p className="mb-2 text-lg text-white/50">*</p>
          <p className="text-sm leading-relaxed text-white/40 italic">
            {lang === 'en' && 'Built with love, math, and a healthy dose of humility. Our compatibility algorithm is smart, but it\'s not a fortune teller. Think of it as a really well-read friend who\'s good with numbers. Be honest with your data — our stars can only align if you give them real coordinates.'}
            {lang === 'am' && 'በፍቅር፣ ሒሳብ እና ትህትና ተሠርቷል። አልጎሪዝማችን ብልጥ ነው ግን ጠንቋይ አይደለም። ቁጥሮችን በደንብ እንደሚያውቅ ጓደኛ ያስቡት። መረጃዎን በእውነት ያስገቡ — ከዋክብቶቻችን ትክክለኛ ኮኦርዲኔት ሲሰጡ ብቻ ነው የሚገጣጠሙት።'}
            {lang === 'es' && 'Hecho con amor, matemáticas y una dosis saludable de humildad. Nuestro algoritmo es inteligente, pero no es adivino. Piensa en él como un amigo muy leído que es bueno con los números. Sé honesto con tus datos — nuestras estrellas solo se alinean si les das coordenadas reales.'}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/40">
        <p>&copy; 2026 Agar (አጋር). All rights reserved.</p>
      </footer>
    </div>
  );
}
