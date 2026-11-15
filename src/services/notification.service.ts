import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

interface GetNotificationsParams {
  unread?: boolean;
  page?: number;
  limit?: number;
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
  };
}

export async function getNotifications({
  unread = false,
  page = 1,
  limit = 10,
}: GetNotificationsParams = {}) {
  const { data } = await axios.get(`${baseUrl}/notifications`, {
    params: {
      unread,
      page,
      limit,
    },
    headers: getAuthHeaders(),
  });

  return data;
}

export async function markAsRead(notificationId: string) {
  const { data } = await axios.patch(
    `${baseUrl}/notifications/${notificationId}/read`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return data;
}

export async function markAllAsRead() {
  const { data } = await axios.patch(
    `${baseUrl}/notifications/read-all`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return data;
}