import HeaderLayout from "@/components/layout/HeaderLayout";
import Student_Absent from "@/components/lesson_evaluate/Student_Absent";
import Student_Test from "@/components/lesson_evaluate/Student_Test";
import Student_Violates from "@/components/lesson_evaluate/Student_Violates";
import SuccessModal from "@/components/notifications_modal/SuccessModal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RANKS = ["A+", "A", "B+", "B"];

const LessonEvaluateTeacherScreen = () => {
  const [lesson, setLesson] = useState("");
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [rank, setRank] = useState("");
  const [showRankDropdown, setShowRankDropdown] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const isValid =
    (lesson || "").trim().length > 0 &&
    (content || "").trim().length > 0 &&
    (rank || "").trim().length > 0 &&
    checked;

  return (
    <HeaderLayout
      title="Đánh giá tiết học"
      subtitle="Hoàn thành mẫu đánh giá tiết học"
      onBack={() => {}}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 32,
            marginBottom: 32,
            marginTop: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Tiết chương trình */}
          <View style={styles.inputBox}>
            <View style={styles.floatingInputBox}>
              <Text style={styles.floatingLabel}>
                Tiết chương trình <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                style={styles.floatingInput}
                placeholder="Vui lòng nhập tiết chương trình"
                placeholderTextColor="#A0A3BD"
                value={lesson}
                onChangeText={setLesson}
              />
            </View>
          </View>
          {/* Tên bài, nội dung công việc */}
          <View style={styles.inputBox}>
            <View style={styles.floatingInputBox}>
              <Text style={styles.floatingLabel}>
                Tên bài, nội dung công việc{" "}
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                style={styles.floatingInput}
                placeholder="Vui lòng nhập tên bài học, nội dung công việc"
                placeholderTextColor="#A0A3BD"
                value={content}
                onChangeText={setContent}
              />
            </View>
          </View>
          {/* Học sinh vắng */}
          <View style={styles.inputBox}>
            <Student_Absent />
          </View>
          {/* Học sinh vi phạm */}
          <View style={styles.inputBox}>
            <Student_Violates />
          </View>
          {/* Kiểm tra miệng */}
          <View style={styles.inputBox}>
            <Student_Test />
          </View>
          {/* Nhận xét */}
          <View style={styles.inputBox}>
            <View
              style={[styles.floatingInputBox, styles.floatingInputBoxSmall]}
            >
              <Text style={styles.floatingLabel}>Nhận xét</Text>
              <TextInput
                style={[styles.floatingInput, { minHeight: 36, fontSize: 12 }]}
                placeholder="Vui lòng nhập nhận xét"
                placeholderTextColor="#A0A3BD"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
          {/* Xếp loại tiết học */}
          <View style={styles.inputBox}>
            <View style={styles.dropdownFloatingBox}>
              <Text style={styles.floatingLabel}>
                Xếp loại tiết học <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.dropdown, { marginTop: 12 }]}
                onPress={() => setShowRankDropdown(!showRankDropdown)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.dropdownText, !rank && { color: "#A0A3BD" }]}
                >
                  {rank || "Chọn loại xếp hạng tiết học"}
                </Text>
                <Ionicons
                  name={showRankDropdown ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#29375C"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
              {showRankDropdown && (
                <View style={styles.dropdownListInsideBox}>
                  {RANKS.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.dropdownItem,
                        rank === r && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setRank(r);
                        setShowRankDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          rank === r && { fontWeight: "bold" },
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          {/* Checkbox xác nhận trách nhiệm nhận xét */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginHorizontal: 16,
              marginBottom: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => setChecked(!checked)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: "#29375C",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
                backgroundColor: checked ? "#29375C" : "transparent",
              }}
              activeOpacity={0.8}
            >
              {checked && <Ionicons name="checkmark" size={18} color="#fff" />}
            </TouchableOpacity>
            <Text
              style={{
                color: "#29375C",
                fontSize: 16,
                fontWeight: "500",
                flex: 1,
                flexWrap: "wrap",
                lineHeight: 18,
              }}
            >
              Tôi hoàn toàn chịu trách nhiệm với nội dung nhận xét của mình.
              <Text style={{ color: "red", fontSize: 12, fontWeight: "bold" }}>
                {" "}
                *
              </Text>
            </Text>
          </View>
          {/* Nút xác nhận */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              isValid ? styles.actionBtnActive : styles.actionBtnDisabled,
            ]}
            disabled={!isValid}
            onPress={() => setShowSuccess(true)}
          >
            <Text style={styles.actionBtnText}>Xác nhận</Text>
          </TouchableOpacity>
          <SuccessModal
            visible={showSuccess}
            onClose={() => {
              setShowSuccess(false);
              router.replace("/teachers/lesson_information/lesson_detail");
            }}
            title="Thành công"
            message={"Đánh giá tiết học thành công.\nQuay lại trang trước đó?"}
            buttonText="Xác nhận"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  inputBox: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  label: {
    fontSize: 15,
    color: "#29375C",
    fontWeight: "bold",
    marginBottom: 6,
  },
  floatingInputBox: {
    borderWidth: 2,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#F6F8FB",
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 16,
    position: "relative",
  },
  floatingInputBoxSmall: {
    paddingTop: 8,
    paddingBottom: 6,
  },
  floatingLabel: {
    position: "absolute",
    top: -10,
    left: 18,
    backgroundColor: "#F6F8FB",
    paddingHorizontal: 6,
    color: "#29375C",
    fontWeight: "bold",
    fontSize: 12,
    zIndex: 2,
  },
  floatingInput: {
    color: "#29375C",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },
  input: {
    borderWidth: 2,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#29375C",
    fontWeight: "bold",
  },
  dropdownFloatingBox: {
    borderWidth: 2,
    borderColor: "#29375C",
    borderRadius: 20,
    backgroundColor: "#fff",
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 16,
    position: "relative",
    marginTop: 0,
  },
  dropdown: {
    borderWidth: 0,
    borderColor: "transparent",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 0,
  },
  dropdownText: {
    fontSize: 16,
    color: "#29375C",
    fontWeight: "bold",
    flex: 1,
  },
  dropdownListInsideBox: {
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: "#fff",
    marginTop: 0,
    overflow: "hidden",
    paddingBottom: 8,
  },
  dropdownItem: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginHorizontal: 8,
    marginTop: 6,
  },
  dropdownItemSelected: {
    backgroundColor: "#ECEEF3",
  },
  dropdownItemText: {
    fontSize: 22,
    color: "#29375C",
    fontWeight: "500",
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 20,
  },
  actionBtnActive: {
    backgroundColor: "#25345D",
  },
  actionBtnDisabled: {
    backgroundColor: "#C4C4C4",
  },
  actionBtnText: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#fff",
  },
});

export default LessonEvaluateTeacherScreen;
