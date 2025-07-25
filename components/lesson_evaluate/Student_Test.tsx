import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
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

interface Student_TestProps {
  lessonId: string;
  onOralTestsChange?: (
    oralTests: { student: string; name: string; score: number }[]
  ) => void;
}

const Student_Test: React.FC<Student_TestProps> = ({
  lessonId,
  onOralTestsChange,
}) => {
  const [showCard, setShowCard] = useState(false);
  const [testList, setTestList] = useState<{ student: string; name: string }[]>(
    []
  );
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [scoreList, setScoreList] = useState<(string | number)[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showCard && lessonId) {
      loadStudents();
    }
  }, [showCard, lessonId]);

  useEffect(() => {
    const oralTests = testList
      .map((student, index) => ({
        student: student.student,
        name: student.name,
        score: Number(scoreList[index]) || 0,
      }))
      .filter((item) => item.student && item.score > 0);
    onOralTestsChange?.(oralTests);
  }, [testList, scoreList, onOralTestsChange]);

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

  const handleAddTest = () => {
    setTestList([...testList, { student: "", name: "" }]);
    setScoreList([...scoreList, ""]);
  };

  const handleRemoveTest = (index: number) => {
    setTestList(testList.filter((_, i) => i !== index));
    setScoreList(scoreList.filter((_, i) => i !== index));
  };

  const handleSelectStudent = (
    studentId: string,
    studentName: string,
    index: number
  ) => {
    const newList = [...testList];
    newList[index] = { student: studentId, name: studentName };
    setTestList(newList);
    setDropdownIndex(null);
  };

  const openDropdown = (index: number) => {
    if (dropdownIndex === index) {
      setDropdownIndex(null);
    } else {
      setDropdownIndex(index);
    }
  };

  const getScoreColor = (score: string | number) => {
    if (!score || score === "") return "#7D88A7";
    const num = Number(score);
    if (num >= 8) return "#4CAF50";
    if (num >= 6.5) return "#FF9800";
    return "#F44336";
  };

  return (
    <View>
      {!showCard ? (
        <View style={{ marginLeft: 16 }}>
          <PlusIcon
            onPress={() => setShowCard(true)}
            text="Thêm học sinh kiểm tra"
          />
        </View>
      ) : (
        <ThemedView style={[styles.card, { position: "relative" }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerBar} />
            <View style={styles.headerContent}>
              <ThemedText type="subtitle" style={styles.headerText}>
                Kiểm tra miệng
              </ThemedText>
              <ThemedText style={styles.headerSubtext}>
                {testList.filter((item) => item.student).length} học sinh
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
            {testList.map((item, index) => (
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
                        color={item.student ? "#4CAF50" : "#9E9E9E"}
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

                  {item.student && (
                    <View style={styles.scoreContainer}>
                      <TextInput
                        style={[
                          styles.scoreInput,
                          { backgroundColor: getScoreColor(scoreList[index]) },
                        ]}
                        placeholder="Điểm"
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        keyboardType="numeric"
                        value={scoreList[index]?.toString() || ""}
                        onChangeText={(text) => {
                          let value = text.replace(/[^0-9]/g, "");
                          if (value === "") {
                            setScoreList((list) => {
                              const newList = [...list];
                              newList[index] = "";
                              return newList;
                            });
                          } else {
                            let num = parseInt(value, 10);
                            if (num < 1) num = 1;
                            if (num > 10) num = 10;
                            const newScoreList = [...scoreList];
                            newScoreList[index] = num;
                            setScoreList(newScoreList);
                          }
                        }}
                        maxLength={2}
                      />
                      <ThemedText style={styles.scoreLabel}>/10</ThemedText>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveTest(index)}
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

          <TouchableOpacity style={styles.addButton} onPress={handleAddTest}>
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
    fontFamily: "Baloo2-SemiBold",
    marginBottom: 2,
  },
  headerSubtext: {
    color: "#666666",
    fontSize: 14,
    fontFamily: "Baloo2-Regular",
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
    fontFamily: "Baloo2-Medium",
    flex: 1,
  },
  placeholderText: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Baloo2-Regular",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  scoreInput: {
    width: 50,
    height: 36,
    borderRadius: 8,
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
    marginRight: 4,
  },
  scoreLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Baloo2-Regular",
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
    fontFamily: "Baloo2-Regular",
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
    fontFamily: "Baloo2-Medium",
    marginLeft: 8,
    textDecorationLine: "underline",
  },
});

export default Student_Test;
