import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { rateLimiter } from '@/lib/chatbot/rate-limiter';
import { formatEventDetails } from '@/lib/chatbot/formatter'; // Ensure this file exists from previous step

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let sessionId = 'unknown'; // Default if extraction fails
  const supabase = await createClient();

  try {
    const body = await req.json();
    const message = body.message;
    sessionId = body.sessionId || 'unknown';

    // 1. Rate Limit
    if (!rateLimiter.checkLimit(sessionId).allowed) {
      return NextResponse.json({ response: "You're typing too fast! Give me a minute." }, { status: 429 });
    }

    if (!message) return NextResponse.json({ response: "Please say something!" });

    // 2. LOGGING (Awaited to ensure it works)
    // We log the raw message immediately.
    const logPromise = supabase.from('query_logs').insert({
      session_id: sessionId,
      query_text: message,
      source: 'incoming'
    });

    // 3. THE LOOKUP (Database First)
    // We pass the raw message "whn is meme tech" directly to Postgres.
    const { data: eventMatches, error: searchError } = await supabase.rpc(
      'search_events_fuzzy',
      { search_query: message }
    );

    if (searchError) {
      console.error("DB Search Error:", searchError);
      throw new Error("Database search failed");
    }

    // 4. DECISION LOGIC
    // Did we find an event?
    if (eventMatches && eventMatches.length > 0) {
      const match = eventMatches[0];

      // FETCH FULL DETAILS
      // The fuzzy search returns minimal data. Now we get the full row for the "Perfect Answer".
      const { data: fullEvent } = await supabase
        .from('events')
        .select('*')
        .eq('id', match.id)
        .single();

      if (fullEvent) {
        // Mark log as successful lookup
        await supabase.from('query_logs').insert({
          session_id: sessionId,
          query_text: message,
          intent: 'event_lookup',
          source: `match: ${fullEvent.name}`
        });

        // Return the Professional Guide response
        // New
        return NextResponse.json({ response: formatEventDetails(fullEvent, message) });
      }
    }

    // 5. NO EVENT FOUND?
    // This is where "whn is meme tech" succeeds (caught above), but "Rules for library" fails.
    // For now, since you want to perfect Event Lookup first, we return a helpful failure message.

    await logPromise; // Ensure the initial log is saved

    // Check if it's a "Next Event" query (simple regex still useful here)
    if (message.toLowerCase().includes('next') || message.toLowerCase().includes('now')) {
      // ... (Add your 'Next Event' logic here if desired, or keep it simple for now)
    }

    return NextResponse.json({
      response: "I couldn't find an event with that name. I can tell you about any event in the schedule—just ask!"
    });

  } catch (e: any) {
    console.error("Server Error:", e);
    // Log the error
    await supabase.from('query_logs').insert({
      session_id: sessionId,
      query_text: "ERROR_TRACE",
      source: e.message
    });

    return NextResponse.json({
      response: "I'm having trouble accessing the schedule right now. Please try again."
    }, { status: 500 });
  }
}