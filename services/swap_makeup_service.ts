import api from "./api.config";

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
