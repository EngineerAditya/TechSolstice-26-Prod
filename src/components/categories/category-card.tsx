"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { type EventCategory } from "@/lib/constants/categories";
import PixelCard from "@/components/ui/pixel-card";

interface CategoryCardProps {
  category: EventCategory;
  index: number;
  size?: 'sm' | 'md' | 'lg';
  isFeatured?: boolean; // New Prop
}

const pixelVariants: Record<string, { variant: 'default' | 'blue' | 'yellow' | 'pink', colors?: string, speed?: number, gap?: number }> = {
  "default": { variant: 'blue', colors: '#cbd5e1,#64748b,#334155', speed: 20, gap: 5 },
  "coding-dev": { variant: 'blue', colors: '#dbeafe,#3b82f6,#1e40af', speed: 30, gap: 8 },
  "robotics-hardware": { variant: 'default', colors: '#fed7aa,#f97316,#ea580c', speed: 25, gap: 6 },
  "finance-strategy": { variant: 'default', colors: '#dcfce7,#16a34a,#15803d', speed: 20, gap: 7 },
  "quizzes-tech-games": { variant: 'default', colors: '#ede9fe,#8b5cf6,#7c3aed', speed: 35, gap: 5 },
  "creative-design": { variant: 'pink', speed: 40, gap: 4 },
  "gaming-zone": { variant: 'default', colors: '#e0e7ff,#6366f1,#4f46e5', speed: 50, gap: 3 },
  "conclave": { variant: 'yellow', colors: '#fef9c3,#eab308,#a16207', speed: 15, gap: 6 },
};

export function CategoryCard({ category, index, size = 'md', isFeatured = false }: CategoryCardProps) {
  const pixelConfig = pixelVariants[category.id] || pixelVariants["default"];

  const sizeClasses = {
    sm: 'min-h-[220px]',
    md: 'min-h-[280px]',
    lg: 'min-h-[340px]'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`group relative w-full ${sizeClasses[size]} h-full`}
    >
      <Link href={`/events/${category.slug}`} className="block h-full">
        <PixelCard
          variant={pixelConfig.variant}
          colors={pixelConfig.colors}
          speed={pixelConfig.speed}
          gap={pixelConfig.gap}
          className="w-full h-full border-white/20 transition-all duration-500 hover:border-white/40 hover:shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black/60 pointer-events-none z-1" />

          <div className="absolute inset-0 z-2 flex flex-col p-6 sm:p-8 h-full w-full">

            {/* Top Row: Title */}
            <div className={`flex ${isFeatured ? 'justify-center items-center' : 'justify-between items-start'} gap-4 relative`}>

              {/* Title Container */}
              <div className={`flex-1 min-w-0 ${isFeatured ? 'text-center' : ''}`}>
                <h3 className={`michroma-regular text-white/95 leading-snug wrap-break-word drop-shadow-md 
                  ${isFeatured
                    ? 'text-3xl sm:text-4xl lg:text-5xl mt-2' // Reduced margin for featured flagship
                    : 'text-lg sm:text-xl lg:text-2xl'   // Standard text
                  }`}>
                  {category.title}
                </h3>
              </div>

              {/* Arrow Indicator - Positioned Absolutely for Featured cards to prevent off-centering */}
              <motion.div
                whileHover={{ x: 3, y: -3 }}
                className={`shrink-0 text-white/50 group-hover:text-white transition-colors pt-1 
                  ${isFeatured ? 'absolute right-0 -top-2' : ''}`}
              >
                <ArrowUpRight className="w-6 h-6" />
              </motion.div>
            </div>

            {/* Spacer */}
            <div className="grow" />

            {/* Bottom: Description */}
            <div className={`mt-4 ${isFeatured ? 'text-center max-w-3xl mx-auto' : ''}`}>
              <p className="text-sm sm:text-base text-white/60 leading-relaxed line-clamp-3 group-hover:text-white/90 transition-colors duration-500">
                {category.description}
              </p>
            </div>

          </div>
        </PixelCard>
      </Link>
    </motion.div>
  );
}