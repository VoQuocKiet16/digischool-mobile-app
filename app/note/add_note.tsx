import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LoadingModal from "../../components/LoadingModal";
import RemindPicker from "../../components/RemindPicker";
import { createNote } from "../../services/note_lesson.service";
import { getLessonSubtitle } from "../../utils/lessonSubtitle";

const REMIND_OPTIONS = [
  "Trước 10 phút",
  "Trước 20 phút",
  "Trước 30 phút",
  "Trước 40 phút",
  "Trước 50 phút",
];
const ITEM_HEIGHT = 36;
const PADDING_COUNT = 2;

const AddNoteScreen = () => {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [remind, setRemind] = useState(true);
  const [remindTime, setRemindTime] = useState(REMIND_OPTIONS[2]);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { lessonId, lessonData: lessonDataParam } = useLocalSearchParams<{ lessonId: string, lessonData?: string }>();
  const lessonData = lessonDataParam ? JSON.parse(lessonDataParam) : null;
  const [loading, setLoading] = useState(false);

  const isValid = title.trim() && note.trim();

  return (
    <HeaderLayout
      title="Thêm ghi chú mới"
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
              style={[
                styles.inputTextOutline,
                { minHeight: 48, marginBottom: 20 },
              ]}
              value={note}
              onChangeText={setNote}
              placeholder=" "
              placeholderTextColor="#B6B6B6"
              blurOnSubmit={true}
              multiline={true}
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

        {/* Nút Thêm */}
        <TouchableOpacity
          style={[
            styles.addBtn,
            isValid ? styles.addBtnActive : styles.addBtnDisabled,
          ]}
          disabled={!isValid || loading}
          onPress={async () => {
            if (!lessonId) return;
            setLoading(true);
            setShowLoading(true);
            const remindMinutes = remind ? Number(remindTime.match(/\d+/)?.[0]) : undefined;
            const res = await createNote({
              title,
              content: note,
              lesson: lessonId,
              remindMinutes,
            });
            setLoading(false);
            if (res.success) {
              setShowSuccess(true);
              setTimeout(() => {
                setShowLoading(false);
                setShowSuccess(false);
                router.back();
              }, 1200);
            } else {
              setShowLoading(false);
              alert(res.message || "Tạo ghi chú thất bại");
            }
          }}
        >
          <Text style={[styles.addBtnText, (!isValid || loading) && { color: "#A0A0A0" }]}>Thêm</Text>
        </TouchableOpacity>
        <LoadingModal
          visible={showLoading}
          text={showSuccess ? "Thêm ghi chú thành công!" : "Đang thêm ghi chú..."}
          success={showSuccess}
        />
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
  addBtn: {
    marginTop: 36,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  addBtnActive: {
    backgroundColor: "#25345D",
  },
  addBtnDisabled: {
    backgroundColor: "#C4C4C4",
  },
  addBtnText: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#fff",
  },
});

export default AddNoteScreen;
