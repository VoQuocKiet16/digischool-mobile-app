import { MaterialIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
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
import LoadingModal from "../../components/LoadingModal";
import PlusIcon from "../../components/PlusIcon";
import { createNews } from "../../services/news.service";
import { responsive, responsiveValues, fonts } from "../../utils/responsive";

export default function AddNewsScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [hasFilledFromParams, setHasFilledFromParams] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Nhận nội dung từ trang edit_news_content nếu có
  useEffect(() => {
    if (!hasFilledFromParams && params && params.editedContent !== undefined) {
      setContent(params.editedContent as string);
      if (params.title !== undefined) setTitle(params.title as string);
      if (params.coverImage !== undefined)
        setCoverImage(params.coverImage as string);
      setHasFilledFromParams(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, hasFilledFromParams]);

  // Kiểm tra hợp lệ
  const isValid =
    !!coverImage && title.trim().length > 0 && content.trim().length > 0;

  // Hàm chọn ảnh
  const pickImage = async () => {
    // Kiểm tra quyền trước
    const { status: existingStatus } =
      await ImagePicker.getMediaLibraryPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
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

  // Hàm xử lý đăng tin
  const handleSubmit = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    const res = await createNews({
      title: title.trim(),
      content: content.trim(),
      coverImage: coverImage || undefined,
    });
    setLoading(false);
    if (res.success) {
      setShowSuccess(true);
      setTitle("");
      setContent("");
      setCoverImage(null);
      setTimeout(() => setShowSuccess(false), 2000);
      router.replace("/news");
    } else {
      Alert.alert("Lỗi", "Đăng tin thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <HeaderLayout
      title="Thêm tin tức"
      subtitle="Tạo bài đăng chia sẻ thông tin thú vị"
      onBack={() => router.replace("/news")}
    >
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
              <PlusIcon text="Thêm ảnh bìa" onPress={pickImage} />
              <Text style={styles.requiredNews}>*</Text>
            </View>
          )}
        </TouchableOpacity>
        {/* Tiêu đề */}
        <View style={styles.fieldWrap}>
          <View style={styles.outlineInputBox}>
            <Text style={styles.floatingLabel}>
              Tiêu đề <Text style={styles.requiredNews}>*</Text>
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
          style={{ flexDirection: "row", alignItems: "center", width: "100%" }}
        >
          <TouchableOpacity
            style={[
              styles.contentInputBox,
              {
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
                justifyContent: content.trim() ? "space-between" : "flex-start",
              },
            ]}
            onPress={() =>
              content.trim()
                ? setPreviewVisible(true)
                : router.push({
                    pathname: "/news/edit_news_content" as any,
                    params: { content, title, coverImage },
                  })
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
              {!content.trim() && <Text style={styles.requiredNews}>*</Text>}
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
                onPress={() =>
                  router.push({
                    pathname: "/news/edit_news_content" as any,
                    params: { content, title, coverImage },
                  })
                }
              >
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: fonts.medium,
                    fontSize: 14,
                  }}
                >
                  Chỉnh sửa
                </Text>
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        </View>
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
                    fontFamily: fonts.semiBold,
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
        {/* Nút đăng tin */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (!isValid || loading) && styles.saveBtnDisabled,
          ]}
          disabled={!isValid || loading}
          onPress={handleSubmit}
        >
          <Text
            style={[
              styles.saveBtnText,
              (!isValid || loading) && { color: "#A0A0A0" },
            ]}
          >
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

// Thêm các style đồng bộ từ add_note.tsx
const styles = StyleSheet.create({
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
    fontFamily: fonts.semiBold,
    fontSize: 14,
    zIndex: 2,
  },
  inputTextOutline: {
    color: "#29375C",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  requiredNews: {
    color: "#E53935",
    fontSize: 18,
    marginLeft: 2,
    marginTop: -2,
  },
  saveBtn: {
    backgroundColor: "#29375C",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    width: "90%",
  },
  saveBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 18,
  },
  // Giữ lại các style cũ cho coverBox, coverContent, coverText, coverImage nếu cần
  coverBox: {
    width: "90%",
    height: 120,
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 16,
    marginBottom: 25,
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
  editContentBtn: {
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "center",
    marginTop: 10,
    width: "90%",
  },
  editContentBtnText: {
    color: "#29375C",
    fontFamily: fonts.medium,
    fontSize: 16,
    textAlign: "center",
  },
  contentPreviewBox: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginLeft: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  contentPreviewLabel: {
    color: "#29375C",
    fontFamily: fonts.medium,
    fontSize: 14,
    marginBottom: 5,
  },
  contentPreviewText: {
    color: "#29375C",
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
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
    fontFamily: fonts.medium,
    fontSize: 16,
  },
});
