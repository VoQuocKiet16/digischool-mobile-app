import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const baseURL = "http://192.168.1.7:8080";
// export const baseURL = "https://digischool-app-374067302360.asia-southeast1.run.app";


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

export default api;
