import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "You must be logged in to register a team." },
      { status: 401 }
    );
  }

  const { data: captainProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id) // The user.id matches the profile id
    .single();

  if (!captainProfile) {
    return NextResponse.json(
      { ok: false, error: "Captain profile not found. Please complete your profile first." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { eventId, name, memberEmails } = body;

    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: name,
        eventId: eventId,
        captainId: user.id,
      })
      .select()
      .single();
    
    if (memberEmails && memberEmails.length > 0) {
      const membersToInsert = memberEmails.map((email: string) => ({
        teamId: teamData.id,
        memberId: email, // Directly saving the email
      }));

      const { error: membersError } = await supabase
        .from("team_members")
        .insert(membersToInsert);

      if (membersError) {
        console.error("Members Add Error:", membersError);
      }
    }

    return NextResponse.json({
      ok: true,
      data: { teamId: teamData.id },
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}