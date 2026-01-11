"use client";

import Image from "next/image";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

type Variant = "header" | "compact" | "stacked";

interface LogoProps {
  variant?: Variant;
  className?: string;
}

export function Logo({ variant = "header", className = "" }: LogoProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname === "/") {
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/", { scroll: false });
  };

  const mitUrl = "https://www.manipal.edu/mu/campuses/mahe-bengaluru/academics/institution-list/mitblr.html";

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        {/* Stacked: Student Council Logo (approx 80-100px) */}
        <a 
          href={mitUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative h-20 w-20 sm:h-24 sm:w-24 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logos/SCLogo.png"
            alt="Student Council Logo"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 640px) 80px, 100px"
          />
        </a>
        {/* Stacked: Wordmark (approx 120-170px wide) */}
        <a 
          href="/" 
          onClick={handleHomeClick} 
          className="relative h-10 w-auto aspect-[3/1] sm:h-14 hover:opacity-90 transition-opacity"
          aria-label="Go to homepage"
        >
          <Image
            src="/logos/TechSolsticeLogo.png"
            alt="TechSolstice Wordmark"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 640px) 120px, 170px"
          />
        </a>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Header: Wordmark (approx 120-170px wide) */}
      <a 
        href="/" 
        onClick={handleHomeClick}
        className={`relative w-auto ${variant === "compact" ? "h-12 md:h-16" : "h-10 md:h-14"} aspect-[3/1] hover:opacity-90 transition-opacity`}
        aria-label="Go to homepage"
      >
        <Image
          src="/logos/TechSolsticeLogo.png"
          alt="TechSolstice Wordmark"
          fill
          className="object-contain object-left"
          priority
          sizes="(max-width: 768px) 120px, 170px"
        />
      </a>

      <div className={`${variant === "compact" ? "h-12 md:h-16" : "h-8 md:h-10"} w-[1.5px] bg-white/30 rounded-full`} />

      {/* Header: Student Council Logo (approx 40-60px) */}
      <a 
        href={mitUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`relative w-auto ${variant === "compact" ? "h-12 md:h-16 aspect-square" : "h-10 md:h-14 aspect-square"} hover:opacity-80 transition-opacity`}
      >
        <Image
          src="/logos/SCLogo.png"
          alt="Student Council Logo"
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 40px, 60px"
        />
      </a>
    </div>
  );
}

export default Logo;