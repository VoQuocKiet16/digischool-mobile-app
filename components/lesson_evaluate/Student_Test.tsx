import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import PlusIcon from "../PlusIcon";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

const allStudents = [
  'Nguyen Van A',
  'Nguyen Van B',
  'Nguyen Van C',
  'Nguyen Van D',
];

const Student_Test = () => {
  const [showCard, setShowCard] = useState(false);
  const [testList, setTestList] = useState<string[]>(['Nguyen Van A']);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [scoreList, setScoreList] = useState<(string | number)[]>(['']);

  const handleAddTest = () => {
    setTestList([...testList, '']);
    setScoreList([...scoreList, '']);
  };

  const handleRemoveTest = (index: number) => {
    setTestList(testList.filter((_, i) => i !== index));
    setScoreList(scoreList.filter((_, i) => i !== index));
  };

  const handleSelectStudent = (student: string, index: number) => {
    const newList = [...testList];
    newList[index] = student;
    setTestList(newList);
    setDropdownIndex(null);
  };

  const handleScoreChange = (text: string, index: number) => {
    // Chỉ cho phép nhập số, rỗng hoặc 1-10
    let value = text.replace(/[^0-9]/g, '');
    if (value === '') {
      setScoreList(list => {
        const newList = [...list];
        newList[index] = '';
        return newList;
      });
      return;
    }
    let num = parseInt(value, 10);
    if (num < 1) num = 1;
    if (num > 10) num = 10;
    setScoreList(list => {
      const newList = [...list];
      newList[index] = num;
      return newList;
    });
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
            text="Thêm học sinh kiểm tra"
          />
        </View>
      ) : (
        <ThemedView style={[styles.card, { position: "relative" }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerBar} />
            <ThemedText type="subtitle" style={styles.headerText}>
              Kiểm tra miệng
            </ThemedText>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowCard(false)}
            >
              <View style={styles.closeCircle}>
                <MaterialIcons name="close" size={22} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
          {testList.map((item, index) => (
            <View key={index} style={styles.testRow}>
              <View
                style={{
                  flex: 1,
                  position: "relative",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    style={styles.testInput}
                    activeOpacity={0.7}
                    onPress={() => openDropdown(index)}
                  >
                    <ThemedText style={styles.testText}>
                      {item || "Chọn học sinh kiểm tra"}
                    </ThemedText>
                    {item && (
                      <View style={styles.scoreInputBox}>
                        <TextInput
                          style={styles.scoreInput}
                          placeholder="Nhập điểm"
                          placeholderTextColor="#C4C4C4"
                          keyboardType="numeric"
                          value={scoreList[index]?.toString() || ''}
                          onChangeText={text => handleScoreChange(text, index)}
                          maxLength={2}
                        />
                      </View>
                    )}
                    <MaterialIcons
                      name="keyboard-arrow-down"
                      size={24}
                      color="#fff"
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>
                  {dropdownIndex === index && (
                    <View style={styles.dropdown}>
                      {allStudents.map((student) => (
                        <TouchableOpacity
                          key={student}
                          style={styles.dropdownItem}
                          onPress={() => handleSelectStudent(student, index)}
                        >
                          <ThemedText style={styles.dropdownItemText}>
                            {student}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.testCloseBtn,
                    { alignSelf: "flex-start", marginLeft: 8 },
                  ]}
                  onPress={() => handleRemoveTest(index)}
                >
                  <MaterialIcons
                    name="close"
                    size={16}
                    color="#fff"
                    style={{
                      backgroundColor: "#CF2020",
                      borderRadius: 50,
                      padding: 5,
                      marginTop: 10,
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ marginTop: 10, marginLeft: 10 }}>
            <PlusIcon onPress={handleAddTest} text="Thêm học sinh kiểm tra" />
          </View>
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
    alignSelf: 'center',
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
    width: 3,
    height: 45,
    backgroundColor: "#F9A825",
    borderRadius: 2,
    marginRight: 10,
  },
  headerText: {
    color: "#25345C",
    fontSize: 24,
    fontFamily: "Baloo2-SemiBold",
    flex: 1,
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
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 10,
  },
  testInput: {
    flex: 1,
    backgroundColor: "#29375C",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  testText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  scoreInputBox: {
    backgroundColor: '#7D88A7',
    borderRadius: 12,
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreInput: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
    paddingHorizontal: 0,
    minWidth: 40,
    textAlign: 'center',
  },
  testCloseBtn: {
    marginLeft: 8,
    backgroundColor: "transparent",
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
    maxHeight: 180,
    width: '100%',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#fff",
  },
});

export default Student_Test;
