'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  PalmReading,
  HeartLineType,
  HeadLineType,
  LifeLineType,
  FateLineType,
} from '@/lib/palmistry';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PalmScannerProps {
  onCapture: (reading: PalmReading, imageBlob: Blob) => void;
  onClose: () => void;
}

type ScanPhase = 'camera' | 'analyzing' | 'done';

/* ------------------------------------------------------------------ */
/*  Palm Line Detection — Client-side image processing                 */
/* ------------------------------------------------------------------ */

/** Safely read a pixel value from a typed array */
function px(arr: Uint8ClampedArray, idx: number): number {
  return arr[idx] ?? 0;
}

/** Apply 3x3 Sobel edge detection on grayscale pixel data */
function sobelEdgeDetect(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
): { magnitude: Float32Array; directionX: Float32Array; directionY: Float32Array } {
  const size = width * height;
  const magnitude = new Float32Array(size);
  const directionX = new Float32Array(size);
  const directionY = new Float32Array(size);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      // Sobel kernels
      const gx =
        -px(gray, (y - 1) * width + (x - 1)) +
        px(gray, (y - 1) * width + (x + 1)) +
        -2 * px(gray, y * width + (x - 1)) +
        2 * px(gray, y * width + (x + 1)) +
        -px(gray, (y + 1) * width + (x - 1)) +
        px(gray, (y + 1) * width + (x + 1));

      const gy =
        -px(gray, (y - 1) * width + (x - 1)) +
        -2 * px(gray, (y - 1) * width + x) +
        -px(gray, (y - 1) * width + (x + 1)) +
        px(gray, (y + 1) * width + (x - 1)) +
        2 * px(gray, (y + 1) * width + x) +
        px(gray, (y + 1) * width + (x + 1));

      magnitude[idx] = Math.sqrt(gx * gx + gy * gy);
      directionX[idx] = gx;
      directionY[idx] = gy;
    }
  }

  return { magnitude, directionX, directionY };
}

/** Analyze a rectangular region of the edge map */
function analyzeRegion(
  magnitude: Float32Array,
  directionX: Float32Array,
  directionY: Float32Array,
  width: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): { intensity: number; curvature: number; length: number; density: number } {
  let sumMag = 0;
  let count = 0;
  let strongEdges = 0;
  const threshold = 40;
  let minActiveX = x1;
  let maxActiveX = x0;
  let minActiveY = y1;
  let maxActiveY = y0;
  const directions: number[] = [];

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = y * width + x;
      const mag = magnitude[idx] ?? 0;
      sumMag += mag;
      count++;

      if (mag > threshold) {
        strongEdges++;
        if (x < minActiveX) minActiveX = x;
        if (x > maxActiveX) maxActiveX = x;
        if (y < minActiveY) minActiveY = y;
        if (y > maxActiveY) maxActiveY = y;
        // Compute angle
        const angle = Math.atan2(directionY[idx] ?? 0, directionX[idx] ?? 0);
        directions.push(angle);
      }
    }
  }

  const intensity = count > 0 ? sumMag / count : 0;
  const density = count > 0 ? strongEdges / count : 0;

  // Curvature: variance of edge directions
  let curvature = 0;
  if (directions.length > 2) {
    const meanDir = directions.reduce((a, b) => a + b, 0) / directions.length;
    const variance =
      directions.reduce((a, d) => a + (d - meanDir) ** 2, 0) / directions.length;
    curvature = variance;
  }

  // Length: span of strong edges
  const spanX = maxActiveX > minActiveX ? maxActiveX - minActiveX : 0;
  const spanY = maxActiveY > minActiveY ? maxActiveY - minActiveY : 0;
  const length = Math.sqrt(spanX * spanX + spanY * spanY);

  return { intensity, curvature, length, density };
}

/** Map region measurements to palm line types */
function classifyHeartLine(region: {
  intensity: number;
  curvature: number;
  length: number;
  density: number;
}): HeartLineType {
  const { intensity, curvature, length, density } = region;
  // Normalized thresholds based on typical palm scan values
  if (density > 0.15 && curvature > 0.8) {
    return length > 60 ? 'long_curved' : 'curved_to_middle';
  }
  if (density > 0.12 && curvature > 0.5) {
    return 'curved_to_index';
  }
  if (density > 0.1 && curvature < 0.3) {
    return length > 50 ? 'long_straight' : 'short_straight';
  }
  if (intensity < 8) {
    return 'short';
  }
  // Default fallback based on curvature
  return curvature > 0.4 ? 'long_curved' : 'long_straight';
}

function classifyHeadLine(region: {
  intensity: number;
  curvature: number;
  length: number;
  density: number;
}): HeadLineType {
  const { intensity, curvature, length, density } = region;
  if (density > 0.18 && intensity > 15) {
    return 'deep';
  }
  if (curvature > 0.9) {
    return 'wavy';
  }
  if (curvature > 0.5) {
    return 'curved';
  }
  if (density < 0.05) {
    return 'broken';
  }
  if (length > 55) {
    return 'long_straight';
  }
  return 'short';
}

function classifyLifeLine(region: {
  intensity: number;
  curvature: number;
  length: number;
  density: number;
}): LifeLineType {
  const { intensity, curvature, length, density } = region;
  if (density > 0.15 && length > 70) {
    return 'long_deep';
  }
  if (curvature > 0.8 && length > 50) {
    return 'wide_arc';
  }
  if (curvature > 0.5) {
    return 'curved';
  }
  if (density < 0.06) {
    return 'broken';
  }
  if (length < 35) {
    return 'short_shallow';
  }
  return 'close_to_thumb';
}

function classifyFateLine(region: {
  intensity: number;
  curvature: number;
  length: number;
  density: number;
}): FateLineType | null {
  const { intensity, density, length } = region;
  // Fate line may not exist
  if (density < 0.03 || intensity < 4) {
    return null;
  }
  if (density > 0.14 && length > 60) {
    return 'deep_clear';
  }
  if (density < 0.06) {
    return 'faint';
  }
  if (density > 0.08 && length < 40) {
    return 'broken';
  }
  if (length > 50) {
    return 'starts_from_life';
  }
  return 'joins_life_middle';
}

/** Full palm analysis pipeline */
function analyzePalmLines(imageData: ImageData): PalmReading {
  const { data, width, height } = imageData;

  // 1. Convert to grayscale
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4] ?? 0;
    const g = data[i * 4 + 1] ?? 0;
    const b = data[i * 4 + 2] ?? 0;
    gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // 2. Apply Sobel edge detection
  const edges = sobelEdgeDetect(gray, width, height);

  // 3. Define palm regions (assuming palm fills the center ~60% of frame)
  const palmLeft = Math.round(width * 0.2);
  const palmRight = Math.round(width * 0.8);
  const palmTop = Math.round(height * 0.15);
  const palmBottom = Math.round(height * 0.85);
  const palmW = palmRight - palmLeft;
  const palmH = palmBottom - palmTop;

  // Heart line: upper third of palm
  const heartRegion = analyzeRegion(
    edges.magnitude,
    edges.directionX,
    edges.directionY,
    width,
    palmLeft,
    palmTop,
    palmRight,
    palmTop + Math.round(palmH * 0.3),
  );

  // Head line: middle third of palm
  const headRegion = analyzeRegion(
    edges.magnitude,
    edges.directionX,
    edges.directionY,
    width,
    palmLeft,
    palmTop + Math.round(palmH * 0.28),
    palmRight,
    palmTop + Math.round(palmH * 0.52),
  );

  // Life line: left side curve (thumb area)
  const lifeRegion = analyzeRegion(
    edges.magnitude,
    edges.directionX,
    edges.directionY,
    width,
    palmLeft,
    palmTop + Math.round(palmH * 0.1),
    palmLeft + Math.round(palmW * 0.45),
    palmBottom,
  );

  // Fate line: center vertical strip
  const fateRegion = analyzeRegion(
    edges.magnitude,
    edges.directionX,
    edges.directionY,
    width,
    palmLeft + Math.round(palmW * 0.35),
    palmTop + Math.round(palmH * 0.3),
    palmLeft + Math.round(palmW * 0.65),
    palmBottom,
  );

  // 4. Classify
  return {
    heartLine: classifyHeartLine(heartRegion),
    headLine: classifyHeadLine(headRegion),
    lifeLine: classifyLifeLine(lifeRegion),
    fateLine: classifyFateLine(fateRegion),
  };
}

/* ------------------------------------------------------------------ */
/*  Hand Outline SVG Overlay                                           */
/* ------------------------------------------------------------------ */

function HandOutlineOverlay() {
  return (
    <svg
      viewBox="0 0 400 520"
      className="absolute inset-0 w-full h-full pointer-events-none"
      fill="none"
      style={{ maxWidth: '88%', maxHeight: '78%', margin: 'auto', top: '3%', left: 0, right: 0 }}
    >
      {/* Realistic open palm (palm-up, fingers spread) */}
      {/* Pinky finger */}
      <path
        d="M92 210 C88 185, 84 155, 82 130 C80 112, 78 90, 80 72
           C81 58, 88 50, 96 50 C104 50, 110 58, 111 72
           C113 90, 111 112, 110 130 C109 150, 108 175, 108 200"
        stroke="rgba(212, 165, 74, 0.55)"
        strokeWidth="2"
        strokeDasharray="8 5"
        strokeLinecap="round"
      />
      {/* Ring finger */}
      <path
        d="M128 195 C126 165, 124 130, 122 100 C120 75, 118 48, 120 28
           C121 14, 130 6, 140 6 C150 6, 158 14, 159 28
           C161 48, 159 75, 157 100 C155 130, 154 165, 153 195"
        stroke="rgba(212, 165, 74, 0.55)"
        strokeWidth="2"
        strokeDasharray="8 5"
        strokeLinecap="round"
      />
      {/* Middle finger (tallest) */}
      <path
        d="M172 190 C170 155, 168 115, 167 80 C166 55, 165 30, 168 10
           C169 -2, 180 -8, 192 -8 C204 -8, 214 -2, 215 10
           C218 30, 216 55, 215 80 C214 115, 212 155, 210 190"
        stroke="rgba(212, 165, 74, 0.55)"
        strokeWidth="2"
        strokeDasharray="8 5"
        strokeLinecap="round"
      />
      {/* Index finger */}
      <path
        d="M228 195 C227 168, 226 135, 227 105 C228 80, 230 52, 234 32
           C236 18, 246 10, 256 10 C266 10, 275 18, 277 32
           C280 52, 280 80, 279 105 C278 135, 276 168, 272 200"
        stroke="rgba(212, 165, 74, 0.55)"
        strokeWidth="2"
        strokeDasharray="8 5"
        strokeLinecap="round"
      />
      {/* Thumb (angled outward) */}
      <path
        d="M300 270 C310 250, 320 225, 330 200 C338 180, 346 158, 350 142
           C353 130, 348 120, 338 118 C328 116, 320 124, 316 136
           C310 155, 302 178, 290 205"
        stroke="rgba(212, 165, 74, 0.55)"
        strokeWidth="2"
        strokeDasharray="8 5"
        strokeLinecap="round"
      />
      {/* Palm body — connects fingers to wrist */}
      <path
        d="M92 210 C85 240, 78 275, 76 305 C74 340, 80 380, 90 420
           C100 450, 120 475, 145 490 L250 490
           C275 475, 295 450, 305 420 C315 385, 318 345, 310 305
           C305 280, 298 260, 290 240 C285 225, 280 212, 272 200
           L228 195 L210 190 L172 190 L153 195 L128 195 L108 200 Z"
        stroke="rgba(212, 165, 74, 0.55)"
        strokeWidth="2"
        strokeDasharray="8 5"
        fill="rgba(212, 165, 74, 0.03)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wrist */}
      <path
        d="M125 490 L270 490"
        stroke="rgba(212, 165, 74, 0.35)"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />

      {/* === Palm line guides === */}

      {/* Heart line — curves across upper palm below fingers */}
      <path
        d="M88 245 C120 228, 160 220, 195 224 C230 228, 260 238, 280 232"
        stroke="rgba(255, 120, 120, 0.5)"
        strokeWidth="2"
        strokeDasharray="5 3"
        strokeLinecap="round"
      />
      <text x="286" y="236" fill="rgba(255, 120, 120, 0.55)" fontSize="11" fontFamily="system-ui" fontWeight="600">Heart</text>

      {/* Head line — across middle of palm */}
      <path
        d="M86 285 C120 275, 155 272, 190 278 C220 284, 250 292, 275 285"
        stroke="rgba(100, 180, 255, 0.5)"
        strokeWidth="2"
        strokeDasharray="5 3"
        strokeLinecap="round"
      />
      <text x="281" y="290" fill="rgba(100, 180, 255, 0.55)" fontSize="11" fontFamily="system-ui" fontWeight="600">Head</text>

      {/* Life line — curves around thumb base */}
      <path
        d="M240 210 C225 240, 200 275, 175 320 C155 360, 140 400, 130 445"
        stroke="rgba(100, 220, 140, 0.5)"
        strokeWidth="2"
        strokeDasharray="5 3"
        strokeLinecap="round"
      />
      <text x="132" y="460" fill="rgba(100, 220, 140, 0.55)" fontSize="11" fontFamily="system-ui" fontWeight="600">Life</text>

      {/* Fate line — vertical up center of palm */}
      <path
        d="M195 470 C193 430, 192 385, 192 345 C192 310, 193 278, 194 245"
        stroke="rgba(200, 170, 255, 0.4)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      <text x="200" y="390" fill="rgba(200, 170, 255, 0.45)" fontSize="10" fontFamily="system-ui" fontWeight="500">Fate</text>

      {/* Finger labels (small) */}
      <text x="86" y="46" fill="rgba(212, 165, 74, 0.3)" fontSize="8" fontFamily="system-ui" textAnchor="middle">Pinky</text>
      <text x="140" y="0" fill="rgba(212, 165, 74, 0.3)" fontSize="8" fontFamily="system-ui" textAnchor="middle">Ring</text>
      <text x="192" y="-14" fill="rgba(212, 165, 74, 0.3)" fontSize="8" fontFamily="system-ui" textAnchor="middle">Middle</text>
      <text x="256" y="4" fill="rgba(212, 165, 74, 0.3)" fontSize="8" fontFamily="system-ui" textAnchor="middle">Index</text>
      <text x="346" y="114" fill="rgba(212, 165, 74, 0.3)" fontSize="8" fontFamily="system-ui" textAnchor="middle">Thumb</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function PalmScanner({ onCapture, onClose }: PalmScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<ScanPhase>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);

  /* ---- Start camera ---- */
  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: unknown) {
        if (!mounted) return;
        const message =
          err instanceof Error ? err.message : 'Camera access denied';
        setCameraError(message);
      }
    }

    startCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ---- Capture snapshot ---- */
  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Stop camera
    streamRef.current?.getTracks().forEach((t) => t.stop());

    // Start analysis
    setPhase('analyzing');

    // Simulate incremental progress for the UX
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress > 90) progress = 90;
      setAnalyzeProgress(Math.round(progress));
    }, 200);

    // Run analysis (small delay to let UI update)
    setTimeout(() => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const reading = analyzePalmLines(imageData);

      clearInterval(progressInterval);
      setAnalyzeProgress(100);

      // Convert canvas to blob and deliver results
      canvas.toBlob(
        (blob) => {
          setPhase('done');
          if (blob) {
            onCapture(reading, blob);
          }
        },
        'image/jpeg',
        0.85,
      );
    }, 800);
  }, [onCapture]);

  /* ---- Camera error fallback ---- */
  if (cameraError) {
    return (
      <div className="fixed inset-0 z-[100] bg-navy-950 flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-gold-50 mb-2 text-center">
          Camera Access Required
        </h2>
        <p className="text-sm text-gold-200/50 text-center max-w-xs mb-2">
          Please allow camera access to scan your palm. Make sure you are using HTTPS.
        </p>
        <p className="text-xs text-rose-400/70 text-center max-w-xs mb-6">
          {cameraError}
        </p>
        <button
          onClick={onClose}
          className="rounded-xl border border-gold-400/25 bg-gold-400/10 px-6 py-2.5 text-sm font-medium text-gold-200 hover:bg-gold-400/15 transition-all"
        >
          Use Manual Selection Instead
        </button>
      </div>
    );
  }

  /* ---- Analyzing phase ---- */
  if (phase === 'analyzing' || phase === 'done') {
    return (
      <div className="fixed inset-0 z-[100] bg-navy-950 flex flex-col items-center justify-center p-6">
        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="relative w-24 h-24 mb-8">
          {/* Spinning ring */}
          <svg className="w-24 h-24 animate-spin-slow" viewBox="0 0 96 96" fill="none">
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="rgba(212, 165, 74, 0.1)"
              strokeWidth="3"
            />
            <path
              d="M48 4 A44 44 0 0 1 92 48"
              stroke="rgba(212, 165, 74, 0.8)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-gold-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
            </svg>
          </div>
        </div>

        <h2 className="font-display text-xl font-bold text-gold-50 mb-2">
          {phase === 'done' ? 'Analysis Complete' : 'Reading Your Palm...'}
        </h2>
        <p className="text-sm text-gold-200/50 text-center max-w-xs mb-6">
          {phase === 'done'
            ? 'Your palm lines have been detected.'
            : 'Detecting heart, head, life, and fate lines...'}
        </p>

        {/* Progress bar */}
        <div className="w-64 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-300"
            style={{ width: `${analyzeProgress}%` }}
          />
        </div>
        <p className="text-xs text-gold-200/30 mt-2 tabular-nums">{analyzeProgress}%</p>

        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 2s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  /* ---- Camera phase ---- */
  return (
    <div className="fixed inset-0 z-[100] bg-navy-950 flex flex-col">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-navy-950/90 to-transparent">
        <button
          onClick={() => {
            streamRef.current?.getTracks().forEach((t) => t.stop());
            onClose();
          }}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center"
          aria-label="Close scanner"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-sm font-medium text-gold-200/80">Palm Scanner</span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Video feed with overlay */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Darkened border outside palm area */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Semi-transparent overlay with cutout effect */}
          <div className="absolute inset-0 bg-navy-950/40" />
        </div>

        {/* Hand outline overlay */}
        <HandOutlineOverlay />

        {/* Instruction text */}
        <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-navy-950/70 backdrop-blur-md rounded-full px-5 py-2.5 border border-gold-400/15">
            <p className="text-sm font-medium text-gold-200/90 text-center">
              Place your palm inside the outline
            </p>
          </div>
        </div>
      </div>

      {/* Capture button */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-10 pt-6 bg-gradient-to-t from-navy-950/90 to-transparent">
        <button
          onClick={handleCapture}
          className="group relative w-20 h-20 rounded-full"
          aria-label="Capture palm image"
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-gold-400/60 group-hover:border-gold-400 transition-colors" />
          {/* Inner button */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 group-hover:from-gold-300 group-hover:to-gold-400 transition-all group-active:scale-90 shadow-lg shadow-gold-500/20" />
        </button>
      </div>
    </div>
  );
}
