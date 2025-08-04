export interface Notification {
  _id: string;
  type: string;
  title: string;
  content: string;
  sender?: {
    gender: string;
    name: string;
    _id: string;
    role: string[];
  };
  receivers?: string[];
  receiverScope?: any;
  relatedObject?: {
    id: string;
    requestType: string;
    status: string;
  };
  isReadBy?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  name: string;
}

export interface Grade {
  gradeLevel: number;
}

export interface Class {
  id: string;
  name: string;
  grade: number;
}

export interface CreateManualNotificationData {
  title: string;
  content: string;
  scopeType?: string;
  department?: string;
  grade?: string;
  selectedClass?: string;
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

export const markAllNotificationsAsRead = async (token: string) => {
  const res = await api.patch(
    `api/notifications/read-all`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

// Manual Notification APIs
export const createManualNotification = async (
  data: CreateManualNotificationData,
  token: string
) => {
  const res = await api.post(
    `api/notifications/create-manual`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const getDepartments = async (token: string) => {
  const res = await api.get(
    `api/notifications/departments`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const getGrades = async (token: string) => {
  const res = await api.get(
    `api/notifications/grades`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const getClasses = async (token: string) => {
  const res = await api.get(
    `api/notifications/classes`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
