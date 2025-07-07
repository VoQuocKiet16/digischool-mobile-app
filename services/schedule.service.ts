import api from "./api.config";

export const getStudentSchedule = async ({
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

export const getTeacherSchedule = async ({
  teacherId,
  academicYear,
  startOfWeek,
  endOfWeek,
}: {
  teacherId: string;
  academicYear: string;
  startOfWeek: string;
  endOfWeek: string;
}) => {
  const res = await api.get(
    `/api/schedules/teacher?teacherId=${teacherId}&academicYear=${academicYear}&startOfWeek=${startOfWeek}&endOfWeek=${endOfWeek}`
  );
  return res.data;
};

export const getLessonDetail = async (lessonId: string) => {
  const res = await api.get(`/api/schedules/lesson/${lessonId}`);
  return res.data;
};

export const updateLessonDescription = async (
  lessonId: string,
  description: string
): Promise<any> => {
  try {
    const response = await api.patch(
      `/api/schedules/lessons/${lessonId}/description`,
      {
        description,
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteLessonDescription = async (
  lessonId: string
): Promise<any> => {
  try {
    const response = await api.delete(
      `/api/schedules/lessons/${lessonId}/description`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const completeLesson = async (lessonId: string): Promise<any> => {
  try {
    const response = await api.patch(
      `/api/schedules/lesson/${lessonId}/complete`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
