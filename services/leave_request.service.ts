import api from "./api.config";

export const createLeaveRequest = async ({
  lessonIds,
  phoneNumber,
  reason,
}: {
  lessonIds: string[];
  phoneNumber: string;
  reason: string;
}) => {
  const res = await api.post("/api/student-leave-requests/create", {
    lessonIds,
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
