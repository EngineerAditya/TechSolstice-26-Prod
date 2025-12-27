'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface Image {
  src: string;
  alt?: string;
}

interface ZoomParallaxProps {
  /** Array of images to be displayed in the parallax effect max 7 images */
  images: Image[];
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  // --- 1. COUNTDOWN LOGIC ---
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: false });

  useEffect(() => {
    // Set your target date here
    const target = new Date('2026-02-20T00:00:00');

    const update = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds, finished: false });
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // --- 2. ANIMATION TRANSFORMS ---
  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

  // Opacity for the Main Image (Index 0)
  // It starts fully visible (1) and fades to invisible (0) by 30% scroll
  const mainImageOpacity = useTransform(scrollYProgress, [0, 0.30], [1, 0]);

  // Opacity for the Timer (Background)
  // It starts invisible (0) and fades to visible (1) as the image disappears (deprecated for post-zoom timer)
  const timerOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);

  // Opacity for the post-zoom timer: appears when zoom effect has finished (main image faded)
  // Map it to the same range where the main image fades out (roughly 0.28 - 0.45)
  const postZoomOpacity = useTransform(scrollYProgress, [0.28, 0.45], [0, 1]);

  // Whether there's enough remaining space to display the timer (avoid showing when section is too short)
  const [canShowPostTimer, setCanShowPostTimer] = useState(false);

  useEffect(() => {
    if (!scrollYProgress || !(scrollYProgress as any).onChange) return;
    const unsub = (scrollYProgress as any).onChange((v: number) => {
      const el = container.current as HTMLElement | null;
      const remaining = el ? el.clientHeight - window.innerHeight : 0;
      // require a little room (150px) to comfortably show the timer
      // and show when zoom has completed (roughly past 30% scroll)
      setCanShowPostTimer(v >= 0.3 && remaining > 150);
    });

    return () => unsub && unsub();
  }, [scrollYProgress]);

  return (
    <div ref={container} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-black">

        {/* Timer will appear AFTER zoom completes; replaced with a post-zoom timer block below */}
        {/* (previous inline timer removed so the countdown only shows once the zoom has finished) */}

        {/* --- IMAGES LAYER (FOREGROUND) --- */}
        {images.map(({ src, alt }, index) => {
          const scale = scales[index % scales.length];

          // Determine specific class positioning for scattered images
          const positionClass =
            index === 1 ? '[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]' :
              index === 2 ? '[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]' :
                index === 3 ? '[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]' :
                  index === 4 ? '[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]' :
                    index === 5 ? '[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]' :
                      index === 6 ? '[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]' : '';

          return (
            <motion.div
              key={index}
              style={{
                scale,
                // CRITICAL FIX: If it is the first image (Index 0), apply the fading opacity.
                // Otherwise (Indices 1-6), keep them fully opaque so they fly off screen naturally.
                opacity: index === 0 ? mainImageOpacity : 1,
                // Ensure main image is on top of the timer (z-20) until it fades out
                zIndex: index === 0 ? 20 : 10
              }}
              className={`absolute top-0 flex h-full w-full items-center justify-center ${positionClass}`}
            >
              <div className="relative h-[25vh] w-[25vw]">
                <img
                  src={src || '/placeholder.svg'}
                  alt={alt || `Parallax image ${index + 1}`}
                  className="h-full w-full object-cover rounded-xl shadow-2xl"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Post-zoom timer block: appears in the remaining space after the sticky parallax finishes */}
      {canShowPostTimer && (
        <motion.div
          style={{ opacity: postZoomOpacity }}
          className="flex items-center justify-center h-[50vh]"
        >
          {!countdown.finished ? (
            <div className="text-center p-6 rounded-2xl bg-neutral-900/60 backdrop-blur-md border border-white/10 shadow-2xl">
              <h3 className="text-sm md:text-lg font-bold tracking-[0.3em] text-cyan-400 mb-3 uppercase">
                TechSolstice '26 Countdown
              </h3>
              <div className="flex items-center gap-4 text-white text-base md:text-lg">
                <div className="flex flex-col items-center">
                  <span className="text-2xl md:text-4xl font-bold tabular-nums">{countdown.days}</span>
                  <span className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Days</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl md:text-4xl font-bold tabular-nums">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Hrs</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl md:text-4xl font-bold tabular-nums">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Min</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl md:text-4xl font-bold tabular-nums">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Sec</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-2xl md:text-3xl font-bold text-white">Event Started</div>
          )}
        </motion.div>
      )}
    </div>
  );
}
export default ZoomParallax