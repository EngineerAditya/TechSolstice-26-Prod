import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { rateLimiter } from '@/lib/chatbot/rate-limiter';
import { formatEventDetails } from '@/lib/chatbot/formatter';
import { analyzeQuery, QueryIntent } from '@/lib/chatbot/analyzer';

export const runtime = 'nodejs';

// Fallback message
const FALLBACK_MESSAGE = `I couldn't find that event in my schedule.
For specific inquiries, please reach out to our Outreach Team:
**Mahek Sethi**: +91 98219 01461
**Samaira Malik**: +91 84462 03821`;

// WORDS THAT INDICATE A FOLLOW-UP (Not a new search)
const GENERIC_WORDS = new Set([
  'what', 'when', 'where', 'who', 'how', 'is', 'are', 'the', 'a', 'an',
  'it', 'this', 'that', 'event', 'details', 'about', 'tell', 'me', 'know',
  'prize', 'pool', 'money', 'cost', 'fee', 'team', 'size', 'limit',
  'venue', 'location', 'place', 'time', 'date', 'schedule', 'register',
  'registration', 'rules', 'format', 'contacts', 'contact'
]);

function isFollowUpQuestion(message: string): boolean {
  const lower = message.toLowerCase();
  const words = lower.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 0);
  return words.every(w => GENERIC_WORDS.has(w));
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  let sessionId = 'unknown';

  try {
    const body = await req.json();
    const { message } = body;
    const lastEventContext = body.activeContext || null;
    sessionId = body.sessionId || 'unknown';

    // 1. SAFETY CHECKS
    if (!rateLimiter.checkLimit(sessionId).allowed) {
      return NextResponse.json({ response: "You're typing too fast! Give me a minute." }, { status: 429 });
    }
    await supabase.from('query_logs').insert({ session_id: sessionId, query_text: message, source: 'incoming' });

    // 2. GREETING CHECK (Fast Exit)
    // This runs BEFORE the database search, so "Hi" returns immediately.
    const analysis = analyzeQuery(message);
    if (analysis.intent === QueryIntent.GREETING) {
      const greetings = [
        "Hello! I'm Spark. Ask me about any TechSolstice event!",
        "Hi there! Ready to explore the schedule?",
        "Hey! I can help you with event details, venues, and times."
      ];
      return NextResponse.json({
        response: greetings[Math.floor(Math.random() * greetings.length)],
        context: lastEventContext // Keep memory intact
      });
    }

    // 3. DECIDE STRATEGY
    let targetedEvent = null;
    const isFollowUp = isFollowUpQuestion(message);

    // STRATEGY A: Direct Search
    // Skip if it's just "When is it?" to avoid matching random events.
    if (!isFollowUp) {
      const { data: eventMatches } = await supabase.rpc(
        'search_events_fuzzy',
        { search_query: message }
      );

      if (eventMatches && eventMatches.length > 0) {
        targetedEvent = eventMatches[0];
      }
    }

    // STRATEGY B: Context Fallback
    if (!targetedEvent && lastEventContext) {
      const { data: contextMatch } = await supabase
        .from('events')
        .select('*')
        .ilike('name', lastEventContext)
        .single();

      if (contextMatch) {
        targetedEvent = contextMatch;
      }
    }

    // 4. SUCCESS RESPONSE
    if (targetedEvent) {
      const { data: fullEvent } = await supabase
        .from('events')
        .select('*')
        .eq('id', targetedEvent.id)
        .single();

      if (fullEvent) {
        await supabase.from('query_logs').insert({
          session_id: sessionId,
          query_text: message,
          source: `match: ${fullEvent.name}`
        });

        return NextResponse.json({
          response: formatEventDetails(fullEvent, message),
          context: fullEvent.name
        });
      }
    }

    // 5. FAILURE RESPONSE
    return NextResponse.json({
      response: FALLBACK_MESSAGE,
      context: lastEventContext
    });

  } catch (e: any) {
    console.error("Server Error:", e);
    return NextResponse.json({ response: "System error. Please try again later." }, { status: 500 });
  }
}