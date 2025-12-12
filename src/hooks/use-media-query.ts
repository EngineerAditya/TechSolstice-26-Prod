"use client";

import { useState, useEffect, useCallback } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  const handleChange = useCallback((mediaQuery: MediaQueryList) => {
    setMatches(mediaQuery.matches);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Add listener
    const listener = (event: MediaQueryListEvent) => handleChange(event as any);
    
    if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
    } else {
      mediaQuery.addEventListener('change', listener);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeListener) {
        mediaQuery.removeListener(listener);
      } else {
        mediaQuery.removeEventListener('change', listener);
      }
    };
  }, [query, handleChange]);

  return matches;
}