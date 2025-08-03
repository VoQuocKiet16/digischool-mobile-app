import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LoadingModal from "../../components/LoadingModal";
import SuccessModal from "../../components/notifications_modal/SuccessModal";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { changePassword, logout } from "../../services/auth.service";
import { fonts } from "../../utils/responsive";

const ChangePassword: React.FC = () => {
  const router = useRouter();
  const { reconnectSocket } = useNotificationContext();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const isFilled = currentPassword && newPassword && confirmPassword;

  // Password criteria check
  const passwordCriteria = [
    {
      label: "Độ dài từ 8-20 ký tự",
      valid: newPassword.length >= 8 && newPassword.length <= 20,
    },
    {
      label: "Có ít nhất 1 ký tự đặc biệt",
      valid: /[!@#$%^&*(),.?":{}|<>\[\]\\/\-_+=~`';]/.test(newPassword),
    },
    {
      label: "Có ít nhất 1 số",
      valid: /[0-9]/.test(newPassword),
    },
    {
      label: "Có ít nhất 1 chữ cái viết hoa",
      valid: /[A-Z]/.test(newPassword),
    },
  ];

  const allPasswordCriteriaValid = passwordCriteria.every((item) => item.valid);

  const handleSave = async () => {
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    
    let hasError = false;

    // Validate current password
    if (!currentPassword) {
      setCurrentPasswordError("Vui lòng nhập mật khẩu hiện tại");
      hasError = true;
    }

    // Validate new password
    if (!newPassword) {
      setNewPasswordError("Vui lòng nhập mật khẩu mới");
      hasError = true;
    } else if (!allPasswordCriteriaValid) {
      setNewPasswordError("Mật khẩu mới không hợp lệ");
      hasError = true;
    } else if (newPassword === currentPassword) {
      setNewPasswordError("Mật khẩu mới không được trùng mật khẩu cũ");
      hasError = true;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError("Vui lòng xác nhận mật khẩu mới");
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Xác nhận mật khẩu không khớp");
      hasError = true;
    }

    if (hasError) {
      setShowPasswordCriteria(false);
      return;
    }

    setLoading(true);
    
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setLoading(false);
      setShowSuccess(true);
    } catch (error: any) {
      setLoading(false);
      
      // Reset all errors first
      setCurrentPasswordError("");
      setNewPasswordError("");
      setConfirmPasswordError("");
      
      if (error.message) {
        // Check for specific error messages and map to correct fields
        if (error.message.includes("Mật khẩu hiện tại không đúng")) {
          setCurrentPasswordError(error.message);
        } else if (error.message.includes("Mật khẩu mới không được trùng mật khẩu cũ")) {
          setNewPasswordError(error.message);
        } else if (error.message.includes("Xác nhận mật khẩu không khớp")) {
          setConfirmPasswordError(error.message);
        } else {
          // For other validation errors, show in new password field
          setNewPasswordError(error.message);
        }
      }
      setShowPasswordCriteria(false);
    }
  };

  return (
    <HeaderLayout title="Đổi mật khẩu" onBack={() => router.back()}>
      <View style={styles.container}>
        <Text style={styles.label}>Nhập mật khẩu hiện tại</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed"
            size={22}
            color="#29375C"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu hiện tại"
            placeholderTextColor="#7a869a"
            value={currentPassword}
            onChangeText={(text) => {
              setCurrentPassword(text);
              setCurrentPasswordError("");
            }}
            secureTextEntry={!showPassword}
          />
        </View>
        {currentPasswordError ? (
          <Text style={styles.errorText}>{currentPasswordError}</Text>
        ) : null}

        <Text style={styles.label}>Nhập mật khẩu mới</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed"
            size={22}
            color="#29375C"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu mới"
            placeholderTextColor="#7a869a"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setNewPasswordError("");
              setShowPasswordCriteria(true);
            }}
            secureTextEntry={!showPassword}
          />
        </View>
        {showPasswordCriteria ? (
          <View style={{ marginBottom: 4, marginLeft: 2 }}>
            {passwordCriteria.map((item, idx) => (
              <Text
                key={idx}
                style={{
                  fontSize: 13,
                  color: item.valid ? "#2ecc40" : "#7a869a",
                  fontFamily: fonts.regular,
                  marginBottom: 1,
                }}
              >
                {item.label}
              </Text>
            ))}
          </View>
        ) : newPasswordError ? (
          <Text style={styles.errorText}>{newPasswordError}</Text>
        ) : null}

        <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed"
            size={22}
            color="#29375C"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor="#7a869a"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError("");
            }}
            secureTextEntry={!showPassword}
          />
        </View>
        {confirmPasswordError ? (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        ) : null}

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.checkboxBox}
          >
            <View
              style={[styles.checkbox, showPassword && styles.checkboxChecked]}
            >
              {showPassword && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Hiển thị mật khẩu</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, !isFilled && styles.saveButtonDisabled]}
          disabled={!isFilled || loading}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <LoadingModal
        visible={loading}
        text="Đang đổi mật khẩu..."
      />
      <SuccessModal
        visible={showSuccess}
        onClose={async () => {
          setShowSuccess(false);
          try {
            await logout();
            await AsyncStorage.clear();
            
            // Reconnect socket để disconnect với user cũ
            reconnectSocket();
            
            router.replace("/auth/login");
          } catch (err) {
            console.error("Logout error:", err);
          }
        }}
        title="Thành công"
        message={`Mật khẩu được thay đổi thành công.\nVui lòng đăng nhập với mật khẩu mới`}
        buttonText="Đăng xuất"
      />
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 42,
    paddingTop: 10,
    backgroundColor: "#f7f7f7",
  },
  label: {
    fontSize: 16,
    color: "#29375C",
    marginBottom: 6,
    marginTop: 12,
    fontWeight: "500",
    fontFamily: fonts.medium,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#29375C",
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    height: 58,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#29375C",
    fontFamily: fonts.regular,
  },
  errorText: {
    color: "red",
    marginBottom: 4,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginLeft: 2,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#29375C",
    borderRadius: 5,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#29375C",
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#29375C",
    fontFamily: fonts.regular,
  },
  saveButton: {
    backgroundColor: "#29375C",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 18,
    fontFamily: fonts.medium,
  },
});

export default ChangePassword; 