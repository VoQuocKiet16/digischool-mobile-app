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
  const res = await api.post("/api/leave-requests/create", {
    lessonIds,
    phoneNumber,
    reason,
  });
  return res.data;
};
