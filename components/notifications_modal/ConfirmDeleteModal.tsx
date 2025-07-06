import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ConfirmDeleteModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  title = "Xác nhận xóa",
  message = "Bạn có chắc chắn muốn xóa mục này?",
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
              <MaterialCommunityIcons name="delete" size={36} color="#fff" />
            </View>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={onConfirm}>
              <Text style={styles.deleteText}>Xóa</Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#f8f8f8",
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
    borderColor: "#959698",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#D32F2F",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Baloo2-SemiBold",
  },
  message: {
    fontSize: 15,
    color: "#4f4f4f",
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
    borderColor: "#37474F",
    borderRadius: 25,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
  },
  cancelText: {
    color: "#37474F",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Baloo2-SemiBold",
  },
  deleteBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#FFA29D",
    borderRadius: 25,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: "#FFA29D",
    alignItems: "center",
  },
  deleteText: {
    color: "#CF2020",
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

export default ConfirmDeleteModal;
