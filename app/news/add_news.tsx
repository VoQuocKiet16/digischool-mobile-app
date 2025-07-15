import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LexicalEditorWebView from "../../components/LexicalEditorWebView";
import LoadingModal from "../../components/LoadingModal";
import { createNews } from "../../services/news.service";

export default function AddNewsScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  // Kiểm tra hợp lệ
  const isValid =
    !!coverImage && title.trim().length > 0 && content.trim().length > 0;

  // Hàm chọn ảnh
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Bạn cần cấp quyền truy cập ảnh để chọn ảnh bìa!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setCoverImage(result.assets[0].uri);
    }
  };

  // Hàm chuyển uri sang base64
  const getBase64FromUri = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (e) {
      return null;
    }
  };

  // Hàm xử lý đăng tin
  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    let base64Image = null;
    if (coverImage) {
      base64Image = await getBase64FromUri(coverImage);
      if (!base64Image) {
        setLoading(false);
        // Có thể show lỗi bằng modal hoặc Toast nếu muốn
        return;
      }
    }
    const res = await createNews({
      title: title.trim(),
      content: content.trim(),
      coverImage: base64Image || "",
    });
    setLoading(false);
    if (res.success) {
      setShowSuccess(true);
      setTitle("");
      setContent("");
      setCoverImage(null);
      setTimeout(() => setShowSuccess(false), 1200);
    } else {
      // Có thể show lỗi bằng modal hoặc Toast nếu muốn
    }
  };

  return (
    <HeaderLayout
      title="Thêm tin tức"
      subtitle="Tạo bài đăng chia sẻ thông tin thú vị"
      onBack={() => router.back()}
    >
      <View style={styles.container}>
        {/* Ảnh bìa */}
        <TouchableOpacity
          style={styles.coverBox}
          activeOpacity={0.7}
          onPress={pickImage}
        >
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverContent}>
              <Ionicons name="add-circle-outline" size={36} color="#BFC6D1" />
              <Text style={styles.coverText}>Thêm ảnh bìa</Text>
            </View>
          )}
        </TouchableOpacity>
        {/* Tiêu đề */}
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
        {/* Nội dung */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nội dung <Text style={styles.required}>*</Text>
          </Text>

          <LexicalEditorWebView
            value={content}
            onChange={setContent}
            height={240}
          />
        </View>
        {/* Nút đăng tin */}
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isValid ? "#29375C" : "#E6E9F0" },
          ]}
          activeOpacity={isValid ? 0.7 : 1}
          disabled={!isValid || loading}
          onPress={handleSubmit}
        >
          <Text style={[styles.buttonText, !isValid && { color: "#A0A0A0" }]}>
            {loading ? "Đang đăng..." : "Đăng tin"}
          </Text>
        </TouchableOpacity>
        {/* Loading & Success Modal */}
        <LoadingModal
          visible={loading || showSuccess}
          text={showSuccess ? "Đăng tin thành công!" : "Đang đăng tin..."}
          success={showSuccess}
        />
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    paddingTop: 8,
  },
  coverBox: {
    width: "90%",
    height: 110,
    borderWidth: 1.5,
    borderColor: "#BFC6D1",
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 18,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  coverContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  coverText: {
    color: "#7D88A7",
    fontSize: 16,
    marginTop: 4,
    fontWeight: "500",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 16,
  },
  formGroup: {
    width: "90%",
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#29375C",
    marginBottom: 4,
    marginLeft: 2,
  },
  required: {
    color: "red",
    fontSize: 15,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#29375C",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#29375C",
    backgroundColor: "#fff",
    marginBottom: 2,
  },
  editorBox: {
    borderWidth: 1.5,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  button: {
    width: "90%",
    backgroundColor: "#BFC6D1",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
