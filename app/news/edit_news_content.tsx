import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LexicalEditorWebView from "../../components/LexicalEditorWebView";
import { getNewsDetail } from "../../services/news.service";

export default function EditNewsContentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [content, setContent] = useState((params.content as string) || "");
  const title = (params.title as string) || "";
  const coverImage = (params.coverImage as string) || "";
  const from = (params.from as string) || "/news/add_news";
  const id = params.id;

  useEffect(() => {
    if (id) {
      getNewsDetail(id as string).then((res) => {
        if (res.success && res.data) {
          setContent(res.data.content || "");
        }
      });
    }
  }, [id]);

  const handleDone = () => {
    if (!content.trim()) {
      Alert.alert("Lỗi", "Nội dung không được để trống!");
      return;
    }
    router.replace({
      pathname: from as any,
      params: { editedContent: content, title, coverImage, id },
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
            fontFamily: "Baloo2-SemiBold",
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
