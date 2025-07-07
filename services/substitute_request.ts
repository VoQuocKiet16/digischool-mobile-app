import api from "./api.config";

export const getAvailableTeachers = async (lessonId: string) => {
  const res = await api.get(`/api/schedules/substitute-request/available-teachers/${lessonId}`);
  return res.data.data;
};

export const createSubstituteRequest = async ({ lessonId, candidateTeachers, reason }: {
  lessonId: string;
  candidateTeachers: string[];
  reason: string;
}) => {
  const res = await api.post("/api/schedules/substitute-request", {
    lessonId,
    candidateTeachers,
    reason,
  });
  return res.data;
};
