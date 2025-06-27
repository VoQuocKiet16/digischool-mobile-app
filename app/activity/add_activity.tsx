import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import SuccessModal from "../../components/notifications_modal/SuccessModal";
import RemindPicker from "../../components/schedule/RemindPicker";

const REMIND_OPTIONS = [
  "Trước 10 phút",
  "Trước 20 phút",
  "Trước 30 phút",
  "Trước 40 phút",
  "Trước 50 phút",
];

const ITEM_HEIGHT = 40;
const PADDING_COUNT = 1;

export default function AddActivity() {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [remind, setRemind] = useState(true);
  const [remindTime, setRemindTime] = useState(REMIND_OPTIONS[2]);
  const [showSuccess, setShowSuccess] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { periodIndex } = useLocalSearchParams();

  React.useEffect(() => {
    if (remind && scrollRef.current) {
      const idx = REMIND_OPTIONS.indexOf(remindTime);
      if (idx !== -1) {
        scrollRef.current.scrollTo({ y: (idx) * ITEM_HEIGHT, animated: true });
      }
    }
  }, [remindTime, remind]);

  const handleSnapToItem = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    let idx = Math.round(offsetY / ITEM_HEIGHT);
    idx = Math.max(0, Math.min(REMIND_OPTIONS.length - 1, idx));
    setRemindTime(REMIND_OPTIONS[idx]);
  };

  const isValid = title.trim() && detail.trim();

  const handleAdd = async () => {
    if (isValid && periodIndex) {
      try {
        // TODO: Gọi API để thêm hoạt động
        // const response = await fetch('API_URL', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     title,
        //     detail,
        //     periodIndex: Number(periodIndex),
        //     remind,
        //     remindTime: remind ? remindTime : null
        //   }),
        // });
        
        // if (response.ok) {
          setShowSuccess(true);
        // }
      } catch (error) {
        console.error('Error adding activity:', error);
      }
    }
  };

  return (
    <HeaderLayout title="Thêm hoạt động" subtitle="Tạo thông tin hoạt động" onBack={() => router.back()} style={{ fontSize: 20, fontWeight: 'bold' }}>
      <View style={styles.container}>
        {/* Tiêu đề hoạt động */}
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>
              Tiêu đề hoạt động <Text style={styles.required}>*</Text>
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
        {/* Chi tiết */}
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>
              Chi tiết <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.inputTextOutline}
              value={detail}
              onChangeText={setDetail}
              placeholder=" "
              placeholderTextColor="#B6B6B6"
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
          style={[styles.addBtn, !isValid && styles.addBtnDisabled]}
          disabled={!isValid}
          onPress={handleAdd}
        >
          <Text style={styles.addBtnText}>Thêm</Text>
        </TouchableOpacity>
        <SuccessModal
          visible={showSuccess}
          onClose={() => {
            setShowSuccess(false);
            router.back();
          }}
          title="Thành công"
          message={"Thêm hoạt động cá nhân thành công.\nQuay lại trang trước đó?"}
          buttonText="Xác nhận"
        />
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    padding: 20,
    // paddingTop: 30, // Đã có HeaderLayout nên bỏ paddingTop
  },
  fieldWrap: {
    marginBottom: 16,
  },
  outlineInputBox: {
    borderWidth: 1.2,
    borderColor: "#B6C5E1",
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
    color: "#E53935",
    fontSize: 16,
  },
  addBtn: {
    backgroundColor: "#25345D",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    opacity: 1,
  },
  addBtnDisabled: {
    backgroundColor: "#B6B6B6",
    opacity: 0.5,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
