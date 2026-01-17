import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { rateLimiter } from '@/lib/chatbot/rate-limiter';
import { formatEventDetails } from '@/lib/chatbot/formatter';
import { analyzeQuery, QueryIntent } from '@/lib/chatbot/analyzer';

export const runtime = 'nodejs';

// 1. DEFINE STOP WORDS
// If the user says these, they are asking for *attributes*, not *event names*.
// We remove these before searching the DB to prevent false positives.
const SEARCH_STOP_WORDS = [
  'what', 'is', 'the', 'prize', 'pool', 'money', 'cost', 'fee', 'register',
  'registration', 'venue', 'location', 'where', 'when', 'time', 'date',
  'schedule', 'team', 'size', 'limit', 'members', 'rules', 'format',
  'about', 'details', 'tell', 'me', 'how', 'much', 'many'
];

function cleanSearchQuery(raw: string): string {
  const lower = raw.toLowerCase();
  // Remove special characters
  const words = lower.replace(/[^\w\s]/gi, '').split(/\s+/);

  // Filter out stop words
  const keywords = words.filter(w => !SEARCH_STOP_WORDS.includes(w));

  return keywords.join(' ').trim();
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  let sessionId = 'unknown';

  try {
    const body = await req.json();
    const { message } = body;
    const lastEventContext = body.activeContext || null;
    sessionId = body.sessionId || 'unknown';

    // Rate Limit & Logging...
    if (!rateLimiter.checkLimit(sessionId).allowed) {
      return NextResponse.json({ response: "You're typing too fast!" }, { status: 429 });
    }
    await supabase.from('query_logs').insert({ session_id: sessionId, query_text: message, source: 'incoming' });

    const analysis = analyzeQuery(message);

    if (analysis.intent === QueryIntent.GREETING) {
      return NextResponse.json({
        response: "Hello! I can help you with event details. What would you like to know?",
        context: lastEventContext
      });
    }

    // 4. THE SMARTER LOOKUP STRATEGY
    let targetedEvent = null;

    // STEP A: Clean the Query
    // "what is the prize" -> "" (Empty string)
    // "prize for robo wars" -> "robo wars"
    const cleanedQuery = cleanSearchQuery(message);

    // STEP B: Search ONLY if we have actual keywords left
    if (cleanedQuery.length > 2) {
      // Only search if we have meaningful words (length check prevents searching "ai" or "go")
      const { data: eventMatches } = await supabase.rpc(
        'search_events_fuzzy',
        { search_query: cleanedQuery } // <--- Search with CLEAN query
      );

      if (eventMatches && eventMatches.length > 0) {
        targetedEvent = eventMatches[0];
      }
    }

    // STEP C: Context Fallback
    // If we didn't find a targeted event (or skipped search because query was empty)
    // AND we have memory, assume they want details on the active event.
    if (!targetedEvent && lastEventContext && analysis.intent !== QueryIntent.GENERAL_INFO) {
      console.log(`Using Context: ${lastEventContext}`);

      const { data: contextMatch } = await supabase
        .from('events')
        .select('*')
        .ilike('name', lastEventContext)
        .single();

      if (contextMatch) targetedEvent = contextMatch;
    }

    // 5. FETCH AND FORMAT
    if (targetedEvent) {
      const { data: fullEvent } = await supabase
        .from('events')
        .select('*')
        .eq('id', targetedEvent.id)
        .single();

      if (fullEvent) {
        return NextResponse.json({
          response: formatEventDetails(fullEvent, message), // Pass original message for intent formatting
          context: fullEvent.name
        });
      }
    }

    // 6. FAILURE
    return NextResponse.json({
      response: "I couldn't find that event. Try asking about a specific event like 'Robowars'!",
      context: lastEventContext
    });

  } catch (e: any) {
    console.error("Server Error:", e);
    return NextResponse.json({ response: "System error." }, { status: 500 });
  }
}