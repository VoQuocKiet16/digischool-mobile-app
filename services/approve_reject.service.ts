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
    default:
      throw new Error("Loại yêu cầu không hợp lệ");
  }
  return api.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
};

// Có thể mở rộng thêm các hàm riêng biệt nếu muốn rõ ràng hơn:
export const approveSubstituteRequest = (requestId: string, token: string) =>
  api.post(`/api/schedules/lesson-request/substitute/${requestId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });

export const rejectSubstituteRequest = (requestId: string, token: string) =>
  api.post(`/api/schedules/lesson-request/substitute/${requestId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });

export const approveSwapRequest = (requestId: string, token: string) =>
  api.post(`/api/schedules/lesson-request/swap/${requestId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });

export const rejectSwapRequest = (requestId: string, token: string) =>
  api.post(`/api/schedules/lesson-request/swap/${requestId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });

export const approveMakeupRequest = (requestId: string, token: string) =>
  api.post(`/api/schedules/lesson-request/makeup/${requestId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });

export const rejectMakeupRequest = (requestId: string, token: string) =>
  api.post(`/api/schedules/lesson-request/makeup/${requestId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
