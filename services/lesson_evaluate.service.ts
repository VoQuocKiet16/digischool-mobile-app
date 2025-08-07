import api from "./api.config";

export interface Student {
  id: string;
  name: string;
  studentId: string;
  className: string;
}

export interface LessonInfo {
  lessonId: string;
  scheduledDate: string;
  status: string;
}

export interface ClassInfo {
  className: string;
}

export interface SubjectInfo {
  subjectName: string;
  subjectCode: string;
}

export interface TeacherInfo {
  name: string;
}

export interface StudentsResponse {
  lesson: LessonInfo;
  class: ClassInfo;
  subject: SubjectInfo;
  teacher: TeacherInfo;
  students: Student[];
  totalStudents: number;
}

export interface AbsentStudent {
  student: string;
  isApprovedLeave?: boolean;
  reason?: string;
}

export interface OralTest {
  student: string;
  score: number;
}

export interface Violation {
  student: string;
  description: string;
}

export interface LessonEvaluationRequest {
  curriculumLesson: string;
  content: string;
  comments?: string;
  rating: "A+" | "A" | "B+" | "B" | "C";
  absentStudents?: AbsentStudent[];
  oralTests?: OralTest[];
  violations?: Violation[];
}

export const lessonEvaluateService = {
  // Lấy danh sách học sinh theo lessonId
  getStudentsByLesson: async (lessonId: string): Promise<StudentsResponse> => {
    try {
      const response = await api.get(
        `/api/schedules/lesson/${lessonId}/students`
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo đánh giá tiết học - cập nhật theo API mới
  createTeacherEvaluation: async (
    lessonId: string,
    data: LessonEvaluationRequest
  ) => {
    try {
      const response = await api.post(
        `/api/teacher-evaluations/lessons/${lessonId}/evaluate`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo đánh giá tiết học cho học sinh
  createStudentEvaluation: async (
    lessonId: string,
    data: {
      teachingClarity: number;
      teachingSupport: number;
      teacherInteraction: number;
      completedWell: boolean;
      reason?: string;
      comments?: string;
    }
  ) => {
    try {
      const response = await api.post(
        `/api/student-evaluations/lessons/${lessonId}/evaluate`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
