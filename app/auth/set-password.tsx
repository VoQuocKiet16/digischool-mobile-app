import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import LoadingModal from "../../components/LoadingModal";
import HeaderLayout from "../../components/layout/HeaderLayout";
import SuccessModal from "../../components/notifications_modal/SuccessModal";
import { setPasswordNewUser } from "../../services/auth.service";
import { responsive, responsiveValues, fonts } from "../../utils/responsive";

export default function SetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = typeof params.token === "string" ? params.token : "";
  const isNewUser = String(params.isNewUser) === "true";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isFilled = isNewUser
    ? newPassword && confirmPassword
    : currentPassword && newPassword && confirmPassword;

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
    setIsSubmitted(true);
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    let hasError = false;
    if (!allPasswordCriteriaValid) {
      setNewPasswordError("Mật khẩu mới không hợp lệ");
      hasError = true;
    }
    if (!isNewUser && newPassword === currentPassword) {
      setNewPasswordError("Mật khẩu mới không được trùng mật khẩu cũ");
      hasError = true;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Xác nhận mật khẩu không khớp");
      hasError = true;
    }
    if (hasError) {
      setShowPasswordCriteria(false);
      return;
    }
    setLoading(true);
    try {
      if (isNewUser) {
        await setPasswordNewUser(token, newPassword, confirmPassword);
      } else {
        // TODO: Gọi API đổi mật khẩu cho user thường
      }
      setLoading(false);
      setShowSuccess(true);
    } catch (err: any) {
      setLoading(false);
      if (err?.errors) {
        if (err.errors.password) setNewPasswordError(err.errors.password);
        if (err.errors.confirmPassword)
          setConfirmPasswordError(err.errors.confirmPassword);
        if (err.errors.currentPassword)
          setCurrentPasswordError(err.errors.currentPassword);
      } else if (err?.message) {
        setNewPasswordError(err.message);
      }
      setShowPasswordCriteria(false);
    }
  };

  return (
    <HeaderLayout
      title="Đổi mật khẩu"
      subtitle="Vui lòng đổi mật khẩu để tiếp tục sử dụng"
      onBack={() => router.back()}
    >
      <View style={styles.container}>
        {!isNewUser && (
          <>
            <Text style={styles.label}>Nhập mật khẩu hiện tại</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={22}
                color="#29375C"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu cũ"
                placeholderTextColor="#7a869a"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showPassword}
              />
            </View>
            {currentPasswordError ? (
              <Text style={styles.errorText}>{currentPasswordError}</Text>
            ) : null}
          </>
        )}
        <Text style={styles.label}>Nhập mật khẩu mới</Text>
        <View style={styles.inputContainer}>
          <Icon
            name="lock"
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
        <View style={[styles.inputContainer, { position: "relative" }]}>
          <Icon
            name="lock"
            size={22}
            color="#29375C"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu mới"
            placeholderTextColor="#7a869a"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />
          {isSubmitted && confirmPassword.length > 0 && (
            <Text
              style={
                newPassword === confirmPassword
                  ? styles.matchText
                  : styles.notMatchText
              }
            >
              {newPassword === confirmPassword ? "Trùng khớp" : "Không khớp"}
            </Text>
          )}
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
              {showPassword && <Icon name="check" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Hiển thị mật khẩu</Text>
        </View>
        <TouchableOpacity
          style={[styles.saveButton, !isFilled && { opacity: 0.3 }]}
          disabled={!isFilled || loading}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>
      <LoadingModal visible={loading} text="Đang đổi mật khẩu..." />
      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.replace("/auth/login");
        }}
        title="Thành công"
        message={
          "Mật khẩu được thay đổi thành công.\nVui lòng đăng nhập với mật khẩu mới "
        }
        buttonText="Đăng nhập"
      />
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 42,
    paddingTop: 10,
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
  saveButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 18,
    fontFamily: fonts.medium,
  },
  matchText: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
    color: "#2ecc40",
    fontSize: 13,
    fontFamily: fonts.medium,
    fontWeight: "500",
  },
  notMatchText: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
    color: "red",
    fontSize: 13,
    fontFamily: fonts.medium,
    fontWeight: "500",
  },
});
