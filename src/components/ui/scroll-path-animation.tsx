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

    // Debounce resize to prevent layout thrashing
    let resizeTimer: NodeJS.Timeout;

    const initAnimation = () => {
      if (ctx) ctx.revert();

      ctx = gsap.context(() => {
        const box = boxRef.current;
        const container = containerRef.current;
        const markers = markerRefs.current.filter((m): m is HTMLDivElement => m !== null);

        if (!box || !container || markers.length === 0) return;

        // Force a layout recalculation before measuring
        ScrollTrigger.refresh();

        const containerRect = container.getBoundingClientRect();

        // 1. Build Path Data relative to container
        const pathPoints = markers.map((marker) => {
          const rect = marker.getBoundingClientRect();
          // Calculate center positions
          const markerCenterX = rect.left + rect.width / 2;
          const markerCenterY = rect.top + rect.height / 2;
          
          // Convert to container-relative coordinate
          const x = markerCenterX - containerRect.left - box.offsetWidth / 2;
          const y = markerCenterY - containerRect.top - box.offsetHeight / 2;
          
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
            start: "top 60%", // Earlier start for smoother entry
            end: "bottom 40%",
            scrub: 1.5, // High scrub for buttery smoothness
            invalidateOnRefresh: true,
          }
        });

        tl.to(box, {
          motionPath: {
            path: pathPoints,
            curviness: 0, // Force linear path between markers to ensure it hits them perfectly
            autoRotate: false,
          },
          ease: "none",
        });

      }, containerRef);
    };

    // Initialize with a small delay to ensure DOM is painted
    const initialTimer = setTimeout(initAnimation, 100);

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initAnimation, 200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      if (ctx) ctx.revert();
    };
  }, []);

  // CONFIGURATION
  // Reduced from 45vh to 25vh to decrease scroll distance
  const ITEM_SPACING_VH = 25;
  const totalHeightVh = EVENT_CATEGORIES.length * ITEM_SPACING_VH;

  return (
    <div className={styles.mainWrapper}>

      {/* Top Intro Section */}
      <div className={styles.introSpacer}>
        <h3 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight michroma-regular uppercase">
          Explore Categories
        </h3>
        <p className="text-red-500 font-bold text-[10px] uppercase tracking-[0.4em] animate-pulse">
          Scroll to navigate
        </p>
        <div className="w-[1px] h-12 bg-gradient-to-b from-red-600 via-red-900 to-transparent mx-auto mt-6" />
      </div>

      {/* Path Container */}
      <div
        ref={containerRef}
        className={styles.pathContainer}
        // Add padding bottom to ensure the last card has breathing room
        style={{ height: `${totalHeightVh}vh`, paddingBottom: '20vh' }}
      >
        <div ref={boxRef} className={styles.box}></div>

        {EVENT_CATEGORIES.map((category, index) => {
          const isRight = index % 2 === 0;
          const indexStr = (index + 1).toString().padStart(2, '0');

          // LOGIC FIX: Safe division to prevent Infinity if only 1 category exists
          // We distribute items from 0% to 100% of the available vertical space
          const safeDenominator = EVENT_CATEGORIES.length > 1 ? EVENT_CATEGORIES.length - 1 : 1;
          const topPos = (index / safeDenominator) * 100;

          return (
            <div
              key={category.id}
              className={`${styles.stepContainer} ${isRight ? styles.alignRight : styles.alignLeft}`}
              style={{ top: `${topPos}%` }}
            >
              <div className={styles.textCard}>
                <h4 className={`${styles.categoryTitle} michroma-regular`}>{category.title}</h4>
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
      <div className="relative z-10 py-32 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-t from-black via-black/95 to-transparent">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-10 drop-shadow-lg michroma-regular uppercase tracking-tight">
          Ready to Compete?
        </h2>
        <Link
          href="/events"
          className="group relative inline-flex items-center justify-center px-12 py-5 bg-red-600 text-white font-bold text-[11px] uppercase tracking-[0.4em] rounded-full overflow-hidden transition-all duration-300 hover:bg-red-700 hover:scale-105 hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] md:px-14 md:py-6"
        >
          <span className="relative z-10 michroma-regular">View All Events</span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </Link>
      </div>

    </div>
  );
}