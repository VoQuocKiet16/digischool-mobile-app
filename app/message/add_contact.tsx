import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderLayout from "../../components/layout/HeaderLayout";
import chatService from "../../services/chat.service";
import { fonts } from "../../utils/responsive";


export default function AddContactScreen() {
  const [username, setUsername] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(200)).current; // Giá trị khởi đầu ở dưới
  const prevResultLength = useRef(0);

  React.useEffect(() => {
    AsyncStorage.getItem("token").then((t) => setToken(t));
  }, []);

  useEffect(() => {
    if (searchResult.length > 0 && prevResultLength.current === 0) {
      // Khi có kết quả mới, animate lên
      slideAnim.setValue(200);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
    prevResultLength.current = searchResult.length;
  }, [searchResult.length]);

  const handleSearch = async () => {
    if (!username.trim() || !token) return;
    Keyboard.dismiss(); // Tắt bàn phím khi tìm kiếm
    setLoading(true);
    const res = await chatService.searchUsers(username.trim(), token);
    if (res.success) {
      setSearchResult(res.data);
    } else {
      setSearchResult([]);
      // Có thể hiện thông báo lỗi nếu muốn
    }
    setLoading(false);
  };

  return (
    <HeaderLayout
      title="Thêm liên hệ"
      subtitle="Thêm liên hệ mới"
      onBack={() => router.back()}
    >
      <View style={styles.container}>
        {/* Form tìm kiếm */}
        <View style={{ marginHorizontal: 20, marginTop: 18 }}>
          <View style={styles.fieldWrap}>
            <View style={styles.outlineInputBox}>
              <Text style={styles.floatingLabel}>
                Tên người dùng 
              </Text>
              <TextInput
                style={styles.inputTextOutline}
                value={username}
                onChangeText={setUsername}
                placeholder="Nhập email tìm kiếm"
                placeholderTextColor="#9CA3AF"
                editable={!loading}
                underlineColorAndroid="transparent"
                numberOfLines={1}
                multiline={false}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.searchBtn,
              (!username.trim() || loading) && { backgroundColor: "#B3B8C7" }
            ]}
            onPress={handleSearch}
            disabled={loading || !username.trim()}
          >
            <Text style={styles.searchBtnText}>{loading ? "Đang tìm..." : "Tìm kiếm tài khoản"}</Text>
          </TouchableOpacity>
        </View>
        {/* Danh sách tài khoản */}
        {searchResult.length > 0 && (
          <Animated.View style={[styles.listWrapper, { transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.listTitle}>Tài khoản tồn tại</Text>
            <FlatList
              data={searchResult}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.accountRow}>
                  <Image source={require("../../assets/images/avt_default.png")} style={styles.avatar} />
                  <View style={styles.infoBox}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.username}>{item.email}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      router.push({
                        pathname: "/message/message_box",
                        params: { userId: item.id, name: item.name },
                      });
                    }}
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={28}
                      color="#fff"
                      style={styles.chatIcon}
                    />
                  </TouchableOpacity>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        )}
      </View>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FB",
    paddingHorizontal: 0,
    paddingTop: 0,
    justifyContent: "space-between",
  },
  formBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontWeight: "bold",
    color: "#29375C",
    fontSize: 15,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#A0A0A0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#29375C",
    backgroundColor: "#F6F8FB",
    marginBottom: 16,
  },
  searchBtn: {
    backgroundColor: "#29375C",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
    marginLeft: 15,
    marginRight: 15,
    width: '70%',
    alignSelf: 'center',
  },
  searchBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.semiBold,

  },
  listWrapper: {
    backgroundColor: "#29375C",
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    marginTop: 32,
    paddingHorizontal: 0,
    paddingTop: 24,
  },
  listTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 24,
    marginBottom: 18,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    marginHorizontal: 16,
    marginBottom: 18,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    backgroundColor: "#fff",
  },
  infoBox: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#fff",
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.7,
  },
  chatIcon: {
    marginLeft: 12,
  },
  fieldWrap: {
    marginBottom: 12,
  },
  outlineInputBox: {
    borderWidth: 1,
    borderColor: "#29375C",
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 25,
    marginLeft: 15,
    marginRight: 15,
    position: "relative",
    minHeight: 44,
    paddingVertical: 0,
    justifyContent: "center",
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
    fontFamily: fonts.regular,
    lineHeight: 22,
    marginTop: 4,
    paddingVertical: 0,
    height: 44,
  },
});
