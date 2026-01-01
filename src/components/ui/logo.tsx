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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname === "/") {
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push("/", { scroll: false });
  };

  const content =
    variant === "stacked" ? (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <div className="relative h-20 w-20 sm:h-24 sm:w-24">
          <Image src="/logos/SCLogo.png" alt="Student Council Logo" fill className="object-contain" priority />
        </div>
        <div className="relative h-10 w-auto aspect-[3/1] sm:h-14">
          <Image src="/logos/TechSolsticeLogo.png" alt="TechSolstice Wordmark" fill className="object-contain" priority />
        </div>
      </div>
    ) : (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`relative w-auto ${variant === "compact" ? "h-8 md:h-10" : "h-10 md:h-14"} aspect-[3/1]`}>
          <Image src="/logos/TechSolsticeLogo.png" alt="TechSolstice Wordmark" fill className="object-contain object-left" priority />
        </div>
        <div className="h-8 md:h-10 w-[1.5px] bg-white/30 rounded-full" />
        <div className={`relative w-auto ${variant === "compact" ? "h-8 md:h-10 aspect-square" : "h-10 md:h-14 aspect-square"}`}>
          <Image src="/logos/SCLogo.png" alt="Student Council Logo" fill className="object-contain" priority />
        </div>
      </div>
    );

  return (
    <a href="/" onClick={handleClick} aria-label="Go to homepage">
      {content}
    </a>
  );
}

export default Logo;
