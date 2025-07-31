import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { UserData } from "../../../../types/user.types";
import { fonts } from "../../../../utils/responsive";
import CustomDatePickerModal from "./CustomDatePickerModal";

interface UpdateProfileInfoProps {
  userData: UserData | null;
}

export default function UpdateProfileInfo({ userData }: UpdateProfileInfoProps) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [showInfo, setShowInfo] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  // Load data từ userData khi component mount hoặc userData thay đổi
  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      
      // Xử lý dateOfBirth
      if (userData.dateOfBirth) {
        const date = new Date(userData.dateOfBirth);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        setDob(`${day} - ${month} - ${year}`);
        setSelectedDate(date);
      }
      
      // Xử lý gender
      if (userData.gender) {
        const genderMap: { [key: string]: string } = {
          'male': 'Nam',
          'female': 'Nữ',
          'other': 'Khác'
        };
        setGender(genderMap[userData.gender] || userData.gender);
      }
    }
  }, [userData]);

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

  // Khi mở modal date picker
  const handleOpenDatePicker = () => {
    setShowDatePicker(true);
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
          color="#29375C"
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
                onPress={handleOpenDatePicker}
              >
                <MaterialIcons
                  name="calendar-today"
                  size={22}
                  color="#29375C"
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Giới tính */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>Giới tính</Text>
              <TextInput
                style={styles.inputTextOutline}
                value={gender}
                placeholder="Chọn giới tính"
                placeholderTextColor="#7a869a"
                editable={false}
                onPressIn={() => setShowGenderDropdown((v) => !v)}
              />
              <TouchableOpacity
                style={styles.inputIconOutline}
                onPress={() => setShowGenderDropdown((v) => !v)}
              >
                <Ionicons name="chevron-down" size={22} color="#29375C" />
              </TouchableOpacity>
              {showGenderDropdown && (
                <View style={styles.dropdownList}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setGender(option.value);
                        setShowGenderDropdown(false);
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#29375C",
                          fontWeight:
                            gender === option.value ? "bold" : "normal",
                        }}
                      >
                        {option.value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          {/* Custom Date Picker Modal */}
          <CustomDatePickerModal
            visible={showDatePicker}
            initialDate={userData?.dateOfBirth ? new Date(userData.dateOfBirth) : new Date()}
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
    color: "#29375C",
    flex: 1,
    fontFamily: fonts.bold,
  },
  icon: {
    color: "#29375C",
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
    borderColor: "#29375C",
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
    fontSize: 14,
    color: "#29375C",
    fontFamily: fonts.semiBold,
    zIndex: 2,
  },
  inputTextOutline: {
    fontSize: 16,
    color: "#29375C",
    fontFamily: fonts.semiBold,
  },
  label: {
    fontSize: 14,
    color: "#29375C",
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
    borderColor: "#29375C",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginTop: 2,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: "#29375C",
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
  dropdownList: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "108%",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: "#29375C",
    elevation: 5,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
