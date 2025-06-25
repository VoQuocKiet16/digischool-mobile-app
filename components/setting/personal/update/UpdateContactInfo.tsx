import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function UpdateContactInfo() {
  const [phone, setPhone] = useState('0123456789');
  const [email, setEmail] = useState('hocsinh@email.com');
  const [address, setAddress] = useState('Hà Nội');
  const [showInfo, setShowInfo] = useState(true);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.headerRow} onPress={() => setShowInfo(v => !v)} activeOpacity={0.7}>
        <Text style={styles.title}>Thông tin liên hệ</Text>
        <Ionicons name={showInfo ? 'chevron-up' : 'chevron-down'} size={28} color="#25345D" style={styles.headerIcon} />
      </TouchableOpacity>
      {showInfo && (
        <>
          {/* Số điện thoại */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>
                Số điện thoại
              </Text>
              <TextInput
                style={styles.inputTextOutline}
                value={phone}
                onChangeText={setPhone}
                placeholder=" "
                placeholderTextColor="#7a869a"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          {/* Email */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>Email</Text>
              <TextInput
                style={styles.inputTextOutline}
                value={email}
                onChangeText={setEmail}
                placeholder=" "
                placeholderTextColor="#7a869a"
                keyboardType="email-address"
              />
            </View>
          </View>
          {/* Địa chỉ */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>Địa chỉ</Text>
              <TextInput
                style={styles.inputTextOutline}
                value={address}
                onChangeText={setAddress}
                placeholder=" "
                placeholderTextColor="#7a869a"
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    margin: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#25345D',
  },
  headerIcon: {
    marginLeft: 8,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  outlineInputBox: {
    borderWidth: 1,
    borderColor: '#25345D',
    borderRadius: 12,
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    marginTop: 8,
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#25345D',
    fontWeight: 'bold',
    zIndex: 2,
  },
  inputTextOutline: {
    fontSize: 14,
    color: '#25345D',
    fontWeight: 'bold',
    paddingVertical: 0,
  },
});
