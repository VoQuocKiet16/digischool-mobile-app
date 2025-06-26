export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CHANGE_PASSWORD: '/api/auth/change-password',
    REFRESH_TOKEN: '/api/auth/refresh-token',
  },
};

export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to server. Please check your network connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again later.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  SERVER_ERROR: 'Server error. Please try again later.',
};