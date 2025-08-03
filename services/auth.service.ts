import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../constants/api.constants";
import api from "./api.config";

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    // Không lưu token vào AsyncStorage ở đây nữa, để xử lý ở login.tsx
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: "Lỗi không xác định. Vui lòng thử lại." };
  }
};

export const logout = async () => {
  try {
    // Clear all session data first to avoid authorization errors
    await AsyncStorage.multiRemove([
      "token", 
      "userId", 
      "role", 
      "userName", 
      "userEmail", 
      "userPhone", 
      "userAddress", 
      "userRoleInfo", 
      "userInfo"
    ]);

    // Then send logout request to server
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  } catch (error: any) {
    // If there's an error sending logout request, still ensure local data is cleared
    await AsyncStorage.multiRemove([
      "token", 
      "userId", 
      "role", 
      "userName", 
      "userEmail", 
      "userPhone", 
      "userAddress", 
      "userRoleInfo", 
      "userInfo"
    ]);

    // If error is due to authorization (401, 403), consider logout successful
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      return { success: true, message: "Đăng xuất thành công" };
    }

    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: "Lỗi không xác định. Vui lòng thử lại." };
  }
};

// Function to handle session expiration
export const handleSessionExpiration = async () => {
  try {
    // Clear all session data
    await AsyncStorage.multiRemove([
      "token", 
      "userId", 
      "role", 
      "userName", 
      "userEmail", 
      "userPhone", 
      "userAddress", 
      "userRoleInfo", 
      "userInfo"
    ]);
    
    return { success: true, message: "Session cleared" };
  } catch (error) {
    console.error("Error clearing session:", error);
    throw error;
  }
};

export const setPasswordNewUser = async (
  tempToken: string,
  password: string,
  confirmPassword: string
) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.SET_PASSWORD, {
      tempToken,
      password,
      confirmPassword,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: "Lỗi không xác định. Vui lòng thử lại." };
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: "Lỗi không xác định. Vui lòng thử lại." };
  }
};

export const getMe = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.AUTH.GET_ME);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: "Lỗi không xác định. Vui lòng thử lại." };
  }
};

export const updatePersonalInfo = async (data: {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
}) => {
  try {
    const response = await api.put(API_ENDPOINTS.AUTH.UPDATE_PERSONAL_INFO, data);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: "Lỗi không xác định. Vui lòng thử lại." };
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw { message: "Lỗi không xác định. Vui lòng thử lại." };
  }
};
