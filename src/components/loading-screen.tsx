"use client";

import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onLoadingComplete: () => void
  minDuration?: number // Minimum time to show loader (in ms)
}

export function LoadingScreen({ onLoadingComplete, minDuration = 1500 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Smooth progress animation
    const duration = minDuration
    const steps = 60 // 60 frames for smooth animation
    const interval = duration / steps
    let currentStep = 0

    const progressTimer = setInterval(() => {
      currentStep++
      const newProgress = Math.min((currentStep / steps) * 100, 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        clearInterval(progressTimer)
        setIsComplete(true)
        // Small delay before fade out
        setTimeout(() => {
          onLoadingComplete()
        }, 300)
      }
    }, interval)

    return () => clearInterval(progressTimer)
  }, [minDuration, onLoadingComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        isComplete ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logo or Title */}
      <div className="mb-8 text-center">
        <h1 
          className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent"
          style={{ fontFamily: '"Doto", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          TechSolstice'26
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-400 tracking-wider">
          LOADING EXPERIENCE
        </p>
      </div>

      {/* Minimal Progress Bar */}
      <div className="w-64 sm:w-80 md:w-96 h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neutral-500 via-white to-neutral-500 rounded-full transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress Percentage */}
      <div className="mt-4 text-neutral-500 text-sm font-mono">
        {Math.round(progress)}%
      </div>

      {/* Subtle pulsing dot */}
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}