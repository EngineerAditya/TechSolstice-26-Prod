export enum QueryIntent {
  GREETING = 'greeting',
  DETAILS = 'details' // Default for everything else
}

export interface QueryAnalysis {
  intent: QueryIntent;
  originalQuery: string;
}

const GREETING_KEYWORDS = [
  'hi', 'hello', 'hey', 'greetings', 'start', 'help', 'yo', 'sup',
  'good morning', 'good afternoon', 'good evening', 'hola', 'howdy'
];

export function analyzeQuery(query: string): QueryAnalysis {
  const norm = query.toLowerCase().trim();

  // Check for exact matches or starts-with to avoid false positives
  // e.g. "High voltage" shouldn't trigger "Hi"
  if (GREETING_KEYWORDS.some(k => norm === k || norm.startsWith(k + ' '))) {
    return { intent: QueryIntent.GREETING, originalQuery: query };
  }

  return { intent: QueryIntent.DETAILS, originalQuery: query };
}