"use client";

import { ChevronRight } from "lucide-react";
import { FlickeringGrid } from "./ui/flickering-grid";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Icons } from "./ui/icons";
import { useEffect, useRef, useState } from "react";

export const siteConfig = {
  hero: {
    title: "TechSolstice'26",
    description:
      "Welcome to the future. Explore, innovate, and create with us.",
  },
  footerLinks: [
    {
      title: "Event",
      links: [
        { id: 1, title: "About", url: "#about" },
        { id: 2, title: "Schedule", url: "#schedule" },
        { id: 3, title: "Speakers", url: "#speakers" },
        { id: 4, title: "Venue", url: "#venue" },
      ],
    },
    {
      title: "Participate",
      links: [
        { id: 5, title: "Register", url: "#register" },
        { id: 6, title: "Workshops", url: "#workshops" },
        { id: 7, title: "Competitions", url: "#competitions" },
        { id: 8, title: "Sponsors", url: "#sponsors" },
      ],
    },
    {
      title: "Connect",
      links: [
        { id: 9, title: "Contact", url: "#contact" },
        { id: 10, title: "Team", url: "#team" },
        { id: 11, title: "Newsletter", url: "#newsletter" },
        { id: 12, title: "Social", url: "#social" },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig;

export const Footer = () => {
  const isTabletOrLarger = useMediaQuery("(min-width: 768px)"); // 768px = tablet breakpoint
  const tablet = useMediaQuery("(max-width: 1024px)");

  return (
    <footer id="footer" className="w-full pb-0">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between p-6 sm:p-8 md:p-10 gap-8 md:gap-4">
        <div className="flex flex-col items-start justify-start gap-y-4 max-w-xs mx-0">
          <a href="#" className="flex items-center gap-2">
            <Icons.logo className="size-6 sm:size-8 text-white" />
            <p className="text-lg sm:text-xl font-semibold text-white">TechSolstice</p>
          </a>
          <p className="tracking-tight text-neutral-300 font-medium text-sm sm:text-base">
            {siteConfig.hero.description}
          </p>
        </div>
        <div className="w-full md:w-1/2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 lg:pl-10">
            {siteConfig.footerLinks.map((column, columnIndex) => (
              <ul key={columnIndex} className="flex flex-col gap-y-2">
                <li className="mb-2 text-xs sm:text-sm font-semibold text-white">
                  {column.title}
                </li>
                {column.links.map((link) => (
                  <li
                    key={link.id}
                    className="group inline-flex cursor-pointer items-center justify-start gap-1 text-[13px] sm:text-[15px]/snug"
                  >
                    <a 
                      href={link.url}
                      className="text-neutral-400 hover:text-white transition-colors no-underline"
                    >
                      {link.title}
                    </a>
                    <div className="hidden sm:flex size-4 items-center justify-center border border-neutral-600 rounded translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100">
                      <ChevronRight className="h-4 w-4 text-neutral-400" />
                    </div>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
      
      {/* Only show FlickeringGrid on tablet and larger devices */}
      {isTabletOrLarger && (
        <div className="w-full h-80 md:h-96 lg:h-[600px] relative mt-12 sm:mt-16 md:mt-24 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black z-10 from-20% sm:from-25% md:from-30%" />
          <div className="absolute inset-0 mx-3 sm:mx-6">
            <FlickeringGridResponsive
              text={tablet ? "Solstice'26" : "TechSolstice'26"}
              baseFontSize={tablet ? 90 : 140}
              className="h-full w-full"
              squareSize={3}
              gridGap={tablet ? 3 : 4}
              color="#6B7280"
              maxOpacity={0.4}
              flickerChance={0.15}
            />
          </div>
        </div>
      )}
    </footer>
  );
};

/**
 * Responsive wrapper around FlickeringGrid which measures the available width
 * and scales the fontSize down if the rendered text would overflow the container.
 */
function FlickeringGridResponsive({
  text,
  baseFontSize,
  ...props
}: {
  text: string
  baseFontSize: number
  [key: string]: any
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [fontSize, setFontSize] = useState<number>(baseFontSize)

  useEffect(() => {
    if (!containerRef.current) return

    let raf = 0

    const measure = () => {
      const container = containerRef.current!
      const containerWidth = container.clientWidth

      // Create an offscreen canvas to measure text width accurately
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Use same font stack as FlickeringGrid
      const fontWeight = '600'
      ctx.font = `${fontWeight} ${baseFontSize}px "Doto", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      const metrics = ctx.measureText(text)
      const textWidth = metrics.width || 0

      if (textWidth > containerWidth) {
        // Scale down proportionally with a small margin
        const scale = (containerWidth * 0.9) / textWidth
        const newSize = Math.max(12, Math.floor(baseFontSize * scale))
        setFontSize(newSize)
      } else {
        setFontSize(baseFontSize)
      }
    }

    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }

    // Initial measure
    measure()

    window.addEventListener('resize', onResize)

    const ro = new ResizeObserver(onResize)
    ro.observe(containerRef.current)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
    }
  }, [text, baseFontSize])

  return (
    <div ref={containerRef} className="h-full w-full">
      <FlickeringGrid text={text} fontSize={fontSize} {...props} />
    </div>
  )
}