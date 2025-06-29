import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINTS } from "../constants/api.constants";
import api from "./api.config";

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    if (response.data.success && response.data?.data?.token) {
      await AsyncStorage.setItem("token", response.data.data.token);
      await AsyncStorage.setItem(
        "role",
        JSON.stringify(response.data.data.user.role)
      );
      await AsyncStorage.setItem("userName", response.data.data.user.name);
      // TODO: Điều hướng sang màn hình tiếp theo hoặc theo response.data.data.redirectTo
    }
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