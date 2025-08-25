export interface RoleInfo {
  homeroomClass?: any;
  school?: any;
  type?: string;
  [key: string]: any;
}

export interface Subject {
  id: string;
  subjectName: string;
  subjectCode: string;
  description: string;
}

export interface UserData {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  studentId: string | null;
  teacherId: string | null;
  managerId: string | null;
  class: any | null;
  subject: Subject | null;
  roleInfo: RoleInfo | null;
}

export interface LeaveRequest {
  _id: string;
  requestType: "lesson" | "day";
  lessonIds?: string[];
  date?: string;
  phoneNumber: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  studentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonLeaveRequest {
  lessonIds: string[];
  phoneNumber: string;
  reason: string;
}

export interface CreateDayLeaveRequest {
  date: string;
  phoneNumber: string;
  reason: string;
}
