import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import RemindPicker from "../../components/RemindPicker";
import { deleteNote, updateNote } from "../../services/note_lesson.service";
import { getLessonSubtitle } from "../../utils/lessonSubtitle";

const REMIND_OPTIONS = [
  "Trước 10 phút", "Trước 20 phút", "Trước 30 phút", "Trước 40 phút", "Trước 50 phút"
];
const ITEM_HEIGHT = 36;
const PADDING_COUNT = 2;

const DetailNoteScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const lessonData = params.lessonData ? JSON.parse(params.lessonData as string) : null;
  const [title, setTitle] = useState(typeof params.title === 'string' ? params.title : "");
  const [note, setNote] = useState(typeof params.content === 'string' ? params.content : "");
  const [remind, setRemind] = useState(true);
  const [remindTime, setRemindTime] = useState(
    typeof params.remindTime === 'string' ? params.remindTime : REMIND_OPTIONS[2]
  );

  const isValid = title.trim() && note.trim();
  const id = typeof params.id === 'string' ? params.id : undefined;

  return (
    <HeaderLayout
      title="Chi tiết ghi chú"
      subtitle={getLessonSubtitle(lessonData)}
      onBack={() => router.back()}
    >
      <View style={styles.container}>
        {/* Tiêu đề ghi chú */}
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>
              Tiêu đề ghi chú <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.inputTextOutline}
              value={title}
              onChangeText={setTitle}
              placeholder=" "
              placeholderTextColor="#B6B6B6"
            />
          </View>
        </View>
        {/* Ghi chú */}
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>
              Ghi chú <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.inputTextOutline, { minHeight: 48, marginBottom: 20 }]}
              value={note}
              onChangeText={setNote}
              placeholder=" "
              placeholderTextColor="#B6B6B6"
              multiline={true}
              blurOnSubmit={true}
            />
          </View>
        </View>
        {/* Nhắc nhở */}
        <RemindPicker
          remind={remind}
          setRemind={setRemind}
          remindTime={remindTime}
          setRemindTime={setRemindTime}
          REMIND_OPTIONS={REMIND_OPTIONS}
          ITEM_HEIGHT={ITEM_HEIGHT}
          PADDING_COUNT={PADDING_COUNT}
        />
        {/* Nút Xoá và Lưu */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={async () => {
              if (!id) return;
              const res = await deleteNote(id);
              if (res.success) {
                router.back();
              } else {
                alert(res.message || "Xoá ghi chú thất bại");
              }
            }}
          >
            <Text style={styles.deleteBtnText}>Xoá bỏ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
            disabled={!isValid}
            onPress={async () => {
              if (!id) return;
              const remindMinutes = typeof remindTime === 'string' ? Number(remindTime.match(/\d+/)?.[0]) : undefined;
              const data: any = { title, content: note };
              if (remindMinutes !== undefined && !isNaN(remindMinutes)) {
                data.remindMinutes = remindMinutes;
              }
              console.log('Update note id:', id);
              console.log('Update note data:', data);
              const res = await updateNote(id, data);
              console.log('API updateNote result:', res);
              if (res.success) {
                router.back();
              } else {
                alert(res.message || "Cập nhật ghi chú thất bại");
              }
            }}
          >
            <Text style={[styles.saveBtnText, !isValid && { color: "#A0A0A0" }]}>Lưu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  outlineInputBox: {
    borderWidth: 1.2,
    borderColor: "#25345D",
    borderRadius: 8,
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    marginTop: 8,
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    top: -10,
    left: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    fontSize: 15,
    color: "#25345D",
    fontWeight: "bold",
    zIndex: 2,
  },
  inputTextOutline: {
    fontSize: 15,
    color: "#25345D",
    fontWeight: "bold",
    paddingVertical: 0,
  },
  required: {
    color: "#F55C5C",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 36,
    gap: 16,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#FFAFAF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 8,
  },
  deleteBtnText: {
    color: "#25345D",
    fontWeight: "bold",
    fontSize: 17,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#25345D",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginLeft: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "#C4C4C4",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
});

export default DetailNoteScreen;
