import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateEmbedding } from '@/lib/chatbot/gemini-client';

// PROTECT THIS ROUTE IN PRODUCTION
export async function GET() {
  const supabase = await createClient();

  // 1. Define your Static Knowledge here
  const RULES = [
    "General: All participants must carry their college ID cards at all times.",
    "Wi-Fi: Free Wi-Fi is available at the Main Hall using the SSID 'TechSolstice_Guest'. Password is 'solstice2026'.",
    "Food: Lunch is provided for all registered participants at the Canteen between 12:30 PM and 2:00 PM.",
    "Certificates: Participation certificates will be emailed within 48 hours after the fest concludes.",
    "Parking: Two-wheeler parking is available near the North Gate. No four-wheeler parking inside campus.",
    "Registration: On-spot registration closes at 10:00 AM each day.",
  ];

  const results = [];

  for (const text of RULES) {
    // Generate embedding
    const embedding = await generateEmbedding(text);

    // Insert into DB
    const { error } = await supabase.from('knowledge_base').insert({
      content: text,
      embedding: embedding,
      metadata: { type: 'general_rule' }
    });

    if (error) {
      results.push({ text: text.substring(0, 20) + '...', status: 'error', error: error.message });
    } else {
      results.push({ text: text.substring(0, 20) + '...', status: 'success' });
    }
  }

  return NextResponse.json({
    message: "Seeding complete",
    results
  });
}