"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { HeroRobot } from "../components/hero-robot";
import FestInfo from "@/components/ui/fest-info"; // Keep this static for immediate scroll availability
import LoadingScreen from "../components/loading-screen";
import ReactDOM from "react-dom";

// --- DYNAMIC IMPORTS (Resource Optimization) ---
// These components are heavy. We load them only when needed (Lazy Loading).
// This reduces the initial JavaScript bundle size significantly (Better FCP).

const SpeakerShowcase = dynamic(() => import("@/components/ui/speaker-showcase"), {
  ssr: true, // Keep SSR for SEO
});

const ScrollPathAnimation = dynamic(() => import("@/components/ui/scroll-path-animation"), {
  ssr: false, // Animation heavy, client only is fine
});

const YouTubeScrollVideo = dynamic(() => import("@/components/ui/youtube-scroll-video"), {
  ssr: false,
});

const ZoomParallax = dynamic(() => import("@/components/ui/zoom-parallax"), {
  ssr: false,
});

// Handle Named Export for SponsorsSection
const SponsorsSection = dynamic(() =>
  import("@/components/sponsors-section").then((mod) => mod.SponsorsSection)
);

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false); // Controls mounting of heavy components
  const [showVideo, setShowVideo] = useState(false);

  // PRELOAD CRITICAL ASSETS
  useEffect(() => {
    // Manually signal to browser to prioritize the ASMR background if it's an image
    // If it's pure CSS (which ASMR usually is), this logic ensures the main thread focuses on HeroRobot first.
    ReactDOM.preload("/fonts/Michroma-Regular.ttf", { as: "font" }); // Example if you serve local fonts
  }, []);

  useEffect(() => {
    // 1. Desktop Check for Video
    const checkDesktop = () => {
      setShowVideo(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    // 2. Loading Sequence
    // We allow the loader to run for 2.5s.
    // We set isReady slightly earlier so components can mount in the background just before reveal.
    const readyTimer = setTimeout(() => {
      setIsReady(true); // Mount heavy components
    }, 2000);

    const finishTimer = setTimeout(() => {
      setLoading(false); // Fade out loader
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
      clearTimeout(readyTimer);
      clearTimeout(finishTimer);
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <main className="min-h-screen w-full relative">
      {/* Portal Loader 
        fadeOut={!loading} triggers the CSS transition in the portal.
      */}
      <LoadingScreen fadeOut={!loading} />

      {/* HERO SECTION (Critical LCP)
        We render this IMMEDIATELY. We do NOT hide it with opacity-0.
        It sits behind the black loader. This allows the browser to paint it 
        and run the heavy 3D instantiation while the user watches the "System Initializing" text.
        This solves the LCP issue.
      */}
      <div className="relative z-0">
        <HeroRobot />
      </div>

      {/* BELOW THE FOLD (Resource Saving)
        We wrap the heavy rest-of-page content in a conditional or transition.
        It only mounts when `isReady` is true (2 seconds in).
        This ensures the initial page load only processes the Hero + Loader.
      */}
      {isReady && (
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards">

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
      )}
    </main>
  );
}