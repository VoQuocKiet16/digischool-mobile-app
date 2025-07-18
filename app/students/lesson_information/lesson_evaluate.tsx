import HeaderLayout from "@/components/layout/HeaderLayout";
import LoadingModal from "@/components/LoadingModal";
import { lessonEvaluateService } from "@/services/lesson_evaluate.service";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const QUESTIONS = [
  "Giáo viên có giải thích bài học một cách dễ hiểu và rõ ràng không?",
  "Giáo viên có thân thiện và tận trong học sinh trong suốt giờ học không?",
  "Giáo viên có khuyến khích học trò nêu thắc mắc và hợp tác không?",
];

const LessonEvaluateScreen = () => {
  const params = useLocalSearchParams();
  const lessonId = Array.isArray(params.lessonId)
    ? params.lessonId[0]
    : params.lessonId;
  const [currentStep, setCurrentStep] = useState(1);
  const [ratings, setRatings] = useState([0, 0, 0]);
  const [comment, setComment] = useState("");
  const [checked, setChecked] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingSuccess, setLoadingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleRating = (qIdx: number, value: number) => {
    const newRatings = [...ratings];
    newRatings[qIdx] = value;
    setRatings(newRatings);
  };

  // Điều kiện enable nút tiếp tục: tất cả ratings > 0
  const canContinue = ratings.every((r) => r > 0);
  // Điều kiện enable nút xác nhận: chỉ cần đã tick agree (checked)
  const canSubmit = checked;

  const handleSubmit = async () => {
    if (!lessonId) {
      setError("Không tìm thấy tiết học để đánh giá!");
      return;
    }

    setIsSubmitting(true);
    setShowLoading(true);
    setLoadingSuccess(false);
    setError("");

    try {
      const payload: any = {
        teachingClarity: ratings[0],
        teachingSupport: ratings[1],
        teacherInteraction: ratings[2],
        completedWell: checked,
      };
      if (comment.trim().length > 0) {
        payload.comments = comment.trim();
      }
      await lessonEvaluateService.createStudentEvaluation(
        lessonId as string,
        payload
      );

      setLoadingSuccess(true);
      setTimeout(() => {
        setShowLoading(false);
        setLoadingSuccess(false);
        setIsSubmitting(false);
        router.back();
      }, 1000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Gửi đánh giá thất bại. Vui lòng thử lại!"
      );
      setShowLoading(false);
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      {QUESTIONS.map((q, idx) => (
        <View key={idx} style={styles.questionBlock}>
          <Text style={styles.questionLabel}>
            Câu hỏi: <Text style={{ fontFamily: "Baloo2-Medium" }}>{q}</Text>
          </Text>
          <View style={styles.confirmInputBox}>
            <Text style={styles.confirmLabel}>Đánh giá</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={styles.starBtn}
                  onPress={() => handleRating(idx, star)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={star <= ratings[idx] ? "star" : "star-border"}
                    size={28}
                    color={star <= ratings[idx] ? "#F9A825" : "#C4C4C4"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ))}
      <TouchableOpacity
        style={[
          styles.saveBtn,
          canContinue ? styles.saveBtnActive : styles.saveBtnDisabled,
        ]}
        onPress={() => canContinue && setCurrentStep(2)}
        activeOpacity={canContinue ? 0.8 : 1}
        disabled={!canContinue}
      >
        <Text style={styles.saveBtnText}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.confirmInputBoxComment}>
        <Text style={styles.confirmLabel}>Nhận xét</Text>
        <TextInput
          style={styles.confirmInputComment}
          placeholder="Vui lòng nhập nhận xét của bạn về tiết học"
          placeholderTextColor="#9CA3AF"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setChecked(!checked)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={checked ? "check-box" : "check-box-outline-blank"}
          size={22}
          color={checked ? "#2D3A4B" : "#B0B0B0"}
        />
        <Text style={styles.checkboxLabel}>
          Tôi hoàn toàn chịu trách nhiệm với nội dung nhận xét của mình.
        </Text>
      </TouchableOpacity>

      {error ? (
        <Text
          style={{
            color: "red",
            textAlign: "center",
            marginBottom: 8,
            fontFamily: "Baloo2-Medium",
          }}
        >
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        style={[
          styles.saveBtn,
          (!canSubmit || isSubmitting) && styles.saveBtnDisabled,
        ]}
        onPress={canSubmit ? handleSubmit : undefined}
        activeOpacity={canSubmit ? 0.8 : 1}
        disabled={!canSubmit || isSubmitting}
      >
        <Text style={styles.saveBtnText}>
          {isSubmitting ? "Đang gửi..." : "Xác nhận"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderLayout
        title="Đánh giá tiết học"
        subtitle="Hoàn thành mẫu đánh giá tiết học"
        onBack={() => {
          if (currentStep === 2) setCurrentStep(1);
          else router.back();
        }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </ScrollView>
      </HeaderLayout>

      <LoadingModal
        visible={showLoading}
        text={
          loadingSuccess
            ? "Đánh giá tiết học thành công"
            : "Đang gửi đánh giá tiết học..."
        }
        success={loadingSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 5,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#f7f7f7",
  },
  questionBlock: {
    marginBottom: 5,
    borderRadius: 12,
    padding: 16,
  },
  questionLabel: {
    fontSize: 15,
    color: "#29375C",
    marginBottom: 8,
    fontFamily: "Baloo2-Bold",
    letterSpacing: 0.5,
  },
  answerLabel: {
    fontSize: 13,
    color: "#29375C",
    marginBottom: 6,
    fontFamily: "Baloo2-Bold",
  },
  starsRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  starBtn: {
    marginRight: 2,
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
  confirmInputBox: {
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginTop: 15,
    paddingTop: 18,
    paddingBottom: 15,
    paddingHorizontal: 16,
    position: "relative",
  },
  confirmLabel: {
    position: "absolute",
    top: -12,
    left: 18,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 6,
    color: "#29375C",
    fontSize: 14,
    zIndex: 2,
    fontFamily: "Baloo2-Medium",
  },
  confirmInput: {
    color: "#29375C",
    fontSize: 14,
    fontFamily: "Baloo2-Medium",
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 15,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: "#29375C",
    flex: 1,
    fontFamily: "Baloo2-Medium",
  },
  confirmInputBoxComment: {
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginVertical: 25,
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    position: "relative",
  },
  confirmInputComment: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
    minHeight: 100,
    marginTop: 2,
  },
});

export default LessonEvaluateScreen;
