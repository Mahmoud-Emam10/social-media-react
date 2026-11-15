import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Globe2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { getSinglePost } from "../../services/post.service";
import type { PostCardI, TopComment } from "../../types/PostCard.types";
import { getPostComments } from "../../services/comments.service";
import PostComment from "../../Components/PostCard/PostComment";
import { toggleLike } from "../../services/like.service";

const post = {
  user: {
    name: "Tara Williams",
    username: "@tarawilliams",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96&q=80",
  },
  createdAt: "2026-10-01T10:30:00.000Z",
  privacy: "public",
  body: "A little escape into the mountains.",
  image:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  likesCount: 248,
  commentsCount: 3,
  sharesCount: 12,
  topComment: {
    content: "This view is unreal. Adding it to my travel list!",
    createdAt: "2026-10-01T11:10:00.000Z",
    commentCreator: {
      name: "Maya Hassan",
      username: "@mayahassan",
      photo:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&h=96&q=80",
    },
  },
};

function PostDetails() {
  const [details, setDetails] = useState<PostCardI | null>(null);
  const [allComments, setAllComments] = useState<TopComment[] | []>([]);
  const [visibleComments, setVisibleComments] = useState(1);
  const { id } = useParams();
  const storageKey = id ? `like-${id}` : "like-post";

  const readStoredLikeState = () => {
    if (typeof window === "undefined" || !id) {
      return { liked: false, likes: 0 };
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return { liked: false, likes: 0 };

      const parsed = JSON.parse(saved);
      return {
        liked: Boolean(parsed?.liked ?? false),
        likes: Number(parsed?.likes ?? 0),
      };
    } catch {
      return { liked: false, likes: 0 };
    }
  };

  const [liked, setLiked] = useState<boolean>(readStoredLikeState().liked);
  const [likes, setLikes] = useState<number>(readStoredLikeState().likes);

  const restOfComments = allComments.filter((comment)=> comment._id !== details?.topComment._id)

  async function getPostDetails(postId: string) {
    try {
      const { data } = await getSinglePost(postId);
      const postData = data?.data?.post ?? data?.post ?? data;

      setDetails(postData);

      const nextLiked = Boolean(postData?.isLiked ?? postData?.liked ?? false);
      const nextLikes = Number(postData?.likesCount ?? postData?.likes ?? 0);

      setLiked(nextLiked);
      setLikes(nextLikes);

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          liked: nextLiked,
          likes: nextLikes,
        })
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function getComments(postId: string) {
    try {
      const { data } = await getPostComments(postId);
      console.log(data.data.comments);
      setAllComments(data.data.comments);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!id) return;
    getPostDetails(id);
    getComments(id);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        liked,
        likes,
      })
    );
  }, [id, liked, likes, storageKey]);

  // const [liked, setLiked] = useState(false);
  // const [likes, setLikes] = useState(post.likesCount);
  // const [commentText, setCommentText] = useState("");
  // const [shareMessage, setShareMessage] = useState("");

  // function toggleLike() {
  //   setLiked((currentLiked) => {
  //     setLikes((currentLikes) => currentLikes + (currentLiked ? -1 : 1));
  //     return !currentLiked;
  //   });
  // }

  // async function sharePost() {
  //   try {
  //     await navigator.clipboard.writeText(window.location.href);
  //     setShareMessage("Link copied");
  //   } catch {
  //     setShareMessage("Could not share this post");
  //   }
  // }

  function showMoreComments(){

    setVisibleComments(visibleComments + 2);
  }

  const handleToggleLike = async () => {
    if (!id) return;

    const previousLiked = liked;
    const previousCount = likes;
    const nextLiked = !previousLiked;
    const optimisticCount = nextLiked
      ? previousCount + 1
      : Math.max(previousCount - 1, 0);

    setLiked(nextLiked);
    setLikes(optimisticCount);

    try {
      const serverState = await toggleLike(id);
      setLiked(serverState.liked);
      setLikes(serverState.likesCount);

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          liked: serverState.liked,
          likes: serverState.likesCount,
        })
      );
    } catch (error) {
      console.error("Like toggle failed:", error);
      setLiked(previousLiked);
      setLikes(previousCount);
    }
  };

  return (
    <>
      {details && (
        <>
          <div className="mx-auto mt-6 w-full  px-4 sm:px-5">
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
              to="/feed"
            >
              <ArrowLeft aria-hidden="true" size={17} />
              Back to feed
            </Link>
          </div>
          <article className="mx-auto mb-6 mt-2 w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <header className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  className="size-11 shrink-0 rounded-full object-cover ring-2 ring-white"
                  src={details.user.photo}
                  alt={details.user.name}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="truncate text-sm font-semibold text-gray-900">
                      {details.user.name}
                    </span>
                    <span className="truncate text-xs text-gray-500">
                      {details.user.username}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                    <span>
                      {new Date(post.createdAt).toLocaleString("en-us", {
                        timeStyle: "short",
                        dateStyle: "full",
                      })}
                    </span>
                    <span aria-hidden="true">·</span>
                    <Globe2 aria-label="Public" size={13} />
                    <span>{details.privacy}</span>
                  </div>
                </div>
              </div>
              <button
                aria-label="More post options"
                className="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                type="button"
              >
                <MoreHorizontal size={21} />
              </button>
            </header>

            <div className="px-4 pb-3 pt-3 text-sm leading-6 text-gray-800 sm:px-5">
              <p>{details.body}</p>
            </div>

            {details.image && (
              <img
                className="block max-h-[520px] w-full bg-gray-100 object-cover"
                src={details.image}
                alt={details.body}
              />
            )}

            <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-gray-500 sm:px-5">
              <div className="flex items-center gap-2">
                <span className={`flex size-[18px] items-center justify-center rounded-full ${liked ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                  <Heart
                    aria-hidden="true"
                    fill={liked ? "currentColor" : "none"}
                    size={11}
                  />
                </span>
                <span>{likes} likes</span>
              </div>
              <div className="flex gap-3">
                <span>{details.commentsCount} comments</span>
                <span>{details.sharesCount} shares</span>
              </div>
            </div>

            <div className="mx-4 flex border-y border-gray-200 sm:mx-5">
              <button
                type="button"
                aria-label={liked ? "Unlike post" : "Like post"}
                onClick={handleToggleLike}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium transition ${
                  liked ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Heart
                  aria-hidden="true"
                  size={18}
                  fill={liked ? "currentColor" : "none"}
                />
                {liked ? "Liked" : "Like"}
              </button>
              <button
                className="flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                onClick={() =>
                  document.getElementById("post-details-comment")?.focus()
                }
                type="button"
              >
                <MessageCircle size={18} />
                Comment
              </button>
              <button
                className="flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                type="button"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>

            <section aria-label="Comments" className="px-4 pb-4 pt-3 sm:px-5">
              <button
                className="mb-3 flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
                type="button"
                onClick={showMoreComments}
              >
                Show more comments
                <ChevronDown size={16} />
              </button>

              {details.topComment && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <img
                            alt={details.topComment.commentCreator.name}
                            className="mt-0.5 size-8 shrink-0 rounded-full object-cover"
                            src={details.topComment.commentCreator.photo}
                          />
                          <div className="min-w-0 rounded-2xl bg-gray-100 px-3 py-2">
                            <div className="flex flex-col items-baseline gap-x-1.5">
                              <h2 className="text-green-300 text-sm font-black"> Top Comment </h2>
                              <span className="text-xs font-semibold text-gray-900">
                                {details.topComment.commentCreator.name}
                              </span>
                              <span className="text-[11px] text-gray-500">
                                {details.topComment.commentCreator.username}
                              </span>
                            </div>
                            <p className="mt-0.5 break-words text-sm leading-5 text-gray-800">
                              {details.topComment.content}
                            </p>
                            {details.topComment.image && <>
                              <img src={details.topComment.image} className="w-30 h-30 mt-2" alt=""/>
                            </>}
                            <span className="mt-1 block text-[11px] text-gray-500">
                              {new Date(
                                details.topComment.createdAt,
                              ).toLocaleString("en-us", {
                                timeStyle: "short",
                                dateStyle: "full",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                {restOfComments && restOfComments.slice(0, visibleComments).map((comment)=>{
                  return (
                    <React.Fragment key={comment._id}>
                      <div className="space-y-3 my-4">
                        <div className="flex items-start gap-2.5">
                          <img
                            alt={comment.commentCreator.name}
                            className="mt-0.5 size-8 shrink-0 rounded-full object-cover"
                            src={comment.commentCreator.photo}
                          />
                          <div className="min-w-0 rounded-2xl bg-gray-100 px-3 py-2">
                            <div className="flex flex-wrap items-baseline gap-x-1.5">
                              <span className="text-xs font-semibold text-gray-900">
                                {comment.commentCreator.name}
                              </span>
                              <span className="text-[11px] text-gray-500">
                                {comment.commentCreator.username}
                              </span>
                            </div>
                            <p className="mt-0.5 break-words text-sm leading-5 text-gray-800">
                              {comment.content}
                            </p>
                            {comment.image && <>
                              <img src={comment.image} className="w-30 h-30 mt-2" alt=""/>
                            </>}
                            <span className="mt-1 block text-[11px] text-gray-500">
                              {new Date(comment.createdAt).toLocaleString(
                                "en-us",
                                {
                                  timeStyle: "short",
                                  dateStyle: "full",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}  

              <PostComment postId={details._id} getComments={getComments}/>
            </section>
          </article>
        </>
      )}
    </>
  );
}

export default PostDetails;
