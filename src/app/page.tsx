"use client";

import { HeroRobot } from "../components/hero-robot";
import { Footer } from "../components/footer";
import TechSolsticeNavbar from "../components/navbar";
import { LoadingScreen } from "../components/loading-screen";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={() => {}} minDuration={1500} />}

      {!isLoading && <TechSolsticeNavbar />}

      <main
        className={`w-full max-w-full overflow-x-hidden bg-black transition-opacity duration-700 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        <HeroRobot />

        <div className="min-h-screen bg-gradient-to-b from-black to-neutral-900 p-4 sm:p-6 md:p-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Welcome to TechSolstice'26
          </h2>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-neutral-300">
            Explore, innovate, and create with us.
          </p>
        </div>

        <Footer />
      </main>
    </>
  );
}