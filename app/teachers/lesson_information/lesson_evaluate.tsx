import HeaderLayout from "@/components/layout/HeaderLayout";
import Student_Absent from "@/components/lesson_evaluate/Student_Absent";
import Student_Test from "@/components/lesson_evaluate/Student_Test";
import Student_Violates from "@/components/lesson_evaluate/Student_Violates";
import LoadingModal from "@/components/LoadingModal";
import { lessonEvaluateService } from "@/services/lesson_evaluate.service";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { fonts } from "../../../utils/responsive";
  
const RANKS = ["A+", "A", "B+", "B"];

const LessonEvaluateTeacherScreen = () => {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState("");
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [rank, setRank] = useState("");
  const [showRankDropdown, setShowRankDropdown] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [absentStudents, setAbsentStudents] = useState<
    { student: string; name: string }[]
  >([]);
  const [oralTests, setOralTests] = useState<
    { student: string; name: string; score: number }[]
  >([]);
  const [violations, setViolations] = useState<
    { student: string; reason: string }[]
  >([]);
  const router = useRouter();

  const isValid =
    (lesson || "").trim().length > 0 &&
    (content || "").trim().length > 0 &&
    (rank || "").trim().length > 0 &&
    checked;

  const handleSubmit = async () => {
    if (isValid && lessonId) {
      setIsSubmitting(true);
      setShowLoading(true);
      setLoadingSuccess(false);
      setError("");
      try {
        const evaluationData = {
          curriculumLesson: lesson,
          content: content,
          comments: comment,
          rating: rank as "A+" | "A" | "B+" | "B" | "C",
          absentStudents: absentStudents.map((item) => ({
            student: item.student,
          })),
          oralTests: oralTests.map((item) => ({
            student: item.student,
            score: item.score,
          })),
          violations: violations.map((item) => ({
            student: item.student,
            description: item.reason,
          })),
        };

        await lessonEvaluateService.createTeacherEvaluation(
          lessonId,
          evaluationData
        );

        setLoadingSuccess(true);
        setTimeout(() => {
          setShowLoading(false);
          setLoadingSuccess(false);
          setIsSubmitting(false);
          router.back();
        }, 1000);
      } catch (error: any) {
        setError(
          error.response?.data?.message || "Tạo đánh giá tiết học thất bại!"
        );
        setShowLoading(false);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <HeaderLayout
      title="Đánh giá tiết học"
      subtitle="Hoàn thành mẫu đánh giá tiết học"
      onBack={() => {
        router.back();
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 32,
            paddingHorizontal: 16,
            marginBottom: 32,
            marginTop: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Tiết chương trình */}
          <View style={styles.fieldWrap}>
            <View style={styles.confirmInputBox}>
              <Text style={styles.confirmLabel}>
                Tiết chương trình <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.confirmInput}
                placeholder="Vui lòng nhập tiết chương trình"
                placeholderTextColor="#9CA3AF"
                value={lesson}
                onChangeText={setLesson}
              />
            </View>
          </View>
          {/* Tên bài, nội dung công việc */}
          <View style={styles.fieldWrap}>
            <View style={styles.confirmInputBox}>
              <Text style={styles.confirmLabel}>
                Tên bài, nội dung công việc{" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.confirmInput}
                placeholder="Vui lòng nhập tên bài học, nội dung công việc"
                placeholderTextColor="#9CA3AF"
                value={content}
                onChangeText={setContent}
              />
            </View>
          </View>
          {/* Học sinh vắng */}
          <View style={[styles.fieldWrap, { marginBottom: 25 }]}>
            <Student_Absent
              lessonId={lessonId || ""}
              onAbsentStudentsChange={setAbsentStudents}
            />
          </View>
          {/* Học sinh vi phạm */}
          <View style={[styles.fieldWrap, { marginBottom: 25 }]}>
            <Student_Violates
              lessonId={lessonId || ""}
              onViolationsChange={setViolations}
            />
          </View>
          {/* Kiểm tra miệng */}
          <View style={[styles.fieldWrap, { marginBottom: 46 }]}>
            <Student_Test
              lessonId={lessonId || ""}
              onOralTestsChange={setOralTests}
            />
          </View>
          {/* Nhận xét */}
          <View style={styles.fieldWrap}>
            <View style={styles.confirmInputBox}>
              <Text style={styles.confirmLabel}>Nhận xét</Text>
              <TextInput
                style={styles.confirmInput}
                placeholder="Vui lòng nhập nhận xét"
                placeholderTextColor="#9CA3AF"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
          {/* Xếp loại tiết học */}
          <View style={styles.fieldWrap}>
            <View style={styles.confirmInputBox}>
              <Text style={styles.confirmLabel}>
                Xếp loại tiết học <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowRankDropdown(!showRankDropdown)}
                activeOpacity={0.7}
              >
                <Text
                  style={
                    rank ? styles.dropdownText : styles.dropdownPlaceholder
                  }
                >
                  {rank || "Chọn loại xếp hạng tiết học"}
                </Text>
                <MaterialIcons
                  name={
                    showRankDropdown
                      ? "keyboard-arrow-up"
                      : "keyboard-arrow-down"
                  }
                  size={24}
                  color="#29375C"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
              {showRankDropdown && (
                <View style={styles.modalContent}>
                  {RANKS.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={styles.modalItem}
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
              marginHorizontal: 10,
              marginBottom: 8,
            }}
          >
            <TouchableOpacity
              onPress={() => setChecked(!checked)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: "#22315B",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
                marginLeft: 13,
                backgroundColor: checked ? "#22315B" : "transparent",
              }}
              activeOpacity={0.8}
            >
              {checked && <MaterialIcons name="check" size={16} color="#fff" />}
            </TouchableOpacity>
            <Text
              style={{
                color: "#22315B",
                fontSize: 16,
                fontWeight: "500",
                flex: 1,
                flexWrap: "wrap",
                lineHeight: 24,
                fontFamily: fonts.medium,
              }}
            >
              Tôi hoàn toàn chịu trách nhiệm với nội dung nhận xét của mình.
              <Text style={{ color: "red", fontSize: 20, fontWeight: "bold" }}>
                {" "}
                *
              </Text>
            </Text>
          </View>

          {error ? (
            <Text
              style={{
                color: "red",
                textAlign: "center",
                marginBottom: 8,
                fontFamily: fonts.medium,
              }}
            >
              {error}
            </Text>
          ) : null}

          {/* Nút xác nhận */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              (!isValid || isSubmitting) && styles.saveBtnDisabled,
            ]}
            disabled={!isValid || isSubmitting}
            onPress={handleSubmit}
          >
            <Text style={styles.saveBtnText}>
              {isSubmitting ? "Đang lưu..." : "Xác nhận"}
            </Text>
          </TouchableOpacity>

          <LoadingModal
            visible={showLoading}
            text={
              loadingSuccess
                ? "Đánh giá tiết học thành công"
                : "Đang tạo đánh giá tiết học..."
            }
            success={loadingSuccess}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  fieldWrap: {
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    color: "#22315B",
    fontWeight: "bold",
    marginBottom: 6,
  },
  floatingInputBox: {
    borderWidth: 2,
    borderColor: "#22315B",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginBottom: 25,
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    top: -16,
    left: 18,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 6,
    color: "#22315B",
    fontWeight: "bold",
    fontSize: 12,
    zIndex: 2,
  },
  input: {
    borderWidth: 2,
    borderColor: "#22315B",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#22315B",
    fontWeight: "bold",
  },
  confirmInputBox: {
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginBottom: 25,
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    position: "relative",
  },
  confirmLabel: {
    position: "absolute",
    top: -16,
    left: 18,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 6,
    color: "#29375C",
    fontFamily: fonts.semiBold,
    fontSize: 14,
    zIndex: 2,
  },
  confirmInput: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  required: {
    color: "#E53935",
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 0,
    minHeight: 22,
  },
  dropdownText: {
    color: "#22315B",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  modalContent: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#22315B",
    fontWeight: "500",
  },
  saveBtn: {
    backgroundColor: "#29375C",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 30,
    width: "95%",
  },
  saveBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },
});

export default LessonEvaluateTeacherScreen;
