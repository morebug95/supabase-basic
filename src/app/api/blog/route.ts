import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Get blog posts without trying to join with profiles
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blog posts:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return posts without username information
    return NextResponse.json({ posts: data || [] });
  } catch (err) {
    console.error("Exception fetching blog posts:", err);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
