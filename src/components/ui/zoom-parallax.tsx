'use client';

import { useScroll, useTransform, motion, useMotionValueEvent } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Image {
  src: string;
  alt?: string;
}

interface ZoomParallaxProps {
  images: Image[];
}

// ============================================================================
// HELPERS
// ============================================================================

const TARGET_DATE = new Date('2026-02-20T00:00:00').getTime();

const getImagePositionClass = (index: number) => {
  switch (index) {
    case 1: return '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]';
    case 2: return '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]';
    case 3: return '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]';
    case 4: return '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]';
    case 5: return '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]';
    case 6: return '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]';
    default: return '';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ZoomParallax({ images }: ZoomParallaxProps) {
  if (!images || images.length === 0) return null;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // --------------------------------------------------------------------------
  // MOBILE DETECTION
  // --------------------------------------------------------------------------
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --------------------------------------------------------------------------
  // SCROLL LOGIC
  // --------------------------------------------------------------------------
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [positionState, setPositionState] = useState<'absolute-top' | 'fixed' | 'absolute-bottom'>('absolute-top');

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (isMobile) return;
    if (latest > 0 && latest < 1) {
      setPositionState(prev => prev !== 'fixed' ? 'fixed' : prev);
    } else if (latest >= 1) {
      setPositionState(prev => prev !== 'absolute-bottom' ? 'absolute-bottom' : prev);
    } else {
      setPositionState(prev => prev !== 'absolute-top' ? 'absolute-top' : prev);
    }
  });

  // Animation Values
  const rawAnimationProgress = useTransform(scrollYProgress, [0, 0.9], [0, 1]);
  const smoothProgress = useTransform(rawAnimationProgress, v => v * (2 - v));

  // Scales
  const scale4 = useTransform(smoothProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(smoothProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(smoothProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(smoothProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(smoothProgress, [0, 1], [1, 9]);

  const getScaleForIndex = (index: number) => {
    const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];
    return scales[index % scales.length];
  };

  const imagesOpacity = useTransform(smoothProgress, [0, 1], [1, 0]);
  const timerOpacity = useTransform(smoothProgress, [0.3, 0.8], [0, 1]);
  const stayTunedOpacity = useTransform(smoothProgress, [0.4, 0.73], [0, 1]);
  const bgOpacity = useTransform(smoothProgress, [0, 1], [0, 0.98]);

  // --------------------------------------------------------------------------
  // COUNTDOWN
  // --------------------------------------------------------------------------
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: false });

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = TARGET_DATE - now;
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        finished: false
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const containerStyle: React.CSSProperties = {
    position: positionState === 'fixed' ? 'fixed' : 'absolute',
    top: positionState === 'absolute-bottom' ? 'auto' : 0,
    bottom: positionState === 'absolute-bottom' ? 0 : 'auto',
    left: 0,
    width: '100%',
    height: '100vh',
    zIndex: 10
  };

  // --------------------------------------------------------------------------
  // MOBILE RENDER (Fully Upgraded)
  // --------------------------------------------------------------------------

  if (isMobile) {
    return (
      <div ref={containerRef} className="w-full min-h-[50vh] bg-black py-16 px-4 flex flex-col items-center justify-center relative overflow-hidden">

        {/* 1. Base Dark Background */}
        <div className="absolute inset-0 bg-neutral-950" />

        {/* 2. The SVG Grid Pattern - High Visibility */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-[0.25]" />

        {/* 3. Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-90" />

        {/* 4. Ambient Red Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[150px] bg-red-900/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="text-center relative z-10 w-full max-w-sm">
          {/* Date Pill */}
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md mb-8 shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <p className="text-white/80 text-[10px] font-semibold tracking-[0.2em] uppercase">Feb 20, 2026</p>
          </div>

          {!countdown.finished ? (
            <div className="relative group">
              {/* Border Gradient */}
              <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-[2rem] opacity-50 blur-[1px]" />

              <div className="relative text-center p-8 rounded-[2rem] bg-[#050505]/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">

                {/* Top Shine */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* --- STATIC DESIGN ELEMENTS (Now on Mobile too) --- */}
                <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-white/20 rounded-tl-md" />
                <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/20 rounded-tr-md" />
                <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-white/20 rounded-bl-md" />
                <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-white/20 rounded-br-md" />

                {/* Header */}
                <div className="mb-8 relative z-10">
                  <h3 className="text-xs font-bold tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-white/80 via-white to-white/80 uppercase">
                    TechSolstice '26
                  </h3>

                  {/* Fancy Separator (Now on Mobile) */}
                  <div className="flex items-center justify-center gap-2 mt-3 opacity-50">
                    <div className="h-px w-6 bg-gradient-to-r from-transparent to-red-500" />
                    <div className="h-1 w-1 bg-red-500 rounded-full" />
                    <div className="h-px w-6 bg-gradient-to-l from-transparent to-red-500" />
                  </div>
                </div>

                {/* Timer */}
                <div className="flex items-start justify-between gap-2 text-white relative z-10">
                  <ResponsiveCounterUnit value={countdown.days} label="Days" />
                  <Separator mobile />
                  <ResponsiveCounterUnit value={countdown.hours} label="Hrs" />
                  <Separator mobile />
                  <ResponsiveCounterUnit value={countdown.minutes} label="Min" />
                  <Separator mobile />
                  <ResponsiveCounterUnit value={countdown.seconds} label="Sec" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-2xl font-light text-white tracking-wide">Event Started</div>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // DESKTOP RENDER
  // --------------------------------------------------------------------------

  return (
    <div ref={containerRef} className="relative w-full h-[500vh]">
      <motion.div className="absolute inset-0 bg-black" />

      <div style={containerStyle} className="flex items-center justify-center overflow-hidden">

        {/* Background Overlay */}
        <motion.div
          className="absolute inset-0 z-0 bg-black"
          style={{ opacity: bgOpacity }}
        >
          {/* The SVG Grid - High Visibility */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.2]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_95%)]" />
        </motion.div>

        {/* Cinematic Ambient Glow */}
        <motion.div
          style={{ opacity: timerOpacity }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none z-0"
        />

        {/* Images */}
        {images.map(({ src, alt }, index) => {
          const scale = getScaleForIndex(index);
          const positionClass = getImagePositionClass(index);
          return (
            <motion.div
              key={index}
              style={{ scale, opacity: imagesOpacity }}
              className={`absolute top-0 flex h-full w-full items-center justify-center z-10 ${positionClass} will-change-transform`}
            >
              <div className="relative h-[25vh] w-[25vw] overflow-hidden rounded-sm shadow-2xl border border-white/5">
                <div className="absolute inset-0 bg-neutral-900" />
                <img src={src || '/placeholder.svg'} alt={alt || `Memory ${index + 1}`} className="h-full w-full object-cover opacity-90 grayscale-[20%] contrast-125" loading="eager" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
              </div>
            </motion.div>
          );
        })}

        {/* "Mark Your Calendar" Text */}
        <motion.div
          style={{ opacity: stayTunedOpacity }}
          className="absolute top-[15vh] left-0 right-0 text-center z-20 pointer-events-none"
        >
          <div className="inline-flex items-center justify-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-black/50 backdrop-blur-md shadow-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <p className="text-white/80 text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase">Feb 20, 2026</p>
          </div>
        </motion.div>

        {/* Countdown Timer Overlay */}
        <motion.div
          style={{ opacity: timerOpacity }}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          {!countdown.finished ? (
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-[2.5rem] opacity-50 blur-[1px]" />

              <div className="relative text-center p-12 md:p-16 rounded-[2.5rem] bg-[#050505]/80 backdrop-blur-2xl border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] overflow-hidden">
                {/* Top Shine */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {/* Static Design Elements: Corner Brackets */}
                <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-white/20 rounded-tl-lg" />
                <div className="absolute top-6 right-6 w-4 h-4 border-t border-r border-white/20 rounded-tr-lg" />
                <div className="absolute bottom-6 left-6 w-4 h-4 border-b border-l border-white/20 rounded-bl-lg" />
                <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-white/20 rounded-br-lg" />

                <div className="mb-14 relative z-10">
                  <h3 className="text-sm md:text-base font-bold tracking-[0.6em] text-transparent bg-clip-text bg-gradient-to-r from-white/80 via-white to-white/80 uppercase">
                    TechSolstice '26
                  </h3>
                  {/* Decorative Line under Title */}
                  <div className="flex items-center justify-center gap-2 mt-4 opacity-50">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-red-500" />
                    <div className="h-1 w-1 bg-red-500 rounded-full" />
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-red-500" />
                  </div>
                </div>

                <div className="flex items-start gap-8 md:gap-16 text-white justify-center relative z-10">
                  <ResponsiveCounterUnit value={countdown.days} label="Days" />
                  <Separator />
                  <ResponsiveCounterUnit value={countdown.hours} label="Hours" />
                  <Separator />
                  <ResponsiveCounterUnit value={countdown.minutes} label="Mins" />
                  <Separator />
                  <ResponsiveCounterUnit value={countdown.seconds} label="Secs" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center relative">
              <div className="absolute -inset-10 bg-red-500/20 blur-[100px] rounded-full" />
              <div className="relative">
                <div className="text-7xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 mb-6">
                  Now Live
                </div>
                <p className="text-lg text-red-500 tracking-[0.5em] uppercase font-medium">Welcome to the future</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const Separator = ({ mobile }: { mobile?: boolean }) => (
  <div className={`flex flex-col justify-center gap-2 md:gap-3 opacity-30 ${mobile ? 'h-[40px] pt-1' : 'h-[80px]'}`}>
    <div className={`rounded-full bg-white shadow-[0_0_5px_white] ${mobile ? 'w-0.5 h-0.5' : 'w-1 h-1'}`} />
    <div className={`rounded-full bg-white shadow-[0_0_5px_white] ${mobile ? 'w-0.5 h-0.5' : 'w-1 h-1'}`} />
  </div>
);

const ResponsiveCounterUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center group min-w-[3rem] md:min-w-0">
    <span className="text-3xl sm:text-4xl md:text-8xl font-light tabular-nums tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 drop-shadow-lg">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-[8px] md:text-xs text-neutral-500 group-hover:text-red-400/80 transition-colors duration-500 uppercase tracking-[0.3em] md:tracking-[0.4em] mt-2 md:mt-6 font-semibold">
      {label}
    </span>
  </div>
);

export default ZoomParallax;