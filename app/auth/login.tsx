import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_ERROR_MESSAGES } from '../../constants/api.constants';
import { login } from '../../services/auth.service';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const isValid = username.trim() !== '' && password.trim() !== '';

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await login(username, password);
      if (res.success && res.data?.token) {
        await AsyncStorage.setItem('token', res.data.token);
        router.replace('/');
      } else {
        setError(API_ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    } catch (err: any) {
      setError(err?.message || API_ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#FFFFFF", "#B3E5FC"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>Hãy Bắt Đầu Nào!</Text>
          <Text style={styles.subtitle}>
            Biến ứng dụng trường học{"\n"}thành trợ lý cá nhân của bạn
          </Text>

          <Text style={styles.label}>Tên người dùng</Text>
          <View style={styles.inputContainer}>
            <Icon name="person" size={22} color="#25345D" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="hocsinh"
              placeholderTextColor="#7a869a"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputContainer}>
            <Icon name="lock" size={22} color="#25345D" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#7a869a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "visibility-off" : "visibility"} size={22} color="#7a869a" />
            </TouchableOpacity>
          </View>

          {error ? (
            <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
          ) : null}

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isValid ? { backgroundColor: '#25345D' } : { backgroundColor: '#D3D9E6' }]}
            disabled={!isValid || loading}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#25345D',
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#7a869a',
    marginBottom: 32,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    color: '#25345D',
    marginBottom: 6,
    marginTop: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#B6C5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#25345D',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#25345D',
    fontWeight: '500',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#D3D9E6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
