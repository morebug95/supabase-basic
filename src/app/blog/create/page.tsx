"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/user-service";
import CreateBlogPost from "@/app/components/CreateBlogPost";

export default function CreateBlogPostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();

        if (!user) {
          // Redirect to login if not authenticated
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to check authentication", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/blog" className="text-blue-600 hover:underline">
            &larr; Back to Blog
          </Link>
        </div>

        <CreateBlogPost />
      </div>
    </div>
  );
}
