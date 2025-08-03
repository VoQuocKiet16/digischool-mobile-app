import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef } from "react";
import { getMe } from "../services/auth.service";

export const useSessionCheck = () => {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Check session every 5 minutes
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          // Try to call getMe to check if session is still valid
          await getMe();
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Session is expired, API interceptor will handle it
          console.log("Session expired detected in periodic check");
        }
      }
    };

    // Check immediately on mount
    checkSession();

    // Set up periodic check every 5 minutes
    intervalRef.current = setInterval(checkSession, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null;
}; 