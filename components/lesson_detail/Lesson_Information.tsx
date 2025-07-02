import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface Slot_InformationProps {
  onEvaluatePress?: () => void;
  isCompleted?: boolean;
  onCompletePress?: () => void;
  role?: "student" | "teacher";
  isEvaluated?: boolean;
  rank?: string;
  lessonData?: any;
}

const Slot_Information: React.FC<Slot_InformationProps> = ({
  onEvaluatePress,
  isCompleted,
  onCompletePress,
  role = "student",
  isEvaluated,
  rank,
  lessonData,
}) => {
  const handleEvaluate = () => {
    if (role === "teacher") {
      router.push("/teachers/lesson_information/lesson_evaluate");
    } else {
      router.push("/students/lesson_information/lesson_evaluate");
    }
  };

  // Lấy thông tin từ lessonData
  const getTopic = () => {
    return lessonData?.topic || "Chưa có thông tin";
  };

  const getTimeRange = () => {
    if (lessonData?.timeSlot?.startTime && lessonData?.timeSlot?.endTime) {
      return `${lessonData.timeSlot.startTime} - ${lessonData.timeSlot.endTime}`;
    }
    return "Chưa có thông tin";
  };

  const getTeacherName = () => {
    return lessonData?.teacher?.name || "Chưa có thông tin";
  };

  const getDescription = () => {
    if (lessonData?.notes) {
      return lessonData.notes;
    }
    if (lessonData?.homework) {
      return `Bài tập về nhà: ${lessonData.homework}`;
    }
    if (lessonData?.objectives && lessonData.objectives.length > 0) {
      return `Mục tiêu: ${lessonData.objectives.join(", ")}`;
    }
    return "Chưa có mô tả thêm";
  };

  const getMaterials = () => {
    if (lessonData?.materials && lessonData.materials.length > 0) {
      return lessonData.materials.join(", ");
    }
    return "Chưa có thông tin";
  };

  const getLessonStatus = () => {
    return lessonData?.status || "scheduled";
  };

  const isLessonCompleted = () => {
    return getLessonStatus() === "completed";
  };

  const hasEvaluation = () => {
    return lessonData?.evaluation !== null;
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
      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>
            Mô tả thêm
          </ThemedText>
        </View>
        <ThemedText style={styles.descText}>{getDescription()}</ThemedText>
      </ThemedView>

      {/* Card 3: Thông tin kiểm tra */}
      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>
            Thông tin kiểm tra
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="library-books" size={18} color="#25345C" />
          <ThemedText style={styles.infoText}>Tài liệu cần thiết</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="description" size={18} color="#25345C" />
          <ThemedText style={styles.infoText}>{getMaterials()}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="design-services" size={18} color="#25345C" />
          <ThemedText style={styles.infoText}>
            {lessonData?.class?.className || "Chưa có thông tin"}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Card 4: Tình trạng tiết học */}
      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>
            Tình trạng tiết học
          </ThemedText>
        </View>
        {/* Nếu chưa hoàn thành tiết học */}
        {!isLessonCompleted() && (
          <TouchableOpacity
            style={styles.statusRowOrangeWrap}
            onPress={onCompletePress}
            activeOpacity={0.7}
          >
            <View style={styles.statusRowOrangeLeft}>
              <View style={styles.statusIconWrapOrange}>
                <MaterialIcons
                  name="check-box-outline-blank"
                  size={20}
                  color="#fff"
                />
              </View>
              <ThemedText style={styles.statusTextOrange}>
                Chưa hoàn thành tiết học
              </ThemedText>
            </View>
            <View style={styles.statusAlertDot} />
            <View style={styles.statusArrowWrap}>
              <MaterialIcons name="chevron-right" size={22} color="#25345C" />
            </View>
          </TouchableOpacity>
        )}
        {/* Nếu đã hoàn thành tiết học */}
        {isLessonCompleted() && (
          <>
            <View style={styles.statusRowGreen}>
              <View style={styles.statusIconWrap}>
                <MaterialIcons name="check-box" size={20} color="#fff" />
              </View>
              <ThemedText style={styles.statusTextWhite}>
                Đã hoàn thành tiết học
              </ThemedText>
            </View>
            {/* Card đánh giá tiết học */}
            {hasEvaluation() ? (
              <View
                style={[
                  styles.statusRowGreen,
                  { backgroundColor: "#5FC16E", marginTop: 0 },
                ]}
              >
                <View
                  style={[
                    styles.statusIconWrap,
                    { backgroundColor: "#4CAF50" },
                  ]}
                >
                  <MaterialIcons name="grade" size={20} color="#fff" />
                </View>
                <ThemedText style={styles.statusTextWhite}>
                  Đánh giá: {lessonData?.evaluation?.grade || rank || "A+"}
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
                      name="rate-review"
                      size={20}
                      color="#25345C"
                    />
                  </View>
                  <ThemedText style={styles.statusTextBlue}>
                    Chưa đánh giá tiết học
                  </ThemedText>
                </View>
                <View style={styles.statusAlertDot} />
                <View style={styles.statusArrowWrap}>
                  <MaterialIcons
                    name="chevron-right"
                    size={22}
                    color="#25345C"
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
  },
  card: {
    width: "92%",
    backgroundColor: "#F3F6FA",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerBar: {
    width: 4,
    height: 28,
    backgroundColor: "#F9A825",
    borderRadius: 2,
    marginRight: 10,
  },
  headerText: {
    color: "#25345C",
    fontWeight: "700",
    fontSize: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    marginLeft: 4,
  },
  infoText: {
    marginLeft: 10,
    color: "#25345C",
    fontSize: 15,
  },
  descText: {
    color: "#25345C",
    fontSize: 15,
    marginLeft: 14,
    marginTop: 2,
    lineHeight: 22,
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
  statusIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statusTextWhite: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  },
  statusIconWrapBlue: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E3F6F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statusTextBlue: {
    color: "#2CA6B0",
    fontSize: 16,
    fontWeight: "600",
  },
  statusAlertDot: {
    position: "absolute",
    left: -2,
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 9,
    backgroundColor: "#F04438",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 2,
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
  },
  statusIconWrapOrange: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F9A825",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statusTextOrange: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Slot_Information;
