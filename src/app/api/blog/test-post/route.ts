import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    // Get user ID from the request body if provided
    const requestData = await request.json().catch(() => ({}));
    const providedUserId = requestData.userId;

    // Get user ID from the session as a fallback
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Use provided ID or session ID
    const userId = providedUserId || session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          error: "No user ID available",
          details:
            "You must be logged in to create a post or provide a userId in the request body",
        },
        { status: 401 }
      );
    }

    // Check if user has a profile
    const { error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        // Profile not found
        return NextResponse.json(
          {
            error: "Profile not found",
            details:
              "You must create a profile before creating blog posts. Go to the Dashboard and click 'Create Profile'.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Error checking profile", details: profileError.message },
        { status: 500 }
      );
    }

    // Create a test post
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title: "Test Blog Post",
        content:
          "This is a test blog post created via the API to verify your Supabase setup is working correctly.",
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating test blog post:", error);

      if (error.code === "42P01") {
        return NextResponse.json(
          {
            error: "Table does not exist",
            details:
              "The blog_posts table does not exist. Please create it using the SQL provided.",
            sqlError: error.message,
          },
          { status: 500 }
        );
      }

      // Foreign key constraint error
      if (error.code === "23503") {
        return NextResponse.json(
          {
            error: "Foreign key constraint violated",
            details:
              "Make sure you have created a profile for your user before creating a post.",
            sqlError: error.message,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Test post created successfully",
      post: data,
    });
  } catch (err) {
    console.error("Exception creating test blog post:", err);
    return NextResponse.json(
      {
        error: "Failed to create test blog post",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
