import api from "./api.config";

export interface CreateNewsRequest {
  title: string;
  content: string;
  coverImage: string; // base64
}

export interface CreateNewsResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const createNews = async (
  data: CreateNewsRequest
): Promise<CreateNewsResponse> => {
  try {
    const response = await api.post("/api/news/create", data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Đăng tin thất bại",
    };
  }
};

export const getAllNews = async () => {
  try {
    const response = await api.get("/api/news/all");
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Lấy danh sách tin thất bại",
    };
  }
};

export const getNewsBySubject = async (subjectId: string) => {
  try {
    const response = await api.get(`/api/news/by-subject?subject=${subjectId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Lấy tin theo môn thất bại",
    };
  }
};

export const getNewsDetail = async (id: string) => {
  try {
    const response = await api.get(`/api/news/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Lấy chi tiết tin thất bại",
    };
  }
};

export const favoriteNews = async (id: string) => {
  try {
    const response = await api.post(`/api/news/${id}/favorite`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Thêm vào yêu thích thất bại' };
  }
};

export const unfavoriteNews = async (id: string) => {
  try {
    const response = await api.delete(`/api/news/${id}/favorite`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Bỏ yêu thích thất bại' };
  }
};

export const getFavoriteNews = async () => {
  try {
    const response = await api.get('/api/news/favorites');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Lấy tin yêu thích thất bại' };
  }
};

export const getMyNews = async () => {
  try {
    const response = await api.get('/api/news/mine');
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Lấy tin của giáo viên thất bại' };
  }
};

export const updateNews = async (id: string, data: { title: string; content: string; coverImage: string }) => {
  try {
    const response = await api.patch(`/api/news/update/${id}`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Cập nhật tin thất bại' };
  }
};

export const deleteNews = async (id: string) => {
  try {
    const response = await api.delete(`/api/news/delete/${id}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Xoá tin thất bại' };
  }
};
