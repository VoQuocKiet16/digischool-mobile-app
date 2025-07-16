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
  const { lessonId, lessonData: lessonDataParam } = useLocalSearchParams<{
    lessonId: string;
    lessonData?: string;
  }>();
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
              placeholder="Nhập tiêu đề ghi chú"
              placeholderTextColor="#9CA3AF"
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
              placeholder="Nhập nội dung ghi chú"
              placeholderTextColor="#9CA3AF"
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
            styles.saveBtn,
            (!isValid || loading) && styles.saveBtnDisabled,
          ]}
          disabled={!isValid || loading}
          onPress={async () => {
            if (!lessonId) return;
            setLoading(true);
            setShowLoading(true);
            // Chỉ truyền remindMinutes nếu remind=true
            const reqBody: any = {
              title,
              content: note,
              lesson: lessonId,
            };
            if (remind) {
              reqBody.remindMinutes = Number(remindTime.match(/\d+/)?.[0]);
            }
            const res = await createNote(reqBody);
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
          <Text
            style={[
              styles.saveBtnText,
              (!isValid || loading) && { color: "#A0A0A0" },
            ]}
          >
            Thêm
          </Text>
        </TouchableOpacity>
        <LoadingModal
          visible={showLoading}
          text={
            showSuccess ? "Thêm ghi chú thành công!" : "Đang thêm ghi chú..."
          }
          success={showSuccess}
        />
      </View>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  outlineInputBox: {
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginBottom: 25,
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    top: -16,
    left: 18,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 6,
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 14,
    zIndex: 2,
  },
  inputTextOutline: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
  },
  required: {
    color: "#E53935",
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
  },
  saveBtn: {
    backgroundColor: "#29375C",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    width: "90%",
  },
  saveBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
});

export default AddNoteScreen;
