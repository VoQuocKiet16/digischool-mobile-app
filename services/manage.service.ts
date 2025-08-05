
import api from './api.config';
import { getAllSubjects } from './subjects.service';

export interface TeacherRollcallData {
  teacherId: string;
  teacherName: string;
  class: string;
  subject: string;
  period: number;
  startTime: string;
  endTime: string;
  status: 'Đã điểm danh' | 'Chưa điểm danh' | 'Trễ';
  completedAt?: string;
  isFirstLessonOfDay: boolean;
  lessonId: string;
}

export interface TeacherRollcallResponse {
  date: string;
  totalTeachers: number;
  attended: number;
  absent: number;
  late: number;
  rollcalls: TeacherRollcallData[];
}

export interface WeekDaysResponse {
  weekNumber: number;
  academicYear: string;
  className?: string;
  startDate: string;
  endDate: string;
  days: {
    date: string;
    dayOfWeek: number;
    dayName: string;
    formattedDate: string;
    isToday: boolean;
  }[];
}

export interface TeachingProgressData {
  gradeLevel: number;
  semester: number;
  weekNumber: number;
  academicYear: string;
  classes: string[];
  requirements: { [key: string]: number };
  progressData: {
    subject: string;
    data: number[];
  }[];
  weekDates: {
    startDate: string;
    endDate: string;
  };
}

export interface LessonRequirements {
  [key: string]: number;
}

export interface ClassesByGrade {
  _id: string;
  className: string;
  gradeLevel: number;
}

export interface AccountData {
  _id: string;
  id?: string; // Backend có thể trả về id thay vì _id
  name: string;
  email: string;
  role: string;
  active: boolean;
  studentId?: string;
  teacherId?: string;
  className?: string;
  subjectName?: string;
  gradeLevel?: number;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  // Các trường có thể có từ API
  class?: string;
  subject?: string;
  code?: string;
}

export interface AccountsResponse {
  accounts: AccountData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AccountDetailResponse {
  _id: string;
  id?: string; // Backend có thể trả về id thay vì _id
  name: string;
  email: string;
  role: string | string[]; // Có thể là string hoặc array
  active: boolean;
  studentId?: string;
  teacherId?: string;
  className?: string;
  subjectName?: string;
  gradeLevel?: number;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  // Các trường mới từ API
  code?: string;
  subject?: string;
  subjectCode?: string;
  subjects?: string[];
  class?: {
    name: string;
    gradeLevel?: number;
    academicYear?: string;
  };
  homeroomClass?: {
    id: string;
    name: string;
    gradeLevel: number;
    academicYear: string;
  };
  roleInfo?: {
    type: string;
    isHomeroom?: boolean;
    isHomeroomTeacher?: boolean;
  };
}

export interface ImportScheduleResponse {
  success: boolean;
  message: string;
  data: {
    errors: string[];
    createdTeachers: any[];
    updatedClasses: any[];
    teacherMappings: any[];
    totalLessons: number;
    totalTeachersCreated: number;
    totalClassesUpdated: number;
    totalTeacherMappings: number;
  };
}

export interface ImportScheduleData {
  academicYear: string;
  gradeLevel: string;
  semester: string;
  weekNumber?: string;
  startDate?: string;
  endDate?: string;
  file: any; // File object
}

// Feedback interfaces
export interface FeedbackData {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  adminResponse?: string;
  respondedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbacksResponse {
  feedbacks: FeedbackData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FeedbackStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  averageRating: number;
}

export interface ImportAccountsResponse {
  success: boolean;
  message: string;
  data: {
    success: any[];
    failed: any[];
    total: number;
  };
}

export interface ImportAccountsData {
  file: any; // File object
  accountType: 'student' | 'teacher' | 'parent';
}

class ManageService {
  /**
   * Lấy dữ liệu điểm danh giáo viên theo ngày
   */
  async getTeacherRollcall(date: string, filters?: {
    status?: string;
    subject?: string;
    weekNumber?: number;
    academicYear?: string;
  }): Promise<TeacherRollcallResponse> {
    try {
      const params = new URLSearchParams();
      
      // Convert date format từ dd/mm/yyyy sang yyyy-mm-dd
      const convertDateFormat = (date: string) => {
        if (!date) return '';
        const parts = date.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return date;
      };
      
      params.append('date', convertDateFormat(date));
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.subject) params.append('subject', filters.subject);
      if (filters?.weekNumber) params.append('weekNumber', filters.weekNumber.toString());
      if (filters?.academicYear) params.append('academicYear', filters.academicYear);

      const response = await api.get(`/api/statistics/teacher-rollcall?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu điểm danh giáo viên:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách ngày trong tuần dựa trên TKB
   */
  async getWeekDays(weekNumber?: number, academicYear?: string, className?: string): Promise<WeekDaysResponse> {
    try {
      const params = new URLSearchParams();
      if (weekNumber) params.append('weekNumber', weekNumber.toString());
      if (academicYear) params.append('academicYear', academicYear);
      if (className) params.append('className', className);

      const response = await api.get(`/api/statistics/week-days?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ngày trong tuần:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách môn học
   */
  async getSubjects(): Promise<string[]> {
    try {
      const response = await getAllSubjects();
      if (response.success && response.data?.subjects) {
        return response.data.subjects.map((subject: any) => subject.subjectName);
      }
      
      // Trả về danh sách mặc định nếu không có data
      return [
        "Tất cả",
        "Toán",
        "Ngữ Văn",
        "Vật lý",
        "Hóa học",
        "Sinh học",
        "Lịch sử",
        "Địa lý",
        "GDCD",
        "Ngoại ngữ",
        "Thể dục",
        "GDQP",
        "Tin học",
        "Công nghệ",
      ];
    } catch (error) {
      console.error('Lỗi khi lấy danh sách môn học:', error);
      // Trả về danh sách mặc định nếu API lỗi
      return [
        "Tất cả",
        "Toán",
        "Ngữ Văn",
        "Vật lý",
        "Hóa học",
        "Sinh học",
        "Lịch sử",
        "Địa lý",
        "GDCD",
        "Ngoại ngữ",
        "Thể dục",
        "GDQP",
        "Tin học",
        "Công nghệ",
      ];
    }
  }

  /**
   * Lấy dữ liệu tiến trình dạy học
   */
  async getTeachingProgress(gradeLevel: number, semester: number, weekNumber: number, academicYear: string): Promise<TeachingProgressData> {
    try {
      const params = new URLSearchParams();
      params.append('gradeLevel', gradeLevel.toString());
      params.append('semester', semester.toString());
      params.append('weekNumber', weekNumber.toString());
      params.append('academicYear', academicYear);

      const response = await api.get(`/api/statistics/teaching-progress?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu tiến trình dạy học:', error);
      throw error;
    }
  }

  /**
   * Lấy cấu hình số tiết yêu cầu
   */
  async getLessonRequirements(gradeLevel: number, semester: number, academicYear: string): Promise<LessonRequirements> {
    try {
      const params = new URLSearchParams();
      params.append('gradeLevel', gradeLevel.toString());
      params.append('semester', semester.toString());
      params.append('academicYear', academicYear);

      const response = await api.get(`/api/statistics/lesson-requirements?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy cấu hình số tiết yêu cầu:', error);
      throw error;
    }
  }

  /**
   * Cập nhật cấu hình số tiết yêu cầu
   */
  async updateLessonRequirements(gradeLevel: number, semester: number, academicYear: string, requirements: LessonRequirements): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.append('gradeLevel', gradeLevel.toString());
      params.append('semester', semester.toString());
      params.append('academicYear', academicYear);

      const response = await api.put(`/api/statistics/lesson-requirements?${params.toString()}`, {
        requirements
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật cấu hình số tiết yêu cầu:', error);
      throw error;
    }
  }

  /**
   * Khởi tạo cấu hình mặc định
   */
  async initializeDefaultRequirements(gradeLevel: number, semester: number, academicYear: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      params.append('gradeLevel', gradeLevel.toString());
      params.append('semester', semester.toString());
      params.append('academicYear', academicYear);

      const response = await api.post(`/api/statistics/lesson-requirements/initialize?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi khởi tạo cấu hình mặc định:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách lớp theo khối
   */
  async getClassesByGrade(gradeLevel: number, academicYear: string): Promise<ClassesByGrade[]> {
    try {
      const params = new URLSearchParams();
      params.append('gradeLevel', gradeLevel.toString());
      params.append('academicYear', academicYear);

      const response = await api.get(`/api/statistics/classes-by-grade?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lớp theo khối:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tài khoản cho quản lý
   */
  async getAccountsForManagement(filters?: {
    role?: string;
    search?: string;
    gradeLevel?: number;
    className?: string;
    page?: number;
    limit?: number;
  }): Promise<AccountsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.role) params.append('role', filters.role);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.gradeLevel) params.append('gradeLevel', filters.gradeLevel.toString());
      if (filters?.className) params.append('className', filters.className);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/api/users/management/accounts?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tài khoản:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách lớp theo khối
   */
  async getClassesByGradeForManagement(gradeLevel: number): Promise<string[]> {
    try {
      const params = new URLSearchParams();
      params.append('gradeLevel', gradeLevel.toString());

      const response = await api.get(`/api/users/management/classes?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách lớp:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin chi tiết tài khoản
   */
  async getAccountDetail(id: string): Promise<AccountDetailResponse> {
    try {
      const response = await api.get(`/api/users/management/accounts/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin tài khoản:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái tài khoản
   */
  async updateAccountStatus(id: string, active: boolean): Promise<any> {
    try {
      const response = await api.patch(`/api/users/${id}/status`, { active });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái tài khoản:', error);
      throw error;
    }
  }

  /**
   * Xóa tài khoản
   */
  async deleteAccount(id: string): Promise<any> {
    try {
      const response = await api.delete(`/manage/accounts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async importScheduleFromExcel(data: ImportScheduleData): Promise<ImportScheduleResponse> {
    try {
      const formData = new FormData();
      
      // Thêm file
      formData.append('file', data.file);
      
      // Thêm các trường dữ liệu khác
      formData.append('academicYear', data.academicYear);
      formData.append('gradeLevel', data.gradeLevel);
      formData.append('semester', data.semester);
      
      if (data.weekNumber) {
        formData.append('weekNumber', data.weekNumber);
      }
      if (data.startDate) {
        formData.append('startDate', data.startDate);
      }
      if (data.endDate) {
        formData.append('endDate', data.endDate);
      }

      const response = await api.post('api/schedules/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Lấy danh sách feedback của phụ huynh (cho manager)
   */
  async getParentFeedbacks(filters?: {
    status?: string;
    rating?: number;
    page?: number;
    limit?: number;
  }): Promise<FeedbacksResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.rating) params.append('rating', filters.rating.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/api/parents/feedback?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách feedback:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê feedback
   */
  async getFeedbackStats(): Promise<FeedbackStats> {
    try {
      const response = await api.get('/api/parents/feedback/stats');
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy thống kê feedback:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái feedback
   */
  async updateFeedbackStatus(feedbackId: string, status: string, adminResponse?: string): Promise<any> {
    try {
      const response = await api.patch(`/api/parents/feedback/${feedbackId}/status`, {
        status,
        adminResponse
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái feedback:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết feedback
   */
  async getFeedbackDetail(feedbackId: string): Promise<FeedbackData> {
    try {
      const response = await api.get(`/api/parents/feedback/${feedbackId}`);
      return response.data.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết feedback:', error);
      throw error;
    }
  }

  async importStudentsFromExcel(data: ImportAccountsData): Promise<ImportAccountsResponse> {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      
      const response = await api.post('api/users/import-students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async importTeachersFromExcel(data: ImportAccountsData): Promise<ImportAccountsResponse> {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      
      const response = await api.post('api/users/import-teachers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async importParentsFromExcel(data: ImportAccountsData): Promise<ImportAccountsResponse> {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      
      const response = await api.post('api/users/import-parents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async createStudent(studentData: any): Promise<any> {
    try {
      const response = await api.post('api/users/create-student', studentData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async createTeacher(teacherData: any): Promise<any> {
    try {
      const response = await api.post('api/users/create-teacher', teacherData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async createParent(parentData: any): Promise<any> {
    try {
      const response = await api.post('api/users/create-parent', parentData);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export default new ManageService(); 