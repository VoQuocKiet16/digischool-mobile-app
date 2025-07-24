import api from "./api.config";

// Substitute request
export const getAvailableTeachers = async (lessonId: string) => {
  const res = await api.get(
    `/api/schedules/lesson-request/substitute/available-teachers/${lessonId}`
  );
  return res.data;
};

export const createSubstituteRequest = async ({
  lessonId,
  candidateTeacherIds,
  reason,
}: {
  lessonId: string;
  candidateTeacherIds: string[];
  reason: string;
}) => {
  const res = await api.post(
    "/api/schedules/lesson-request/substitute/create",
    {
      lessonId,
      candidateTeacherIds,
      reason,
    }
  );
  return res.data;
};

// Swap lesson request
export const createSwapLessonRequest = async ({
  originalLessonId,
  replacementLessonId,
  reason,
}: {
  originalLessonId: string;
  replacementLessonId: string;
  reason: string;
}) => {
  const res = await api.post("/api/schedules/lesson-request/swap/create", {
    originalLessonId,
    replacementLessonId,
    reason,
  });
  return res.data;
};

// Makeup lesson request
export const createMakeupLessonRequest = async ({
  originalLessonId,
  replacementLessonId,
  reason,
}: {
  originalLessonId: string;
  replacementLessonId: string;
  reason: string;
}) => {
  const res = await api.post("/api/schedules/lesson-request/makeup/create", {
    originalLessonId,
    replacementLessonId,
    reason,
  });
  return res.data;
};

// Cancel substitute request
export const cancelSubstituteRequest = async (requestId: string) => {
  const res = await api.post(
    `/api/schedules/lesson-request/substitute/${requestId}/cancel`
  );
  return res.data;
};

// Cancel swap request
export const cancelSwapRequest = async (requestId: string) => {
  const res = await api.post(
    `/api/schedules/lesson-request/swap/${requestId}/cancel`
  );
  return res.data;
};

// Cancel makeup request
export const cancelMakeupRequest = async (requestId: string) => {
  const res = await api.post(
    `/api/schedules/lesson-request/makeup/${requestId}/cancel`
  );
  return res.data;
};
