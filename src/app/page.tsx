"use client";

import { useState, useEffect } from "react";
import { HeroRobot } from "../components/hero-robot";
import YouTubeScrollVideo from "@/components/ui/youtube-scroll-video";
import { ScrollPathAnimation } from "@/components/ui/scroll-path-animation";
import ZoomParallax from "@/components/ui/zoom-parallax";
import FestInfo from "@/components/ui/fest-info";
import SpeakerShowcase from "@/components/ui/speaker-showcase";
import LoadingScreen from "../components/loading-screen"; // Default import
import { SponsorsSection } from "@/components/sponsors-section";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // 1. Desktop Check for Video
    const checkDesktop = () => {
      setShowVideo(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    // 2. Loading Timer
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    // 3. Smooth Scroll Logic (Lenis)
    let lenis: any;
    let rafId: number;

    const initLenis = async () => {
      try {
        const Lenis = (await import('@studio-freight/lenis')).default;
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });

        function raf(time: number) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);
      } catch (e) {
        console.warn("Lenis failed to load", e);
      }
    };

    initLenis();

    return () => {
      window.removeEventListener("resize", checkDesktop);
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    // Removed bg-black to ensure HeroRobot background is visible
    <main className="min-h-screen w-full">

      <LoadingScreen fadeOut={!loading} />

      {/* Content is rendered immediately but hidden via opacity.
        No overflow-hidden on the div itself to avoid scrollbar layout shift.
      */}
      <div
        className={`w-full transition-opacity duration-[1500ms] cubic-bezier(0.22, 1, 0.36, 1) ${loading ? "opacity-0 h-screen overflow-hidden" : "opacity-100"
          }`}
      >
        <HeroRobot />

        <div className="relative z-10 mt-0 md:-mt-1 bg-black">
          <FestInfo />
        </div>

        <div className="mt-8">
          <SpeakerShowcase />
        </div>

        <div className="mt-8">
          <ScrollPathAnimation />
        </div>

        {showVideo && (
          <div className="mt-12">
            <YouTubeScrollVideo
              videoId="comtgOhuXIg"
              title="TechSolstice'26"
              scrollToExpand="Initiate Sequence"
            />
          </div>
        )}

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

        <div className="mt-16 pb-20">
          <SponsorsSection />
        </div>
      </div>
    </main>
  );
}