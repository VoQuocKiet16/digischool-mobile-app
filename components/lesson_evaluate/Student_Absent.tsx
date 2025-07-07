import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import PlusIcon from "../PlusIcon";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

const allStudents = [
  'Nguyen Van A',
  'Nguyen Van B',
  'Nguyen Van C',
  'Nguyen Van D',
];

const Student_Absent = () => {
  const [showCard, setShowCard] = useState(false);
  const [absentList, setAbsentList] = useState<string[]>(['Nguyen Van C', 'Nguyen Van A']);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const inputRefs = useRef<(View | null)[]>([]);

  const handleAddAbsent = () => {
    setAbsentList([...absentList, '']);
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
            <ThemedText type="subtitle" style={styles.headerText}>
              Học sinh vắng
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
          {absentList.map((item, index) => (
            <View key={index} style={styles.absentRow}>
              <View style={{flex: 1, position: 'relative', flexDirection: 'row', alignItems: 'center'}}>
                <View style={{flex: 1}}>
                  <TouchableOpacity
                    style={styles.absentInput}
                    activeOpacity={0.7}
                    onPress={() => openDropdown(index)}
                  >
                    <ThemedText style={styles.absentText}>
                      {item || "Chọn học sinh vắng"}
                    </ThemedText>
                    <MaterialIcons
                      name="keyboard-arrow-down"
                      size={24}
                      color="#fff"
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>
                  {dropdownIndex === index && (
                    <View style={styles.dropdown}>
                      {allStudents.map(student => (
                        <TouchableOpacity
                          key={student}
                          style={styles.dropdownItem}
                          onPress={() => {
                            handleSelectStudent(student, index);
                          }}
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
                  style={[styles.absentCloseBtn, {alignSelf: 'flex-start', marginLeft: 8}]}
                  onPress={() => handleRemoveAbsent(index)}
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
            <PlusIcon onPress={handleAddAbsent} text="Thêm học sinh vắng" />
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
  absentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 10,
  },
  absentInputWrap: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    width: '90%',
  },
  absentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  absentInput: {
    flex: 1,
    backgroundColor: "#29375C",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  absentText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  absentCloseBtn: {
    marginLeft: 8,
    backgroundColor: 'transparent',
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

export default Student_Absent;
