import { useState } from "react";
import Link from "next/link";
import { BlogPost } from "@/lib/blog-service";
import { formatDate } from "@/lib/utils";

interface BlogPostProps {
  post: BlogPost & {
    profiles?: {
      username: string;
    };
  };
  isOwner?: boolean;
  onDelete?: (id: string) => void;
}

export default function BlogPostComponent({
  post,
  isOwner = false,
  onDelete,
}: BlogPostProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      setIsDeleting(true);
      try {
        if (onDelete) {
          await onDelete(post.id as string);
        }
      } catch (error) {
        console.error("Failed to delete post", error);
        alert("Failed to delete post");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        <Link
          href={`/blog/${post.id}`}
          className="hover:text-blue-600 dark:hover:text-blue-400"
        >
          {post.title}
        </Link>
      </h2>

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {post.profiles?.username && <span>By {post.profiles.username} • </span>}
        <span>{formatDate(post.created_at)}</span>
      </div>

      <div className="prose dark:prose-invert max-w-none mb-4">
        {post.content.length > 200
          ? `${post.content.substring(0, 200)}...`
          : post.content}
      </div>

      <div className="flex space-x-2">
        <Link
          href={`/blog/${post.id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Read more
        </Link>

        {isOwner && (
          <>
            <span className="text-gray-400">•</span>
            <Link
              href={`/blog/edit/${post.id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Edit
            </Link>

            <span className="text-gray-400">•</span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
