import { FontAwesome } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PlusIcon from "../PlusIcon";

const allStudents = [
  "Nguyen Van A",
  "Nguyen Van B",
  "Nguyen Van C",
  "Nguyen Van D",
];

const Student_Absent = () => {
  const [showCard, setShowCard] = useState(false);
  const [absentList, setAbsentList] = useState<string[]>([
    "Nguyen Van C",
    "Nguyen Van A",
  ]);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const inputRefs = useRef<(View | null)[]>([]);

  const handleAddAbsent = () => {
    setAbsentList([...absentList, ""]);
  };

  const handleRemoveAbsent = (index: number) => {
    setAbsentList(absentList.filter((_, i) => i !== index));
  };

  const handleSelectStudent = (student: string, index: number) => {
    const newList = [...absentList];
    newList[index] = student;
    setAbsentList(newList);
    setDropdownIndex(null);
  };

  const openDropdown = (index: number) => {
    setDropdownIndex(index);
  };

  const closeDropdown = () => setDropdownIndex(null);

  return (
    <View>
      {!showCard ? (
        <PlusIcon onPress={() => setShowCard(true)} text="Học sinh vắng" />
      ) : (
        <View style={[styles.card, { position: "relative" }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerBar} />
            <Text style={styles.headerText}>Học sinh vắng</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowCard(false)}
            >
              <View style={styles.closeCircle}>
                <FontAwesome name="close" size={22} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
          {absentList.map((item, index) => (
            <View key={index} style={styles.absentRow}>
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
                    style={styles.absentInput}
                    activeOpacity={0.7}
                    onPress={() => openDropdown(index)}
                  >
                    <Text style={styles.absentText}>
                      {item || "Chọn học sinh vắng"}
                    </Text>
                    <FontAwesome
                      name={
                        dropdownIndex === index ? "chevron-up" : "chevron-down"
                      }
                      size={18}
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
                          onPress={() => {
                            handleSelectStudent(student, index);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{student}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.absentCloseBtn,
                    { alignSelf: "flex-start", marginLeft: 8 },
                  ]}
                  onPress={() => handleRemoveAbsent(index)}
                >
                  <FontAwesome
                    name="close"
                    size={20}
                    color="#F04438"
                    marginTop={10}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <PlusIcon onPress={handleAddAbsent} text="Thêm học sinh vắng" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "98%",
    backgroundColor: "#E9EBF0",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    marginTop: 8,
    alignSelf: "center",
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
    color: "#26324D",
    fontWeight: "700",
    fontSize: 20,
    flex: 1,
  },
  closeBtn: {
    marginLeft: 8,
  },
  closeCircle: {
    backgroundColor: "#F04438",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  absentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  absentInputWrap: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    width: "90%",
  },
  absentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  absentInput: {
    flex: 1,
    backgroundColor: "#A0A3BD",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  absentText: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
  },
  absentCloseBtn: {
    marginLeft: 8,
    backgroundColor: "transparent",
  },
  dropdown: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 4,
    maxHeight: 180,
    width: "100%",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#29375C",
  },
});

export default Student_Absent;
