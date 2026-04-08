'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gold-400 mb-4">404</h1>
        <p className="text-xl text-gold-200/70 mb-8">Page not found</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-gold-500 text-navy-950 font-semibold rounded-full hover:bg-gold-400 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
