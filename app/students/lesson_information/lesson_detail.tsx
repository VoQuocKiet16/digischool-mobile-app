import HeaderLayout from '@/components/layout/HeaderLayout';
import Lesson_Information from '@/components/lesson_detail/Lesson_Information';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const LessonDetailScreen = () => {
  return (
    <HeaderLayout
      title="Chi tiết tiết học"
      subtitle="Sáng • Tiết 3 • Hóa học • 10a3"
      onBack={() => router.replace('/(tabs)')}
      rightIcon={<Ionicons name="menu" size={24} color="#25345D" />}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Lesson_Information />
      </ScrollView>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
});

export default LessonDetailScreen;
