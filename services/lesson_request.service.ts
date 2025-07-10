import api from "./api.config";

// Substitute request
export const getAvailableTeachers = async (lessonId: string) => {
  const res = await api.get(`/api/schedules/lesson-request/substitute/available-teachers/${lessonId}`);
  return res.data;
};

export const createSubstituteRequest = async ({ lessonId, candidateTeacherIds, reason }: {
  lessonId: string;
  candidateTeacherIds: string[];
  reason: string;
}) => {
  const res = await api.post("/api/schedules/lesson-request/substitute/create", {
    lessonId,
    candidateTeacherIds,
    reason,
  });
  return res.data;
};

// Swap lesson request
export const createSwapLessonRequest = async ({ originalLessonId, replacementLessonId, reason }: {
  originalLessonId: string;
  replacementLessonId: string;
  reason: string;
}) => {
  const res = await api.post("/api/schedules/lesson-request/create", {
    originalLessonId,
    replacementLessonId,
    requestType: "swap",
    reason,
  });
  return res.data;
};
