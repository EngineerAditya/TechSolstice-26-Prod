"use client";

import React from "react";
import { GooeyText } from "@/components/ui/gooey-text-morphing";

export default function FestInfo() {
  return (
    <section className="relative w-full overflow-hidden bg-neutral-950 py-24 md:py-36 font-sans select-none">

      {/* --- Background: Minimalist Ambient Depth --- */}
      {/* 1. Very faint grid (barely visible texture) */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]"></div>

      {/* 2. Soft, deep ambient glow (toned down) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform opacity-40">
        <div className="h-[30rem] w-[30rem] rounded-full blur-[100px]" style={{ backgroundColor: "rgba(125, 13, 44, 0.2)" }}></div>
      </div>

      <div className="container relative mx-auto px-6 z-10 md:px-12 text-center">

        {/* --- Minimalist Wrapper --- */}
        <div className="mx-auto max-w-4xl p-4 md:p-12 relative">

          {/* Animated Gooey Text - Core Values */}
          <div className="relative z-10 mb-8">
            <GooeyText
              texts={["Collaborate.", "Compete.", "Create."]}
              morphTime={1}
              cooldownTime={1.5}
              className="relative h-28 md:h-40"
              textClassName="font-bold tracking-tighter text-5xl md:text-8xl text-red-600"
            />
          </div>

          {/* Divider Line */}
          <div className="w-16 h-1 mx-auto rounded-full mb-8" style={{ backgroundColor: "rgba(125, 13, 44, 0.3)" }}></div>

          {/* Sub-header: Event Details */}
          <p className="text-sm md:text-base font-medium tracking-[0.2em] uppercase text-neutral-400 mb-4">
            TechSolstice '26 <span className="text-red-900 px-2">//</span> February 20-22
          </p>

          <p className="text-xs md:text-sm font-light tracking-wide uppercase text-neutral-500 mb-10">
            Manipal Institute of Technology, Bengaluru
          </p>

          {/* Body Text: Concise and Impactful */}
          <div className="max-w-2xl mx-auto text-base md:text-lg text-neutral-400 leading-relaxed space-y-5">
            <p className="text-neutral-300">
              TechSolstice is where <span className="text-red-500/90">innovation ignites</span> and brilliance takes center stage.
            </p>

            <p>
              Join the brightest minds from across India for three electrifying days of cutting-edge challenges. From <span className="text-neutral-200">36-hour hackathons</span> to fierce <span className="text-neutral-200">robotic battles</span>—this is your arena to code, build, and conquer.
            </p>

            <p className="text-neutral-500">
              <span className="text-red-500/80">₹6.2L in prizes.</span> 30+ events. One unforgettable experience.
            </p>
          </div>

          {/* Call-to-Action Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 mt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-red-600 mb-2">30+</div>
              <div className="text-xs md:text-sm text-neutral-500 uppercase tracking-wide">Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-red-600 mb-2">₹6.2L</div>
              <div className="text-xs md:text-sm text-neutral-500 uppercase tracking-wide">Prize Pool</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-red-600 mb-2">3 Days</div>
              <div className="text-xs md:text-sm text-neutral-500 uppercase tracking-wide">Of Innovation</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}