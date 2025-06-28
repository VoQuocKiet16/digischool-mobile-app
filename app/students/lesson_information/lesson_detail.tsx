import HeaderLayout from '@/components/layout/HeaderLayout';
import Lesson_Information from '@/components/lesson_detail/Lesson_Information';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LessonDetailScreen = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleEvaluatePress = () => {
    router.push('/students/lesson_information/lesson_evaluate');
  };

  return (
    <HeaderLayout
      title="Chi tiết tiết học"
      subtitle="Sáng • Tiết 3 • Hóa học • 10a3"
      onBack={() => router.replace('/(tabs)')}
      rightIcon={
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={24} color="#25345D" />
        </TouchableOpacity>
      }
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Lesson_Information onEvaluatePress={handleEvaluatePress} />
      </ScrollView>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push('/students/note/note');
              }}
            >
              <Text style={styles.menuText}>Ghi chú</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 48,
    paddingRight: 12,
  },
  menuBox: {
    backgroundColor: '#25345D',
    borderRadius: 10,
    padding: 8,
    minWidth: 120,
    marginTop: 0,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#7D88A7',
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
  },
});

export default LessonDetailScreen;
