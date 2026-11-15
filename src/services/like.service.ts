import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL ?? "https://route-posts.routemisr.com";

export async function getPostLikeState(postId: string) {
  const { data } = await axios.get(`${baseUrl}/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("userToken")}`,
    },
  });

  const payload = data?.data ?? data;

  return {
    likesCount: Number(payload?.likesCount ?? payload?.likes ?? 0),
    liked: Boolean(
      payload?.isLiked ??
      payload?.liked ??
      payload?.userLiked ??
      payload?.like?.liked ??
      false
    ),
  };
}

export async function toggleLike(postId: string) {
  const { data } = await axios.put(
    `${baseUrl}/posts/${postId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
    }
  );

  const payload = data?.data ?? data;

  return {
    likesCount: Number(payload?.likesCount ?? payload?.likes ?? 0),
    liked: Boolean(
      payload?.isLiked ??
      payload?.liked ??
      payload?.userLiked ??
      payload?.like?.liked ??
      false
    ),
  };
}
