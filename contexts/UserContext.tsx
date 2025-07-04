import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<any>(null);

  // Khi app khởi động, lấy userData từ AsyncStorage nếu có
  useEffect(() => {
    (async () => {
      const userRoleInfoString = await AsyncStorage.getItem("userRoleInfo");
      if (userRoleInfoString) {
        const roleInfo = JSON.parse(userRoleInfoString);
        setUserData({ roleInfo });
      }
    })();
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);

export default UserProvider; 