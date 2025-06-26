import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';

interface HeaderLayoutProps {
  title: string;
  onBack?: () => void;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  children?: React.ReactNode;
  style?: TextStyle;
}

const HeaderLayout: React.FC<HeaderLayoutProps> = ({ title, onBack, rightIcon, onRightIconPress, children, style }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="chevron-back" size={24} color="#25345D" />
        </TouchableOpacity>
        <Text style={[styles.title, style]}>{title}</Text>
        {rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            {rightIcon}
          </TouchableOpacity>
        ) : (
          <View style={{width: 24}} />
        )}
      </View>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f7f7f7',
    marginTop: 20,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#25345D',
    marginLeft: -32, // Để căn giữa tuyệt đối khi có icon back
  },
});

export default HeaderLayout;
