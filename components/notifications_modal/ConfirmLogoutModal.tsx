import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ConfirmLogoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  if (!visible) return null;
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="logout" size={36} color="#fff" />
            </View>
          </View>
          <Text style={styles.title}>Đăng xuất</Text>
          <Text style={styles.message}>
            Đăng xuất sẽ kết thúc phiên của bạn.{"\n"}Bạn chắc chắn muốn đăng
            xuất?
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Bỏ qua</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={onConfirm}>
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeIcon} onPress={onCancel}>
            <MaterialCommunityIcons name="close" size={28} color="#B0B0B0" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Đổi màu nền overlay
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#f8f8f8", // Đổi màu nền modalContent
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    position: "relative",
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#959698", // Đổi màu viền iconWrapper
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#CF2020", // Đổi màu nền iconCircle
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D32F2F", // Đổi màu chữ title
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Baloo2-SemiBold",
  },
  message: {
    fontSize: 15,
    color: "#4f4f4f", // Đổi màu chữ message
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
    fontFamily: "Baloo2-Medium",
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#37474F", // Đổi màu viền cancelBtn
    borderRadius: 25,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: "#f8f8f8", // Đổi màu nền cancelBtn
    alignItems: "center",
  },
  cancelText: {
    color: "#37474F", // Đổi màu chữ cancelText
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Baloo2-SemiBold",
  },
  logoutBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#FFA6A6",
    borderRadius: 25,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: "#FFA6A6", // Đổi màu nền cancelBtn
    alignItems: "center",
  },
  logoutText: {
    color: "#D32F2F", // Đổi màu chữ logoutText
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Baloo2-SemiBold",
  },
  closeIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
  },
});

export default ConfirmLogoutModal;
