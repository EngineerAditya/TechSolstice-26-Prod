export enum QueryIntent {
  DETAILS = 'details',       // "When is it?", "Cost?", "Venue?"
  RULES = 'rules',           // "Is there a team size limit?", "Format?"
  GENERAL_INFO = 'general',  // "WiFi password", "Where is the washroom?"
  GREETING = 'greeting',     // "Hi", "Hello"
  UNKNOWN = 'unknown'
}

export interface QueryAnalysis {
  intent: QueryIntent;
  originalQuery: string;
}

const RULE_KEYWORDS = [
  'rule', 'format', 'allow', 'banned', 'forbidden', 'instruction',
  'guide', 'judge', 'criteria', 'team size', 'limit', 'round', 'qualif'
];

const GENERAL_KEYWORDS = [
  'wifi', 'internet', 'password', 'food', 'canteen', 'washroom',
  'toilet', 'restroom', 'parking', 'bus', 'transport', 'cab',
  'certificate', 'accommodation', 'sleep', 'hotel'
];

const GREETING_KEYWORDS = [
  'hi', 'hello', 'hey', 'greetings', 'start', 'help'
];

export function analyzeQuery(query: string): QueryAnalysis {
  const norm = query.toLowerCase().trim();

  if (GREETING_KEYWORDS.includes(norm)) {
    return { intent: QueryIntent.GREETING, originalQuery: query };
  }

  if (GENERAL_KEYWORDS.some(k => norm.includes(k))) {
    return { intent: QueryIntent.GENERAL_INFO, originalQuery: query };
  }

  if (RULE_KEYWORDS.some(k => norm.includes(k))) {
    return { intent: QueryIntent.RULES, originalQuery: query };
  }

  // Default to DETAILS so "When is it" falls through to context logic
  return { intent: QueryIntent.DETAILS, originalQuery: query };
}