import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import HeaderLayout from "../../components/layout/HeaderLayout";
import LexicalEditorWebView from "../../components/LexicalEditorWebView";
import LoadingModal from "../../components/LoadingModal";
import {
  deleteNews,
  getNewsDetail,
  updateNews,
} from "../../services/news.service";

export default function EditNewsScreen() {
  const params = useLocalSearchParams();
  const { id } = params;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [showEditContent, setShowEditContent] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const router = useRouter();

  // Khi vào trang hoặc id đổi, luôn fetch lại dữ liệu từ server (trừ khi quay về từ edit_news_content)
  useEffect(() => {
    if (params && params.editedContent !== undefined) {
      setContent(params.editedContent as string);
      if (params.title !== undefined) setTitle(params.title as string);
      if (params.coverImage !== undefined)
        setCoverImage(params.coverImage as string);
      setInitLoading(false);
      return;
    }
    if (!id) return;
      setInitLoading(true);
    getNewsDetail(id as string).then((res) => {
      if (res.success && res.data) {
        setTitle(res.data.title || "");
        setContent(res.data.content || "");
        setCoverImage(res.data.coverImage || null);
      }
      setInitLoading(false);
    });
  }, [id, params.editedContent]);

  // Kiểm tra hợp lệ
  const isValid = title.trim().length > 0 && content.trim().length > 0;

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

  // Hàm cập nhật tin
  const handleUpdate = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    const res = await updateNews(id as string, {
        title: title.trim(),
        content: content.trim(),
      coverImage: coverImage || undefined,
      });
    setShowSuccess(res.success);
    setLoading(false);
    if (res.success) {
      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1200);
    } else {
      Alert.alert("Lỗi", res.message || "Cập nhật thất bại");
    }
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
          const res = await deleteNews(id as string);
          setShowSuccess(res.success);
          setLoading(false);
          if (res.success) {
            setTimeout(() => {
              setShowSuccess(false);
              router.back();
            }, 1200);
          } else {
            Alert.alert("Lỗi", res.message || "Xoá thất bại");
          }
        },
      },
    ]);
  };

  return (
    <HeaderLayout
      title="Chỉnh sửa tin tức"
      subtitle="Cập nhật hoặc xoá bài đăng"
      onBack={() => router.back()}
    >
      {initLoading ? (
        <LoadingModal visible text="Đang tải dữ liệu..." />
      ) : !title && !content ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "red", fontSize: 16 }}>
            Không tìm thấy dữ liệu tin tức!
          </Text>
        </View>
      ) : (
        <View style={styles.containerNews}>
        {/* Ảnh bìa */}
        <TouchableOpacity
          style={styles.coverBox}
            activeOpacity={1}
          onPress={pickImage}
        >
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverContent}>
                <MaterialIcons
                  name="add-photo-alternate"
                  size={32}
                  color="#BFC6D1"
                />
                <Text style={styles.coverText}>
                  Thêm ảnh bìa <Text style={styles.required}>*</Text>
                </Text>
            </View>
          )}
        </TouchableOpacity>
        {/* Tiêu đề */}
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>
            Tiêu đề <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
                style={styles.inputTextOutline}
                placeholder="Nhập tiêu đề tin tức"
                placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />
        </View>
          </View>
          {/* Nút thêm/chỉnh sửa nội dung dạng input đẹp */}
        <View
          style={{
            flexDirection: "row",
              alignItems: "center",
              width: "100%",
          }}
        >
          <TouchableOpacity
            style={[
                styles.contentInputBox,
                {
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 15,
                  justifyContent: content.trim()
                    ? "space-between"
                    : "flex-start",
                },
              ]}
              onPress={() =>
                content.trim()
                  ? setPreviewVisible(true)
                  : setShowEditContent(true)
              }
              activeOpacity={0.85}
            >
              <MaterialIcons
                name="edit"
                size={22}
                color="#29375C"
                style={{ marginRight: 10 }}
              />
              <Text
                style={[
                  styles.contentInputText,
                  content.trim() && { textDecorationLine: "underline" },
                ]}
              >
                {content.trim() ? "Xem trước nội dung" : "Thêm nội dung"}
                {!content.trim() && <Text style={styles.required}>*</Text>}
              </Text>
              {content.trim() ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#29375C",
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginLeft: 10,
                  }}
                  onPress={() => {
                    router.push({
                      pathname: "/news/edit_news_content" as any,
                      params: {
                        id,
                        title,
                        coverImage,
                        from: "/news/edit_news",
                      },
                    });
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: "Baloo2-Medium",
                      fontSize: 14,
                    }}
                  >
                    Chỉnh sửa
                  </Text>
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          </View>
          {/* Modal soạn/chỉnh sửa nội dung */}
          <Modal
            visible={showEditContent}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowEditContent(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.25)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: "92%",
                  height: "70%",
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  elevation: 5,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    backgroundColor: "#f7f7f7",
                    borderBottomWidth: 1,
                    borderColor: "#E0E0E0",
                  }}
                >
                  <Text
                    style={{
                      color: "#29375C",
                      fontFamily: "Baloo2-SemiBold",
                      fontSize: 16,
                    }}
                  >
                    Soạn nội dung
                  </Text>
                  <TouchableOpacity onPress={() => setShowEditContent(false)}>
                    <MaterialIcons name="close" size={24} color="#29375C" />
                  </TouchableOpacity>
                </View>
                <LexicalEditorWebView value={content} onChange={setContent} />
                <TouchableOpacity
                  style={{
                    backgroundColor: "#29375C",
                    borderRadius: 12,
                    paddingVertical: 12,
                    margin: 16,
                    alignItems: "center",
                  }}
                  onPress={() => setShowEditContent(false)}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: "Baloo2-SemiBold",
                      fontSize: 16,
                    }}
                  >
                    Lưu
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* Modal xem trước nội dung dạng WebView */}
          <Modal
            visible={previewVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setPreviewVisible(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.25)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: "92%",
                  height: "70%",
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  overflow: "hidden",
                  elevation: 5,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    backgroundColor: "#f7f7f7",
                    borderBottomWidth: 1,
                    borderColor: "#E0E0E0",
                  }}
                >
                  <Text
                    style={{
                      color: "#29375C",
                      fontFamily: "Baloo2-SemiBold",
                      fontSize: 16,
                    }}
                  >
                    Xem trước nội dung
                  </Text>
                  <TouchableOpacity onPress={() => setPreviewVisible(false)}>
                    <MaterialIcons name="close" size={24} color="#29375C" />
                  </TouchableOpacity>
                </View>
                <WebView
                  originWhitelist={["*"]}
                  source={{
                    html: `<html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'></head><body style='font-family:sans-serif;padding:16px;'>${content}</body></html>`,
                  }}
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={true}
                />
              </View>
            </View>
          </Modal>
          {/* Nút Xoá và Lưu */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.deleteBtn, loading && styles.deleteBtnDisabled]}
              disabled={loading}
              onPress={handleDelete}
            >
              <Text
                style={[styles.deleteBtnText, loading && { color: "#29375C" }]}
              >
                Xóa bỏ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
                styles.saveBtn,
                (!isValid || loading) && styles.saveBtnDisabled,
            ]}
              disabled={!isValid || loading}
              onPress={handleUpdate}
          >
              <Text style={styles.saveBtnText}>
                {loading ? "Đang lưu..." : "Lưu"}
              </Text>
          </TouchableOpacity>
        </View>
        {/* Loading & Success Modal */}
        <LoadingModal
          visible={loading || showSuccess}
          text={showSuccess ? "Thao tác thành công!" : "Đang xử lý..."}
          success={showSuccess}
        />
      </View>
      )}
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
    height: 120,
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 16,
    marginBottom: 20,
    justifyContent: "center",
    alignSelf: "center",
  },
  coverContent: {
    flexDirection: "row",
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
    color: "#E53935",
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 36,
    gap: 16,
  },
  deleteBtn: {
    backgroundColor: "#FFA29D",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
    alignSelf: "center",
    width: "45%",
  },
  deleteBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  deleteBtnText: {
    color: "#CF2020",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
  saveBtn: {
    backgroundColor: "#29375C",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
    alignSelf: "center",
    width: "45%",
  },
  saveBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 18,
  },
  containerNews: {
    flex: 1,
    padding: 20,
  },
  fieldWrap: {
    marginBottom: 5,
  },
  outlineInputBox: {
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginBottom: 20,
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    position: "relative",
  },
  floatingLabel: {
    position: "absolute",
    top: -16,
    left: 18,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 6,
    color: "#29375C",
    fontFamily: "Baloo2-SemiBold",
    fontSize: 14,
    zIndex: 2,
  },
  inputTextOutline: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: "Baloo2-Medium",
  },
  contentInputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    paddingTop: 15,
    paddingBottom: 12,
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 20,
  },
  contentInputText: {
    color: "#29375C",
    fontFamily: "Baloo2-Medium",
    fontSize: 16,
  },
});
