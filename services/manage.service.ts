
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
}

export default new ManageService(); 