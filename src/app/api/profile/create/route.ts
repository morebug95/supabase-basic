import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    // Get the user ID from the request body (sent by client)
    const requestData = await request.json().catch(() => ({}));

    // Get the current user from session (trying both approaches)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Use the user ID from the request if provided, otherwise try to get it from the session
    const userId = requestData.userId || session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          error: "No user ID provided and no session found",
          details:
            "Please provide a userId in the request body or ensure you're authenticated",
        },
        { status: 401 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "Resource not found" which is expected if profile doesn't exist
      return NextResponse.json(
        {
          error: "Error checking for existing profile",
          details: checkError.message,
        },
        { status: 500 }
      );
    }

    if (existingProfile) {
      return NextResponse.json({
        message: "Profile already exists",
        profile: existingProfile,
      });
    }

    // Create a profile for the user
    // Use the email from the session if available, otherwise use a default username
    const userEmail = session?.user?.email || requestData.email || null;
    const username = userEmail
      ? userEmail.split("@")[0]
      : `user_${userId.substring(0, 8)}`;

    const { data: profile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username: username,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Handle insertion errors
    if (insertError) {
      console.error("Error creating profile:", insertError);

      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            error: "Profile already exists",
            details: insertError.message,
          },
          { status: 400 }
        );
      }

      if (insertError.code === "42P01") {
        return NextResponse.json(
          {
            error: "Table does not exist",
            details:
              "The profiles table does not exist. Please create it using the SQL provided.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to create profile",
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile created successfully",
      profile,
    });
  } catch (err) {
    console.error("Exception creating profile:", err);
    return NextResponse.json(
      {
        error: "Failed to create profile",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
