export interface LessonData {
  _id: string;
  lessonId: string;
  topic: string;
  description: string;
  timeSlot: {
    startTime: string;
    endTime: string;
    session: string;
    period: number;
  };
  teacher: {
    name: string;
    gender: string;
  };
  subject?: {
    name: string;
  };
  class?: {
    className: string;
  };
  fixedInfo?: {
    description: string;
  };
  testInfo?: {
    testType: string;
    content: string;
    reminder?: string;
  } | null;
  evaluation?: {
    rank: string;
  } | null;
  teacherEvaluation?: {
    _id: string;
    evaluation: {
      rating: string;
      comments: string;
      details: any;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  status: string;
  studentEvaluations?: {
    _id: string;
    student: {
      _id: string;
      name: string;
      email: string;
      studentId: string;
    };
    evaluation: {
      teachingClarity: number;
      teachingSupport: number;
      teacherInteraction: number;
      overallRating: number;
    };
    comments: string;
    evaluatedAt: string;
  }[];
  academicYear?: {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  scheduledDate?: string;
}
