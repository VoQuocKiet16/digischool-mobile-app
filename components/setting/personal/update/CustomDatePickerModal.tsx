import React, { useEffect, useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface CustomDatePickerModalProps {
  visible: boolean;
  initialDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

export default function CustomDatePickerModal({
  visible,
  initialDate = new Date(),
  onConfirm,
  onCancel,
}: CustomDatePickerModalProps) {
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    initialDate.getMonth() + 1
  );
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  // Cập nhật các giá trị khi initialDate thay đổi hoặc modal mở
  useEffect(() => {
    if (visible && initialDate) {
      setSelectedYear(initialDate.getFullYear());
      setSelectedMonth(initialDate.getMonth() + 1);
      setSelectedDay(initialDate.getDate());
    }
  }, [visible, initialDate]);

  // Dropdown state
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Tạo danh sách năm, tháng, ngày
  const years = Array.from({ length: 61 }, (_, i) => 1950 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from(
    { length: getDaysInMonth(selectedMonth, selectedYear) },
    (_, i) => i + 1
  );

  // Khi đổi tháng/năm thì kiểm tra lại ngày
  useEffect(() => {
    const maxDay = getDaysInMonth(selectedMonth, selectedYear);
    if (selectedDay > maxDay) setSelectedDay(maxDay);
  }, [selectedMonth, selectedYear]);

  // Tắt dropdown khi modal bị tắt
  useEffect(() => {
    if (!visible) {
      setShowDayDropdown(false);
      setShowMonthDropdown(false);
      setShowYearDropdown(false);
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm(new Date(selectedYear, selectedMonth - 1, selectedDay));
  };

  // Helper render dropdown
  const renderDropdown = (
    data: number[],
    selected: number,
    setSelected: (v: number) => void,
    show: boolean,
    setShow: (v: boolean) => void
  ) =>
    show ? (
      <ScrollView style={styles.dropdownList}>
        {data.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.dropdownItem,
              selected === item && styles.selectedDropdownItem,
            ]}
            onPress={() => {
              setSelected(item);
              setShow(false);
            }}
          >
            <Text
              style={[
                styles.dropdownItemText,
                selected === item && styles.selectedDropdownItemText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    ) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={onCancel}
        activeOpacity={1}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Chọn ngày sinh</Text>
          <View style={styles.pickerRow}>
            {/* Ngày */}
            <View style={styles.pickerCol}>
              <Text style={styles.label}>Ngày</Text>
              <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => {
                  setShowDayDropdown((v) => !v);
                  setShowMonthDropdown(false);
                  setShowYearDropdown(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownValue}>{selectedDay}</Text>
              </TouchableOpacity>
              {renderDropdown(
                days,
                selectedDay,
                setSelectedDay,
                showDayDropdown,
                setShowDayDropdown
              )}
            </View>
            {/* Tháng */}
            <View style={styles.pickerCol}>
              <Text style={styles.label}>Tháng</Text>
              <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => {
                  setShowMonthDropdown((v) => !v);
                  setShowDayDropdown(false);
                  setShowYearDropdown(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownValue}>{selectedMonth}</Text>
              </TouchableOpacity>
              {renderDropdown(
                months,
                selectedMonth,
                setSelectedMonth,
                showMonthDropdown,
                setShowMonthDropdown
              )}
            </View>
            {/* Năm */}
            <View style={styles.pickerCol}>
              <Text style={styles.label}>Năm</Text>
              <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => {
                  setShowYearDropdown((v) => !v);
                  setShowDayDropdown(false);
                  setShowMonthDropdown(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownValue}>{selectedYear}</Text>
              </TouchableOpacity>
              {renderDropdown(
                years,
                selectedYear,
                setSelectedYear,
                showYearDropdown,
                setShowYearDropdown
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: 300,
    minHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#29375C",
    marginBottom: 16,
    textAlign: "center",
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  pickerCol: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#29375C",
    marginBottom: 8,
  },
  dropdownBox: {
    width: "90%",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#29375C",
    marginBottom: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  dropdownValue: {
    fontSize: 16,
    color: "#29375C",
    fontWeight: "bold",
  },
  dropdownList: {
    position: "absolute",
    top: 48,
    width: "90%",
    maxHeight: 120,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 8,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedDropdownItem: {
    backgroundColor: "#e5e7eb",
  },
  dropdownItemText: {
    color: "#29375C",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  selectedDropdownItemText: {
    color: "#29375C",
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#29375C",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
