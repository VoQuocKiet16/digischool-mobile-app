import api from "./api.config";
import { CreateLessonLeaveRequest, CreateDayLeaveRequest } from "../types/user.types";

export const createLeaveRequest = async ({
  lessonIds,
  phoneNumber,
  reason,
}: CreateLessonLeaveRequest) => {
  const res = await api.post("/api/student-leave-requests/create-lesson", {
    lessonIds,
    phoneNumber,
    reason,
  });
  return res.data;
};

export const createDayLeaveRequest = async ({
  date,
  phoneNumber,
  reason,
}: CreateDayLeaveRequest) => {
  const res = await api.post("/api/student-leave-requests/create-day", {
    date,
    phoneNumber,
    reason,
  });
  return res.data;
};

export const createTeacherLeaveRequest = async ({
  lessonIds,
  reason,
}: {
  lessonIds: string[];
  reason: string;
}) => {
  const res = await api.post("/api/teacher-leave-requests/create", {
    lessonIds,
    reason,
  });
  return res.data;
};

// Cancel student leave request
export const cancelStudentLeaveRequest = async (requestId: string) => {
  try {
    const response = await api.delete(`/api/student-leave-requests/${requestId}/cancel`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Không thể hủy yêu cầu nghỉ phép");
  }
};

// Delete teacher leave request
export const deleteTeacherLeaveRequest = async (requestId: string) => {
  try {
    const response = await api.delete(`/api/teacher-leave-requests/${requestId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Không thể xóa yêu cầu nghỉ phép");
  }
};
