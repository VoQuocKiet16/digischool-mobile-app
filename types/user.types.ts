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
