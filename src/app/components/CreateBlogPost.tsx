import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBlogPost } from "@/lib/blog-service";
import { supabase } from "@/lib/supabase";

export default function CreateBlogPost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user has a profile and get user ID
    async function checkUserProfile() {
      try {
        // Get user ID from client-side session
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData.session?.user?.id;

        if (!currentUserId) {
          setError("You must be logged in to create a blog post");
          router.push("/login");
          return;
        }

        setUserId(currentUserId);

        const response = await fetch("/api/user/has-profile");
        const profileData = await response.json();

        setHasProfile(profileData.hasProfile);
      } catch (error) {
        console.error("Error checking user profile:", error);
        setError("Failed to check if you have a profile.");
      } finally {
        setCheckingProfile(false);
      }
    }

    checkUserProfile();
  }, [router]);

  const handleCreateProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // If we have userId from the client-side session, include it in the request
      const response = await fetch("/api/profile/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create profile");
      }

      setHasProfile(true);
    } catch (error) {
      console.error("Error creating profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Additional check for profile
      if (!hasProfile) {
        throw new Error(
          "You must create a profile before creating a blog post"
        );
      }

      if (!userId) {
        throw new Error("You must be logged in to create a blog post");
      }

      if (!title.trim()) {
        throw new Error("Title is required");
      }

      if (!content.trim()) {
        throw new Error("Content is required");
      }

      // Use the userId from state instead of calling getCurrentUser again
      await createBlogPost({
        title: title.trim(),
        content: content.trim(),
        user_id: userId,
      });

      // Redirect to blog list after successful creation
      router.push("/blog");
    } catch (error) {
      console.error("Failed to create blog post", error);
      setError(
        error instanceof Error ? error.message : "Failed to create blog post"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Blog Post</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {checkingProfile ? (
        <div className="text-center py-4">Checking your profile status...</div>
      ) : !hasProfile ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-700">
            You need to create a profile before you can create blog posts.
          </p>
          <button
            onClick={handleCreateProfile}
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Creating Profile..." : "Create Profile"}
          </button>
        </div>
      ) : (
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Blog Post"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
