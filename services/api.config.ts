import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";

// export const baseURL = "http://192.168.2.226:8080";
// export const baseURL = "https://05ffd66f795c.ngrok-free.app"; 
export const baseURL = "https://digischool-app-374067302360.asia-southeast1.run.app";

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để tự động gắn token vào header
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm response interceptor để xử lý session expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const message = error.response?.data?.message;
      
      // Chỉ xử lý session expiration khi có token (không phải login failure)
      const token = await AsyncStorage.getItem("token");
      if (token) {
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
          "userInfo",
          "userDateOfBirth",
          "userGender",
          "userStudentId",
          "userTeacherId",
          "userManagerId",
          "userClass",
          "userSubjects"
        ]);
        
        // Determine appropriate message based on error
        let alertMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        
        if (message === "Session expired. Please login again.") {
          alertMessage = "Tài khoản đã đăng nhập trên thiết bị khác. Vui lòng đăng nhập lại.";
        } else if (message === "Token has been invalidated. Please login again.") {
          alertMessage = "Phiên đăng nhập đã bị vô hiệu hóa. Vui lòng đăng nhập lại.";
        }
        
        // Show alert and redirect to login
        Alert.alert(
          "Phiên đăng nhập",
          alertMessage,
          [
            {
              text: "Đăng nhập lại",
              onPress: () => {
                // Import router here to avoid circular dependency
                const { router } = require("expo-router");
                router.replace("/auth");
              }
            }
          ],
          { cancelable: false }
        );
        
        // Return resolved promise to prevent error from propagating
        return Promise.resolve();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
