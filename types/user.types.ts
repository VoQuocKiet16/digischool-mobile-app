export interface RoleInfo {
  homeroomClass?: string;
  school?: string;
  type?: string;
  [key: string]: any;
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
  subjects: any | null;
  roleInfo: RoleInfo | null;
}
