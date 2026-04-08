'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Trilingual content                                                 */
/* ------------------------------------------------------------------ */
const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'am', label: 'አማ' },
  { code: 'es', label: 'ES' },
] as const;

type Lang = 'en' | 'am' | 'es';

const content = {
  en: {
    nav: { signin: 'Sign In', register: 'Register' },
    hero: {
      badge: 'Astrology meets AI',
      title: 'Find someone who truly',
      titleAccent: 'gets you.',
      subtitle: 'Agar combines three astrology systems, personality science, and cultural intelligence to find matches that actually make sense.',
      cta: 'Start matching — it\u2019s free',
      ctaSecondary: 'How it works',
      appStore: 'App Store',
      googlePlay: 'Google Play',
    },
    social: {
      users: '50K+',
      usersLabel: 'active members',
      matches: '12K+',
      matchesLabel: 'matches made',
      rating: '4.8',
      ratingLabel: 'average rating',
    },
    how: {
      label: 'How Agar works',
      title: 'Two ways to find love',
      paths: {
        match: {
          heading: 'Find Your Match',
          steps: [
            { num: '01', title: 'Create your account', desc: 'Sign up with your phone number and build your profile in minutes.' },
            { num: '02', title: 'Scan your palm', desc: 'Optionally scan your palm for deeper compatibility insights powered by AI.' },
            { num: '03', title: 'Browse daily matches', desc: 'See 10 curated matches every day. Like, love, gift, or skip.' },
            { num: '04', title: 'Start chatting', desc: 'Mutual likes unlock private chat so you can connect for real.' },
          ],
        },
        refer: {
          heading: 'Refer Someone',
          steps: [
            { num: '01', title: 'Know a great match?', desc: 'Know someone who deserves love? Refer them to Agar.' },
            { num: '02', title: 'Add their details', desc: 'Just text details — no photos needed. Quick and respectful.' },
            { num: '03', title: 'They get discovered', desc: 'Your referral appears for other referrals to find and connect with.' },
          ],
        },
      },
    },
    features: {
      label: 'Why Agar',
      title: 'Not another swiping app',
      items: [
        {
          icon: 'astrology',
          title: 'Triple astrology engine',
          desc: 'Western synastry, Vedic Guna Milan (36-point), and Chinese zodiac compatibility — working together, not in isolation.',
        },
        {
          icon: 'brain',
          title: 'Behavioral science',
          desc: 'Big Five personality model analyzes how you actually think and communicate. Gets smarter the more you use it.',
        },
        {
          icon: 'people',
          title: 'Community referrals',
          desc: 'Let trusted friends and family weigh in on your matches. Dating the way it was meant to be — with your people behind you.',
        },
        {
          icon: 'globe',
          title: 'Cultural intelligence',
          desc: 'Built for diverse traditions and values. Available in English, Amharic, and Spanish.',
        },
        {
          icon: 'lock',
          title: 'Privacy first',
          desc: 'End-to-end encrypted messages. No data selling. Delete everything anytime. Your birth chart is yours.',
        },
        {
          icon: 'chat',
          title: 'Real conversations',
          desc: 'Guided conversation starters based on your shared compatibility. No more awkward "hey" messages.',
        },
      ],
    },
    honesty: {
      title: 'A quick note on honesty',
      text: 'For the best results, be truthful with your birth details, personality answers, and palm photos. The more honest you are, the better our matching works.',
      disclaimer: 'Also — let\u2019s be real: this is just our algorithm. It\u2019s pretty good, but it\u2019s not perfect. Think of it as a very smart friend who sometimes gets it wrong. \u2764\uFE0F',
    },
    cta: {
      title: 'Ready to meet someone\nwho gets you?',
      subtitle: 'Join thousands finding real connection through compatibility science.',
      button: 'Get started free',
      emailPlaceholder: 'Enter your email',
    },
    footer: {
      tagline: 'Where stars align and hearts connect.',
      links: ['About', 'Privacy', 'Terms', 'Support'],
      copy: '\u00A9 2026 Agar (\u12A0\u130B\u122D). All rights reserved.',
    },
  },
  am: {
    nav: { signin: '\u1260\u12ED\u1295', register: '\u12ED\u1218\u12DD\u1308\u1261' },
    hero: {
      badge: '\u12AE\u12A8\u1265 \u1246\u1320\u122B \u12A8AI \u130B\u122D',
      title: '\u1260\u12A5\u1235\u12A9 \u12E8\u121A\u1308\u1263\u12CE\u1275\u1295',
      titleAccent: '\u12EB\u130D\u1299\u1362',
      subtitle: '\u12A0\u130B\u122D \u1230\u120D\u1235\u1270 \u12E8\u12AE\u12A8\u1265 \u1246\u1320\u122B \u1235\u122D\u12D3\u1276\u127D\u1295\u1363 \u12E8\u1235\u1265\u12D5\u1293 \u1233\u12ED\u1295\u1235 \u12A5\u1293 \u1263\u1205\u120B\u12CA \u1265\u120D\u1205\u1290\u1275\u1295 \u1260\u121B\u1348\u1293\u1308\u122D \u1275\u12AD\u12AD\u1208\u129B \u130D\u1325\u121A\u12EB\u12CE\u127D\u1295 \u12EB\u130D\u1293\u120D\u1362',
      cta: '\u130D\u1325\u121A\u12EB \u1305\u121D\u122D \u2014 \u1260\u1290\u133D\u1290\u1275',
      ctaSecondary: '\u12A5\u1295\u12F0\u1275 \u12A5\u1295\u12F0\u121A\u1230\u122B',
      appStore: 'App Store',
      googlePlay: 'Google Play',
    },
    social: {
      users: '50K+',
      usersLabel: '\u1290\u1243 \u12A0\u1263\u120B\u1275',
      matches: '12K+',
      matchesLabel: '\u130D\u1325\u121A\u12EB\u12CE\u127D',
      rating: '4.8',
      ratingLabel: '\u12A0\u121B\u12AB\u12ED \u12F0\u1228\u1303',
    },
    how: {
      label: 'አጋር እንደት ይሰራል',
      title: 'ፍቅር ለማግኘት ሁለት መንገዶች',
      paths: {
        match: {
          heading: 'ግጥሚያዎን ያግኙ',
          steps: [
            { num: '01', title: 'መለያ ይፍጠሩ', desc: 'በስልክ ቁጥርዎ ይመዝገቡ እና በደቂቃዎች ውስጥ ፕሮፋይልዎን ይገንቡ።' },
            { num: '02', title: 'እጅዎን ያስቃኑ', desc: 'በ AI የተጎለበተ ጥልቅ ተኳኋኝነት ግንዛቤዎችን ለማግኘት እጅዎን ያስቃኑ።' },
            { num: '03', title: 'ዕለታዊ ግጥሚያዎችን ይመልከቱ', desc: 'በየቀኑ 10 የተመረጡ ግጥሚያዎችን ይመልከቱ። ይውደዱ፣ ስጦታ ይላኩ ወይም ይዝለሉ።' },
            { num: '04', title: 'ውይይት ይጀምሩ', desc: 'የጋራ ውዳሴ የግል ቻት ይከፍታል ስለዚህ በእውነት መገናኘት ይችላሉ።' },
          ],
        },
        refer: {
          heading: 'ሰው ይጠቁሙ',
          steps: [
            { num: '01', title: 'ጥሩ ግጥሚያ ያውቃሉ?', desc: 'ፍቅር የሚገባው ሰው ያውቃሉ? ወደ አጋር ይጠቁሙ።' },
            { num: '02', title: 'ዝርዝራቸውን ያክሉ', desc: 'የጽሑፍ ዝርዝሮች ብቻ — ፎቶዎች አያስፈልጉም። ፈጣን እና ያክብሮታል።' },
            { num: '03', title: 'ይገኛሉ', desc: 'ሪፈራልዎ ሌሎች ሪፈራሎች እንዲያገኙ እና እንዲገናኙ ይታያል።' },
          ],
        },
      },
    },
    features: {
      label: '\u1208\u121D\u1295 \u12A0\u130B\u122D?',
      title: '\u120C\u120B \u12E8\u121B\u1295\u1248\u1323\u1320\u132D \u1218\u1270\u130D\u1260\u122A\u12EB \u12A0\u12ED\u12F0\u1208\u121D',
      items: [
        {
          icon: 'astrology',
          title: '\u1230\u120D\u1235\u1270 \u12E8\u12AE\u12A8\u1265 \u1246\u1320\u122B',
          desc: '\u121D\u12D5\u122B\u1263\u12CA synastry\u1363 \u126C\u12F2\u12AD Guna Milan (36-point) \u12A5\u1293 \u12E8\u127B\u12ED\u1293 \u12E8\u12AE\u12A8\u1265 \u1246\u1320\u122B \u12A0\u1265\u122C\u12CD \u12ED\u1230\u122B\u1209\u1362',
        },
        {
          icon: 'brain',
          title: '\u12E8\u1263\u1205\u122A \u1233\u12ED\u1295\u1235',
          desc: 'Big Five \u12E8\u1235\u1265\u12D5\u1293 \u121E\u12F4\u120D \u12A5\u1295\u12F0\u1275 \u12A5\u1295\u12F0\u121A\u12EB\u1235\u1261 \u12A5\u1293 \u12A5\u1295\u12F0\u121A\u130D\u1263\u1261 \u12ED\u1218\u1228\u121D\u122B\u120D\u1362',
        },
        {
          icon: 'people',
          title: '\u12E8\u121B\u1205\u1260\u1228\u1230\u1265 \u122A\u1348\u122B\u120D',
          desc: '\u1270\u12A0\u121B\u129D \u130D\u1325\u121A\u12EB\u12CE\u127D\u1295 \u12A5\u1295\u12F2\u12EB\u130D\u1299 \u1260\u121B\u1205\u1260\u1228\u1230\u1265 \u12ED\u122D\u12F1\u1362',
        },
        {
          icon: 'globe',
          title: '\u1263\u1205\u120B\u12CA \u1265\u120D\u1205\u1290\u1275',
          desc: '\u1263\u1205\u120D\u1295 \u12EB\u12A8\u1265\u122B\u120D\u1362 \u1260\u12A5\u1295\u130D\u120A\u12DD\u129B\u1363 \u1260\u12A0\u121B\u122D\u129B \u12A5\u1293 \u1260\u1235\u1353\u1292\u123D \u12ED\u1308\u129B\u120D\u1362',
        },
        {
          icon: 'lock',
          title: '\u130D\u120B\u12CA\u1290\u1275 \u1240\u12F3\u121A',
          desc: '\u12E8\u1218\u120D\u12A5\u12AD\u1276\u127D \u12AE\u12F5 \u1270\u1218\u1230\u1320\u1228\u12CD\u1362 \u1218\u1228\u1303 \u12A0\u12ED\u123B\u1325\u121D\u1362 \u1218\u127B\u12CD \u12E8\u12A5\u122D\u1235\u12CE \u1290\u12CD\u1362',
        },
        {
          icon: 'chat',
          title: '\u12A5\u12CD\u1290\u1270\u129B \u12CD\u12ED\u12ED\u1276\u127D',
          desc: '\u1260\u1270\u12AB\u12CB\u129D\u1290\u1275 \u120B\u12ED \u12E8\u1270\u1218\u1230\u1228\u1271 \u12E8\u12CD\u12ED\u12ED\u1275 \u1218\u1305\u1218\u122A\u12EB\u12CE\u127D\u1362',
        },
      ],
    },
    honesty: {
      title: '\u1235\u1208 \u1270\u12A0\u121B\u129D\u1290\u1275 \u12A0\u132D\u122D \u121B\u1235\u1273\u12C8\u123B',
      text: '\u1208\u1270\u123B\u1208 \u12CD\u1324\u1275 \u12E8\u120D\u12F0\u1275 \u12DD\u122D\u12DD\u122E\u127D\u1295\u1363 \u12E8\u1235\u1265\u12D5\u1293 \u1218\u120D\u1236\u127D\u1295 \u12A5\u1293 \u12E8\u12A5\u1325 \u134E\u1276\u12CE\u127D\u1295 \u1260\u1205\u120D\u121D\u1293\u12CE \u12EB\u130D\u1299\u1362',
      disclaimer: '\u12A5\u1293\u121D \u2014 \u12A5\u1295\u1230\u122B\u12ED\u1206: \u12ED\u1205 \u12E8\u12A5\u129D \u12A0\u120D\u1310\u122A\u12DD\u121D \u1290\u12CD\u1362 \u1260\u1323\u121D \u1325\u1229 \u1290\u12CD \u130D\u1295 \u134D\u133B\u121D \u12A0\u12ED\u12F0\u1208\u121D\u1362 \u12A5\u1295\u12F0 \u1260\u1323\u121D \u1325\u1229 \u130D\u1295 \u12A0\u120F \u12E8\u1270\u1233\u1233\u1270 \u1325\u1229 \u130B\u12F0\u129B \u12A0\u12F5\u122D\u1309\u1275 \u12EB\u1235\u1261\u1275\u1362 \u2764\uFE0F',
    },
    cta: {
      title: '\u1260\u12A5\u1235\u12A9 \u12E8\u121A\u1308\u1263\u12CE\u1275\u1295\n\u1208\u121B\u130D\u1298\u1275 \u12DD\u130D\u1301 \u1290\u12CE\u1275?',
      subtitle: '\u1260\u1270\u12B3\u12CB\u129D\u1290\u1275 \u1233\u12ED\u1295\u1235 \u12A5\u12CD\u1290\u1270\u129B \u130D\u1295\u1299\u1290\u1275 \u12A8\u121A\u12EB\u130D\u1299 \u1262\u1206\u127D \u130B\u122D \u12ED\u1240\u120B\u1240\u1209\u1362',
      button: '\u1260\u1290\u133D\u1290\u1275 \u1305\u121D\u122D',
      emailPlaceholder: '\u12A2\u121C\u12ED\u120D\u12CE\u1295 \u12EB\u1235\u1308\u1261',
    },
    footer: {
      tagline: '\u12A8\u12CB\u12AD\u1265\u1275 \u12E8\u121A\u1308\u1293\u1299\u1260\u1275\u1363 \u120D\u1266\u127D \u12E8\u121A\u1270\u1233\u1230\u1229\u1260\u1275\u1362',
      links: ['\u1235\u1208 \u12A5\u129D', '\u130D\u120B\u12CA\u1290\u1275', '\u12CD\u120E\u127D', '\u12F5\u130B\u134D'],
      copy: '\u00A9 2026 \u12A0\u130B\u122D. \u1201\u1209\u121D \u1218\u1265\u1276\u127D \u12E8\u1270\u1328\u1261 \u1293\u1278\u12CD\u1362',
    },
  },
  es: {
    nav: { signin: 'Iniciar', register: 'Registrarse' },
    hero: {
      badge: 'Astrolog\u00EDa + IA',
      title: 'Encuentra a alguien que',
      titleAccent: 'te entienda.',
      subtitle: 'Agar combina tres sistemas astrol\u00F3gicos, ciencia de la personalidad e inteligencia cultural para encontrar coincidencias que realmente tienen sentido.',
      cta: 'Comienza gratis',
      ctaSecondary: 'C\u00F3mo funciona',
      appStore: 'App Store',
      googlePlay: 'Google Play',
    },
    social: {
      users: '50K+',
      usersLabel: 'miembros activos',
      matches: '12K+',
      matchesLabel: 'parejas hechas',
      rating: '4.8',
      ratingLabel: 'calificaci\u00F3n promedio',
    },
    how: {
      label: 'C\u00F3mo funciona',
      title: 'Dos caminos hacia el amor',
      paths: {
        match: {
          heading: 'Encuentra tu pareja',
          steps: [
            { num: '01', title: 'Crea tu cuenta', desc: 'Reg\u00EDstrate con tu n\u00FAmero de tel\u00E9fono y crea tu perfil en minutos.' },
            { num: '02', title: 'Escanea tu palma', desc: 'Opcionalmente escanea tu palma para obtener informaci\u00F3n de compatibilidad m\u00E1s profunda con IA.' },
            { num: '03', title: 'Explora coincidencias diarias', desc: 'Ve 10 coincidencias seleccionadas cada d\u00EDa. Da like, ama, regala o pasa.' },
            { num: '04', title: 'Comienza a chatear', desc: 'Los likes mutuos desbloquean el chat privado para conectar de verdad.' },
          ],
        },
        refer: {
          heading: 'Recomienda a alguien',
          steps: [
            { num: '01', title: '\u00BFConoces a alguien ideal?', desc: '\u00BFConoces a alguien que merece amor? Refi\u00E9relo a Agar.' },
            { num: '02', title: 'Agrega sus datos', desc: 'Solo datos de texto \u2014 no se necesitan fotos. R\u00E1pido y respetuoso.' },
            { num: '03', title: 'Son descubiertos', desc: 'Tu referido aparece para que otros referidos lo encuentren y conecten.' },
          ],
        },
      },
    },
    features: {
      label: 'Por qu\u00E9 Agar',
      title: 'No es otra app de deslizar',
      items: [
        {
          icon: 'astrology',
          title: 'Triple motor astrol\u00F3gico',
          desc: 'Sinastria occidental, Guna Milan v\u00E9dico (36 puntos), y compatibilidad del zodiaco chino \u2014 trabajando juntos.',
        },
        {
          icon: 'brain',
          title: 'Ciencia del comportamiento',
          desc: 'El modelo de personalidad Big Five analiza c\u00F3mo piensas y te comunicas realmente.',
        },
        {
          icon: 'people',
          title: 'Referencias comunitarias',
          desc: 'Deja que amigos y familia de confianza opinen sobre tus coincidencias.',
        },
        {
          icon: 'globe',
          title: 'Inteligencia cultural',
          desc: 'Construido para tradiciones y valores diversos. Disponible en ingl\u00E9s, amh\u00E1rico y espa\u00F1ol.',
        },
        {
          icon: 'lock',
          title: 'Privacidad primero',
          desc: 'Mensajes cifrados de extremo a extremo. Sin venta de datos. Elimina todo cuando quieras.',
        },
        {
          icon: 'chat',
          title: 'Conversaciones reales',
          desc: 'Iniciadores de conversaci\u00F3n basados en tu compatibilidad compartida.',
        },
      ],
    },
    honesty: {
      title: 'Una nota sobre la honestidad',
      text: 'Para mejores resultados, s\u00E9 sincero con tus datos de nacimiento, respuestas de personalidad y fotos de palma.',
      disclaimer: 'Tambi\u00E9n \u2014 seamos honestos: esto es solo nuestro algoritmo. Es bastante bueno, pero no es perfecto. Pi\u00E9nsalo como un amigo muy inteligente que a veces se equivoca. \u2764\uFE0F',
    },
    cta: {
      title: '\u00BFListo para conocer a alguien\nque te entienda?',
      subtitle: '\u00DAnete a miles encontrando conexiones reales a trav\u00E9s de la ciencia de la compatibilidad.',
      button: 'Comienza gratis',
      emailPlaceholder: 'Tu correo electr\u00F3nico',
    },
    footer: {
      tagline: 'Donde las estrellas se alinean y los corazones se conectan.',
      links: ['Acerca de', 'Privacidad', 'T\u00E9rminos', 'Soporte'],
      copy: '\u00A9 2026 Agar (\u12A0\u130B\u122D). Todos los derechos reservados.',
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Decorative star field                                              */
/* ------------------------------------------------------------------ */
function StarField() {
  // Static positions for deterministic rendering
  const stars = [
    { x: 5, y: 12, size: 2, delay: 0 },
    { x: 15, y: 8, size: 1.5, delay: 0.5 },
    { x: 25, y: 22, size: 1, delay: 1 },
    { x: 35, y: 5, size: 2, delay: 1.5 },
    { x: 45, y: 18, size: 1.5, delay: 0.3 },
    { x: 55, y: 10, size: 1, delay: 0.8 },
    { x: 65, y: 25, size: 2, delay: 1.2 },
    { x: 75, y: 7, size: 1.5, delay: 0.6 },
    { x: 85, y: 20, size: 1, delay: 1.8 },
    { x: 92, y: 14, size: 2, delay: 0.2 },
    { x: 10, y: 30, size: 1, delay: 1.1 },
    { x: 50, y: 28, size: 1.5, delay: 0.9 },
    { x: 80, y: 32, size: 1, delay: 1.4 },
    { x: 30, y: 35, size: 1.5, delay: 0.4 },
    { x: 70, y: 3, size: 1, delay: 1.7 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gold-300/40"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animation: `star-twinkle ${2 + star.delay}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon components                                                    */
/* ------------------------------------------------------------------ */
function FeatureIcon({ type, className }: { type: string; className?: string }) {
  const base = `w-10 h-10 ${className || ''}`;
  switch (type) {
    case 'astrology':
      return (
        <svg className={base} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="4" fill="currentColor" />
          <path d="M20 2v6M20 32v6M2 20h6M32 20h6" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      );
    case 'brain':
      return (
        <svg className={base} viewBox="0 0 40 40" fill="none">
          <path d="M20 6c-4 0-7 2-8.5 5S9 17 10 20c1 3 0 5-1 7s0 5 3 6 5-1 6-3h4c1 2 3 4 6 3s4-4 3-6-2-4-1-7 1-6-.5-9S24 6 20 6z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 6v28M14 12h12M13 20h14" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );
    case 'people':
      return (
        <svg className={base} viewBox="0 0 40 40" fill="none">
          <circle cx="15" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="27" cy="14" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 34c0-6 4-10 9-10s9 4 9 10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M24 24c4 0 7 3 7 7" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'globe':
      return (
        <svg className={base} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1.5" />
          <ellipse cx="20" cy="20" rx="8" ry="16" stroke="currentColor" strokeWidth="1" />
          <path d="M4 20h32M6 12h28M6 28h28" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case 'lock':
      return (
        <svg className={base} viewBox="0 0 40 40" fill="none">
          <rect x="8" y="18" width="24" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 18v-5a6 6 0 0112 0v5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="20" cy="27" r="2.5" fill="currentColor" />
        </svg>
      );
    case 'chat':
      return (
        <svg className={base} viewBox="0 0 40 40" fill="none">
          <path d="M6 8h20a2 2 0 012 2v12a2 2 0 01-2 2H14l-6 5v-5H6a2 2 0 01-2-2V10a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 16h16a2 2 0 012 2v8a2 2 0 01-2 2h-2v4l-5-4h-9" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Phone mockup component                                             */
/* ------------------------------------------------------------------ */
function PhoneMockup() {
  return (
    <div className="relative animate-phone-float">
      {/* Outer glow */}
      <div className="absolute -inset-4 rounded-[48px] bg-gold-400/10 blur-2xl" />
      {/* Phone frame */}
      <div className="relative w-[260px] h-[520px] rounded-[40px] border-[6px] border-gold-400/30 bg-navy-950 shadow-2xl shadow-gold-400/10 overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-navy-950 rounded-b-2xl z-10" />
        {/* Screen content */}
        <div className="w-full h-full bg-gradient-to-b from-navy-800 to-navy-900 p-4 pt-10">
          {/* Profile card mockup */}
          <div className="rounded-2xl overflow-hidden border border-gold-400/20 bg-navy-800/80">
            <div className="h-40 bg-gradient-to-br from-gold-400/30 via-rose-400/20 to-gold-300/10" />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="font-display font-bold text-gold-100 text-lg">Sara, 26</div>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-xs text-gold-200/50 mb-3">Addis Ababa</div>
              {/* Compatibility badge */}
              <div className="inline-flex items-center gap-1.5 bg-gold-400/10 border border-gold-400/20 rounded-full px-3 py-1.5">
                <svg className="w-3.5 h-3.5 text-gold-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-semibold text-gold-300">87% match</span>
              </div>
            </div>
          </div>
          {/* Mini action bar */}
          <div className="flex justify-center gap-4 mt-4">
            <div className="w-12 h-12 rounded-full bg-navy-700/80 border border-gold-400/10 flex items-center justify-center text-gold-200/40">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 shadow-lg shadow-gold-400/20 flex items-center justify-center text-navy-950 -mt-1">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            </div>
            <div className="w-12 h-12 rounded-full bg-navy-700/80 border border-gold-400/10 flex items-center justify-center text-gold-300/50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Zodiac ring decoration                                             */
/* ------------------------------------------------------------------ */
function ZodiacRing({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="90" stroke="url(#gold-ring)" strokeWidth="0.5" opacity="0.3" />
      <circle cx="100" cy="100" r="70" stroke="url(#gold-ring)" strokeWidth="0.3" opacity="0.2" strokeDasharray="4 6" />
      <circle cx="100" cy="100" r="50" stroke="url(#gold-ring)" strokeWidth="0.3" opacity="0.15" />
      {/* Small dots on the outer ring — precomputed to avoid hydration mismatch */}
      <circle cx="190" cy="100" r="1.5" fill="#d4a54a" opacity="0.4" />
      <circle cx="177.94" cy="145" r="1.5" fill="#d4a54a" opacity="0.4" />
      <circle cx="145" cy="177.94" r="1.5" fill="#d4a54a" opacity="0.4" />
      <circle cx="100" cy="190" r="1.5" fill="#d4a54a" opacity="0.4" />
      <circle cx="55" cy="177.94" r="1.5" fill="#d4a54a" opacity="0.4" />
      <circle cx="22.06" cy="145" r="1.5" fill="#d4a54a" opacity="0.4" />
      <circle cx="10" cy="100" r="1.5" fill="#d4a54a" opacity="0.4" />
      <circle cx="22.06" cy="55" r="1.5" fill="#d4a54a" opacity="0.4" />
      <circle cx="55" cy="22.06" r="1.5" fill="#d4a54a" opacity="0.4" />
      <circle cx="100" cy="10" r="1.5" fill="#d4a54a" opacity="0.4" />
      <circle cx="145" cy="22.06" r="1.5" fill="#d4a54a" opacity="0.4" />
      <circle cx="177.94" cy="55" r="1.5" fill="#d4a54a" opacity="0.4" />
      <defs>
        <linearGradient id="gold-ring" x1="0" y1="0" x2="200" y2="200">
          <stop offset="0%" stopColor="#e8c46a" />
          <stop offset="50%" stopColor="#d4a54a" />
          <stop offset="100%" stopColor="#c49535" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [email, setEmail] = useState('');
  const t = content[lang];

  return (
    <div className="min-h-screen bg-navy-950 text-gold-100">
      {/* ========== NAV ========== */}
      <nav className="fixed top-0 z-50 w-full border-b border-gold-400/10 bg-navy-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Agar" width={44} height={44} className="logo-blend" />
            <span className="font-display text-xl font-bold tracking-tight text-gold-100">
              Agar <span className="text-gold-400/60 font-normal text-sm ml-0.5">{'\u12A0\u130B\u122D'}</span>
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Language switcher */}
            <div className="hidden sm:flex items-center rounded-full bg-navy-800/80 border border-gold-400/10 p-0.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as Lang)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                    lang === l.code
                      ? 'bg-gold-400/15 text-gold-300 shadow-sm'
                      : 'text-gold-200/40 hover:text-gold-200/70'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <Link href="/auth/login" className="text-sm font-medium text-gold-200/60 hover:text-gold-200 transition-colors">
              {t.nav.signin}
            </Link>
            <Link href="/auth/signup" className="rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-5 py-2 text-sm font-semibold text-navy-950 transition-all hover:from-gold-300 hover:to-gold-400 active:scale-[0.98] shadow-lg shadow-gold-400/15">
              {t.nav.register}
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <StarField />
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gold-400/5 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-40 h-[500px] w-[500px] rounded-full bg-gold-500/3 blur-[100px]" />
        {/* Zodiac ring decoration */}
        <ZodiacRing className="pointer-events-none absolute top-10 right-0 w-[500px] h-[500px] opacity-30 hidden lg:block" />

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:gap-20">
            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div
                className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-gold-400/20 bg-gold-400/5 px-4 py-1.5"
              >
                <span className="h-2 w-2 rounded-full bg-gold-400 animate-pulse-soft" />
                <span className="text-sm font-medium text-gold-300">{t.hero.badge}</span>
              </div>

              {/* Headline */}
              <h1
                className="animate-fade-up font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-gold-50 sm:text-5xl md:text-6xl"
                style={{ animationDelay: '0.08s', animationFillMode: 'backwards' }}
              >
                {t.hero.title}
                <br />
                <span className="text-gold-gradient">
                  {t.hero.titleAccent}
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className="animate-fade-up mt-6 max-w-lg text-lg leading-relaxed text-gold-200/50 mx-auto lg:mx-0"
                style={{ animationDelay: '0.16s', animationFillMode: 'backwards' }}
              >
                {t.hero.subtitle}
              </p>

              {/* CTAs */}
              <div
                className="animate-fade-up mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
                style={{ animationDelay: '0.24s', animationFillMode: 'backwards' }}
              >
                <Link href="/auth/signup" className="w-full sm:w-auto text-center rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-8 py-3.5 text-base font-semibold text-navy-950 shadow-lg shadow-gold-400/20 transition-all hover:from-gold-300 hover:to-gold-400 hover:shadow-xl hover:shadow-gold-400/25 active:scale-[0.98]">
                  {t.hero.cta}
                </Link>
                <a href="#how" className="w-full sm:w-auto text-center rounded-full border border-gold-400/20 bg-gold-400/5 px-8 py-3.5 text-base font-medium text-gold-200 transition-all hover:bg-gold-400/10 hover:border-gold-400/30 active:scale-[0.98]">
                  {t.hero.ctaSecondary}
                </a>
              </div>

              {/* Store badges */}
              <div
                className="animate-fade-up mt-6 flex items-center gap-3 justify-center lg:justify-start"
                style={{ animationDelay: '0.32s', animationFillMode: 'backwards' }}
              >
                <div className="flex items-center gap-2 rounded-lg border border-gold-400/15 bg-navy-800/50 px-3 py-2 text-xs">
                  <svg className="h-5 w-5 text-gold-200/70" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                  <div><div className="text-[10px] text-gold-200/30 leading-none">Download on</div><div className="font-semibold text-gold-100 leading-tight">{t.hero.appStore}</div></div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gold-400/15 bg-navy-800/50 px-3 py-2 text-xs">
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#34A853" d="M3.609 1.814L13.792 12 3.61 22.186a1.127 1.127 0 01-.61-.95V2.764c0-.404.236-.768.609-.95z" /><path fill="#FBBC04" d="M17.556 8.237l-3.764 3.764 3.764 3.764 4.251-2.393c.49-.277.49-.948 0-1.225l-4.251-2.91z" /><path fill="#4285F4" d="M3.609 1.814L13.792 12l3.764-3.763L5.996.94C5.194.48 4.17.83 3.609 1.814z" /><path fill="#EA4335" d="M13.792 12L3.609 22.186C4.17 23.17 5.193 23.52 5.996 23.06l11.56-7.297L13.792 12z" /></svg>
                  <div><div className="text-[10px] text-gold-200/30 leading-none">Get it on</div><div className="font-semibold text-gold-100 leading-tight">{t.hero.googlePlay}</div></div>
                </div>
              </div>
            </div>

            {/* Right: Phone mockup */}
            <div
              className="animate-fade-up flex-shrink-0"
              style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
            >
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ========== SOCIAL PROOF BAR ========== */}
      <section className="border-y border-gold-400/10 bg-navy-900/50">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-6 py-8 sm:gap-16 md:justify-between">
          {[
            { value: t.social.users, label: t.social.usersLabel },
            { value: t.social.matches, label: t.social.matchesLabel },
            { value: t.social.rating, label: t.social.ratingLabel, hasStar: true },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-accent text-3xl font-bold text-gold-300 flex items-center justify-center gap-1">
                {stat.value}
                {stat.hasStar && (
                  <svg className="w-5 h-5 text-gold-400 -mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </div>
              <div className="mt-1 text-sm text-gold-200/30">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how" className="py-24 md:py-32 relative">
        <ZodiacRing className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 w-[300px] h-[300px] opacity-15 hidden lg:block" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-gold-400">{t.how.label}</span>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-gold-50 sm:text-4xl">
              {t.how.title}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Path 1 — Find Your Match */}
            <div className="rounded-3xl border border-gold-400/15 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10">
              <h3 className="font-display mb-8 text-2xl font-bold text-gold-50 text-center">{t.how.paths.match.heading}</h3>
              <div className="space-y-7">
                {t.how.paths.match.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-400/20 bg-gold-400/10 font-accent text-sm font-bold text-gold-400">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold text-gold-50">{step.title}</h4>
                      <p className="mt-1 text-gold-200/40 leading-relaxed text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Path 2 — Refer Someone */}
            <div className="rounded-3xl border border-rose-400/15 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10">
              <h3 className="font-display mb-8 text-2xl font-bold text-gold-50 text-center">{t.how.paths.refer.heading}</h3>
              <div className="space-y-7">
                {t.how.paths.refer.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/10 font-accent text-sm font-bold text-rose-400">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-bold text-gold-50">{step.title}</h4>
                      <p className="mt-1 text-gold-200/40 leading-relaxed text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/30 via-navy-800/20 to-navy-900/30" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-gold-400">{t.features.label}</span>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-gold-50 sm:text-4xl">
              {t.features.title}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.items.map((feature, i) => {
              const iconColors = [
                'text-gold-400 bg-gold-400/10',
                'text-rose-400 bg-rose-400/10',
                'text-gold-300 bg-gold-300/10',
                'text-emerald-400 bg-emerald-400/10',
                'text-gold-200/60 bg-gold-200/5',
                'text-sky-400 bg-sky-400/10',
              ];
              return (
                <div
                  key={i}
                  className="group glass-card rounded-2xl p-7 transition-all duration-300 hover:border-gold-400/25 hover:bg-navy-800/40 hover:-translate-y-0.5"
                >
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${iconColors[i]}`}>
                    <FeatureIcon type={feature.icon} className="!w-6 !h-6" />
                  </div>
                  <h3 className="font-display mb-2 text-lg font-bold text-gold-50">{feature.title}</h3>
                  <p className="text-gold-200/40 leading-relaxed text-[15px]">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== HONESTY NOTE ========== */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-3xl border border-gold-400/15 bg-gold-400/5 p-8 md:p-12 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/10">
              <svg className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-gold-50 mb-3">{t.honesty.title}</h3>
            <p className="text-gold-200/50 leading-relaxed mb-4">{t.honesty.text}</p>
            <p className="text-gold-200/35 leading-relaxed italic text-sm">{t.honesty.disclaimer}</p>
          </div>
        </div>
      </section>

      {/* ========== BOTTOM CTA ========== */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-800/50 to-navy-950" />
        {/* Decorative glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-400/5 blur-[100px]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-gold-50 sm:text-4xl md:text-5xl whitespace-pre-line leading-tight">
            {t.cta.title}
          </h2>
          <p className="mt-5 text-lg text-gold-200/40 leading-relaxed">{t.cta.subtitle}</p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.cta.emailPlaceholder}
              className="w-full sm:flex-1 rounded-full border border-gold-400/15 bg-navy-800/60 px-6 py-3.5 text-gold-100 placeholder-gold-200/25 outline-none focus:border-gold-400/40 focus:ring-2 focus:ring-gold-400/10 transition-all"
            />
            <Link href={`/auth/signup${email ? `?email=${encodeURIComponent(email)}` : ''}`} className="w-full sm:w-auto whitespace-nowrap text-center rounded-full bg-gradient-to-r from-gold-400 to-gold-500 px-8 py-3.5 font-semibold text-navy-950 transition-all hover:from-gold-300 hover:to-gold-400 active:scale-[0.98] shadow-lg shadow-gold-400/15">
              {t.cta.button}
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-gold-400/10 bg-navy-950 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Agar" width={36} height={36} className="logo-blend" />
                <span className="font-display text-lg font-bold text-gold-100">
                  Agar <span className="text-gold-400/50 font-normal text-sm">{'\u12A0\u130B\u122D'}</span>
                </span>
              </div>
              <p className="text-sm text-gold-200/30">{t.footer.tagline}</p>
            </div>

            <div className="flex items-center gap-6">
              {t.footer.links.map((link, i) => {
                const hrefs = ['#how', '#', '#', 'mailto:support@agar.app'];
                return (
                  <a key={i} href={hrefs[i]} className="text-sm text-gold-200/30 hover:text-gold-300 transition-colors">
                    {link}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gold-400/5 text-center">
            <p className="text-xs text-gold-200/20">{t.footer.copy}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
