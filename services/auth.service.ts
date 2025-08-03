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
    // Xóa dữ liệu local trước để tránh lỗi authorization
    await AsyncStorage.multiRemove(["token", "role", "userName"]);

    // Sau đó mới gửi request logout đến server
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  } catch (error: any) {
    // Nếu có lỗi khi gửi request logout, vẫn đảm bảo dữ liệu local đã được xóa
    await AsyncStorage.multiRemove(["token", "role", "userName"]);

    // Nếu lỗi là do authorization (401, 403), coi như logout thành công
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
