import { supabase } from "./supabase";

export interface BlogPost {
  id?: string;
  title: string;
  content: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export async function createBlogPost(
  blogPost: Omit<BlogPost, "id" | "created_at" | "updated_at">
) {
  if (!blogPost.user_id) {
    throw new Error("User ID is required to create a blog post");
  }

  // First check if the user has a profile
  const { error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", blogPost.user_id)
    .single();

  if (profileError) {
    if (profileError.code === "PGRST116") {
      // Create a profile if it doesn't exist
      try {
        await supabase.from("profiles").insert({
          id: blogPost.user_id,
          username: `user_${blogPost.user_id.substring(0, 8)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Failed to create profile:", err);
        throw new Error("You must create a profile before creating blog posts");
      }
    } else {
      throw profileError;
    }
  }

  // Now create the blog post
  const { data, error } = await supabase
    .from("blog_posts")
    .insert(blogPost)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBlogPosts() {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getBlogPostById(id: string) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserBlogPosts(userId: string) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateBlogPost(
  id: string,
  updates: Partial<Omit<BlogPost, "id" | "user_id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("blog_posts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBlogPost(id: string) {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) throw error;
  return true;
}

export async function createTestBlogPost(userId: string) {
  const { error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (profileError) {
    if (profileError.code === "PGRST116") {
      throw new Error("You must create a profile before creating blog posts");
    }
    throw profileError;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: "Test Blog Post",
      content:
        "This is a test blog post created directly to verify your Supabase setup is working correctly.",
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23503") {
      throw new Error(
        "Foreign key constraint violated. Make sure you have created a profile for your user."
      );
    }
    throw error;
  }

  return data;
}
