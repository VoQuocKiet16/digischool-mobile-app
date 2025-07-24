export function getLessonSubtitle(lessonData: any) {
    if (!lessonData) return "Đang tải thông tin tiết học...";
    
    // Xác định buổi sáng/chiều dựa vào period
    const period = lessonData.timeSlot?.period || 1;
    const session = period <= 5 ? "Sáng" : "Chiều";
    const periodText = `Tiết ${period}`;
    
    // Sử dụng subjectName thay vì name, và topic cho tiết cố định
    const subject = lessonData.subject?.subjectName || lessonData.topic || "Chưa rõ";
    const className = lessonData.class?.className || "Chưa rõ";
    
    return `${session} • ${periodText} • ${subject} • ${className}`;
  }