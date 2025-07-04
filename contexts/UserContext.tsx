import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<any>(null);

  // Khi app khởi động, lấy userData từ AsyncStorage nếu có
  useEffect(() => {
    (async () => {
      const userRoleInfoString = await AsyncStorage.getItem("userRoleInfo");
      const userInfoString = await AsyncStorage.getItem("userInfo");
      let userData: any = {};
      if (userRoleInfoString) {
        userData.roleInfo = JSON.parse(userRoleInfoString);
      }
      if (userInfoString) {
        const info = JSON.parse(userInfoString);
        userData = { ...userData, ...info };
      }
      if (userData && (userData.roleInfo || userData.name)) {
        setUserData(userData);
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