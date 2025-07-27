import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  lessonEvaluateService,
  Student,
} from "../../services/lesson_evaluate.service";
import { fonts } from "../../utils/responsive";
import PlusIcon from "../PlusIcon";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

interface Student_AbsentProps {
  lessonId: string;
  onAbsentStudentsChange?: (
    absentStudents: { student: string; name: string }[]
  ) => void;
}

const Student_Absent: React.FC<Student_AbsentProps> = ({
  lessonId,
  onAbsentStudentsChange,
}) => {
  const [showCard, setShowCard] = useState(false);
  const [absentList, setAbsentList] = useState<
    { student: string; name: string }[]
  >([]);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showCard && lessonId) {
      loadStudents();
    }
  }, [showCard, lessonId]);

  useEffect(() => {
    onAbsentStudentsChange?.(absentList.filter((item) => item.student));
  }, [absentList, onAbsentStudentsChange]);

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

  const handleAddAbsent = () => {
    setAbsentList([...absentList, { student: "", name: "" }]);
  };

  const handleRemoveAbsent = (index: number) => {
    setAbsentList(absentList.filter((_, i) => i !== index));
  };

  const handleSelectStudent = (
    studentId: string,
    studentName: string,
    index: number
  ) => {
    const newList = [...absentList];
    newList[index] = { student: studentId, name: studentName };
    setAbsentList(newList);
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
          <PlusIcon onPress={() => setShowCard(true)} text="Học sinh vắng" />
        </View>
      ) : (
        <ThemedView style={[styles.card, { position: "relative" }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerBar} />
            <View style={styles.headerContent}>
              <ThemedText type="subtitle" style={styles.headerText}>
                Học sinh vắng
              </ThemedText>
              <ThemedText style={styles.headerSubtext}>
                {absentList.filter((item) => item.student).length} học sinh
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
          <View style={styles.studentsContainer}>
            {absentList.map((item, index) => (
              <View key={index} style={styles.studentCard}>
                <View style={styles.studentRow}>
                  <TouchableOpacity
                    style={styles.studentSelector}
                    activeOpacity={0.7}
                    onPress={() => openDropdown(index)}
                  >
                    <View style={styles.studentInfo}>
                      <MaterialIcons
                        name="person"
                        size={20}
                        color={item.student ? "#F44336" : "#9E9E9E"}
                        style={styles.studentIcon}
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
                      name="keyboard-arrow-down"
                      size={20}
                      color="#9E9E9E"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveAbsent(index)}
                  >
                    <MaterialIcons
                      name="remove-circle-outline"
                      size={18}
                      color="#F44336"
                    />
                  </TouchableOpacity>
                </View>

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
                        <MaterialIcons
                          name="person"
                          size={16}
                          color="#9E9E9E"
                          style={{ marginRight: 8 }}
                        />
                        <ThemedText style={styles.dropdownItemText}>
                          {student.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAbsent}>
            <MaterialIcons name="add" size={20} color="#25345C" />
            <ThemedText style={styles.addButtonText}>
              Thêm học sinh vắng
            </ThemedText>
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
  studentsContainer: {
    marginBottom: 16,
  },
  studentCard: {
    marginBottom: 12,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#29375C",
    borderRadius: 16,
    padding: 10,
    marginLeft: 10,
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
  studentIcon: {
    marginRight: 8,
  },
  studentName: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.medium,
    flex: 1,
  },
  placeholderText: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: fonts.regular,
  },
  removeBtn: {
    padding: 8,
    marginLeft: 8,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: "#525D7B",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 2,
    maxHeight: 180,
    width: "70%",
    marginLeft: 10,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: fonts.regular,
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

export default Student_Absent;
