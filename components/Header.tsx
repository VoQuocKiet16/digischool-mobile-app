import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedView } from './ThemedView';

interface HeaderProps {
  title?: string;
  studentName?: string;
}

export default function Header({ title = 'Manage', studentName = 'HS Nguyễn Văn A' }: HeaderProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleAvatarPress = () => {
    router.push('setting/setting' as any);
  };

  const handleBellPress = () => {
    router.push('/notification/notification_list');
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemedView style={styles.headerWrap}>
        <View style={styles.headerLeft}>
          <Image source={require('../assets/images/digi-logo.png')} style={styles.logo} />
          <View>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.studentName}>Xin chào, {studentName}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleBellPress} activeOpacity={0.7} style={styles.bellWrap}>
            <Ionicons name="notifications-outline" size={28} color="#215562" />
            <View style={styles.bellDot} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.7}>
            <Image source={require('../assets/images/avatar1.png')} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 10,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 54,
    height: 54,
    resizeMode: 'contain',
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '600',
    color: '#215562',
    letterSpacing: 0.5,
    fontFamily: 'Baloo2',
  },
  studentName: {
    fontSize: 16,
    color: '#215562',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e6eef2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#e74c3c',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
  },
});
