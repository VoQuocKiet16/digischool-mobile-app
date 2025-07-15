export interface Notification {
  _id: string;
  type: string;
  title: string;
  content: string;
  sender?: {
    gender: string;
    name: string;
    _id: string;
  };
  receivers?: string[];
  receiverScope?: any;
  relatedObject?: string;
  isReadBy?: string[];
  createdAt: string;
  updatedAt: string;
}

import api from "./api.config";

export const getNotifications = async ({
  type,
  page = 1,
  limit = 20,
  token,
}: {
  type?: string;
  page?: number;
  limit?: number;
  token: string;
}) => {
  const params = new URLSearchParams({
    ...(type && { type }),
    page: String(page),
    limit: String(limit),
  });

  const res = await api.get(
    `api/notifications/get-by-user?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const markNotificationAsRead = async (id: string, token: string) => {
  const res = await api.patch(
    `api/notifications/read/${id}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
