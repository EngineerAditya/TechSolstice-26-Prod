"use client";

import { HeroRobot } from "../components/hero-robot";
import ScrollExpansionVideo from "@/components/ui/scroll-expansion-video";
import { LoadingScreen } from "../components/loading-screen";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(true); // Default to true (safe mobile-first)

  useEffect(() => {
    // Check screen size on mount
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check immediately
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
        {/* Hero section with robot */}
        <HeroRobot />

        {/* Video Section - ONLY RENDER ON DESKTOP/TABLET */}
        {!isMobile && (
          <div className="mt-12 md:mt-20 lg:mt-28">
            <ScrollExpansionVideo
              mediaSrc="/videos/logo-reveal.mp4"
              title="TechSolstice'26 — Reveal"
              scrollToExpand="Scroll to expand"
            />
          </div>
        )}
      </div>
    </>
  );
}