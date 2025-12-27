"use client";

import React from "react";
import GooeyText from "@/components/ui/gooey-text-morphing";

export default function FestInfo() {
  return (
    <section className="bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25),transparent_40%)] bg-opacity-40 py-16 md:py-28 relative">
      <div className="container mx-auto px-6 md:px-12 text-center text-foreground">

        {/* Wrapper (no background tint/blur) */}
        <div className="mx-auto max-w-5xl rounded-3xl bg-transparent border border-white/5 p-8 md:p-16 shadow-2xl">

          {/* Animated gooey morphing text */}
          <div className="leading-tight">
            {/* Use GooeyText to cycle the three words */}
            {/* textClassName will merge with internal sizing via `cn` */}
            <GooeyText
              texts={["Collaborate.", "Compete.", "Create."]}
              morphTime={1}
              cooldownTime={0.5}
              className="relative h-40 md:h-56"
              textClassName="font-black tracking-tight text-4xl md:text-7xl text-cyan-200"
            />
          </div>

          <p className="mt-8 text-sm md:text-base font-semibold text-cyan-100 opacity-90 tracking-wide uppercase">
            TECHSOLSTICE '26 — The Flagship Tech & Innovation Fest of MIT Bengaluru
          </p>

          <div className="mt-8 max-w-3xl mx-auto text-sm md:text-lg text-gray-300 leading-relaxed">
            <p>
              TechSolstice is a celebration of creativity, technology, and entrepreneurship.
              We bring together the brightest minds from premier institutions across India to
              [cite_start]bridge the gap between bold ideas and reality[cite: 17, 18].
            </p>

            <p className="mt-6">
              Organized entirely by students, TechSolstice '26 embodies the spirit of
              innovation, precision, and passion. From the 36-Hour Hackathon and Battle Bots
              [cite_start]to high-stakes Esports, this is your platform to ignite the future[cite: 19, 50, 107].
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}