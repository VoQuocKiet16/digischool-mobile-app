import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  lessonEvaluateService,
  Student,
} from "../../services/lesson_evaluate.service";
import PlusIcon from "../PlusIcon";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { responsive, responsiveValues, fonts } from "../../utils/responsive";

interface ViolateItem {
  student: string;
  name: string;
  reason: string;
}

interface Student_ViolatesProps {
  lessonId: string;
  onViolationsChange?: (
    violations: { student: string; reason: string }[]
  ) => void;
}

const Student_Violates: React.FC<Student_ViolatesProps> = ({
  lessonId,
  onViolationsChange,
}) => {
  const [showCard, setShowCard] = useState(false);
  const [violateList, setViolateList] = useState<ViolateItem[]>([]);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [isReasonFocused, setIsReasonFocused] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showCard && lessonId) {
      loadStudents();
    }
  }, [showCard, lessonId]);

  useEffect(() => {
    const violations = violateList
      .filter((item) => item.student && item.reason)
      .map((item) => ({
        student: item.student,
        reason: item.reason,
      }));
    onViolationsChange?.(violations);
  }, [violateList, onViolationsChange]);

  const loadStudents = async () => {
    if (!lessonId || lessonId.trim() === "") {
      Alert.alert("Lỗi", "LessonId không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const response = await lessonEvaluateService.getStudentsByLesson(
        lessonId
      );
      setStudents(response.students);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  const handleAddViolate = () => {
    setViolateList([...violateList, { student: "", name: "", reason: "" }]);
  };

  const handleRemoveViolate = (index: number) => {
    setViolateList(violateList.filter((_, i) => i !== index));
  };

  const handleReasonChange = (index: number, text: string) => {
    setViolateList((list) => {
      const newList = [...list];
      newList[index].reason = text;
      return newList;
    });
  };

  const handleSelectStudent = (
    studentId: string,
    studentName: string,
    index: number
  ) => {
    setViolateList((list) => {
      const newList = [...list];
      newList[index].student = studentId;
      newList[index].name = studentName;
      return newList;
    });
    setDropdownIndex(null);
  };

  const openDropdown = (index: number) => {
    if (dropdownIndex === index) {
      setDropdownIndex(null);
    } else {
      setDropdownIndex(index);
    }
  };

  return (
    <View>
      {!showCard ? (
        <View style={{ marginLeft: 16 }}>
          <PlusIcon
            onPress={() => setShowCard(true)}
            text="Thêm học sinh vi phạm"
          />
        </View>
      ) : (
        <ThemedView style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerBar} />
            <View style={styles.headerContent}>
              <ThemedText type="subtitle" style={styles.headerText}>
                Học sinh vi phạm
              </ThemedText>
              <ThemedText style={styles.headerSubtext}>
                {violateList.filter((item) => item.student).length} học sinh
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowCard(false)}
            >
              <View style={styles.closeCircle}>
                <MaterialIcons name="close" size={22} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Students List */}
          <View style={styles.studentsList}>
            {violateList.map((item, index) => (
              <View key={index} style={styles.studentItem}>
                {/* Student Selection */}
                <View style={styles.studentHeader}>
                  <TouchableOpacity
                    style={styles.studentSelector}
                    onPress={() => {
                      if (isReasonFocused !== index) openDropdown(index);
                    }}
                    disabled={isReasonFocused === index}
                  >
                    <View style={styles.studentInfo}>
                      <MaterialIcons
                        name="person"
                        size={20}
                        color={item.student ? "#fff" : "#999"}
                        style={{ marginRight: 8 }}
                      />
                      <ThemedText
                        style={[
                          styles.studentName,
                          !item.student && styles.placeholderText,
                        ]}
                      >
                        {item.name || "Chọn học sinh"}
                      </ThemedText>
                    </View>
                    <MaterialIcons
                      name={
                        dropdownIndex === index ? "expand-less" : "expand-more"
                      }
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveViolate(index)}
                  >
                    <MaterialIcons
                      name="remove-circle-outline"
                      size={20}
                      color="#FF5252"
                    />
                  </TouchableOpacity>
                </View>
                {/* Dropdown */}
                {dropdownIndex === index && (
                  <View style={styles.dropdown}>
                    {students.map((student) => (
                      <TouchableOpacity
                        key={student.id}
                        style={styles.dropdownItem}
                        onPress={() =>
                          handleSelectStudent(student.id, student.name, index)
                        }
                      >
                        <View style={styles.dropdownAvatar}>
                          <MaterialIcons
                            name="person"
                            size={16}
                            color="#9E9E9E"
                            style={{ marginRight: 8 }}
                          />
                        </View>
                        <Text style={styles.dropdownItemText}>
                          {student.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Reason Input */}
                {item.name && (
                  <View style={styles.reasonSection}>
                    <TextInput
                      style={styles.reasonInput}
                      placeholder="Mô tả chi tiết lý do vi phạm..."
                      placeholderTextColor="#999"
                      value={item.reason}
                      onChangeText={(text) => handleReasonChange(index, text)}
                      multiline
                      numberOfLines={3}
                      onFocus={() => setIsReasonFocused(index)}
                      onBlur={() => setIsReasonFocused(null)}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddViolate}>
            <MaterialIcons name="add" size={20} color="#25345C" />
            <ThemedText style={styles.addButtonText}>Thêm học sinh</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "92%",
    backgroundColor: "#F3F6FA",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    marginTop: 8,
    alignSelf: "center",
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
    height: 45,
    backgroundColor: "#F9A825",
    borderRadius: 2,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerText: {
    color: "#25345C",
    fontSize: 24,
    fontFamily: fonts.semiBold,
    marginBottom: 2,
  },
  headerSubtext: {
    color: "#666666",
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  closeBtn: {
    backgroundColor: "#FFA49F",
    padding: 8,
    borderRadius: 50,
    marginLeft: 8,
  },
  closeCircle: {
    backgroundColor: "#CF2020",
    borderRadius: 16,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  studentsList: {
    marginBottom: 16,
  },
  studentItem: {
    marginBottom: 16,
    backgroundColor: "#29375C",
    borderRadius: 16,
    padding: 12,
    marginLeft: 10,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  studentSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 8,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  studentName: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: "#fff",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
    fontFamily: fonts.regular,
  },
  removeButton: {
    padding: 4,
  },
  reasonSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  reasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reasonInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    textAlignVertical: "top",
    minHeight: 80,
  },
  dropdown: {
    marginTop: 10,
    backgroundColor: "#525D7B",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 2,
    maxHeight: 200,
    width: "70%",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownAvatar: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: "#fff",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  addButtonText: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: fonts.medium,
    marginLeft: 8,
    textDecorationLine: "underline",
  },
});

export default Student_Violates;
