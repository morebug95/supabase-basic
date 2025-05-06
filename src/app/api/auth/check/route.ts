import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json(
        {
          error: "Authentication session error",
          details: sessionError.message,
          isLoggedIn: false,
        },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json({
        isLoggedIn: false,
        message: "No active session found",
      });
    }

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        lastSignInAt: session.user.last_sign_in_at,
      },
    });
  } catch (err) {
    console.error("Exception checking authentication:", err);
    return NextResponse.json(
      {
        error: "Failed to check authentication status",
        details: err instanceof Error ? err.message : String(err),
        isLoggedIn: false,
      },
      { status: 500 }
    );
  }
}
