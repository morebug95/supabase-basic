"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBlogPostById, BlogPost, deleteBlogPost } from "@/lib/blog-service";
import { getCurrentUser } from "@/lib/user-service";
import { formatDate } from "@/lib/utils";

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const blogPost = await getBlogPostById(params.id);
        setPost(blogPost);

        const user = await getCurrentUser();
        if (user && blogPost.user_id === user.id) {
          setIsOwner(true);
        }
      } catch (error) {
        console.error("Failed to load blog post", error);
        setError(
          "Failed to load blog post. It may have been deleted or does not exist."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      setIsDeleting(true);
      try {
        await deleteBlogPost(params.id);
        router.push("/blog");
      } catch (error) {
        console.error("Failed to delete post", error);
        alert("Failed to delete post");
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading blog post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/blog" className="text-blue-600 hover:underline">
              &larr; Back to Blog
            </Link>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error || "Blog post not found"}</p>
          </div>
        </div>
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

        <article className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span>By User ID: {post.user_id.substring(0, 8)}... • </span>
            <span>{formatDate(post.created_at)}</span>
            {post.updated_at && post.updated_at !== post.created_at && (
              <span> • Updated on {formatDate(post.updated_at)}</span>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8 whitespace-pre-wrap">
            {post.content}
          </div>

          {isOwner && (
            <div className="flex space-x-4">
              <Link
                href={`/blog/edit/${post.id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit
              </Link>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
