export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    CHANGE_PASSWORD: "/api/auth/change-password",
    REFRESH_TOKEN: "/api/auth/refresh-token",
    SET_PASSWORD: "/api/users/set-password",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    GET_ME: "/api/auth/me",
  },
};

export const API_ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối internet.",
  UNKNOWN_ERROR: "Đã xảy ra lỗi không xác định. Vui lòng thử lại.",
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác.",
  SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại.",
};
