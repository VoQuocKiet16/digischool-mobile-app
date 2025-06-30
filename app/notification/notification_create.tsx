import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LexicalEditorWebView from "../../components/LexicalEditorWebView";

export default function NotificationCreateScreen() {
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  const [className, setClassName] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  return (
    <HeaderLayout title="Tạo thông báo" onBack={() => router.back()}>
      <View style={styles.scrollWrap}>
        <Text style={styles.subTitle}>Tạo mẫu thông báo gửi đến học sinh</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Tiêu đề <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Vui lòng nhập tiêu đề"
            placeholderTextColor="#A0A0A0"
            value={title}
            onChangeText={setTitle}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Phạm vi thông báo <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Lớp đảm nhiệm"
            placeholderTextColor="#A0A0A0"
            value={scope}
            onChangeText={setScope}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nội dung <Text style={styles.required}>*</Text>
          </Text>
        </View>
        <View style={[styles.formGroup, {marginBottom: 24}]}> 
          <LexicalEditorWebView
            value={content}
            onChange={setContent}
            height={260}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push({
              pathname: '/notification/notification_detail',
              params: {
                title,
                content,
              },
            });
          }}
        >
          <Text style={styles.buttonText}>Gửi thông báo</Text>
        </TouchableOpacity>
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  scrollWrap: {
    padding: 0,
    backgroundColor: '#F7F7F7',
    minHeight: '100%',
    alignItems: 'center',
  },
  subTitle: {
    fontSize: 15,
    color: '#7D88A7',
    marginTop: 8,
    marginBottom: 12,
    fontWeight: '500',
    alignSelf: 'center',
  },
  formGroup: {
    width: '90%',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#25345D',
    marginBottom: 4,
    marginLeft: 2,
  },
  required: {
    color: 'red',
    fontSize: 15,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#25345D',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#25345D',
    backgroundColor: '#fff',
    marginBottom: 2,
  },
  button: {
    width: '90%',
    backgroundColor: '#BFC6D1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
