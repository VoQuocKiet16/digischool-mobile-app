import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderLayout from '../../../components/layout/HeaderLayout';

const Setting: React.FC = () => {
  const router = useRouter();
  return (
    <HeaderLayout title="Cài đặt" onBack={() => router.back()}>
      <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 32}}>
        <View style={styles.profileCard}>
          <Image source={require('../../../assets/images/avatar1.png')} style={styles.avatar} />
          <View style={{flex: 1}}>
            <Text style={styles.name}>Nguyen Van A</Text>
            <Text style={styles.role}>Học sinh - 12A4</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
        <View style={styles.menuWrap}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/students/setting/personal')}>
            <View style={styles.menuIcon}><Ionicons name="person-circle-outline" size={28} color="#FFFFFF" /></View>
            <Text style={styles.menuText}>Thông tin cá nhân</Text>
            <Ionicons name="chevron-forward" size={22} color="#25345D" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}><Ionicons name="lock-closed-outline" size={26} color="#FFFFFF" /></View>
            <Text style={styles.menuText}>Bảo mật</Text>
            <Ionicons name="chevron-forward" size={22} color="#25345D" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}><MaterialCommunityIcons name="shield-lock-outline" size={26} color="#FFFFFF" /></View>
            <Text style={styles.menuText}>Chính sách bảo mật</Text>
            <Ionicons name="chevron-forward" size={22} color="#25345D" style={styles.menuArrow} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}><Ionicons name="book-outline" size={26} color="#FFFFFF" /></View>
            <Text style={styles.menuText}>Hướng dẫn người dùng</Text>
            <Ionicons name="chevron-forward" size={22} color="#25345D" style={styles.menuArrow} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </HeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 18,
    margin: 16,
    marginBottom: 10,
    marginTop: 18,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#25345D',
  },
  role: {
    fontSize: 14,
    color: '#7a869a',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#FFA6A6',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#B71C1C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuWrap: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 8,
    marginTop: 8,
    paddingVertical: 8,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#25345D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#25345D',
    fontWeight: 'bold',
  },
  menuArrow: {
    marginLeft: 8,
  },
});

export default Setting;