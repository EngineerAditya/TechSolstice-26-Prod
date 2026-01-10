"use client";

import { useState, useEffect } from "react";
import { HeroRobot } from "../components/hero-robot";
import YouTubeScrollVideo from "@/components/ui/youtube-scroll-video";
import { ScrollPathAnimation } from "@/components/ui/scroll-path-animation";
import ZoomParallax from "@/components/ui/zoom-parallax";
import FestInfo from "@/components/ui/fest-info";
import { LoadingScreen } from "../components/loading-screen";
import Logo from "@/components/ui/logo";
import { SponsorsSection } from "@/components/sponsors-section";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  // Default to false so it NEVER renders on server or initial mobile paint
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // 1. Mobile Check Logic
    // We only set showVideo to true if it is strictly a desktop
    const checkDesktop = () => {
      if (window.innerWidth >= 768) {
        setShowVideo(true);
      } else {
        setShowVideo(false);
      }
    };

    // Run immediately on mount
    checkDesktop();

    // Add listener for resizing (e.g. rotating tablet or resizing window)
    window.addEventListener("resize", checkDesktop);

    // 2. Smooth Scroll Logic (Lenis)
    let rafId: number;
    (async () => {
      try {
        const Lenis = (await import('@studio-freight/lenis')).default;
        const lenis = new Lenis();
        function raf(time: number) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
      } catch (e) {
        console.warn("Lenis failed to load", e);
      }
    })();

    return () => {
      window.removeEventListener("resize", checkDesktop);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} minDuration={2000} />}

      <div
        className={`w-full transition-opacity duration-700 ${isLoading ? "opacity-0" : "opacity-100"
          }`}
      >
        {/* 1. HERO SECTION */}
        <HeroRobot />

        {/* 2. REVEAL VIDEO (YouTube) */}
        {/* CONDITIONAL RENDER: Only renders if showVideo is true (Desktop) */}
        {showVideo && (
          <YouTubeScrollVideo
            videoId="comtgOhuXIg"
            title="TechSolstice'26"
            scrollToExpand="Initiate Sequence"
          />
        )}

        {/* 3. FEST INFO */}
        <div className="relative z-10 mt-0 md:-mt-1 bg-black">
          <FestInfo />
        </div>

        {/* 4. SCROLL PATH ANIMATION (Categories) */}
        <div className="mt-8">
          <ScrollPathAnimation />
        </div>

        {/* 5. ZOOM PARALLAX GALLERY */}
        <div className="mt-12">
          <ZoomParallax
            images={[
              { src: '/photos/IMG_0162.jpg', alt: 'TechSolstice Crowd' },
              { src: '/photos/IMG_1510.jpg', alt: 'Stage Event' },
              { src: '/photos/IMG_0110.jpg', alt: 'Guest Speaker' },
              { src: '/photos/IMG-20250405-WA0141.jpg', alt: 'Workshop' },
              { src: '/photos/IMG_1588.jpg', alt: 'Gaming Event' },
              { src: '/photos/IMG_1510.jpg', alt: 'Concert' },
              { src: '/photos/IMG_1588.jpg', alt: 'Prize Distribution' },
            ]}
          />
        </div>

        {/* 6. SPONSORS */}
        <div className="mt-16 pb-20">
          <SponsorsSection />
        </div>
      </div>
    </>
  );
}