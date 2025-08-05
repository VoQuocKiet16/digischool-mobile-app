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
          {/* Icon Warning */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="warning" size={40} color="#fff" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Có xung đột lịch học</Text>
          
          {/* Description */}
          <Text style={styles.description}>
            Tiết này có cả môn học và hoạt động cá nhân. Bạn muốn xem gì?
          </Text>

          {/* Conflict Info */}
          <View style={styles.conflictInfo}>
            <View style={styles.conflictItem}>
              <View style={styles.lessonIcon}>
                <MaterialIcons name="school" size={20} color="#29375C" />
              </View>
              <Text style={styles.conflictText} numberOfLines={2}>
                {lessonText}
              </Text>
            </View>
            
            <View style={styles.conflictItem}>
              <View style={styles.activityIcon}>
                <MaterialIcons name="event" size={20} color="#229A89" />
              </View>
              <Text style={styles.conflictText} numberOfLines={2}>
                {activityText}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.lessonButton} onPress={onViewLesson}>
              <MaterialIcons name="school" size={20} color="#fff" />
              <Text style={styles.lessonButtonText}>Xem môn học</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.activityButton} onPress={onViewActivity}>
              <MaterialIcons name="event" size={20} color="#fff" />
              <Text style={styles.activityButtonText}>Xem hoạt động</Text>
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>

          {/* Close Icon */}
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#B0B0B0" />
          </TouchableOpacity>
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
    padding: 25,
    paddingTop: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "rgba(255, 193, 7, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFC107",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: "#29375C",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  conflictInfo: {
    width: "100%",
    marginBottom: 25,
  },
  conflictItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 8,
  },
  lessonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  conflictText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.medium,
    color: "#29375C",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 15,
  },
  lessonButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#29375C",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  lessonButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginLeft: 8,
  },
  activityButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#229A89",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  activityButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.semiBold,
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  closeIcon: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 5,
  },
});

export default ConflictModal; 