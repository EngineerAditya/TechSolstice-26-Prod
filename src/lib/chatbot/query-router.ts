import Fuzzysort from 'fuzzysort';

export enum QueryIntent {
  DETAILS = 'details',       // Time, venue, prize
  RULES = 'rules',           // Rulebook queries
  GENERAL_INFO = 'general',  // WiFi, Food (Seed data)
  FILTER = 'filter',         // "Events in evening"
  COMPLEX = 'complex'        // Recommendation
}

export interface QueryAnalysis {
  intent: QueryIntent;
  target?: string;           // Event Name or Category
  filter?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    day?: string;
  };
}

const ALIAS_MAP: Record<string, string> = {
  'cod': 'Call of Duty',
  'hack': 'Hackathon',
  // ... add your aliases
};

const GENERAL_KEYWORDS = ['wifi', 'food', 'parking', 'washroom', 'canteen', 'certificate', 'bus', 'transport'];

export function analyzeQuery(query: string): QueryAnalysis {
  const norm = query.toLowerCase();

  // 1. GENERAL INFO CHECK (Seed Data)
  if (GENERAL_KEYWORDS.some(k => norm.includes(k))) {
    return { intent: QueryIntent.GENERAL_INFO };
  }

  // 2. RULES CHECK
  if (norm.includes('rule') || norm.includes('format') || norm.includes('allow') || norm.includes('banned')) {
    // If asking for rules, we still need to find WHICH event
    // The Route Handler will use fuzzy matching to find the target
    return { intent: QueryIntent.RULES };
  }

  // 3. TIME/FILTER CHECK
  if (norm.includes('morning') || norm.includes('evening') || norm.includes('afternoon') || norm.includes('tomorrow')) {
    let timeOfDay;
    if (norm.includes('morning')) timeOfDay = 'morning';
    else if (norm.includes('afternoon')) timeOfDay = 'afternoon';
    else if (norm.includes('evening')) timeOfDay = 'evening';

    return { intent: QueryIntent.FILTER, filter: { timeOfDay: timeOfDay as any } };
  }

  // 4. DEFAULT: DETAILS (The Router assumes Details unless proven otherwise)
  // We don't return COMPLEX here yet. We let the Route Handler try to find an event match first.
  // If it finds an event match, it serves details. If not, it falls back to COMPLEX.
  return { intent: QueryIntent.DETAILS };
}

// Utility to find event name (Re-use your robust one from previous steps)
export function findEventMatch(query: string, allEventNames: string[]): string | null {
  // ... (Paste your existing findEventMatch code here)
  // Ensure "rules", "details" etc are removed from string before fuzzy matching
  let clean = query.toLowerCase().replace(/\b(rules?|regulations?|format|details|about|when|where|is)\b/g, '').trim();

  // ... Alias check ...
  const results = Fuzzysort.go(clean, allEventNames, { threshold: -10000, limit: 1 });
  return results.length > 0 ? results[0].target : null;
}