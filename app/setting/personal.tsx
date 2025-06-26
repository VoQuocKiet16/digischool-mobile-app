import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import HeaderLayout from '../../components/layout/HeaderLayout';
import AccountInfo from '../../components/setting/personal/detail/AccountInfo';
import ContactInfo from '../../components/setting/personal/detail/ContactInfo';
import LearnInfo from '../../components/setting/personal/detail/LearnInfo';
import ProfileInfo from '../../components/setting/personal/detail/ProfileInfo';
import ProfileSection from '../../components/setting/personal/detail/ProfileSection';

const Personal: React.FC = () => {
  const router = useRouter();
  return (
    <HeaderLayout
      title="Thông tin cá nhân"
      onBack={() => router.back()}
      rightIcon={<Ionicons name="pencil" size={20} color="#25345D" onPress={() => router.push('/students/setting/update_personal')}/>}
      style={{ fontSize: 20, fontWeight: 'bold' }}
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
