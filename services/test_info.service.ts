import api from "./api.config";

export interface TestInfo {
  _id: string;
  testType: string;
  content: string;
  reminder?: string;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestInfoRequest {
  testType: string;
  content: string;
  reminder?: string;
}

export interface UpdateTestInfoRequest {
  testType: string;
  content: string;
  reminder?: string;
}

export interface CreateTestInfoResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface UpdateTestInfoResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface DeleteTestInfoResponse {
  success: boolean;
  message?: string;
}

export const createTestInfo = async (
  lessonId: string,
  data: CreateTestInfoRequest
): Promise<CreateTestInfoResponse> => {
  try {
    const response = await api.post(
      `/api/test-infos/lessons/${lessonId}`,
      data
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Tạo thông tin kiểm tra thất bại",
    };
  }
};

export const updateTestInfo = async (
  testInfoId: string,
  data: UpdateTestInfoRequest
): Promise<UpdateTestInfoResponse> => {
  try {
    const response = await api.put(`/api/test-infos/${testInfoId}`, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Cập nhật thông tin kiểm tra thất bại",
    };
  }
};

export const deleteTestInfo = async (
  testInfoId: string
): Promise<DeleteTestInfoResponse> => {
  try {
    const response = await api.delete(`/api/test-infos/${testInfoId}`);
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Xóa thông tin kiểm tra thất bại",
    };
  }
};
