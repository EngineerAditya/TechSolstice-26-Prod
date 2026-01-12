"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  // 1. Default to false to ensure Server Side Rendering (SSR) consistency
  // This prevents the "Text content does not match server-rendered HTML" error
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // 2. Only run this logic on the client
    const mediaQuery = window.matchMedia(query);

    // Set initial value based on client's actual device
    setMatches(mediaQuery.matches);

    // 3. Define the listener for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // 4. Safer event listener attachment (compatible with older Safari versions)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    // 5. Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}