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
      viewBox="0 0 300 400"
      className="absolute inset-0 w-full h-full pointer-events-none"
      fill="none"
      style={{ maxWidth: '85%', maxHeight: '75%', margin: 'auto', top: '5%', left: 0, right: 0 }}
    >
      {/* Outer palm silhouette - dashed gold outline */}
      <path
        d="M80 370 C65 300, 40 230, 45 170 C48 135, 55 115, 65 90 C72 70, 78 45, 78 28
           C78 15, 86 10, 92 16 C98 28, 96 50, 94 65
           L108 35 C108 20, 118 13, 125 20 C132 32, 126 58, 122 72
           L140 28 C140 12, 150 7, 158 15 C165 30, 157 62, 150 78
           L165 42 C165 28, 174 23, 181 32 C188 45, 182 72, 176 90
           C200 85, 215 100, 222 125 C230 155, 228 195, 218 230
           C208 270, 185 320, 165 370 Z"
        stroke="rgba(212, 165, 74, 0.6)"
        strokeWidth="2"
        strokeDasharray="8 5"
        fill="rgba(212, 165, 74, 0.03)"
      />

      {/* Heart line guide */}
      <path
        d="M72 148 C95 135, 125 128, 150 132 C175 136, 200 142, 215 138"
        stroke="rgba(212, 165, 74, 0.35)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <text x="222" y="142" fill="rgba(212, 165, 74, 0.4)" fontSize="9" fontFamily="system-ui">Heart</text>

      {/* Head line guide */}
      <path
        d="M70 178 C100 173, 130 170, 160 176 C180 181, 200 185, 215 180"
        stroke="rgba(212, 165, 74, 0.35)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <text x="222" y="184" fill="rgba(212, 165, 74, 0.4)" fontSize="9" fontFamily="system-ui">Head</text>

      {/* Life line guide */}
      <path
        d="M95 120 C82 150, 70 190, 68 230 C66 270, 70 310, 80 345"
        stroke="rgba(212, 165, 74, 0.35)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <text x="38" y="250" fill="rgba(212, 165, 74, 0.4)" fontSize="9" fontFamily="system-ui">Life</text>

      {/* Fate line guide */}
      <path
        d="M148 340 C146 300, 148 260, 150 230 C152 200, 151 175, 153 148"
        stroke="rgba(212, 165, 74, 0.25)"
        strokeWidth="1.2"
        strokeDasharray="3 4"
      />
      <text x="157" y="250" fill="rgba(212, 165, 74, 0.3)" fontSize="9" fontFamily="system-ui">Fate</text>
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
