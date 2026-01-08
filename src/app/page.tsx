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

// --- CUSTOM TIMELINE DATA ---
// You can edit this array to change the scroll path content automatically.
const timelineData = [
  {
    title: "Opening Ceremony",
    description: "The grand reveal of TechSolstice '26. Keynote speakers and theme unveiling.",
    align: "center" as const
  },
  {
    title: "Hackathon Kickoff",
    description: "48-hour sleepless coding marathon begins. Teams lock in to build the future.",
    align: "left" as const
  },
  {
    title: "RoboWars Arena",
    description: "Sparks fly as custom-built bots battle for supremacy in the main pit.",
    align: "right" as const
  },
  {
    title: "Gaming Finals",
    description: "The top Valorant and FIFA players face off on the big screen.",
    align: "left" as const
  },
  {
    title: "Star Night",
    description: "A musical extravaganza to close the fest with high energy and vibes.",
    align: "center" as const
  },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    return () => cancelAnimationFrame(rafId);
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
        {/* --- FIXED LOGO HEADER --- */}
        <div className="fixed top-4 left-4 md:top-6 md:left-8 z-50">
          <Logo />
        </div>

        {/* 1. HERO SECTION */}
        <HeroRobot />

        {/* 2. REVEAL VIDEO (YouTube) */}
        <YouTubeScrollVideo
          videoId="comtgOhuXIg"
          title="TechSolstice'26"
          scrollToExpand="Initiate Sequence"
        />

        {/* 3. FEST INFO */}
        <div className="relative z-10 mt-0 md:-mt-1 bg-black">
          <FestInfo />
        </div>

        {/* 4. SCROLL PATH ANIMATION (Timeline) */}
        {/* We pass the data here to make it dynamic */}
        <div className="mt-8">
          <ScrollPathAnimation items={timelineData} />
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