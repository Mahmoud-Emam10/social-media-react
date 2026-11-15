import { useEffect, useRef, useState } from "react";
import { toggleLike } from "../../services/like.service";

type LikeButtonProps = {
  postId: string;
  initialLikes: number;
  initialIsLiked: boolean;
  className?: string;
};

export default function LikeButton({
  postId,
  initialLikes,
  initialIsLiked,
  className = "",
}: LikeButtonProps) {
  const [liked, setLiked] = useState<boolean>(initialIsLiked);
  const [likes, setLikes] = useState<number>(initialLikes);
  const isOptimisticRef = useRef(false);

  useEffect(() => {
    if (isOptimisticRef.current) return;

    setLiked(initialIsLiked);
    setLikes(initialLikes);
  }, [initialIsLiked, initialLikes]);

  const handleToggleLike = async () => {
    const previousLiked = liked;
    const previousLikes = likes;
    const nextLiked = !liked;
    const nextLikeCount = nextLiked ? likes + 1 : Math.max(likes - 1, 0);

    isOptimisticRef.current = true;
    setLiked(nextLiked);
    setLikes(nextLikeCount);

    try {
      const serverState = await toggleLike(postId);
      const serverLiked = Boolean(serverState?.liked ?? nextLiked);
      const serverLikesCount = Number(serverState?.likesCount ?? nextLikeCount);

      setLiked(serverLiked);
      setLikes(serverLikesCount);
    } catch (error) {
      setLiked(previousLiked);
      setLikes(previousLikes);
      console.error("Failed to toggle like:", error);
    } finally {
      isOptimisticRef.current = false;
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      aria-label={liked ? "Unlike post" : "Like post"}
      aria-pressed={liked}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 ${className} ${
        liked ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
      }`}
    >
      <span
        aria-hidden="true"
        className={`text-lg leading-none ${liked ? "text-red-500" : "text-gray-500"}`}
      >
        {liked ? "♥" : "♡"}
      </span>
      <span>{likes}</span>
    </button>
  );
}
