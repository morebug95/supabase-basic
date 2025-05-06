"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/user-service";
import BlogList from "../components/BlogList";

export default function BlogPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        setIsLoggedIn(!!user);
      } catch (error) {
        console.error("Failed to check authentication", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Posts</h1>

          <div className="flex space-x-4">
            <Link href="/" className="text-blue-600 hover:underline">
              Home
            </Link>

            {isLoggedIn && (
              <>
                <Link
                  href="/blog/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create Post
                </Link>
                <Link
                  href="/blog/dashboard"
                  className="text-blue-600 hover:underline"
                >
                  Dashboard
                </Link>
                <Link
                  href="/blog/tests"
                  className="text-blue-600 hover:underline"
                >
                  Test
                </Link>
                <Link
                  href="/auth-test"
                  className="text-blue-600 hover:underline"
                >
                  Auth Test
                </Link>
              </>
            )}

            {!isLoggedIn && !isLoading && (
              <Link href="/login" className="text-blue-600 hover:underline">
                Login to Create Posts
              </Link>
            )}
          </div>
        </div>

        <BlogList />
      </div>
    </div>
  );
}
