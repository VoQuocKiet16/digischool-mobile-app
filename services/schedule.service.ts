import api from "./api.config";

export const getStudentSchedule = async ({
  className,
  academicYear,
  weekNumber,
}: {
  className: string;
  academicYear: string;
  weekNumber: number;
}) => {
  const res = await api.get(
    `/api/schedules/class/${className}/${academicYear}/${weekNumber}`
  );
  return res.data;
};

export const getTeacherSchedule = async ({
  teacherId,
  academicYear,
  weekNumber,
}: {
  teacherId: string;
  academicYear: string;
  weekNumber: number;
}) => {
  const res = await api.get(
    `/api/schedules/teacher/${teacherId}/${academicYear}/${weekNumber}`
  );
  return res.data;
};

export const getLessonDetail = async (lessonId: string) => {
  const res = await api.get(`/api/schedules/lesson/${lessonId}`);
  // Backend trả về { success: true, message: "...", data: lessonData }
  // Frontend cần trả về lessonData trực tiếp
  return res.data.data;
};

export const getLessonStudents = async (lessonId: string) => {
  const res = await api.get(`/api/schedules/lesson/${lessonId}/students`);
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

export const getAvailableAcademicYearsAndWeeks = async () => {
  try {
    const response = await api.get("/api/schedules/available-academic-years-weeks");
    return response.data;
  } catch (error) {
    console.error("Error fetching available academic years and weeks:", error);
    throw error;
  }
};
