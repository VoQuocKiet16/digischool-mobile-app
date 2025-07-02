import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PlusIcon from "../PlusIcon";

const allStudents = [
  "Nguyen Van A",
  "Nguyen Van B",
  "Nguyen Van C",
  "Nguyen Van D",
];

interface ViolateItem {
  name: string;
  reason: string;
}

const Student_Violates = () => {
  const [showCard, setShowCard] = useState(false);
  const [violateList, setViolateList] = useState<ViolateItem[]>([
    { name: "Nguyen Van A", reason: "" },
  ]);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [isReasonFocused, setIsReasonFocused] = useState<number | null>(null);

  const handleAddViolate = () => {
    setViolateList([...violateList, { name: "", reason: "" }]);
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

  const handleSelectStudent = (student: string, index: number) => {
    setViolateList((list) => {
      const newList = [...list];
      newList[index].name = student;
      return newList;
    });
    setDropdownIndex(null);
  };

  const openDropdown = (index: number) => {
    setDropdownIndex(index);
  };

  const closeDropdown = () => setDropdownIndex(null);

  return (
    <View>
      {!showCard ? (
        <PlusIcon
          onPress={() => setShowCard(true)}
          text="Thêm học sinh vi phạm"
        />
      ) : (
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerBar} />
            <Text style={styles.headerText}>Học sinh vi phạm</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowCard(false)}
            >
              <View style={styles.closeCircle}>
                <FontAwesome name="close" size={22} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
          {violateList.map((item, index) => (
            <View key={index} style={styles.violateRow}>
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
                    style={styles.violateInputWrap}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (isReasonFocused !== index) openDropdown(index);
                    }}
                    disabled={isReasonFocused === index}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Text style={styles.violateText}>
                        {item.name || "Chọn học sinh vi phạm"}
                      </Text>
                      <FontAwesome
                        name={
                          dropdownIndex === index
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={22}
                        color="#fff"
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                    {item.name && (
                      <TextInput
                        style={styles.violateReasonInput}
                        placeholder="Nhập lý do vi phạm"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={item.reason}
                        onChangeText={(text) => handleReasonChange(index, text)}
                        textAlignVertical="center"
                        onFocus={() => setIsReasonFocused(index)}
                        onBlur={() => setIsReasonFocused(null)}
                      />
                    )}
                    {dropdownIndex === index && (
                      <View style={styles.dropdown}>
                        {allStudents.map((student) => (
                          <TouchableOpacity
                            key={student}
                            style={styles.dropdownItem}
                            onPress={() => handleSelectStudent(student, index)}
                          >
                            <Text style={styles.dropdownItemText}>
                              {student}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[
                    styles.violateCloseBtn,
                    { alignSelf: "flex-start", marginLeft: 8 },
                  ]}
                  onPress={() => handleRemoveViolate(index)}
                >
                  <FontAwesome name="close" size={20} color="#F04438" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <PlusIcon onPress={handleAddViolate} text="Thêm học sinh vi phạm" />
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
  violateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  violateInputWrap: {
    backgroundColor: "#A0A3BD",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: 0,
  },
  violateText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Baloo 2",
    marginBottom: 0,
  },
  violateReasonInput: {
    backgroundColor: "#7D88A7",
    borderRadius: 16,
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "500",
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: "100%",
    marginTop: 16,
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
  violateCloseBtn: {
    backgroundColor: "transparent",
  },
});

export default Student_Violates;
