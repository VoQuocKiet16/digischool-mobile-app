import HeaderLayout from "@/components/layout/HeaderLayout";
import Student_Absent from "@/components/lesson_evaluate/Student_Absent";
import Student_Test from "@/components/lesson_evaluate/Student_Test";
import Student_Violates from "@/components/lesson_evaluate/Student_Violates";
import LoadingModal from "@/components/LoadingModal";
import { lessonEvaluateService } from "@/services/lesson_evaluate.service";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { LessonData, StudentLeaveRequest } from "../../../types/lesson.types";
import { fonts } from "../../../utils/responsive";
  
const RANKS = ["A+", "A", "B+", "B", "C"];

const LessonEvaluateTeacherScreen = () => {
  const { lessonId, lessonData: lessonDataParam } = useLocalSearchParams<{ lessonId: string; lessonData: string }>();
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
  const [fieldErrors, setFieldErrors] = useState<{
    lesson?: string;
    content?: string;
    comment?: string;
  }>({});
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [absentStudents, setAbsentStudents] = useState<
    { student: string; name: string; reason: string }[]
  >([]);
  const [oralTests, setOralTests] = useState<
    { student: string; name: string; score: number }[]
  >([]);
  const [violations, setViolations] = useState<
    { student: string; reason: string }[]
  >([]);
  const router = useRouter();

  // Sử dụng useCallback để tránh re-render không cần thiết
  const handleAbsentStudentsChange = useCallback((students: { student: string; name: string; reason: string }[]) => {
    setAbsentStudents(students);
  }, []);

  const handleViolationsChange = useCallback((violations: { student: string; reason: string }[]) => {
    setViolations(violations);
  }, []);

  const handleOralTestsChange = useCallback((oralTests: { student: string; name: string; score: number }[]) => {
    setOralTests(oralTests);
  }, []);

  // Sử dụng useMemo để tránh tạo array mới mỗi lần render
  const absentStudentIds = useMemo(() => 
    absentStudents.map(item => item.student), 
    [absentStudents]
  );

  const violationStudentIds = useMemo(() => 
    violations.map(item => item.student), 
    [violations]
  );

  const oralTestStudentIds = useMemo(() => 
    oralTests.map(item => item.student), 
    [oralTests]
  );

  // Parse lessonData từ params
  useEffect(() => {
    if (lessonDataParam) {
      try {
        const parsedLessonData = JSON.parse(lessonDataParam);
        setLessonData(parsedLessonData);
      } catch (error) {
        console.error("Error parsing lessonData:", error);
      }
    }
  }, [lessonDataParam]);

  // Lấy danh sách học sinh đã được approved nghỉ phép
  const approvedLeaveStudents = useMemo(() => {
    if (!lessonData?.studentLeaveRequests) {
      return [];
    }
    
    return lessonData.studentLeaveRequests
      .filter((request: StudentLeaveRequest) => request.status === "approved")
      .map((request: StudentLeaveRequest) => ({
        id: request.studentId._id,
        name: request.studentId.name,
        reason: request.reason,
      }));
  }, [lessonData?.studentLeaveRequests]) as { id: string; name: string; reason: string }[];

  // Học sinh vắng không thể có điểm test hoặc vi phạm
  const allAbsentStudentIds = useMemo(() => [
    ...absentStudentIds,
    ...approvedLeaveStudents.map(student => student.id)
  ], [absentStudentIds, approvedLeaveStudents]);

  const isValid =
    (lesson || "").trim().length > 0 &&
    (lesson || "").trim().length <= 100 &&
    (content || "").trim().length > 0 &&
    (content || "").trim().length <= 1000 &&
    (comment || "").trim().length <= 1000 &&
    (rank || "").trim().length > 0 &&
    checked;

  const handleSubmit = async () => {
    if (isValid && lessonId) {
      setIsSubmitting(true);
      setShowLoading(true);
      setLoadingSuccess(false);
      setError("");
      setFieldErrors({});
      try {
        const evaluationData = {
          curriculumLesson: lesson,
          content: content,
          comments: comment,
          rating: rank as "A+" | "A" | "B+" | "B" | "C",
          absentStudents: absentStudents.map((item) => {
            // Kiểm tra xem học sinh này có phải là học sinh đã approved nghỉ phép không
            const approvedStudent = approvedLeaveStudents.find(
              (approved) => approved.id === item.student
            );
            
            return {
              student: item.student,
              isApprovedLeave: !!approvedStudent,
              reason: approvedStudent?.reason || item.reason || "",
            };
          }),
          oralTests: oralTests.map((item) => ({
            student: item.student,
            score: item.score,
          })),
          violations: violations.map((item) => ({
            student: item.student,
            description: item.reason,
          })),
        };

        const response = await lessonEvaluateService.createTeacherEvaluation(
          lessonId,
          evaluationData
        );

        // Kiểm tra response theo cấu trúc mới
        if (response.success) {
          setLoadingSuccess(true);
          setTimeout(() => {
            setShowLoading(false);
            setLoadingSuccess(false);
            setIsSubmitting(false);
            router.back();
          }, 1000);
        } else {
          setError(response.message || "Tạo đánh giá tiết học thất bại!");
          setShowLoading(false);
          setIsSubmitting(false);
        }
      } catch (error: any) {
        // Xử lý các loại lỗi khác nhau theo backend mới
        if (error.response?.status === 409) {
          setError("Tiết học này đã được đánh giá");
        } else if (error.response?.status === 403) {
          setError("Bạn không có quyền đánh giá tiết học này");
        } else if (error.response?.status === 400) {
          const errorData = error.response?.data;
          if (errorData?.errors) {
            const fieldErrors: any = {};
            const generalErrors: string[] = [];
            
            errorData.errors.forEach((err: any) => {
              if (err.field === "curriculumLesson") {
                fieldErrors.lesson = err.message;
              } else if (err.field === "content") {
                fieldErrors.content = err.message;
              } else if (err.field === "comments") {
                fieldErrors.comment = err.message;
              } else {
                generalErrors.push(err.message);
              }
            });
            
            setFieldErrors(fieldErrors);
            if (generalErrors.length > 0) {
              setError(generalErrors.join(", "));
            }
          } else {
            setError(errorData?.message || "Dữ liệu không hợp lệ");
          }
        } else {
          setError(
            error.response?.data?.message || "Tạo đánh giá tiết học thất bại!"
          );
        }
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
              {fieldErrors.lesson && (
                <Text style={styles.errorText}>{fieldErrors.lesson}</Text>
              )}
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
              {fieldErrors.content && (
                <Text style={styles.errorText}>{fieldErrors.content}</Text>
              )}
            </View>
          </View>
          {/* Học sinh vắng */}
          <View style={[styles.fieldWrap, { marginBottom: 25 }]}>
            <Student_Absent
              lessonId={lessonId || ""}
              onAbsentStudentsChange={handleAbsentStudentsChange}
              approvedLeaveStudents={approvedLeaveStudents}
              selectedStudents={absentStudentIds}
            />
          </View>
          {/* Học sinh vi phạm */}
          <View style={[styles.fieldWrap, { marginBottom: 25 }]}>
            <Student_Violates
              lessonId={lessonId || ""}
              onViolationsChange={handleViolationsChange}
              approvedLeaveStudents={approvedLeaveStudents}
              selectedStudents={[...violationStudentIds, ...allAbsentStudentIds]}
            />
          </View>
          {/* Kiểm tra miệng */}
          <View style={[styles.fieldWrap, { marginBottom: 46 }]}>
            <Student_Test
              lessonId={lessonId || ""}
              onOralTestsChange={handleOralTestsChange}
              approvedLeaveStudents={approvedLeaveStudents}
              selectedStudents={[...oralTestStudentIds, ...allAbsentStudentIds]}
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
              {fieldErrors.comment && (
                <Text style={styles.errorText}>{fieldErrors.comment}</Text>
              )}
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
  errorText: {
    color: "#E53935",
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 4,
    marginLeft: 18,
  },
});

export default LessonEvaluateTeacherScreen;
