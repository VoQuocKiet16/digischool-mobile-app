import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fonts } from "../../utils/responsive";

interface ConflictModalProps {
  visible: boolean;
  onClose: () => void;
  onViewLesson: () => void;
  onViewActivity: () => void;
  lessonText: string;
  activityText: string;
}

const ConflictModal: React.FC<ConflictModalProps> = ({
  visible,
  onClose,
  onViewLesson,
  onViewActivity,
  lessonText,
  activityText,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Xung đột lịch học</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#959698" />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onViewLesson}>
              <Text style={styles.cancelText}>Xem môn học</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.confirmButton} onPress={onViewActivity}>
              <Text style={styles.confirmButtonText}>Xem hoạt động</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#959698",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    padding: 4,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#29375C",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: fonts.semiBold,
  },
  message: {
    fontSize: 15,
    color: "#4f4f4f",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
    fontFamily: fonts.medium,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
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
    flexDirection: "row",
    justifyContent: "center",
  },
  cancelText: {
    color: "#37474F",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: fonts.semiBold,
    marginLeft: 8,
  },
  confirmButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 25,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: "#29375C",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: fonts.semiBold,
    marginLeft: 8,
  },
});

export default ConflictModal; 