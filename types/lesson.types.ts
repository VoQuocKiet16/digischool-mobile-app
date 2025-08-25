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

  // Định nghĩa các interface cho các loại request
  substituteRequests?: SubstituteRequest[];
  swapRequests?: SwapRequest[];
  makeupRequests?: MakeupRequest[];
  
  // Leave requests
  studentLeaveRequests?: StudentLeaveRequest[];
  teacherLeaveRequests?: TeacherLeaveRequest[];
}

// Định nghĩa các interface cho các loại request
export interface SubstituteRequest {
  _id: string;
  requestType: string;
  requestingTeacher: {
    _id: string;
    name: string;
    email: string;
    fullName?: string;
  };
  lesson: string;
  candidateTeachers: Array<{
    teacher: {
      _id: string;
      name: string;
      email: string;
      fullName?: string;
    };
    status: string;
  }>;
  reason: string;
  status: string;
  teacherApproved?: boolean;
  managerApproved?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  requestId: string;
  __v: number;
}

export interface SwapRequest {
  _id: string;
  requestType: string;
  requestingTeacher: {
    _id: string;
    name: string;
    email: string;
    fullName?: string;
  };
  replacementTeacher?: {
    _id: string;
    name: string;
    email: string;
    fullName?: string;
  };
  originalLesson?: {
    lessonId: string;
    scheduledDate: string;
    topic: string;
    status: string;
    type: string;
  };
  replacementLesson?: {
    lessonId: string;
    scheduledDate: string;
    topic: string;
    status: string;
    type: string;
  };
  status: string;
  teacherApproved?: boolean;
  managerApproved?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  requestId: string;
  __v: number;
}

export interface MakeupRequest {
  _id: string;
  requestType: string;
  requestingTeacher: {
    _id: string;
    name: string;
    email: string;
    fullName?: string;
  };
  originalLesson?: {
    lessonId: string;
    scheduledDate: string;
    topic: string;
    status: string;
    type: string;
  };
  replacementLesson?: {
    lessonId: string;
    scheduledDate: string;
    topic: string;
    status: string;
    type: string;
  };
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  requestId: string;
  __v: number;
}

export interface StudentLeaveRequest {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    fullName?: string;
  };
  teacherId?: {
    _id: string;
    name: string;
    email: string;
    fullName?: string;
  };
  classId: {
    _id: string;
    className: string;
  };
  subjectId?: {
    _id: string;
    subjectName: string;
    subjectCode: string;
  };
  lessonId: string;
  reason: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TeacherLeaveRequest {
  _id: string;
  teacherId: {
    _id: string;
    name: string;
    email: string;
    fullName?: string;
  };
  managerId?: {
    _id: string;
    name: string;
    email: string;
    fullName?: string;
  };
  classId?: {
    _id: string;
    className: string;
  };
  subjectId?: {
    _id: string;
    subjectName: string;
    subjectCode: string;
  };
  lessonId: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
