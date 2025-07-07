import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { LessonData } from "@/types/lesson.types";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Slot_InformationProps {
  onEvaluatePress?: () => void;
  isCompleted?: boolean;
  onCompletePress?: () => void;
  role?: "student" | "teacher";
  isEvaluated?: boolean;
  rank?: string;
  lessonData?: LessonData | null;
  onUpdateDescription?: (description: string) => Promise<void>;
  onDeleteDescription?: () => Promise<void>;
  onAddDescription?: () => void;
  shouldAddDescription?: boolean;
  onAddDescriptionComplete?: () => void;
}

const Slot_Information: React.FC<Slot_InformationProps> = ({
  onEvaluatePress,
  isCompleted,
  onCompletePress,
  role = "student",
  isEvaluated,
  rank,
  lessonData,
  onUpdateDescription,
  onDeleteDescription,
  onAddDescription,
  shouldAddDescription,
  onAddDescriptionComplete,
}) => {
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(lessonData?.description || "");
  const [showDescriptionCard, setShowDescriptionCard] = useState(
    !!lessonData?.description
  );
  const [isAddingDescription, setIsAddingDescription] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  // Cập nhật showDescriptionCard và descValue khi lessonData thay đổi
  React.useEffect(() => {
    setShowDescriptionCard(!!lessonData?.description);
    setDescValue(lessonData?.description || "");
  }, [lessonData?.description]);

  // Xử lý trigger thêm mô tả từ parent
  React.useEffect(() => {
    if (shouldAddDescription && role === "teacher") {
      setIsAddingDescription(true);
      setShowDescriptionCard(true);
      setDescValue("");
      setIsEditingDesc(true);
      // Focus vào text input sau khi render
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
      // Thông báo hoàn thành
      if (onAddDescriptionComplete) {
        onAddDescriptionComplete();
      }
    }
  }, [shouldAddDescription, role, onAddDescriptionComplete]);

  const handleEvaluate = () => {
    if (role === "teacher") {
      router.push("/teachers/lesson_information/lesson_evaluate");
    } else {
      router.push("/students/lesson_information/lesson_evaluate");
    }
  };

  const getTopic = () => {
    return lessonData?.topic || "Chưa có thông tin bài học";
  };

  const getTimeRange = () => {
    if (!lessonData?.timeSlot) return "Chưa có thông tin thời gian";
    const { startTime, endTime } = lessonData.timeSlot;
    return `${startTime} - ${endTime}`;
  };

  const getTeacherName = () => {
    return lessonData?.teacher?.name || "Chưa có thông tin giáo viên";
  };

  const handleEditDescription = () => {
    if (role !== "teacher") return;

    setIsEditingDesc(true);
    // Focus vào text input sau khi render
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  };

  const handleSaveDescription = async () => {
    if (role !== "teacher") return;

    setIsSaving(true);
    try {
      if (descValue.trim() === "") {
        // Nếu text input rỗng, xóa description
        if (onDeleteDescription) {
          await onDeleteDescription();
        }
        setShowDescriptionCard(false);
        setIsAddingDescription(false);
      } else {
        // Cập nhật description
        if (onUpdateDescription) {
          await onUpdateDescription(descValue.trim());
        }
        setShowDescriptionCard(true);
        setIsAddingDescription(false);
      }
      setIsEditingDesc(false);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật mô tả");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // Lấy HH:mm từ HH:mm:ss
  };

  const getSubtitle = () => {
    if (!lessonData) return "Đang tải thông tin tiết học...";

    const session =
      lessonData.timeSlot?.session === "morning" ? "Sáng" : "Chiều";
    const period = `Tiết ${lessonData.timeSlot?.period || 1}`;
    const subject =
      lessonData.subject?.name ||
      lessonData.fixedInfo?.description ||
      "Chưa rõ";
    const className = lessonData.class?.className || "Chưa rõ";

    return `${session} • ${period} • ${subject} • ${className}`;
  };

  return (
    <View style={styles.container}>
      {/* Card 1: Thông tin bài học */}
      <ThemedView style={[styles.card, { marginTop: 16 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>
            Thông tin bài học
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="book" size={18} color="#25345C" />
          <ThemedText style={styles.infoText}>{getTopic()}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="access-time" size={18} color="#25345C" />
          <ThemedText style={styles.infoText}>{getTimeRange()}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={18} color="#25345C" />
          <ThemedText style={styles.infoText}>{getTeacherName()}</ThemedText>
        </View>
      </ThemedView>

      {/* Card 2: Mô tả thêm */}
      {showDescriptionCard && (
        <ThemedView style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerBar} />
            <ThemedText type="subtitle" style={styles.headerText}>
              Mô tả thêm
            </ThemedText>
            {role === "teacher" && (
              <>
                <View style={{ flex: 1 }} />
                {isEditingDesc ? (
                  <TouchableOpacity onPress={handleSaveDescription}>
                    <ThemedText style={styles.doneText}>
                      {isSaving ? (
                        <ThemedText style={styles.savingText}>
                          Đang lưu...
                        </ThemedText>
                      ) : (
                        "Xong"
                      )}
                    </ThemedText>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleEditDescription}
                    style={styles.editIcon}
                  >
                    <MaterialIcons name="edit" size={22} color="#29345C" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
          {isEditingDesc ? (
            <View>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                value={descValue}
                onChangeText={setDescValue}
                multiline
                placeholder="Nhập mô tả cho tiết học..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
          ) : (
            <ThemedText style={styles.descText}>
              {lessonData?.description || "Chưa có thông tin mô tả"}
            </ThemedText>
          )}
        </ThemedView>
      )}

      {/* Card 3: Thông tin kiểm tra */}
      {lessonData?.testInfo && (
        <ThemedView style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerBar} />
            <ThemedText type="subtitle" style={styles.headerText}>
              Thông tin kiểm tra
            </ThemedText>
            {role === "teacher" && (
              <>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: "/teachers/test_information/test_information",
                      params: {
                        lessonId: lessonData.lessonId,
                        subtitle: getSubtitle(),
                        isEditing: "true",
                        testInfo: JSON.stringify(lessonData.testInfo),
                      },
                    });
                  }}
                  style={styles.editIcon}
                >
                  <MaterialIcons name="edit" size={22} color="#29345C" />
                </TouchableOpacity>
              </>
            )}
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="quiz" size={18} color="#25345C" />
            <ThemedText style={styles.infoText}>
              {lessonData.testInfo.testType === "kiemtra15"
                ? "Kiểm tra 15'"
                : lessonData.testInfo.testType === "kiemtra1tiet"
                ? "Kiểm tra 1 tiết"
                : lessonData.testInfo.testType || "Chưa có thông tin"}
            </ThemedText>
          </View>
          {lessonData.testInfo.content && (
            <View style={styles.infoRow}>
              <MaterialIcons name="description" size={18} color="#25345C" />
              <ThemedText style={styles.infoText}>
                {lessonData.testInfo.content}
              </ThemedText>
            </View>
          )}
          {lessonData.testInfo.reminder && (
            <View style={styles.infoRow}>
              <MaterialIcons name="notifications" size={18} color="#25345C" />
              <ThemedText style={styles.infoText}>
                {lessonData.testInfo.reminder}
              </ThemedText>
            </View>
          )}
        </ThemedView>
      )}

      {/* Card 4: Tình trạng tiết học */}
      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>
            Tình trạng tiết học
          </ThemedText>
        </View>
        {/* Nếu chưa hoàn thành tiết học */}
        {!isCompleted && (
          <TouchableOpacity
            style={styles.statusRowOrangeWrap}
            onPress={onCompletePress}
            activeOpacity={0.7}
          >
            <View style={styles.statusRowOrangeLeft}>
              <View style={styles.statusIconWrapOrange}>
                <MaterialIcons
                  name="assignment-turned-in"
                  size={20}
                  color="#fff"
                />
              </View>
              <ThemedText style={styles.statusTextOrange}>
                Chưa hoàn thành tiết học
              </ThemedText>
            </View>
            <MaterialIcons
              name="fmd-bad"
              size={20}
              color="#F04438"
              style={styles.statusAlertDot}
            />
            <View style={styles.statusArrowWrap}>
              <MaterialIcons name="chevron-right" size={28} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
        {/* Nếu đã hoàn thành tiết học */}
        {isCompleted && (
          <>
            <View style={styles.statusRowGreen}>
              <View style={styles.statusIconWrapGreen}>
                <MaterialIcons name="check-box" size={20} color="#fff" />
              </View>
              <ThemedText style={styles.statusTextWhite}>
                Đã hoàn thành tiết học
              </ThemedText>
            </View>
            {/* Card đánh giá tiết học */}
            {isEvaluated ? (
              <View
                style={[
                  styles.statusRowGreen,
                  { backgroundColor: "#5FC16E", marginTop: 0 },
                ]}
              >
                <View
                  style={[
                    styles.statusIconWrapGreen,
                    { backgroundColor: "#4CAF50" },
                  ]}
                >
                  <MaterialIcons name="error-outline" size={20} color="#fff" />
                </View>
                <ThemedText style={styles.statusTextWhite}>
                  Đánh giá: {rank || lessonData?.evaluation?.rank || "A+"}
                </ThemedText>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.statusRowBlueWrap}
                onPress={handleEvaluate}
                activeOpacity={0.7}
              >
                <View style={styles.statusRowBlueLeft}>
                  <View style={styles.statusIconWrapBlue}>
                    <MaterialIcons
                      name="feedback"
                      size={20}
                      color="#2CA6B0"
                    />
                  </View>
                  <ThemedText style={styles.statusTextBlue}>
                    Chưa đánh giá tiết học
                  </ThemedText>
                </View>
                <MaterialIcons
                  name="fmd-bad"
                  size={20}
                  color="#F04438"
                  style={styles.statusAlertDot}
                />
                <View style={styles.statusArrowWrap}>
                  <MaterialIcons
                    name="chevron-right"
                    size={28}
                    color="#2CA6B0"
                  />
                </View>
              </TouchableOpacity>
            )}
          </>
        )}
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F6F8FB",
    paddingHorizontal: 12,
  },
  card: {
    width: "92%",
    backgroundColor: "#F3F6FA",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerBar: {
    width: 3,
    height: 40,
    backgroundColor: "#F9A825",
    borderRadius: 2,
    marginRight: 10,
  },
  headerText: {
    color: "#26324D",
    fontSize: 25,
    fontFamily: "Baloo2-SemiBold",
  },
  doneText: {
    color: "#F9A825",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
    fontFamily: "Baloo2-SemiBold",
  },
  editIcon: {
    marginLeft: 8,
    marginRight: 2,
    backgroundColor: "#e6eef2",
    borderRadius: 100,
    padding: 10,
  },
  textInput: {
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#25345C",
    fontFamily: "Baloo2-Medium",
    textAlignVertical: "top",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    marginLeft: 4,
    marginRight: 20,
  },
  infoText: {
    marginLeft: 10,
    color: "#25345C",
    fontSize: 15,
    fontFamily: "Baloo2-Medium",
  },
  descText: {
    color: "#25345C",
    fontSize: 15,
    marginLeft: 14,
    marginTop: 2,
    lineHeight: 22,
    fontFamily: "Baloo2-Medium",
  },
  // Style cho card đánh giá tiết học
  statusRowGreen: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5FC16E",
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 10,
    marginLeft: 8,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  statusIconWrapGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statusTextWhite: {
    color: "#fff",
    fontSize: 18,
    marginTop: 5,
    fontFamily: "Baloo2-Medium",
  },
  statusRowBlueWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B6E0E6",
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
    position: "relative",
  },
  statusRowBlueLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  statusIconWrapBlue: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statusTextBlue: {
    color: "#2CA6B0",
    fontSize: 18,
    marginTop: 5,
    fontFamily: "Baloo2-Medium",
  },
  statusArrowWrap: {
    marginLeft: 8,
    marginRight: 2,
  },
  statusRowOrangeWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9B233",
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
    position: "relative",
  },
  statusRowOrangeLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  statusIconWrapOrange: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statusTextOrange: {
    color: "#fff",
    fontSize: 18,
    marginTop: 5,
    fontFamily: "Baloo2-Medium",
  },
  savingText: {
    color: "#D3D3D3",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "none",
  },
  statusAlertDot: {
    position: "absolute",
    left: -2,
    top: -4,
    zIndex: 2,
    transform: [{ rotate: "-40deg" }],
  },
});

export default Slot_Information;
