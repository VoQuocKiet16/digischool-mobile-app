import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import HeaderLayout from '../../../components/layout/HeaderLayout';
import AccountInfo from '../../../components/setting/AccountInfo';
import ContactInfo from '../../../components/setting/ContactInfo';
import LearnInfo from '../../../components/setting/LearnInfo';
import ProfileInfo from '../../../components/setting/ProfileInfo';
import ProfileSection from '../../../components/setting/ProfileSection';

const Personal: React.FC = () => {
  const router = useRouter();
  return (
    <HeaderLayout
      title="Thông tin cá nhân"
      onBack={() => router.back()}
      rightIcon={<Ionicons name="pencil" size={20} color="#25345D" />}
    >
      <ScrollView style={styles.container}>
        <ProfileSection />
        <ProfileInfo />
        <ContactInfo />
        <LearnInfo />
        <AccountInfo />
      </ScrollView>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});

export default Personal;
