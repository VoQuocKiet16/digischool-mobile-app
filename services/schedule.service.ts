import api from "./api.config";

export const getSchedule = async ({
  scheduleId,
  academicYear,
  startOfWeek,
  endOfWeek,
}: {
  scheduleId: string;
  academicYear: string;
  startOfWeek: string;
  endOfWeek: string;
}) => {
  const res = await api.get(
    `/api/schedules/${scheduleId}?academicYear=${academicYear}&startOfWeek=${startOfWeek}&endOfWeek=${endOfWeek}`
  );
  return res.data;
};
