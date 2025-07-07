export interface LessonData {
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
  status: string;
}
