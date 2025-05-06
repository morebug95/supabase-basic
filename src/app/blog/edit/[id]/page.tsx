"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBlogPostById, updateBlogPost, BlogPost } from "@/lib/blog-service";
import { getCurrentUser } from "@/lib/user-service";

export default function EditBlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          // Redirect to login if not authenticated
          router.push("/login");
          return;
        }

        const blogPost = await getBlogPostById(params.id);

        // Only the post owner can edit
        if (blogPost.user_id !== user.id) {
          router.push(`/blog/${params.id}`);
          return;
        }

        setPost(blogPost);
        setTitle(blogPost.title);
        setContent(blogPost.content);
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
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!title.trim()) {
        throw new Error("Title is required");
      }

      if (!content.trim()) {
        throw new Error("Content is required");
      }

      await updateBlogPost(params.id, {
        title: title.trim(),
        content: content.trim(),
      });

      // Redirect to blog post view after successful update
      router.push(`/blog/${params.id}`);
    } catch (error) {
      console.error("Failed to update blog post", error);
      setError(
        error instanceof Error ? error.message : "Failed to update blog post"
      );
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/blog" className="text-blue-600 hover:underline">
              &larr; Back to Blog
            </Link>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/blog/${params.id}`}
            className="text-blue-600 hover:underline"
          >
            &larr; Back to Post
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter blog post title"
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your blog post content here..."
              disabled={saving}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <Link
              href={`/blog/${params.id}`}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
