import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import HeaderLayout from '../../components/layout/HeaderLayout';
import SuccessModal from '../../components/notifications_modal/SuccessModal';

export default function AddAccount() {
  const [step, setStep] = useState(1);
  // Step 1
  const [username, setUsername] = useState('hocsinh101');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  // Step 2
  const [name, setName] = useState('Nguyen Van A');
  const [dob, setDob] = useState('01 - 01 - 2003');
  const [gender, setGender] = useState('Nam');
  const [phone, setPhone] = useState('0814747265');
  const [email, setEmail] = useState('example@gmail.com');
  const [address, setAddress] = useState('Ninh Kieu, Can Tho');
  const [className, setClassName] = useState('10A3');
  const [year, setYear] = useState('2024 - 2025');
  const [school, setSchool] = useState('THPT Phan Văn Trị');
  // Dropdown state
  const [showGender, setShowGender] = useState(false);
  const [showClass, setShowClass] = useState(false);
  const [showYear, setShowYear] = useState(false);
  const [showSection, setShowSection] = useState([true, true, true]);
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <ScrollView style={{flex:1, backgroundColor:'#F7F7F7'}} contentContainerStyle={{paddingBottom: 32}}>
      {/* Step 1: Tạo tài khoản */}
      {step === 1 && (
        <HeaderLayout
          title="Thêm tài khoản"
          subtitle="Thêm tài khoản dành cho học sinh"
          onBack={() => {/* tuỳ ý, có thể router.back() hoặc setStep(0) */}}
        >
          {/* Username */}
          <View style={styles.confirmInputBox}>
            <Text style={styles.confirmLabel}>Email</Text>
            <TextInput
              style={styles.confirmInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Nhập email"
              placeholderTextColor="#AEB6C1"
            />
          </View>
          {/* Password */}
          <View style={styles.confirmInputBox}>
            <Text style={styles.confirmLabel}>Mật khẩu</Text>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <TextInput
                style={[styles.confirmInput, {flex:1}]}
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#AEB6C1"
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(v=>!v)} style={styles.eyeBtn}>
                <MaterialIcons name={showPass ? 'visibility' : 'visibility-off'} size={24} color="#AEB6C1" />
              </TouchableOpacity>
            </View>
          </View>
          {/* Confirm Password */}
          <View style={styles.confirmInputBox}>
            <Text style={styles.confirmLabel}>Xác nhận mật khẩu</Text>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <TextInput
                style={[styles.confirmInput, {flex:1}]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#AEB6C1"
                secureTextEntry={!showConfirmPass}
              />
              <TouchableOpacity onPress={() => setShowConfirmPass(v=>!v)} style={styles.eyeBtn}>
                <MaterialIcons name={showConfirmPass ? 'visibility' : 'visibility-off'} size={24} color="#AEB6C1" />
              </TouchableOpacity>
            </View>
          </View>
          {/* Tiếp tục */}
          <TouchableOpacity
            style={[styles.nextBtn, !(username && password && confirmPassword && password === confirmPassword) && styles.nextBtnDisabled]}
            onPress={() => setStep(2)}
            disabled={!(username && password && confirmPassword && password === confirmPassword)}
          >
            <Text style={[styles.nextBtnText, !(username && password && confirmPassword && password === confirmPassword) && styles.nextBtnTextDisabled]}>Tiếp tục</Text>
          </TouchableOpacity>
        </HeaderLayout>
      )}
      {/* Step 2: Thông tin cá nhân */}
      {step === 2 && (
        <HeaderLayout
          title="Thêm tài khoản"
          subtitle="Thông tin cá nhân, liên hệ, học tập"
          onBack={() => setStep(1)}
        >
          {/* Section: Thông tin cá nhân */}
          <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowSection(s => [!s[0], s[1], s[2]])}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <MaterialIcons name={showSection[0] ? 'expand-less' : 'expand-more'} size={22} color="#22304A" />
          </TouchableOpacity>
          {showSection[0] && (
            <View style={styles.sectionBox}>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Họ và tên</Text>
                <TextInput style={styles.confirmInput} value={name} onChangeText={setName} />
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Ngày sinh</Text>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                  <TextInput style={[styles.confirmInput, {flex:1}]} value={dob} onChangeText={setDob} />
                  <TouchableOpacity style={styles.eyeBtn}>
                    <MaterialIcons name="calendar-today" size={22} color="#22304A" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Giới tính</Text>
                <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} onPress={() => setShowGender(v=>!v)}>
                  <TextInput style={[styles.confirmInput, {flex:1}]} value={gender} editable={false} />
                  <MaterialIcons name="arrow-drop-down" size={22} color="#22304A" />
                </TouchableOpacity>
                {showGender && (
                  <View style={styles.dropdownList}>
                    {['Nam','Nữ','Khác'].map(g => (
                      <TouchableOpacity key={g} style={styles.dropdownItem} onPress={() => {setGender(g); setShowGender(false);}}>
                        <Text style={styles.dropdownItemText}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
          {/* Section: Thông tin liên hệ */}
          <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowSection(s => [s[0], !s[1], s[2]])}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            <MaterialIcons name={showSection[1] ? 'expand-less' : 'expand-more'} size={22} color="#22304A" />
          </TouchableOpacity>
          {showSection[1] && (
            <View style={styles.sectionBox}>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Số điện thoại</Text>
                <TextInput style={styles.confirmInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Email</Text>
                <TextInput style={styles.confirmInput} value={email} onChangeText={setEmail} keyboardType="email-address" />
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Địa chỉ</Text>
                <TextInput style={styles.confirmInput} value={address} onChangeText={setAddress} />
              </View>
            </View>
          )}
          {/* Section: Thông tin học tập */}
          <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowSection(s => [s[0], s[1], !s[2]])}>
            <Text style={styles.sectionTitle}>Thông tin học tập</Text>
            <MaterialIcons name={showSection[2] ? 'expand-less' : 'expand-more'} size={22} color="#22304A" />
          </TouchableOpacity>
          {showSection[2] && (
            <View style={styles.sectionBox}>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Lớp học</Text>
                <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} onPress={() => setShowClass(v=>!v)}>
                  <TextInput style={[styles.confirmInput, {flex:1}]} value={className} editable={false} />
                  <MaterialIcons name="arrow-drop-down" size={22} color="#22304A" />
                </TouchableOpacity>
                {showClass && (
                  <View style={styles.dropdownList}>
                    {["10A1","10A2","10A3","10A4","10A5"].map(c => (
                      <TouchableOpacity key={c} style={styles.dropdownItem} onPress={() => {setClassName(c); setShowClass(false);}}>
                        <Text style={styles.dropdownItemText}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Năm học</Text>
                <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} onPress={() => setShowYear(v=>!v)}>
                  <TextInput style={[styles.confirmInput, {flex:1}]} value={year} editable={false} />
                  <MaterialIcons name="arrow-drop-down" size={22} color="#22304A" />
                </TouchableOpacity>
                {showYear && (
                  <View style={styles.dropdownList}>
                    {["2023 - 2024","2024 - 2025","2025 - 2026"].map(y => (
                      <TouchableOpacity key={y} style={styles.dropdownItem} onPress={() => {setYear(y); setShowYear(false);}}>
                        <Text style={styles.dropdownItemText}>{y}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              <View style={styles.confirmInputBox}>
                <Text style={styles.confirmLabel}>Trường học</Text>
                <TextInput style={styles.confirmInput} value={school} onChangeText={setSchool} />
              </View>
            </View>
          )}
          {/* Nút quay lại + tạo tài khoản */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backBtn2} onPress={() => setStep(1)}>
              <MaterialIcons name="arrow-back" size={24} color="#22304A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextBtn2, !name || !dob || !gender || !phone || !email || !address || !className || !year || !school ? styles.nextBtnDisabled : null]}
              disabled={!name || !dob || !gender || !phone || !email || !address || !className || !year || !school}
              onPress={() => setShowSuccess(true)}
            >
              <Text style={[styles.nextBtnText, !name || !dob || !gender || !phone || !email || !address || !className || !year || !school ? styles.nextBtnTextDisabled : null]}>Tạo tài khoản</Text>
            </TouchableOpacity>
          </View>
        </HeaderLayout>
      )}
      <SuccessModal
        visible={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Thành công"
        message="Tạo tài khoản thành công!"
        buttonText="Xác nhận"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 18,
    backgroundColor: '#F7F7F7',
  },
  wrap2: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 0,
    backgroundColor: '#F7F7F7',
  },
  backBtn: {
    position: 'absolute',
    left: 18,
    top: 18,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#22304A',
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#22304A',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputBox: {
    width: '90%',
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: '#22304A',
    fontWeight: 'bold',
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    borderWidth: 2,
    borderColor: '#22304A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#22304A',
    backgroundColor: '#fff',
    marginBottom: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#22304A',
    borderRadius: 14,
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  eyeBtn: {
    padding: 8,
  },
  nextBtn: {
    backgroundColor: '#22315B',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
    width: '90%',
    alignSelf: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
    marginTop: 18,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#22304A',
    fontWeight: 'bold',
    marginLeft: 20,
  },
  sectionBox: {
    padding: 14,
    // marginLeft: 10,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#22304A',
    marginTop: 2,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownItemText: {
    color: '#22304A',
    fontSize: 16,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    width: '90%',
    alignSelf: 'center',
  },
  backBtn2: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#AEB6C1',
  },
  nextBtn2: {
    backgroundColor: '#22315B',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    flex: 1,
    alignSelf: 'center',
    width: '90%',
  },
  confirmInputBox: {
    borderWidth: 1,
    borderColor: '#22304A',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 18,
    paddingBottom: 12,
    paddingHorizontal: 16,
    position: 'relative',
    width: '90%',
    alignSelf: 'center',
  },
  confirmLabel: {
    position: 'absolute',
    top: -10,
    left: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    color: '#22304A',
    fontWeight: 'bold',
    fontSize: 12,
    zIndex: 2,
  },
  confirmInput: {
    color: '#22304A',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  nextBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  nextBtnTextDisabled: {
    color: '#9CA3AF',
  },
});
