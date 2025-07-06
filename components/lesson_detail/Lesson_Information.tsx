<<<<<<< khoi-api
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
=======
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import {
  deleteLessonDescription,
  updateLessonDescription,
} from "../../services/schedule.service";
import { TestInfo } from "../../services/test_info.service";
>>>>>>> local

interface Slot_InformationProps {
  onEvaluatePress?: () => void;
  isCompleted?: boolean;
  onCompletePress?: () => void;
  role?: 'student' | 'teacher';
  isEvaluated?: boolean;
  rank?: string;
<<<<<<< khoi-api
}

const Slot_Information: React.FC<Slot_InformationProps> = ({ onEvaluatePress, isCompleted, onCompletePress, role = 'student', isEvaluated, rank }) => {
=======
  lessonData?: any;
  onEditDescription?: () => void;
  isEditingDescription?: boolean;
  descriptionValue?: string;
  onDescriptionChange?: (val: string) => void;
  onDoneEditDescription?: () => void;
  showDescriptionCard?: boolean;
  setShowDescriptionCard?: (show: boolean) => void;
  testInfo?: TestInfo | null;
  onEditTestInfo?: () => void;
  lessonId?: string;
}

const Slot_Information: React.FC<Slot_InformationProps> = ({
  onEvaluatePress,
  isCompleted,
  onCompletePress,
  role = "student",
  isEvaluated,
  rank,
  lessonData,
  onEditDescription,
  isEditingDescription,
  descriptionValue,
  onDescriptionChange,
  onDoneEditDescription,
  showDescriptionCard = false,
  setShowDescriptionCard,
  testInfo,
  onEditTestInfo,
  lessonId,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalDescription, setOriginalDescription] = useState("");

  useEffect(() => {
    if (lessonData?.notes || lessonData?.description) {
      const descriptionText = lessonData?.notes || lessonData?.description;
      setOriginalDescription(descriptionText);
    }
  }, [lessonData]);

>>>>>>> local
  const handleEvaluate = () => {
    if (role === 'teacher') {
      router.push('/teachers/lesson_information/lesson_evaluate');
    } else {
      router.push('/students/lesson_information/lesson_evaluate');
    }
  };
<<<<<<< khoi-api
=======

  const handleDoneEditDescription = async () => {
    if (!lessonId) return;

    const currentDescription = descriptionValue?.trim() || "";
    const originalDesc = originalDescription?.trim() || "";

    // Nếu không có thay đổi và có original description, chỉ thoát edit mode
    if (currentDescription === originalDesc && originalDesc !== "") {
      onDoneEditDescription?.();
      return;
    }

    // Nếu text rỗng và không có original description, ẩn card và thoát edit mode
    if (currentDescription === "" && originalDesc === "") {
      setShowDescriptionCard?.(false);
      onDoneEditDescription?.();
      return;
    }

    setIsUpdating(true);
    try {
      if (currentDescription === "") {
        // Xóa description nếu text rỗng
        await deleteLessonDescription(lessonId);
        setShowDescriptionCard?.(false);
        setOriginalDescription("");
        // Cập nhật lessonData để ẩn description
        if (lessonData) {
          lessonData.notes = null;
          lessonData.description = null;
        }
      } else {
        // Cập nhật hoặc thêm description
        await updateLessonDescription(lessonId, currentDescription);
        setOriginalDescription(currentDescription);
        // Cập nhật lessonData để hiển thị description mới
        if (lessonData) {
          lessonData.notes = currentDescription;
          lessonData.description = currentDescription;
        }
      }

      onDoneEditDescription?.();
    } catch (error) {
      // Có thể hiển thị thông báo lỗi ở đây
    } finally {
      setIsUpdating(false);
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

  const getTeacherGender = () => {
    return lessonData?.teacher?.gender || "Chưa có thông tin";
  };

  const getTeacherName = () => {
    return (
      (getTeacherGender() === "male" ? "Thầy " : "Cô ") +
        lessonData?.teacher?.name || "Chưa có thông tin"
    );
  };

  const getDescription = () => {
    if (lessonData?.notes || lessonData?.description) {
      return lessonData?.notes || lessonData?.description;
    }
    if (lessonData?.homework) {
      return `Bài tập về nhà: ${lessonData.homework}`;
    }
    if (lessonData?.objectives && lessonData.objectives.length > 0) {
      return `Mục tiêu: ${lessonData.objectives.join(", ")}`;
    }
    return "Chưa có mô tả thêm";
  };

  const getLessonStatus = () => {
    return lessonData?.status || "scheduled";
  };

  const isLessonCompleted = () => {
    // Ưu tiên prop isCompleted trước, sau đó mới kiểm tra lessonData
    if (isCompleted !== undefined) {
      return isCompleted;
    }
    return getLessonStatus() === "completed";
  };

  const hasEvaluation = () => {
    return lessonData?.evaluation !== null;
  };

  // Lấy thông tin kiểm tra từ testInfo
  const getTestType = () => {
    if (!testInfo?.testType) return "Chưa có thông tin";

    const testTypeMap: { [key: string]: string } = {
      kiemtra15: "Kiểm tra 15'",
      kiemtra1tiet: "Kiểm tra 1 tiết",
    };

    return testTypeMap[testInfo.testType] || testInfo.testType;
  };

  const getTestContent = () => {
    return testInfo?.content || "Chưa có thông tin";
  };

  const getTestReminder = () => {
    return testInfo?.reminder || "Chưa có thông tin";
  };

  const renderFmdBadIcon = () => (
    <MaterialIcons
      name="fmd-bad"
      size={25}
      style={{
        position: "absolute",
        left: -5,
        top: -10,
        color: "#F04438",
        transform: [{ rotate: "-20deg" }],
      }}
    />
  );

>>>>>>> local
  return (
    <View style={styles.container}>
      {/* Card 1: Thông tin bài học */}
      <ThemedView style={[styles.card, { marginTop: 16 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>Thông tin bài học</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={18} color={Colors.light.icon} />
          <ThemedText style={styles.infoText}>Chất và cấu tạo của chất</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="chevron.right" size={18} color={Colors.light.icon} />
          <ThemedText style={styles.infoText}>9:00 - 9:45</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="house.fill" size={18} color={Colors.light.icon} />
          <ThemedText style={styles.infoText}>Thầy/Cô Nguyen Van B</ThemedText>
        </View>
      </ThemedView>

      {/* Card 2: Mô tả thêm */}
<<<<<<< khoi-api
      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>Mô tả thêm</ThemedText>
        </View>
        <ThemedText style={styles.descText}>
          Kiểm tra 1 tiết về "Chất và cấu tạo của chất"
          Mang theo sách giáo khoa và ghi chú nếu cần.
        </ThemedText>
      </ThemedView>

      {/* Card 3: Thông tin kiểm tra */}
      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>Thông tin kiểm tra</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="chevron.left.forwardslash.chevron.right" size={18} color={Colors.light.icon} />
          <ThemedText style={styles.infoText}>Kiểm tra 1 tiết</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="chevron.right" size={18} color={Colors.light.icon} />
          <ThemedText style={styles.infoText}>Học 2 bài gần nhất</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="house.fill" size={18} color={Colors.light.icon} />
          <ThemedText style={styles.infoText}>Mang theo dụng cụ thí nghiệm, nếu có</ThemedText>
        </View>
      </ThemedView>
=======
      {showDescriptionCard && (
        <ThemedView style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerBar} />
            <ThemedText type="subtitle" style={styles.headerText}>
              Mô tả thêm
            </ThemedText>
            <View style={{ flex: 1 }} />
            {isEditingDescription ? (
              <TouchableOpacity
                onPress={handleDoneEditDescription}
                disabled={isUpdating}
              >
                <ThemedText
                  style={{
                    color: isUpdating ? "#A0A3BD" : "#F9A825",
                    fontSize: 16,
                    fontFamily: "Baloo2-SemiBold",
                    textDecorationLine: "underline",
                  }}
                >
                  {isUpdating ? "Đang lưu..." : "Xong"}
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={onEditDescription}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons
                  name="edit"
                  size={22}
                  color="#25345C"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{
                    backgroundColor: "#e6eef2",
                    borderRadius: 100,
                    padding: 10,
                  }}
                />
              </TouchableOpacity>
            )}
          </View>
          {isEditingDescription ? (
            <TextInput
              style={[
                styles.descText,
                {
                  borderRadius: 8,
                  paddingLeft: 15,
                  marginLeft: 0,
                },
              ]}
              value={descriptionValue}
              onChangeText={onDescriptionChange}
              placeholder="Nhập mô tả thêm..."
              placeholderTextColor="#A0A3BD"
              multiline
              numberOfLines={3}
              autoFocus
              editable={!isUpdating}
            />
          ) : (
            <ThemedText style={styles.descText}>{getDescription()}</ThemedText>
          )}
        </ThemedView>
      )}

      {/* Card 3: Thông tin kiểm tra - chỉ hiển thị khi có testInfo */}
      {testInfo && (
        <ThemedView style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerBar} />
            <ThemedText type="subtitle" style={styles.headerText}>
              Thông tin kiểm tra
            </ThemedText>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={onEditTestInfo}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons
                name="edit"
                size={22}
                color="#25345C"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  backgroundColor: "#e6eef2",
                  borderRadius: 100,
                  padding: 10,
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="library-books" size={18} color="#25345C" />
            <ThemedText style={styles.infoText}>{getTestType()}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="description" size={18} color="#25345C" />
            <ThemedText style={styles.infoText}>{getTestContent()}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="design-services" size={18} color="#25345C" />
            <ThemedText style={styles.infoText}>{getTestReminder()}</ThemedText>
          </View>
        </ThemedView>
      )}
>>>>>>> local

      {/* Card 4: Tình trạng tiết học */}
      <ThemedView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerBar} />
          <ThemedText type="subtitle" style={styles.headerText}>Tình trạng tiết học</ThemedText>
        </View>
        {/* Nếu chưa hoàn thành tiết học */}
        {!isCompleted && (
          <TouchableOpacity style={styles.statusRowOrangeWrap} onPress={onCompletePress} activeOpacity={0.7}>
            <View style={styles.statusRowOrangeLeft}>
              <View style={styles.statusIconWrapOrange}>
<<<<<<< khoi-api
                <MaterialCommunityIcons name="checkbox-marked-outline" size={20} color="#fff" />
=======
                <MaterialIcons name="check-box" size={25} color="#fff" />
>>>>>>> local
              </View>
              <ThemedText style={styles.statusTextOrange}>Chưa hoàn thành tiết học</ThemedText>
            </View>
            {renderFmdBadIcon()}
            <View style={styles.statusArrowWrap}>
<<<<<<< khoi-api
              <IconSymbol name="chevron.right" size={22} color={Colors.light.icon} />
=======
              <MaterialIcons name="chevron-right" size={30} color="#fff" />
>>>>>>> local
            </View>
          </TouchableOpacity>
        )}
        {/* Nếu đã hoàn thành tiết học */}
        {isCompleted && (
          <>
<<<<<<< khoi-api
            <View style={styles.statusRowGreen}>
              <View style={styles.statusIconWrap}>
                <MaterialCommunityIcons name="checkbox-marked-outline" size={20} color="#fff" />
              </View>
              <ThemedText style={styles.statusTextWhite}>Đã hoàn thành tiết học</ThemedText>
            </View>
            {/* Card đánh giá tiết học */}
            {isEvaluated ? (
              <View style={[styles.statusRowGreen, { backgroundColor: '#5FC16E', marginTop: 0 }]}> 
                <View style={[styles.statusIconWrap, { backgroundColor: '#4CAF50' }]}> 
                  <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#fff" />
                </View>
                <ThemedText style={styles.statusTextWhite}>Đánh giá: {rank || 'A+'}</ThemedText>
              </View>
=======
            <TouchableOpacity
              style={styles.statusRowGreenWrap}
              activeOpacity={0.7}
            >
              <View style={styles.statusRowGreenLeft}>
                <View style={styles.statusIconWrap}>
                  <MaterialIcons name="check-box" size={25} color="#fff" />
                </View>
                <ThemedText style={styles.statusTextWhite}>
                  Đã hoàn thành tiết học
                </ThemedText>
              </View>
            </TouchableOpacity>
            {/* Card đánh giá tiết học */}
            {hasEvaluation() ? (
              <TouchableOpacity
                style={styles.statusRowGreenWrap}
                activeOpacity={0.7}
              >
                <View style={styles.statusRowGreenLeft}>
                  <View style={styles.statusIconWrap}>
                    <MaterialIcons name="grade" size={25} color="#fff" />
                  </View>
                  <ThemedText style={styles.statusTextWhite}>
                    Đánh giá: {lessonData?.evaluation?.grade || rank || "A+"}
                  </ThemedText>
                </View>
              </TouchableOpacity>
>>>>>>> local
            ) : (
              <TouchableOpacity 
                style={styles.statusRowBlueWrap}
                onPress={handleEvaluate}
                activeOpacity={0.7}
              >
                <View style={styles.statusRowBlueLeft}>
                  <View style={styles.statusIconWrapBlue}>
<<<<<<< khoi-api
                    <MaterialCommunityIcons name="message-text" size={20} color={Colors.light.icon} />
=======
                    <MaterialIcons
                      name="rate-review"
                      size={25}
                      color="#2CA6B0"
                    />
>>>>>>> local
                  </View>
                  <ThemedText style={styles.statusTextBlue}>Chưa đánh giá tiết học</ThemedText>
                </View>
                {renderFmdBadIcon()}
                <View style={styles.statusArrowWrap}>
<<<<<<< khoi-api
                  <IconSymbol name="chevron.right" size={22} color={Colors.light.icon} />
=======
                  <MaterialIcons
                    name="chevron-right"
                    size={30}
                    color="#2CA6B0"
                  />
>>>>>>> local
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
    alignItems: 'center',
    backgroundColor: '#F6F8FB',
  },
  card: {
    width: '92%',
    backgroundColor: '#F3F6FA',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerBar: {
<<<<<<< khoi-api
    width: 4,
    height: 28,
    backgroundColor: '#F9A825',
=======
    width: 3,
    height: 45,
    backgroundColor: "#F9A825",
>>>>>>> local
    borderRadius: 2,
    marginRight: 10,
  },
  headerText: {
<<<<<<< khoi-api
    color: '#26324D',
    fontWeight: '700',
    fontSize: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
=======
    color: "#25345C",
    fontSize: 24,
    fontFamily: "Baloo2-SemiBold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
>>>>>>> local
    marginBottom: 6,
    marginLeft: 4,
  },
  infoText: {
    marginLeft: 10,
    color: '#26324D',
    fontSize: 15,
    fontFamily: "Baloo2-Medium",
  },
  descText: {
    color: '#26324D',
    fontSize: 15,
    marginLeft: 14,
    marginTop: 2,
    lineHeight: 22,
    fontFamily: "Baloo2-Medium",
  },
  // Style cho card đánh giá tiết học
  statusRowGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5FC16E',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 10,
    marginLeft: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  statusRowGreenWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5FC16E",
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
  statusRowGreenLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  statusIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
<<<<<<< khoi-api
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statusTextWhite: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
=======
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statusTextWhite: {
    color: "#fff",
    fontSize: 18,
    marginTop: 5,
    fontFamily: "Baloo2-Medium",
>>>>>>> local
  },
  statusRowBlueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B6E0E6',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginLeft: 8,
    marginRight: 8,
<<<<<<< khoi-api
    marginTop: 2,
    shadowColor: '#000',
=======
    marginTop: 10,
    shadowColor: "#000",
>>>>>>> local
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
  },
  statusRowBlueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  statusIconWrapBlue: {
    width: 28,
    height: 28,
    borderRadius: 14,
<<<<<<< khoi-api
    backgroundColor: '#E3F6F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statusTextBlue: {
    color: '#2CA6B0',
    fontSize: 16,
    fontWeight: '600',
  },
  statusAlertDot: {
    position: 'absolute',
    left: -2,
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 9,
    backgroundColor: '#F04438',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
=======
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statusTextBlue: {
    color: "#2CA6B0",
    fontSize: 18,
    marginTop: 5,
    fontFamily: "Baloo2-Medium",
>>>>>>> local
  },
  statusArrowWrap: {
    marginLeft: 8,
    marginRight: 2,
  },
  statusRowOrangeWrap: {
<<<<<<< khoi-api
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9B233',
=======
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFB55F",
>>>>>>> local
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
  },
  statusRowOrangeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  statusIconWrapOrange: {
    width: 28,
    height: 28,
<<<<<<< khoi-api
    borderRadius: 14,
    backgroundColor: '#F9A825',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statusTextOrange: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
=======
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statusTextOrange: {
    color: "#fff",
    fontSize: 18,
    marginTop: 5,
    fontFamily: "Baloo2-Medium",
>>>>>>> local
  },
});

export default Slot_Information;
