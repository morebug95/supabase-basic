"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function TestBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        console.log("Fetching posts from Supabase...");

        // Direct query to the blog_posts table without joining with profiles
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        console.log("Posts fetched:", data);
        setPosts(data || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(
          "Failed to load blog posts. Please check your console for details."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Posts Test Page</h1>
          <Link href="/blog" className="text-blue-600 hover:underline">
            Back to Blog
          </Link>
        </div>

        {loading && <p className="text-center py-4">Loading blog posts...</p>}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p className="text-yellow-700">
              No blog posts found. Make sure you&apos;ve created the blog_posts
              table and added some data.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Check that your Supabase URL and Anon Key are correct:
              <br />
              URL:{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set in environment"}
            </p>
          </div>
        )}

        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4"
          >
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <div className="text-sm text-gray-500 mb-4">
              <span>By User ID: {post.user_id.substring(0, 8)}... • </span>
              <span>{formatDate(post.created_at)}</span>
            </div>
            <div className="prose max-w-none">
              {post.content.length > 200
                ? `${post.content.substring(0, 200)}...`
                : post.content}
            </div>
            <div className="mt-4">
              <Link
                href={`/blog/${post.id}`}
                className="text-blue-600 hover:underline"
              >
                Read more
              </Link>
            </div>
          </div>
        ))}

        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Debug Information</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Supabase URL:{" "}
            {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not available"}
            <br />
            Table: blog_posts
            <br />
            Connected: {!error ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </div>
  );
}
