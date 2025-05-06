"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createUserProfile } from "@/lib/user-service";
import { createTestBlogPost } from "@/lib/blog-service";

// Define proper types for the auth status objects
interface AuthUser {
  id: string;
  email?: string;
}

interface DirectCheck {
  isLoggedIn: boolean;
  user: AuthUser | null;
}

interface ApiCheck {
  isLoggedIn: boolean;
  user?: {
    id: string;
    email?: string;
  };
  message?: string;
  error?: string;
}

interface AuthStatus {
  directCheck?: DirectCheck;
  apiCheck?: ApiCheck;
  error?: string;
}

interface ProfileStatus {
  hasProfile?: boolean;
  profile?: {
    id: string;
    username: string;
  };
  error?: string;
}

export default function AuthTestPage() {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(
    null
  );
  const [profileLoading, setProfileLoading] = useState(true);
  const [actionResult, setActionResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        // Direct supabase check
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // API endpoint check
        const response = await fetch("/api/auth/check");
        const apiStatus = await response.json();

        setAuthStatus({
          directCheck: {
            isLoggedIn: !!session,
            user: session?.user
              ? {
                  id: session.user.id,
                  email: session.user.email,
                }
              : null,
          },
          apiCheck: apiStatus,
        });
      } catch (error) {
        console.error("Error checking auth:", error);
        setAuthStatus({
          error:
            error instanceof Error
              ? error.message
              : "Failed to check authentication",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Check profile status
  useEffect(() => {
    const checkProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await fetch("/api/user/has-profile");
        const data = await response.json();
        setProfileStatus(data);
      } catch (error) {
        console.error("Error checking profile:", error);
        setProfileStatus({
          error:
            error instanceof Error ? error.message : "Failed to check profile",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    checkProfile();
  }, []);

  const handleCreateProfile = async () => {
    try {
      setActionResult(null);

      // Get the current user ID
      const userId = authStatus?.directCheck?.user?.id;

      if (!userId) {
        throw new Error("No user ID available. Please sign in first.");
      }

      // Use direct method instead of API
      await createUserProfile(userId);

      setActionResult({
        type: "success",
        message: "Profile created successfully!",
      });

      // Refresh profile status
      const profileResponse = await fetch("/api/user/has-profile");
      const profileData = await profileResponse.json();
      setProfileStatus(profileData);
    } catch (error) {
      console.error("Error creating profile:", error);
      setActionResult({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to create profile",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      setActionResult(null);
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setActionResult({
        type: "success",
        message: "Signed out successfully!",
      });

      // Refresh auth status
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setAuthStatus({
        directCheck: {
          isLoggedIn: !!session,
          user: session?.user
            ? {
                id: session.user.id,
                email: session.user.email,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
      setActionResult({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to sign out",
      });
    }
  };

  const handleCreateTestPost = async () => {
    try {
      setActionResult(null);

      // Get the current user ID
      const userId = authStatus?.directCheck?.user?.id;

      if (!userId) {
        throw new Error("No user ID available. Please sign in first.");
      }

      // Create test post directly
      await createTestBlogPost(userId);

      setActionResult({
        type: "success",
        message: "Test post created successfully!",
      });
    } catch (error) {
      console.error("Error creating test post:", error);
      setActionResult({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to create test post",
      });
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Authentication Test Page</h1>
          <div className="flex space-x-4">
            <Link href="/blog" className="text-blue-600 hover:underline">
              Back to Blog
            </Link>
          </div>
        </div>

        {actionResult && (
          <div
            className={`${
              actionResult.type === "success"
                ? "bg-green-50 border-green-500"
                : "bg-red-50 border-red-500"
            } border-l-4 p-4 mb-6`}
          >
            <p
              className={
                actionResult.type === "success"
                  ? "text-green-700"
                  : "text-red-700"
              }
            >
              {actionResult.message}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>

          {loading ? (
            <p>Checking authentication status...</p>
          ) : (
            <div>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(authStatus, null, 2)}
              </pre>

              <div className="mt-4 flex space-x-4">
                {authStatus?.directCheck?.isLoggedIn ? (
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Go to Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Status</h2>

          {profileLoading ? (
            <p>Checking profile status...</p>
          ) : (
            <div>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(profileStatus, null, 2)}
              </pre>

              {authStatus?.directCheck?.isLoggedIn &&
                !profileStatus?.hasProfile && (
                  <div className="mt-4">
                    <button
                      onClick={handleCreateProfile}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Create Profile
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>

          <div className="space-y-4">
            <div>
              <Link
                href="/blog/dashboard"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
              <p className="mt-1 text-sm text-gray-500">
                Test if you can access the dashboard with your current
                authentication state.
              </p>
            </div>

            <div>
              <Link
                href="/blog/create"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Blog Post
              </Link>
              <p className="mt-1 text-sm text-gray-500">
                Test if you can create a blog post with your current
                authentication state.
              </p>
            </div>

            {authStatus?.directCheck?.isLoggedIn && (
              <div>
                <button
                  onClick={handleCreateTestPost}
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Create Test Post Directly
                </button>
                <p className="mt-1 text-sm text-gray-500">
                  Test creating a post using the direct client method.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
