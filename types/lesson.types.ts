export interface LessonData {
  _id: string;
  lessonId: string;
  topic: string;
  description?: string;
  timeSlot: {
    _id: string;
    startTime: string;
    endTime: string;
    period: number;
    type: string;
  };
  teacher: {
    _id: string;
    name: string;
    email: string;
    gender?: string;
  };
  substituteTeacher?: {
    _id: string;
    name: string;
    email: string;
  };
  subject?: {
    _id: string;
    subjectName: string;
    subjectCode: string;
  };
  class?: {
    _id: string;
    className: string;
    gradeLevel: number;
  };
  academicYear: {
    _id: string;
    name: string;
  };
  scheduledDate: string;
  status: string;
  type?: string; // "fixed" | "regular"

  // Thêm các trường mới từ backend
  dayOfWeek?: string; // "Thứ 2", "Thứ 3", etc.
  dayNumber?: number; // 1-7 (Thứ 2 = 1, CN = 7)

  // Test info từ backend mới
  testInfo?: {
    testInfoId: string;
    testType: string;
    content: string;
    reminder?: string;
  } | null;
  teacherEvaluation?: {
    _id: string;
    rating: string;
  } | null;
  studentEvaluation?: {
    _id: string;
    comments: string;
  } | null;

  // Legacy fields for backward compatibility
  fixedInfo?: {
    description: string;
  };
}
