export function getLessonSubtitle(lessonData: any) {
  if (!lessonData) return "Đang tải thông tin tiết học...";
  const session = lessonData.timeSlot?.session === "morning" ? "Sáng" : "Chiều";
  const period = `Tiết ${lessonData.timeSlot?.period || 1}`;
  const subject = lessonData.subject?.name || lessonData.fixedInfo?.description || "Chưa rõ";
  const className = lessonData.class?.className || "Chưa rõ";
  return `${session} • ${period} • ${subject} • ${className}`;
} 