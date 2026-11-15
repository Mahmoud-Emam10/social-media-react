import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Globe,
  Heart,
  MessageCircle,
  Share2,
  UserRoundCheck,
  Lock,
  Clock3,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import type { PostCardI } from "../../types/PostCard.types";
import { Link } from "react-router";
import { getPostComments } from "../../services/comments.service";
import PostComment from "./PostComment";
import { AlertDialog, Button, Dropdown, Label } from "@heroui/react";
import { UserContext, type UserContextType } from "../Context/UserContext";
import EditPost from "./EditPost";
import type { BlobOptions } from "buffer";
import { deletePost } from "../../services/post.service";
import toast from "react-hot-toast";
import LikeButton from "../LikeButton/LikeButton";

interface PostCardProps {
  post: PostCardI;
  onDelete?: (postId: string) => void;
}

function PostCard({ post, onDelete }: PostCardProps) {
  const [allComments, setAllComments] = useState<TopComment[] | []>([]);
  const [visibleComments, setVisibleComments] = useState(1);
  const {userDetails}: UserContextType = useContext(UserContext);
  const [showEditPost, setShowEditPost] = useState<boolean>(false);
  const [showDeleteDialouge, setShowDeleteDialouge] = useState<Boolean>(false);


  const restOfComments = allComments.filter(
    (comment) => comment._id !== post.topComment._id,
  );

  async function getComments(postId: string) {
    try {
      const { data } = await getPostComments(postId);
      setAllComments(data.data.comments);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    getComments(post._id);
  }, [post._id]);

  function showMoreComments() {
    setVisibleComments(visibleComments + 2);
  }

  async function deleteMyPost(postId: string) {
     try {
      const {data} = await deletePost(postId);
      toast.success(data?.message ?? "Post deleted successfully.");
      onDelete?.(postId);
     } catch (error) {
      console.error(error);
     }
  }

  return (
    <article className="w-full overflow-hidden my-3 p-2 border rounded-xl border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
      {/*
        Post header:
        - avatar
        - name + username
        - time + privacy status
      */}
      <header className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <img
            src={post.user.photo}
            alt={post.user.name}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-gray-100"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-gray-900">
                {post.user.name}
              </h3>
            </div>

            <div className="mt-0.5 flex items-center gap-2 text-sm text-gray-500">
              <span>{post.user.username}</span>
              <span className="text-gray-400">•</span>
              <span className="inline-flex items-center gap-1">
                <Clock3 size={12} />
                {new Date(post.createdAt).toLocaleString("en-us", {
                  timeStyle: "short",
                  dateStyle: "medium",
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600">
            {post.privacy === "Public" ? (
              <Globe size={14} />
            ) : post.privacy === "Friends" ? (
              <UserRoundCheck size={14} />
            ) : (
              <Lock size={14} />
            )}
            {post.privacy}
          </div>
            {post.user._id === userDetails?._id ? <>
             <Dropdown>
              <Button aria-label="Menu" variant="ghost">
                <MoreHorizontal size={20} />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu
                  onAction={(key) => console.log(`Selected: ${key}`)}
                >
                  <Dropdown.Item id="save-post" textValue="Copy Post">
                    <Label>Save Post</Label>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={()=>setShowEditPost(true)} id="edit-post" textValue="Edit Post">
                    <Label>Edit Post</Label>
                  </Dropdown.Item>
                  <Dropdown.Item
                  onClick={()=>setShowDeleteDialouge(true)}
                    id="delete-post"
                    textValue="Delete Post"
                    variant="danger"
                  >
                    <Label>Delete Post</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>

            </> : <>
              <Dropdown>
              <Button aria-label="Menu" variant="ghost">
                <MoreHorizontal size={20} />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu
                  onAction={(key) => console.log(`Selected: ${key}`)}
                >
                  <Dropdown.Item id="save-post" textValue="Copy Post">
                    <Label>Save Post</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
            </>}
            

        </div>
      </header>

      <AlertDialog isOpen={showDeleteDialouge}>

      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Delete project permanently?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                This will permanently delete <strong>My Awesome Project</strong> and all of its
                data. This action cannot be undone.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button onClick={()=> setShowDeleteDialouge(false)} slot="close" variant="tertiary">
                Cancel
              </Button>
              <Button onClick={()=> deleteMyPost(post._id)} slot="close" variant="danger">
                Delete Post
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>

      {/*
        Post body:
        - text content
        - main image preview
      */}
      <div className="px-4 pb-3 sm:px-5">
        {showEditPost ? <EditPost getAllPosts={getAllPosts} postId={post._id} setShowEditPost={setShowEditPost}/> : <>
        <p className="whitespace-pre-line text-[15px] leading-7 text-gray-700">
          {post.body}
        </p>
        {post.image && (
          <>
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              <img
                src={post.image}
                alt={post.body}
                className="h-[320px] w-full object-cover sm:h-[420px]"
              />
            </div>
          </>
        )}
        </>}
        
        
      </div>

      {/*
        Post stats:
        - likes, comments and shares counts
      */}
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-500 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
              ❤
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-400 text-[10px] font-bold text-white">
              👍
            </span>
          </div>
          <span>{post.likesCount} likes</span>
        </div>

        <div className="flex items-center gap-3">
          <span>{post.commentsCount} comments</span>
          <span>{post.sharesCount} shares</span>
          <Link
            className="text-blue-600 font-bold"
            to={`/PostDetails/${post._id}`}
          >
            View Details
          </Link>
        </div>
      </div>

      {/*
        Action row:
        - like
        - comment
        - share
      */}
      <div className="grid grid-cols-3 gap-2 border-t border-gray-200 px-3 py-2 sm:px-4">
        <LikeButton
          postId={post._id}
          initialLikes={Number(post.likesCount ?? 0)}
          initialIsLiked={Boolean(
            post.isLiked ??
              post.liked ??
              (userDetails?._id ? (post.likes ?? []).includes(userDetails._id) : false) ??
              false
          )}
        />


        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          <MessageCircle size={18} />
          Comment
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        >
          <Share2 size={18} />
          Share
        </button>
      </div>

      {/*
        Comments section:
        - shows the first visible comment as preview
        - show more button reveals the rest of the comment list
      */}
      <button
        className="mb-3 flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
        type="button"
        onClick={showMoreComments}
      >
        Show more comments
        <ChevronDown size={16} />
      </button>

      {post.topComment && (
        <>
          <div className="space-y-3">
            <div className="flex justify-between items-start gap-2.5">
              <div className="flex items-start gap-2.5">
                <img
                alt={post.topComment.commentCreator.name}
                className="mt-0.5 size-8 shrink-0 rounded-full object-cover"
                src={post.topComment.commentCreator.photo}
              />
              <div className="min-w-0 rounded-2xl bg-gray-100 px-3 py-2">
                <div className="flex flex-col items-baseline gap-x-1.5">
                  <h2 className="text-green-300 text-sm font-black">
                    {" "}
                    Top Comment{" "}
                  </h2>
                  <span className="text-xs font-semibold text-gray-900">
                    {post.topComment.commentCreator.name}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {post.topComment.commentCreator.username}
                  </span>
                </div>
                <p className="mt-0.5 break-words text-sm leading-5 text-gray-800">
                  {post.topComment.content}
                </p>
                {post.topComment.image && (
                  <>
                    <img
                      src={post.topComment.image}
                      className="w-30 h-30 mt-2"
                      alt=""
                    />
                  </>
                )}
                <span className="mt-1 block text-[11px] text-gray-500">
                  {new Date(post.topComment.createdAt).toLocaleString("en-us", {
                    timeStyle: "short",
                    dateStyle: "full",
                  })}
                </span>
              </div>
              </div>
              <div>
                {post.topComment.commentCreator._id === userDetails?._id ? <>
                 <Dropdown>
              <Button aria-label="Menu" variant="ghost">
                <MoreHorizontal size={20} />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu
                  onAction={(key) => console.log(`Selected: ${key}`)}
                >
                  <Dropdown.Item id="edit-comment" textValue="Edit Comment">
                    <Label>Edit Comment</Label>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="delete-comment"
                    textValue="Delete Comment"
                    variant="danger"
                  >
                    <Label>Delete Comment</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
                </> : <>
                  <Dropdown>
              <Button aria-label="Menu" variant="ghost">
                <MoreHorizontal size={20} />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu
                  onAction={(key) => console.log(`Selected: ${key}`)}
                >
                  <Dropdown.Item
                    id="delete-comment"
                    textValue="Delete Comment"
                    variant="danger"
                  >
                    <Label>Delete Comment</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
                </> }
                
              </div>
            </div>
          </div>
        </>
      )}

      {restOfComments &&
        restOfComments.slice(0, visibleComments).map((comment) => {
          return (
            <React.Fragment key={comment._id}>
              <div className="space-y-3 my-4">
                <div className="flex items-start gap-2.5">
                  <img
                    alt={comment.commentCreator.name}
                    className="mt-0.5 size-8 shrink-0 rounded-full object-cover"
                    src={comment.commentCreator.photo}
                  />
                  <div className="flex justify-between w-full">
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
                    {comment.image && (
                      <>
                        <img
                          src={comment.image}
                          className="w-30 h-30 mt-2"
                          alt=""
                        />
                      </>
                    )}
                    <span className="mt-1 block text-[11px] text-gray-500">
                      {new Date(comment.createdAt).toLocaleString("en-us", {
                        timeStyle: "short",
                        dateStyle: "full",
                      })}
                    </span>
                  </div>
                 {comment.commentCreator._id === userDetails?._id ? <>
                   <Dropdown>
              <Button aria-label="Menu" variant="ghost">
                <MoreHorizontal size={20} />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu
                  onAction={(key) => console.log(`Selected: ${key}`)}
                >
                  <Dropdown.Item id="edit-comment" textValue="Edit Comment">
                    <Label>Edit Comment</Label>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="delete-comment"
                    textValue="Delete Comment"
                    variant="danger"
                  >
                    <Label>Delete Comment</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
                 </> : <>
                  <Dropdown>
              <Button aria-label="Menu" variant="ghost">
                <MoreHorizontal size={20} />
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu
                  onAction={(key) => console.log(`Selected: ${key}`)}
                >
                  <Dropdown.Item
                    id="delete-comment"
                    textValue="Delete Comment"
                    variant="danger"
                  >
                    <Label>Delete Comment</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
                 </>}
                 
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

      <PostComment postId={post._id} getComments={getComments} />
    </article>
  );
}

export default PostCard;
