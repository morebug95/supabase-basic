"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser, createUserProfile } from "@/lib/user-service";
import {
  getUserBlogPosts,
  deleteBlogPost,
  createTestBlogPost,
} from "@/lib/blog-service";
import { formatDate } from "@/lib/utils";
import { User } from "@supabase/supabase-js";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function BlogDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Get the current user
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (!currentUser) {
          setError("You must be logged in to view your dashboard");
          setLoading(false);
          return;
        }

        // Get the user's blog posts
        const userPosts = await getUserBlogPosts(currentUser.id);
        setPosts(userPosts);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load your blog posts");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleCreateProfile = async () => {
    if (!user) {
      setActionResult({
        type: "error",
        message: "You must be logged in to create a profile",
      });
      return;
    }

    try {
      // Use the direct method
      await createUserProfile(user.id);

      setActionResult({
        type: "success",
        message: "Profile created successfully!",
      });

      // Reload the page to reflect the changes
      window.location.reload();
    } catch (error) {
      console.error("Error creating profile:", error);
      setActionResult({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to create profile",
      });
    }
  };

  const handleCreateTestPost = async () => {
    if (!user) {
      setActionResult({
        type: "error",
        message: "You must be logged in to create a post",
      });
      return;
    }

    try {
      // Use direct method instead of API call
      await createTestBlogPost(user.id);

      // Reload posts
      const userPosts = await getUserBlogPosts(user.id);
      setPosts(userPosts);

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

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deleteBlogPost(postId);
      setPosts(posts.filter((post) => post.id !== postId));
      setActionResult({
        type: "success",
        message: "Post deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting post:", error);
      setActionResult({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete post",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-center">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Dashboard</h1>
          <div className="flex space-x-4">
            <Link href="/blog" className="text-blue-600 hover:underline">
              Back to Blog
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

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

        {user && (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <p>
              <strong>User ID:</strong> {user.id}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={handleCreateTestPost}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Test Post
              </button>
              <button
                onClick={handleCreateProfile}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Create Profile
              </button>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Blog Posts</h2>

          {posts.length === 0 ? (
            <p className="text-gray-500">
              You haven&apos;t created any blog posts yet.
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border-b pb-4 mb-4 last:border-0">
                  <h3 className="text-lg font-medium">{post.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Created on {formatDate(post.created_at)}
                  </p>
                  <div className="flex space-x-4">
                    <Link
                      href={`/blog/${post.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/blog/edit/${post.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
          <div className="text-sm">
            <p>
              <strong>Supabase URL:</strong>{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not available"}
            </p>
            <p>
              <strong>Connected:</strong> {user ? "Yes" : "No"}
            </p>
            <p>
              <strong>Posts Count:</strong> {posts.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
