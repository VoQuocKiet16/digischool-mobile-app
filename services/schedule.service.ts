import api from "./api.config";

export const getSchedule = async ({
  className,
  academicYear,
  startOfWeek,
  endOfWeek,
}: {
  className: string;
  academicYear: string;
  startOfWeek: string;
  endOfWeek: string;
}) => {
  const res = await api.get(
    `/api/schedules/class?className=${className}&academicYear=${academicYear}&startOfWeek=${startOfWeek}&endOfWeek=${endOfWeek}`
  );
  return res.data;
};

export const getLessonDetail = async (lessonId: string) => {
  const res = await api.get(`/api/schedules/lesson/${lessonId}`);
  return res.data;
};
