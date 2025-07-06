import HeaderLayout from "@/components/layout/HeaderLayout";
import Student_Absent from "@/components/lesson_evaluate/Student_Absent";
import Student_Test from "@/components/lesson_evaluate/Student_Test";
import Student_Violates from "@/components/lesson_evaluate/Student_Violates";
import SuccessModal from "@/components/notifications_modal/SuccessModal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const RANKS = ["A+", "A", "B+", "B"];

const LessonEvaluateTeacherScreen = () => {
  const [lesson, setLesson] = useState("");
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [rank, setRank] = useState("");
  const [showRankDropdown, setShowRankDropdown] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const isValid =
    (lesson || "").trim().length > 0 &&
    (content || "").trim().length > 0 &&
    (rank || "").trim().length > 0 &&
    checked;

  return (
    <HeaderLayout
      title="Đánh giá tiết học"
      subtitle="Hoàn thành mẫu đánh giá tiết học"
      onBack={() => {
        router.back();
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 32,
            paddingHorizontal: 16,
            marginBottom: 32,
            marginTop: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Tiết chương trình */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>
                Tiết chương trình <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.inputTextOutline}
                placeholder="Vui lòng nhập tiết chương trình"
                placeholderTextColor="#9CA3AF"
                value={lesson}
                onChangeText={setLesson}
              />
            </View>
          </View>
          {/* Tên bài, nội dung công việc */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>
                Tên bài, nội dung công việc{" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.inputTextOutline}
                placeholder="Vui lòng nhập tên bài học, nội dung công việc"
                placeholderTextColor="#9CA3AF"
                value={content}
                onChangeText={setContent}
              />
            </View>
          </View>
          {/* Học sinh vắng */}
          <View style={[styles.fieldWrap, { marginBottom: 25 }]}>
            <Student_Absent />
          </View>
          {/* Học sinh vi phạm */}
          <View style={[styles.fieldWrap, { marginBottom: 25 }]}>
            <Student_Violates />
          </View>
          {/* Kiểm tra miệng */}
          <View style={[styles.fieldWrap, { marginBottom: 46 }]}>
            <Student_Test />
          </View>
          {/* Nhận xét */}
<<<<<<< khoi-api
          <View style={styles.inputBox}>
            <View style={[styles.floatingInputBox, styles.floatingInputBoxSmall]}>
=======
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
>>>>>>> local
              <Text style={styles.floatingLabel}>Nhận xét</Text>
              <TextInput
                style={styles.inputTextOutline}
                placeholder="Vui lòng nhập nhận xét"
                placeholderTextColor="#9CA3AF"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
          {/* Xếp loại tiết học */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>
                Xếp loại tiết học <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowRankDropdown(!showRankDropdown)}
                activeOpacity={0.7}
              >
                <Text
                  style={
                    rank ? styles.dropdownText : styles.dropdownPlaceholder
                  }
                >
                  {rank || "Chọn loại xếp hạng tiết học"}
                </Text>
                <Ionicons
                  name={showRankDropdown ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#22315B"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
              {showRankDropdown && (
                <View style={styles.modalContent}>
                  {RANKS.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={styles.modalItem}
                      onPress={() => {
                        setRank(r);
                        setShowRankDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalItemText,
                          rank === r && { fontWeight: "bold" },
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          {/* Checkbox xác nhận trách nhiệm nhận xét */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginHorizontal: 16, marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => setChecked(!checked)}
              style={{
<<<<<<< khoi-api
                width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#22315B', alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: checked ? '#22315B' : 'transparent',
=======
                width: 22,
                height: 22,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: "#29375C",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
                backgroundColor: checked ? "#29375C" : "transparent",
>>>>>>> local
              }}
              activeOpacity={0.8}
            >
              {checked && (
                <Ionicons name="checkmark" size={18} color="#fff" />
              )}
            </TouchableOpacity>
<<<<<<< khoi-api
            <Text style={{ color: '#22315B', fontSize: 16, fontWeight: '500', flex: 1, flexWrap: 'wrap', lineHeight: 18 }}>
              Tôi hoàn toàn chịu trách nhiệm với nội dung nhận xét của mình.
              <Text style={{ color: 'red', fontSize: 12, fontWeight: 'bold' }}> *</Text>
=======
            <Text
              style={{
                color: "#29375C",
                fontSize: 16,
                flex: 1,
                flexWrap: "wrap",
                lineHeight: 23,
                fontFamily: "Baloo2-Medium",
              }}
            >
              Tôi hoàn toàn chịu trách nhiệm với nội dung nhận xét của mình.
              <Text style={{ color: "red", fontSize: 16, fontFamily: "Baloo2-SemiBold", marginLeft: 2 }}>
                {" "}
                *
              </Text>
>>>>>>> local
            </Text>
          </View>
          {/* Nút xác nhận */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              isValid ? styles.saveBtnActive : styles.saveBtnDisabled,
            ]}
            disabled={!isValid}
            onPress={() => setShowSuccess(true)}
          >
            <Text style={styles.saveBtnText}>Xác nhận</Text>
          </TouchableOpacity>
          <SuccessModal
            visible={showSuccess}
            onClose={() => {
              setShowSuccess(false);
              router.replace('/teachers/lesson_information/lesson_detail');
            }}
            title="Thành công"
            message={"Đánh giá tiết học thành công.\nQuay lại trang trước đó?"}
            buttonText="Xác nhận"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
<<<<<<< khoi-api
  inputBox: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  label: {
    fontSize: 15,
    color: "#22315B",
    fontWeight: "bold",
    marginBottom: 6,
  },
  floatingInputBox: {
    borderWidth: 2,
    borderColor: "#22315B",
=======
  fieldWrap: {
    marginBottom: 10,
  },
  outlineInputBox: {
    borderWidth: 1,
    borderColor: "#29375C",
>>>>>>> local
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
<<<<<<< khoi-api
    color: "#22315B",
    fontWeight: "bold",
    fontSize: 12,
    zIndex: 2,
  },
  floatingInput: {
    color: "#22315B",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 2,
  },
  input: {
    borderWidth: 2,
    borderColor: "#22315B",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#22315B",
    fontWeight: "bold",
  },
  dropdownFloatingBox: {
    borderWidth: 2,
    borderColor: "#22315B",
    borderRadius: 20,
    backgroundColor: "#fff",
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 16,
    position: "relative",
    marginTop: 0,
=======
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
>>>>>>> local
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 0,
    minHeight: 22,
  },
  dropdownText: {
<<<<<<< khoi-api
    fontSize: 16,
    color: "#22315B",
    fontWeight: "bold",
    flex: 1,
=======
    color: "#29375C",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
>>>>>>> local
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
  },
  modalContent: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 8,
  },
<<<<<<< khoi-api
  dropdownItemText: {
    fontSize: 22,
    color: "#22315B",
    fontWeight: "500",
=======
  modalItemText: {
    fontSize: 16,
    color: "#29375C",
    fontFamily: "Baloo2-Medium",
>>>>>>> local
  },
  saveBtn: {
    backgroundColor: "#29375C",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 30,
    width: "95%",
  },
  saveBtnActive: {
    backgroundColor: "#29375C",
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

export default LessonEvaluateTeacherScreen;
