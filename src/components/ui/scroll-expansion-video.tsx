"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

type Props = {
  mediaSrc: string;
  title?: string;
  scrollToExpand?: string;
};

export default function ScrollExpansionVideo({ mediaSrc }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controls = useAnimation();

  const [isMobile, setIsMobile] = useState(false);
  const [expansionProgress, setExpansionProgress] = useState(0);
  const [hasFlashed, setHasFlashed] = useState(false);

  const [positionState, setPositionState] = useState<'absolute-top' | 'fixed' | 'absolute-bottom'>('absolute-top');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Video Autoplay Logic (Shared)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => { });
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isMobile]); // Re-run if mobile state changes to re-attach to correct ref

  // DESKTOP Scroll Logic
  useEffect(() => {
    if (isMobile) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // 1. PINNING LOGIC
      if (rect.top <= 0 && rect.bottom >= windowHeight) {
        setPositionState('fixed');
      } else if (rect.bottom < windowHeight) {
        setPositionState('absolute-bottom');
      } else {
        setPositionState('absolute-top');
      }

      // 2. PROGRESS LOGIC
      const scrollableDistance = rect.height - windowHeight;
      const scrolled = -rect.top;
      let rawProgress = scrolled / scrollableDistance;
      rawProgress = Math.max(0, Math.min(1, rawProgress));

      // 3. BUFFER LOGIC (90% animation, 10% hold)
      const animationCutoff = 0.90;

      let mappedProgress = rawProgress / animationCutoff;
      mappedProgress = Math.min(1, mappedProgress);

      setExpansionProgress(mappedProgress);

      // Flash Trigger
      if (mappedProgress >= 0.99 && !hasFlashed) {
        setHasFlashed(true);
        controls.start({ opacity: [0, 0.7, 0] }, { duration: 0.8 });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [controls, hasFlashed, isMobile]);

  // Video Size Calculation (Desktop)
  const getVideoSize = () => {
    const startWidth = 40;
    const endWidth = 100;
    const startHeight = 30;
    const endHeight = 100;
    const startRadius = 24;
    const endRadius = 0;

    const smoothProgress = expansionProgress * (2 - expansionProgress);

    return {
      width: `${startWidth + (endWidth - startWidth) * smoothProgress}%`,
      height: `${startHeight + (endHeight - startHeight) * smoothProgress}vh`,
      borderRadius: `${startRadius + (endRadius - startRadius) * smoothProgress}px`,
    };
  };

  const videoSize = getVideoSize();
  const overlayOpacity = Math.max(0, 0.4 * (1 - expansionProgress * 1.5));
  const getContainerStyle = (): React.CSSProperties => {
    if (positionState === 'fixed') {
      return { position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 10 };
    }
    if (positionState === 'absolute-bottom') {
      return { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100vh', zIndex: 10 };
    }
    return { position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 10 };
  };

  // --- MOBILE ANIMATION COMPONENT ---
  const MobileVideo = () => {
    // This ref triggers the animation when the video enters the viewport
    const mobileRef = useRef(null);
    const isInView = useInView(mobileRef, { amount: 0.6, once: false }); // Trigger when 60% visible

    return (
      <div className="w-full bg-black py-20 flex items-center justify-center">
        <div ref={mobileRef} className="w-full max-w-md px-4">
          <motion.div
            initial={{ scale: 0.9, borderRadius: 20, filter: "brightness(0.6)" }}
            animate={isInView ? {
              scale: 1,
              borderRadius: 0,
              filter: "brightness(1)",
              // Expand negative margin to break out of padding and go full width
              marginLeft: "-1rem",
              marginRight: "-1rem",
              width: "calc(100% + 2rem)"
            } : {
              scale: 0.9,
              borderRadius: 20,
              filter: "brightness(0.6)",
              marginLeft: "0",
              marginRight: "0",
              width: "100%"
            }}
            transition={{ duration: 0.6, ease: "circOut" }}
            className="relative aspect-video overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10"
          >
            <video
              ref={videoRef}
              src={mediaSrc}
              className="w-full h-full object-cover"
              playsInline
              muted
              loop
              autoPlay
              preload="metadata"
            />

            {/* Cyberpunk scanline overlay for mobile */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] pointer-events-none opacity-30" />

            {/* Border Glow Effect when active */}
            <motion.div
              animate={isInView ? { opacity: 0 } : { opacity: 1 }}
              className="absolute inset-0 border-2 border-white/20 rounded-[20px] pointer-events-none"
            />
          </motion.div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return <MobileVideo />;
  }

  // --- DESKTOP RENDER ---
  return (
    <div
      ref={containerRef}
      className="relative w-full h-[500vh] bg-black"
    >
      <div
        style={getContainerStyle()}
        className="flex items-center justify-center overflow-hidden"
      >
        <motion.div
          style={{
            width: videoSize.width,
            height: videoSize.height,
            borderRadius: videoSize.borderRadius,
          }}
          className="relative overflow-hidden border border-white/10 bg-black/50 shadow-2xl z-10"
        >
          <video
            ref={videoRef}
            src={mediaSrc}
            className="w-full h-full object-cover"
            playsInline
            muted
            loop
            preload="metadata"
          />

          <div
            className="absolute inset-0 bg-black/40 pointer-events-none transition-opacity duration-300"
            style={{ opacity: overlayOpacity }}
          />

          <motion.div
            animate={controls}
            initial={{ opacity: 0 }}
            className="absolute inset-0 bg-white pointer-events-none z-20 mix-blend-overlay"
          />
        </motion.div>
      </div>
    </div>
  );
}