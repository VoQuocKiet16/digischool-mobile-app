import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function UpdateProfileInfo() {
  const [name, setName] = useState('Nguyen Van A');
  const [dob, setDob] = useState('01 - 01 - 2003');
  const [gender, setGender] = useState('Nam');
  const [showGender, setShowGender] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  // Xử lý chọn ngày sinh và giới tính nếu muốn

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.headerRow} onPress={() => setShowInfo(v => !v)} activeOpacity={0.7}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <Ionicons name={showInfo ? 'chevron-up' : 'chevron-down'} size={28} color="#25345D" style={styles.headerIcon} />
      </TouchableOpacity>
      {showInfo && (
        <>
          {/* Họ và tên */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={{...styles.floatingLabel, marginTop: -8}}>
                Họ và tên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.inputTextOutline}
                value={name}
                onChangeText={setName}
                placeholder=" "
                placeholderTextColor="#7a869a"
              />
            </View>
          </View>
          {/* Ngày sinh */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>Ngày sinh</Text>
              <TextInput
                style={styles.inputTextOutline}
                value={dob}
                onChangeText={setDob}
                placeholder=" "
                placeholderTextColor="#7a869a"
                editable={false}
              />
              <TouchableOpacity style={styles.inputIconOutline}>
                <MaterialIcons name="calendar-today" size={22} color="#25345D" />
              </TouchableOpacity>
            </View>
          </View>
          {/* Giới tính */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>Giới tính</Text>
              <TextInput
                style={styles.inputTextOutline}
                value={gender}
                onChangeText={setGender}
                editable={false}
                placeholder=" "
                placeholderTextColor="#7a869a"
              />
              <TouchableOpacity style={styles.inputIconOutline}>
                <Ionicons name="chevron-down" size={22} color="#25345D" />
              </TouchableOpacity>
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
    borderRadius: 20,
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
    fontSize: 18,
    color: '#25345D',
    fontWeight: 'bold',
    paddingVertical: 0,
  },
  label: {
    fontSize: 14,
    color: '#25345D',
    fontWeight: '500',
  },
  required: {
    color: '#E53935',
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#25345D',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
    marginTop: 2,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#25345D',
    fontWeight: 'bold',
    paddingVertical: 2,
  },
  inputIcon: {
    marginLeft: 8,
  },
  inputIconOutline: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: 6,
  },
});
