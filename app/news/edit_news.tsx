import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
import api from "../../services/api.config";
import { getNewsDetail } from "../../services/news.service";

export default function EditNewsScreen() {
  const { id } = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const router = useRouter();

  // Lấy chi tiết tin để fill vào form
  useEffect(() => {
    const fetchDetail = async () => {
      setInitLoading(true);
      const res = await getNewsDetail(id as string);
      if (res.success && res.data) {
        setTitle(res.data.title || "");
        setContent(res.data.content || "");
        setCoverImage(res.data.coverImage || null);
      }
      setInitLoading(false);
    };
    if (id) fetchDetail();
  }, [id]);

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

  // Hàm cập nhật tin
  const handleUpdate = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    let base64Image = null;
    if (coverImage && !coverImage.startsWith("data:image")) {
      base64Image = await getBase64FromUri(coverImage);
      if (!base64Image) {
        setLoading(false);
        Alert.alert("Lỗi", "Không thể chuyển đổi ảnh");
        return;
      }
    } else {
      base64Image = coverImage;
    }
    try {
      await api.patch(`/api/news/update/${id}`, {
        title: title.trim(),
        content: content.trim(),
        coverImage: base64Image || "",
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1200);
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message || "Cập nhật thất bại");
    }
    setLoading(false);
  };

  // Hàm xoá tin
  const handleDelete = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xoá tin này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await api.delete(`/api/news/delete/${id}`);
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              router.back();
            }, 1200);
          } catch (e: any) {
            Alert.alert("Lỗi", e?.response?.data?.message || "Xoá thất bại");
          }
          setLoading(false);
        },
      },
    ]);
  };

  if (initLoading) return <LoadingModal visible text="Đang tải dữ liệu..." />;

  return (
    <HeaderLayout
      title="Chỉnh sửa tin tức"
      subtitle="Cập nhật hoặc xoá bài đăng"
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
          {!initLoading && (
            <LexicalEditorWebView
              value={content}
              onChange={(text) => {
                if (text !== content) {
                  setContent(text);
                }
              }}
              height={240}
            />
          )}
        </View>
        {/* Nút cập nhật và xoá */}
        <View
          style={{
            flexDirection: "row",
            width: "90%",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: "#29375C", flex: 1, marginRight: 8 },
            ]}
            activeOpacity={isValid && !loading ? 0.7 : 1}
            disabled={!isValid || loading}
            onPress={handleUpdate}
          >
            <Text style={styles.buttonText}>
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: "#E74C3C", flex: 1, marginLeft: 8 },
            ]}
            activeOpacity={!loading ? 0.7 : 1}
            disabled={loading}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Xoá</Text>
          </TouchableOpacity>
        </View>
        {/* Loading & Success Modal */}
        <LoadingModal
          visible={loading || showSuccess}
          text={showSuccess ? "Thao tác thành công!" : "Đang xử lý..."}
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
    backgroundColor: "#BFC6D1",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
