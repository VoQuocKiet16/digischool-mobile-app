import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import CustomDatePickerModal from "./CustomDatePickerModal";

export default function UpdateProfileInfo() {
  const [name, setName] = useState("Nguyen Van A");
  const [dob, setDob] = useState("01 - 01 - 2003");
  const [gender, setGender] = useState("Nam");
  const [showInfo, setShowInfo] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(2003, 0, 1));

  const genderOptions = [
    { key: "Nam", value: "Nam" },
    { key: "Nữ", value: "Nữ" },
    { key: "Khác", value: "Khác" },
  ];

  // Khi xác nhận chọn ngày
  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    setDob(`${day} - ${month} - ${year}`);
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setShowInfo((v) => !v)}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <Ionicons
          name={showInfo ? "chevron-down" : "chevron-forward"}
          size={24}
          color="#25345D"
          style={styles.icon}
        />
      </TouchableOpacity>
      {showInfo && (
        <>
          {/* Họ và tên */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={{ ...styles.floatingLabel, marginTop: -8 }}>
                Họ và tên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.inputTextOutline}
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#7a869a"
              />
            </View>
          </View>
          {/* Ngày sinh */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>Ngày sinh</Text>
              <TextInput
                style={styles.inputTextOutline}
                value={dob}
                onChangeText={setDob}
                placeholder=" "
                placeholderTextColor="#7a869a"
                editable={false}
              />
              <TouchableOpacity
                style={styles.inputIconOutline}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialIcons
                  name="calendar-today"
                  size={22}
                  color="#25345D"
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Giới tính */}
          <View style={styles.fieldWrap}>
            <Text style={styles.floatingLabel}>Giới tính</Text>
            <SelectList
              setSelected={setGender}
              data={genderOptions}
              save="value"
              placeholder="Chọn giới tính"
              boxStyles={{
                marginTop: 8,
                borderRadius: 14,
                borderColor: "#25345D",
                backgroundColor: "#fff",
              }}
              dropdownStyles={{
                borderRadius: 14,
                borderColor: "#25345D",
                backgroundColor: "#fff",
              }}
              defaultOption={{ key: gender, value: gender }}
            />
          </View>
          {/* Custom Date Picker Modal */}
          <CustomDatePickerModal
            visible={showDatePicker}
            initialDate={selectedDate}
            onConfirm={handleDateConfirm}
            onCancel={() => setShowDatePicker(false)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    paddingRight: 20,
    paddingLeft: 20,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  title: {
    fontSize: 25,
    color: "#25345D",
    flex: 1,
    fontFamily: "Baloo2-Bold",
  },
  icon: {
    color: "#25345D",
    marginLeft: 6,
    backgroundColor: "#C4C4C4",
    borderRadius: 20,
    padding: 4,
  },
  fieldWrap: {
    marginBottom: 25,
  },
  outlineInputBox: {
    borderWidth: 1,
    borderColor: "#25345D",
    borderRadius: 12,
    paddingVertical: 17,
    paddingHorizontal: 25,
    backgroundColor: "#f7f7f7",
    marginTop: 8,
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    top: -10,
    left: 18,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 4,
    fontSize: 12,
    color: "#25345D",
    fontWeight: "bold",
    zIndex: 2,
  },
  inputTextOutline: {
    fontSize: 14,
    color: "#25345D",
    fontWeight: "bold",
    paddingVertical: 0,
  },
  label: {
    fontSize: 14,
    color: "#25345D",
    fontWeight: "500",
  },
  required: {
    color: "#E53935",
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#25345D",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginTop: 2,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: "#25345D",
    fontWeight: "bold",
    paddingVertical: 2,
  },
  inputIcon: {
    marginLeft: 8,
  },
  inputIconOutline: {
    position: "absolute",
    right: 14,
    top: "50%",
    marginTop: 6,
  },
});
