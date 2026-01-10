'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Link from 'next/link';
import styles from './scroll-path-animation.module.css';
import { EVENT_CATEGORIES } from '@/lib/constants/categories';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export function ScrollPathAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let ctx: gsap.Context;

    const initAnimation = () => {
      if (ctx) ctx.revert();

      ctx = gsap.context(() => {
        const box = boxRef.current;
        const container = containerRef.current;
        // Type Guard to ensure valid HTML elements
        const markers = markerRefs.current.filter((m): m is HTMLDivElement => m !== null);

        if (!box || !container || markers.length === 0) return;

        const containerRect = container.getBoundingClientRect();

        // 1. Build Path Data relative to container
        const pathPoints = markers.map((marker) => {
          const rect = marker.getBoundingClientRect();
          const x = (rect.left - containerRect.left) + (rect.width / 2) - (box.offsetWidth / 2);
          const y = (rect.top - containerRect.top) + (rect.height / 2) - (box.offsetHeight / 2);
          return { x, y };
        });

        // 2. Set Initial Position
        if (pathPoints.length > 0) {
          gsap.set(box, { x: pathPoints[0].x, y: pathPoints[0].y });
        }

        // 3. Create Timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top center",
            end: "bottom center", // Keeps diamond centered in viewport
            scrub: 0.5,
          }
        });

        tl.to(box, {
          motionPath: {
            path: pathPoints,
            curviness: 1.2,
            autoRotate: false,
            alignOrigin: [0.5, 0.5],
          },
          ease: "none",
        });

      }, containerRef);
    };

    const timer = setTimeout(initAnimation, 200);
    window.addEventListener('resize', initAnimation);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', initAnimation);
      if (ctx) ctx.revert();
    };
  }, []);

  // SPACING CALCULATION:
  // 45vh per item gives good breathing room.
  const totalHeight = EVENT_CATEGORIES.length * 45;

  return (
    <div className={styles.mainWrapper}>

      {/* Top Intro Section */}
      <div className={styles.introSpacer}>
        <h3 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          Explore Categories
        </h3>
        <p className="text-red-500 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">
          Scroll to navigate
        </p>
        <div className="w-[1px] h-16 bg-gradient-to-b from-red-600 via-red-900 to-transparent mx-auto mt-8" />
      </div>

      {/* Path Container */}
      <div
        ref={containerRef}
        className={styles.pathContainer}
        style={{ height: `${totalHeight}vh` }}
      >
        <div ref={boxRef} className={styles.box}></div>

        {EVENT_CATEGORIES.map((category, index) => {
          const isRight = index % 2 === 0;
          const indexStr = (index + 1).toString().padStart(2, '0');

          // --- FIX IS HERE ---
          // OLD LOGIC: (index / length) * 100  -> Resulted in 100% for last item
          // NEW LOGIC: (index / length) * 85   -> Caps the last item at 85% height
          // This leaves 15% of the container empty at the bottom for the card content.
          const topPos = (index / (EVENT_CATEGORIES.length - 1)) * 90;

          return (
            <div
              key={category.id}
              className={`${styles.stepContainer} ${isRight ? styles.alignRight : styles.alignLeft}`}
              style={{ top: `${topPos}%` }}
            >
              <div className={styles.textCard}>
                <h4 className={styles.categoryTitle}>{category.title}</h4>
                <p className={styles.categoryDesc}>{category.description}</p>
                <Link href={`/events/${category.slug}`} className={styles.ctaLink}>
                  Explore &rarr;
                </Link>
              </div>

              <div
                ref={(el) => { markerRefs.current[index] = el }}
                className={styles.marker}
              >
                {indexStr}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Section */}
      {/* Added margin-top to physically push it away if absolute overlap still happens */}
      <div className="relative z-10 py-32 mt-20 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 drop-shadow-lg">
          Ready to Compete?
        </h2>
        <Link
          href="/events"
          className="group relative inline-flex items-center justify-center px-10 py-4 bg-red-600 text-white font-bold text-lg rounded-full overflow-hidden transition-all duration-300 hover:bg-red-700 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
        >
          <span className="relative z-10">View All Events</span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </Link>
      </div>

    </div>
  );
}
