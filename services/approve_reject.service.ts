import api from "./api.config";

export const approveOrRejectRequest = async (
  requestType: string,
  requestId: string,
  action: "approve" | "reject",
  token: string
) => {
  let url = "";
  switch (requestType) {
    case "substitute_request":
      url = `/api/schedules/lesson-request/substitute/${requestId}/${action}`;
      break;
    case "swap_request":
      url = `/api/schedules/lesson-request/swap/${requestId}/${action}`;
      break;
    case "makeup_request":
      url = `/api/schedules/lesson-request/makeup/${requestId}/${action}`;
      break;
    case "teacher_leave_request":
      url = `/api/teacher-leave-requests/${requestId}/${action}`;
      break;
    case "student_leave_request":
      url = `/api/student-leave-requests/${requestId}/${action}`;
      break;
    default:
      throw new Error("Loại yêu cầu không hợp lệ");
  }
  return api.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
};
