import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const REMIND_OPTIONS = [
  "Trước 10 phút",
  "Trước 20 phút",
  "Trước 30 phút",
  "Trước 40 phút",
  "Trước 50 phút",
];

export default function DetailActivity({
  activity = {
    title: "Tiêu đề hoạt động mẫu",
    detail: "Nội dung chi tiết hoạt động mẫu",
    remind: true,
    remindTime: REMIND_OPTIONS[2],
  },
  onDelete = () => {},
  onSave = () => {},
}) {
  return (
    <View style={styles.container}>
      {/* Tiêu đề hoạt động */}
      <View style={styles.inputWrap}>
        <Text style={styles.label}>
          Tiêu đề hoạt động <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputDisabled}>
          <Text style={styles.inputText}>{activity.title}</Text>
        </View>
      </View>
      {/* Chi tiết */}
      <View style={styles.inputWrap}>
        <Text style={styles.label}>
          Chi tiết <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputDisabled}>
          <Text style={styles.inputText}>{activity.detail}</Text>
        </View>
      </View>
      {/* Nhắc nhở */}
      <View style={styles.remindBox}>
        <View style={styles.remindHeader}>
          <Text style={styles.remindLabel}>Nhắc nhở</Text>
        </View>
        {activity.remind && (
          <View style={styles.selectBox}>
            <Text style={styles.selectedText}>{activity.remindTime}</Text>
          </View>
        )}
        {activity.remind && (
          <View style={styles.selectList}>
            {REMIND_OPTIONS.map((option) => (
              <View
                key={option}
                style={[
                  styles.selectItem,
                  activity.remindTime === option && styles.selectedItem,
                ]}
              >
                <Text
                  style={
                    activity.remindTime === option
                      ? styles.selectedItemText
                      : styles.selectItemText
                  }
                >
                  {option}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {/* Nút Xóa bỏ và Lưu */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteBtnText}>Xóa bỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveBtnText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAFA",
    flex: 1,
    padding: 20,
    paddingTop: 30,
  },
  inputWrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: "#25345D",
    fontWeight: "bold",
    marginBottom: 4,
  },
  required: {
    color: "#E53935",
    fontSize: 16,
  },
  inputDisabled: {
    borderWidth: 1.2,
    borderColor: "#B6C5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    minHeight: 40,
  },
  inputText: {
    color: "#B6B6B6",
    fontSize: 15,
  },
  remindBox: {
    borderWidth: 1.2,
    borderColor: "#25345D",
    borderRadius: 14,
    backgroundColor: "#F7F7F7",
    padding: 16,
    marginBottom: 32,
  },
  remindHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  remindLabel: {
    fontSize: 15,
    color: "#25345D",
    fontWeight: "bold",
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#25345D",
    borderRadius: 8,
    backgroundColor: "#E9ECF2",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  selectedText: {
    color: "#25345D",
    fontSize: 15,
    fontWeight: "bold",
  },
  selectList: {
    backgroundColor: "#E9ECF2",
    borderRadius: 8,
    marginTop: 2,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#B6C5E1",
  },
  selectItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectItemText: {
    color: "#25345D",
    fontSize: 15,
  },
  selectedItem: {
    backgroundColor: "#AEB6C1",
  },
  selectedItemText: {
    color: "#fff",
    fontWeight: "bold",
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 16,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#FFD6D6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 8,
  },
  deleteBtnText: {
    color: "#FF5A5A",
    fontWeight: "bold",
    fontSize: 18,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#25345D",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginLeft: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
