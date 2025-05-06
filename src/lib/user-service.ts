import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at?: string;
}

export async function getCurrentUser() {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting session:", sessionError);
      return null;
    }

    if (!session?.user) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

/**
 * Ensures the user's session is properly stored and refresh token is working
 * Call this after login to make sure the session is properly persisted
 */
export async function ensureUserSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return false;
    }

    // Trigger a token refresh to ensure tokens are working properly
    const { error } = await supabase.auth.refreshSession();

    if (error) {
      console.error("Error refreshing session:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error ensuring user session:", error);
    return false;
  }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function createOrUpdateProfile(profile: Partial<UserProfile>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No user logged in");

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function createUserProfile(userId: string, username?: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !userId) {
    throw new Error("No user logged in and no user ID provided");
  }

  // Use the provided ID or get it from the current session
  const id = userId || user!.id;

  // Check if profile already exists
  const { data: existingProfile, error: checkError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", id)
    .single();

  if (existingProfile) {
    return existingProfile; // Profile already exists
  }

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "not found" which is expected
    throw checkError;
  }

  // Generate a username if not provided
  let profileUsername = username;
  if (!profileUsername) {
    if (user?.email) {
      profileUsername = user.email.split("@")[0];
    } else {
      profileUsername = `user_${id.substring(0, 8)}`;
    }
  }

  // Create the profile
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id,
      username: profileUsername,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
