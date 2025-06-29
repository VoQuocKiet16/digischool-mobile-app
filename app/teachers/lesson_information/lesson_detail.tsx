import HeaderLayout from "@/components/layout/HeaderLayout";
import Lesson_Information from "@/components/lesson_detail/Lesson_Information";
import PlusIcon from "@/components/PlusIcon";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const LessonDetailScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCompletePress = () => setShowModal(true);
  const handleConfirmComplete = () => {
    setIsCompleted(true);
    setShowModal(false);
  };
  const handleEvaluatePress = () => {
    // Giáo viên có thể có chức năng khác, hoặc để trống nếu không cần
  };

  return (
    <HeaderLayout
      title="Chi tiết tiết học"
      subtitle="Sáng • Tiết 3 • Hóa học • 10a3"
      onBack={() => router.replace("/(tabs)")}
      rightIcon={
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={24} color="#25345D" />
        </TouchableOpacity>
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Lesson_Information
          isCompleted={isCompleted}
          onCompletePress={handleCompletePress}
          onEvaluatePress={handleEvaluatePress}
          role="teacher"
        />
        <View style={{ marginHorizontal: 16, marginTop: 0, marginBottom: 12 }}>
          <PlusIcon
            text="Dặn dò kiểm tra cho tiết học này"
            onPress={() => router.push("/teachers/add_exam_reminder/add_exam_reminder")}
          />
        </View>
      </ScrollView>
      <Modal
        visible={showModal}
        transparent
        statusBarTranslucent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrap}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={40}
                color="#22315B"
              />
            </View>
            <Text style={styles.modalTitle}>Hoàn thành tiết học</Text>
            <Text style={styles.modalDesc}>
              Xác nhận rằng{"\n"}bạn đã hoàn thành tiết học này?
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalBtnOutline}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBtnOutlineText}>Bỏ qua</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={handleConfirmComplete}
              >
                <Text style={styles.modalBtnText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemActive]}
              onPress={() => {
                setMenuVisible(false);
                router.push("/teachers/substitute_request/substitute_request");
              }}
            >
              <Text style={styles.menuText}>
                Dạy thay
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push({
                  pathname: "/teachers/substitute_lesson/substitute_lesson",
                });
              }}
            >
              <Text style={styles.menuText}>Đổi tiết</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push({
                  pathname:
                    "/teachers/select_makeup_lesson/select_makeup_lesson",
                });
              }}
            >
              <Text style={styles.menuText}>Dạy bù</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push({ pathname: '/note/note' });
              }}
            >
              <Text style={styles.menuText}>Ghi chú</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 48,
    paddingRight: 12,
  },
  menuBox: {
    backgroundColor: "#25345D",
    borderRadius: 10,
    padding: 8,
    minWidth: 120,
    marginTop: 0,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#7D88A7",
    marginTop: 5,
  },
  menuItemActive: {
    backgroundColor: "#A0A3BD",
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.7,
  },
  menuTextActive: {
    color: "#22315B",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalIconWrap: {
    backgroundColor: "#E5E7EB",
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22315B",
    marginBottom: 8,
    marginTop: 2,
  },
  modalDesc: {
    color: "#22315B",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 18,
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  modalBtnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#A0A3BD",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  modalBtnOutlineText: {
    color: "#22315B",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: "#A0A3BD",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default LessonDetailScreen;
