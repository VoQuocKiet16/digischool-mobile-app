import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect } from "react";
import { handleSessionExpiration } from "../services/auth.service";

interface SessionContextType {
  handleLoginAgain: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within SessionProvider");
  }
  return context;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const handleLoginAgain = async () => {
    try {
      // Clear session data
      await handleSessionExpiration();
      
      // Navigate to auth screen
      router.replace("/auth");
    } catch (error) {
      console.error("Error handling login again:", error);
      // Still navigate to auth even if there's an error
      router.replace("/auth");
    }
  };

  // Check session status on app start
  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          // No token means user needs to login
          router.replace("/auth");
        }
      } catch (error) {
        console.error("Error checking session status:", error);
        router.replace("/auth");
      }
    };

    checkSessionStatus();
  }, []);

  const value: SessionContextType = {
    handleLoginAgain,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider; 