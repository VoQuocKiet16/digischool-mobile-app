import HeaderLayout from '@/components/layout/HeaderLayout';
import SuccessModal from '@/components/notifications_modal/SuccessModal';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const QUESTIONS = [
  'Giáo viên có giải thích bài học một cách dễ hiểu và rõ ràng không?',
  'Giáo viên có thân thiện và tận trong học sinh trong suốt giờ học không?',
  'Giáo viên có khuyến khích học trò nêu thắc mắc và hợp tác không?',
];

const LessonEvaluateScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [ratings, setRatings] = useState([0, 0, 0]);
  const [comment, setComment] = useState('');
  const [checked, setChecked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRating = (qIdx: number, value: number) => {
    const newRatings = [...ratings];
    newRatings[qIdx] = value;
    setRatings(newRatings);
  };

  // Điều kiện enable nút tiếp tục: tất cả ratings > 0
  const canContinue = ratings.every(r => r > 0);
  // Điều kiện enable nút xác nhận: có nhận xét và đã tick agree
  const canSubmit = comment.trim().length > 0 && checked;

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      {QUESTIONS.map((q, idx) => (
        <View key={idx} style={styles.questionBlock}>
          <Text style={styles.questionLabel}>Câu hỏi: {q}</Text>
          <Text style={styles.answerLabel}>Trả lời</Text>
          <View style={styles.starsRow}>
            {[1,2,3,4,5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starBtn}
                onPress={() => handleRating(idx, star)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={star <= ratings[idx] ? 'star' : 'star-outline'}
                  size={28}
                  color={star <= ratings[idx] ? '#F9A825' : '#C4C4C4'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.actionBtn, canContinue ? styles.actionBtnActive : styles.actionBtnDisabled, {marginTop: 24}]}
        onPress={() => canContinue && setCurrentStep(2)}
        activeOpacity={canContinue ? 0.8 : 1}
        disabled={!canContinue}
      >
        <Text style={[styles.actionBtnText, !canContinue && {color: '#A0A0A0'}]}>Tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.inputLabel}>Nhận xét</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Vui lòng nhập nhận xét của bạn về tiết học"
        placeholderTextColor="#B0B0B0"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
      />
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setChecked(!checked)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={checked ? 'checkbox' : 'square-outline'}
          size={22}
          color={checked ? '#2D3A4B' : '#B0B0B0'}
        />
        <Text style={styles.checkboxLabel}>
          Tôi hoàn toàn chịu trách nhiệm với nội dung nhận xét của mình.
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionBtn, canSubmit ? styles.actionBtnActive : styles.actionBtnDisabled, {marginTop: 32}]}
        onPress={() => canSubmit && setShowSuccess(true)}
        activeOpacity={canSubmit ? 0.8 : 1}
        disabled={!canSubmit}
      >
        <Text style={[styles.actionBtnText, !canSubmit && {color: '#A0A0A0'}]}>Xác nhận</Text>
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
          else router.replace('/(tabs)');
        }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </ScrollView>
      </HeaderLayout>
      <SuccessModal
        visible={showSuccess}
        onClose={() => router.replace('/(tabs)')}
        title="Gửi đánh giá thành công"
        message="Cảm ơn bạn đã hoàn thành đánh giá tiết học!"
        buttonText="Đóng"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FB',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  questionBlock: {
    marginBottom: 28,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  questionLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#25345D',
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 13,
    color: '#25345D',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starBtn: {
    marginRight: 2,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBtnActive: {
    backgroundColor: '#25345D',
  },
  actionBtnDisabled: {
    backgroundColor: '#C4C4C4',
  },
  actionBtnText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#fff',
  },
  inputLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#25345D',
    marginBottom: 10,
    marginLeft: 2,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    minHeight: 90,
    padding: 14,
    fontSize: 15,
    color: '#25345D',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#25345D',
    flex: 1,
  },
});

export default LessonEvaluateScreen;
