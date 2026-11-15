import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import PostCard from "../PostCard/PostCard";
import { getPostsByUser } from "../../services/post.service";
import type { PostCardI } from "../../types/PostCard.types";

interface MyPostsProps {
  userId?: string;
  title?: string;
}

function sortPostsByNewest(posts: PostCardI[]): PostCardI[] {
  return [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default function MyPosts({
  userId,
  title = "My Posts",
}: MyPostsProps) {
  const [posts, setPosts] = useState<PostCardI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchPosts = useCallback(async () => {
    if (!userId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getPostsByUser(userId);
      const rawPosts = Array.isArray(response)
        ? response
        : response?.data ?? response?.posts ?? [];

      setPosts(sortPostsByNewest(rawPosts as PostCardI[]));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load your posts.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = (postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.filter((post) => post._id !== postId)
    );
  };

  if (!userId) {
    return null;
  }

  return (
    <section
      aria-live="polite"
      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {title} ({posts.length})
        </h2>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500 dark:text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
          Loading your posts...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <p className="font-medium">Unable to load your posts.</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            aria-label="Retry loading posts"
            onClick={fetchPosts}
            className="mt-3 inline-flex rounded-lg bg-red-600 px-3 py-2 font-medium text-white transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-950/40">
          <p className="text-base font-medium text-slate-700 dark:text-slate-200">
            You haven&apos;t posted anything yet.
          </p>
          <Link
            to="/feed"
            className="mt-3 inline-flex rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Create a post
          </Link>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div role="list" className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} role="listitem">
              <PostCard post={post} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
