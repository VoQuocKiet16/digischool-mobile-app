import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { getMe } from "../services/auth.service";
import { UserData } from "../types/user.types";

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMe();
      if (response.success && response.data) {
        const roleInfo = response.data.roleInfo || {};
        if (response.data.homeroomClass) {
          roleInfo.homeroomClass = response.data.homeroomClass;
        }
        if (response.data.school) {
          roleInfo.school = response.data.school;
        }

        const userData: UserData = {
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone,
          address: response.data.address,
          dateOfBirth: response.data.dateOfBirth,
          gender: response.data.gender,
          studentId: response.data.studentId,
          teacherId: response.data.teacherId,
          managerId: response.data.managerId,
          class: response.data.class,
          subject: response.data.subject || null,
          roleInfo: roleInfo,
        };
        setUserData(userData);
        setError(null);

        // Cập nhật AsyncStorage với dữ liệu mới
        await updateAsyncStorage(response.data);
        setLoading(false);
      } else {
        // Nếu API không thành công, thử dùng dữ liệu từ storage
        await fallbackToStorageData();
      }
    } catch (err: any) {
      // Nếu có lỗi API, thử dùng dữ liệu từ storage
      await fallbackToStorageData();
    }
  }, []);

  const fallbackToStorageData = async () => {
    try {
      const userName = await AsyncStorage.getItem("userName");
      if (userName) {
        const userEmail = await AsyncStorage.getItem("userEmail");
        const userPhone = await AsyncStorage.getItem("userPhone");
        const userAddress = await AsyncStorage.getItem("userAddress");
        const userDateOfBirth = await AsyncStorage.getItem("userDateOfBirth");
        const userGender = await AsyncStorage.getItem("userGender");
        const userStudentId = await AsyncStorage.getItem("userStudentId");
        const userTeacherId = await AsyncStorage.getItem("userTeacherId");
        const userManagerId = await AsyncStorage.getItem("userManagerId");
        const userClassString = await AsyncStorage.getItem("userClass");
        const userSubjectsString = await AsyncStorage.getItem("userSubjects");
        const userRoleInfoString = await AsyncStorage.getItem("userRoleInfo");

        const roleInfo = userRoleInfoString
          ? JSON.parse(userRoleInfoString)
          : {};

        const userFromStorage: UserData = {
          name: userName,
          email: userEmail || "",
          phone: userPhone,
          address: userAddress,
          dateOfBirth: userDateOfBirth,
          gender: userGender,
          studentId: userStudentId,
          teacherId: userTeacherId,
          managerId: userManagerId,
          class: userClassString ? JSON.parse(userClassString) : null,
          subject: userSubjectsString ? JSON.parse(userSubjectsString) : null,
          roleInfo: roleInfo,
        };
        setUserData(userFromStorage);
        setError(null);
      } else {
        setError("Không thể tải thông tin người dùng");
      }
    } catch (storageErr) {
      setError("Không thể tải thông tin người dùng");
    } finally {
      setLoading(false);
    }
  };

  const updateAsyncStorage = async (data: any) => {
    try {
      if (data.name) {
        await AsyncStorage.setItem("userName", data.name);
      }
      if (data.email) {
        await AsyncStorage.setItem("userEmail", data.email);
      }
      if (data.phone !== null) {
        await AsyncStorage.setItem("userPhone", data.phone);
      }
      if (data.address !== null) {
        await AsyncStorage.setItem("userAddress", data.address);
      }
      if (data.dateOfBirth !== null) {
        await AsyncStorage.setItem("userDateOfBirth", data.dateOfBirth);
      }
      if (data.gender !== null) {
        await AsyncStorage.setItem("userGender", data.gender);
      }
      if (data.studentId !== null) {
        await AsyncStorage.setItem("userStudentId", data.studentId);
      }
      if (data.teacherId !== null) {
        await AsyncStorage.setItem("userTeacherId", data.teacherId);
      }
      if (data.managerId !== null) {
        await AsyncStorage.setItem("userManagerId", data.managerId);
      }
      if (data.class !== null) {
        await AsyncStorage.setItem("userClass", JSON.stringify(data.class));
      }
      if (data.subject != null) {
        await AsyncStorage.setItem(
          "userSubjects",
          JSON.stringify(data.subject)
        );
      }
      if (data.roleInfo) {
        await AsyncStorage.setItem(
          "userRoleInfo",
          JSON.stringify(data.roleInfo)
        );
      }
    } catch (error) {
    }
  };

  const refreshUserData = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Reload dữ liệu khi focus vào trang (khi quay lại từ trang khác)
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );


  return {
    userData,
    loading,
    error,
    refreshUserData,
  };
};
