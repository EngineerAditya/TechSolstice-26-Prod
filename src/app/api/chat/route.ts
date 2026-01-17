import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { rateLimiter } from '@/lib/chatbot/rate-limiter';
import { formatEventDetails } from '@/lib/chatbot/formatter';
import { analyzeQuery, QueryIntent } from '@/lib/chatbot/analyzer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  let sessionId = 'unknown';

  try {
    const body = await req.json();
    const { message } = body;
    // Receive the memory from the client
    const lastEventContext = body.activeContext || null;
    sessionId = body.sessionId || 'unknown';

    // 1. Rate Limit
    if (!rateLimiter.checkLimit(sessionId).allowed) {
      return NextResponse.json({ response: "You're typing too fast! Give me a minute." }, { status: 429 });
    }

    // 2. Logging
    await supabase.from('query_logs').insert({
      session_id: sessionId,
      query_text: message,
      source: 'incoming'
    });

    // 3. Analyze Intent (Is it a greeting? general info? or event details?)
    const analysis = analyzeQuery(message);

    // If it's a greeting, return early
    if (analysis.intent === QueryIntent.GREETING) {
      return NextResponse.json({
        response: "Hello! I can help you with event details, schedules, and venues. What would you like to know?",
        context: lastEventContext // Keep existing context
      });
    }

    // 4. THE LOOKUP STRATEGY
    let targetedEvent = null;

    // STRATEGY A: Direct Fuzzy Search
    // We try this FIRST. If the user says "Robowars", this returns a hit.
    // If the user says "When is it", this likely returns nothing or low-score garbage.
    const { data: eventMatches } = await supabase.rpc(
      'search_events_fuzzy',
      { search_query: message }
    );

    // Check if we got a GOOD match. 
    // You might want to adjust logic: if the user says "when is it", fuzzy search might match "Internet" (bad).
    // But usually, short stopwords like "it" don't match event names well.
    if (eventMatches && eventMatches.length > 0) {
      targetedEvent = eventMatches[0];
    }

    // STRATEGY B: Context Fallback
    // If Direct Search failed (no results), AND we have memory, AND the user isn't asking about WiFi...
    // ...Then we assume "it" refers to the memory.
    else if (lastEventContext && analysis.intent !== QueryIntent.GENERAL_INFO) {
      console.log(`Search failed. Falling back to context: ${lastEventContext}`);

      const { data: contextMatch } = await supabase
        .from('events')
        .select('*') // Get everything needed for the formatter
        .ilike('name', lastEventContext) // Match the name stored in memory
        .single();

      if (contextMatch) {
        targetedEvent = contextMatch;
      }
    }

    // 5. FETCH AND FORMAT
    if (targetedEvent) {
      // If we only have the partial data from RPC, fetch full row now
      // (Optimization: if Strategy B ran, we already have full row, but this is safe)
      const { data: fullEvent } = await supabase
        .from('events')
        .select('*')
        .eq('id', targetedEvent.id)
        .single();

      if (fullEvent) {
        // Return the formatted response AND the new context name
        return NextResponse.json({
          response: formatEventDetails(fullEvent, message),
          context: fullEvent.name
        });
      }
    }

    // 6. FAILURE HANDLING
    return NextResponse.json({
      response: "I couldn't find that event. Try asking about a specific event like 'Robowars'!",
      context: lastEventContext // Don't wipe memory on failure, keep it.
    });

  } catch (e: any) {
    console.error("Server Error:", e);
    return NextResponse.json({ response: "System error." }, { status: 500 });
  }
}