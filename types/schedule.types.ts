export interface Activity {
  text: string;
  type: "default" | "user-added" | "user-activity" | "conflict";
  content?: string;
  time?: number;
  remindAt?: string;
  date?: string;
  lessonId?: string;
  subject?: any;
  teacher?: any;
  isMakeupLesson?: boolean;
  lessonText?: string;
  activityText?: string;
  activityData?: {
    content?: string;
    time?: number;
    remindAt?: string;
    date?: string;
    id?: string;
  };
  hasConflict?: boolean;
  status?: string; // Thêm status để xử lý completed
  hasNotification?: boolean; // Thêm hasNotification để hiển thị notification pin
  [key: string]: any;
} 