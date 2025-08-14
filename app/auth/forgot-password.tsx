import { useRouter } from "expo-router";
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
import { forgotPassword } from "../../services/auth.service";
import { fonts } from "../../utils/responsive";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const isValid =
    email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendEmail = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await forgotPassword(email.trim());
      if (response.success) {
        setShowSuccess(true);
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (err: any) {
      // Xử lý lỗi từ backend với cấu trúc {error: {message: "..."}, success: false}
      if (err?.error?.message) {
        setError(err.error.message);
      } else if (err?.errors?.email) {
        setError(err.errors.email);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <HeaderLayout
      title="Quên mật khẩu"
      subtitle="Nhập email để nhận mật khẩu mới"
      onBack={() => router.back()}
    >
      <View style={styles.container}>
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
            placeholder="Nhập email của bạn"
            placeholderTextColor="#7a869a"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {email.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setEmail("");
                setError("");
              }}
              style={{ position: "absolute", right: 8 }}
            >
              <Icon
                name="close"
                size={25}
                color="#29375C"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          )}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.description}>
          Chúng tôi sẽ gửi email chứa mật khẩu mới đến địa chỉ email bạn đã
          nhập.
        </Text>

        <TouchableOpacity
          style={[styles.sendButton, !isValid && { opacity: 0.3 }]}
          disabled={!isValid || loading}
          onPress={handleSendEmail}
        >
          <Text style={styles.sendButtonText}>Gửi email</Text>
        </TouchableOpacity>
      </View>

      <LoadingModal visible={loading} text="Đang gửi email..." />

      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.replace("/auth/login");
        }}
        title="Thành công"
        message={`Mật khẩu mới đã được gửi. \n Vui lòng kiểm tra hộp thư của bạn.`}
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
  description: {
    fontSize: 14,
    color: "#7a869a",
    lineHeight: 20,
    marginTop: 16,
    marginBottom: 32,
    textAlign: "center",
    fontFamily: fonts.regular,
  },
  sendButton: {
    backgroundColor: "#29375C",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 18,
    fontFamily: fonts.medium,
  },
});
