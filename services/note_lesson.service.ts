import api from "./api.config";

export interface CreateNoteRequest {
  title: string;
  content: string;
  lesson: string;
  remindMinutes?: number;
}

export interface CreateNoteResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const createNote = async (
  data: CreateNoteRequest
): Promise<CreateNoteResponse> => {
  try {
    const response = await api.post("/api/notes/create", data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Tạo ghi chú thất bại",
    };
  }
};

export const getNotesByLesson = async (
  lessonId: string
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const response = await api.get(`/api/notes/get-by-lesson?lesson=${lessonId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Lấy danh sách ghi chú thất bại",
    };
  }
};

export const updateNote = async (
  id: string,
  data: { title: string; content: string; remindMinutes?: number }
): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const response = await api.patch(`/api/notes/update/${id}`, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Cập nhật ghi chú thất bại",
    };
  }
};

export const deleteNote = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    await api.delete(`/api/notes/delete/${id}`);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Xoá ghi chú thất bại",
    };
  }
};
