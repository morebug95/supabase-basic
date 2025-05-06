import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Get the current user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json(
        { error: "Authentication error", details: sessionError.message },
        { status: 401 }
      );
    }

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "You must be logged in to check profile status",
          hasProfile: false,
        },
        { status: 401 }
      );
    }

    // Check if profile exists
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", session.user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // PGRST116 is "Resource not found"
        return NextResponse.json({ hasProfile: false });
      }

      console.error("Error checking profile:", error);
      return NextResponse.json(
        { error: "Error checking profile", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasProfile: true,
      profile: data,
    });
  } catch (err) {
    console.error("Exception checking profile:", err);
    return NextResponse.json(
      {
        error: "Failed to check profile",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
