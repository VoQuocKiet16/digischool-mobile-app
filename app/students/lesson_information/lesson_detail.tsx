import Lesson_Information from '@/components/lesson_detail/Lesson_Information';
import HeaderLayout from '@/components/layout/HeaderLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const SlotDetailScreen = () => {
  return (
    <HeaderLayout
      title="Chi tiết tiết học"
      subtitle="Sáng • Tiết 3 • Hóa học • 10a3"
      onBack={() => router.back()}
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

export default SlotDetailScreen;
