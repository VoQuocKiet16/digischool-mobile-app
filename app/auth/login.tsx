import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import LoadingModal from "../../components/LoadingModal";
import { API_ERROR_MESSAGES } from "../../constants/api.constants";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { useUserContext } from "../../contexts/UserContext";
import { getMe, login } from "../../services/auth.service";
import { fonts, getFontStyle } from "../../utils/responsive";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter();
  const { setUserData } = useUserContext();
  const { reconnectSocket } = useNotificationContext();

  const isValid = email.trim() !== "" && password.trim() !== "" && emailError === "";

  // Hàm kiểm tra format email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() === "") {
      setEmailError("");
    } else if (!emailRegex.test(email)) {
      setEmailError("Email không đúng định dạng");
    } else {
      setEmailError("");
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateEmail(text);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {

      // Clear any existing session data before login
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

      const res = await login(email, password);
      
      const token = res.data?.token || res.data?.tempToken;
      if (res.success && token) {
        
        if (
          res.data?.redirectTo === "set-password" &&
          res.data?.user?.isNewUser
        ) {
          router.push({
            pathname: "/auth/set-password",
            params: {
              token: token,
              email: email,
              isNewUser: res.data.user.isNewUser,
            },
          });
        } else {
          await AsyncStorage.setItem("token", token);
          try {
            const userResponse = await getMe();
            
            if (userResponse.success && userResponse.data) {
              
              if (userResponse.data._id) {
                await AsyncStorage.setItem("userId", userResponse.data._id);
              }
              if (userResponse.data.role) {
                await AsyncStorage.setItem(
                  "role",
                  JSON.stringify(userResponse.data.role)
                );
              }
              if (userResponse.data.name) {
                await AsyncStorage.setItem("userName", userResponse.data.name);
              }
              if (userResponse.data.email) {
                await AsyncStorage.setItem(
                  "userEmail",
                  userResponse.data.email
                );
              }

              if (userResponse.data.phone != null) {
                await AsyncStorage.setItem(
                  "userPhone",
                  userResponse.data.phone
                );
              }
              if (userResponse.data.address != null) {
                await AsyncStorage.setItem(
                  "userAddress",
                  userResponse.data.address
                );
              }
              if (userResponse.data.dateOfBirth != null) {
                await AsyncStorage.setItem(
                  "userDateOfBirth",
                  userResponse.data.dateOfBirth
                );
              }
              if (userResponse.data.gender != null) {
                await AsyncStorage.setItem(
                  "userGender",
                  userResponse.data.gender
                );
              }

              if (userResponse.data.studentId != null) {
                await AsyncStorage.setItem(
                  "userStudentId",
                  userResponse.data.studentId
                );
              }
              if (userResponse.data.id != null) {
                await AsyncStorage.setItem(
                  "userTeacherId",
                  userResponse.data.id
                );
              }
              if (userResponse.data.managerId != null) {
                await AsyncStorage.setItem(
                  "userManagerId",
                  userResponse.data.managerId
                );
              }

              if (userResponse.data.class) {
                await AsyncStorage.setItem(
                  "userClass",
                  JSON.stringify(userResponse.data.class)
                );
              }
              if (userResponse.data.subjects) {
                await AsyncStorage.setItem(
                  "userSubjects",
                  JSON.stringify(userResponse.data.subjects)
                );
              }

              if (userResponse.data.roleInfo) {
                const roleInfo = {
                  ...userResponse.data.roleInfo,
                  role: userResponse.data.role || [],
                  type:
                    userResponse.data.roleInfo.type ||
                    (userResponse.data.role && userResponse.data.role[0]) ||
                    "",
                };
                await AsyncStorage.setItem(
                  "userRoleInfo",
                  JSON.stringify(roleInfo)
                );
              }
              if (userResponse.data.id) {
                await AsyncStorage.setItem("userId", userResponse.data.id);
              }
              setUserData(userResponse.data);
              
              // Reconnect socket với user mới
              reconnectSocket();
              
              router.replace("/");
            }
          } catch (error) {
            if (res.data?.user?.role) {
              await AsyncStorage.setItem(
                "role",
                JSON.stringify(res.data.user.role)
              );
            }
            if (res.data?.user?.name) {
              await AsyncStorage.setItem("userName", res.data.user.name);
            }
            if (res.data?.user?.email) {
              await AsyncStorage.setItem("userEmail", res.data.user.email);
            }
            router.replace("/");
          }
        }
      } else {
        setError(API_ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    } catch (err: any) {
      setError(err?.message || API_ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FFFFFF", "#B3E5FC"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text style={styles.title}>Hãy Bắt Đầu Nào!</Text>
            <Text style={styles.subtitle}>
              Biến ứng dụng trường học{"\n"}thành trợ lý cá nhân của bạn
            </Text>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="email"
                size={22}
                color="#29375C"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập email"
                placeholderTextColor="#7a869a"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {email.length > 0 && (
                <TouchableOpacity
                  onPress={() => setEmail("")}
                  style={{ position: "relative" }}
                >
                  <Icon name="close" size={25} color="#29375C" />
                </TouchableOpacity>
              )}
            </View>
            {emailError ? (
              <Text style={{ color: "red", marginBottom: 8, ...getFontStyle(fonts.regular) }}>
                {emailError}
              </Text>
            ) : null}

            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={22}
                color="#29375C"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { marginTop: 5 }]}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#7a869a"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              {password.length > 0 && (
                <TouchableOpacity
                  onPress={() => setPassword("")}
                  style={{ position: "relative" }}
                >
                  <Icon
                    name="close"
                    size={25}
                    color="#29375C"
                    style={{ marginRight: 10 }}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={22}
                  color="#29375C"
                />
              </TouchableOpacity>
            </View>

            {error ? (
              <Text
                style={{ color: "red", marginBottom: 8, ...getFontStyle(fonts.regular) }}
              >
                {error}
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/auth/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                isValid
                  ? { backgroundColor: "#29375C" }
                  : { backgroundColor: "rgba(41,55,92,0.3)" },
              ]}
              disabled={!isValid || loading}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
        <LoadingModal visible={loading} text="Đang đăng nhập..." />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    ...getFontStyle(fonts.semiBold),
    color: "#29375C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    ...getFontStyle(fonts.regular),
    color: "#29375C",
    marginBottom: 85,
    lineHeight: 26,
  },
  label: {
    fontSize: 16,
    ...getFontStyle(fonts.semiBold),
    color: "#29375C",
    marginBottom: 6,
    marginTop: 12,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(41,55,92,0.2)",
    paddingHorizontal: 16,
    marginBottom: 8,
    height: 58,
  },
  inputIcon: {
    marginRight: 12,
    fontSize: 28,
  },
  input: {
    flex: 1,
    fontSize: 18,
    ...getFontStyle(fonts.regular),
    color: "#29375C",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#29375C",
    fontSize: 14,
    textDecorationLine: "underline",
    ...getFontStyle(fonts.semiBold),
  },
  loginButton: {
    backgroundColor: "#29375C",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    ...getFontStyle(fonts.medium),
  },
});
