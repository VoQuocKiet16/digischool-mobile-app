import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LexicalEditorWebView from "../../components/LexicalEditorWebView";
import { fonts } from "../../utils/responsive";

export default function EditNotificationContentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [content, setContent] = useState((params.content as string) || "");
  const title = (params.title as string) || "";
  const scope = (params.scope as string) || "";
  const scopeType = (params.scopeType as string) || "";
  const department = (params.department as string) || "";
  const grade = (params.grade as string) || "";
  const selectedClass = (params.selectedClass as string) || "";
  const selectedClassName = (params.selectedClassName as string) || "";
  const from = (params.from as string) || "/notification/notification_create";

  const handleDone = () => {
    if (!content.trim()) {
      Alert.alert("Lỗi", "Nội dung không được để trống!");
      return;
    }
    router.replace({
      pathname: from as any,
      params: { 
        editedContent: content, 
        title, 
        scope,
        scopeType,
        department,
        grade,
        selectedClass,
        selectedClassName
      },
    });
  };

  return (
    <HeaderLayout
      title="Soạn nội dung"
      onBack={() => router.back()}
      rightIcon={
        <Text
          style={{
            color: "#29375C",
            fontSize: 14,
            fontFamily: fonts.semiBold,
            textDecorationLine: "underline",
          }}
        >
          Lưu
        </Text>
      }
      onRightIconPress={handleDone}
    >
      <View style={styles.container}>
        <LexicalEditorWebView value={content} onChange={setContent} />
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
}); 