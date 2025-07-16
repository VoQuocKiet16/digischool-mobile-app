import api from "./api.config";

export interface Subject {
  _id: string;
  subjectName: string;
  subjectCode: string;
  description: string;
  gradeLevels: number[];
  credits: number;
  weeklyHours: number;
  category: string;
  department: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetSubjectsResponse {
  success: boolean;
  message?: string;
  data?: {
    subjects: Subject[];
    pagination?: any;
  };
}

export const getAllSubjects = async (): Promise<GetSubjectsResponse> => {
  try {
    const response = await api.get("/api/subjects/");
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Lấy danh sách môn học thất bại",
    };
  }
};
