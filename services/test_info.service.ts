import api from "./api.config";

export interface TestInfo {
  testInfoId: string;
  testType: string;
  content: string;
  reminder?: string;
}

export interface TestInfoDetail {
  _id: string;
  testType: string;
  content: string;
  reminder?: string;
  lesson: {
    _id: string;
    lessonId: string;
    scheduledDate: string;
    topic?: string;
  };
  class: {
    _id: string;
    className: string;
  };
  subject: {
    _id: string;
    subjectName: string;
    subjectCode: string;
  };
  teacher: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestInfoRequest {
  testType: "kiemtra15" | "kiemtra1tiet";
  content: string;
  reminder?: string;
}

export interface UpdateTestInfoRequest {
  testType?: "kiemtra15" | "kiemtra1tiet";
  content?: string;
  reminder?: string;
}

export interface CreateTestInfoResponse {
  success: boolean;
  message?: string;
  data?: {
    testInfoId: string;
    lesson: {
      lessonId: string;
      scheduledDate: string;
      topic?: string;
    };
    class: string;
    subject: {
      name: string;
      code: string;
    };
    teacher: string;
    testType: string;
    content: string;
    reminder?: string;
    createdAt: string;
  };
}

export interface UpdateTestInfoResponse {
  success: boolean;
  message?: string;
  data?: {
    testInfoId: string;
    testType: string;
    content: string;
    reminder?: string;
    updatedAt: string;
  };
}

export interface DeleteTestInfoResponse {
  success: boolean;
  message?: string;
  data?: {
    deletedTestInfo: {
      testInfoId: string;
      testType: string;
      class: string;
      subject: string;
    };
  };
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
      data: response.data.data,
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
      data: response.data.data,
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
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Xóa thông tin kiểm tra thất bại",
    };
  }
};
