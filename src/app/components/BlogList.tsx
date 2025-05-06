import { useState, useEffect } from "react";
import { BlogPost, getBlogPosts, deleteBlogPost } from "@/lib/blog-service";
import { getCurrentUser } from "@/lib/user-service";
import BlogPostComponent from "./BlogPost";

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUserId(user.id);
        }

        const blogPosts = await getBlogPosts();
        setPosts(blogPosts);
      } catch (error) {
        console.error("Failed to load blog posts", error);
        setError("Failed to load blog posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteBlogPost(id);
      setPosts(posts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Failed to delete post", error);
      throw error;
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading blog posts...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (posts.length === 0) {
    return <div className="p-4 text-center">No blog posts found.</div>;
  }

  return (
    <div>
      {posts.map((post) => (
        <BlogPostComponent
          key={post.id}
          post={post}
          isOwner={currentUserId === post.user_id}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
